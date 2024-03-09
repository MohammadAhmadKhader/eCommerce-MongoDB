import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt"
import SessionToken from "../models/sessionToken";
import crypto from "crypto"
import MailUtils from "../utils/MailUtils";
import ResetPassCode from "../models/resetPassCode";
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { IMulterFile } from "../@types/types";

export const signUp = async (req:Request,res:Response)=>{
    try{
        const { firstName,lastName,email,password } = req.body;
        const hashPassword = bcrypt.hashSync(password,10);
        console.log(bcrypt.compareSync(password,hashPassword))
        
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashPassword
        })
        user.$set("password",undefined);
        user.$set("__v",undefined);

        return res.status(201).json({message:"success",user})
    }catch(error : any){
        
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({error})
    }
}

export const singIn = async (req:Request,res:Response)=>{
    try{
        const { email,password } = req.body;
        if(!email || !password){
            return res.sendStatus(401)
        }
        const user = await User.findOne({email:email})
        if(!user || !await bcrypt.compare(password,user.password)){
            return res.status(401).json({error:"Invalid email or password"})
        }

        const deleteOldSession = await SessionToken.deleteOne({
            userId:user._id
        })

        const sessionToken = await SessionToken.create({
            userId:user._id,
            token:crypto.randomBytes(32).toString('hex')
        })
        user.$set("password",undefined)

        return res.status(200).json({user,token:sessionToken.token})
    }catch(error){
        return res.status(500).json({error})
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
    }catch(error){
        return res.status(500).json({error})
    }
}

export const changePassword = async (req:Request,res:Response)=>{
    try{
        const { oldPassword, newPassword ,userId} = req.body;
        if(!userId){
            return res.status(400).json({error:"User Id is required"});
        }

        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({error:"User was not found"});
        }
        if(!bcrypt.compareSync(oldPassword,user.password)){
            return res.status(400).json({error:"Invalid password"})
        }
        const updateUser = await User.findByIdAndUpdate(userId,{
            password:bcrypt.hashSync(newPassword,10)
        })
        if(!updateUser){
            return res.status(400).json({error:"Something went wrong during password update"});
        }
        
        return res.status(200).json({message:"success"})
    }catch(error){
        return res.status(500).json({error})
    }
}

export const changeUserInformation = async(req:Request,res:Response)=>{
    try{
        const userId = req.params.userId;
        const {email,firstName,lastName,mobileNumber,birthdate} = req.body;
        const userImg = req.file;

        const user = await User.findOneAndUpdate(
            {_id:userId},
            { 
                email,
                firstName,
                lastName,
                mobileNumber,
                birthdate,
                userImg: userImg ? await CloudinaryUtils.UploadOne(req.file as IMulterFile,process.env.UsersImages as string,400,400) : undefined
            },{
                new:true,select:"-password -__v"
            }
        );
        
        return res.status(200).json({message:"success",user})       
    }catch(error){
        return res.status(500).json({error})
    }
}

export const verifyCode = async (req:Request,res:Response)=>{
    try{
        const {email,userId} = req.body;
        const user = await User.findById(userId);
        if(!user || user.email !== email){
            return res.status(400).json({message:"Invalid user"})
        }

        await MailUtils.SendToResetPassword(email,userId)
        return res.status(200).json({message:"success"})       
    }catch(error){
        return res.status(500).json({error})
    }
}

export const resetPasswordViaCode = async (req:Request,res:Response)=>{
    try{
        const {newPassword,confirmNewPassword,userId} = req.body;
        if(newPassword !== confirmNewPassword){
            return res.status(400).json({error:"Password Must Match"})
        }
        const code = await ResetPassCode.findOne({userId})
        if(!code){
            return res.status(403).json({error:"There is no code for you"})
        }
        const updateUserPassword = await User.findByIdAndUpdate(userId,{
            password:bcrypt.hashSync(newPassword,10)
        })
        if(!updateUserPassword){
            return res.status(400).json({error:"Something went wrong"})
        }

        return res.status(200).json({message:"success"})
    }catch(error){
        return res.status(500).json({error})
    }
}