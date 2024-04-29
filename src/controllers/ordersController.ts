import { NextFunction, Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";
import mongoose from "mongoose";
import Invoice from "../models/Invoice";
import { IUser } from "../@types/types";
import StripeUtils from "../utils/StripeUtils";
import { collectInvoiceData } from "../utils/HelperFunctions";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";

export const getAllOrders = asyncHandler(async(req ,res )=>{
    const { limit,skip,page} = req.pagination;
    const userId = req.user._id;
    const status = req.query.status;
        
    const match = {userId:userId,status:status};
    const orders = await Order.find(match).sort({createdAt:-1}).skip(skip).limit(limit)
    const count = await Order.find(match).countDocuments()
        
    return res.status(200).json({count,page,limit,orders})
})

export const getSingleOrderById =asyncHandler( async(req ,res ,next)=>{
    const {orderId} = req.params;
    const order = await Order.findOne({_id:orderId});
    if(!order){
        const error = new AppError("The requested order was not found",400)
        return next(error);
    }
        
    return res.status(200).json({order})
})

export const createOrder = asyncHandler(async (req ,res ,next)=>{
    const arrayOfProductsIds : any = [];
    const user = req.user as IUser;
    const userId = user._id;

    if(user.cart.length == 0){
        const error = new AppError("User's cart is empty",400)
        return next(error);
    }
        
    user.cart.forEach((cartItem)=>{
        arrayOfProductsIds.push(cartItem.productId);
    })
    // mapper[id] => amount person picked
    const mapper : any ={};
        
    arrayOfProductsIds.forEach((item : any)=>{
        user.cart.forEach((cartItem)=>{
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
        
    const discount =0,deliveryFee =0
    const orderGrandTotal = subTotal - discount + deliveryFee

    const transaction = mongoose.startSession();
    ;(await transaction).startTransaction();

    let isIncorrectOrder = false;
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
            quantity:mapper[cartItem._id.toString()] <= cartItem.quantity ? mapper[cartItem._id.toString()] : (()=>{
                isIncorrectOrder = true
            })() ,
            productId:cartItem._id,
            subTotal:Number(cartItem.quantity * cartItem.finalPrice!).toFixed(2)
        })),
    })

    if(isIncorrectOrder){
        (await transaction).abortTransaction();
        const error = new AppError("An unexpected error has occurred",400);
        return next(error);
    }
    const userAfterCartAndOrderChanged = await User.findOneAndUpdate({_id:userId},{
        $set :{cart:[]}
    },{new:true,select:"-password -__v"});

    ;(await transaction).commitTransaction();
    return res.status(201).json({message:"success",user:userAfterCartAndOrderChanged,order})
})

export const deleteOrder = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const orderId = req.body.orderId; // => to url
        
    const order = await Order.findOneAndUpdate({
        _id:orderId,
        userId:userId
    },
    {
        $set: {  status: "Cancelled",updatedDate: new Date().toUTCString()},
    },{new:true});

    if(!order){
        const error = new AppError("The requested order was not found",400);
        return next(error)
    }
        
    return res.sendStatus(204)
})

export const createPaymentIntent =asyncHandler( async(req, res, next)=>{
    const {orderId} = req.body;
    const user = req.user;
    const order = await Order.findOne({_id:orderId});
    const customerId = user._id;
    if(!order){
        const error = new AppError("The requested order was not found",400);
        return next(error)
    }

    const stripe = StripeUtils.createStripe();
    const customer = await StripeUtils.searchCustomerCreateOneIfDoesNotExist(customerId.toString(),stripe,user)
    
    const paymentIntent = await stripe.paymentIntents.create({
        currency:"usd",
        amount:Number((Number(order.grandTotal) * 100).toFixed(2)),
        automatic_payment_methods:{
            enabled:true
        },
    })

    return res.status(200).json({clientSecret:paymentIntent.client_secret,customer:customer})
})

export const orderCheckingOut = async(req:Request,res:Response, next : NextFunction)=>{
    const transaction = mongoose.startSession();
    try{
        ;(await transaction).startTransaction();
        const user = req.user;
        const {orderId,address} = req.body;
        
        const order = await Order.findOneAndUpdate(
            {_id:orderId,userId:user._id},
            {$set:{address:address,status:"Completed",isPaid:true}},
            {new:true}
        );
        if(!order){
            (await transaction).abortTransaction();
            const error = new AppError("The requested order was not found",400);
            return next(error);
        }
        const customerId = user._id;
        const stripe = StripeUtils.createStripe();
        const customers = await StripeUtils.searchCustomer(customerId.toString(),stripe);
        
        if(customers.data.length == 0){
            (await transaction).abortTransaction();
            const error = new AppError("An unexpected error has occurred",400);
            return next(error);
        }  
        const customer = customers.data[0];
        const invoice = await StripeUtils.createInvoice(customer,stripe);
        
        const createInvoiceItems = await StripeUtils.createInvoiceItems(customer,invoice,order,stripe);
        const finalizingTheInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        const InvoiceData = collectInvoiceData(finalizingTheInvoice,order);
        const issuedInvoice = await Invoice.create(InvoiceData);
        
        const arrayOfProductsIds : any = [];
        issuedInvoice.invoiceItems.forEach((item)=>{
            arrayOfProductsIds.push(item.productId);
        });
        const products = await Product.find({_id:{$in:arrayOfProductsIds}},{_id:1,quantity:1});
        const productsIdQuantityMapper :any = {};
        const orderItemsProductIdQuantityMapper : any = {}
        products.forEach((product)=>{
            productsIdQuantityMapper[product._id.toString()] = product.quantity;
        });
        order.orderItems.forEach((orderItem)=>{
            orderItemsProductIdQuantityMapper[orderItem.productId.toString()] = orderItem.quantity;
        })
        
        const bulkWriteArray : any= [];
        let isBulkWriteIsIncorrect = false;
        for(let i =0; i < products.length;i++){
            bulkWriteArray.push({
                updateOne:{
                    filter: { _id :products[i]._id },
                    update: { $inc :{ quantity : productsIdQuantityMapper[products[i]._id.toString()] >= orderItemsProductIdQuantityMapper[products[i]._id.toString()] ? 
                        -orderItemsProductIdQuantityMapper[products[i]._id.toString()] : (()=>{
                            isBulkWriteIsIncorrect = true
                            // This return meant to avoid the casting error from undefined to number
                            return 1
                        })()
                    }} 
                }
            })
        }
    
        const updateProductQuantity = await Product.bulkWrite(bulkWriteArray);
        if(updateProductQuantity.modifiedCount !== arrayOfProductsIds.length || isBulkWriteIsIncorrect){
            (await transaction).abortTransaction();
            const error = new AppError("An error occurred while processing your order. Please try again later or contact support.",400)
            return next(error);
        }

        ;(await transaction).commitTransaction();
        return res.status(200).json({order,invoice:issuedInvoice})
    }catch(error : any){
        (await transaction).abortTransaction();
        console.error(error)
        return res.status(500).json({error:error?.message})
    }
}