import { IMulterFile,image } from '../@types/types';
import { NextFunction, Request, Response } from "express"
import Product from "../models/product"
import CloudinaryUtils from "../utils/CloudinaryUtils";
import imageThumbnail from "image-thumbnail"
import { ImageThumbnailOptions } from '../utils/ThumbnailUtils';
import { isJSON } from '../utils/HelperFunctions';
import { ObjectId } from 'mongodb';
import {setCache} from "../middlewares/cache";

export const getProductById = async(req : Request,res : Response)=>{
    try{
        const {page, limit,skip} = req.pagination;
        const productId = req.params.productId;
        const product = await Product.aggregate([
            {$match:{_id:new ObjectId(productId)}},
            {$unwind:"$reviews"},
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
                    }
                }
            },{$group:{
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
            }},
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
            return res.status(400).json({error:"product was not found"})
        }
        const count = product[0].ratingNumbers;
        
        //setCache(req.url,JSON.stringify({count,page,limit,product:product[0]}))
        
        
       return res.status(200).json({count,page,limit,product:product[0]})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const getAllProducts = async (req : Request, res: Response,next:NextFunction) =>{
   try{
        const { limit , skip , page } = req.pagination;
        const searchText = req.query.search as string;
        const minPrice = req.query.price_gte as string;
        const maxPrice = req.query.price_lte as string;
        const brand = req.query.brand as string;
        const category = req.query.category as string;
        const available = req.query.available as string;
        const sort = req.query.sort as string;
        const offer = req.query.offer as string;
        let fieldToSort = "createdAt";
        let sortDirection = -1;

        const matchStage :  any = {}
        const orArray = []
        if(minPrice || maxPrice){
            matchStage.finalPrice = {}
            if(minPrice){
                matchStage.finalPrice.$gte= parseInt(minPrice);
            }
            if(maxPrice){
                matchStage.finalPrice.$lte  = parseInt(maxPrice);
                
            }
        }
        if(searchText){
            orArray.push({name: { $regex : `.*${searchText}.*`,$options:"i" } });
            orArray.push({description : { $regex : `.*${searchText}.*`,$options:"i" } });
            matchStage.$or = orArray;
        }
        
        if(brand && isJSON(brand)){
            matchStage.brand = {};
            const brandArray = JSON.parse(brand)
            matchStage.brand = 
            { $regex :brandArray.map((item : string)=>`.*${item}.*`).join("|")  
             , $options : "i" };
             
        }
        if(category){
            const categoryId = new ObjectId(category)
            matchStage.categoryId = categoryId;
        }

        if(sort){
            const sortQueries = sort.split("_")
            if(sortQueries[0] == "price" || sortQueries[0] == "ratings" || sortQueries[0] == "ratingNumbers" ||  sortQueries[0] == "newArrivals"){
                if(sortQueries[0] == "price"){
                    fieldToSort = "finalPrice";
                }else if(sortQueries[0] == "newArrivals"){
                    fieldToSort = "createdAt";
                }else if( sortQueries[0] == "ratings"){
                    fieldToSort = "avgRating";
                }else{
                    fieldToSort = sortQueries[0];
                }
                
                if(sortQueries[1] && sortQueries[1] == "desc"){
                    sortDirection = -1
                }else{
                    sortDirection = 1
                }
            }
        }
        const sortStage : any = {
            [fieldToSort]:sortDirection
        }

        const andArray = []
        if(available == "true"){
            andArray.push({quantity : {$gte : 1}})
            matchStage.$and = andArray;
        }
        if(offer && offer == "true"){
            andArray.push({offer: {$gt:0}})
            matchStage.$and = andArray;
        }


        const products = await Product.aggregate([
            { $match : matchStage },
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
        ])
        const count = await Product.countDocuments( matchStage )
        // if(!req.url.includes("price")){
        //     setCache(req.url,JSON.stringify({count,page,limit,product:product[0]}))
        // }
        
        return res.status(200).json({page,limit,count,products})
   }catch(error : any){
    console.error(error)
    return res.status(500).json({error:error?.message})
}
  
}

export const postNewProduct = async (req : Request , res : Response)=>{
    try{
        const { name, quantity, description, price , brand, categoryId,offer,finalPrice} = req.body

        const ImageUrl = await CloudinaryUtils.UploadOne(req.file as IMulterFile,process.env.ProductsImagesFolder as string)
        if(!ImageUrl){
            console.log(ImageUrl)
            return res.status(400).json({error:"Failed To Upload Image"})
        }
        
        const thumbnailAsBase64 = await imageThumbnail({uri:ImageUrl},ImageThumbnailOptions)
        const thumbnailUrl = await CloudinaryUtils.UploadOneFromBase64(thumbnailAsBase64 as unknown as string,process.env.ThumbnailsImagesFolder as string)
        
        const newProduct = await Product.create({
            name,
            quantity,
            description,
            offer:offer ? Number(offer).toFixed(2) : undefined,
            finalPrice: finalPrice ? Number(finalPrice).toFixed(2) : undefined,
            price:Number(price).toFixed(2),
            categoryId,
            images:{
                thumbnailUrl:thumbnailUrl,
                imageUrl:ImageUrl
            },
            brand:brand
        })

        return res.status(201).json({product:newProduct,message:"success"})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const appendImagesToProduct = async (req: Request, res: Response) =>{
    try{
        const productId = req.params.productId;
        const images = req.files as unknown as IMulterFile[];
        
        if(!images || images.length == 0){
            return res.status(400).json({error:"Images were not uploaded successfully"})
        }
        const arrayOfImages = await CloudinaryUtils.UploadManySubImagesAndThumbnails(images)

        
        const product = await Product.updateMany({_id:productId},{
            $push:{images:arrayOfImages},
        })
        if(product.modifiedCount != 1){
            return res.status(400).json({error:"images were not uploaded successfully"})
        }
        return res.status(200).json({message:"success"})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const deleteProduct = async (req: Request, res: Response) =>{
    try{
        const productId = req.params.productId;
        const productToDelete = await Product.findById(productId)
        const ArrOfImagesThumbnailToDelete : string[] = []
        const ArrOfImagesMainToDelete : string[] = []
        if(!productToDelete){
            return res.status(400).json({error:"product was not found"});
        }
        productToDelete.images.forEach((image : image)=>{
            ArrOfImagesThumbnailToDelete.push(image.thumbnailUrl);
            ArrOfImagesMainToDelete.push(image.imageUrl);
        })

        await CloudinaryUtils.DeleteMany(ArrOfImagesThumbnailToDelete,process.env.ThumbnailsImagesFolder as string);
        await CloudinaryUtils.DeleteMany(ArrOfImagesMainToDelete,process.env.ProductsImagesFolder as string);

        const deletingProduct = await Product.deleteOne({
            _id:productId
        });
        if(deletingProduct.deletedCount == 0){
            return res.status(400).json({error:"Something Went Wrong"})
        }

        return res.status(200).json({message:"success",ArrOfImagesThumbnailToDelete,ArrOfImagesMainToDelete})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const searchForProducts = async (req: Request, res: Response) =>{
    try{
        const {text} = req.params;
        const products = await Product.find({
            $text:{
                $search:text
            }
        }).select({score: {$meta:"textScore"},reviews:0,__v:0,updatedAt:0,createdAt:0}).sort({score:{$meta:"textScore"}})
        return res.status(200).json({count:products.length,products})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}