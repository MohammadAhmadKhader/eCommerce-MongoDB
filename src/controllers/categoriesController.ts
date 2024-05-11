import Category from "../models/category";
import { deleteServerCacheKey, setServerCache } from "../utils/ServerCache";
import { asyncHandler } from "../utils/AsyncHandler";
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { UploadApiResponse } from "cloudinary";
import AppError from "../utils/AppError";

export const getAllCategories = asyncHandler(async (req ,res)=>{
    const categories = await Category.find({}).select("-__v");
    setServerCache("categories",categories);
    
    return res.status(200).json({categories})
})

export const createCategory = asyncHandler(async (req, res, next)=>{
    const {name} = req.body;
    const image = req.file as Express.Multer.File;
    
    const uploadImageResponse = await CloudinaryUtils.UploadOne(image.buffer, process.env.CategoriesImagesFolder as string) as UploadApiResponse;
    if(!uploadImageResponse){
        const error = new AppError("Failed To Upload Image",400);
        return next(error);
    }
    
    const newCategory = await Category.create({
        name:name,
        imageUrl:uploadImageResponse?.secure_url
    })
    
    deleteServerCacheKey("categories");

    return res.status(201).json({message:"success",category:newCategory})
})


export const updateCategory = asyncHandler(async (req, res, next)=>{
    const {name} = req.body;
    const {categoryId} = req.params;
    const image = req.file;
    let imageUrl;
 
    if(image){
        const uploadImageResponse = await CloudinaryUtils.UploadOne(image.buffer, process.env.CategoriesImagesFolder as string);
        if(!uploadImageResponse){
            const error = new AppError("Failed To Upload Image",400);
            return next(error);
        }

        imageUrl = uploadImageResponse?.secure_url;
    }

    const category = await Category.findOneAndUpdate({
        _id:categoryId
    },{
        name:name,
        imageUrl,
    },{new:true});
    
    if(!category){
        const message = new AppError("Category was not found.",400);
        return next(message);
    }
    
    deleteServerCacheKey("categories");

    return res.status(200).json({message:"success",category})
})

export const deleteCategory = asyncHandler(async (req, res, next)=>{
    const {categoryId} = req.params;
    const category = await Category.findOneAndDelete({
        _id:categoryId
    });
    
    if(!category){
        const message = new AppError("Category was not found.",400);
        return next(message);
    }
    
    const categoryImage = category?.imageUrl as string;
    await CloudinaryUtils.DeleteOne(categoryImage, process.env.CategoriesImagesFolder as string);
    
    deleteServerCacheKey("categories");

    return res.sendStatus(204);
})