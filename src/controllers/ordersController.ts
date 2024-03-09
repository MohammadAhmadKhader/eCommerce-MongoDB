import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";

export const getAllOrders = async(req:Request,res:Response)=>{
    try{
        const { limit,skip,page} = req.pagination;
        const userId = req.body.userId
        const status = req.body.status;
        if(!status){
            return res.status(400).json({error:"Status is required"});
        }
        const match = {status:status,userId:userId}
        const orders = await Order.find(match).skip(skip).limit(limit)
        const count = await Order.find(match).countDocuments()

        return res.status(200).json({count,page,limit,orders})
    }catch(error){
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
        console.log(arrayOfProductsIds)
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
            cart: { $set : []}
        },{new:true,select:"-password -__v"})

        return res.status(201).json({user:userAfterCartAndOrderChanged,order})
    }catch(error){
        return res.status(500).json({error})
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
    }catch(error){
        return res.status(500).json({error})
    }
}