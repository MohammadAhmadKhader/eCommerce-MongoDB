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
    if(!image){
        const error = new AppError("image does not exist",400);
        return next(error);
    }

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