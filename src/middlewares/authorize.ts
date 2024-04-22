import { Request,Response,NextFunction } from "express";

export const authorizeUserInfoUpdate = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const user = req.user;
        const lastUpdate = user.updatedAt;
        const now = new Date()
        const week = 7 * 24 * 60 * 60 * 1000;
        
        if(now.getTime() - lastUpdate.getTime() < week && user.role != "admin"){
            return res.status(400).json({error:"Normal User only allowed to change his information once per week"})
        } 
        return next()
    }catch(error){
        console.log(error);
        return res.sendStatus(500)
    }
}