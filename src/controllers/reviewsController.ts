import Product from "../models/product";
import { asyncHandler } from "../utils/AsyncHandler";
import AppError from "../utils/AppError";
import { IReview } from "../@types/types";

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

export const getAllReviews = asyncHandler(async(req,res)=>{
    const {skip,page,limit} = req.pagination;
    const {sort} = req.query;
    
    const sortObj : any = {
        $sort:{
            "reviews.createdAt":-1
        }
    }

    if(sort && (sort === "rating_desc" || sort === "rating_asc")){
        if(sort === "rating_desc"){
            sortObj.$sort = { "reviews.rating":-1}
        }
        if(sort === "rating_asc"){
            sortObj.$sort = { "reviews.rating":1}
        }
    }

    const reviews = await Product.aggregate([
        {$addFields:{
            "reviews.productId":"$$ROOT._id"
        }},
        {$unwind:"$reviews"},
        sortObj,
        {
            $group:{
                _id:"null",
                count:{
                    $sum:1
                },
                review:{
                    $push:"$reviews",
                }
            }
        },{
            $unwind:"$review"
        },{
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"review.userId",
                as:"user",
            }
        },
        {
            $addFields:{
                "review.user":{ $arrayElemAt: ["$user", 0] },
            }
        },
        
        {
            $skip:skip,
            
        },{
            $limit:limit,
        },
        {
            $unset:["user","_id"],
            
        },{
            $project:{
                "review.user.password":0,
                "review.user.cart":0,
                "review.user.addresses":0,
                "review.user.wishList":0,
                "review.userId":0,
                "review.user.createdAt":0,
                "review.user.updatedAt":0,
                "review.user.__v":0,
            }
        },
    ]);
    const count = reviews[0].count;
    reviews.forEach((rev)=>{
        delete rev["count"];
    })

    return res.status(200).json({count,page,limit,reviews}) 
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
    const reviewId = req.params.reviewId as string;

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
    const {reviewId,productId} = req.params;
    
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