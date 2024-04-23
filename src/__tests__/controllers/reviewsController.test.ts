import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import "../../config/cloudinary";
import testData from "../assets/testData/testData.json";
import Product from '../../models/product';
import {  faker } from '@faker-js/faker';

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
    const userToken = testData.adminUserToken;
    const userId = testData.adminUserId;
    const userIdWithNoReviews = testData.userIdWithNoReviews;
    const userTokenWithNoReviews = testData.userTokenWithNoReviews;
    const productIdToUserForAddingReview = testData.productIdForAddingReviews;
    
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
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
        const userTokenToAddingReview = testData.userTokenForAddingReviews;
        const userIdToRemoveItsCommentAfterInsertion = "662790d41c55d25573d084b2";
        // its the userId for the token above
        it("Should add reviews successfully and return message is success",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/reviews`)
            .set("Authorization",userTokenToAddingReview).send({
                productId:productIdToUserForAddingReview,
                comment:faker.word.words({count:{min:1,max:5}}),
                rating:faker.number.int({min:1,max:5}),
            })
            
            expect(statusCode).toBe(201);
            expect(body).toStrictEqual({message:"success"});
        });

        // Trying to add a review to a product that already reviewed by the user
        it("Should return an error ",async()=>{
            const reviewedUserToken = testData.userTokenForAddingReviewsWithUserAlreadyReviewed;
            const {body,statusCode} = await supertest(app).post(`/api/reviews`)
            .set("Authorization",reviewedUserToken).send({
                productId:productIdToUserForAddingReview,
                comment:faker.word.words({count:{min:1,max:3}}),
                rating:faker.number.int({min:1,max:5}),
            })
            expect(statusCode).toBe(400);
            expect(body).toStrictEqual({error:"user has already reviews this product"});
        })
        afterAll(async()=>{
            try{
                await Product.findOneAndUpdate(
                    {_id:productIdToUserForAddingReview},
                    { $pull: { reviews :
                        {
                            userId:userIdToRemoveItsCommentAfterInsertion,
                        }
                    }}
                )
            }catch(error){
                console.error(error);
            }
        })
    })

    describe("Testing edit review",()=>{
        const userTokenToEditReview = testData.userTokenForEditingReview;
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
        const userTokenToRemoveReview = testData.userTokenForRemovingReviews;
        const productIdForRemovingReview = testData.productIdForRemovingReview;
        const userIdForTheRemoveToken = "662703ac1ef3793e27fbab76"
        let reviewId:string;
        beforeAll(async()=>{
            // fetching review Id to delete it
            try{
                const productWithReviewId = await Product.findOne({
                    _id:productIdForRemovingReview
                });
                if(!productWithReviewId){
                    throw "product with review id is not found"
                }
                const review = productWithReviewId?.reviews.map((review : any)=>{
                    if(review.userId =="662703ac1ef3793e27fbab76"){
                        reviewId = review._id;
                        return review._id as string;
                    }
                })
                if(review.length == 0){
                    throw "review was not found"
                }
            }catch(error){
                console.error(error)
            }
        })
        afterAll(async()=>{
            // Adding the a comment for the next text
            try{
                await Product.findOneAndUpdate(
                    {_id:productIdForRemovingReview},
                    { $push: { reviews :
                        {
                            userId:userIdForTheRemoveToken,
                            comment:faker.word.words({count:{min:1,max:5}}),
                            rating:faker.number.int({min:1,max:5}),
                        }
                    }}
                )
            }catch(error){
                console.error(error);
            }
        })
        it("Should remove comment",async()=>{
            const {statusCode} = await supertest(app).delete("/api/reviews").set("Authorization",userTokenToRemoveReview).send({
                productId:productIdForRemovingReview,
                reviewId:reviewId,
            })
            expect(statusCode).toBe(204)
        })
    })
})