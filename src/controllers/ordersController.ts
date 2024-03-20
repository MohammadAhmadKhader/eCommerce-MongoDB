import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";

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
    try{
        const userId = req.body.userId;
        const arrayOfProductsIds : any = [];
        const user = await User.findById(userId,{cart:1})

        if(user!.cart.length == 0){
            return res.status(400).json({error:"cart is empty"})
        }
        user!.cart.forEach((cartItem)=>{
            arrayOfProductsIds.push(cartItem.productId);
        })
        
        const cartItems = await Product.find(
            {_id: {$in : arrayOfProductsIds }},
            {reviews:0,__v:0,description:0,categoryId:0,brand:0})
        
        let subTotal = 0;
        cartItems.forEach((cartItem)=>{
            subTotal += (cartItem.finalPrice! * cartItem.quantity)
        })
        const discount =10,deliveryFee =0
        const orderGrandTotal = subTotal + discount + deliveryFee
        
        const order = await Order.create({
            userId:userId,
            deliveryFee,
            discount,
            subTotal:subTotal,
            grandTotal:orderGrandTotal,
            orderItems:cartItems.map((cartItem)=> ({
                name:cartItem.name,
                price:cartItem.finalPrice,
                thumbnailUrl:cartItem.images[0].thumbnailUrl,
                quantity:cartItem.quantity,
                productId:cartItem._id,
                subTotal:cartItem.quantity * cartItem.finalPrice!
            })),
            address:{
                fullName:"mohammad",
                mobileNumber:"0948332",
                state:"west bank",
                city:"nablus",
                pinCode:"2311",
                streetAddress:"main street"
            }
        })

        const userAfterCartAndOrderChanged = await User.findOneAndUpdate({_id:userId},{
            $set :{cart:[]}
        },{new:true,select:"-password -__v"})

        return res.status(201).json({message:"success",user:userAfterCartAndOrderChanged,order})
    }catch(error : any){
        console.error(error)
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