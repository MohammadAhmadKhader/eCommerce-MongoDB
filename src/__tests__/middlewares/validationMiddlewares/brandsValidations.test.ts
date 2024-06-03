import { faker } from "@faker-js/faker";
import { validateCreateBrand, validateUpdateBrand } from "../../../middlewares/validationFunctions/brandsValidationFunctions";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import { stringWith32Char, stringWith33Char } from "../../assets/testData/stringTestData";
import { wrongDataTypesImage, correctImageObj ,emptyImageObj} from "../../assets/testData/fileTestData";
import {Request,} from "express";

describe("Brands validation middleware",()=>{
    describe("Testing validateCreateBrand Middleware",()=>{
        it("Should return an error when fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            
            expectValidationError(next,[
                "brandName is required",
                "brandLogo is required",
            ])
        })

        it("Should return an error when fields are less than minimum or when image object is empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:""
                },
                file:{
                    ...emptyImageObj
                }
            } as unknown as Request;
            validateCreateBrand(req,res,next)

            expectValidationError(next,[
                "brandName is not allowed to be empty",
                "brandLogo.fieldname is not allowed to be empty",
               "brandLogo.originalname is not allowed to be empty",
               "brandLogo.encoding is not allowed to be empty",
               "brandLogo.mimetype is not allowed to be empty",
               "brandLogo.size is required",
               "brandLogo.buffer is required",
            ])
        })

        it("Should return an error when brandName is more than maximum or when image object has invalid data types",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith33Char
                },
                file:{
                    ...wrongDataTypesImage
                }
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            
            expectValidationError(next,[
                "brandName length must be less than or equal to 32 characters long",
                "brandLogo.fieldname must be a string",
                "brandLogo.originalname must be a string",
                "brandLogo.encoding must be a string",
                "brandLogo.mimetype must be a string",
                "brandLogo.size must be a number",
            ])
        })

        it("Should pass successfully when brandName set to maximum and image object is valid",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith32Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            expectValidationPassed(next)
        })

        it("Should pass successfully when brandName set to minimum and image object is valid",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:"Y"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateBrand(req,res,next);
            expectValidationPassed(next)
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:faker.person.firstName().substring(1,14),  
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateBrand(req,res,next)
            expectValidationPassed(next)
        })
    })

    describe("Testing validateUpdateBrand Middleware",()=>{
        it("Should return an error when fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
            } as unknown as Request;
            validateUpdateBrand(req,res,next)
            
            expectValidationError(next,[
                "At least one of the following fields is required: name, image",
            ])
        })

        it("Should return an error when brandName is empty string or image object is empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:""
                },
                file:{
                    ...emptyImageObj
                }
            } as unknown as Request;
            validateUpdateBrand(req,res,next)

            expectValidationError(next,[
                "brandName is not allowed to be empty",
                "brandLogo.fieldname is not allowed to be empty",
               "brandLogo.originalname is not allowed to be empty",
               "brandLogo.encoding is not allowed to be empty",
               "brandLogo.mimetype is not allowed to be empty",
               "brandLogo.size is required",
               "brandLogo.buffer is required",
            ])
        })

        it("Should return an error when brandName is more than maximum or when image object is invalid string",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith33Char
                },
                file:{
                    ...wrongDataTypesImage
                }
            } as unknown as Request;
            validateUpdateBrand(req,res,next)
            
            expectValidationError(next,[
                "brandName length must be less than or equal to 32 characters long",
                "brandLogo.fieldname must be a string",
               "brandLogo.originalname must be a string",
               "brandLogo.encoding must be a string",
               "brandLogo.mimetype must be a string",
               "brandLogo.size must be a number",
            ])
        })

        it("Should pass successfully when brandName set to maximum and image file object is valid",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:stringWith32Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateBrand(req,res,next)
            expectValidationPassed(next)
        })

        it("Should pass successfully when brandName set to minimum and image file object is valid",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    brandName:"Y"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateBrand(req,res,next);
            expectValidationPassed(next)
        })

    })
})