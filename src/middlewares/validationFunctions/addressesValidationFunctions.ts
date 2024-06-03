import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { creatingAddressSchema, updatingAddressSchema } from "../validationSchemas/addressesValidationSchemas";

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
        return next(error);
    }
    
    return next()
}

export const validateUpdatingAddress = (req:Request,res:Response,next:NextFunction)=>{
    const addressToUpdate : any = {
        fullName:req.body.fullName,
        streetAddress:req.body.streetAddress,
        state:req.body.state,
        city:req.body.city,
        pinCode:req.body.pinCode,
        mobileNumber:req.body.mobileNumber
    }
    const {error} = updatingAddressSchema.validate(addressToUpdate,{abortEarly:false})

    if(error){
        return next(error);
    }

    for(const key in addressToUpdate){
        if(addressToUpdate[key] === undefined){
            delete addressToUpdate[key]
        }
    }
    
    if(Object.keys(addressToUpdate).length == 0){
        const details = [
            {
                message: 'one field at least is required',
                path: [],
                type: 'any.required',
                context: {},
            }
        ]
        
        const error = new Joi.ValidationError("one field at least is required",details,{})
        return next(error);
    }
    return next()
}
