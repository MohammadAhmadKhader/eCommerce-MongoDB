import supertest from "supertest";
import { v4 as uuid } from 'uuid';
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import "../../config/cloudinary"
import { createUserTokenAndCache, expectErrorMessage, expectId, expectOperationalError } from "../utils/helperTestFunctions.test";
import { IBrand } from "../../@types/types";
import { expectBrand } from "../utils/brandUtils.test";
const app = createServer()

describe("Brands",()=>{
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

    describe("get All brands",()=>{
        it("Should return all brands",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/brands`);
            expect(statusCode).toBe(200)
            expect(body.brands.length).toBeGreaterThan(0);
            body.brands.forEach((brand : IBrand)=>{
                expectBrand(brand)
            })
        }) 
    })

    describe("Create new brand",()=>{

        it("Should return an error that images does not exist",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/brands`)
            .set("Authorization",adminUserToken).send({
                brandName:"Nike"
            });
            expect(statusCode).toBe(400);
            expectErrorMessage(body);
            expect(body.message).toEqual("image does not exist")
        })

        it("Should return an error that brand already exist",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/brands`)
            .set("Authorization",adminUserToken).field("brandName","Nike").attach("brandLogo",imagePath);
            expect(statusCode).toBe(500);
            expectErrorMessage(body);
            expect(body.message).toEqual("E11000 duplicate key error collection: DB101_test.brands index: name_1 dup key: { name: \"Nike\" }",)
        })

        it("Should create a new brand with unique string name",async()=>{
            const uniqueString = uuid();
            const {body,statusCode} = await supertest(app).post(`/api/brands`)
            .set("Authorization",adminUserToken).field("brandName",uniqueString.substring(0,15)).attach("brandLogo",imagePath);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(body.brand.name).toBe(uniqueString.substring(0,15));
            expectBrand(body.brand);
        })
    })
})