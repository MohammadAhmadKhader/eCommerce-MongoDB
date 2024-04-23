import { validateAddToWishList, validateAddingToCart, validateChangeCartItemQuantityByOne, validateCreatingAddress, validateDeleteUserReview, validateDeletingFromCart, validateEditUserReview, validateForgotPassword, validateRemoveFromWishlist, validateResetPasswordViaCode, validateSendingMessage, validateUserSignIn } from '../../middlewares/validationsFunctions';
import { Request, Response } from 'express';
import { validateUserRegistration,validateUserChangePassword, validateUserReview, validateCreateProduct, validateUpdatingAddress } from '../../middlewares/validationsFunctions';

describe("Validation Middlewares",()=>{
    const stringWith25Char = "2i3n8sLqAe7z0m9c6R4s2W1t8";
    const stringWith24Char = "2i3n8sLqAe7z0m9c6R4s2W18";
    const stringWith65Char = "7xG3o9pN2fL6eK1rI0jR4tF5kG9iJ4oP0qL2mR6hA1sV9uE3vC4bR8zX5tG6a3";
    const stringWith33Char = "9oP2qR5tF8kG1iJ4oP0qL2mR6hA1sV9uE3vC4b";
    const emailWith5Char = "E@g.c"
    const emailWith6Char = "a@g.us";
    const emailWith64Char = "3Ji7lHvF0eR4wTxY2qLm5oI9pZ8kE1dG4hN6dwqwqdwwwbV9aX3c@example.com";
    const emailWith65Char = "3sJi7lHvF0eR4wTxY2qLm5oI9pZ8kE1dG4hN6dwqwqdwwwbV9aX3c@example.com";
    const stringWith4Char = "name";
    const stringWith3Char = "Cha";
    const stringWith5Char = "namee";
    const stringWith6Char = "123456";
    const stringWith10Char = "123456dqwdw";
    const stringWith32Char = "9oP2qR5tF8kG1iqL2mR6hA1sV9uE3vC4";
    const stringWith257Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB48eXgr1d6PSkUVRIiMf6g0C1vL8t"
    const stringWith256Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB48eXgr1d6PSkUVRIiMf6g0C1vL8"
    const stringWith62Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo8DVI"
    const stringWith63Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo8DVIB"
    const stringWith15Char = "9fxjE5pUW4y2mVv"
    const stringWith16Char = "9fxjE5pUW4y2mVva"
    const stringWith12Char = "9fxjE5pUW4y2"
    const stringWith9Char = "9fxjE5pUW"
    const stringWith13Char = "9fxjE5pUW4y2a"
    const stringWith1024Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v9fxjEvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYmYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB4C1vL8tB4Ad"
    const stringWith1025Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v4cYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB49fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYm0oYP7v9fxjEvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo7FpAs2kJzlxpOw8X4sNPyCdRFMziN2eo0HQRq3rAxXvMdjbZdHXbFVYmYmBl39LHTAbh9Vd8vLjiX6YjxRHwQYnBoZJuQn0PEcLXyFfCFh1BrT2OLkC33jt9hEDZuAPX5dx9nG38eXgr1d6PSkUVRIiMf6g0C1vL8tB4C1vL8tB4Ada"
    const stringWith100Char ="9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo8DVIB9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJF"
    const stringWith101Char = "9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJFWktVpvHbqnzLdta8DVIBo8DVIB9fxjE5pUW4y2mVvRQ6gDrMbo0GHN8PcSXKsJF"
    const maxPrice = 1000;
    const minPrice = 0;
    const minOffer = 0.00;
    const maxOffer = 1.00;
    const stringWith2Char = "ab";
    const hexWith23Char = "65e7d89b62bb29693a0d1c5"
    const hexWith25Char = "65e7d89b62bb29693a0d1c589"
    const hexWith24Char = "65e7d89b62bb29693a0d1c58"

    describe("Testing user registration validator middleware",()=>{ 
        it("Should return an error that all given data is empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing user change password middleware",()=>{
        it("Should return error with oldPassword and newPassword are empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing user sign in middleware",()=>{
        it("Should return an error when all fields are empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing user validateResetPasswordViaCode middleware",()=>{
        it("Should return an error when all fields are empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing user validateForgotPassword middleware",()=>{
        it("Should return an error when email is missing",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing user add review to product middle ware",()=>{
        it("Should return an error with all data empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:"",
                    comment:"",
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                    "rating must be one of [1, 2, 3, 4, 5]",
                    "rating must be a number",
                    "comment is not allowed to be empty",
            ]});
        })

        it("Should return an error with comment less than 4 characters",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:stringWith3Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "comment length must be at least 4 characters long",
            ]});
        })

        it("Should return an error with comment more than 256 characters",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:stringWith257Char,
                }
            } as Request;
            validateUserReview(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "comment length must be less than or equal to 256 characters long",
            ]});
        })

        it("Should not call json and not call status and test pass with comment 4 char",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:stringWith4Char,
                }
            } as Request;
            const test = validateUserReview(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })

        it("Should not call json and not call status and test pass with comment 256 characters",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:stringWith256Char,
                }
            } as Request;
            const test = validateUserReview(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        })
    })

    describe("Testing creating address middleware",()=>{
        it("Should return error with all data is required",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
                "pinCode is required",
            ]})
        })

        it("Should return error with all data empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            validateCreatingAddress(req,res,next)
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    
                }
            } as Request;
            validateUpdatingAddress(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:"one field at least is required"})
        })

        it("Should return error with all data empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing creating product middleware",()=>{
        it("Should return an error with all fields are required",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
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

    describe("Testing sending message middleware",()=>{
        it("Should return an error that all fields ar empty",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    
                }
            } as Request;
            validateSendingMessage(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName is required",
                "email is required",
            ]})
        })

        it("Should return an error that all fields are less than the minimum length allowed and invalid email",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    fullName:stringWith3Char,
                    email:emailWith5Char,
                    subject:stringWith3Char,
                    message:stringWith3Char,
                }
            } as Request;
            validateSendingMessage(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "fullName length must be at least 4 characters long",
                "email must be a valid email",
                "email length must be at least 6 characters long",
                "subject length must be at least 4 characters long",
                "message length must be at least 4 characters long",
            ]})

            
        })
        it("Should return an error that all fields are more than the maximum length allowed and invalid email",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        fullName:stringWith33Char,
                        email:emailWith65Char,
                        subject:stringWith33Char,
                        message:stringWith257Char,
                    }
                } as Request;
                validateSendingMessage(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "fullName length must be less than or equal to 32 characters long",
                    "email length must be less than or equal to 64 characters long",
                    "subject length must be less than or equal to 32 characters long",
                    "message length must be less than or equal to 256 characters long",
                ]})
         })

        it("Should pass with maximum length for all fields",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    fullName:stringWith32Char,
                    email:emailWith64Char,
                    subject:stringWith32Char,
                    message:stringWith256Char,
                }
            } as Request;
            const test = validateSendingMessage(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })

        it("Should pass with minimum length for all fields",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    fullName:stringWith4Char,
                    email:emailWith6Char,
                    subject:stringWith4Char,
                    message:stringWith4Char,
                }
            } as Request;
            const test = validateSendingMessage(req,res,next);
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing cart Middlewares",()=>{
        describe("Testing validatAddingToCart middleware",()=>{
            it("Should return an error that all fields are empty",()=>{
                    const res = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn()
                    } as unknown as Response;
                    const next = jest.fn(); 
                    const req = {
                        body:{

                        }
                    } as Request;
                    validateAddingToCart(req,res,next);
                    expect(res.status).toHaveBeenCalledWith(400);
                    expect(res.json).toHaveBeenCalledWith({error:[
                        "productId is required",
                         "quantity is required",
                    ]})
            })

            it("Should return an error when quantity is not integer",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        quantity:1.5
                    }
                } as Request;
                validateAddingToCart(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "quantity must be an integer"
                ]})
            })

            it("Should return an error when quantity is minus",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        quantity:-1
                    }
                } as Request;
                validateAddingToCart(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "quantity must be greater than or equal to 1",
                ]})
            })

            it("Should return an error when productId is not hex 24 length",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith25Char,
                        quantity:1
                    }
                } as Request;
                validateAddingToCart(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "productId length must be 24 characters long",
                ]})
            })

            it("Should pass successfully when quantity is 1 and productId is hex 24 length",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        quantity:1
                    }
                } as Request;
                validateAddingToCart(req,res,next);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled()
            })

            it("Should pass successfully when quantity is more than 1 and positive and productId is hex 24 length",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        quantity:5
                    }
                } as Request;
                validateAddingToCart(req,res,next);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled()
            })
        })
        
        describe("Testing validateChangeCartItemQuantityByOne middleware",()=>{
            it("Should return an error that all fields are empty",()=>{
                    const res = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn()
                    } as unknown as Response;
                    const next = jest.fn(); 
                    const req = {
                        body:{

                        }
                    } as Request;
                    validateChangeCartItemQuantityByOne(req,res,next);
                    expect(res.status).toHaveBeenCalledWith(400);
                    expect(res.json).toHaveBeenCalledWith({error:[
                        "productId is required",
                        "cartItemId is required",
                        "operation is required",
                    ]})
            })

            it("Should return an error when operation is not +1 or -1",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        cartItemId:hexWith24Char,
                        operation:"+2"
                    }
                } as Request;
                validateChangeCartItemQuantityByOne(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "operation must be one of [+1, -1]",
                ]})
            })

            it("Should pass successfully when productId cartItemId are hex 24 length and operation is +1",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        cartItemId:hexWith24Char,
                        operation:"+1"
                    }
                } as Request;
                validateChangeCartItemQuantityByOne(req,res,next);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled()
            })

            it("Should pass successfully when productId cartItemId are hex 24 length and operation is -1",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        productId:hexWith24Char,
                        cartItemId:hexWith24Char,
                        operation:"-1"
                    }
                } as Request;
                validateChangeCartItemQuantityByOne(req,res,next);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled()
            })
        })

        describe("Testing validateDeletingFromCart middleware",()=>{
            it("Should return an error that all fields are empty",()=>{
                    const res = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn()
                    } as unknown as Response;
                    const next = jest.fn(); 
                    const req = {
                        body:{

                        }
                    } as Request;
                    validateDeletingFromCart(req,res,next);
                    expect(res.status).toHaveBeenCalledWith(400);
                    expect(res.json).toHaveBeenCalledWith({error:[
                        "cartItemId is required",
                    ]})
            })

            it("Should return an error when cartItem Id is not 24 length",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        cartItemId:hexWith25Char, 
                    }
                } as Request;
                validateDeletingFromCart(req,res,next);
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({error:[
                    "cartItemId length must be 24 characters long",
                ]})
            })

            it("Should pass successfully when cartItemId is hex 24 length",()=>{
                const res = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn()
                } as unknown as Response;
                const next = jest.fn(); 
                const req = {
                    body:{
                        cartItemId:hexWith24Char,
                    }
                } as Request;
                validateDeletingFromCart(req,res,next);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled()
            })
        })
    })

    describe("Testing validateAddToWishList middleware",()=>{
        it("Should return an error that productId is required",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{

                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId is required",
            ]})
        })

        it("Should return an error that when productId is length 24 and not hex",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:stringWith24Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error that when productId is not string",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:[]
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must be a string",
            ]})
        })

        it("Should return an error that when productId is length is not 24",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:hexWith25Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when productId is hex 24 length",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:hexWith24Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing validateRemoveFromWishlist middleware",()=>{
        it("Should return an error that wishlistItemtId is required",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{

                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId is required",
            ]})
        })

        it("Should return an error that when wishlistItemId is length 24 and not hex",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    wishlistItemId:stringWith24Char
                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error that when wishlistItemId is not string",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    wishlistItemId:[]
                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId must be a string",
            ]})
        })

        it("Should return an error that when wishlistItemId is length is not 24",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    wishlistItemId:hexWith25Char
                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when wishlistItemId is hex 24 length",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    wishlistItemId:hexWith24Char
                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing validateEditUserReview middleware",()=>{
        it("Should return an error that all fields are equired",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{

                }
            } as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "rating is required",
                "comment is required",
                "reviewId is required",
            ]})
        })

        it("Should return an error when rating is invalid number",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1.5,
                    comment:"comment",
                    reviewId:hexWith24Char
                }
            } as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "rating must be one of [1, 2, 3, 4, 5]",
            ]})
        })

        it("Should return an error when rating is invalid number",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                    reviewId:stringWith24Char
                }
            } as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "reviewId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error when review length is not 24",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                    reviewId:hexWith25Char
                }
            } as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "reviewId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    rating:1,
                    comment:"comment",
                    reviewId:hexWith24Char
                }
            } as Request;
            validateEditUserReview(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing validateDeleteUserReview middleware",()=>{
        it("Should return an error that all fields are equired",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{

                }
            } as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId is required",
                "reviewId is required",
            ]})
        })

        it("Should return an error that productId and reviewId must 24 length",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:hexWith25Char,
                    reviewId:hexWith25Char
                }
            } as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId length must be 24 characters long",
                "reviewId length must be 24 characters long",
            ]})
        })

        it("Should return an error that productId and reviewId must be hex type",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:stringWith24Char,
                    reviewId:stringWith24Char
                }
            } as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must only contain hexadecimal characters",
                "reviewId must only contain hexadecimal characters",
            ]})
        })

        it("Should pass successfully when all parameters meet the conditions",()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{
                    productId:hexWith24Char,
                    reviewId:hexWith24Char
                }
            } as Request;
            validateDeleteUserReview(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })
})

// * Next To Do
// maximizing product images length to 10