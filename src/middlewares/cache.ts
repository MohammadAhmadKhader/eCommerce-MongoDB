import { Response,Request, NextFunction } from "express";
import redis from "../config/Redis";

export async function getCache(req:Request,res:Response,next:NextFunction){
    try{
      const cache = await redis.get(req.url);
      
      if(!cache){
       return next();
      }
      console.log("Cache returned successfully")
      return res.status(200).json(JSON.parse(cache))

    }catch(error){
        console.error(error);
       return next();
    }
}

export async function setCache(cacheKey : string,value : string | Buffer){
    try{
      const cachedValue = await redis.set(cacheKey,value);
      return cachedValue;
    }catch(error){
        console.error(error);
    }
}