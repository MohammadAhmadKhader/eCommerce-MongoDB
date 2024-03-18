import { Request, Response } from "express";
import Category from "../models/category";

export const getAllCategories = async (req:Request,res:Response)=>{
    try{
        const categories = await Category.find({}).select("-__v");

        return res.status(200).json({categories})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}