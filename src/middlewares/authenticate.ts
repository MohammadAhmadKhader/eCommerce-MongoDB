import { Request,Response,NextFunction } from "express";
import SessionToken from "../models/sessionToken";
import User from "../models/user";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import util from "util"
import { IDecodedToken } from "../@types/types";

export const authenticateUser = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const sessionId = req.headers.authorization;
        if(!sessionId){
            return res.status(401).json({error:"Unauthorized - Session id is not provided"});
        }
        
        // getting error here for having the second parameter saying we must have only on parameter inside this function which is wrong
        // not just wrong but also return an error and against the documentation and does not make sense.
        //@ts-expect-error
        const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(sessionId,process.env.TOKEN_SECRET as string)
        
        const session = await SessionToken.findOne({
            token:sessionId,userId:decodedToken.id ? decodedToken.id : ""
        })

        const user = await User.findOne({_id:decodedToken.id})
        if(!user || !session){
            return res.sendStatus(401)
        }
        if(await user.isPasswordHasChanged(decodedToken.iat)){
            return res.status(401).json({error:"Unauthorized password has changed"})
        }

        req.user = user;
        return next()
    }catch(error){
        console.error(error);
        return res.sendStatus(500)
    }
}

export const authenticateAdmin = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const sessionId = req.headers.authorization;
        
        if(!sessionId){
            return res.status(401).json({error:"Unauthorized - Session id is not provided"});
        }
        //@ts-expect-error
        const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(sessionId,process.env.TOKEN_SECRET as string)
        const user = await User.findOne({_id:new ObjectId(decodedToken.id)});
        
        if(!user || user.role != "admin"){
            return res.sendStatus(401)
        }
        const session = await SessionToken.findOne({
            token:sessionId,userId:decodedToken.id ? decodedToken.id : ""
        })
        if(!session){
            return res.sendStatus(401)
        }

        req.user = user;
        return next()
    }catch(error){
        console.error(error);
        return res.sendStatus(500)
    }
}
