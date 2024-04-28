import {Request,Response} from "express"
import Brand from "../models/brand"
import CloudinaryUtils from "../utils/CloudinaryUtils"
import { IMulterFile } from "../@types/types"
import { asyncHandler } from "../utils/asyncHandler"
import AppError from "../utils/AppError"

export const getAllBrands = asyncHandler( async (req, res, next) =>{
    
    const brands = await Brand.find()
    return res.status(200).json({brands})
})

export const createNewBrand = asyncHandler(async (req, res, next)=>{
    const { brandName } = req.body;
    if(!req.file){
        const error = new AppError("image does not exist",400);
        return next(error);
    }

    const ImageUrl = await CloudinaryUtils.UploadOne(req.file as IMulterFile,process.env.BrandsImages as string)
    if(!ImageUrl){
        const error = new AppError("Failed To Upload Image",400);
        return next(error);
    }

    const brand = await Brand.create({
        name:brandName,
        imageUrl:ImageUrl
    })

    return res.status(200).json({message:"success",brand})
})