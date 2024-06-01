import bcrypt from 'bcrypt';
import { IFilterAndSortAllUsers, IInvoicesSortObj, ISortQuery, IUsersMatchStage } from "../@types/types";
import Invoice from "../models/Invoice";
import Order from "../models/order";
import User from "../models/user";
import AppError from "../utils/AppError";
import { asyncHandler } from "../utils/AsyncHandler";
import { signToken } from "../utils/HelperFunctions";
import SessionToken from '../models/sessionToken';
import Product from '../models/product';

export const getAllInvoices = asyncHandler( async(req ,res ,next)=>{
    const {skip,limit,page} = req.pagination;
    const {sort} = req.query;

    let sortObj : IInvoicesSortObj = {createdAt:-1};
    if(sort && (sort === "subTotal_asc" || sort === "subTotal_desc" || sort === "grandTotal_asc" || sort === "grandTotal_desc" )){
        if(sort === "subTotal_asc"){
            sortObj = {subTotal:1};
        }
        if(sort === "subTotal_desc"){
            sortObj = {subTotal:-1};
        }
        if(sort === "grandTotal_desc"){
            sortObj = {grandTotal:-1};
        }
        if(sort === "grandTotal_asc"){
            sortObj = {grandTotal:1};
        }
    }

    const invoices = await Invoice.find({},{},{sort:sortObj,skip,limit}).lean();
    const count = await Invoice.find({}).countDocuments().lean();
        
    return res.status(200).json({count,page,limit,invoices})
});

export const getAllOrders = asyncHandler(async(req ,res )=>{
    const { limit,skip,page} = req.pagination;
    const { email,subTotal_lte,subTotal_gte,grandTotal_lte,grandTotal_gte,isPaid,sort } = req.query;
    const match :any= {
        $match:{
            $and:[]
        }
    };
    const sortObj : any = {
        $sort:{
            createdAt:-1
        }
    }
    if(sort && (sort === "subTotal_desc" || sort === "subTotal_asc" || sort === "grandTotal_desc" || sort === "grandTotal_asc" )){
        if(sort === "subTotal_desc"){
            sortObj.$sort = {subTotal:-1}
        }
        if(sort === "subTotal_asc"){
            sortObj.$sort = {subTotal:1}
        }
        if(sort === "grandTotal_asc"){
            sortObj.$sort = {grandTotal:1}
        }
        if(sort === "grandTotal_desc"){
            sortObj.$sort = {grandTotal:-1}
        }
    }
    
    if(isPaid && (isPaid === "false" || isPaid === "true")){
        match.$match.$and.push({isPaid : isPaid === "true" ? true : false });
    }

    if(subTotal_gte || subTotal_lte){
        match.$match.$and.push({subTotal : { $gte:Number(subTotal_gte) || 0,$lte:Number(subTotal_lte) || 9999}});
    }
    if(grandTotal_gte || grandTotal_lte){
        match.$match.$and.push({grandTotal : { $gte:Number(grandTotal_gte) || 0,$lte:Number(grandTotal_lte) || 9999}});
    }
    
    if(email){
        match.$match.$and.push({"user.email" : { $regex: new RegExp(email as string,"i") }});
    }
    
    const lookup :any = {
        $lookup:{
            localField:"userId",
            foreignField:"_id",
            from:"users",
            as:"user"
        }
    }
    
    const aggregatePipeline : any[]= [
        lookup,
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
    const isFiltered = subTotal_gte || subTotal_lte || grandTotal_gte || grandTotal_lte || email
    if(isFiltered){
        console.log("first")
        // Add after lookup so we have access to user's email
        aggregatePipeline.splice(1,0,match);
    }
    
    const orders = await Order.aggregate([
        ...aggregatePipeline
    ]);
    
    const countAggregatePipeline = [lookup];
    if(isFiltered){
        countAggregatePipeline.push(match);
    }

    const [{subTotal:count}] = await Order.aggregate(countAggregatePipeline).count("subTotal");
    
    return res.status(200).json({count,page,limit,orders})
})

export const getAllUsers = asyncHandler(async (req, res)=>{
    const {limit,page,skip} = req.pagination;
    const { sort, email, name, mobileNumber } : IFilterAndSortAllUsers = req.query;

    const sortQuery :ISortQuery = {createdAt:-1};
    if(sort){
        if(sort["createdAt"]){
            if(sort["createdAt"] === "asc"){
                sortQuery.createdAt = 1
            }
        }
        
        if(sort["email"]){
            if(sort["email"] === "desc"){
                sortQuery.email = -1
            }else if(sort["email"] === "asc"){
                sortQuery.email = 1
            }
        }
        if(sort["name"]){
            if(sort["name"] === "desc"){
                sortQuery.name = -1
            }else if(sort["name"] === "asc"){
                sortQuery.name = 1
            }
        }
    }

    const matchStage : IUsersMatchStage = {}
    if(email){
        matchStage.email = email;
    }
    if(name){
        matchStage.name = name;
    }
    if(mobileNumber){
        matchStage.mobileNumber = mobileNumber;
    }
    
    const users = await User.find(matchStage,{__v:0},{
        sort:sortQuery,
        limit:limit,
        skip:skip,
    }).lean();
    const count = await User.countDocuments(matchStage).lean();

    return res.status(200).json({count,page,limit,users})
});

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