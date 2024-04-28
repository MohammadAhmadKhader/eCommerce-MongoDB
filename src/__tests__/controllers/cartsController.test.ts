import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import User from '../../models/user';
import { ObjectId } from 'mongodb';
import { addCartItemThenReturnIt, createManyCartItemsByUserId, createUserTokenAndCache, deleteUserCartItemByItsId, expectErrorMessage, expectOperationalError } from "../utils/helperTestFunctions.test";
import { expectPopulatedCartItems } from "../utils/cartUtils.test";
import { expectUser } from "../utils/userUtils.test";
import { ICartItem } from "../../@types/types";
const app = createServer()

describe("Carts",()=>{
    const adminUserId = testData.adminUserId;
    let adminUserToken :string;
    const productIdToAddToCartHighQuantity = testData.productIdToAddToCartHighQuantity;
    const productIdToAddToCart0Quantity = testData.productIdToAddToCart0Quantity;
    const productId_1 = "65ecc30afe69fb23c47e5194";
    const productId_2 = "65ecc427fe69fb23c47e51b5";
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
        const userIdToGetAllCartItems = testData.userIdToGetCartItems;
        let userTokenToGetAllCartItems : string;
        let userTokenToGetAllCartItemsEmptyCart : string;
        beforeAll(async()=>{
            userTokenToGetAllCartItems= await createUserTokenAndCache(userIdToGetAllCartItems) as string;
            userTokenToGetAllCartItemsEmptyCart = await createUserTokenAndCache(userIdWithEmptyCart) as string;
        })
        
        it("Should return status code 200 and user cart items",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/carts/${userIdToGetAllCartItems}`).set("Authorization",userTokenToGetAllCartItems);
            expect(statusCode).toBe(200);
            
            expect(body.cart.length).toBe(2);
            body.cart.forEach((item : any)=>{
                expect(typeof item.quantity).toBe("number");
                expect(item._id.length).toBe(24);
                expect(item.cartItem._id.length).toBe(24);
                expectPopulatedCartItems(item.cartItem)
            })
        })

        it("Should return status code 200 and user cart items",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/carts/${userIdWithEmptyCart}`).set("Authorization",userTokenToGetAllCartItemsEmptyCart);
            expect(statusCode).toBe(200);
            expect(body.cart.length).toBe(0);
        })
    })

    describe("Add to user cart",()=>{
        describe("Adding a cart item to user cart",()=>{
            let cartItemId = "";
            const userIdToAddToCartWithExistingItem = testData.userIdToAddToCartWithExistingItem;
            let userTokenToAddToCartWithExistingItem : string;
            afterAll(async()=>{
                await deleteUserCartItemByItsId(adminUserId,cartItemId);
                
            })

            beforeAll(async()=>{
                userTokenToAddToCartWithExistingItem = await createUserTokenAndCache(userIdToAddToCartWithExistingItem) as string;
            })

            it("Should return status code 201 and user cart items",async()=>{
                const {body,statusCode} = await supertest(app).post(`/api/carts`).send({
                    productId:productIdToAddToCartHighQuantity,
                    quantity:1
                }).set("Authorization",adminUserToken);
                expect(statusCode).toBe(201);
                expect(body.message).toBe("success");
                expectUser(body.user);
                const addedCartItem = body.user.cart.filter((cartItem : ICartItem)=>cartItem.productId.toString() == productIdToAddToCartHighQuantity)
                expect(addedCartItem[0].productId).toBe(productIdToAddToCartHighQuantity);
                cartItemId = addedCartItem[0]._id;
            })

            it("Should return an error with status code 400 and message that this product already in cart",async()=>{
                const productIdInCart = "65ec9e8466da2465cf82ec3a";
                const {body,statusCode} = await supertest(app).post(`/api/carts`).send({
                    productId:productIdInCart,
                    quantity:1
                }).set("Authorization",userTokenToAddToCartWithExistingItem);
                
                expect(statusCode).toBe(400);
                expect(body.message).toBe("Product already in your cart.");
                expectErrorMessage(body);
                expectOperationalError(body);
                expect(body.user).toBeUndefined();
            })
        })
    })

    describe("delete from cart",()=>{
        const userIdToUseForDelete = testData.userIdToUseForDeleteFromCart;
        let userTokenForTestUserForDeleteFromCart:string;
        beforeAll(async()=>{
            userTokenForTestUserForDeleteFromCart = await createUserTokenAndCache(userIdToUseForDelete) as string;
        })
        describe("Should create a cart item for deletion and then re-delete it",()=>{
            let cartItemId : any;
            beforeAll(async()=>{
                const cartItem = await addCartItemThenReturnIt(userIdToUseForDelete,{productId:productIdToAddToCartHighQuantity,quantity:1});
                cartItemId = cartItem?._id;
            })
            it("Should delete cart Item and return status code 204 with message to success and user after deletion of cart item",async()=>{
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
            expectErrorMessage(body);
            expectOperationalError(body);
            expect(body.message).toBe("An unexpected error has occurred")
        })
        
    })

    describe("change cart items quantity by 1",()=>{
        const productId_1 = "65ecc30afe69fb23c47e5194";
        const productIdNotExisting = "63bca50afe69fb25c47e1324";
        const cartItemIdNotExisting = "63bca50afe69fb25c47e1324";
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
                console.error(error)
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
                console.error(error)
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore();
            }
        })

        it("Should return an error that quantity cant be less than 1 with status code 400",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemId_3,
                    productId:productIdWithQuantity0,
                    operation:"-1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);
                expect(body.message).toEqual("Quantity can't be less than 1.");
                expect(statusCode).toBe(400);
                expectOperationalError(body);
                expectErrorMessage(body);
                
                expect(testUserFindByIdAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                console.error(error);
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore()
            }
        })

        it("Should return an error that Product was not found with status code 400",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemId_3,
                    productId:productIdNotExisting,
                    operation:"-1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);
                expect(body.message).toEqual("Product was not found.");
                expect(statusCode).toBe(400);
                expectOperationalError(body);
                expectErrorMessage(body);
                
                expect(testUserFindByIdAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                console.error(error);
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore()
            }
        })

        it("Should return an error that Product was not found with status code 400",async()=>{
            const testUserFindByIdAndUpdate = jest.spyOn(User,"findByIdAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).put(`/api/carts/changeQtyByOne`).send({
                    cartItemId:cartItemIdNotExisting,
                    productId:productIdWithQuantity0,
                    operation:"+1",
                }).set("Authorization",testUserChangeCartItemsQuantityToken);
                expect(body.message).toEqual("Cart item was not found.");
                expect(statusCode).toBe(400);
                expectOperationalError(body);
                expectErrorMessage(body);
                
                expect(testUserFindByIdAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                console.error(error);
                throw error;
            }finally{
                testUserFindByIdAndUpdate.mockRestore()
            }
        })
    })

    describe("clear cart",()=>{
        const userIdToClearCart = testData.userIdToClearCart;
        let userTokenToClearCart : string;
        let userTokenWithEmptyCart: string;
        
        beforeAll(async()=>{
            userTokenToClearCart = await createUserTokenAndCache(userIdToClearCart) as string;
            await createManyCartItemsByUserId(userIdToClearCart,[{productId:productId_1,quantity:1},{productId:productId_2,quantity:1}])
            userTokenWithEmptyCart = await createUserTokenAndCache(userIdWithEmptyCart) as string;
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
                console.error(error);
                throw error;
            }finally{
                testUserFindOneAndUpdate.mockRestore()
            }
        })

        it("Should return user with empty cart and message equal to success and status code 201",async()=>{
            const testUserFindOneAndUpdate = jest.spyOn(User,"findOneAndUpdate");
            try{
                const {body,statusCode} = await supertest(app).delete("/api/carts/clearCart")
                .set("Authorization",userTokenWithEmptyCart);
                
                expect(statusCode).toBe(400);
                expect(body.message).toBe("The cart is already empty.");
                expectOperationalError(body);
                expectErrorMessage(body);
                expect(testUserFindOneAndUpdate).not.toHaveBeenCalled();
            }catch(error){
                console.error(error);
                throw error;
            }finally{
                testUserFindOneAndUpdate.mockRestore()
            }
        })
    })

})