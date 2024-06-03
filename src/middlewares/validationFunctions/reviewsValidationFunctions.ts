import { NextFunction, Request, Response } from "express";
import {  deleteUserReviewSchema, editUserReviewSchema, reviewSchema } from "../validationSchemas/reviewsValidationSchemas";



export const validateUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = reviewSchema.validate({
        rating:req.body.rating,
        comment:req.body.comment,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateEditUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = editUserReviewSchema.validate({
        comment:req.body.comment,
        rating:req.body.rating,
        reviewId:req.params.reviewId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["reviewId"]};
        return next(error);
    }
    return next()
}

export const validateDeleteUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = deleteUserReviewSchema.validate({
        productId:req.params.productId,
        reviewId:req.params.reviewId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId","reviewId"]};
        return next(error);
    }
    return next()
}