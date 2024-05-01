import { validateCreateProduct, } from "../../../middlewares/validationsFunctions";
import {  hexWith23Char, hexWith24Char, hexWith25Char, maxOffer, maxPrice, minOffer, minPrice, stringWith100Char, stringWith101Char, stringWith1024Char, stringWith1025Char, stringWith10Char, stringWith15Char, stringWith16Char, stringWith24Char, stringWith25Char, stringWith2Char, stringWith32Char, stringWith33Char, stringWith3Char, stringWith4Char, stringWith5Char, stringWith65Char, stringWith6Char, stringWith9Char } from "../../assets/testData/stringTestData";
import { createResponseNext } from "../../utils/helperTestFunctions.test";
import {Request,Response,NextFunction} from "express";

describe("Products validation middlewares",()=>{
    describe("Testing creating product middleware",()=>{
        it("Should return an error with all fields are required",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateCreateProduct(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "name is required",
                "description is required",
                "categoryId is required",
                "price is required",
                "brand is required",
            ]})
        })

        it("Should return an error with all fields below minimum length or number or when brand is not set to the valid options",()=>{
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
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                    "name length must be at least 3 characters long",
                    "description length must be at least 10 characters long",
                    "categoryId length must be 24 characters long",
                    "offer must be greater than or equal to 0",
                    "price must be greater than or equal to 0",
                    "finalPrice must be greater than or equal to 0",
                    "quantity must be greater than or equal to 0",
                    "brand must be one of [Nike, Levis, Calvin Klein, Casio, Adidas, Biba]",
            ]})
        })

        it("Should return an error with all fields above length or number or when brand is not set to the valid options",()=>{
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
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "description length must be less than or equal to 1024 characters long",
                     "categoryId length must be 24 characters long",
                     "offer must be less than or equal to 1",
                     "price must be less than or equal to 1000",
                     "finalPrice must be less than or equal to 1000",
                     "brand must be one of [Nike, Levis, Calvin Klein, Casio, Adidas, Biba]",
            ]})
        })

        it("Should pass when all the parameters are set to the maximum allowed and brand is set to allowed strings",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    name:stringWith100Char,
                    description:stringWith1024Char,
                    categoryId:hexWith24Char,
                    offer:maxOffer,
                    price:maxPrice,
                    finalPrice:maxPrice,
                    brand:"Nike"
                }
            } as Request;
            const test = validateCreateProduct(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
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
                    brand:"Nike"
                }
            } as Request;
            const test = validateCreateProduct(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
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
                    brand:"Nike"
                }
            } as Request;
            validateCreateProduct(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: ["price is required"]})
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
                    brand:"Nike"
                }
            } as Request;
            validateCreateProduct(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: ["quantity must be an integer"]})
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
                    brand:"Nike"
                }
            } as Request;
            validateCreateProduct(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error: ["categoryId must only contain hexadecimal characters"]})
        })

    })
})