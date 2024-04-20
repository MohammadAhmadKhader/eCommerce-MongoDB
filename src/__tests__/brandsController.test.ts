import {  getAdminUserTokenTestData, getAdminUserIdTestData, getCategoryIdTestData } from './../utils/HelperFunctions';
import supertest from "supertest";
import { v4 as uuid } from 'uuid';
import createServer from "../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../utils/DatabaseTestHandler";
import "../config/cloudinary"
const app = createServer()

describe("Brands",()=>{
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

    describe("get All brands",()=>{

        it("Should return all brands",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/brands`);
            expect(statusCode).toBe(200)
            body.brands.forEach((brand : any)=>{
                expect(typeof brand.imageUrl).toBe("string");
                expect(typeof brand.name).toBe("string");
                expect(typeof brand._id).toBe("string");
                expect(brand.imageUrl.length).toBeGreaterThan(0);
                expect(brand.name.length).toBeGreaterThan(0);
                expect(brand._id.length).toBe(24); 
            })
        })

        it("Should return an error that images does not exist",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/brands/${adminUserId}`)
            .set("Authorization",adminUserToken).send({
                name:"Nike"
            });
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({error: "image does not exist"})
        })

        it("Should create a new brand with unique string name",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/brands/${adminUserId}`)
            .set("Authorization",adminUserToken).field("brandName","Nike").attach("brandLogo",imagePath);
            expect(statusCode).toBe(500);
            expect(body).toStrictEqual({
                error: "E11000 duplicate key error collection: DB101_test.brands index: name_1 dup key: { name: \"Nike\" }",
            })
        })

        it("Should return an error that brand already exist",async()=>{
            const uniqueString = uuid();
            const {body,statusCode} = await supertest(app).post(`/api/brands/${adminUserId}`)
            .set("Authorization",adminUserToken).field("brandName",uniqueString).attach("brandLogo",imagePath);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(body.brand.name).toBe(uniqueString);
            expect(typeof body.brand.imageUrl).toBe("string");
            expect(body.brand.imageUrl.length).toBeGreaterThan(1);
        })
        
    })

})