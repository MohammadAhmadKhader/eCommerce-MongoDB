import {  getAdminUserTokenTestData, getAdminUserIdTestData, setTestData } from './../utils/HelperFunctions';
import supertest from "supertest";
import createServer from "../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../utils/DatabaseTestHandler";
//@ts-expect-error
import testData from "./assets/testData/testData.json"
import SessionToken from '../models/sessionToken';
import User from '../models/user';

const app = createServer()

describe("Users",()=>{
    const testDataFilePath = "./src/__tests__/assets/testData/testData.json";
    let adminUserId : string;
    let adminUserToken: string;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        adminUserId = await getAdminUserIdTestData(testDataFilePath) as string;
        adminUserToken = await getAdminUserTokenTestData(testDataFilePath) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("User sign up",()=>{
        it("",async()=>{

        })
    })

    describe("User sign in",()=>{  
        const userTestEmail = "Margot_Greenfelder@yahoo.com";
        const userTestPassword = "newPassword#1";
        it("Should sign in successfully and update token for testData file",async()=>{
            const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate");
            const {body,statusCode} = await supertest(app).post("/api/users/signin").send({
                email:userTestEmail,
                password:userTestPassword,
            })
            expect(statusCode).toBe(200);
            expect(typeof body.token).toBe("string");
            expect(body.token.length).toBeGreaterThan(0);
            expect(testSessionTokenFindOneAndUpdate).toHaveBeenCalledTimes(1)
            testSessionTokenFindOneAndUpdate.mockRestore();
        })


    })

    describe("User changepassword",()=>{
        const userIdToChangePassword = "65ef5891082b6a0698d5cee9";
        const lastPassword = testData.newPassword;
        const newPasswordUserToken = testData.newPasswordUserToken;
        const password1 = "newPassword#1";
        const password2 = "newPassword#2";
        let newPassword : string;
        if(lastPassword == password2){
            newPassword = password1
        }else{
            newPassword = password2
        }
        it("Should change password successfully and return message is success with token and status code 200",async()=>{
            const test = jest.spyOn(SessionToken,"findOneAndUpdate")
            const {body,statusCode} = await supertest(app).put("/api/users/changepassword").send({
                oldPassword:lastPassword,
                newPassword:newPassword,
                confirmNewPassword:newPassword,
                userId:userIdToChangePassword
            }).set("Authorization",newPasswordUserToken)
            console.log(body)
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(body.token.length).toBeGreaterThan(0);
            expect(typeof body.token).toBe("string");
            setTestData(testDataFilePath,newPassword,"newPassword")
            setTestData(testDataFilePath,body.token,"newPasswordUserToken")
            expect(test).toHaveBeenCalledTimes(1)
            test.mockRestore();
        })

        it("Should return an error when password is not provided",async()=>{
            const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate")
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate")
            const wrongPassword = "wrongPassword"
            const {body,statusCode} = await supertest(app).put("/api/users/changepassword").send({
                oldPassword:wrongPassword,
                newPassword:newPassword,
                confirmNewPassword:newPassword,
            }).set("Authorization",newPasswordUserToken)
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({error:"Invalid password"});
            expect(body.token).toBeUndefined()
            expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
            expect(testUserFindOneAndUpdate).not.toHaveBeenCalled()
            testSessionTokenFindOneAndUpdate.mockRestore();
            testUserFindOneAndUpdate.mockRestore();
        })
    })

    describe("User logout",()=>{
        it("User should sign out and its token must be deleted",async()=>{

        })
    })

    describe("User change information",()=>{
        it("",async()=>{

        })
    })

    describe("User reset password via code",()=>{
        it("",async()=>{

        })
    })

    describe("User forgotPassword",()=>{
        it("",async()=>{

        })
    })

    describe("User verifyResetPasswordToken",()=>{
        it("",async()=>{

        })
    })
})