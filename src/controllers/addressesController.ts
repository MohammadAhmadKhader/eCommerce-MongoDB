import {NextFunction, Request,Response} from "express"
import User from "../models/user";

export const createNewAddress = async (req:Request,res:Response,next:NextFunction)=>{
    try{
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
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const editAddress = async (req:Request,res:Response)=>{
    try{
        const {fullName,mobileNumber,pinCode,streetAddress,city,state,userId,addressId} = req.body
        
        const userAfterChange = await User.findOneAndUpdate(
            { _id : userId },
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
                new:true,select:"-password -__v"
            }
                        
        )

        return res.status(200).json({message:"success",user:userAfterChange})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const deleteAddress = async (req:Request,res:Response)=>{
    try{
        const {userId,addressId} = req.body;
        const user = req.user;
        const addressIndex = user.addresses.findIndex((address: any) => address._id == addressId);
        
        if (addressIndex === -1) {
            return res.status(400).json({error:"Address does not exist"})
        }

        const userAfterDeletion = await User.findOneAndUpdate(
            {_id:userId},
            {  $pull: { addresses :{_id:addressId} }},
            { new:true,select:"-password -__v"}
        )
        
        
       
        return res.status(202).json({message:"success",user:userAfterDeletion})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}