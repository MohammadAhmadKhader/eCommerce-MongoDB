import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import "../../config/cloudinary";
import testData from "../assets/testData/testData.json"
import { expectOrder } from "../utils/orderUtils.test";
import Order from "../../models/order";
import User from "../../models/user";
import Stripe from "stripe";
import { expectInvoice } from "../utils/invoiceUtils.test";

const app = createServer()

describe("Orders",()=>{
    const userToken = testData.adminUserToken;
    const userId = testData.adminUserId;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("Get all Orders by status and userId",()=>{
        it("Should get all user orders with status Completed",async()=>{
            const status = "Completed";
            const {body,statusCode} = await supertest(app).get(`/api/orders/${userId}?status=${status}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.orders.length).toBeGreaterThan(0)
            body.orders.forEach((order : any)=>{
                expectOrder(order,status);
            })
        })

        it("Should get all user orders with status Placed",async()=>{
            const status = "Placed";
            const {body,statusCode} = await supertest(app).get(`/api/orders/${userId}?status=${status}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.orders.length).toBeGreaterThan(0);
            body.orders.forEach((order : any)=>{
                expectOrder(order,status);
            })
        })

        it("Should get all user orders with status Processing",async()=>{
            const status = "Processing";
            const {body,statusCode} = await supertest(app).get(`/api/orders/${userId}?status=${status}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.orders.length).toBeGreaterThan(0);
            body.orders.forEach((order : any)=>{
                expectOrder(order,status);
            })
        })

        it("Should get all user orders with status Cancelled",async()=>{
            const status = "Cancelled";
            const {body,statusCode} = await supertest(app).get(`/api/orders/${userId}?status=${status}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.orders.length).toBeGreaterThanOrEqual(0);
            body.orders.forEach((order : any)=>{
                expectOrder(order,status);
            })
        })
    })

    describe("Get single order by orderId and userToken",()=>{
        const orderId = "6604137f5a8632a7da041b28"
        it("Should get single order by it id",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/orders/singleOrder/${orderId}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            expect(body.order).toBeTruthy();
            expectOrder(body.order)
        })
    })

    describe("Create order controller",()=>{
        const userIdCreateOrder = "66281215458fa1e46cb82895";
        const userTokenCreateOrder = testData.userTokenCreateOrder;
        const firstProductId = "65ec9e8466da2465cf82ec3a";
        const secondProductId = "65eca2cb11fbd4de442b6578";
        const userIdDeleteFromEmptyCart = "66280ee2a84d8beed049c6d3";
        const userTokenDeleteFromEmptyCart = testData.userTokenDeleteFromEmptyCart;
        describe("Creating cart items then creating order from them",()=>{
            beforeAll(async()=>{
                try{
                    const updateUserCreateOrder = await User.updateOne({
                        _id:userIdCreateOrder
                    },{
                        $push:{
                            cart:{
                                $each:[
                                    {
                                        productId:firstProductId,
                                        quantity:1
                                    },{
                                        productId:secondProductId,
                                        quantity:1
                                    }
                                ]
                            }
                        }
                    });
                    
                    if(updateUserCreateOrder.modifiedCount !== 1){
                        throw "error during updating user to create order"
                    }
                }catch(error){
                    throw error
                }
            })
            
            const productIdWithQuantity120 = "65ecdc4b50cbedf3920a2ba6";
            const userIdDeleteWithWrongQtyCartItem = "662874ae4a05c5ee47438b0a";
            const userTokenDeleteWithWrongQtyCartItem = testData.userTokenDeleteWithWrongQtyCartItem
            it("Should throw error with because cartItem has more quantity than the product itself and error with status code 500",async()=>{
                const {body,statusCode} = await supertest(app).post("/api/orders").set("Authorization",userTokenDeleteWithWrongQtyCartItem);
                expect(statusCode).toBe(500);
                expect(body).toStrictEqual({error: "You cant buy more than the existing amount"});
            })
            

            it("Should create order and return message is success and status code 201 with the created order",async()=>{
                const {body,statusCode} = await supertest(app).post("/api/orders").set("Authorization",userTokenCreateOrder);
                expect(statusCode).toBe(201);
                expect(body.message).toBe("success");
                expectOrder(body.order);
                //* Add expect User here

            })
        })

        it("Should return an error with status code 400 and error cart is empty",async()=>{
            const {body,statusCode} = await supertest(app).post("/api/orders").set("Authorization",userTokenDeleteFromEmptyCart);
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({error:"cart is empty"});
        })
    })

    describe("Deleting an order",()=>{
        const orderId = "662873a7a413f16adec3c906";
        const orderPreviousState = "Placed";
        const userIdDeleteOrder = "66281215458fa1e46cb82895";
        const userTokenDeleteOrder = testData.userTokenDeleteOrder;

        it("Should delete an order and return status code 204",async()=>{
            const {statusCode} = await supertest(app).delete(`/api/orders`).send({
                orderId:orderId
            })
            .set("Authorization",userTokenDeleteOrder);
            expect(statusCode).toBe(204);
        })

        // After order was set to Cancelled, re-set it to its previous status
        afterAll(async()=>{
            try{
                const resetOrderStatus = await Order.updateOne({
                    _id:orderId
                },{
                    status:orderPreviousState
                })

                if(resetOrderStatus.modifiedCount == 0){
                    throw "order was not reset";
                }
            }catch(error){
                throw error;
            }   
        })
    })

    describe("Creating payment Intent",()=>{
        const orderId = "65f2d1e2bdc716413685b67a";
        const userIdPaymentIntent = testData.adminUserId
        const userTokenPaymentIntent = testData.adminUserToken;
        it("Should create payment intent",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/orders/stripe/createPaymentIntent`).send({
                orderId:orderId,
                customerId:userIdPaymentIntent
            }).set("Authorization",userTokenPaymentIntent)
            
            expect(statusCode).toBe(200);
            expect(typeof body.clientSecret).toBe("string");
            expect((body.clientSecret as string).includes("secret")).toBe(true)
            expect((body.customer as Stripe.Customer).metadata.customerId).toBe(userIdPaymentIntent);
        })
    })

    describe("Order checking out",()=>{
        const orderId = "65f2d1e2bdc716413685b67a";
        const orderInitialStatus = "Processing";
        const userIdCheckingOrder = testData.adminUserId
        const userTokenPaymentIntent = testData.adminUserToken
        const address = {
            fullName:"fullName",
            city:"city",
            state:"state",
            country:"country",
            streetAddress:"streetAddress 101",
            mobileNumber:"0592892381391",
        }
        
        it("Should check order and set it to completed and return order and created invoice with its items with status code 200",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/orders/stripe/OrderCheckingOut`).send({
                orderId:orderId,
                customerId:userIdCheckingOrder,
                address:address
            })
            .set("Authorization",userTokenPaymentIntent);
            expect(statusCode).toBe(200)
            expectOrder(body.order,"Completed");
            expectInvoice(body.invoice);
        })

        afterAll(async()=>{
            try{
                const resetOrder = await Order.updateOne({_id:orderId},{status:orderInitialStatus})
                if(resetOrder.modifiedCount == 0){
                    throw "Order was not reset to initial state";
                }
            }catch(error){
                throw error;
            }
        })
    })
})