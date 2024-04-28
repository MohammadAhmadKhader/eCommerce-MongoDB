import { NextFunction,Request,Response } from "express";

export function asyncHandler(func : (req:Request,res:Response,next:NextFunction) => any){
    return(req:Request,res:Response,next:NextFunction)=>{
        func(req,res,next).catch((error : any) => next(error));
    }
}