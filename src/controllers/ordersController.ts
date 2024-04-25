import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";
import mongoose from "mongoose";
import Invoice from "../models/Invoice";
import { IUser } from "../@types/types";
import StripeUtils from "../utils/StripeUtils";
import { collectInvoiceData } from "../utils/HelperFunctions";

export const getAllOrders = async(req:Request,res:Response)=>{
    try{
        const { limit,skip,page} = req.pagination;
        const userId = req.user._id;
        const status = req.query.status;
        
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
        
        return res.status(200).json({order})
    }catch(error){
        console.error(error)
        return res.status(500).json({error})
    }
}

export const createOrder = async(req :Request,res:Response)=>{
    try{
        // const userId = req.body.userId;
        const arrayOfProductsIds : any = [];
        const user = req.user as IUser;
        const userId = user._id;

        if(user.cart.length == 0){
            return res.status(400).json({error:"cart is empty"});
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
                    throw new Error("You cant buy more than the existing amount")
                })() ,
                productId:cartItem._id,
                subTotal:Number(cartItem.quantity * cartItem.finalPrice!).toFixed(2)
            })),
        })
        
        const userAfterCartAndOrderChanged = await User.findOneAndUpdate({_id:userId},{
            $set :{cart:[]}
        },{new:true,select:"-password -__v"});

        return res.status(201).json({message:"success",user:userAfterCartAndOrderChanged,order})
    }catch(error : any){
        console.error(error);
        return res.status(500).json({error:error?.message})
   }
}

export const deleteOrder = async (req:Request,res:Response) => {
    try{
        //const userId = req.body.userId as string
        const userId = req.user._id as string
        const orderId = req.body.orderId as string
        
        const order = await Order.findOneAndUpdate({
            userId:userId,
            _id:orderId},
        {
            $set: {  status: "Cancelled",updatedDate: new Date().toUTCString()},
        },{new:true})
        
        return res.sendStatus(204)
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const createPaymentIntent = async(req:Request,res:Response)=>{
    try{
        const {orderId} = req.body;
        const user = req.user;
        const order = await Order.findOne({_id:orderId});
        const customerId = user._id;
        if(!order){
            return res.status(400).json({error:"Order was not found"})
        }

        const stripe = StripeUtils.createStripe();
        const customer = await StripeUtils.searchCustomerCreateOneIfDoesNotExist(customerId,stripe,user)

        const paymentIntent = await stripe.paymentIntents.create({
            currency:"usd",
            amount:Number((Number(order.grandTotal) * 100).toFixed(2)),
            automatic_payment_methods:{
                enabled:true
            },
        })

        return res.status(200).json({clientSecret:paymentIntent.client_secret,customer:customer})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
    }
}

export const OrderCheckingOut = async(req:Request,res:Response)=>{
    const transaction = mongoose.startSession();
    try{
        ;(await transaction).startTransaction();
        const user = req.user;
        const {orderId,address} = req.body;
        
        const order = await Order.findOneAndUpdate(
            {_id:orderId,userId:user._id},
            {$set:{address:address,status:"Completed",isPaid:true}}
        );
        if(!order){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Order was not found"})
        }
        const customerId = user._id;
        const stripe = StripeUtils.createStripe();
        const customers = await StripeUtils.searchCustomer(customerId,stripe);

        if(customers.data.length == 0){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Customer was not found"})
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
        for(let i =0; i < products.length;i++){
            bulkWriteArray.push({
                updateOne:{
                    filter: { _id :products[i]._id },
                    update: { $inc :{ quantity : productsIdQuantityMapper[products[i]._id.toString()] >= orderItemsProductIdQuantityMapper[products[i]._id.toString()] ? 
                        -orderItemsProductIdQuantityMapper[products[i]._id.toString()] : await (async()=>{
                            throw new Error("You cant buy more than the existing amount")
                        })()
                    }} 
                }
            })
        }
       
        const updateProductQuantity = await Product.bulkWrite(bulkWriteArray);
        if(updateProductQuantity.modifiedCount !== arrayOfProductsIds.length){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Something Went Wrong Please Try Again Later!"})
        }

        ;(await transaction).commitTransaction();
        return res.status(200).json({order,invoice:issuedInvoice})
    }catch(error : any){
        (await transaction).abortTransaction();
        console.error(error)
        return res.status(500).json({error:error?.message})
    }
}