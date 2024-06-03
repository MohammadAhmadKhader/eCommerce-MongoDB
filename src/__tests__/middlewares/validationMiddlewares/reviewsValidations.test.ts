
import { validateDeleteUserReview, validateEditUserReview, validateUserReview } from "../../../middlewares/validationFunctions/reviewsValidationFunctions";
import { hexWith24Char, hexWith25Char,  stringWith24Char, stringWith256Char, 
    stringWith257Char, stringWith3Char, stringWith4Char, } from "../../assets/testData/stringTestData";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import {Request} from "express";

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

            expectValidationError(next,[
                "rating must be one of [1, 2, 3, 4, 5]",
                "rating must be a number",
                "comment is not allowed to be empty",
            ])
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

            expectValidationError(next,[
                "comment length must be at least 4 characters long",
            ])
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

            expectValidationError(next,[
                "comment length must be less than or equal to 256 characters long",
            ])
        })

        it("Should not call json and not call status and test pass with comment 4 char",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith4Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            
            expectValidationPassed(next);
        })

        it("Should not call json and not call status and test pass with comment 256 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    rating:1,
                    comment:stringWith256Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            
            expectValidationPassed(next);
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

            expectValidationError(next,[
                "rating is required",
                "comment is required",
                "reviewId is required",
            ])
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

            expectValidationError(next,[
                "rating must be one of [1, 2, 3, 4, 5]",
            ])
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

            expectValidationError(next,[
                "reviewId must only contain hexadecimal characters",
            ])
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

            expectValidationError(next,[
                "reviewId length must be 24 characters long",
            ])
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
            
            expectValidationPassed(next);
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
    
            expectValidationError(next,[
                "productId is required",
                "reviewId is required",
            ])
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

            expectValidationError(next,[
                "productId length must be 24 characters long",
                "reviewId length must be 24 characters long",
            ])
        })

        it("Should return an error that productId and reviewId must be hex type",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    reviewId:stringWith24Char,
                    productId:stringWith24Char,
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next);

            expectValidationError(next,[
                "productId must only contain hexadecimal characters",
                "reviewId must only contain hexadecimal characters",
            ])
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    reviewId:hexWith24Char,
                    productId:hexWith24Char,
                }
            } as unknown as Request;
            validateDeleteUserReview(req,res,next);
            expectValidationPassed(next);
        })
    })

})