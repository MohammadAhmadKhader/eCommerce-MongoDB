import { Request, Response } from "express";
import Product from "../models/product";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";


export const getAllReviewsByUserId = async (req:Request,res:Response) =>{
    try{
        const {skip,page,limit} = req.pagination;
        const userId = req.params.userId;
        console.log(userId)
        console.log(skip,page,limit);
        const match = { 'reviews.userId' :new mongoose.Types.ObjectId(userId) }

        const reviews = await Product.aggregate([
            { $unwind : "$reviews"},
            { $match : match },
            { $skip : skip },
            { $project : { reviews : 1, _id : 0} },
            { $limit : limit }
        ])
        const matchingReviewsCount = await Product.aggregate([{ $unwind : "$reviews"},{ $match : match }]).count("reviews")
        const [{ reviews : reviewsCount}] = matchingReviewsCount
        return res.status(200).json({count:reviewsCount,limit,page,reviews})

    }catch(error){
        return res.status(500).json({error})
    }
}

export const addReviewToProduct = async (req:Request,res:Response)=>{
    try{
        const {comment, rating} = req.body
        const userId = req.body.userId as string;
        const productId = req.body.productId;

        const oldReviews = await Product.find(
            {
                'reviews.userId':userId,
                _id:productId
            },
            {'reviews.$':1},
        
        )
        if(oldReviews.length == 1){
            return res.status(400).json({error:"user has already reviews this product"})
        }

        const addReview = await Product.findOneAndUpdate(
            {_id:productId},
            { $push: { reviews :
                {
                    userId:userId,
                    comment:comment,
                    rating:rating,
                }
            }}
        )

        return res.status(201).json({message:"success"})
    }catch(error){

        return res.status(500).json({error})
    }
}
export const editReview = async (req:Request,res:Response)=>{
    try{
        const {comment,rating} = req.body
        const reviewId = req.body.reviewId as string;
        const userId = req.body.userId as string;

        const editReview = await Product.findOneAndUpdate(
            {'reviews._id' : reviewId,'reviews.userId': userId},
            { 
                $set : { 
                    'reviews.$.comment' : comment,
                    'reviews.$.rating' : rating  
                }
            },{new:true}
        )
        
        if(!editReview){
            return res.status(400).json({error:"Review was not found",review:editReview})
        }
        
        return res.status(201).json({message:"success"})
    }catch(error : any){
        
        return res.status(500).json({error})
    }
}

export const deleteReview = async(req:Request,res:Response)=>{
    try{
        const reviewId = req.body.reviewId as string;
        const productId = req.body.productId as string;
       
        const removeReviewFromProduct = await Product.updateOne(
            {
                _id:productId,
            },
            { $pull: { reviews :
                {
                    _id:reviewId
                }
            }}
        )
        if(removeReviewFromProduct.modifiedCount == 0){
            return res.status(400).json({error:"Something went wrong during deletion process"})
        }
       
       return res.sendStatus(204);
    }catch(error){
        return res.status(500).json({error})
    }
}