import User from "../models/user";
import bcrypt from "bcrypt"
import SessionToken from "../models/sessionToken";
import MailUtils from "../utils/MailUtils";
import ResetPassCode from "../models/resetPassCode";
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { IMulterFile, IUser } from "../@types/types";
import { signToken } from "../utils/HelperFunctions";
import crypto from 'crypto';
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";

export const signUp =asyncHandler( async (req, res)=>{
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
})

export const signIn = asyncHandler(async (req, res ,next)=>{
    const { email,password } = req.body;
    if(!email || !password){
        return res.sendStatus(401)
    }
        
    const user = await User.findOne({email:email},{},{select:"+password"})
         
    if(!user || !(await bcrypt.compare(password,user.password))){
        const error = new AppError("Invalid email or password",401)
        return next(error);
    }
        
    const token = signToken(user._id.toString(),user.email)
        
    const sessionToken = await SessionToken.findOneAndUpdate({
        userId:user._id,
    },{
        userId:user._id,
        token:token
    },{upsert:true,new:true})
        
    user.$set("password",undefined)

    return res.status(200).json({message:"success",user,token:sessionToken.token})
}) 

export const getUserByToken = asyncHandler(async(req, res)=>{
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
})

export const logout = asyncHandler( async (req, res)=>{
    const userId = req.user._id;
    const sessionId = req.headers.authorization;
    await SessionToken.deleteOne({
        userId:userId,
        token:sessionId
    })

    return res.sendStatus(204);
})


export const changePassword = asyncHandler(async (req, res, next)=>{
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;
    const user : IUser = await User.findOne({_id:userId}).select("+password");
        
    if(!await bcrypt.compare(oldPassword,user.password)){
        const error = new AppError("Invalid password",401);
        return next(error);
    }
        
    await User.findOneAndUpdate({_id:userId},{
        password:await bcrypt.hash(newPassword,10)
    })

    const token = signToken(user._id.toString(),user.email)
        
    await SessionToken.findOneAndUpdate({
        userId:user._id,
    },{
        token:token
    },{
        upsert:true,
        new:true
    })

    return res.status(200).json({message:"success",token})
})

export const changeUserInformation = asyncHandler(async(req, res, next)=>{
    const userId = req.user._id;
    const {email,firstName,lastName,mobileNumber,birthdate,userImg : deleteUserImage} = req.query;
    const userImageAsBinary = req.file;
    
    const user = await User.findOneAndUpdate(
        {_id:userId},
        { 
            email,
            firstName,
            lastName,
            mobileNumber,
            birthdate:birthdate,
            userImg: userImageAsBinary ? await CloudinaryUtils.UploadOne(userImageAsBinary as IMulterFile,process.env.UsersImages as string,400,400) : deleteUserImage == "deleteImg" ? null : undefined
        },{
            new:true,select:"-password -__v"
        }
    );

    if(deleteUserImage == "deleteImg"){
        try{
            await CloudinaryUtils.DeleteOne(user!.userImg,process.env.UsersImages as string);
        }catch(err){
            console.error(err)
            const error = new AppError(`Something went wrong during image update user image`,400);
            return next(error);
        }   
    }
        
    return res.status(200).json({message:"success",user})
})      

export const resetPasswordViaCode = asyncHandler(async (req, res, next)=>{
    const {newPassword,confirmedNewPassword} = req.body;
    const token = req.params.token;
    const code = await ResetPassCode.findOne(
        {
            code:token,
            expiredAt:{
                $gt:Date.now()
            }
        })
    if(!code){
        const error = new AppError("Wrong token or it has expired",403);
        return next(error);
    }
        
    const updateUserPassword = await User.findOneAndUpdate({_id:code.userId},{
        password:await bcrypt.hash(newPassword,10)
    })
    
    // mongoDB will convert timestamps into actual date
    //@ts-expect-error
    updateUserPassword.passwordChangedAt = Date.now();
    await updateUserPassword!.save()
    // To ensure none use the token again
    code.code = undefined;
    await code.save()
    return res.status(200).json({message:"success"})
    
})

export const forgotPassword = asyncHandler( async (req, res, next)=>{
    const {email} = req.body;
    const user = await User.findOne({email:email})
    if(!user){
        const error = new AppError("The requested username is unavailable",400);
        return next(error);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetCode = await ResetPassCode.create({
        userId:user._id,
        code:resetToken,
    });
    
    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    try{
        await MailUtils.SendToResetPassword(email,resetUrl as string);
        return res.status(202).json({
            message:"success",
        })
    }catch(err){
        console.error(err);
        resetCode.code = undefined;
        await resetCode.save();
        const error = new AppError("Something went wrong during sending reset password message",400);
        return next(error);
    }
})

export const verifyResetPasswordToken = asyncHandler(async (req, res, next)=>{
    const {token} = req.params;
    if(!token){
        const error = new AppError("Invalid request. Please try again.",400);
        return next(error);
    }
    const storedToken = await ResetPassCode.findOne({code:token});
    if(!storedToken){
        const error = new AppError("Invalid token. Please make sure you've entered the correct token.",400);
        return next(error);
    }

    return res.status(200).json({message:"success"})
})