import { IProduct, ISingleProduct, image } from '../@types/types';
import type{MongooseMatchStage} from "../@types/types";
import { Request, Response } from "express"
import Product from "../models/product"
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { getThumbnailImageBuffer } from '../utils/ThumbnailUtils';
import { Filter, convertBrandArrayStringToArray, createFilter, createSortQuery, getImageObjById } from '../utils/HelperFunctions';
import { asyncHandler } from '../utils/AsyncHandler';
import AppError from "../utils/AppError";
import {ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import Brand from '../models/brand';
import Category from '../models/category';
import { allowedUserProductsFields, sortFieldsUserProducts } from '../utils/FilterationAndSort';
// import {setCache} from "../middlewares/cache";

export const getProductById = asyncHandler( async(req,res,next)=>{
    const {page, limit,skip} = req.pagination;
    const productId = req.params.productId;

    const product = await Product.aggregate([
        {$match:{_id:new ObjectId(productId)}},
        {$unwind:{path:"$reviews",preserveNullAndEmptyArrays:true}},
        {$sort:{
            "reviews.createdAt":-1
        }},
        {
            $lookup:{
                from:"users",
                localField:"reviews.userId",
                foreignField:"_id",
                as:"reviews.user"
            }
        },
        {
            $addFields:{
                "reviews.user":{
                    $arrayElemAt:["$reviews.user",0]
                },
                
            }
        },
        {   
            $group:{
                _id:"$_id",
                name:{$first:"$name"},
                description:{$first:"$description"},
                categoryId:{$first:"$categoryId"},
                price:{$first:"$price"},
                finalPrice:{$first:"$finalPrice"},
                offer:{$first:"$offer"},
                quantity:{$first:"$quantity"},
                images:{$first:"$images"},
                brand:{$first:"$brand"},
                createdAt:{$first:"$createdAt"},
                updatedAt:{$first:"$updatedAt"},
                ratingNumbers:{$sum:1},
                reviews:{
                    $push:"$reviews"
                }
            }
        },
        {
            $project:{
                avgRating:{
                    $avg:"$reviews.rating"
                },
                reviews:{
                    $slice:["$reviews",skip,limit] 
                },
                name: 1,
                description: 1,
                price: 1,
                finalPrice: 1,
                offer: 1,
                quantity: 1,
                images: 1,
                brand: 1,
                createdAt: 1,
                updatedAt: 1,
                ratingNumbers: 1,
                categoryId:1,
            }
        },
        {
            // Second $project to avoid the issue of path collision at reviews
            $project:{
                "reviews.user.password":0,
                "reviews.user.cart":0,
                "reviews.user.addresses":0,
                "reviews.user.wishList":0,
                "reviews.userId":0,
                "reviews.user.createdAt":0,
                "reviews.user.updatedAt":0,
                "reviews.user.__v":0,
            }
        }
    ]).allowDiskUse(true)
    
    if(product.length == 0){
        const error = new AppError("product was not found",400)
        return next(error);
    }
    if(product[0].reviews[0] && !product[0].reviews[0].comment){
        product[0].reviews = [];
        product[0].ratingNumbers = 0;
    }
    const count = product[0].ratingNumbers;
    //setCache(req.url,JSON.stringify({count,page,limit,product:product[0]}))
    
    return res.status(200).json({count,page,limit,product:product[0]})
})

export const getAllProducts = asyncHandler(async (req : Request, res: Response) =>{
    const { limit , skip , page } = req.pagination;
    const {brand,price_lte,price_gte,category,available,offer,sort,search} = req.query;

    const ArrayFilter : Filter<IProduct>[] = [
        {fieldNameInDB:"finalPrice",fieldNameInQuery:"price_lte",type:"Number",checks:["lte"],value:price_lte},
        {fieldNameInDB:"finalPrice",fieldNameInQuery:"price_gte",type:"Number",checks:["gte"],value:price_gte},
        {fieldNameInDB:"brand",fieldNameInQuery:"brand",type:"Array",value:convertBrandArrayStringToArray(brand)},
        {fieldNameInDB:"categoryId",fieldNameInQuery:"category",type:"ObjectId",value:category},
        {fieldNameInDB:"offer",fieldNameInQuery:"offer",checks:['gt'],value:offer},
        {fieldNameInDB:"quantity",fieldNameInQuery:"quantity",checks:['gte'],value:available},
        {fieldNameInDB:"name",fieldNameInQuery:"name",type:"SearchType",value:search},
        {fieldNameInDB:"description",fieldNameInQuery:"description",type:"SearchType",value:search},
    ]

    const filter = createFilter<IProduct>(ArrayFilter,allowedUserProductsFields);
    const sortStage = createSortQuery<ISingleProduct>(sort,sortFieldsUserProducts);
    
    const products = await Product.aggregate([
        { $match : filter },
        { 
            $addFields: {
                avgRating: {
                    $ifNull: [ { $avg: "$reviews.rating" }, 0 ],
                },
                ratingNumbers:{ $size: "$reviews"},
            },
        },
        { $sort : sortStage}, 
        { $skip : skip},
        { $limit : limit},
        { $project : { __v:0 , reviews:0,description:0 } },
    ]).allowDiskUse(true)
    
    const count = await Product.countDocuments( filter ).allowDiskUse(true).lean();
    
    // if(!req.url.includes("price")){
    //     setCache(req.url,JSON.stringify({count,page,limit,product:product[0]}))
    // }
        
    return res.status(200).json({page,limit,count,products})
})

export const postNewProduct = asyncHandler(async (req, res, next)=>{
    const { name, quantity, description, price , brand, categoryId,offer,finalPrice} = req.body;
    const image = req.file as Express.Multer.File

    if(!req.file){
        const error = new AppError("Image does not exist",400)
        return next(error);
    }

    const isBrandExist = await Brand.findOne({name:brand}).lean();
    const isCategoryExist = await Category.findOne({_id:new ObjectId(categoryId as string)}).lean();
    if(!isBrandExist || !isCategoryExist){
        const error = new AppError("Something went wrong, Please try again later",400)
        return next(error);
    }

    const originalImageUploadResponse = await CloudinaryUtils.UploadOne(image.buffer,process.env.ProductsImagesFolder as string)
    if(!originalImageUploadResponse){
        const error = new AppError("Failed To Upload Image",400)
        return next(error);
    }

    const thumbnailBuffer = await getThumbnailImageBuffer(image.buffer);
    const thumbnailUploadResponse = await CloudinaryUtils.UploadOne(thumbnailBuffer,process.env.ThumbnailsImagesFolder as string);
    if(!thumbnailUploadResponse){
        const error = new AppError("Failed To Upload Image",400)
        return next(error);
    }

    const newProduct = await Product.create({
        name,
        quantity,
        description,
        offer:offer ? Number(offer).toFixed(2) : undefined,
        finalPrice: finalPrice ? Number(finalPrice).toFixed(2) : undefined,
        price:Number(price).toFixed(2),
        categoryId,
        images:{
            thumbnailUrl:thumbnailUploadResponse.secure_url,
            imageUrl:originalImageUploadResponse.secure_url
        },
        brand:brand
    })

    return res.status(201).json({product:newProduct,message:"success"})
})

export const appendImagesToProduct = asyncHandler(async (req, res,next) =>{
    const productId = req.params.productId;
    const images = req.files as Express.Multer.File[]; 

    const isProductExist = await Product.findOne({_id:productId}).lean();
    if(!isProductExist){
        const error = new AppError("Product was not found.",400)
        return next(error);
    }
    
    const uploadPromises = images.map(async(file)=>{
        const originalImageResult = await CloudinaryUtils.UploadOne(file.buffer,process.env.ProductsImagesFolder as string);
        const thumbnailBuffer = await getThumbnailImageBuffer(file.buffer);
        const thumbnailImageResult = await CloudinaryUtils.UploadOne(thumbnailBuffer,process.env.ThumbnailsImagesFolder as string);
        
        return {
            imageUrl:originalImageResult?.secure_url,
            thumbnailUrl:thumbnailImageResult?.secure_url
        };
    })
    
    const uploadedImages = await Promise.all(uploadPromises).catch((err)=>{
        const error = new AppError("An unexpected error has occurred!",400)
        return next(error);
    });

    const product = await Product.updateOne({_id:productId},{
        $push:{images:uploadedImages},
    }).lean();

    if(product.modifiedCount != 1 || product.matchedCount == 0){
        const error = new AppError("Images were not uploaded successfully",400)
        return next(error);
    }
    
    return res.status(200).json({message:"success",newImages:uploadedImages})
})

export const updateProductInfo = asyncHandler(async (req, res, next) =>{
    const productId = req.params.productId;
    const { name, quantity, description, price , brand, categoryId, offer, finalPrice} = req.body;
    const productBeforeUpdate = await Product.findOne({_id:productId});

    if(!productBeforeUpdate){
        const error = new AppError("Product was not found.",400)
        return next(error);
    }

    if(brand){
        const isBrandExist = await Brand.findOne({name:brand}).lean();
        if(!isBrandExist){
            const error = new AppError("Something went wrong, Please try again later",400)
            return next(error);
        }
    }
    if(categoryId){
        const isCategoryExist = await Category.findOne({_id:categoryId}).lean();
        if(!isCategoryExist){
            const error = new AppError("Something went wrong, Please try again later",400)
            return next(error);
        }
    }

    const updateProduct = await Product.findOneAndUpdate({
        _id:productId
    },{
        name,
        quantity,
        description,
        price,
        brand,
        categoryId,
        offer,
        finalPrice,
    },{
        new:true,
    }).lean();

    return res.status(200).json({message:"success",product:updateProduct})
})

export const updateProductSingleImage = asyncHandler(async (req, res, next) =>{
    const productId = req.params.productId;
    const { imageId } : {imageId:string}= req.body;
    const image = req.file as Express.Multer.File;

    const match = {_id:productId, "images._id":new ObjectId(imageId)}
    
    const productBeforeUpdate = await Product.findOne(match);
    if(!productBeforeUpdate){
        const error = new AppError("Product or image was not found.",400);
        return next(error);
    }
    
    const uploadImageApiResponse = await CloudinaryUtils.UploadOne(image.buffer,process.env.ProductsImagesFolder as string);
    if(!uploadImageApiResponse){
        const error = new AppError("An unexpected error occurred during uploading image",500);
        return next(error);
    }
    const thumbnailBuffer = await getThumbnailImageBuffer(image.buffer);
    const uploadThumbnailApiResponse = await CloudinaryUtils.UploadOne(thumbnailBuffer,process.env.ThumbnailsImagesFolder as string);
    if(!uploadThumbnailApiResponse){
        const error = new AppError("An unexpected error occurred during uploading image",500);
        return next(error);
    }
    
    const transaction = await mongoose.startSession();
    transaction.startTransaction();
    
    const productAfterUpdate = await Product.findOneAndUpdate(
        match,
        {
            $set:{
                "images.$[elem].imageUrl":uploadImageApiResponse.secure_url,
                "images.$[elem].thumbnailUrl":uploadThumbnailApiResponse.secure_url,
            }
        },{
            arrayFilters:[{
                "elem._id": new ObjectId(imageId)
            }],
            new:true,
            session:transaction
        }
    ).lean();
    
    const {imageUrl,thumbnailUrl} = getImageObjById(productBeforeUpdate,imageId)!;

    const deleteOldImage = await CloudinaryUtils.DeleteOne(imageUrl,process.env.ProductsImagesFolder as string);
    const deleteOldThumbnail = await CloudinaryUtils.DeleteOne(thumbnailUrl,process.env.ThumbnailsImagesFolder as string);
    
    if(!deleteOldImage || !deleteOldThumbnail){
        
       await transaction.abortTransaction();
       const error = new AppError("An unexpected error occurred during uploading image",500);
       return next(error);
    }

    await transaction.commitTransaction();
    
    return res.status(200).json({message:"success",product:productAfterUpdate})
})

export const deleteProduct = asyncHandler(async (req, res, next) =>{
    const productId = req.params.productId;
    const productToDelete = await Product.findOne({_id:productId})
    
    const ArrOfImagesThumbnailToDelete : string[] = []
    const ArrOfImagesMainToDelete : string[] = []
    
    if(!productToDelete){
        const error = new AppError("product was not found",400)
        return next(error);
    }

    productToDelete.images.forEach((image : image)=>{
        ArrOfImagesThumbnailToDelete.push(image.thumbnailUrl);
        ArrOfImagesMainToDelete.push(image.imageUrl);
    })

    await CloudinaryUtils.DeleteMany(ArrOfImagesThumbnailToDelete,process.env.ThumbnailsImagesFolder as string);
    await CloudinaryUtils.DeleteMany(ArrOfImagesMainToDelete,process.env.ProductsImagesFolder as string);

    const deletingProduct = await Product.deleteOne({
        _id:productId
    }).lean();

    if(deletingProduct.deletedCount == 0){
        const error = new AppError("Something Went Wrong",400)
        return next(error);
    }

    return res.status(200).json({message:"success",ArrOfImagesThumbnailToDelete,ArrOfImagesMainToDelete})
})

export const searchForProducts = asyncHandler(async (req: Request, res: Response) =>{
    const {text} = req.params;
    const products = await Product.find({
        $text:{
            $search:text
        }
    }).select({score: {$meta:"textScore"},reviews:0,__v:0,updatedAt:0,createdAt:0}).sort({score:{$meta:"textScore"}}).lean();
    return res.status(200).json({count:products.length,products})
})

