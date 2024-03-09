import { NextFunction, Request, Response } from "express";
import { creatingAddressSchema, creatingProductValidationSchema, reviewSchema, userChangePasswordSchema, userRegistrationSchema } from "./validationsSchemas";

export const validateUserRegistration = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userRegistrationSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password
    },{abortEarly:false})

    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}

export const validateUserChangePassword = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userChangePasswordSchema.validate({
        oldPassword:req.body.oldPassword,
        newPassword:req.body.newPassword,
        confirmNewPassword:req.body.confirmNewPassword

    },{abortEarly:false})
    
    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}

export const validateUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = reviewSchema.validate({
        rating:req.body.rating,
        comment:req.body.comment,
    },{abortEarly:false})
    
    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}

export const validateCreatingAddress = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = creatingAddressSchema.validate({
        fullName:req.body.fullName,
        streetAddress:req.body.streetAddress,
        state:req.body.state,
        city:req.body.city,
        pinCode:req.body.pinCode,
        mobileNumber:req.body.mobileNumber
    },{abortEarly:false})

    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}

export const validateUpdatingAddress = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = creatingAddressSchema.validate({
        fullName:req.body.fullName,
        streetAddress:req.body.streetAddress,
        state:req.body.state,
        city:req.body.city,
        pinCode:req.body.pinCode,
        mobileNumber:req.body.mobileNumber
    },{abortEarly:false})

    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}

export const validateCreateProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = creatingProductValidationSchema.validate({
        name:req.body.name,
        description:req.body.description,
        categoryId:req.body.categoryId,
        offer:req.body.offer,
        price:req.body.price,
        finalPrice:req.body.finalPrice,
        quantity:req.body.quantity,
        images:req.body.images,
        brand:req.body.brand,
    },{abortEarly:false})

    if(error){
        const errorMessage = error.details.map((detail) => detail.message.replace(/["']/g,''));
        return res.status(400).json({error:errorMessage});
    }
    return next()
}