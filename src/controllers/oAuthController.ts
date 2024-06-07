import SessionToken from "../models/sessionToken";
import User from "../models/user";
import AppError from "../utils/AppError";
import { asyncHandler } from "../utils/AsyncHandler";
import { getOAuthGoogleUserData, handleUserNameGoogleSignUp, signToken } from "../utils/HelperFunctions";

export const signInUsingOAuthGoogle = asyncHandler(async (req,res,next)=>{
    const tokenId = req.headers.authorization as string;
    const {payload} = await getOAuthGoogleUserData(tokenId);
    if(!payload){
        const error = new AppError("Something went wrong please try again later!",400);
        return next(error);
    }

    const user = await User.findOne({email:payload?.email}).lean();
    if(!user){
        return res.status(200).json({message:"User not found. Please sign up to create a new account."})
    }

    const token = signToken(user._id.toString(),user.email);
    const sessionToken = await SessionToken.findOneAndUpdate({
        userId:user._id,
    },{
        userId:user._id,
        token
    },{upsert:true,new:true}).lean();
    
    return res.status(200).json({message:"success",user,token:sessionToken.token})
})

export const signUpUsingOAuthGoogle = asyncHandler(async (req,res,next)=>{
    const tokenId = req.headers.authorization as string;
    const {payload} = await getOAuthGoogleUserData(tokenId);
    if(!payload){
        const error = new AppError("Something went wrong please try again later!",400);
        return next(error);
    }
    
    if(!payload?.email_verified){
        const error = new AppError("Your google email is not verified!",400);
        return next(error);
    }
    const userEmail = payload.email;
    const isUserExist = await User.findOne({email:userEmail}).lean();
    if(isUserExist){
        const error = new AppError("You already registed",400);
        return next(error);
    }

    const {firstName,lastName} = handleUserNameGoogleSignUp(payload?.name,userEmail as string);
    // custom validation because we are not going to save password.
    // we will accept whatever its account on google.
    const newUser = new User({
        email:userEmail,
        firstName,
        lastName,
    });

    newUser.$ignore("password");
    newUser.$ignore("lastName");
    await newUser.save();
    
    const token = signToken(newUser._id.toString(),newUser.email);
    const sessionToken = await SessionToken.create({
        userId:newUser._id,
        token,
    });
    
    return res.status(200).json({message:"success",user:newUser,token:sessionToken.token})
})