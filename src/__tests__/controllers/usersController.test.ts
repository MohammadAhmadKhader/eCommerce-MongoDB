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
import MailUtils from '../../utils/MailUtils';
import { changeUserUpdateAt, createResetCode, createUserTokenAndCache, expectErrorMessage,  expectOperationalError } from '../utils/helperTestFunctions.test';
import { expectUser } from '../utils/userUtils.test';
import { IResetPassCode } from '../../@types/types';

const app = createServer()

describe("Users",()=>{
    const imagePath = "./src/__tests__/assets/images/testImage.jpg"
    const adminUserId = testData.adminUserId;
    let adminUserToken: string;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        adminUserToken = await createUserTokenAndCache(adminUserId) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("User sign up controller",()=>{
        const randomNum = faker.number.int({min:1,max:5000})
        const firstName = `James${randomNum}`;
        const lastName = `NotJames${randomNum}`;
        it("Should create a user and return success message with token",async()=>{
            const user = {
                firstName:firstName,
                lastName:lastName,
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
                firstName:firstName,
                lastName:lastName,
                email:"Alvis93@yahoo.com",
                password:faker.internet.password().substring(0,23),
            };
            const {body,statusCode} = await supertest(app).post("/api/users/signup").send(user);
            
            expect(statusCode).toBe(500);
            expectErrorMessage(body);
            expect(body.user).toBeUndefined();
            expect(body.token).toBeUndefined();
        })
    })

    describe("User sign in controller",()=>{  
        const userTestEmail = "elaina_okon_40879312705945643@yahoo.com";
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
                console.error(error)
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

                expect(body.message).toEqual("Invalid email or password");
                expectErrorMessage(body);
                expectOperationalError(body);
                expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
            }catch(error){
                console.error(error)
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
                expect(body.message).toEqual("Invalid email or password");
                expectErrorMessage(body);
                expectOperationalError(body);
                expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
            }catch(error){
                console.error(error)
                throw error;
            }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
            }
         })
    })

    // Should be refactored to make a complete isolation
    describe("User changepassword controller",()=>{
        const userIdToChangePassword = testData.userIdToChangePassword;
        const userIdWithWrongPassword = testData.userIdWithWrongPassword;
        let newPasswordUserToken : string;
        let newWrongPasswordUserToken :string
        beforeAll(async()=>{
           newPasswordUserToken = await createUserTokenAndCache(userIdToChangePassword);
           newWrongPasswordUserToken = await createUserTokenAndCache(userIdWithWrongPassword);
        })
        const password = "newPassword#1";
        it("Should change password successfully and return message is success with token and status code 200",async()=>{
            const test = jest.spyOn(SessionToken,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put("/api/users/changepassword").send({
                    oldPassword:password,
                    newPassword:password,
                    confirmNewPassword:password,
                    userId:userIdToChangePassword
                }).set("Authorization",newPasswordUserToken);
                
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expect(body.token.length).toBeGreaterThan(0);
                expect(typeof body.token).toBe("string");
                expect(test).toHaveBeenCalledTimes(1)
            }catch(error){
                console.error(error);
                throw error
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
                    newPassword:password,
                    confirmNewPassword:password,
                }).set("Authorization",newWrongPasswordUserToken)
                
                expect(statusCode).toBe(401);
                expect(body.message).toEqual("Invalid password");
                expectErrorMessage(body);
                expectOperationalError(body);
                expect(body.token).toBeUndefined()
                expect(testSessionTokenFindOneAndUpdate).not.toHaveBeenCalled()
                expect(testUserFindOneAndUpdate).not.toHaveBeenCalled()
            }catch(error){
                console.error(error);
                throw error
            }finally{
                testSessionTokenFindOneAndUpdate.mockRestore();
                testUserFindOneAndUpdate.mockRestore();
            }
        })
    })

    describe("User logout",()=>{
        let userTokenToSignOut : string;
        const userIdToSignOut = testData.userIdToSignOut;
        beforeAll(async()=>{
            userTokenToSignOut = await createUserTokenAndCache(userIdToSignOut) as string;
        })
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
                console.error(error);
                throw error;
            }finally{
                testSignOut.mockRestore();
            }
            
        })
    })

    describe("User change information",()=>{
        const userIdToUpdateWithoutImg = testData.userIdToUpdateWithoutImg;
        const userIdToUpdateWithImg = testData.userIdToUpdateWithImg;
        const userIdToUpdateBeforeOneWeekIsFinished = testData.userIdToUpdateBeforeOneWeekIsFinished;
        let imageBeforeUpdating:string;
        let userTokenToUpdateWithoutImg : string;
        let userTokenToUpdateWithImg : string;
        let userTokenToUpdateBeforeOneWeekIsFinished: string;
        beforeAll(async()=>{
            const twoWeeks =  1209600000
            // Testing update before the period of user is allowed to update again (user is allowed once per week);
            const settingUserUpdateAtToNow = await changeUserUpdateAt(userIdToUpdateWithImg,Date.now(),true);
        
            // Testing the case of withImage vs withoutImage update
            const userToUpdateWithImg = await changeUserUpdateAt(userIdToUpdateWithImg,Date.now() - twoWeeks);
            const userToUpdateWithoutImg = await changeUserUpdateAt(userIdToUpdateWithoutImg,Date.now() - twoWeeks);

            imageBeforeUpdating = userToUpdateWithImg?.userImg as string;
            userTokenToUpdateWithoutImg = await createUserTokenAndCache(userIdToUpdateWithoutImg) as string;
            userTokenToUpdateWithImg = await createUserTokenAndCache(userIdToUpdateWithImg) as string;
            userTokenToUpdateBeforeOneWeekIsFinished = await createUserTokenAndCache(userIdToUpdateBeforeOneWeekIsFinished) as string;
            
        })
        const userFirstName = "Testfirstname";
        const userLastName = "Testlastname";
        it("Should return success message and status code 200 and user after update without updating image",async()=>{
            const userEmail = faker.internet.email();
            const mobileNumber = "0592718312812";
            const birthdate = faker.date.birthdate();

            const {body,statusCode} = await supertest(app).put(`/api/users/userInformation`)
            .field("firstName",userFirstName)
            .field("lastName",userLastName)
            .field("email",userEmail)
            .field("mobileNumber",mobileNumber)
            .field("birthdate",birthdate.toJSON())
            .set("authorization",userTokenToUpdateWithoutImg);


            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expectUser(body.user);
        })

        it("Should return success message and status code 200 and user after update with updating image",async()=>{
            const testUploadingImage = jest.spyOn(CloudinaryUtils,"UploadOne"); 
            try{
                const userEmail = faker.internet.email();
                const mobileNumber = "0592718312812";
                const birthdate = faker.date.birthdate({min:2000,max:2018});

                const {body,statusCode} = await supertest(app)
                .put(`/api/users/userInformation`)
                .set("authorization",userTokenToUpdateWithImg)
                .field("email",userEmail)
                .field("mobileNumber",mobileNumber)
                .field("birthdate",birthdate.toJSON())
                .field("firstName",userFirstName)
                .field("lastName",userLastName)
                .attach("userImg",imagePath);
                
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expectUser(body.user);
                expect(testUploadingImage).toHaveBeenCalledTimes(1);
                expect(testUploadingImage).toHaveBeenCalledWith(expect.any(Buffer),expect.any(String),expect.any(Object));
            }catch(error){
                console.error(error)
                throw error
            }finally{
                testUploadingImage.mockRestore();
            }
        })

        it("Should return an error with 400 status code when a normal user try to update once in same week",async()=>{
            const {body,statusCode} = await supertest(app).put(`/api/users/userInformation`)
            .field("firstName",userFirstName).field("lastName",userLastName)
            .set("authorization",userTokenToUpdateBeforeOneWeekIsFinished);
            expect(statusCode).toBe(400)
            expect(body.message).toEqual("Normal User only allowed to change his information once per week")
            expectOperationalError(body);
            expectErrorMessage(body);
        })
    })

    describe("User reset password via code",()=>{
        const userIdToResetPasswordByResetToken = testData.userIdToResetPasswordByResetToken;
        const newPassword = faker.internet.password();
        let linkToken:string;
        let IdResetPassCodeToDelete : string;

        beforeAll(async()=>{
            const resetCode = await createResetCode(userIdToResetPasswordByResetToken) as IResetPassCode;
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
                console.error(error)
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
                const {body,statusCode} = await supertest(app).patch(`/api/users/resetPassword/${wrongToken}`).send({
                    newPassword:newPassword,
                    confirmedNewPassword:newPassword,
                });

                expect(statusCode).toBe(403);
                expect(body.message).toBe("Wrong token or it has expired");
                expectOperationalError(body);
                expectErrorMessage(body);
                expect(testTestPassCodeFindOne).toHaveBeenCalledTimes(1);
                expect(testUserFindOneAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                console.error(error)
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
        const correctEmail = "ila_tillman@gmail.com";
        const incorrectEmail = "incorrectemail@example.com";
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
                console.error(error)
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

                expect(statusCode).toBe(400);
                expect(body.message).toBe("The requested username is unavailable");
                expectErrorMessage(body);
                expectOperationalError(body);
                expect(testSendMessageToEmail).not.toHaveBeenCalled()
            }catch(error){
                console.error(error)
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
            expect(body.message).toEqual("Invalid token. Please make sure you've entered the correct token.")
            expectErrorMessage(body);
            expectOperationalError(body);
        })

        it("Should pass successfully and return message equal success",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/users/verifyResetPasswordToken/${passCodeToTest}`);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success")
        })
    })
})