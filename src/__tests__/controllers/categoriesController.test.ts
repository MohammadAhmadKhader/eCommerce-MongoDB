import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
const app = createServer()

describe("Categories",()=>{
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("get All categories",()=>{
        it("Should return all categories",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/categories`);
            expect(statusCode).toBe(200)
            body.categories.forEach((category : any)=>{
                expect(typeof category.imageUrl).toBe("string");
                expect(typeof category.name).toBe("string");
                expect(typeof category._id).toBe("string");
                expect(category.imageUrl.length).toBeGreaterThan(0);
                expect(category.name.length).toBeGreaterThan(0);
                expect(category._id.length).toBe(24); 
            })
        })
    })

})