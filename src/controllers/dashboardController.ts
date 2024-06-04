import bcrypt from 'bcrypt';
import { IFilterAndSortAllUsers, IInvoice, IOrder, IReview, IUser, allowedFields } from "../@types/types";
import Invoice from "../models/Invoice";
import Order from "../models/order";
import User from "../models/user";
import AppError from "../utils/AppError";
import { asyncHandler } from "../utils/AsyncHandler";
import { createFilter, createSortQuery,  signToken } from "../utils/HelperFunctions";
import SessionToken from '../models/sessionToken';
import Product from '../models/product';
import { PipelineStage} from 'mongoose';
import { allowedValuesForAdminInvoices, allowedValuesForAdminOrders, allowedValuesForAdminReviews, allowedValuesForAdminUsers, sortFieldsAdminInvoices } from '../utils/FilterationAndSort';

export const getAllInvoices = asyncHandler( async(req ,res ,next)=>{
    const {skip,limit,page} = req.pagination;
    const {sort,subTotal_lte,subTotal_gte,grandTotal_lte,grandTotal_gte} = req.query;

    const sortObj = createSortQuery<IInvoice>(sort,sortFieldsAdminInvoices)
    const filter = createFilter<IInvoice>([
        {fieldNameInDB:"subTotal",fieldNameInQuery:"subTotal_lte",type:"Number",checks:["lte"],value:subTotal_lte},
        {fieldNameInDB:"subTotal",fieldNameInQuery:"subTotal_gte",type:"Number",checks:["gte"],value:subTotal_gte},
        {fieldNameInDB:"grandTotal",fieldNameInQuery:"grandTotal_lte",type:"Number",checks:["lte"],value:grandTotal_lte},
        {fieldNameInDB:"grandTotal",fieldNameInQuery:"grandTotal_gte",type:"Number",checks:["gte"],value:grandTotal_gte},
    ],allowedValuesForAdminInvoices);

    const invoices = await Invoice.find(filter,{},{sort:sortObj,skip,limit}).lean();
    const count = await Invoice.find({}).countDocuments().lean();
      
    return res.status(200).json({count,page,limit,invoices})
});

export const getAllOrders = asyncHandler(async(req ,res )=>{
    const { limit,skip,page} = req.pagination;
    const { email,subTotal_lte,subTotal_gte,grandTotal_lte,grandTotal_gte,isPaid,sort } = req.query;
    
    const sortQuery = createSortQuery<IOrder>(sort,[
        {fieldInDb:"subTotal",fieldInQuery:"subTotal",allowedDir:"both"},
        {fieldInDb:"grandTotal",fieldInQuery:"grandTotal",allowedDir:"both"},
    ])
    
    const sortObj : PipelineStage = {
        $sort:sortQuery
    }
    
    const filter = createFilter<IOrder>([
        {fieldNameInDB:"isPaid",fieldNameInQuery:"isPaid",type:"Boolean",value:isPaid},
        {fieldNameInDB:"subTotal",fieldNameInQuery:"subTotal_lte",type:"Number",checks:["lte"],value:subTotal_lte},
        {fieldNameInDB:"subTotal",fieldNameInQuery:"subTotal_gte",type:"Number",checks:["gte"],value:subTotal_gte},
        {fieldNameInDB:"grandTotal",fieldNameInQuery:"grandTotal_lte",type:"Number",checks:["lte"],value:grandTotal_lte},
        {fieldNameInDB:"grandTotal",fieldNameInQuery:"grandTotal_gte",type:"Number",checks:["gte"],value:grandTotal_gte},
        {fieldNameInDB:"user.email",fieldNameInQuery:"email",search:["user.email"],type:"SearchType",checks:["eq"],value:email},
    ],allowedValuesForAdminOrders);

    const matchObj : PipelineStage = {
        $match: filter
    }

    const lookup : PipelineStage = {
        $lookup:{
            localField:"userId",
            foreignField:"_id",
            from:"users",
            as:"user"
        },
    }
  
    const aggregatePipeline : PipelineStage[]= [
        lookup,
        matchObj,
        sortObj,
        {
            $skip:skip
        },{
            $limit:limit
        },
        {
            $unset:["userId","__v"]
        },{
                $project:{
                    "user.password":0,
                    "user.cart":0,
                    "user.addresses":0,
                    "user.wishList":0,
                    "userId":0,
                    "user.createdAt":0,
                    "user.updatedAt":0,
                    "user.__v":0,
                }
        }
    ]
    
    const orders = await Order.aggregate(aggregatePipeline).allowDiskUse(true);
    let count = 0;
    if(orders.length){
        const [{subTotal:ordersCount}] = await Order.aggregate(aggregatePipeline).count("subTotal").allowDiskUse(true);
        count = ordersCount;
    }
    
    return res.status(200).json({count,page,limit,orders})
})

export const getAllUsers = asyncHandler(async (req, res)=>{
    const {limit,page,skip} = req.pagination;
    const { sort, email, name, mobileNumber } : IFilterAndSortAllUsers = req.query;
    
    const sortObj = createSortQuery<IUser>(sort,[
        {fieldInDb:"createdAt",fieldInQuery:"createdAt",allowedDir:"both"},
        {fieldInDb:"updatedAt",fieldInQuery:"updatedAt",allowedDir:"both"},
        {fieldInDb:"email",fieldInQuery:"email",allowedDir:"both"},
        {fieldInDb:"firstName",fieldInQuery:"firstName",allowedDir:"both"},
    ])
    const filter = createFilter<IUser>([
        {fieldNameInDB:"email",fieldNameInQuery:"email",search:["email"],type:"SearchType",value:email},
        {fieldNameInDB:"firstName",fieldNameInQuery:"name",search:["firstName"],type:"SearchType",value:name},
        {fieldNameInDB:"lastName",fieldNameInQuery:"name",search:["lastName"],type:"SearchType",value:name},
        {fieldNameInDB:"mobileNumber",fieldNameInQuery:"mobileNumber",search:["mobileNumber"],type:"SearchType",value:mobileNumber},
    ],allowedValuesForAdminUsers);
    
    const users = await User.find(filter,{__v:0},{
        sort:sortObj,
        limit:limit,
        skip:skip,
    }).lean();
    const count = await User.countDocuments(filter).lean();

    return res.status(200).json({count,page,limit,users})
});

export const getAllReviews = asyncHandler(async(req,res)=>{
    const {skip,page,limit} = req.pagination;
    const {sort,comment,email} :
    {sort?:string,comment?:string,email?:string} = req.query;
    
    const sortObj_test = createSortQuery<IReview>(sort,[
        {fieldInDb:"reviews.rating",fieldInQuery:"rating",allowedDir:"both"},
        {fieldInDb:"reviews.createdAt",fieldInQuery:"createdAt",allowedDir:"both"},
        {fieldInDb:"reviews.updatedAt",fieldInQuery:"updatedAt",allowedDir:"both"},
    ])

    const filter = createFilter<IReview & {user : IUser}>([
        {fieldNameInDB:"comment",fieldNameInQuery:"comment",type:"SearchType",value:comment,search:["review.comment"]},
        {fieldNameInDB:"user.email",fieldNameInQuery:"email",type:"SearchType",value:email,search:["user.email"]},
    ],allowedValuesForAdminReviews);
    
    const sortObj : PipelineStage = {
        $sort:sortObj_test
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
            $match:filter
        },
        {
            $skip:skip,
            
        },{
            $limit:limit,
        },
        {
            $unset:["user","_id"],
            
        },
        {
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
    ]).allowDiskUse(true);
    
    const count = reviews[0]?.count || 0;
    reviews.forEach((rev)=>{
        delete rev["count"];
    })

    return res.status(200).json({count,page,limit,reviews}) 
})

export const cancelOrderAdminPrivilege = asyncHandler(async (req, res, next) => {
    const orderId = req.params.orderId;
        
    const order = await Order.findOneAndUpdate({
        _id:orderId,
    },
    {
        $set: {  status: "Cancelled",updatedDate: new Date().toUTCString()},
    },{new:true});

    if(!order){
        const error = new AppError("The requested order was not found",400);
        return next(error)
    }
        
    return res.status(200).json({message:"success"})
})

export const createUser =asyncHandler( async (req, res)=>{
    const { firstName,lastName,email,password,role } = req.body;
    const hashPassword = bcrypt.hashSync(password,10);
        
    const user = await User.create({
        firstName,
        lastName,
        email,
        password:hashPassword,
        role,
    })
    
    const token = signToken(user._id.toString(),user.email)
    user.$set("password",undefined);
    user.$set("__v",undefined);
        
    const sessionToken = await SessionToken.create({
        userId:user._id,
        token:token
    })
    
    return res.status(201).json({message:"success",user,token:sessionToken.token})
})

export const deleteUserById = asyncHandler(async (req, res, next)=>{
    const {userId} = req.params;
    
    const deleteUser = await User.deleteOne({_id:userId}).lean();
    if(deleteUser.deletedCount !== 1){
        const error = new AppError("User was not found.",400);
        return next(error);
    }
    
    return res.sendStatus(204);
});