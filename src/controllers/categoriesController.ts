import Category from "../models/category";
import { setServerCache } from "../utils/ServerCache";
import { asyncHandler } from "../utils/asyncHandler";

export const getAllCategories = asyncHandler(async (req ,res)=>{
    const categories = await Category.find({}).select("-__v");
    setServerCache("categories",categories);
    
    return res.status(200).json({categories})
})