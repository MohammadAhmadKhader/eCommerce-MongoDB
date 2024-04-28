import Category from "../models/category";
import { asyncHandler } from "../utils/asyncHandler";

export const getAllCategories = asyncHandler(async (req ,res)=>{
    const categories = await Category.find({}).select("-__v");

    return res.status(200).json({categories})
})