import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import { ICategory } from "../../@types/types";
import { createCategory, createUserTokenAndCache, deleteCategory } from "../utils/helperTestFunctions.test";
import { faker } from "@faker-js/faker";
import { expectCategory } from "../utils/categoryUtils.test";
import testData from "../assets/testData/testData.json"
import "../../config/cloudinary";
const app = createServer()

describe("Categories",()=>{
    const imagePath = "./src/__tests__/assets/images/testImage.jpg"
    let adminUserToken: string;
    const adminUserId = testData.adminUserId;

    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        adminUserToken = await createUserTokenAndCache(adminUserId) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })

    describe("get All categories",()=>{
        it("Should return all categories",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/categories`);
            expect(statusCode).toBe(200)
            expect(body.categories.length).toBeGreaterThan(0);
            body.categories.forEach((category : ICategory)=>{
                expectCategory(category);
            })
        })
    })

    describe("Create Category",()=>{
        let category: ICategory | undefined;
        it("Should create category and return status code 201 with the created category",async()=>{
            const categoryName = faker.commerce.department();
            
            const {body,statusCode} = await supertest(app).post(`/api/categories`)
            .field("name",categoryName).attach("image",imagePath).set("Authorization",adminUserToken);

            expect(statusCode).toBe(201)
            expect(body.message).toBe("success");
            expectCategory(body.category);
            category = body.category as ICategory;
        });

        afterAll(async ()=>{
            if(category){
                await deleteCategory(category?._id)
            }
        })
    })

    describe("Update Category",()=>{
        let categoryToUpdate:ICategory | undefined;
        beforeAll(async()=>{
            categoryToUpdate = await createCategory() as ICategory;
        })

        it("Should update category successfully when an image does exist",async()=>{
            const categoryName = faker.commerce.department();
            
            const {body,statusCode} = await supertest(app).put(`/api/categories/${categoryToUpdate?._id}`)
            .field("name",categoryName).attach("image",imagePath).set("Authorization",adminUserToken);

            expect(statusCode).toBe(200)
            expect(body.message).toBe("success");
            expectCategory(body.category);
            expect(body.category.name).toBe(categoryName);
        });

        it("Should update category successfully when an image does not exist",async()=>{
            const categoryName = faker.commerce.department();
            
            const {body,statusCode} = await supertest(app).put(`/api/categories/${categoryToUpdate?._id}`)
            .field("name",categoryName).set("Authorization",adminUserToken);

            expect(statusCode).toBe(200)
            expect(body.message).toBe("success");
            expectCategory(body.category);
            expect(body.category.name).toBe(categoryName);
        });

        it("Should update category successfully when an image does not exist",async()=>{
            const categoryName = faker.commerce.department();
            const categoryIdNotExisting = testData.categoryIdNotExisting;
            
            const {body,statusCode} = await supertest(app).put(`/api/categories/${categoryIdNotExisting}`)
            .field("name",categoryName).set("Authorization",adminUserToken);

            expect(statusCode).toBe(400)
            expect(body.message).toBe("Category was not found.");
            expect(body.category).toBeUndefined();
        });

        afterAll(async ()=>{
            if(categoryToUpdate){
                await deleteCategory(categoryToUpdate?._id)
            }
        })
    })


    describe("Delete category",()=>{
        let categoryForDelete: ICategory | undefined;

        describe("Should create a category and delete it",()=>{
            beforeAll(async()=>{
                categoryForDelete = await createCategory() as ICategory;
            });

            it("Should create category and return status code 201 with the created category",async()=>{
                const {statusCode} = await supertest(app)
                .delete(`/api/categories/${categoryForDelete?._id}`)
                .set("Authorization",adminUserToken);

                expect(statusCode).toBe(204)
            });
        })
        

        it("Should return an error with status code 400 that category does not exist",async()=>{
            const categoryIdNotExisting = testData.categoryIdNotExisting;
            const {body,statusCode} = await supertest(app).delete(`/api/categories/${categoryIdNotExisting}`).set("Authorization",adminUserToken);
            expect(statusCode).toBe(400);
            expect(body.message).toBe("Category was not found.")
            expect(body.category).toBeUndefined();
        });
    })

})