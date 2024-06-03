import { NextFunction, Request, Response } from "express";
import { appendImagesToProductSchema, createProductSchema, updateProductSchema,
     updateProductSingleImageSchema } from "../validationSchemas/productsValidationSchemas";
import AppError from "../../utils/AppError";

export const validateCreateProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createProductSchema.validate({
        name:req.body.name,
        description:req.body.description,
        categoryId:req.body.categoryId,
        offer:req.body.offer,
        price:req.body.price,
        finalPrice:req.body.finalPrice,
        quantity:req.body.quantity,
        brand:req.body.brand,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["categoryId"]}
        return next(error);
    }
    return next()
}

export const validateUpdateProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateProductSchema.validate({
        name:req.body.name,
        description:req.body.description,
        categoryId:req.body.categoryId,
        offer:req.body.offer,
        price:req.body.price,
        finalPrice:req.body.finalPrice,
        quantity:req.body.quantity,
        brand:req.body.brand,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["categoryId"]}
        return next(error);
    }

    if (!req.body.brand && !req.body.categoryId && !req.body.description && 
        !req.body.quantity && !req.body.name && !req.body.offer && 
        !req.body.price && !req.body.finalPrice) {

        const error= new AppError("Something went wrong during updating product, please try again later!",500)
        return next(error);
    }
    return next()
}

export const validateUpdateSingleImageProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateProductSingleImageSchema.validate({
        imageId:req.body.imageId,
        image:req.file,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }

    return next()
}

export const validateAppendImagesToProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = appendImagesToProductSchema.validate({
        imagesLength:req.files?.length
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}