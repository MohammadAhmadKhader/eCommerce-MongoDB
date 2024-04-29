import User from "../models/user";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";

export const createNewAddress = asyncHandler( async (req ,res ,next)=>{
    const {fullName,mobileNumber,pinCode,streetAddress,city,state,userId} = req.body
        
    const userAfterChanges = await User.findOneAndUpdate(
        { _id : userId },
        { $push : { addresses : {
            pinCode,
            state,
            mobileNumber,
            fullName,
            streetAddress,
            city,
        } } },{
            new:true,select:"-password -__v"
        }
    )

    return res.status(201).json({message:"success",user:userAfterChanges})
})

export const editAddress = asyncHandler( async (req, res, next)=>{
    const {fullName,mobileNumber,pinCode,streetAddress,city,state,addressId} = req.body // addressId => to url 
    const user = req.user;

    const addressIndex = user.addresses.findIndex((address: any) => address._id == addressId);
        
    if (addressIndex === -1) {
        const error = new AppError("Address was not found.",400);
        return next(error);
    }

    const userAfterChange = await User.findOneAndUpdate(
        { _id : user._id },
        { $set : { 
            "addresses.$[elem].pinCode": pinCode,
            "addresses.$[elem].state": state,
            "addresses.$[elem].mobileNumber": mobileNumber,
            "addresses.$[elem].fullName": fullName,
            "addresses.$[elem].streetAddress": streetAddress,
            "addresses.$[elem].city": city,
        }}
        ,{
            arrayFilters:[{
                "elem._id":addressId
            }],
            new:true,select:"-password -__v",
        }               
    )
    
    return res.status(200).json({message:"success",user:userAfterChange}) 
})

export const deleteAddress = asyncHandler( async (req, res, next)=>{
    const {addressId} = req.body; // => to url
    const user = req.user;
    const addressIndex = user.addresses.findIndex((address: any) => address._id == addressId);
        
    if (addressIndex === -1) {
        const error = new AppError("Address was not found.",400);
        return next(error);
    }

    const userAfterDeletion = await User.findOneAndUpdate(
        {_id:user._id},
        {  $pull: { addresses :{_id:addressId} }},
        { new:true,select:"-password -__v"}
    )
    
    return res.status(202).json({message:"success",user:userAfterDeletion})
})