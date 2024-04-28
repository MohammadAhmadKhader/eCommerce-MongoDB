import {  NextFunction,Request,Response, } from 'express';
import AppError from '../utils/AppError';

const errorController = ((error : any ,req : Request,res : Response,next : NextFunction)=>{
    error.statusCode = error.statusCode || 500;
    
    if((process.env.NODE_ENV as string).trim() == "development"){
        developmentErrors(res,error)
    }else if((process.env.NODE_ENV as string).trim() == "production"){
        
        if(error.name === "CastError"){
            error = castingErrorHandler(error);
        }
        if(error.name === "BSONError"){
            error = bsonErrorHandler();
        }
        if(error.code === 11000){
            error = duplicateKeyErrorHandler(error);
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