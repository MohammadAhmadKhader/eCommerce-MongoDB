import { NextFunction, Request, Response } from "express";
import { sendingMessageSchema } from "../validationSchemas/contactUsValidationSchemas";

export const validateSendingMessage = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = sendingMessageSchema.validate({
        fullName:req.body.fullName,
        email:req.body.email,
        subject:req.body.subject,
        message:req.body.message,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}