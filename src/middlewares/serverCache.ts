import { NextFunction, Request, Response } from "express";
import { getServerCache as fetchCache } from "../utils/ServerCache";

export function getServerCache(keyName:string){
    return (req:Request,res:Response,next:NextFunction)=>{
        const cache = fetchCache(keyName);

        if(cache){
            return res.status(200).json({[keyName]:cache})
        }
        next()
    }
    
}