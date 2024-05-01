import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import mongoose from "mongoose";
import {Request,Response} from "express"
import { authenticateAdmin, authenticateUser } from "../../middlewares/authenticate"
import testData from "../assets/testData/testData.json"
import dotenv from "dotenv";
import { createResponseNext, createUserTokenAndCache } from "../utils/helperTestFunctions.test";
import AppError from "../../utils/AppError";
jest.mock("../../utils/AppError")

dotenv.config();
describe("Authentication Middlewares",()=>{
    const userTokenWithNotExistingUser = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4bWFwbGVAZ21haWwuY29tIiwiaWQiOiI2NWVmNTI5MTE4MmI2YTA2OThjMmNlZDMiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTgxNjIzOTAyMn0.Couqrbu3bCopHwgUDhXUyiEBlRGmOurLf-jZLdifB0w"
    const expiredAdminToken = testData.expiredAdminToken;
    const correctNotExpiredAdminTokenThatDoesNotExistInDB = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik1vaGFtbWFkS2hhZGVycjE5OTlAZ21haWwuY29tIiwiaWQiOiI2NWU3ODJlZDM2OGMyMmUzNTQyMmY0YWQiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTgyNjIzOTAyMn0.LaDiu-G1uME_DJiCFRqThJXWoL47emlnUfQi2dfD7Lc"
    const expiredNormalUserToken = testData.expiredNormalUserToken;
    let notAdminToken : string;let userToken : string;
    
    const userId = testData.adminUserId;
    let normalUserId = testData.normalUserId;
    
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        userToken = await createUserTokenAndCache(userId) as string;
        notAdminToken = await createUserTokenAndCache(normalUserId) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })
    
    describe("Authenticate Admin",()=>{
        
        it("Should authenticate admin pass the middle ware and set user inside request",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: userToken
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(typeof req.headers.authorization).toBe("string");
            expect(AppError).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })
        it("Should return error token is malformed and call the next function when its admin token",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: userToken+"qwdqwdd"
                }
            } as Request;
            await authenticateAdmin(req,res,next);
            expect(next).toHaveBeenCalledTimes(1)
            expect(req.user).toBeUndefined()
        })

        it("Should return an error and call the next function with it token is expired when its admin token",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: expiredAdminToken
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(AppError).not.toHaveBeenCalled();
            expect(req.user).not.toBeDefined()
        })

        it("Should return an error with status 401 and send error message 'Unauthorized - Session id is not provided' ",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(AppError).toHaveBeenCalledWith("Unauthorized - Session id is not provided", 401)
            expect(req.user).not.toBeDefined()
        })

        it("Should return an error with status 401 with sendStatus function when user is not admin",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: notAdminToken
                }
            } as Request;
            
            await authenticateAdmin(req,res,next);
            expect(AppError).toHaveBeenCalledWith("Unauthorized", 401);
            expect(req.user).toBeUndefined();
        })

        it("Should return an error with status 401 with sendStatus function when token is correct and does not exist in DB",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: correctNotExpiredAdminTokenThatDoesNotExistInDB
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(AppError).toHaveBeenCalledWith("Unauthorized", 401);
            expect(req.user).toBeUndefined()
        })

        it("Should return an error with status 401 with sendStatus function when user is not found",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body: {},
                headers: {
                    authorization: userTokenWithNotExistingUser
                }
            } as Request;
            await authenticateAdmin(req,res,next)

            expect(AppError).toHaveBeenCalledWith("Unauthorized", 401);
            expect(req.user).toBeUndefined()
        })
    })

    describe("Authenticate User",()=>{
        
        it("Should return error with status code 401 and error message using status function",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{},
                headers: {
                    
                }
            } as Request;
            await authenticateUser(req,res,next)
            expect(AppError).toHaveBeenCalledWith("Unauthorized - Session id is not provided", 401);
            expect(req.user).toBeUndefined()
        })


        it("Should return error token expired error and call the next function when its not admin token token",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{},
                headers: {
                    authorization:expiredNormalUserToken
                }
            } as Request;
           
            await authenticateUser(req,res,next);
            expect(next).toHaveBeenCalledTimes(1)
            expect(req.user).toBeUndefined()
        })
        
        it("Should return error token is malformed and call the next function when token is not admin token token",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{},
                headers: {
                    authorization:notAdminToken+"wqdd"
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(next).toHaveBeenCalledTimes(1)
            expect(req.user).toBeUndefined()
        })

        it("Should pass successfully when token is for normal user and return user in request and not call AppError",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{},
                headers: {
                    authorization:notAdminToken
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(AppError).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })

        it("Should pass successfully when token is for an admin and return user in request and not call AppError",async()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{},
                headers: {
                    authorization:userToken
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(AppError).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })
    })
})