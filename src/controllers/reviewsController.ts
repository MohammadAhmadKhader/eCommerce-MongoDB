import { Request, Response } from "express";
import Product from "../models/product";
import { ObjectId } from "mongodb";
import { IUser } from "../@types/types";

export const getAllReviewsByUserId = async (req:Request,res:Response) =>{
    try{
        const {skip,page,limit} = req.pagination;
        const userId = req.user._id as string;
       // const userId = req.params.userId;
        const match = { 'reviews.userId' :new ObjectId(userId) }

        const reviews = await Product.aggregate([
            { $unwind : "$reviews"},
            { $match : match },
            { $project : { review : "$reviews", _id : 0} },
            { $skip : skip },
            { $limit : limit },
        ])
    
        const matchingReviewsCount = await Product.aggregate([{ $unwind : "$reviews"},{ $match : match }]).count("reviews");
        let count : number;
        
        if(matchingReviewsCount.length > 0){
            const [{ reviews : reviewsCount}] = matchingReviewsCount;
            count = reviewsCount
        }else{
            count = 0
        }    
        
        const improvedReviewsResponse = reviews.map(reviewObj => reviewObj.review);
        return res.status(200).json({count:count,limit,page,reviews:improvedReviewsResponse})

    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const addReviewToProduct = async (req:Request,res:Response)=>{
    try{
        const {comment, rating} = req.body
        const userId = req.user._id as string;
       // const userId = req.body.userId as string;
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
        console.error(error)
        return res.status(500).json({error})
    }
}
export const editReview = async (req:Request,res:Response)=>{
    try{
        const {comment,rating} = req.body
        const userId = req.user._id as string;
        const reviewId = req.body.reviewId as string;
        //const userId = req.body.userId as string;

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
        console.error(error)
        return res.status(500).json({error:error?.message})
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
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}