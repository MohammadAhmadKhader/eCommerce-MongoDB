import { Request,Response,NextFunction } from "express";
import SessionToken from "../models/sessionToken";
import User from "../models/user";
import { ObjectId } from "mongodb";

export const authenticateUser = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const sessionId = req.headers.authorization;
        let userId = req.body.userId
        if(!userId){
            userId = req.params.userId
        }
        
        if(!sessionId){
            return res.status(401).json({error:"Unauthorized - Session id is not provided"});
        }

        const session = await SessionToken.find({
            token:sessionId,userId:userId ? userId : ""
        })
        
        if(!session){
            return res.sendStatus(401)
        }
        
        return next()
    }catch(error){
        console.log(error);
        return res.sendStatus(500)
    }
}

export const authenticateAdmin = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const sessionId = req.headers.authorization;
        const userId = req.params.userId as string;
        const test = req.body['userId']
        console.log(test)
        console.log(userId)

        const user = await User.findOne(new ObjectId(userId));
        console.log(user)
        
        if(!user || user.role != "admin" || !sessionId){
            return res.sendStatus(401)
        }

        const session = await SessionToken.find({
            token:sessionId,userId:userId ? userId : ""
        })
        if(!session){
            return res.sendStatus(401)
        }
        console.log(sessionId,userId)
        return next()
    }catch(error){
        console.log(error);
        return res.sendStatus(500)
    }
}
