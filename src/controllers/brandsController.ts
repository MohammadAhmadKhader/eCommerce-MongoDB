import {Request,Response} from "express"
import Brand from "../models/brand"
import CloudinaryUtils from "../utils/CloudinaryUtils"
import { IMulterFile } from "../@types/types"

export const getAllBrands = async (req:Request,res:Response) =>{
    try{
        const brands = await Brand.find()

        return res.status(200).json({brands})
    }catch(error : any){
        console.log(error)
        return res.status(500).json({error:error?.message})
   }
}

export const createNewBrand = async (req:Request,res:Response)=>{
    try{
        const { brandName } = req.body;
        const ImageUrl = await CloudinaryUtils.UploadOne(req.file as IMulterFile,process.env.BrandsImages as string)
        if(!ImageUrl){
            console.log(ImageUrl)
            return res.status(400).json({error:"Failed To Upload Image"})
        }

        const brand = await Brand.create({
            name:brandName,
            imageUrl:ImageUrl
        })

        return res.status(200).json({message:"success",brand})
    }catch(error : any){
        console.log(error)
        return res.status(500).json({error:error?.message})
   }
}