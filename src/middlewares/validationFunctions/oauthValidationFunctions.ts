import { NextFunction, Request, Response } from "express";
import {tokenIdSchema} from "../validationSchemas/oauthValidationSchemas"

export const validateOAuthTokenId = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = tokenIdSchema.validate({
        tokenId:req.headers.authorization,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["tokenId"]}
        return next(error);
    }
    return next()
}