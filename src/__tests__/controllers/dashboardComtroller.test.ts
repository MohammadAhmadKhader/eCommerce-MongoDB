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

describe("Dashboard",()=>{
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

    describe("",()=>{
        it("",()=>{

        })
    })
})