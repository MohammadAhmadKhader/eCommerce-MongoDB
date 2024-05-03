import { validateSendingMessage } from "../../../middlewares/validationsFunctions";
import { emailWith5Char, emailWith64Char, emailWith65Char, emailWith6Char, stringWith256Char, stringWith257Char, stringWith32Char, 
    stringWith33Char, stringWith3Char, stringWith4Char } from "../../assets/testData/stringTestData";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import {Request} from "express";

describe('ContactUs validation middlewares', () => { 
    describe("Testing sending message middleware",()=>{
        it("Should return an error that all fields ar empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateSendingMessage(req,res,next);

            expectValidationError(next,[
                "fullName is required",
                "email is required",
            ])
        })

        it("Should return an error that all fields are less than the minimum length allowed and invalid email",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith3Char,
                    email:emailWith5Char,
                    subject:stringWith3Char,
                    message:stringWith3Char,
                }
            } as Request;
            validateSendingMessage(req,res,next);

            expectValidationError(next,[
                "fullName length must be at least 4 characters long",
                "email must be a valid email",
                "email length must be at least 6 characters long",
                "subject length must be at least 4 characters long",
                "message length must be at least 4 characters long",
            ])

        })
        it("Should return an error that all fields are more than the maximum length allowed and invalid email",()=>{
                const { next,res } = createResponseNext()
                const req = {
                    body:{
                        fullName:stringWith33Char,
                        email:emailWith65Char,
                        subject:stringWith33Char,
                        message:stringWith257Char,
                    }
                } as Request;
                validateSendingMessage(req,res,next);

                expectValidationError(next,[
                    "fullName length must be less than or equal to 32 characters long",
                    "email length must be less than or equal to 64 characters long",
                    "subject length must be less than or equal to 32 characters long",
                    "message length must be less than or equal to 256 characters long",
                ])
         })

        it("Should pass with maximum length for all fields",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith32Char,
                    email:emailWith64Char,
                    subject:stringWith32Char,
                    message:stringWith256Char,
                }
            } as Request;
            validateSendingMessage(req,res,next);
            expectValidationPassed(next);
        })

        it("Should pass with minimum length for all fields",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    email:emailWith6Char,
                    subject:stringWith4Char,
                    message:stringWith4Char,
                }
            } as Request;
            validateSendingMessage(req,res,next);
            expectValidationPassed(next);
        })
    })
})