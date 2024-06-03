import { NextFunction, Request, Response } from "express";
import { createUserSchema, forgotPasswordSchema, resetPasswordViaCodeSchema, 
    userChangeInformationSchema, userChangePasswordSchema,
     userRegistrationSchema, userSignInSchema } from "../validationSchemas/usersValidationSchemas";
export const validateCreateUser = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createUserSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password,
        role:req.body.role,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}
export const validateUserRegistration = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userRegistrationSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password
    },{abortEarly:false})
    
    if(error){
        return next(error);
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
        return next(error);
    }
    return next()
}

export const validateUserSignIn = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userSignInSchema.validate({
        email:req.body.email,
        password:req.body.password,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateResetPasswordViaCode = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = resetPasswordViaCodeSchema.validate({
        newPassword:req.body.newPassword,
        confirmedNewPassword:req.body.confirmedNewPassword,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateForgotPassword = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = forgotPasswordSchema.validate({
        email:req.body.email
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateUserChangeInformation = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userChangeInformationSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        mobileNumber:req.body.mobileNumber,
        birthdate:req.body.birthdate,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}
