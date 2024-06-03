import { emptyImageObj, wrongDataTypesImage, correctImageObj } from './../../assets/testData/fileTestData';
import Joi from "joi";
import { validateCreateProduct, validateUpdateProduct, validateUpdateSingleImageProduct,
 } from "../../../middlewares/validationFunctions/productsValidationFunctions";
import {  hexWith23Char, hexWith24Char, hexWith25Char, maxOffer, maxPrice, minOffer, minPrice,
     stringWith100Char, stringWith101Char, stringWith1024Char, stringWith1025Char, stringWith10Char, 
     stringWith24Char,  stringWith2Char, stringWith32Char, stringWith33Char, stringWith3Char, stringWith5Char, stringWith9Char }
      from "../../assets/testData/stringTestData";
import { createResponseNext, expectValidationError, expectValidationPassed,
     extractJoiCallErrorMessage } from "../../utils/helperTestFunctions.test";
import {Request} from "express";


describe("Products validation middlewares",()=>{
    describe("Testing creating product middleware",()=>{
        it("Should return an error with all fields are required",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateCreateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "name is required",
                "description is required",
                "categoryId is required",
                "price is required",
                "brand is required",
            ]);
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error with all fields below minimum length or number",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith2Char,
                    description:stringWith9Char,
                    categoryId:hexWith23Char,
                    offer:-0.01,
                    price:minPrice - 1,
                    finalPrice:-1,
                    quantity:-1,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);

            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "name length must be at least 3 characters long",
                "description length must be at least 10 characters long",
                "categoryId length must be 24 characters long",
                "offer must be greater than or equal to 0",
                "price must be greater than or equal to 0",
                "finalPrice must be greater than or equal to 0",
                "quantity must be greater than or equal to 0",
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error with all fields above length or number allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith101Char,
                    description:stringWith1025Char,
                    categoryId:hexWith25Char,
                    offer:maxOffer + 0.01,
                    price:maxPrice + 1,
                    finalPrice:maxPrice + 1,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);

            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "description length must be less than or equal to 1024 characters long",
                "categoryId length must be 24 characters long",
                "offer must be less than or equal to 1",
                "price must be less than or equal to 1000",
                "finalPrice must be less than or equal to 1000",
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should pass when all the parameters are set to the maximum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith100Char,
                    description:stringWith1024Char,
                    categoryId:hexWith24Char,
                    offer:maxOffer,
                    price:maxPrice,
                    finalPrice:maxPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);

            expectValidationPassed(next)
        })

        it("Should pass when all the parameters are set to the minimum allowed and brand is set to allowed strings",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith3Char,
                    description:stringWith10Char,
                    categoryId:hexWith24Char,
                    offer:minOffer,
                    price:minPrice,
                    finalPrice:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);

            expectValidationPassed(next)
        })

        it("Should return an error when finalPrice is set and offer more than 0 and price is not",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:hexWith24Char,
                    offer:0.5,
                    finalPrice:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);

            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "price is required",
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error when quantity is not an integer",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:hexWith24Char,
                    offer:0.5,
                    quantity:1.2,
                    price:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "quantity must be an integer"
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error when categoryId is not hex type",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:stringWith24Char,
                    offer:0.5,
                    quantity:1,
                    price:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateCreateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "categoryId must only contain hexadecimal characters"
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

    })

    describe("Testing validateUpdateProduct middleware",()=>{
        /** 
         * TODO must improve the error handling on function to unify the error handling and move its logic on this function to the error controller.
         * 
         */  
        // it("Should return an error with all fields are required",()=>{
        //    const { next,res } = createResponseNext()
        //     const req = {
        //         body:{
                    
        //         }
        //     } as Request;
        //     validateUpdateProduct(req,res,next);

        //     expect(next.mock).toHaveBeenCalledWith(expect.any(AppError));
        //     const receivedErrors = extractJoiCallErrorMessage(next);
        //     expect(receivedErrors).toStrictEqual([
        //         "name is required",
        //         "description is required",
        //         "categoryId is required",
        //         "price is required",
        //         "brand is required",
        //     ]);
        //     expect(next).toHaveBeenCalledTimes(1);
        // })

        it("Should return an error with all fields below minimum length or number or when brand is empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith2Char,
                    description:stringWith9Char,
                    categoryId:hexWith23Char,
                    offer:-0.01,
                    price:minPrice - 1,
                    finalPrice:-1,
                    quantity:-1,
                    brand:""
                }
            } as Request;
            validateUpdateProduct(req,res,next);

            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "name length must be at least 3 characters long",
                "description length must be at least 10 characters long",
                "categoryId length must be 24 characters long",
                "offer must be greater than or equal to 0",
                "price must be greater than or equal to 0",
                "finalPrice must be greater than or equal to 0",
                "quantity must be greater than or equal to 0",
                "brand is not allowed to be empty",
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error with all fields above length or number allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith101Char,
                    description:stringWith1025Char,
                    categoryId:hexWith25Char,
                    offer:maxOffer + 0.01,
                    price:maxPrice + 1,
                    finalPrice:maxPrice + 1,
                    brand:stringWith33Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);

            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "description length must be less than or equal to 1024 characters long",
                "categoryId length must be 24 characters long",
                "offer must be less than or equal to 1",
                "price must be less than or equal to 1000",
                "finalPrice must be less than or equal to 1000",
                "brand length must be less than or equal to 32 characters long",
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should pass when all the parameters are set to the maximum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith100Char,
                    description:stringWith1024Char,
                    categoryId:hexWith24Char,
                    offer:maxOffer,
                    price:maxPrice,
                    finalPrice:maxPrice,
                    brand:stringWith2Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);

            expectValidationPassed(next)
        })

        it("Should pass when all the parameters are set to the minimum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith3Char,
                    description:stringWith10Char,
                    categoryId:hexWith24Char,
                    offer:minOffer,
                    price:minPrice,
                    finalPrice:minPrice,
                    brand:stringWith2Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);

            expectValidationPassed(next)
        })

        /** 
         * TODO this unit test has to be changed to ensure product price...
         * TODO will be correct on update within certain range far from the finalPrice
         */  
        it("Should return an error when finalPrice is set and offer more than 0 and price is not",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:hexWith24Char,
                    offer:0.5,
                    finalPrice:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error when quantity is not an integer",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:hexWith24Char,
                    offer:0.5,
                    quantity:1.2,
                    price:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "quantity must be an integer"
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

        it("Should return an error when categoryId is not hex type",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith32Char,
                    description:stringWith24Char,
                    categoryId:stringWith24Char,
                    offer:0.5,
                    quantity:1,
                    price:minPrice,
                    brand:stringWith5Char
                }
            } as Request;
            validateUpdateProduct(req,res,next);
            
            expect(next).toHaveBeenCalledWith(expect.any(Joi.ValidationError));
            const receivedErrors = extractJoiCallErrorMessage(next);
            expect(receivedErrors).toStrictEqual([
                "categoryId must only contain hexadecimal characters"
            ])
            expect(next).toHaveBeenCalledTimes(1);
        })

    })

    describe("Testing validateUpdateProductSingleImage middleware",()=>{
        it("Should return an error with that image is required when file is not truthy",()=>{
            const { next,res } = createResponseNext()
             const req = {
                 body:{

                 }
             } as Request;
             validateUpdateSingleImageProduct(req,res,next);

             expectValidationError(next,[
                "image is required",
                "imageId is required",
             ])
         })
        
        it("Should return an error with all fields are required and when imageId is not 24 length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                file:{
                    
                },
                body:{
                    imageId:hexWith23Char
                }
            } as Request;
            validateUpdateSingleImageProduct(req,res,next);
            
            expectValidationError(next,[
                "image.fieldname is required",
                "image.originalname is required",
                "image.encoding is required",
                "image.mimetype is required",
                "image.size is required",
                "image.buffer is required",
                "imageId length must be 24 characters long",
            ]);
        })

        it("Should return an error when the given image file object values are empty and when imageId is not hexadecimal type",()=>{
           const { next,res } = createResponseNext()
            const req = {
                file:{
                    ...emptyImageObj
                },
                body:{
                    imageId:stringWith24Char
                }
            } as Request;
            validateUpdateSingleImageProduct(req,res,next);
        
            expectValidationError(next,[
                "image.fieldname is not allowed to be empty",
               "image.originalname is not allowed to be empty",
               "image.encoding is not allowed to be empty",
               "image.mimetype is not allowed to be empty",
               "image.size is required",
               "image.buffer is required",
               "imageId must only contain hexadecimal characters",
            ]);
        })

        it("Should return an error when image file object has wrong data types",()=>{
           const { next,res } = createResponseNext()
            const req = {
                file:{
                    ...wrongDataTypesImage
                },
                body:{
                    imageId:hexWith24Char
                }
            } as unknown as Request;
            validateUpdateSingleImageProduct(req,res,next);

            expectValidationError(next,[
                "image.fieldname must be a string",
               "image.originalname must be a string",
               "image.encoding must be a string",
               "image.mimetype must be a string",
               "image.size must be a number",
            ]);
        })

        it("Should pass when all image file object is valid",()=>{
           const { next,res } = createResponseNext()
            const req = {
                file:{
                    ...correctImageObj
                },
                body:{
                    imageId:hexWith24Char
                }
            } as unknown as Request;
            validateUpdateSingleImageProduct(req,res,next);

            expectValidationPassed(next)
        })
    })
})