import { Request,Response,NextFunction } from "express";
import AppError from "../utils/AppError";

export const authorizeUserInfoUpdate = async (req:Request,res:Response,next:NextFunction)=>{
    const user = req.user;
    const lastUpdate = user.updatedAt;
    const now = new Date();
    const week = 7 * 24 * 60 * 60 * 1000;
    
    if(((now.getTime() - lastUpdate.getTime()) < week) && user.role != "admin"){
        const error = new AppError("Normal User only allowed to change his information once per week",400)
        return next(error);
    } 
    return next()
}