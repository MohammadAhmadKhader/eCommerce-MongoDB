import  mongoose from 'mongoose';
import { IMulterFile,image } from '../@types/types';
import { Request, Response } from "express"
import Product from "../models/product"
import CloudinaryUtils from "../utils/CloudinaryUtils";
import imageThumbnail from "image-thumbnail"
import { ImageThumbnailOptions } from '../utils/ThumbnailUtils';
import { isJSON } from '../utils/HelperFunctions';



export const getProductById = async(req : Request,res : Response)=>{
    try{
        const { limit,skip} = req.pagination;
        const productId = req.params.productId;
        
        const aggregateToGetAvg = await Product.aggregate([
            { $match : { _id : new mongoose.Types.ObjectId(productId) } },
            { $unwind : "$reviews"},
            { $group:{
               _id:null,
               originalProduct: { $first: '$$ROOT' },
               reviews: {$push : "$reviews"}
           } },
           {
               $lookup:{
                   from:"users",
                   localField:"reviews.userId",
                   foreignField:"_id",
                   as:"userReviews"
               }
           },
           {
               $addFields: {
                   "reviews.user": "$userReviews"
               },
               
           },
           {
               $project: {
                   originalProduct:1,
                   reviews:{
                      $slice:['$reviews',skip,limit],
                   },
                   avgRating: { $avg : "$reviews.rating"},
                   reviewsCount : { $size : "$reviews"},

               }
           },
       ])
       
        if(aggregateToGetAvg.length == 0){
            return res.status(400).json({error:"Product was not found"});
        }

        const { avgRating, originalProduct ,reviewsCount,reviews} = aggregateToGetAvg[0];

        originalProduct.reviews = reviews
        originalProduct.avgRating = avgRating;
        originalProduct.reviewsCount = reviewsCount
        originalProduct.__v = undefined;
        
        originalProduct.reviews.map((review : any)=>{
            
                review.user[0].password = undefined
                review.user[0].wishList = undefined
                review.user[0].orders = undefined
                review.user[0].cart = undefined
                review.user[0].addresses = undefined
                review.user[0].__v = undefined
            return review
        })
    
        return res.status(200).json({product:originalProduct})
    }catch(error){
        console.log(error)
        return res.status(500).json({error})
    }
}

export const getAllProducts = async (req : Request, res: Response) =>{
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
        
        const matchStage : any = {}
        const orArray = []
        if(minPrice || maxPrice){
            matchStage.price = {}
            if(minPrice){
                matchStage.price.$gte= parseInt(minPrice);
            }
            if(maxPrice){
                matchStage.price.$lte  = parseInt(maxPrice);
                
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
            const categoryId = new mongoose.Types.ObjectId(category)
            matchStage.categoryId = categoryId;
        }
        if(sort){
            const sortQueries = sort.split("_")
            if(sortQueries[0] == "price" || sortQueries[0] == "ratings" || sortQueries[0] == "ratingsNumber" ||  sortQueries[0] == "newArrivals"){
                if(sortQueries[0] == "price"){
                    fieldToSort = "finalPrice";
                }else if(sortQueries[0] == "newArrivals"){
                    fieldToSort = "createdAt";
                }else if(sortQueries[0] == "ratings")
                    fieldToSort = "avgRating";
                else{
                    fieldToSort = sortQueries[0];
                }
                console.log(fieldToSort,"s")
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
        if(available && available == "true"){
            andArray.push({quantity : {$gte : 1}})
            matchStage.$and = andArray;
        }
        if(offer && offer=="true"){
            andArray.push({ offer : { $gte : 0}})
            matchStage.$nad = andArray;
        }

        const products = await Product.aggregate([
            { 
                $addFields: {
                    avgRating: {
                        $ifNull: [ { $avg: "$reviews.rating" }, 0 ],
                    },
                    ratingsNumber:{ $size: "$reviews"},
                },
            },
            { $match : matchStage },
            { $sort : sortStage}, 
            { $skip : skip},
            { $limit : limit},
            { $project : { __v:0 , reviews:0,description:0 } },
        ])
        const count = await Product.countDocuments( matchStage )
        

        return res.status(200).json({page,limit,count,products})
   }catch(error){
        console.log(error)
        return res.status(500).json({error})
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
    }catch(error){
        console.log(error)
        return res.status(500).json({error})
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
    }catch(error){
        console.log(error)
        return res.status(500).json({error})
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
    }catch(error){
        console.log(error)
        return res.status(500).json({error})
    }
}