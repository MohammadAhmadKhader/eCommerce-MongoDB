import { Request, Response } from "express";
import Order from "../models/order";
import User from "../models/user";
import Product from "../models/product";
import { ICartItem, IDecodedToken } from "../@types/types";
import mongoose, { startSession } from "mongoose";
import Stripe from "stripe";
import { v4 as uuid} from "uuid";
import jwt from "jsonwebtoken";
import util from "util"
import { verifyAndDecodeToken } from "../utils/HelperFunctions";
import Invoice from "../models/Invoice";
import { ObjectId } from "mongodb";

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
    try{
        const userId = req.body.userId;
        const arrayOfProductsIds : any = [];
        const user = await User.findOne({_id:userId},{cart:1,addresses:1})

        if(!user){
            return res.status(400).json({error:"user does not exist"});
        }

        if(user.cart.length == 0){
            return res.status(400).json({error:"cart is empty"});
        }
        
        user.cart.forEach((cartItem)=>{
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
                    return res.status(400).json({error:"You cant buy more than the existing amount"})
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
        const userId = req.body.userId as string
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
        const {orderId,customerId} = req.body;
        const token = req.headers.authorization;
        if(!token){
            return res.sendStatus(401);
        }
        if(!customerId){
            return res.status(400).json({error:"Missing customer"});
        }
        const decodedToken = await verifyAndDecodeToken(token);
        const order = await Order.findOne({_id:orderId});
        if(!order){
            return res.status(400).json({error:"Order was not found"})
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET as string);

        let hasCreatedNewCustomer = false;
        let customer : Stripe.Response<Stripe.ApiSearchResult<Stripe.Customer> | Stripe.Customer> = await stripe.customers.search({
            query:`metadata[\'customerId\']:\'${customerId}\'`
        })
        console.log(customer,"Customer")
        if(customer.data.length ==0){
            const createdCustomer = await stripe.customers.create({
                email:decodedToken.email,
                metadata:{
                    customerId:decodedToken.id
                }
            });
            hasCreatedNewCustomer = true;
            customer = createdCustomer;
        }
        

        const paymentIntent = await stripe.paymentIntents.create({
            currency:"usd",
            amount:Number((Number(order.grandTotal) * 100).toFixed(2)),
            automatic_payment_methods:{
                enabled:true
            },
        })
        let returnedCustomerData;
        if(hasCreatedNewCustomer){
            returnedCustomerData = customer
        }else{
            returnedCustomerData = (customer as Stripe.ApiSearchResult<Stripe.Customer>).data[0]
        }

        return res.status(200).json({clientSecret:paymentIntent.client_secret,customer:returnedCustomerData})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
    }
}

export const OrderCheckingOut = async(req:Request,res:Response)=>{
    const transaction = mongoose.startSession();
    try{
        ;(await transaction).startTransaction();
        const {orderId,customerId,address} = req.body;
        const token = req.headers.authorization
        if(!token){
            (await transaction).abortTransaction();
            return res.sendStatus(401);
        }
        console.log(address)
        if(!address || (address && (!address.city || !address.state || !address.country || !address.streetAddress || !address.mobileNumber || !address.fullName))){
            return res.status(400).json({error:"Address is required"});
        }
        const decodedToken = await verifyAndDecodeToken(token);
        const order = await Order.findOneAndUpdate(
            {_id:orderId,userId:decodedToken.id},
            {$set:{address:address,status:"Completed",isPaid:true}}
        );
        if(!order){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Order was not found"})
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET as string);
        const customers = await stripe.customers.search({
            query:`metadata[\'customerId\']:\'${customerId}\'`
        })
        if(customers.data.length == 0){
            (await transaction).abortTransaction();
            return res.status(400).json({error:"Customer was not found"})
        }  
       
        const invoice = await stripe.invoices.create({
            currency:"usd",
            customer:customers.data[0].id,
            collection_method:"charge_automatically",
        })
        
        for(let i =0; i < order.orderItems.length ;i++){
            const invoiceItems = await stripe.invoiceItems.create({
                customer:customers.data[0].id,
                invoice:invoice.id,
                quantity:order.orderItems[i].quantity as number,
                unit_amount:Number((order.orderItems[i].price! * 100).toFixed(0)),
                description:`
                || Product name : ${order.orderItems[i].name}
                || Product image link : ${order.orderItems[i].thumbnailUrl}
                || Product price after offer if exists : ${order.orderItems[i].price}
                `,
                metadata:{
                    productId:order.orderItems[i].productId!.toString()
                }
            })
            console.log(invoiceItems,`invoice Item number ${i + 1} @@ quantity = 
            ${order.orderItems[i].quantity} @@ name ${order.orderItems[i].name}`)
        }
        
        const finalizingTheInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        const InvoiceData : any = {};
        InvoiceData["hostedLink"] = finalizingTheInvoice.hosted_invoice_url;
        InvoiceData["pdfLink"] = finalizingTheInvoice.invoice_pdf;
        InvoiceData["subTotal"] = finalizingTheInvoice.subtotal;
        InvoiceData["grandTotal"] = finalizingTheInvoice.total;
        InvoiceData["userId"] = order.userId;
        InvoiceData["orderId"] = order._id;
        InvoiceData["invoiceItems"] = [];

        finalizingTheInvoice.lines.data.forEach((item)=> {
            const newInvoiceLine : any = {};
            newInvoiceLine["quantity"] = item.quantity;
            newInvoiceLine["productId"] = item.metadata.productId;
            newInvoiceLine["unitPrice"] = (item.price! as any).unit_amount / 100;
            (InvoiceData["invoiceItems"] as Array<any>).push(newInvoiceLine)
        });
            
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
            orderItemsProductIdQuantityMapper[(orderItem.productId as ObjectId).toString()] = orderItem.quantity;
        })

        const bulkWriteArray : any= [];
        for(let i =0; i < products.length;i++){
            bulkWriteArray.push({
                updateOne:{
                    filter: { _id :products[i]._id },
                    update: { $inc :{ quantity : productsIdQuantityMapper[products[i]._id.toString()] >= orderItemsProductIdQuantityMapper[products[i]._id.toString()] ? 
                        -productsIdQuantityMapper[products[i]._id.toString()] : await (async()=>{
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
        return res.status(200).json({invoice,finalizingTheInvoice,order,InvoiceData,issuedInvoice})
    }catch(error : any){
        (await transaction).abortTransaction();
        console.error(error)
        return res.status(500).json({error:error?.message})
    }
}