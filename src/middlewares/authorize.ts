import { Request,Response,NextFunction } from "express";
import User from "../models/user";
export const authorizeUserInfoUpdate = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        let userId = req.body.userId
        if(!userId){
            userId = req.params.userId
        }
        const user = await User.findOne({_id:userId})
        if(!user){
            return res.status(400).json({error:"User was not found"})
        }
        const lastUpdate = user.updatedAt;
        const now = new Date()
        const week = 7 * 24 * 60 * 60 * 1000;
        
        if(now.getTime() - lastUpdate.getTime() < week && user.role != "admin"){
            return res.status(400).json({error:"Normal User only allowed to change his information once per week max"})
        } 
        return next()
    }catch(error){
        console.log(error);
        return res.sendStatus(500)
    }
}