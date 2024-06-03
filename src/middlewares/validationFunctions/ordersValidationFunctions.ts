import { NextFunction, Request, Response } from "express";
import { createOrderSchema, orderIdSchema, ordersStatusSchema } from "../validationSchemas/ordersValidationSchemas";
export const validateCheckOrder = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createOrderSchema.validate({
        orderId:req.body.orderId,
        address:req.body.address
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["orderId"]};
        return next(error);
    }
    return next()
}

export const validateOrderId = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = orderIdSchema.validate({
        orderId:req.params.orderId
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validatePaymentIntent = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = orderIdSchema.validate({
        orderId:req.body.orderId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["orderId"]};
        return next(error);
    }
    return next()
}

export const validateOrdersStatus = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = ordersStatusSchema.validate({
        status:req.query.status
    },{abortEarly:false})
    

    if(error){
        return next(error);
    }
    return next()
}