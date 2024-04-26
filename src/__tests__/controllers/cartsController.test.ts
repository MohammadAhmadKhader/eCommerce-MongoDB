import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import User from '../../models/user';
import { ObjectId } from 'mongodb';
import { createManyCartItemsByUserId, createUserTokenAndCache } from "../utils/helperTestFunctions.test";
const app = createServer()

describe("Carts",()=>{
    const adminUserId = testData.adminUserId;
    let adminUserToken :string;
    const productIdToAddToCartHighQuantity = testData.productIdToAddToCartHighQuantity;
    const productIdToAddToCart0Quantity = testData.productIdToAddToCart0Quantity;
    const userId = adminUserId;
    const userIdWithEmptyCart = testData.userIdWithEmptyCart;
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        adminUserToken = await createUserTokenAndCache(adminUserId) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("get all cart items for user",()=>{
        it("Should return status code 200 and user cart items",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/carts/${userId}`).set("Authorization",adminUserToken);
            expect(statusCode).toBe(200);
            expect(body.cart.length).toBe(2);
            body.cart.forEach((item : any)=>{
                expect(typeof item.quantity).toBe("number");
                expect(item._id.length).toBe(24);
                expect(item.cartItem._id.length).toBe(24);
                expect(typeof item.cartItem.name).toBe("string");
                expect(typeof item.cartItem.offer).toBe("number");
                expect(typeof item.cartItem.price).toBe("number");
                expect(typeof item.cartItem.finalPrice).toBe("number");
                expect(typeof item.cartItem.quantity).toBe("number");
                expect(typeof item.cartItem.brand).toBe("string");
                item.cartItem.images.forEach((imagesItem : any)=>{
                    expect(typeof imagesItem.imageUrl).toBe("string")
                    expect(typeof imagesItem.thumbnailUrl).toBe("string")
                    expect(typeof imagesItem._id).toBe("string")
                    expect(imagesItem._id.length).toBe(24)
                })
            })
            
        })

        it("Should return status code 200 and user cart items",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/carts/${userIdWithEmptyCart}`).set("Authorization",adminUserToken);
            expect(statusCode).toBe(200);
            expect(body.cart.length).toBe(0);
        })
    })

    describe("post to user cart",()=>{
        describe("adding cart item with quantity set as integer",()=>{
            let cartItemId = "";
            
            afterAll(async()=>{
                await supertest(app).delete(`/api/carts/deleteCartItem`).send({
                    cartItemId:cartItemId,
                }).set("Authorization",adminUserToken);
            })

            it("Should return status code 201 and user cart items",async()=>{
                const {body,statusCode} = await supertest(app).post(`/api/carts`).send({
                    productId:productIdToAddToCartHighQuantity,
                    quantity:1
                }).set("Authorization",adminUserToken);
                expect(statusCode).toBe(201);
                expect(body.message).toBe("success");
                expect(body.user.password).toBeUndefined();
                const addedCartItem = body.user.cart.filter((cartItem : any)=>cartItem.productId == productIdToAddToCartHighQuantity)
                expect(addedCartItem[0].productId).toBe(productIdToAddToCartHighQuantity);
                cartItemId = addedCartItem[0]._id;
            })
        })
    })

    describe("delete from cart",()=>{
        const userIdToUseForDelete = testData.userIdToUseForDeleteFromCart;
        let userTokenForTestUserForDeleteFromCart:string;
        beforeAll(async()=>{
            userTokenForTestUserForDeleteFromCart = await createUserTokenAndCache(userIdToUseForDelete) as string;
        })
        describe("Should create a product for deletion and then re-delete it",()=>{
            let cartItemId : string;
            beforeAll(async()=>{
                const {body} = await supertest(app).post(`/api/carts`).send({
                    productId:productIdToAddToCartHighQuantity,
                    quantity:1
                }).set("Authorization",userTokenForTestUserForDeleteFromCart);
                body.user.cart.forEach((cartItem:any)=>{
                    if(cartItem.productId == productIdToAddToCartHighQuantity){
                        cartItemId = cartItem._id
                    }
                })
                
            })
            it("Should delete cart Item and return status code 204 with message equal to success and user after deletion",async()=>{
                const {body,statusCode} = await supertest(app).delete(`/api/carts/deleteCartItem`).send({
                    cartItemId:cartItemId,
                }).set("Authorization",userTokenForTestUserForDeleteFromCart);
                expect(statusCode).toBe(204);
            })
        })

        it("Should return an error that cart item does not exist",async()=>{
            const cartItemIdThatDoesNotExist = "62ae4891082b2a0698d5cef1"
            const {body,statusCode} = await supertest(app).delete(`/api/carts/deleteCartItem`).send({
                cartItemId:cartItemIdThatDoesNotExist,
            }).set("Authorization",userTokenForTestUserForDeleteFromCart);
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({error: "Something went wrong cartItem was not removed"})
        })
        
    })

    describe("change cart items quantity by 1",()=>{
        const productId_1 = "65ecc30afe69fb23c47e5194";
        const productId_2 = "65ecc427fe69fb23c47e51b5";
        const userId = "65ef5891082b6a0698d5ced4";
        const productIdWithQuantity0 = "65ecc528fe69fb23c47e51f9"
        const cartItemId_1 = "662408a30276411e706e6c70"
        const cartItemId_2 = "662408ce0276411e706e6c72"
        const cartItemId_3 = "6624090a0276411e706e6c73"
        const testUserChangeCartItemsQuantityToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZWY1ODkxMDgyYjZhMDY5OGQ1Y2VkNCIsImVtYWlsIjoiQnJlbmRvbi5SZW1wZWwzOUBnbWFpbC5jb20iLCJpYXQiOjE3MTM2MjA3MDUsImV4cCI6MTcxNjIxMjcwNX0.-R5C3zThhWIZNP_H_aefie_1Cuzs7EESwP7J9ystYDg"
        
        it("Should increase cart Item by 1 when operation set to +1",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemId_1,
                    productId:productId_1,
                    operation:"+1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);

                const expectedAmount = 1;
                expect(body.user).toBeDefined();
                expect(body.user.password).toBeUndefined();
                expect(body.message).toBe("success");
                expect(statusCode).toBe(200);
                const query = [
                    { _id:new ObjectId(userId) , 'cart._id':new ObjectId(cartItemId_1 as string) },
                    { $inc :{ 'cart.$[elem].quantity' : expectedAmount}},
                    { new : true ,select:"-__v",
                      arrayFilters: [{ 
                        "elem._id": new ObjectId(cartItemId_1 as string)
                     }],
                    }
                ];
                expect(testUserFindByIdAndUpdate).toHaveBeenCalledWith(...query);

            }catch(error){
                throw error;
            }finally{
               testUserFindByIdAndUpdate.mockRestore() 
            }
        })
        
        it("Should decrease cart Item by 1 when operation is set to -1",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemId_2,
                    productId:productId_2,
                    operation:"-1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);

                expect(statusCode).toBe(200);
                expect(body.user).toBeDefined();
                expect(body.user.password).toBeUndefined();
                expect(body.message).toBe("success");
                const expectedAmount = -1;
                const query = [
                    { _id:new ObjectId(userId) , 'cart._id':new ObjectId(cartItemId_2 as string) },
                    { $inc :{ 'cart.$[elem].quantity' : expectedAmount}},
                    { new : true ,select:"-__v",
                      arrayFilters: [{ 
                        "elem._id": new ObjectId(cartItemId_2 as string)
                     }],
                    }
                ];
                expect(testUserFindByIdAndUpdate).toHaveBeenCalledWith(...query);

            }catch(error){
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore();
            }
        })

        it("Should return an error that product is not available with status code",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemId_3,
                    productId:productIdWithQuantity0,
                    operation:"-1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);

                expect(statusCode).toBe(400);
                expect(body).toStrictEqual({error:"Quantity can't be less than 1"})
                expect(testUserFindByIdAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore()
            }
            
            
        })
    })

    describe("clear cart",()=>{
        const userIdToClearCart = testData.userIdToClearCart;
        let userTokenToClearCart : string;
        const productId_1 = "65ecc30afe69fb23c47e5194";
        const productId_2 = "65ecc427fe69fb23c47e51b5";
        beforeAll(async()=>{
            userTokenToClearCart = await createUserTokenAndCache(userIdToClearCart) as string;
            await createManyCartItemsByUserId(userId,[{productId:productId_1,quantity:1},{productId:productId_2,quantity:1}])
        })
        it("Should return user with empty cart and message equal to success and status code 201",async()=>{
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).delete("/api/carts/clearCart")
                .set("Authorization",userTokenToClearCart);
                expect(statusCode).toBe(201);
                expect(body.message).toBe("success");
                expect(body.user.cart).toStrictEqual([]);
                expect(testUserFindOneAndUpdate).toHaveBeenCalledTimes(1);
            }catch(error){
                throw error;
            }finally{
                testUserFindOneAndUpdate.mockRestore()
            }
        })

    })

})