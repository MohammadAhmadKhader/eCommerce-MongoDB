import mongoose from 'mongoose';
import supertest from "supertest";
import createServer from "../../../utils/Server";
import DatabaseTestHandler from '../../../utils/DatabaseTestHandler';

const app = createServer()

describe("Pagination Middleware",()=>{
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST)
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })
    it("Should set page and limit back to default When only page query param is given",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=3");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When only limit query param is given",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?limit=5");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When limit is over than 30",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=31");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When limit is less than 0",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=-1");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When page is less than 0",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=-1&limit=-1");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When page is not able to be parsed to number",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=randomString&limit=-1");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })

    it("Should set page and limit back to default When limit is not able to be parsed to number",async()=>{
        const {body,statusCode} = await supertest(app).get("/api/products?page=-1&limit=randomString");
        expect(statusCode).toBe(200)
        expect(body.page).toBe(1);
        expect(body.limit).toBe(9);
    })
})