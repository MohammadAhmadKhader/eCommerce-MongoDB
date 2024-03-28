import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt"
import SessionToken from "../models/sessionToken";
import MailUtils from "../utils/MailUtils";
import ResetPassCode from "../models/resetPassCode";
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { IMulterFile } from "../@types/types";
import { signToken } from "../utils/HelperFunctions";
import crypto from 'crypto';

export const signUp = async (req:Request,res:Response)=>{
    try{
        const { firstName,lastName,email,password } = req.body;
        const hashPassword = bcrypt.hashSync(password,10);
        
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashPassword
        })

        const token = signToken(user._id.toString(),user.email)
        user.$set("password",undefined);
        user.$set("__v",undefined);
        
        const sessionToken = await SessionToken.create({
            userId:user._id,
            token:token
        })

        return res.status(201).json({message:"success",user,token:sessionToken.token})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const signIn = async (req:Request,res:Response)=>{
    try{
        const { email,password } = req.body;
        if(!email || !password){
            return res.sendStatus(401)
        }
        
        const user = await User.findOne({email:email},{},{select:"+password"})
         
        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({error:"Invalid email or password"})
        }

        const deleteOldSession = await SessionToken.deleteOne({
            userId:user._id
        })
        
        const token = signToken(user._id.toString(),user.email)
        
        const sessionToken = await SessionToken.create({
            userId:user._id,
            token:token
        })
        user.$set("password",undefined)

        return res.status(200).json({message:"success",user,token:sessionToken.token})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const getUserByToken = async(req:Request,res:Response)=>{
    try{
        const token = req.headers.authorization;
        const sessionToken = await SessionToken.findOne({
            token:token
        })
        if(!sessionToken){
            return res.sendStatus(401)
        }
        
        const user = await User.findOne({
            _id:sessionToken.userId
        },{password:0})
        
        if(!user){
            return res.sendStatus(401)
        }

        return res.status(200).json({user})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const logout = async (req:Request,res:Response)=>{
    try{
        const {userId} = req.body;
        
        const deleteOldSession = await SessionToken.deleteOne({
            userId:userId
        })
        if(deleteOldSession.deletedCount == 0){
            return res.status(400).json({error:"Something went wrong during token deletion, token was not deleted"});
        }
        return res.sendStatus(204)
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const changePassword = async (req:Request,res:Response)=>{
    try{
        const { oldPassword, newPassword ,userId} = req.body;
       
        if(!userId){
            return res.status(400).json({error:"User Id is required"});
        }
       
        const user = await User.findById(userId).select("+password")
        
        if(!user){
            return res.status(400).json({error:"User was not found"});
        }
        
        if(!await bcrypt.compare(oldPassword,user.password)){
            return res.status(400).json({error:"Invalid password"})
        }
        
        const updateUser = await User.findByIdAndUpdate(userId,{
            password:await bcrypt.hash(newPassword,10)
        })
        if(!updateUser){
            return res.status(400).json({error:"Something went wrong during password update"});
        }
        const token = signToken(user._id.toString(),user.email)
        
        const sessionToken = await SessionToken.findOneAndUpdate({
            userId:user._id,
        },{
            token:token
        })

        return res.status(200).json({message:"success",token})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const changeUserInformation = async(req:Request,res:Response)=>{
    try{
        const userId = req.params.userId;
        const {email,firstName,lastName,mobileNumber,birthdate,userImg : deleteUserImage} = req.body;
        const userImageAsBinary = req.file;
        
        const user = await User.findOneAndUpdate(
            {_id:userId},
            { 
                email,
                firstName,
                lastName,
                mobileNumber,
                birthdate,
                userImg: userImageAsBinary ? await CloudinaryUtils.UploadOne(userImageAsBinary as IMulterFile,process.env.UsersImages as string,400,400) : deleteUserImage ? null : undefined
            },{
                new:true,select:"-password -__v"
            }
        );

        if(!user){
            return res.status(400).json({error:"User was not found"})
        }

        if(deleteUserImage == "deleteImg"){
            try{
                await CloudinaryUtils.DeleteOne(user.userImg,process.env.UsersImages as string);
            }catch(error){
                console.error(error);
                return res.status(400).json({error:"Something Went Wrong Please Try Again Later"});
            }   
        }
        
        return res.status(200).json({message:"success",user})       
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const resetPasswordViaCode = async (req:Request,res:Response)=>{
    try{
        const {newPassword,confirmedNewPassword} = req.body;
        
        if(!newPassword || !confirmedNewPassword){
            return res.status(400).json({error:"Missing Password"});
        }
        if(newPassword !== confirmedNewPassword){
            return res.status(400).json({error:"Password Does Not Match"});
        }
        const token = req.params.token;
        const code = await ResetPassCode.findOne(
            {
                code:token,
                expiredAt:{
                    $gt:Date.now()
                }
            })
        if(!code){
            return res.status(403).json({error:"Wrong token or it has expired"})
        }
        const updateUserPassword = await User.findOneAndUpdate({_id:code.userId},{
            password:await bcrypt.hash(newPassword,10)
        })
        if(!updateUserPassword){
            return res.status(400).json({error:"Something Went Wrong Please Try Again Later"})
        }
        // mongoDB will convert timestamps into actual date
        //@ts-expect-error
        updateUserPassword.passwordChangedAt = Date.now();
        await updateUserPassword.save()
        // To ensure none use the token again
        code.code = undefined;
        await code.save()
        return res.status(200).json({message:"success"})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const forgotPassword = async (req:Request,res:Response)=>{
    try{
        const {email} = req.body;
        const user = await User.findOne({email:email})
        if(!user){
            return res.sendStatus(401)
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetCode = await ResetPassCode.create({
            userId:user?._id,
            code:resetToken,
        })
        if(!resetCode || !resetCode.code){
            return res.status(200).json({error:"Something Went Wrong Please Try Again"})
        }
        
        const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

        try{
            await MailUtils.SendToResetPassword(email,resetUrl as string);
            return res.status(202).json({
                message:"success",

            })
        }catch(error){
            console.error(error);
            resetCode.code = undefined;
            await resetCode.save();
            return res.status(500).json({error});
        }
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const verifyResetPasswordToken = async (req:Request,res:Response)=>{
    try{
        const {token} = req.params;
        if(!token){
            return res.status(400).json({error:"Something Went Wrong"});
        }
        const storedToken = await ResetPassCode.findOne({code:token});
        if(!storedToken){
            return res.status(400).json({error:"Token was not found"})
        }

        return res.status(200).json({message:"success"})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}