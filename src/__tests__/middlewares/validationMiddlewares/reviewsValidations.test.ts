
import { validateDeleteUserReview, validateEditUserReview, validateForgotPassword, validateResetPasswordViaCode, validateUserChangePassword, validateUserRegistration, validateUserReview, validateUserSignIn } from "../../../middlewares/validationsFunctions";
import { emailWith5Char, emailWith64Char, emailWith65Char, emailWith6Char, hexWith24Char, hexWith25Char, stringWith10Char, stringWith24Char, stringWith256Char, stringWith257Char, stringWith25Char, stringWith32Char, stringWith33Char, stringWith3Char, stringWith4Char, stringWith5Char, stringWith65Char, stringWith6Char } from "../../assets/testData/stringTestData";
import { createResponseNext } from "../../utils/helperTestFunctions.test";
import {Request,Response,NextFunction} from "express";

describe("Reviews validation middlewares",()=>{
    describe("Testing user add review to product middle ware",()=>{
        it("Should return an error with all data empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:"",
                    comment:"",
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                    "rating must be one of [1, 2, 3, 4, 5]",
                    "rating must be a number",
                    "comment is not allowed to be empty",
            ]});
        })

        it("Should return an error with comment less than 4 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith3Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "comment length must be at least 4 characters long",
            ]});
        })

        it("Should return an error with comment more than 256 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith257Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "comment length must be less than or equal to 256 characters long",
            ]});
        })

        it("Should not call json and not call status and test pass with comment 4 char",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith4Char,
                }
            } as Request;
            const test = validateUserReview(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })

        it("Should not call json and not call status and test pass with comment 256 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith256Char,
                }
            } as Request;
            const test = validateUserReview(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing validateEditUserReview middleware",()=>{
        it("Should return an error that all fields are equired",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{

                },
                params:{

                }
            } as unknown as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "rating is required",
                "comment is required",
                "reviewId is required",
            ]})
        })

        it("Should return an error when rating is invalid number",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1.5,
                    comment:"comment",
                    
                },
                params:{
                    reviewId:hexWith24Char
                }
            } as unknown as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "rating must be one of [1, 2, 3, 4, 5]",
            ]})
        })

        it("Should return an error when rating is invalid number",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                },
                params:{
                    reviewId:stringWith24Char
                }
            } as unknown as Request
            
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "reviewId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error when review length is not 24",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                },
                params:{
                    reviewId:hexWith25Char
                }
            } as unknown as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "reviewId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                    reviewId:hexWith24Char
                },
                params:{
                    reviewId:hexWith24Char
                }
            } as unknown as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing validateDeleteUserReview middleware",()=>{
        it("Should return an error that all fields are equired",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId is required",
                "reviewId is required",
            ]})
        })

        it("Should return an error that productId and reviewId must 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    reviewId:hexWith25Char,
                    productId:hexWith25Char,
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId length must be 24 characters long",
                "reviewId length must be 24 characters long",
            ]})
        })

        it("Should return an error that productId and reviewId must be hex type",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    reviewId:stringWith24Char,
                    productId:stringWith24Char,
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must only contain hexadecimal characters",
                "reviewId must only contain hexadecimal characters",
            ]})
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    reviewId:hexWith24Char,
                    productId:hexWith24Char,
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

})