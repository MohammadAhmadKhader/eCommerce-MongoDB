import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import mongoose from "mongoose";
import {Request,Response} from "express"
import { authenticateAdmin, authenticateUser } from "../../middlewares/authenticate"
//@ts-expect-error
import testData from "../assets/testData/testData.json"
import dotenv from "dotenv";

dotenv.config();
describe("Authentication Middlewares",()=>{
    const userTokenWithNotExistingUser = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4bWFwbGVAZ21haWwuY29tIiwiaWQiOiI2NWVmNTI5MTE4MmI2YTA2OThjMmNlZDMiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTgxNjIzOTAyMn0.Couqrbu3bCopHwgUDhXUyiEBlRGmOurLf-jZLdifB0w"
    const expiredAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik1vaGFtbWFkS2hhZGVycjE5OTlAZ21haWwuY29tIiwiaWQiOiI2NWU3ODJlZDM2OGMyMmUzNTQyMmY0YWQiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUyNjIzOTAyMn0.AOao3GNwQi3ocHZQ-tUsBBgQOx33Pj3YM4VGhOkgCJ8"
    const userToken = testData.adminUserToken;
    const correctNotExpiredAdminTokenThatDoesNotExistInDB = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Ik1vaGFtbWFkS2hhZGVycjE5OTlAZ21haWwuY29tIiwiaWQiOiI2NWU3ODJlZDM2OGMyMmUzNTQyMmY0YWQiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTgyNjIzOTAyMn0.LaDiu-G1uME_DJiCFRqThJXWoL47emlnUfQi2dfD7Lc"
    const notAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZWY1ODkxMDgyYjZhMDY5OGQ1Y2VkOCIsImVtYWlsIjoiTmljb2xhczYxQHlhaG9vLmNvbSIsImlhdCI6MTcxMzYyMDcxMywiZXhwIjoxNzE2MjEyNzEzfQ.j1mSUu8hcA376W-S0HZ3G5-bx1uMts_RmJCzAKdjtzY"
    const expiredNormalUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IlRoYWRkZXVzLkxpbmQ1QGdtYWlsLmNvbSIsImlkIjoiNjVlZjU4OTEwODJiNmEwNjk4ZDVjZWU5IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MjYyMzkwMjJ9.1yEIwBz5DjdQDw6qu3FbModHU_nGEOLzjyaMVijuNBg"
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })
    describe("Authenticate Admin",()=>{
        
        it("Should authenticate admin pass the middle ware and set user inside request",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: userToken
                }
            } as Request;
            const test = await authenticateAdmin(req,res,next)
            expect(typeof req.headers.authorization).toBe("string");
            expect(test).toBe(next());
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })

        it("Should return an error with status 500 from sendStatus function when token is malformed",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: userToken+"qwdqwdd"
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(500);
            expect(req.user).not.toBeDefined()
        })

        it("Should return an error with status 500 from sendStatus function when token is expired",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: expiredAdminToken
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(500);
            expect(req.user).not.toBeDefined()
        })


        it("Should return an error with status 401 with status function and send error message when token does not exist",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({error:"Unauthorized - Session id is not provided"});
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(req.user).not.toBeDefined()
        })

        it("Should return an error with status 401 with sendStatus function when user is not admin",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: notAdminToken
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(req.user).toBeUndefined()
        })

        it("Should return an error with status 401 with sendStatus function when token is correct and does not exist in DB",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: correctNotExpiredAdminTokenThatDoesNotExistInDB
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(req.user).toBeUndefined()
        })

        it("Should return an error with status 401 with sendStatus function when user is not found",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body: {},
                headers: {
                    authorization: userTokenWithNotExistingUser
                }
            } as Request;
            await authenticateAdmin(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(401);
            expect(req.user).toBeUndefined()
        })
    })

    describe("Authenticate User",()=>{
        
        it("Should return error with status code 401 and error message using status function",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{},
                headers: {
                    
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({error:"Unauthorized - Session id is not provided"});
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined()
        })



        it("Should return error with status code 500 using sendStatus when token is expired",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{},
                headers: {
                    authorization:expiredNormalUserToken
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(500);
            expect(req.user).toBeUndefined()
        })

        it("Should return error with status code 500 using sendStatus when token is malformed",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{},
                headers: {
                    authorization:notAdminToken+"wqdd"
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(500);
            expect(req.user).toBeUndefined()
        })

        it("Should pass successfully when token is for normal user and return user in request and not call json or status or sendStatus functions",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{},
                headers: {
                    authorization:notAdminToken
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })

        it("Should pass successfully when token is for an admin and return user in request and not call json or status or sendStatus functions",async()=>{
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                sendStatus:jest.fn()
            } as unknown as Response;
            const next = jest.fn(); 
            const req = {
                body:{},
                headers: {
                    authorization:userToken
                }
            } as Request;
           
            await authenticateUser(req,res,next)
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            expect(res.sendStatus).not.toHaveBeenCalled();
            expect(req.user).toBeDefined()
        })

    })
})