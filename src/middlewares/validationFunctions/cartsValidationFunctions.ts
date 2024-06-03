import { NextFunction, Request, Response } from "express";
import { addToCartSchema, changeCartItemQuantityByOneSchema, deleteFromCartSchema } from "../validationSchemas/cartsValidationSchemas";
export const validateAddingToCart = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = addToCartSchema.validate({
        productId:req.body.productId,
        quantity:req.body.quantity,
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId"]};
        return next(error);
    }
    return next()
}

export const validateChangeCartItemQuantityByOne = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = changeCartItemQuantityByOneSchema.validate({
        cartItemId:req.params.cartItemId,
        productId:req.body.productId,
        operation:req.body.operation,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["productId","cartItemId"]};
        return next(error);
    }
    return next()
}

export const validateDeletingFromCart = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = deleteFromCartSchema.validate({
        cartItemId:req.params.cartItemId,
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["cartItemId"]};
        return next(error);
    }
    return next()
}