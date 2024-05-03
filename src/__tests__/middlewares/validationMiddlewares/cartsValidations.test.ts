
import { validateAddingToCart, validateChangeCartItemQuantityByOne, validateDeletingFromCart,} from "../../../middlewares/validationsFunctions";
import { hexWith24Char, hexWith25Char} from "../../assets/testData/stringTestData";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import {Request} from "express";

describe("Carts validation middlewares",()=>{
    describe("Testing validatAddingToCart middleware",()=>{
        it("Should return an error that all fields are empty",()=>{
                const { next,res } = createResponseNext()
                const req = {
                    body:{

                    }
                } as Request;
                validateAddingToCart(req,res,next);
                
                expectValidationError(next,[
                    "productId is required",
                     "quantity is required",
                ])
        })

        it("Should return an error when quantity is not integer",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    productId:hexWith24Char,
                    quantity:1.5
                }
            } as Request;
            validateAddingToCart(req,res,next);

            expectValidationError(next,[
                "quantity must be an integer"
            ])
        })

        it("Should return an error when quantity is minus",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    quantity:-1
                }
            } as Request;
            validateAddingToCart(req,res,next);
    
            expectValidationError(next,[
                "quantity must be greater than or equal to 1",
            ])
        })

        it("Should return an error when productId is not hex 24 length",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith25Char,
                    quantity:1
                }
            } as Request;
            validateAddingToCart(req,res,next);
        
            expectValidationError(next,[
                "productId length must be 24 characters long",
            ])
        })

        it("Should pass successfully when quantity is 1 and productId is hex 24 length",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    quantity:1
                }
            } as Request;
            validateAddingToCart(req,res,next);
            expectValidationPassed(next)
        })

        it("Should pass successfully when quantity is more than 1 and positive and productId is hex 24 length",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    quantity:5
                }
            } as Request;
            validateAddingToCart(req,res,next);
            expectValidationPassed(next)
        })
    })
    
    describe("Testing validateChangeCartItemQuantityByOne middleware",()=>{
        it("Should return an error that all fields are empty",()=>{
                const { next,res } = createResponseNext()
                const req = {
                    body:{

                    },
                    params:{

                    }
                } as Request;
                validateChangeCartItemQuantityByOne(req,res,next);
                
                expectValidationError(next,[
                    "productId is required",
                    "cartItemId is required",
                    "operation is required",
                ])
        })

        it("Should return an error when operation is not +1 or -1",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    
                    operation:"+2"
                },
                params:{
                    cartItemId:hexWith24Char,
                }
            } as unknown as Request;
            validateChangeCartItemQuantityByOne(req,res,next);
    
            expectValidationError(next,[
                "operation must be one of [+1, -1]",
            ])
        })

        it("Should pass successfully when productId cartItemId are hex 24 length and operation is +1",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    operation:"+1"
                },
                params:{
                    cartItemId:hexWith24Char,
                }
            } as unknown as Request;
            validateChangeCartItemQuantityByOne(req,res,next);
            expectValidationPassed(next)
        })

        it("Should pass successfully when productId cartItemId are hex 24 length and operation is -1",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    productId:hexWith24Char,
                    operation:"-1"
                },
                params:{
                    cartItemId:hexWith24Char,
                }
            } as unknown as Request;
            validateChangeCartItemQuantityByOne(req,res,next);
            expectValidationPassed(next)
        })
    })

    describe("Testing validateDeletingFromCart middleware",()=>{
        it("Should return an error that all fields are empty",()=>{
                const { next,res } = createResponseNext()
                const req = {
                    params:{

                    }
                } as Request;
                validateDeletingFromCart(req,res,next);

                expectValidationError(next,[
                    "cartItemId is required",
                ])
        })

        it("Should return an error when cartItem Id is not 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    cartItemId:hexWith25Char, 
                }
            } as unknown as Request;
            validateDeletingFromCart(req,res,next);

            expectValidationError(next,[
                "cartItemId length must be 24 characters long",
            ])
        })

        it("Should pass successfully when cartItemId is hex 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    cartItemId:hexWith24Char,
                }
            } as unknown as Request;
            validateDeletingFromCart(req,res,next);
            expectValidationPassed(next)
        })
    })
})