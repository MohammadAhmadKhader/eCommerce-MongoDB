import { Request,Response } from "express";
import User from "../models/user";
import { ObjectId } from "mongodb";

export const getWishList = async (req:Request,res:Response)=>{
    try{
        const userId = req.params.userId;
        const wishList = await User.findOne({_id:userId}).populate({path:"wishList.productId",select:"name images offer price finalPrice brand"})
        if(!wishList){
            return res.status(400).json({error:"user was not found"})
        }

        return res.status(201).json({wishList:wishList.wishList})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const addToWishList = async (req:Request, res:Response)=>{
    try{
        const productId = req.body.productId as string;
        const userId = req.body.userId as string;

        const user = await User.findById(userId);
        if(!user){
            return res.status(400).json({error:"user was not found"})
        }
        if(user.wishList.length == 6){
            return res.status(400).json({error:"user has reached max amount"})
        }
        const userHaveProductAlready = user.wishList.filter((item) => item.productId?.toString() == productId);
        if(userHaveProductAlready.length != 0){
            return res.status(400).json({error:"product already exist in wishlist"})
        }
        
        const userAfterChanges = await User.findOneAndUpdate({_id:userId},{
            $push: { wishList: { productId:productId} }
        },{new:true,select:"-password -__v"})
        
        return res.status(201).json({message:"success",user:userAfterChanges})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const removeFromWishList = async (req:Request,res:Response)=>{
    try{
        const wishlistItemId = req.body.wishlistItemId as string;
        const userId = req.body.userId as string;

        const userAfterChanges = await User.findOneAndUpdate({_id:userId},{
            $pull : { wishList : { _id :new ObjectId(wishlistItemId)} },
        },{new:true,select:"-password -__v"})

        return res.status(202).json({message:"success",user:userAfterChanges})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}
