
import { validateForgotPassword, validateResetPasswordViaCode, validateUserChangeInformation, validateUserChangePassword, validateUserRegistration, validateUserSignIn } from "../../../middlewares/validationsFunctions";
import { emailWith5Char, emailWith64Char, emailWith65Char, emailWith6Char, stringWith10Char, stringWith15Char, stringWith16Char, stringWith24Char, stringWith25Char, stringWith32Char, stringWith33Char, stringWith3Char, stringWith4Char, stringWith5Char, stringWith65Char, stringWith6Char } from "../../assets/testData/stringTestData";
import { createResponseNext } from "../../utils/helperTestFunctions.test";
import {Request,Response,NextFunction} from "express";

describe("Users validation middlewares",()=>{
    describe("Testing registration validator middleware",()=>{ 
        it("Should return an error that all given data is empty",()=>{
            const { next,res } = createResponseNext() 
            const req = {
                body:{
                    firstName:"",
                    lastName:"",
                    email:"",
                    password:"",
                }
            } as Request;
            validateUserRegistration(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                    "firstName is not allowed to be empty",
                    "lastName is not allowed to be empty",
                    "email is not allowed to be empty",
                    "password is not allowed to be empty",
            ]})
        })

        it("Should return call next function with minimum length on all parameters",()=>{ 
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    firstName:stringWith4Char,
                    lastName:stringWith4Char,
                    email:emailWith6Char,
                    password:stringWith6Char,
                }
            } as Request;
            validateUserRegistration(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })

        it("Should return call next function with max length on all parameters",()=>{ 
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    firstName:stringWith32Char,
                    lastName:stringWith32Char,
                    email:emailWith64Char,
                    password:stringWith24Char,
                }
            } as Request;
            validateUserRegistration(req,res,next);
            expect(res.status).not.toHaveBeenCalled()
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should return an error that all given data length is less than the required",()=>{ 
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    firstName:stringWith3Char,
                    lastName:stringWith3Char,
                    email:emailWith5Char,
                    password:stringWith5Char,
                }
            } as Request;
            validateUserRegistration(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "firstName length must be at least 4 characters long",
                "lastName length must be at least 4 characters long",
                "email must be a valid email",
                "email length must be at least 6 characters long",
                "password length must be at least 6 characters long",
            ]})
        })

        it("Should return an error that all given data length is more than the required",()=>{ 
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    firstName:stringWith33Char,
                    lastName:stringWith33Char,
                    email:stringWith65Char,
                    password:stringWith25Char,
                }
            } as Request;
            validateUserRegistration(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "firstName length must be less than or equal to 32 characters long",
                "lastName length must be less than or equal to 32 characters long",
                "email must be a valid email",
                "password length must be less than or equal to 24 characters long",
            ]})
        })

        it("Should return an error that only alphanum characters allowed",()=>{

        })
    })

    describe("Testing change password middleware",()=>{
        it("Should return error with oldPassword and newPassword are empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    oldPassword:"",
                    newPassword:"",
                    confirmNewPassword:""
                }
            } as Request;
            validateUserChangePassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({error:[
                "oldPassword is not allowed to be empty",
                "newPassword is not allowed to be empty",
            ]})

        })

        it("Should return error with all data less than the minimum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    oldPassword:stringWith5Char,
                    newPassword:stringWith5Char,
                    confirmNewPassword:stringWith5Char
                }
            } as Request;
            validateUserChangePassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({error:[
                "oldPassword length must be at least 6 characters long",
                "newPassword length must be at least 6 characters long",
            ]})
        })

        it("Should return error with all data more than the maximum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    oldPassword:stringWith25Char,
                    newPassword:stringWith25Char,
                    confirmNewPassword:stringWith25Char
                }
            } as Request;
            validateUserChangePassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({error:[
                "oldPassword length must be less than or equal to 24 characters long",
                "newPassword length must be less than or equal to 24 characters long",
            ]})
        })

        it("Should return error with not matching passwords",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    oldPassword:stringWith6Char,
                    newPassword:stringWith6Char,
                    confirmNewPassword:stringWith6Char+"a"
                }
            } as Request;
            validateUserChangePassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({error:[
                "Password Must Match",
            ]})
        })

        it("Should pass the function and not call the json or status",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    oldPassword:stringWith6Char,
                    newPassword:stringWith6Char,
                    confirmNewPassword:stringWith6Char
                }
            } as Request;
            const test = validateUserChangePassword(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing sign in middleware",()=>{
        it("Should return an error when all fields are empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateUserSignIn(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email is required",
                "password is required",
            ]});
        })

        it("Should return an error with when all fields are less than the minimum length allowed or when email is invalid",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith5Char,
                    password:stringWith5Char
                }
            } as Request;
            validateUserSignIn(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email must be a valid email",
                "email length must be at least 6 characters long",
                "password length must be at least 6 characters long",
            ]});
        })

        it("Should return an error with when all fields are more than maximum length",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith65Char,
                    password:stringWith25Char
                }
            } as Request;
            validateUserSignIn(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email length must be less than or equal to 64 characters long",
                "password length must be less than or equal to 24 characters long",
            ]});
        })


        it("Should pass successfully when email and password set to minimum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith6Char,
                    password:stringWith6Char
                }
            } as Request;
            validateUserSignIn(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })

        it("Should pass successfully when email and password set to maximum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith64Char,
                    password:stringWith24Char
                }
            } as Request;
            validateUserSignIn(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing validateResetPasswordViaCode middleware",()=>{
        it("Should return an error when all fields are empty",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "newPassword is required",
                "confirmedNewPassword is required",
            ]});
        })

        it("Should return an error when passwords are not matching",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    newPassword:stringWith6Char,
                    confirmedNewPassword:stringWith10Char
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "Password Must Match",
            ]});
        })

        it("Should return an error when passwords are less than 6 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    newPassword:stringWith5Char,
                    confirmedNewPassword:stringWith5Char
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "newPassword length must be at least 6 characters long",
            ]});
        })

        it("Should return an error when passwords are more than 24 characters",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    newPassword:stringWith25Char,
                    confirmedNewPassword:stringWith25Char
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "newPassword length must be less than or equal to 24 characters long",
            ]});
        })

        it("Should pass successfully when passwords are set to maximum allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    newPassword:stringWith24Char,
                    confirmedNewPassword:stringWith24Char
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })

        it("Should pass successfully when passwords are set to minimum allowed allowed",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    newPassword:stringWith6Char,
                    confirmedNewPassword:stringWith6Char
                }
            } as Request;
            validateResetPasswordViaCode(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing validateForgotPassword middleware",()=>{
        it("Should return an error when email is missing",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as Request;
            validateForgotPassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email is required",
            ]});
        })

        it("Should return an error when email is less than minimum or invalid",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith5Char,
                }
            } as Request;
            validateForgotPassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email must be a valid email",
                "email length must be at least 6 characters long",
            ]});
        })

        it("Should return an error when email is more than maximum",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith65Char,
                }
            } as Request;
            validateForgotPassword(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "email length must be less than or equal to 64 characters long",
            ]});
        })

        it("Should pass successfully when email set to max allowed (64 characters)",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith64Char,
                }
            } as Request;
            validateForgotPassword(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })


        it("Should pass successfully when email set to min allowed (6 characters)",()=>{
           const { next,res } = createResponseNext()
            const req = {
                body:{
                    email:emailWith6Char,
                }
            } as Request;
            validateForgotPassword(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing validateUserChangeInformation middleware",()=>{
        const oneYear = 1000 * 60 * 60 * 24 * 365
        const oneDay = 1000 * 60 * 60 * 24
        const fiveYearsAndOneDay = (oneYear * 5) + oneDay;
        const eigthyYearsMinusOneDay = (oneYear * 80) - oneDay;
        it("Should return error that all fields are required",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    
                }
            } as unknown as Request;
            validateUserChangeInformation(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "value failed custom validation because : At least one of the following fields is required: firstName, lastName, email, mobileNumber, birthdate",
            ]})
        })

        it("Should pass successfully when all arguments set to minimum values",()=>{
            const { next,res } = createResponseNext();
            const req = {
                body: {
                    firstName:stringWith4Char,
                    lastName:stringWith4Char,
                    email:emailWith6Char,
                    birthdate:Date.now() - fiveYearsAndOneDay,
                    mobileNumber:stringWith6Char
                }
            } as unknown as Request;
            validateUserChangeInformation(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass successfully when all arguments set to maximum values",()=>{
            const { next,res } = createResponseNext();
            const req = {
                body: {
                    firstName:stringWith32Char,
                    lastName:stringWith32Char,
                    email:emailWith64Char,
                    birthdate:Date.now() - eigthyYearsMinusOneDay,
                    mobileNumber:stringWith15Char
                }
            } as unknown as Request;
            validateUserChangeInformation(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should return an error when values set to more than maximum",()=>{
            const { next,res } = createResponseNext();
            const req = {
                body: {
                    firstName:stringWith33Char,
                    lastName:stringWith33Char,
                    email:emailWith65Char,
                    birthdate:Date.now() - (eigthyYearsMinusOneDay + oneDay),
                    mobileNumber:stringWith16Char
                }
            } as unknown as Request;
            validateUserChangeInformation(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "firstName length must be less than or equal to 32 characters long",
                "lastName length must be less than or equal to 32 characters long",
                "email length must be less than or equal to 64 characters long",
                "mobileNumber length must be less than or equal to 15 characters long",
            ]})
        })

        it("Should return an error when values set to less than minimum or when email is invalid",()=>{
            const { next,res } = createResponseNext();
            const req = {
                body: {
                    fullName:stringWith3Char,
                    lastName:stringWith3Char,
                    email:emailWith5Char,
                    birthdate:Date.now() - (eigthyYearsMinusOneDay + oneDay),
                    mobileNumber:stringWith5Char
                }
            } as unknown as Request;
            validateUserChangeInformation(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "lastName length must be at least 4 characters long",
                "email must be a valid email",
                "email length must be at least 6 characters long",
                "mobileNumber length must be at least 6 characters long",
            ]})
        })
    })

})