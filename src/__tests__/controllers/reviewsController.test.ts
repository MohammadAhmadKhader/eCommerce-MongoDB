import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import "../../config/cloudinary";
import testData from "../assets/testData/testData.json";
import {  faker } from '@faker-js/faker';
import { createUserTokenAndCache, insertUserReview, pullUserReview } from "../utils/helperTestFunctions.test";

const app = createServer()
const expectReview = (review : any,userId:string)=>{
    const expectedRatings = [1,2,3,4,5]
    expect(typeof review.comment).toBe("string");
    expect(review.userId).toBe(userId);
    expect(expectedRatings).toEqual(expect.arrayContaining([review.rating]));
    expect(typeof review.createdAt).toBe("string");
    expect(typeof review.updatedAt).toBe("string");
    expect(typeof review._id).toBe("string");
    expect(review.createdAt.length).toBe(24);
    expect(review.updatedAt.length).toBe(24);
    expect(review._id.length).toBe(24);
}
describe("Reviews",()=>{
    const userId = testData.adminUserId;
    const userIdWithNoReviews = testData.userIdWithNoReviews;
    const productIdToUserForAddingReview = testData.productIdForAddingReviews;
    let userToken : string;
    let userTokenWithNoReviews : string;
    
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        userToken = await createUserTokenAndCache(userId) as string;
        userTokenWithNoReviews = await createUserTokenAndCache(userIdWithNoReviews) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("Testing get all Reviews by user",()=>{
        it("Should return all user reviews",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/reviews/${userId}`).set("Authorization",userToken);
            expect(statusCode).toBe(200);
            body.reviews.forEach((item : any) => {
                expectReview(item,userId)
            });
        });

        it("Should return an empty array with no reviews (length = 0)",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/reviews/${userIdWithNoReviews}`).set("Authorization",userTokenWithNoReviews);
            expect(statusCode).toBe(200);
            expect(body.reviews.length).toBe(0)
        });
    });

    describe("Testing adding review",()=>{
        let userTokenToAddingReview : string;
        const userIdToRemoveItsCommentAfterInsertion = testData.userIdToRemoveItsCommentAfterInsertion;
        describe("fetch and renew user's token and use it to add review",()=>{
            beforeAll(async()=>{
                userTokenToAddingReview = await createUserTokenAndCache(userIdToRemoveItsCommentAfterInsertion) as string;
            })

            it("Should add reviews successfully and return message is success",async()=>{
                const {body,statusCode} = await supertest(app).post(`/api/reviews`)
                .set("Authorization",userTokenToAddingReview).send({
                    productId:productIdToUserForAddingReview,
                    comment:faker.word.words({count:{min:1,max:5}}),
                    rating:faker.number.int({min:1,max:5}),
                })
                console.log(JSON.stringify(body))
                expect(statusCode).toBe(201);
                expect(body).toStrictEqual({message:"success"});
            });

            afterAll(async()=>{
                await pullUserReview(userIdToRemoveItsCommentAfterInsertion,productIdToUserForAddingReview)
            })
        })

        describe("Inserting review on product then remove the inserted review for next test",()=>{
            let reviewedUserToken :string ;
            const userIdForAddingReviewsWithUserAlreadyReviewed = testData.userIdForAddingReviewsWithUserAlreadyReviewed;

            beforeAll(async()=>{
                reviewedUserToken = await createUserTokenAndCache(userIdForAddingReviewsWithUserAlreadyReviewed) as string;
            })

            it("Should return an error with status code 400 and message with user already reviews this product",async()=>{
                const {body,statusCode} = await supertest(app).post(`/api/reviews`)
                .set("Authorization",reviewedUserToken).send({
                    productId:productIdToUserForAddingReview,
                    comment:faker.word.words({count:{min:2,max:3}}),
                    rating:faker.number.int({min:1,max:5}),
                })
                expect(statusCode).toBe(400);
                expect(body).toStrictEqual({error:"user has already reviews this product"});
            });

            afterAll(async()=>{
                await pullUserReview(userIdToRemoveItsCommentAfterInsertion,productIdToUserForAddingReview)
            });
        })
        
    })

    describe("Testing edit review",()=>{
        let userTokenToEditReview : string;
        const userIdToEditReview = testData.userIdToEditReview;
        beforeAll(async()=>{
            userTokenToEditReview = await createUserTokenAndCache(userIdToEditReview) as string;
        });
        const reviewId = "6627bfcd5f0434b2e66c33ba";
        it("Should edit review and return message is success",async()=>{
            const {body,statusCode} = await supertest(app).put("/api/reviews").send({
                comment:faker.word.words({count:{min:1,max:3}}),
                rating:faker.number.int({min:1,max:5}),
                reviewId:reviewId
            }).set("Authorization",userTokenToEditReview)
            expect(statusCode).toBe(201);
            expect(body).toStrictEqual({message:"success"})
        })
    })

    describe("Testing removing review",()=>{
        const productIdForRemovingReview = testData.productIdForRemovingReview;
        let userTokenToRemoveReview :string;
        const userIdToRemoveReview = testData.userIdToRemoveReview;
        let reviewId:string;
        beforeAll(async()=>{
            reviewId = await insertUserReview(userIdToRemoveReview,productIdForRemovingReview) as string;
            userTokenToRemoveReview = await createUserTokenAndCache(userIdToRemoveReview) as string;
        })

        it("Should remove comment",async()=>{
            const {body,statusCode} = await supertest(app).delete("/api/reviews").set("Authorization",userTokenToRemoveReview).send({
                productId:productIdForRemovingReview,
                reviewId:reviewId,
            })
            console.log(reviewId)
            console.log(JSON.stringify(body))
            expect(statusCode).toBe(204)
        })
    })
})