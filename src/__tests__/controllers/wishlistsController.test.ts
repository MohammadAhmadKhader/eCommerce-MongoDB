import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import "../../config/cloudinary"
import testData from "../assets/testData/testData.json"
import { expectPopulatedWishlistItem } from "../utils/wishlist.test";
import { IWishListItemPopulated } from "../../@types/types";
import { addToWishlistAndReturnItemId, createUserTokenAndCache, expectErrorMessage, expectOperationalError, removeWishlistItemByProductId } from "../utils/helperTestFunctions.test";
const app = createServer()

describe("Wishlists",()=>{
    const userId = testData.userIdTestingWishlist;
    const adminUserId = testData.adminUserId;
    let userTokenNotEmptyWishlist : string;
    let adminUserToken : string;
    let userTokenWithEmptyWishlist: string;
    const userIdWithEmptyWishlist = testData.userIdWithEmptyWishlist;
    const productIdForDeletion = "65ec9e8466da2465cf82ec3a";
    const productIdForPosting = "65ecac2fdeee9c7ef42ffe65";
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        userTokenNotEmptyWishlist = await createUserTokenAndCache(userId) as string;
        adminUserToken = await createUserTokenAndCache(adminUserId) as string;
        userTokenWithEmptyWishlist = await createUserTokenAndCache(userIdWithEmptyWishlist) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("Testing get all wishlist items by user",()=>{
        it("Should return wishlist items populated successfully",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/wishlists/${adminUserId}`).set("Authorization",adminUserToken);
            expect(statusCode).toBe(200);
            expect(body.wishList).toBeTruthy();
            body.wishList.forEach((wishlistItem : IWishListItemPopulated)=>{
                expect(wishlistItem.product.images.length).toBeGreaterThanOrEqual(1);
                expectPopulatedWishlistItem(wishlistItem)
            })
        })

        it("Should return an empty wishlist successfully",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/wishlists/${userIdWithEmptyWishlist}`).set("Authorization",userTokenWithEmptyWishlist);
            expect(statusCode).toBe(200);
            expect(body).toStrictEqual({wishList:[]});
        })
        
    });

    describe("Testing adding wishlist item",()=>{
        const userIdWithFullWishlist = testData.userIdWithFullWishlist;
        const userIdToAddSameProductTwiceOnWishlist = testData.userIdToAddSameProductTwiceOnWishlist;
        let userTokenWithFullWishlist : string;
        let userTokenWithProductAlreadyInWishlist : string;

        beforeAll(async()=>{
            userTokenWithFullWishlist = await createUserTokenAndCache(userIdWithFullWishlist);
            userTokenWithProductAlreadyInWishlist = await createUserTokenAndCache(userIdToAddSameProductTwiceOnWishlist);
        })

        describe("Adding a product to wishlist then remove it for success on re-test",()=>{ 
            afterAll(async()=>{
                await removeWishlistItemByProductId(userId,productIdForPosting)
            });
            
            it("Should add wishlist item (productId) to the user wishlist and return status code 201",async()=>{
                let isWishListHasBeenAdded = false;
                const {body,statusCode} = await supertest(app).post("/api/wishlists").set("Authorization",userTokenNotEmptyWishlist).send({
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
        })

        it("Should return an error with status code 400 when user have full wishlist (6 items)",async()=>{
            const {body,statusCode} = await supertest(app).post("/api/wishlists").set("Authorization",userTokenWithFullWishlist).send({
                productId:productIdForPosting
            });

            expect(statusCode).toBe(400);
            expect(body.message).toBe("User has reached max wishlist items allowed.");
            expectErrorMessage(body);
            expectOperationalError(body);  
        })

        it("Should return an error with status code 400 when user already have the product in wishlist",async()=>{
            const {body,statusCode} = await supertest(app).post("/api/wishlists").set("Authorization",userTokenWithProductAlreadyInWishlist).send({
                productId:productIdForPosting
            });

            expect(statusCode).toBe(400);
            expect(body.message).toBe("Product already exists in wishlist.");
            expectErrorMessage(body);
            expectOperationalError(body);
        }) 
    })

    describe("Testing removing wishlist item",()=>{
        describe("Adding a product to wishlist then remove it",()=>{
            let wishlistItemId: string;
            beforeAll(async()=>{
                console.log(productIdForDeletion)
                wishlistItemId = await addToWishlistAndReturnItemId(userId,productIdForDeletion);
            });

            it("Should remove wishlist item (product) from user wishlist",async()=>{
                const {body,statusCode} = await supertest(app).delete("/api/wishlists").set("Authorization",userTokenNotEmptyWishlist).send({
                    wishlistItemId:wishlistItemId
                });
                console.log(body)
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

        it("Should remove wishlist item (product) from user wishlist",async()=>{
            const wishlistItemIdNotExisting = "642d5c2fa1e1e547ca532d1c"
            const {body,statusCode} = await supertest(app).delete("/api/wishlists").set("Authorization",userTokenNotEmptyWishlist).send({
                wishlistItemId:wishlistItemIdNotExisting
            });

            expect(statusCode).toBe(400);
            expect(body.message).toBe("Product was not found in wishlist.");
            expectErrorMessage(body);
            expectOperationalError(body);
        })
    })
})