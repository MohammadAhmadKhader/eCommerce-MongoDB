import Brand from "../models/brand"
import CloudinaryUtils from "../utils/CloudinaryUtils"
import { asyncHandler } from "../utils/AsyncHandler"
import {setServerCache,deleteServerCacheKey} from "../utils/ServerCache";
import AppError from "../utils/AppError"

export const getAllBrands = asyncHandler( async (req, res, next) =>{
    const brands = await Brand.find();
    setServerCache("brands",brands)

    return res.status(200).json({brands})
})

export const createNewBrand = asyncHandler(async (req, res, next)=>{
    const { brandName } = req.body;
    const image = req.file as Express.Multer.File;

    const uploadImageResponse = await CloudinaryUtils.UploadOne(image.buffer,process.env.BrandsImages as string)
    if(!uploadImageResponse){
        const error = new AppError("Failed To Upload Image",400);
        return next(error);
    }

    const brand = await Brand.create({
        name:brandName,
        imageUrl:uploadImageResponse.secure_url
    })
    deleteServerCacheKey("brands");
    
    return res.status(200).json({message:"success",brand})
})

export const updateBrand = asyncHandler(async (req, res, next)=>{
    const { brandName } = req.body;
    const { brandId } = req.params;

    const image = req.file;
    let imageUrl;

    if(image){
        const uploadImageResponse = await CloudinaryUtils.UploadOne(image.buffer,process.env.BrandsImages as string)
        if(!uploadImageResponse){
            const error = new AppError("Failed To Upload Image",400);
            return next(error);
        }
        imageUrl = uploadImageResponse.secure_url;
    }

    const brand = await Brand.findOneAndUpdate({
        _id:brandId
    },{
        name:brandName,
        imageUrl:imageUrl
    },{new:true})

    if(!brand){
        const error = new AppError("Brand was not found.",400);
        return next(error);
    }

    deleteServerCacheKey("brands");
    
    return res.status(200).json({message:"success",brand})
})

export const deleteBrand = asyncHandler(async (req, res, next)=>{
    const { brandId } = req.params;

    const brand = await Brand.findOneAndDelete({
        _id:brandId
    });

    if(!brand){
        const message = new AppError("Brand was not found.",400);
        return next(message);
    }

    const brandLogo = brand?.imageUrl as string;
    await CloudinaryUtils.DeleteOne(brandLogo, process.env.BrandsImages as string);

    deleteServerCacheKey("brands");
    
    return res.sendStatus(204);
})