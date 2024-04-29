import Product from "../models/product";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";

export const getAllReviewsByUserId = asyncHandler(async (req, res ) =>{
    const {skip,page,limit} = req.pagination;
    const userId = req.user._id;
    const match = { 'reviews.userId' :userId }

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
})

export const addReviewToProduct = asyncHandler(async (req, res, next)=>{
    const {comment, rating} = req.body
    const userId = req.user._id;
    const productId = req.body.productId;

    const oldReviews = await Product.findOne(
        {
            'reviews.userId':userId,
            _id:productId
        },
        {'reviews.$':1},
    
    )
    if(oldReviews){
        const error = new AppError("user has already reviews this product",400);
        return next(error);
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
})
export const editReview = asyncHandler(async (req, res, next)=>{
    const {comment,rating} = req.body
    const userId = req.user._id;
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
        const error = new AppError("The requested review does not exist",400);
        return next(error);
    }
        
    return res.status(201).json({message:"success"})
})

export const deleteReview = asyncHandler(async(req, res, next)=>{
    const reviewId = req.body.reviewId as string; // => to url
    const productId = req.body.productId as string;
       
    const removeReviewFromProduct = await Product.updateOne(
        {
            _id:productId,
            "reviews._id": reviewId 
        },
        { 
            $pull:{ 
                reviews:{
                        _id:reviewId
                }
            }
        })
        
    if(removeReviewFromProduct.modifiedCount == 0){
        const error = new AppError("The requested review or product does not exist",400);
        return next(error);
    }
       
    return res.sendStatus(204);
})