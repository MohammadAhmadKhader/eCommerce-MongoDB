import { NextFunction, Request, Response } from "express";
import { createCategorySchema, updateCategorySchema } from "../validationSchemas/categoriesValidationSchemas"

export const validateCreateCategory = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createCategorySchema.validate({
        name:req.body.name,
        image:req.file
    },{abortEarly:false})
    
    if(error){
        return next(error)
    }
    return next()
}

export const validateUpdateCategory = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateCategorySchema.validate({
        name:req.body.name,
        image:req.file
    },{abortEarly:false})
   
    if(error){
        return next(error)
    }
    return next()
}

