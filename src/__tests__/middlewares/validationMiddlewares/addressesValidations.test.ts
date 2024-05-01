
import { validateCreatingAddress, validateForgotPassword, validateResetPasswordViaCode, validateUpdatingAddress, validateUserChangeInformation, validateUserChangePassword, validateUserRegistration, validateUserSignIn } from "../../../middlewares/validationsFunctions";
import { emailWith5Char, emailWith64Char, emailWith65Char, emailWith6Char, stringWith10Char, stringWith12Char, stringWith13Char, stringWith15Char, stringWith16Char, stringWith24Char, stringWith25Char, stringWith2Char, stringWith32Char, stringWith33Char, stringWith3Char, stringWith4Char, stringWith5Char, stringWith62Char, stringWith63Char, stringWith65Char, stringWith6Char } from "../../assets/testData/stringTestData";
import { createResponseNext } from "../../utils/helperTestFunctions.test";
import {Request,Response,NextFunction} from "express";

describe("Addresses validation middlewares",()=>{
    describe("Testing creating address middleware",()=>{
        it("Should return error with all data is required",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateCreatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName is required",
                "streetAddress is required",
                "city is required",
                "state is required",
                "mobileNumber is required",
            ]})
        })

        it("Should return error with all data empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:"",
                    city:"",
                    streetAddress:"",
                    state:"",
                    mobileNumber:""
                }
            } as Request;
            validateCreatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName is not allowed to be empty",
                "streetAddress is not allowed to be empty",
                "city is not allowed to be empty",
                "state is not allowed to be empty",
                "mobileNumber is not allowed to be empty",
            ]})
        })


        it("Should return error with all data less than the minimum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith3Char,
                    city:stringWith2Char,
                    streetAddress:stringWith3Char,
                    state:stringWith3Char,
                    pinCode:stringWith2Char,
                    mobileNumber:stringWith5Char
                }
            } as Request;
            validateCreatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName length must be at least 4 characters long",
                     "streetAddress length must be at least 4 characters long",
                     "city length must be at least 3 characters long",
                    "state length must be at least 4 characters long",
                    "mobileNumber length must be at least 6 characters long",
                     "pinCode length must be at least 3 characters long",
            ]})
        })

        it("Should return error with all data more than the maximum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith33Char,
                    city:stringWith33Char,
                    streetAddress:stringWith63Char,
                    state:stringWith33Char,
                    pinCode:stringWith13Char,
                    mobileNumber:stringWith16Char
                }
            } as Request;
            validateCreatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName length must be less than or equal to 32 characters long",
                "streetAddress length must be less than or equal to 62 characters long",
                "city length must be less than or equal to 32 characters long",
                "state length must be less than or equal to 32 characters long",
                "mobileNumber length must be less than or equal to 15 characters long",
                "pinCode length must be less than or equal to 12 characters long",
            ]})
        })

        it("Should pass with all parameters on max length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith32Char,
                    city:stringWith32Char,
                    streetAddress:stringWith62Char,
                    state:stringWith32Char,
                    pinCode:stringWith12Char,
                    mobileNumber:stringWith15Char
                }
            } as Request;
            const test = validateCreatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass with all parameters on min length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    city:stringWith3Char,
                    streetAddress:stringWith4Char,
                    state:stringWith4Char,
                    pinCode:stringWith3Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateCreatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing updating address middleware",()=>{
        it("Should return error with all data is required",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateUpdatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:"one field at least is required"})
        })

        it("Should return error with all data empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:"",
                    city:"",
                    streetAddress:"",
                    state:"",
                    pinCode:"",
                    mobileNumber:""
                }
            } as Request;
            validateUpdatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName is not allowed to be empty",
                "streetAddress is not allowed to be empty",
                "city is not allowed to be empty",
                "state is not allowed to be empty",
                "mobileNumber is not allowed to be empty",
                "pinCode is not allowed to be empty",
            ]})
        })


        it("Should return error with all data less than the minimum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith3Char,
                    city:stringWith2Char,
                    streetAddress:stringWith3Char,
                    state:stringWith3Char,
                    pinCode:stringWith2Char,
                    mobileNumber:stringWith5Char
                }
            } as Request;
            validateUpdatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName length must be at least 4 characters long",
                     "streetAddress length must be at least 4 characters long",
                     "city length must be at least 3 characters long",
                    "state length must be at least 4 characters long",
                    "mobileNumber length must be at least 6 characters long",
                     "pinCode length must be at least 3 characters long",
            ]})
        })

        it("Should return error with all data more than the maximum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith33Char,
                    city:stringWith33Char,
                    streetAddress:stringWith63Char,
                    state:stringWith33Char,
                    pinCode:stringWith13Char,
                    mobileNumber:stringWith16Char
                }
            } as Request;
            validateUpdatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName length must be less than or equal to 32 characters long",
                "streetAddress length must be less than or equal to 62 characters long",
                "city length must be less than or equal to 32 characters long",
                "state length must be less than or equal to 32 characters long",
                "mobileNumber length must be less than or equal to 15 characters long",
                "pinCode length must be less than or equal to 12 characters long",
            ]})
        })

        it("Should pass with all parameters on max length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith32Char,
                    city:stringWith32Char,
                    streetAddress:stringWith62Char,
                    state:stringWith32Char,
                    pinCode:stringWith12Char,
                    mobileNumber:stringWith15Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass with all parameters on min length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    city:stringWith3Char,
                    streetAddress:stringWith4Char,
                    state:stringWith4Char,
                    pinCode:stringWith3Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass when fullname is not set",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    city:stringWith3Char,
                    streetAddress:stringWith4Char,
                    state:stringWith4Char,
                    pinCode:stringWith3Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
        
        it("Should pass when pinCode is not set",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    streetAddress:stringWith4Char,
                    state:stringWith4Char,
                    city:stringWith3Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass when mobileNumber is not set",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    streetAddress:stringWith4Char,
                    state:stringWith4Char,
                    pinCode:stringWith3Char,
                    city:stringWith3Char,
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass when state is not set",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    streetAddress:stringWith4Char,
                    pinCode:stringWith3Char,
                    city:stringWith3Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass when streetAddress is not set",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    fullName:stringWith4Char,
                    pinCode:stringWith3Char,
                    city:stringWith3Char,
                    state:stringWith4Char,
                    mobileNumber:stringWith6Char
                }
            } as Request;
            const test = validateUpdatingAddress(req,res,next);
            expect(test).toBe(next())
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })
})