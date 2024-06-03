import { NextFunction, Request, Response } from "express";
import { addToWishlistSchema, removeFromWishlistSchema } from "../validationSchemas/wishlistsValidationSchemas";

export const validateAddToWishList = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = addToWishlistSchema.validate({
        productId:req.body.productId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId"]};
        return next(error);
    }
    return next()
}

export const validateRemoveFromWishlist = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = removeFromWishlistSchema.validate({
        wishlistItemId:req.params.wishlistItemId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["wishlistItemId"]};
        return next(error);
    }
    return next()
}