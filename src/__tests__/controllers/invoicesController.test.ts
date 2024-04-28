import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import { createUserTokenAndCache, expectErrorMessage, expectOperationalError } from "../utils/helperTestFunctions.test";
const app = createServer()

describe("Invoices",()=>{
    const userId = testData.adminUserId;
    let userToken :string;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        userToken = await createUserTokenAndCache(userId) as string;
    });

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    });

    describe("Testing getInvoiceByOrderId route",()=>{
        const orderIdWithNoInvoice = "65fbdcbf780079d147b4f0a0";
        const orderIdWithInvoiceIncludingOneItem = "66069536eb1f8106979af31e";
        const orderIdWithInvoiceIncludingManyItems="6611883491405a6bd5beecd9"
        
        it("Should get the invoice by order Id with one single item",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/invoices/${orderIdWithInvoiceIncludingOneItem}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(typeof body.invoice).toBe("object");
            expect(body.invoice.userId).toBe(userId);
            expect(body.invoice.invoiceItems.length).toBe(1);
            body.invoice.invoiceItems.forEach((item:any)=>{
                expect(typeof item._id).toBe("string");
                expect(item._id.length).toBe(24);
                expect(typeof item.productId).toBe("string");
                expect(item.productId.length).toBe(24);
                expect(typeof item.quantity).toBe("number");
                expect(typeof item.unitPrice).toBe("number");
            })
        });

        it("Should get the invoice by order Id with one single item",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/invoices/${orderIdWithInvoiceIncludingManyItems}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(typeof body.invoice).toBe("object");
            expect(body.invoice.userId).toBe(userId);
            expect(body.invoice.invoiceItems.length).toBeGreaterThan(1);
            body.invoice.invoiceItems.forEach((item:any)=>{
                expect(typeof item._id).toBe("string");
                expect(item._id.length).toBe(24);
                expect(typeof item.productId).toBe("string");
                expect(item.productId.length).toBe(24);
                expect(typeof item.quantity).toBe("number");
                expect(typeof item.unitPrice).toBe("number");
            })
        })

        it("Should return an error with invoice not found",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/invoices/${orderIdWithNoInvoice }`).set("Authorization",userToken);
            expect(statusCode).toBe(400);
            expectErrorMessage(body);
            expectOperationalError(body);
            expect(body.message).toEqual("Invoice was not found");
        });
    })
});