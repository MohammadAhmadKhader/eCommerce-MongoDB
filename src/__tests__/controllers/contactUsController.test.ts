import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import MailUtils from "../../utils/MailUtils";
import { faker } from "@faker-js/faker";
const app = createServer()

describe("Contact Us",()=>{
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("sendMessage controller",()=>{
        it("Should return success with status code = 200",async()=>{
            const testSendMessage = jest.spyOn(MailUtils,"SendMessage");
            try{
                const email = faker.internet.email();
                const message = faker.word.words({count:{min:10,max:20}});
                const subject = faker.word.words({count:{min:2,max:5}})
                const fullName = faker.person.fullName();

                const {body,statusCode} = await supertest(app).post("/api/contactUs").send({
                    email:email,
                    subject:subject,
                    message:message,
                    fullName:fullName
                });
                
                expect(body).toStrictEqual({message:"success"});
                expect(statusCode).toBe(200);
                expect(testSendMessage).toHaveBeenCalledWith(email,fullName,message,subject);
            }catch(error){
                throw error;
            }finally{
                testSendMessage.mockRestore()
            }
        })
    })
})