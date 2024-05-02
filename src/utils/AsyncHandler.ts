import { NextFunction,Request,Response } from "express";

export function asyncHandler(func : (req:Request,res:Response,next:NextFunction) => any){
    return async (req:Request,res:Response,next:NextFunction)=>{
        await func(req,res,next).catch((error : any) => next(error));
    }
}