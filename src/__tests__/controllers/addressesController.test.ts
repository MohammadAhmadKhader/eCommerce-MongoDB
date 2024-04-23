import { setTestData } from '../../utils/HelperFunctions';
import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import { faker } from '@faker-js/faker';
import testData from "../assets/testData/testData.json"
const app = createServer();


describe("Addresses",()=>{
    const adminUserId = testData.adminUserId;
    const adminUserToken = testData.adminUserToken;
    const addressIdForUpdate = testData.addressIdForUpdate;
    const addressIdForDelete = testData.addressIdForDelete;
    const randomAddressId = testData.randomAddressId;
    const testDataFilePath = "./src/__tests__/assets/testData/testData.json";
    const userId = adminUserId;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("Create new address",()=>{
        it("Should create a new address for the user and return user information with address inserted inside user and message success and statusCode 201",async()=>{
            const newAddress = {
                pinCode:faker.location.zipCode(),
                state:"Palestine",
                fullName:faker.person.fullName(),
                mobileNumber:"059826138182",
                streetAddress:faker.location.streetAddress(),
                city:faker.location.city()
            }
            const {body,statusCode} = await supertest(app).post(`/api/addresses`).send({...newAddress,userId}).set("Authorization",adminUserToken);
            expect(statusCode).toBe(201)
            expect(body.message).toBe("success");
            expect(body.user.password).toBeUndefined();
            expect(body.user.addresses[body.user.addresses.length - 1].pinCode).toBe(newAddress.pinCode);
            expect(body.user.addresses[body.user.addresses.length - 1].fullName).toBe(newAddress.fullName);
            expect(body.user.addresses[body.user.addresses.length - 1].state).toBe(newAddress.state);
            expect(body.user.addresses[body.user.addresses.length - 1].mobileNumber).toBe(newAddress.mobileNumber);
            expect(body.user.addresses[body.user.addresses.length - 1].streetAddress).toBe(newAddress.streetAddress);
            expect(body.user.addresses[body.user.addresses.length - 1].city).toBe(newAddress.city);
            expect(body.user.addresses[body.user.addresses.length - 1]._id.length).toBe(24);
            setTestData(testDataFilePath,body.user.addresses[body.user.addresses.length - 1]._id,"addressIdForDelete")
            
        })
    })

    describe("Update an existing address",()=>{
        it("Should edit and return message equal success and the new address and return status code 200",async()=>{
            const newAddress = {
                pinCode:faker.location.zipCode(),
                state:"Palestine",
                fullName:faker.person.fullName(),
                mobileNumber:"059826138182",
                streetAddress:faker.location.streetAddress(),
                city:faker.location.city()
            }
            const {body,statusCode} = await supertest(app).put(`/api/addresses`).send({...newAddress,userId,addressId:addressIdForUpdate}).set("Authorization",adminUserToken);
            expect(statusCode).toBe(200)
            expect(body.message).toBe("success");
            const updatedAddress = body.user.addresses.filter((address : any)=>address._id == addressIdForUpdate);

            expect(updatedAddress[0].fullName).toBe(newAddress.fullName);
            expect(updatedAddress[0].pinCode).toBe(newAddress.pinCode);
            expect(updatedAddress[0].state).toBe(newAddress.state);
            expect(updatedAddress[0].mobileNumber).toBe(newAddress.mobileNumber);
            expect(updatedAddress[0].streetAddress).toBe(newAddress.streetAddress);
            expect(updatedAddress[0].city).toBe(newAddress.city);
            expect(updatedAddress[0]._id.length).toBe(24);
        })
    })
    
    describe("Delete an address",()=>{
        it("Should return an error with status 400 that address was not found",async()=>{
            const {body,statusCode} = await supertest(app).delete(`/api/addresses`).send({userId,addressId:randomAddressId}).set("Authorization",adminUserToken);
            expect(statusCode).toBe(400)
            expect(body.user).toBeUndefined()
            expect(body).toStrictEqual({error:"Address does not exist"})
        })

        it("Should delete an address",async()=>{
            const {body,statusCode} = await supertest(app).delete(`/api/addresses`).send({userId,addressId:addressIdForDelete}).set("Authorization",adminUserToken);
            expect(statusCode).toBe(202)
            expect(body.message).toBe("success");
            expect(body.user.password).toBeUndefined()
            const updatedAddress = body.user.addresses.filter((address : any)=>address._id == addressIdForDelete);
            expect(updatedAddress).toHaveLength(0);
        })
    })
})