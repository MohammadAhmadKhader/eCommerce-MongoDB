import { Request, Response } from "express";
import Category from "../models/category";

export const getAllCategories = async (req:Request,res:Response)=>{
    try{
        const categories = await Category.find({});

        return res.status(200).json({categories})
    }catch(error){
        return res.status(400).json({error})
    }
}