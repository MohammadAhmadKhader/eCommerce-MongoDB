import {  NextFunction,Request,Response, } from 'express';
import AppError from '../utils/AppError';
import Joi from 'joi';
import {Error as mongooseError} from 'mongoose';

const errorController = ((error : any ,req : Request,res : Response,next : NextFunction)=>{
    error.statusCode = error.statusCode || 500;

    if((process.env.NODE_ENV as string).trim() === "development"){
        developmentErrors(res,error)
    }else if((process.env.NODE_ENV as string).trim() === "production"){

        if(error.name === "CastError"){
            error = castingErrorHandler(error);
        }
        if(error.name === "BSONError"){
            error = bsonErrorHandler();
        }
        if(error.code === 11000){
            error = duplicateKeyErrorHandler(error);
        }
        
        if(error.name === "TokenExpiredError"){
            error = tokenExpiredErrorHandler();
        }
        
        if(error.name === "JsonWebTokenError" && error.message === "invalid signature"){
            error = malformedTokenErrorHandler();
        }
        
        if(error instanceof mongooseError && error.name == "ValidationError"){
            error = mongooseValidationErrorHandler(error)
        }

        if(error.name === "ValidationError"){
            error = validationErrorHandler(req,error);
        }

        productionErrors(res,error)
    }
})

const castingErrorHandler = (error : any)=>{
    const message = `Invalid value for ${error.path} : ${error.value}`;
    return new AppError(message,400)
}

const bsonErrorHandler = () =>{
    const message = `Invalid value for Id`;
    return new AppError(message,400)
}

const duplicateKeyErrorHandler = (error : any)=>{
    const keyName = Object.keys(error.keyValue);
    const email = error.keyValue.email;
    const message = `This ${keyName} ${email} already exist, please try another one!`
    return new AppError(message,400);
}

const mongooseValidationErrorHandler = (error : mongooseError)=>{
    const message = error.message.split(":")[2].replace(" ","");
    console.log(message)
    return new AppError(message,400);
}


const tokenExpiredErrorHandler = ()=>{
    const message = 'Your session has expired. Please log in again.'
    return new AppError(message,401);
}

const malformedTokenErrorHandler = ()=>{
    const message ="Invalid token. Please provide a valid token.";
    return new AppError(message,401);
}

export const validationErrorHandler = (req : Request,error: Joi.ValidationError)=>{
    const errorMessages = error.details.map((detail) => detail.message.replace(/["']/g,''));
    let isBehaviorSuspicious = false;
    
    if(req.validationError){
        req.validationError.blacklistedKeys.forEach((blacklistedKey)=>{
            errorMessages.forEach((errorMessage)=>{
                if(errorMessage.includes(blacklistedKey)){
                    isBehaviorSuspicious = true;
                } 
            })
        })
    }
    
    if(isBehaviorSuspicious){
        return new AppError("Something went wrong please try again later!",500);
    }
    return new AppError(errorMessages[0],400);
}

const productionErrors = (res : Response,error : any)=>{
    if(error.isOperational){
        res.status(error.statusCode).json({
            status:error.statusCode,
            message:error.message
        })
    }else{
        res.status(500).json({
            status:500,
            message:"Something went wrong please try again later!"
        })
    }
}

const developmentErrors = (res:  Response ,error: any)=>{
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
      stackTrace: error.stack,
      error: error
    }) 
}


export default errorController;