import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";
import { ICartItem } from "../@types/types";
import mongoose, { startSession } from "mongoose";

export const getAllOrders = async(req:Request,res:Response)=>{
    try{
        const { limit,skip,page} = req.pagination;
        const userId = req.params.userId
        const status = req.query.status;
        if(!status){
            return res.status(400).json({error:"Status is required"});
        }
        const match = {status:status,userId:userId};
        const orders = await Order.find(match).sort({createdAt:-1}).skip(skip).limit(limit)
        const count = await Order.find(match).countDocuments()
        console.log(orders)
        return res.status(200).json({count,page,limit,orders})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const getSingleOrderById = async(req:Request,res:Response)=>{
    try{
        const {orderId} = req.params;
        const order = await Order.findOne({_id:orderId});
        if(!order){
            return res.status(400).json({error:"order was not found"})
        }
        console.log(order)
        return res.status(200).json({order})
    }catch(error){
        console.error(error)
        return res.status(500).json({error})
    }
}

export const createOrder = async(req :Request,res:Response)=>{
    const transaction = mongoose.startSession()
    try{
        (await transaction).startTransaction();
        const userId = req.body.userId;
        const arrayOfProductsIds : any = [];
        const addressIndex = req.body.address;
        const user = await User.findById(userId,{cart:1,addresses:1})
        
        if(addressIndex < 0){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Address value cant be minus"});
        }
        if(user!.cart.length == 0){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"cart is empty"});
        }
        if(addressIndex > user!.addresses.length - 1){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Address does not exist"});
        }
        
        user!.cart.forEach((cartItem)=>{
            arrayOfProductsIds.push(cartItem.productId);
        })
        // mapper[id] => amount person picked
        const mapper : any ={};
        
        arrayOfProductsIds.forEach((item : any)=>{
            user!.cart.forEach((cartItem)=>{
                if(cartItem.productId == item){
                    mapper[item] = cartItem.quantity
                }
            })
        })

        // cartItem.quantity => main product 
        const cartItems = await Product.find(
            {_id: {$in : arrayOfProductsIds }},
            {reviews:0,__v:0,description:0,categoryId:0,brand:0});
        
        let subTotal = 0;
        cartItems.forEach((cartItem)=>{
            subTotal += (cartItem.finalPrice! * mapper[cartItem._id.toString()]);
        });
        
        const discount =10,deliveryFee =0
        const orderGrandTotal = subTotal + discount + deliveryFee
        
        const order = await Order.create({
            userId:userId,
            deliveryFee,
            discount,
            subTotal:Number(subTotal).toFixed(2),
            grandTotal:Number(orderGrandTotal).toFixed(2),
            orderItems:cartItems.map((cartItem)=> ({
                name:cartItem.name,
                price:cartItem.finalPrice,
                thumbnailUrl:cartItem.images[0].thumbnailUrl,
                quantity:mapper[cartItem._id.toString()] <= cartItem.quantity ? mapper[cartItem._id.toString()] : (async()=>{
                    (await transaction).abortTransaction();
                    return res.status(400).json({error:"You cant buy more than the existing amount"})
                })() ,
                productId:cartItem._id,
                subTotal:Number(cartItem.quantity * cartItem.finalPrice!).toFixed(2)
            })),
            address:{
                fullName:user?.addresses[addressIndex].fullName,
                mobileNumber:user?.addresses[addressIndex].mobileNumber,
                country:user?.addresses[addressIndex].country,
                state:user?.addresses[addressIndex].state,
                city:user?.addresses[addressIndex].city,
                pinCode:user?.addresses[addressIndex].pinCode,
                streetAddress:user?.addresses[addressIndex].streetAddress
            }
        })

        const bulkWriteArray : any= [];
        arrayOfProductsIds.map((item : any,index : number)=>{
            bulkWriteArray.push({
                updateOne:{
                    filter: { _id :arrayOfProductsIds[index] },
                    update: { $inc :{ quantity :-mapper[arrayOfProductsIds[index]] }}
                }
            })
        })
        const updateProductQuantity = await Product.bulkWrite(bulkWriteArray);
        if(updateProductQuantity.modifiedCount !== arrayOfProductsIds.length){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Something Went Wrong Please Try Again Later!"})
        }
        
        const userAfterCartAndOrderChanged = await User.findOneAndUpdate({_id:userId},{
            $set :{cart:[]}
        },{new:true,select:"-password -__v"});

        (await transaction).commitTransaction();
        return res.status(201).json({message:"success",user:userAfterCartAndOrderChanged,order})
    }catch(error : any){
        console.error(error);
        (await transaction).abortTransaction();
        return res.status(500).json({error:error?.message})
   }
}

export const deleteOrder = async (req:Request,res:Response) => {
    try{
        const userId = req.body.userId as string
        const orderId = req.body.orderId as string
        
        const order = await Order.findOneAndUpdate({
            userId:userId,
            _id:orderId},
        {
            $set: {  status: "Completed",updatedDate: new Date().toUTCString()},
        },{new:true})
        
        return res.sendStatus(204)
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}