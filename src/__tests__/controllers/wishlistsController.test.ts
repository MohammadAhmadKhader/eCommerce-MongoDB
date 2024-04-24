import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import "../../config/cloudinary"
import User from '../../models/user';
import testData from "../assets/testData/testData.json"
import { expectPopulatedWishlistItem } from "../utils/wishlist.test";
import { IWishListItemPopulated } from "../../@types/types";
const app = createServer()

describe("Wishlists",()=>{
    const userId = "6627c6df40da1283c9e65151";
    const userToken = testData.userTokenTestingWishlist;
    const adminUserToken = testData.adminUserToken;
    const adminUserId = testData.adminUserId;
    const userTokenWithEmptyWishlist = testData.userTokenWithEmptyWishlist;
    const userIdWithEmptyWishlist = testData.userIdWithEmptyWishlist;
    
    const productIdForDeletion = "65ec9e8466da2465cf82ec3a";
    const productIdForPosting = "65ecac2fdeee9c7ef42ffe65";
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("Testing get all wishlist items by user",()=>{
        it("Should return wishlist items populated",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/wishlists/${adminUserId}`).set("Authorization",adminUserToken);
            expect(statusCode).toBe(200);
            expect(body.wishList).toBeTruthy();
            body.wishList.forEach((wishlistItem : IWishListItemPopulated)=>{
                expect(wishlistItem.product.images.length).toBeGreaterThanOrEqual(1);
                expectPopulatedWishlistItem(wishlistItem)
            })
        })

        it("Should return wishlist items populated",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/wishlists/${userIdWithEmptyWishlist}`).set("Authorization",userTokenWithEmptyWishlist);
            expect(statusCode).toBe(200);
            expect(body).toStrictEqual({wishList:[]});
        })
        
    });

    describe("Testing adding wishlist item",()=>{
        it("Should add wishlist item (productId) to the user wishlist",async()=>{
            let isWishListHasBeenAdded = false;
            const {body,statusCode} = await supertest(app).post("/api/wishlists").set("Authorization",userToken).send({
                productId:productIdForPosting
            });
            expect(statusCode).toBe(201);
            expect(body.message).toBe("success");
            body.user.wishList.forEach((wishListItem : any)=>{
                if(wishListItem.productId == productIdForPosting){
                    isWishListHasBeenAdded = true
                }
            });
            expect(isWishListHasBeenAdded).toBe(true);
        })

        afterAll(async()=>{
            try{
                const updatingUser = await User.updateOne({_id:userId},{
                    $pull:{
                        wishList:{
                            productId:productIdForPosting
                        }
                    }
                })
                if(updatingUser.modifiedCount == 0){
                    throw "User was not modified before testing on adding wishlist item"
                }
            }catch(error){
                console.error(error)
            }
            
        });

    })

    describe("Testing removing wishlist item",()=>{
        let wishlistItemId: string;
        beforeAll(async()=>{
            try{
                const updatedUser = await User.findOneAndUpdate({_id:userId},{
                    $push:{
                        wishList:{
                            productId:productIdForDeletion
                        }
                    }
                })
                if(!updatedUser){
                    throw "User was not modified before testing on removing wishlist item"
                }
                updatedUser.wishList.forEach((item)=>{
                    if(item.productId as unknown as string == productIdForDeletion){
                        wishlistItemId = item._id.toString();
                    }
                })
                
            }catch(error){
                console.error(error)
            }
        })
        it("Should remove wishlist item (productId) from user wishlist",async()=>{
            const {body,statusCode} = await supertest(app).delete("/api/wishlists").set("Authorization",userToken).send({
                wishlistItemId:wishlistItemId
            });
            console.log(JSON.stringify(body))
            expect(statusCode).toBe(202);
            expect(body.message).toBe("success");
            expect(body.user).toBeTruthy();
            let isUserReturnedWithWishlistItemAdded = false;
            body.user.wishList.forEach((wishlistItem : any)=>{
                if(wishlistItem.productId == productIdForDeletion){
                    isUserReturnedWithWishlistItemAdded = true;
                }
            })
            expect(isUserReturnedWithWishlistItemAdded).toBe(true);
        })

    })

})