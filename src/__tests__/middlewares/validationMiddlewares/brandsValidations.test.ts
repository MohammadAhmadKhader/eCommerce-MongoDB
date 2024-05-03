import { faker } from "@faker-js/faker";
import { validateCreateBrand } from "../../../middlewares/validationsFunctions";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import { stringWith32Char, stringWith33Char } from "../../assets/testData/stringTestData";
import {Request,} from "express";

describe("Brands validation middleware",()=>{
    describe("Tesitng validateCreateBrand Middleware",()=>{
        it("Should return an error when fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            
            expectValidationError(next,[
                "brandName is required",
            ])
        })

        it("Should return an error when fields are less than minimum",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:""
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)

            expectValidationError(next,[
                "brandName is not allowed to be empty",
            ])
        })

        it("Should return an error when fields are more than maximum",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith33Char
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            
            expectValidationError(next,[
                "brandName length must be less than or equal to 32 characters long",
            ])
        })

        it("Should pass successfully when brandName set to maximum",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith32Char
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            expectValidationPassed(next)
        })

        it("Should pass successfully when brandName set to minimum",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:"Y"
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:faker.person.firstName().substring(1,14),  
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            expectValidationPassed(next)
        })
    })
})