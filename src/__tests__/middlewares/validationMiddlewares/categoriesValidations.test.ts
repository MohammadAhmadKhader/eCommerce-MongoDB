import { emptyImageObj, wrongDataTypesImage, correctImageObj } from './../../assets/testData/fileTestData';
import { faker, } from "@faker-js/faker";
import { validateCreateCategory, validateUpdateCategory } from "../../../middlewares/validationFunctions/categoriesValidationFunctions";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import { stringWith64Char, stringWith65Char } from "../../assets/testData/stringTestData";
import {Request,} from "express";

describe("Categories validation middlewares",()=>{

    describe("Testing validateCreateCategories Middleware",()=>{
        it("Should return an error when fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            
            expectValidationError(next,[
                "name is required",
                "image is required",
            ])
        })

        it("Should return an error when image is an empty object",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"",
                },
                file:{
                    
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)

            expectValidationError(next,[
                "name is not allowed to be empty",
                "image.fieldname is required",
                "image.originalname is required",
                "image.encoding is required",
                "image.mimetype is required",
                "image.size is required",
                "image.buffer is required",
            ])
        })

        it("Should return an error when file image fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...emptyImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            
            expectValidationError(next,[
            "image.fieldname is not allowed to be empty",
               "image.originalname is not allowed to be empty",
               "image.encoding is not allowed to be empty",
               "image.mimetype is not allowed to be empty",
               "image.size is required",
               "image.buffer is required",
               
            ])
        })

        it("Should return an error when file image fields are set to wrong data type",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...wrongDataTypesImage
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            
            expectValidationError(next,[
               "image.fieldname must be a string",
               "image.originalname must be a string",
               "image.encoding must be a string",
               "image.mimetype must be a string",
               "image.size must be a number",
            ])
        })

        it("Should return an error when name is less than minimum length '2' characters",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"a"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)

            expectValidationError(next,[
                "name length must be at least 2 characters long",
            ])
        })

        it("Should return an error when name is more than maximum length '64' characters",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith65Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)

            expectValidationError(next,[
                "name length must be less than or equal to 64 characters long",
            ])
        })

        it("Should return an error when name set to max characters '64' allowed",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith64Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            expectValidationPassed(next);
        })

        it("Should return an error when name set to minimum characters '2' allowed",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            expectValidationPassed(next);
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:faker.person.firstName().substring(1,14),  
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateCreateCategory(req,res,next)
            expectValidationPassed(next)
        })
    })

    describe("Testing validateUpdateCategories Middleware",()=>{
        it("Should return an error when fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            
            expectValidationError(next,[
                "At least one of the following fields is required: name, image"
            ])
        })

        it("Should return an error when image is an empty object",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"",
                },
            } as unknown as Request;
            validateUpdateCategory(req,res,next)

            expectValidationError(next,[
                "name is not allowed to be empty",
            ])
        })

        it("Should return an error when file image fields are empty",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...emptyImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            
            expectValidationError(next,[
            "image.fieldname is not allowed to be empty",
               "image.originalname is not allowed to be empty",
               "image.encoding is not allowed to be empty",
               "image.mimetype is not allowed to be empty",
               "image.size is required",
               "image.buffer is required",
               
            ])
        })

        it("Should return an error when file image fields are set to wrong data type",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...wrongDataTypesImage
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            
            expectValidationError(next,[
               "image.fieldname must be a string",
               "image.originalname must be a string",
               "image.encoding must be a string",
               "image.mimetype must be a string",
               "image.size must be a number",
            ])
        })

        it("Should return an error when name is less than minimum length '2' characters",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"a"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)

            expectValidationError(next,[
                "name length must be at least 2 characters long",
            ])
        })

        it("Should return an error when name is more than maximum length '64' characters",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith65Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)

            expectValidationError(next,[
                "name length must be less than or equal to 64 characters long",
            ])
        })

        it("Should return an error when name set to max characters '64' allowed",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith64Char
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            expectValidationPassed(next);
        })

        it("Should return an error when name set to minimum characters '2' allowed",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:"ab"
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            expectValidationPassed(next);
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:faker.person.firstName().substring(1,14),  
                },
                file:{
                    ...correctImageObj
                }
            } as unknown as Request;
            validateUpdateCategory(req,res,next)
            expectValidationPassed(next)
        })
    })
})