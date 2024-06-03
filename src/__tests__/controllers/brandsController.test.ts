import supertest from "supertest";
import { v4 as uuid } from 'uuid';
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import "../../config/cloudinary"
import { createBrand, createUserTokenAndCache, deleteBrand, expectErrorMessage, expectId, expectOperationalError } from "../utils/helperTestFunctions.test";
import { IBrand } from "../../@types/types";
import { expectBrand } from "../utils/brandUtils.test";
import { faker } from "@faker-js/faker";
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
        let createdBrand : null | IBrand = null;
        it("Should return an error that brandLogo does not exist",async()=>{
            const brandName = faker.commerce.department()
            const {body,statusCode} = await supertest(app).post(`/api/brands`)
            .set("Authorization",adminUserToken).field("brandName",brandName)
            expect(statusCode).toBe(500);
            expectErrorMessage(body);
            expect(body.message).toEqual("\"brandLogo\" is required")
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
            createdBrand = body.brand;
        })
        afterAll(async ()=>{
            if(createdBrand){
                await deleteBrand(createdBrand._id)
            }
        })
        
    })

    describe("Update brand",()=>{
        describe("Should create brand and apply edit on it then delete it when testing is finished",()=>{
            let brandToUpdate : IBrand;
            
            beforeAll(async()=>{
                brandToUpdate = await createBrand() as IBrand;
            })
            
            it("Should pass successfully and return status code 200 when image is not set",async()=>{
                const newBrandName = faker.commerce.department();
                const {body,statusCode} = await supertest(app).put(`/api/brands/${brandToUpdate?._id}`)
                .field("brandName",newBrandName)
                .set("Authorization",adminUserToken)
    
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expectBrand(body.brand);
                expect(body.brand.name).toBe(newBrandName);
            })

            it("Should pass successfully and return status code 200 when brandName is not set",async()=>{
                const {body,statusCode} = await supertest(app).put(`/api/brands/${brandToUpdate?._id}`)
                .attach("brandLogo",imagePath)
                .set("Authorization",adminUserToken)
    
                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expectBrand(body.brand);
            })

            afterAll(async()=>{
                await deleteBrand(brandToUpdate?._id)
            })
        })

        describe("Should create brand and apply edit on both brandName and brandLogo at same time and delete the created brand",()=>{
            let brandToUpdate : IBrand;
            
            beforeAll(async()=>{
                brandToUpdate = await createBrand() as IBrand;
            })
            
            it("Should pass successfully and return status code 200 when brandName is not set",async()=>{
                const newBrandName = faker.commerce.department();
                const {body,statusCode} = await supertest(app).put(`/api/brands/${brandToUpdate?._id}`)
                .field("brandName",newBrandName).attach("brandLogo",imagePath)
                .set("Authorization",adminUserToken)

                expect(statusCode).toBe(200);
                expect(body.message).toBe("success");
                expectBrand(body.brand);
            })
            
            afterAll(async()=>{
                await deleteBrand(brandToUpdate?._id)
            })
        }) 
    })

    describe("Delete brand",()=>{
        describe("Should create brand and send request to delete it",()=>{
            let brandToDelete : IBrand;
            beforeAll(async()=>{
                brandToDelete = await createBrand() as IBrand;
            })

            it("Should delete the brand successfully and return status code 204",async()=>{
                const {statusCode} = await supertest(app).delete(`/api/brands/${brandToDelete?._id}`)
                .set("Authorization",adminUserToken);

                expect(statusCode).toBe(204);
            })
        })

        it("Should return an error that brand does not exist with status code 400",async()=>{
            const brandIdNotExisting = testData.brandIdNotExisting
            const {body,statusCode} = await supertest(app).put(`/api/brands/${brandIdNotExisting}`)
            .set("Authorization",adminUserToken).field("brandName","Nike").attach("brandLogo",imagePath);
            
            expect(statusCode).toBe(400);
            expectErrorMessage(body);
            expect(body.message).toEqual("Brand was not found.");
        })
    })
})