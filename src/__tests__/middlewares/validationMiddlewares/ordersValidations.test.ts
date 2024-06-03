
import { validateCheckOrder,  validateOrderId, validateOrdersStatus, } from "../../../middlewares/validationFunctions/ordersValidationFunctions";
import { hexWith24Char, hexWith25Char, stringWith24Char } from "../../assets/testData/stringTestData";
import { createResponseNext, expectValidationError, expectValidationPassed } from "../../utils/helperTestFunctions.test";
import {Request} from "express";

describe("Orders validation middlewares",()=>{
    describe("Testing validateCheckOrder middleware",()=>{
        const correctAddress={
            city:"city",
            state:"state",
            streetAddress:"streetAddress 101",
            pinCode:"2341",
            fullName:"fullName",
            mobileNumber:"059279103213"
        }
        it("Should return an error that all fields are equired",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateCheckOrder(req,res,next)
        
            expectValidationError(next,[
                "orderId is required",
                "address is required",
            ])
        })

        it("Should return an error that orderId must 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:hexWith25Char,
                    address:correctAddress
                }
            } as Request;
            validateCheckOrder(req,res,next)

            expectValidationError(next,[
                "orderId length must be 24 characters long",
            ])
        })

        it("Should return an error that orderId must be hex type",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:stringWith24Char,
                    address:correctAddress
                }
            } as Request;
            validateCheckOrder(req,res,next)

            expectValidationError(next,[
                "orderId must only contain hexadecimal characters",
            ])
        })

        it("Should return an error when address values are all missing (empty address object)",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:hexWith24Char,
                    address:{}
                }
            } as Request;
            validateCheckOrder(req,res,next)

            expectValidationError(next,[
                "address.fullName is required",
                "address.streetAddress is required",
                "address.city is required",
                "address.state is required",
                "address.mobileNumber is required",
            ]);
        })

        it("Should return an error when address only one parameter is used inside the object",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:hexWith24Char,
                    address:{fullName:"fullName"}
                }
            } as Request;
            validateCheckOrder(req,res,next);

            expectValidationError(next,[
                "address.streetAddress is required",
                "address.city is required",
                "address.state is required",
                "address.mobileNumber is required",
            ]);
        })

        it("Should disallow pinCode to be set to empty string and return error",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:hexWith24Char,
                    address:{...correctAddress,pinCode:""}
                }
            } as Request;
            validateCheckOrder(req,res,next)

            expectValidationError(next,[
                "address.pinCode is not allowed to be empty",
            ]);
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    orderId:hexWith24Char,
                    address:correctAddress
                }
            } as Request;
            validateCheckOrder(req,res,next)
            expectValidationPassed(next);
        })
    })

    describe("Testing validateOrderId middleware",()=>{
        it("Should return error that orderId is required",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                },
                params:{

                }
            } as Request;
            validateOrderId(req,res,next)

            expectValidationError(next,[
                "orderId is required",
            ]);
        })

        it("Should return error that orderId type must be hex",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    orderId:stringWith24Char
                }
            } as unknown as Request;
            validateOrderId(req,res,next)

            expectValidationError(next,[
                "orderId must only contain hexadecimal characters",
            ]);
        })

        it("Should return error that orderId must be 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    orderId:hexWith25Char
                }
            } as unknown as Request;
            validateOrderId(req,res,next)

            expectValidationError(next,[
                "orderId length must be 24 characters long",
            ]);
        })

        it("Should pass successfully when orderId is hex and 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    orderId:hexWith24Char,
                }
            } as unknown as Request;
            validateOrderId(req,res,next);
            expectValidationPassed(next);
        })
    })

    describe("Testing validateOrdersStatus middleware",()=>{
        it("Should return error that orderId is required",()=>{
            const { next,res } = createResponseNext()
            const req = {
                query:{
                    
                }
            } as unknown as Request;
            validateOrdersStatus(req,res,next)

            expectValidationError(next,[
                "status is required",
            ]);
        })

        it("Should return error that orderId type must be hex",()=>{
            const { next,res } = createResponseNext();
            const wrongStatus = "Wrong Status"
            const req = {
                query: {
                    status: wrongStatus
                }
            } as unknown as Request;
            validateOrdersStatus(req,res,next)

            expectValidationError(next,[
                "status must be one of [Completed, Processing, Cancelled, Placed]",
            ]);
        })

        it("Should pass successfully when order status is correct",()=>{
            const { next,res } = createResponseNext();
            const correctStatus = "Placed"
            const req = {
                query:{
                    status:correctStatus,
                }
            } as unknown as Request;
            validateOrdersStatus(req,res,next)
            expectValidationPassed(next);
        })
    })
})