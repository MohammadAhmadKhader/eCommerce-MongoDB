import {  getAdminUserTokenTestData, getAdminUserIdTestData, setTestData } from '../../utils/HelperFunctions';
import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import SessionToken from '../../models/sessionToken';
import User from '../../models/user';
import { faker } from '@faker-js/faker';
import { ObjectId } from 'mongodb';
import "../../config/cloudinary";
import CloudinaryUtils from '../../utils/CloudinaryUtils';
import ResetPassCode from '../../models/resetPassCode';
import crypto from 'crypto';
import MailUtils from '../../utils/MailUtils';

const app = createServer()

describe("Users",()=>{
    const testDataFilePath = "./src/__tests__/assets/testData/testData.json";
    const imagePath = "./src/__tests__/assets/images/testImage.jpg"
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
        it("Should create a user and return success message with token",async()=>{
            const user = {
                firstName:faker.person.firstName(),
                lastName:faker.person.lastName(),
                email:faker.internet.email({firstName:faker.person.firstName(),lastName:`${faker.person.lastName()}_${faker.number.int({min:1,max:5000})}`}),
                password:process.env.USER_TEST_PASSWORD,
            };
            const {body,statusCode} = await supertest(app).post("/api/users/signup").send(user);
            
            expect(statusCode).toBe(201);
            expect(body.user).toBeDefined();
            expect(body.user.password).toBeUndefined();
            expect(body.message).toBe("success");
            expect(typeof body.token).toBe("string");
            expect(body.token.length).toBeGreaterThan(0);
        })

        it("Should return an error with status code 500 with error that email already exist",async()=>{
            const user = {
                firstName:faker.person.firstName(),
                lastName:faker.person.lastName(),
                email:"Alvis93@yahoo.com",
                password:faker.internet.password(),
            };
            const {body,statusCode} = await supertest(app).post("/api/users/signup").send(user);
            expect(statusCode).toBe(500);
            expect(body.user).toBeUndefined();
            expect(body.token).toBeUndefined();
        })
    })

    describe("User sign in",()=>{  
        const userTestEmail = "Elaina_OKon_40879312705945643@yahoo.com";
        const userTestPassword = process.env.USER_TEST_PASSWORD as string;
        const wrongEmail = "WrongEmail@gmal.com";
        const wrongPassword = "wrongPassword";
        it("Should sign in successfully and update token for testData file",async()=>{
           const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate");
           try{
                const {body,statusCode} = await supertest(app).post("/api/users/signin").send({
                    email:userTestEmail,
                    password:process.env.USER_TEST_PASSWORD,
                });

                expect(statusCode).toBe(200);
                expect(typeof body.token).toBe("string");
                expect(body.token.length).toBeGreaterThan(0);
                expect(testSessionTokenFindOneAndUpdate).toHaveBeenCalledTimes(1)
           }catch(error){
                throw error;
           }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
           }
        })

        it("Should return an error when email is wrong",async()=>{
            const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).post("/api/users/signin").send({
                    email:wrongEmail,
                    password:userTestPassword,
                });

                expect(statusCode).toBe(401);
                expect(body).toStrictEqual({error:"Invalid email or password"});
                expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
            }catch(error){
                throw error;
            }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
            }
         })

         it("Should return an error when password is wrong",async()=>{
            const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).post("/api/users/signin").send({
                    email:userTestEmail,
                    password:wrongPassword,
                });

                expect(statusCode).toBe(401);
                expect(body).toStrictEqual({error:"Invalid email or password"});
                expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
            }catch(error){
                throw error;
            }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
            }
         })
    })

    // Should be refactored to make a complete isolation
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
            const test = jest.spyOn(SessionToken,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put("/api/users/changepassword").send({
                    oldPassword:lastPassword,
                    newPassword:newPassword,
                    confirmNewPassword:newPassword,
                    userId:userIdToChangePassword
                }).set("Authorization",newPasswordUserToken)
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expect(body.token.length).toBeGreaterThan(0);
                expect(typeof body.token).toBe("string");
                setTestData(testDataFilePath,newPassword,"newPassword")
                setTestData(testDataFilePath,body.token,"newPasswordUserToken")
                expect(test).toHaveBeenCalledTimes(1)
            }catch(error){
                console.error(error)
            }finally{
                test.mockRestore();
            }
        })

        it("Should return an error when password is not correct",async()=>{
            const testSessionTokenFindOneAndUpdate = jest.spyOn(SessionToken,"findOneAndUpdate");
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate");
            const wrongPassword = "wrongPassword"
            try{
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
            }catch(error){

            }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
                testUserFindOneAndUpdate.mockRestore();
            }
        })
    })

    describe("User logout",()=>{
        const userTokenToSignOut = testData.userTokenToSignOut;
        const userIdToSignOut = "65ef5891082b6a0698d5cee3";
        const userEmailToSignOut = "Keara.Bogisich@gmail.com";
        it("User should sign out and return status code 204 and its token must be deleted",async()=>{
            const testSignOut = jest.spyOn(SessionToken,"deleteOne");
            try{
                const {statusCode} = await supertest(app).delete("/api/users/logout").set("authorization",userTokenToSignOut);
                expect(statusCode).toBe(204)
                expect(testSignOut).toHaveBeenCalledWith({
                    userId:new ObjectId(userIdToSignOut),
                    token:userTokenToSignOut
                });
                
            }catch(error){
                throw error;
            }finally{
                testSignOut.mockRestore();
            }
            
        })
        afterAll(async()=>{
            const {body} = await supertest(app).post("/api/users/signin").send({
                email:userEmailToSignOut,
                password:process.env.USER_TEST_PASSWORD,
            });
            setTestData(testDataFilePath,body.token,"userTokenToSignOut");
        })
    })

    describe("User change information",()=>{
        const userIdToUpdateWithoutImg = "65ef5891082b6a0698d5cee1";
        const userIdToUpdateWithImg = "65ef5891082b6a0698d5cedf";
        const userIdToUpdateBeforeOneWeekIsFinished = "6626921b7a6e757723b59431"
        let imageBeforeUpdating:string;
        beforeAll(async()=>{
            const twoWeeks =  1209600000
            try{
                await User.findOneAndUpdate({_id:userIdToUpdateBeforeOneWeekIsFinished},{$set:{updatedAt:Date.now()}});
                const userToUpdateWithImg = await User.findOneAndUpdate({_id:userIdToUpdateWithImg},{$set:{updatedAt:Date.now() - twoWeeks}},{timestamps:false});
                await User.findOneAndUpdate({_id:userIdToUpdateWithoutImg},{$set:{updatedAt:Date.now() - twoWeeks}},{timestamps:false});
                imageBeforeUpdating = userToUpdateWithImg?.userImg as string;
            }catch(error){
                throw error
            }
        })
        const userFirstName = faker.person.firstName();
            const userLastName = faker.person.lastName();
        it("Should return success message and status code 200 and user after update without updating image",async()=>{
            const userTokenToUpdateWithoutImg = testData.userTokenToUpdateWithoutImg;
            const userEmail = faker.internet.email();
            const mobileNumber = "0592718312812";
            const birthdate = faker.date.birthdate();

            const {body,statusCode} = await supertest(app).put(`/api/users/${userIdToUpdateWithoutImg}`)
            .field("firstName",userFirstName).field("lastName",userLastName)
            .field("email",userEmail).field("mobileNumber",mobileNumber)
            .field("birthdate",birthdate.toJSON())
            .set("authorization",userTokenToUpdateWithoutImg);

            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(body.user).toBeDefined();
            expect(body.user.password).toBeUndefined();
            expect(body.user.email).toBe(userEmail);
            expect(body.user.firstName).toBe(userFirstName);
            expect(body.user.lastName).toBe(userLastName);
            expect(body.user.mobileNumber).toBe(mobileNumber);
            expect(body.user.birthdate).toBe(birthdate.toJSON());
            expect(typeof body.user.userImg).toBe("string");
            expect(body.user._id).toBe(userIdToUpdateWithoutImg);
            
        })

        it("Should return success message and status code 200 and user after update with updating image",async()=>{
            const testUploadingImage = jest.spyOn(CloudinaryUtils,"UploadOne");
            try{
                const userTokenToUpdateWithImg = testData.userTokenToUpdateWithImg;
                const userEmail = faker.internet.email();
                const mobileNumber = "0592718312812";
                const birthdate = faker.date.birthdate();

                const {body,statusCode} = await supertest(app).put(`/api/users/${userIdToUpdateWithImg}`)
                .field("firstName",userFirstName).field("lastName",userLastName)
                .field("email",userEmail).field("mobileNumber",mobileNumber)
                .field("birthdate",birthdate.toJSON()).attach("userImg",imagePath)
                .set("authorization",userTokenToUpdateWithImg);
                
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expect(body.user).toBeDefined();
                expect(body.user.password).toBeUndefined();
                expect(body.user.email).toBe(userEmail);
                expect(body.user.firstName).toBe(userFirstName);
                expect(body.user.lastName).toBe(userLastName);
                expect(body.user.mobileNumber).toBe(mobileNumber);
                expect(body.user.birthdate).toBe(birthdate.toJSON());
                expect(typeof body.user.userImg).toBe("string");
                expect(body.user.userImg).not.toBe(imageBeforeUpdating);
                expect(body.user._id).toBe(userIdToUpdateWithImg);
                expect(testUploadingImage).toHaveBeenCalledTimes(1);
            }catch(error){
                throw error;
            }finally{
                testUploadingImage.mockRestore();
            }
        })

        it("Should return an error with 400 status code when a normal user try to update once in same week",async()=>{
            const userTokenToUpdateBeforeOneWeekIsFinished = testData.userTokenToUpdateBeforeOneWeekIsFinished;
            const {body,statusCode} = await supertest(app).put(`/api/users/${userIdToUpdateWithImg}`)
            .field("firstName",userFirstName).field("lastName",userLastName)
            .set("authorization",userTokenToUpdateBeforeOneWeekIsFinished);
            expect(statusCode).toBe(400)
            expect(body).toStrictEqual({
                   error: "Normal User only allowed to change his information once per week",
            })
        })
    })

    describe("User reset password via code",()=>{
        let linkToken:string;
        const userIdToResetPasswordByResetToken = "65ef5891082b6a0698d5ceeb";
        const newPassword = faker.internet.password();
        let IdResetPassCodeToDelete : string;
        beforeAll(async()=>{
            const resetToken = crypto.randomBytes(32).toString("hex");
            const resetCode = await ResetPassCode.create({
                userId:new ObjectId(userIdToResetPasswordByResetToken),
                code:resetToken,
            });
            linkToken = resetCode.code as string;
            IdResetPassCodeToDelete = resetCode._id.toString();
        })
        it("Should return success with message = success and status code 200",async()=>{
            const testTestPassCodeFindOne = jest.spyOn(ResetPassCode,"findOne");
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).patch(`/api/users/resetPassword/${linkToken}`).send({
                    newPassword:newPassword,
                    confirmedNewPassword:newPassword,
                });
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expect(testTestPassCodeFindOne).toHaveBeenCalledTimes(1);
                expect(testUserFindOneAndUpdate).toHaveBeenCalledTimes(1);
            }catch(error){
                throw error;
            }finally{
                testTestPassCodeFindOne.mockRestore();
                testUserFindOneAndUpdate.mockRestore();
            }
        })

        it("Should return an error with status code 403 that PassCode is wrong or expired",async()=>{
            const wrongToken = "WrongToken"
            const testTestPassCodeFindOne = jest.spyOn(ResetPassCode,"findOne");
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate");
            try{
                const {statusCode} = await supertest(app).patch(`/api/users/resetPassword/${wrongToken}`).send({
                    newPassword:newPassword,
                    confirmedNewPassword:newPassword,
                });

                expect(statusCode).toBe(403);
                expect(testTestPassCodeFindOne).toHaveBeenCalledTimes(1);
                expect(testUserFindOneAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                throw error;
            }finally{
               testTestPassCodeFindOne.mockRestore();
               testUserFindOneAndUpdate.mockRestore(); 
            }
        })
        afterAll(async()=>{
            await ResetPassCode.deleteOne({
                _id:new ObjectId(IdResetPassCodeToDelete),
            });
        })
    })

    describe("User forgotPassword",()=>{
        const correctEmail = "Ila_Tillman@gmail.com";
        const incorrectEmail = "incorrectEmail@example.com";
        it("Should return success message with status code 200",async()=>{
            const testSendMessageToEmail = jest.spyOn(MailUtils,"SendToResetPassword");
            try{
                const {body,statusCode} = await supertest(app).post("/api/users/forgotPassword").send({
                    email:correctEmail
                });

                expect(statusCode).toBe(202);
                expect(body.message).toBe("success");
                expect(testSendMessageToEmail).toHaveBeenCalled();
            }catch(error){
                throw error;
            }finally{
                testSendMessageToEmail.mockRestore();
            }
        })

        it("Should return an error with status code 401",async()=>{
            const testSendMessageToEmail = jest.spyOn(MailUtils,"SendToResetPassword");
            try{
                const {body,statusCode} = await supertest(app).post("/api/users/forgotPassword").send({
                    email:incorrectEmail
                });

                expect(statusCode).toBe(401);
                expect(body);
                expect(testSendMessageToEmail).not.toHaveBeenCalled()
            }catch(error){
                throw error;
            }finally{
                testSendMessageToEmail.mockRestore();
            } 
        })
    })

    describe("User verifyResetPasswordToken",()=>{
        let passCodeToTest = "07e348649dfd387b9254947c0c5890f599cfada66e94521582552baed9a01ece"
        const wrongPassCodeToTest = "WrongPassCode"
        it("Should return an error with status code 400 that ResetPassCode was not found",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/users/verifyResetPasswordToken/${wrongPassCodeToTest}`);
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({
                error: "Token was not found",
            })
        })

        it("Should pass successfully and return message equal success",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/users/verifyResetPasswordToken/${passCodeToTest}`);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success")
        })
    })
})