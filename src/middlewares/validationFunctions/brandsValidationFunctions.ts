import { NextFunction, Request, Response } from "express";
import { createBrandSchema, updateBrandSchema } from "../validationSchemas/brandsValidationSchemas";
export const validateCreateBrand = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createBrandSchema.validate({
        brandName:req.body.brandName,
        brandLogo:req.file
    },{abortEarly:false})

    if(error){
        return next(error)
    }
    return next()
}

export const validateUpdateBrand = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateBrandSchema.validate({
        brandName:req.body.brandName,
        brandLogo:req.file
    },{abortEarly:false})

    if(error){
        return next(error)
    }
    return next()
}
