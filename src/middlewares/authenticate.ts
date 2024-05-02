import SessionToken from "../models/sessionToken";
import User from "../models/user";
import jwt from "jsonwebtoken";
import util from "util"
import { IDecodedToken } from "../@types/types";
import { asyncHandler } from "../utils/AsyncHandler";
import AppError from "../utils/AppError";

export const authenticateUser = asyncHandler(async (req, res, next)=>{
    const sessionId = req.headers.authorization;
    if(!sessionId){
        const error = new AppError("Unauthorized - Session id is not provided",401);
        return next(error);
    }
    
    let error : any;
    // getting error here for having the second parameter saying we must have only on parameter inside this function which is wrong
    // not just wrong but also return an error and against the documentation and does not make sense.
    //@ts-expect-error
    const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(sessionId,process.env.TOKEN_SECRET as string)
    .catch((err)=>{
        error = err
    })

    if(error){
        return next(error)
    }

    const session = await SessionToken.findOne({
        token:sessionId,userId:decodedToken.id ? decodedToken.id : ""
    })
    
    const user = await User.findOne({_id:decodedToken.id})
    if(!user || !session){
        const error = new AppError("Unauthorized",401);
        return next(error);
    }
    
    if(await user.isPasswordHasChanged(decodedToken.iat)){
        const error = new AppError("Unauthorized password has changed",401);
        return next(error);
    }

    req.user = user;
    return next()
})

export const authenticateAdmin = asyncHandler( async (req, res, next)=>{
    const sessionId = req.headers.authorization;
        
    if(!sessionId){
        const error = new AppError("Unauthorized - Session id is not provided",401);
        return next(error);
    }
    let error : any;
    const test = util.promisify(jwt.verify);
    //@ts-expect-error
    const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(sessionId,process.env.TOKEN_SECRET as string).catch((err)=>{
        error = err
    });

    if(error){
        return next(error)
    }
    
    const user = await User.findOne({_id:decodedToken.id});
    
    if(!user || user.role != "admin"){
        const error = new AppError("Unauthorized",401);
        return next(error);
    }

    const session = await SessionToken.findOne({
        token:sessionId,userId:decodedToken.id ? decodedToken.id : ""
    })
    
    if(!session){
        const error = new AppError("Unauthorized",401);
        return next(error);
    }
    
    req.user = user;
    return next()
})
