import User from "../models/user";
import bcrypt from "bcrypt"
import SessionToken from "../models/sessionToken";
import MailUtils from "../utils/MailUtils";
import ResetPassCode from "../models/resetPassCode";
import CloudinaryUtils from "../utils/CloudinaryUtils";
import { IFilterAndSortAllUsers, ISortQuery, IUser, IUsersMatchStage } from "../@types/types";
import { signToken } from "../utils/HelperFunctions";
import crypto from 'crypto';
import { asyncHandler } from "../utils/AsyncHandler";
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
    // TODO 1- Authenticate token before 2- Send message when its expired to re-sign-in
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
});


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
    const count = await User.countDocuments(matchStage);

    return res.status(200).json({count,page,limit,users})
});

export const deleteUserById = asyncHandler(async (req, res, next)=>{
    const {userId} = req.body;
    
    const deleteUser = await User.deleteOne({_id:userId}).lean();
    if(deleteUser.deletedCount !== 1){
        const error = new AppError("User was not found.",400);
        return next(error);
    }
    
    return res.sendStatus(204);
});

export const logout = asyncHandler( async (req, res)=>{
    const userId = req.user._id;
    const sessionId = req.headers.authorization;
    await SessionToken.deleteOne({
        userId:userId,
        token:sessionId
    })

    return res.sendStatus(204);
});


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
    const {email,firstName,lastName,mobileNumber,birthdate,userImg : deleteUserImage} = req.body;
    const image = req.file as Express.Multer.File;

    const user = await User.findOneAndUpdate(
       {_id:userId},
        { 
            email,
            firstName,
            lastName,
            mobileNumber,
            birthdate:birthdate,
            userImg: image ? (await CloudinaryUtils.UploadOne(image.buffer,process.env.UsersImages as string,{width:400,height:400}))?.secure_url : deleteUserImage == "deleteImg" ? null : undefined
        },{
            new:true,select:"-password -__v"
        }
    );
       
    if(deleteUserImage == "deleteImg"){
        try{
            await CloudinaryUtils.DeleteOne(user!.userImg,process.env.UsersImages as string);
        }catch(err){
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