
import { Request } from "express"
import { validationErrorHandler } from "../../controllers/errorController"
import Joi from "joi"
import AppError from "../../utils/AppError";
jest.mock("../../utils/AppError")

const errorWithBlackListedKey = {
    details : [
        {
            message: "productId is required",
            path: [],
            type: 'any.required',
            context: {},
        },
        {
            message: "cartItemId is required",
            path: [],
            type: 'any.required',
            context: {},
        },
        {
            message: "operation is required",
            path: [],
            type: 'any.required',
            context: {},
        },
    ]
}

const errorWithNoBlackListedKey = {
    details : [
        {
            message: "operation is required",
            path: [],
            type: 'any.required',
            context: {},
        },
    ]
}

describe("Validation error handler",()=>{
    it("Should return a generic error with status code 500 and message = 'Something went wrong please try again later!' when error with black listed key exist",()=>{
        const req = {
            
        } as Request;

        req.validationError = {blacklistedKeys:["productId"]};
        
        validationErrorHandler(req,errorWithBlackListedKey as unknown as Joi.ValidationError);
        
        expect(AppError).toHaveBeenCalledWith('Something went wrong please try again later!',500);
        expect(AppError).toHaveBeenCalledTimes(1);
    })

    it("Should return a generic error with status code 500 and message = 'Something went wrong please try again later!' when error with more than one black listed key exist",()=>{
        const req = {
            
        } as Request;

        req.validationError = {blacklistedKeys:["productId","cartItemId"]};
        
        validationErrorHandler(req,errorWithBlackListedKey as unknown as Joi.ValidationError);
        
        expect(AppError).toHaveBeenCalledWith('Something went wrong please try again later!',500);
        expect(AppError).toHaveBeenCalledTimes(1);
    })

    it("Should return an error with status code 400 and NOT message = 'Something went wrong please try again later!' when error with NO black listed key exist",()=>{
        const req = {
            
        } as Request;

        req.validationError = {blacklistedKeys:["productId"]};
        
        validationErrorHandler(req,errorWithNoBlackListedKey as unknown as Joi.ValidationError);
        
        expect(AppError).not.toHaveBeenCalledWith('Something went wrong please try again later!',500);
        expect(AppError).toHaveBeenCalledWith(expect.any(String),400);
        expect(AppError).toHaveBeenCalledTimes(1);
    })

    it("Should return an error with status code 400 and NOT message = 'Something went wrong please try again later!' when no blacklistedKeys exist",()=>{
        const req = {
            
        } as Request;
        
        validationErrorHandler(req,errorWithNoBlackListedKey as unknown as Joi.ValidationError);
        
        expect(AppError).not.toHaveBeenCalledWith('Something went wrong please try again later!',500);
        expect(AppError).toHaveBeenCalledWith(expect.any(String),400);
        expect(AppError).toHaveBeenCalledTimes(1);
    })
})