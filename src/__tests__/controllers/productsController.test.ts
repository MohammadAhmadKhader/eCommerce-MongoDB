import { image ,IProduct} from '../../@types/types';
import supertest from "supertest";
import createServer from "../../utils/Server";
import mongoose from "mongoose";
import DatabaseTestHandler from "../../utils/DatabaseTestHandler";
import testData from "../assets/testData/testData.json"
import "../../config/cloudinary"
import { createProduct, createUserTokenAndCache, expectErrorMessage,  expectOperationalError, popProductImages } from '../utils/helperTestFunctions.test';
import { ObjectId } from 'mongoose';
import { expectProductReview } from '../utils/productUtils.test';
const app = createServer()

describe("Products",()=>{
    const adminUserId= testData.adminUserId;
    let adminUserToken :string;
    const categoryId= testData.categoryIdForTesting;
    const imagePath = "./src/__tests__/assets/images/testImage.jpg"
     
    beforeAll(async()=>{
        const DB_URL_TEST = process.env.DB_URL_TEST as string;
        await DatabaseTestHandler.connectToDB(mongoose,DB_URL_TEST);
        adminUserToken = await createUserTokenAndCache(adminUserId) as string;
    })

    afterAll(async()=>{
        await DatabaseTestHandler.disconnectFromDB(mongoose);
    })
    
    describe("get product by id controller",()=>{
        it("should return product with comments and average ratings", async ()=>{
            const productId = "65ecde9d50cbedf3920a2c2b"
            const {body,statusCode} = await supertest(app).get(`/api/products/${productId}`);
            expect(statusCode).toBe(200);
            expect(body.product._id).toBe(productId);

            if(body.product.reviews.length > 0){
                body.product.reviews.forEach((rev : any)=>{
                    expectProductReview(rev)
                })
            }

            body.product.images.forEach((item : image)=>{
                expect(item.imageUrl).toEqual(expect.any(String));
                expect(item.thumbnailUrl).toEqual(expect.any(String));
            })
        })

        it("Should return an Error 500 when the ODM does not accept the Id",async()=>{
            const productId = "randomString";
            const {body,statusCode} = await supertest(app).get(`/api/products/${productId}`);
            
            expect(statusCode).toBe(500);
            expect(body.product).toBeUndefined();
            expectErrorMessage(body);
        })

        it("Should return an Error 400 when product was not found",async()=>{
            const productId = "65ecde9d53bbedd3920a2c0c";
            const {body,statusCode} = await supertest(app).get(`/api/products/${productId}`);
            
            expect(statusCode).toBe(400); 
            expect(body.product).toBeUndefined();
            expectErrorMessage(body);
            expectOperationalError(body)
        })
    }) 
    
    describe("get all products route",()=>{
        it("Should return products with page = 1 & limit = 9",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=9");
            expect(statusCode).toBe(200)
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.name).toEqual(expect.any(String));
                    expect(product.offer).toBeLessThanOrEqual(1);
                    expect(product.offer).toBeGreaterThanOrEqual(0);
                    expect(product.brand).toEqual(expect.any(String));
                    expect(product.description).toBeUndefined();
                    expect(product.categoryId).toEqual(expect.any(String));
                    expect(Number.isInteger(product.quantity)).toBe(true);
                    expect(product.finalPrice).toBeLessThanOrEqual(product.price);
                    product.images.forEach((item : image)=>{
                        expect(item.imageUrl).toEqual(expect.any(String));
                        expect(item.thumbnailUrl).toEqual(expect.any(String));
                    })
                })
            }
        })

        it("Should return products with no offer",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=9&offer=true");
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.offer).toBeLessThanOrEqual(1);
                    expect(product.offer).toBeGreaterThan(0);
                })
            }
        })

        it("Should return products with offer and bypass the offer random string",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=9&offer=randomString");
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.offer).toBeLessThanOrEqual(1);
                    expect(product.offer).toBeGreaterThanOrEqual(0);
                })
            }
        })

        it("Should return products with the selected Category",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?page=1&limit=9&category=${categoryId}`);
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.categoryId).toBe(categoryId);
                })
            }
        })
        
        it("Should return products matching one brand only",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=9&brand=[%22Casio%22]");
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.brand).toMatch(/Casio/)
                })
            }
        })

        it("Should return products matching more than one brand",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?page=1&limit=9&brand=[%22Casio%22,%22Adidas%22]");
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.brand).toMatch(/Casio|Adidas/)
                })
            }
        })

        it("Should return products matching pricing range",async()=>{
            const priceLessThanOrEqual = 150;
            const priceGreaterThanOrEqual = 10;
            const {body,statusCode} = await supertest(app).get(`/api/products?price_lte=${priceLessThanOrEqual}&price_gte=${priceGreaterThanOrEqual}`);
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.finalPrice).toBeLessThanOrEqual(priceLessThanOrEqual);
                    expect(product.finalPrice).toBeGreaterThanOrEqual(priceGreaterThanOrEqual);
                })
            }
        })

        it("Should return products with quantity more than 0",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?available=true`);
            expect(statusCode).toBe(200);
            if(body.products.length > 0){
                body.products.forEach((product : IProduct)=>{
                    expect(product.quantity).toBeGreaterThan(0);
                })
            }
        })

        it("Should return products sorted by price (final price) ascending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=price_asc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect((body.products[i] as IProduct).finalPrice).toBeGreaterThanOrEqual((body.products[i - 1] as IProduct).finalPrice as number)
                }
            }
        })

        it("Should return products sorted by price (final price) descending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=price_desc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect((body.products[i] as IProduct).finalPrice).toBeLessThanOrEqual((body.products[i - 1] as IProduct).finalPrice as number)
                }
            }
        })

        it("Should return products sorted by avgRating(ratings) descending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=ratings_desc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect(body.products[i].avgRating).toBeLessThanOrEqual(body.products[i - 1].avgRating)
                }
            }
        })

        it("Should return products sorted by avgRating(ratings) ascending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=ratings_asc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect(body.products[i].avgRating).toBeGreaterThanOrEqual(body.products[i - 1].avgRating)
                }
            }
        })

        it("Should return products sorted by ratingsNumber ascending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=ratingNumbers_asc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect(body.products[i].ratingNumbers).toBeGreaterThanOrEqual(body.products[i - 1].ratingNumbers)
                }
            }
        })

        it("Should return products sorted by ratingsNumber descending",async()=>{
            const {body,statusCode} = await supertest(app).get(`/api/products?sort=ratingNumbers_desc`);
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect(body.products[i].ratingNumbers).toBeLessThanOrEqual(body.products[i - 1].ratingNumbers)
                }
            }
        })

        it("Should return products sorted by createdAt descending",async()=>{
            const {body,statusCode} = await supertest(app).get("/api/products?sort=newArrivals=desc");
            expect(statusCode).toBe(200);
            expect(body.products.length).toBeGreaterThan(0);
            for(let i = 0 ; i < body.products.length ; i++){
                if(i != 0){
                    expect(new Date(body.products[i].createdAt).getTime()).toBeLessThanOrEqual(new Date(body.products[i - 1].createdAt).getTime())
                }
            }
        })
    })

    describe("Create Product Controller",()=>{
        
        it("Should Create Product and return status code 201 and return the created product",async()=>{
            const productName = "TestingProducts";
            const productDescription = "test Description Product";
            const productBrand = "Levi's";

            const {body,statusCode} = await supertest(app).post(`/api/products/${adminUserId}`)
            .field("name",productName).field("categoryId",categoryId).field("brand",productBrand)
            .field("price",200).field("description",productDescription)
            .attach("image",imagePath).set('Authorization', adminUserToken);
            
            expect(statusCode).toBe(201);
            expect(body.message).toBe("success");
            expect(body.product.name).toBe(productName);
            expect(body.product.description).toBe(productDescription);
            expect(body.product.price).toBe(200);
            expect(body.product.finalPrice).toBe(200);
            expect(body.product.offer).toBe(0);
            expect(body.product.quantity).toBe(1);
            expect(body.product.brand).toBe(productBrand);
            expect(body.product.images).toHaveLength(1);
            expect(typeof body.product.images[0].imageUrl).toBe("string")
            expect(typeof body.product.images[0].thumbnailUrl).toBe("string");
        })
    })

    describe("Append Images to Product",()=>{
        const productIdForUpdate = testData.productsRoute.productIdForUpdate;
        // const productIdForUpdate = "65ecac2fdeee9c7ef42ffe65"
        it("Should append images to product",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/products/${productIdForUpdate}/${adminUserId}`)
            .set('Authorization', adminUserToken)
            .attach("images",imagePath)
            .attach("images",imagePath)
            expect(statusCode).toBe(200);
            expect(body).toStrictEqual({message:"success"})
        })
        
        it("Should return an error because images were not set and return error with status code 400",async()=>{
            const {body,statusCode} = await supertest(app).post(`/api/products/${productIdForUpdate}/${adminUserId}`)
            .set('Authorization', adminUserToken)
            expect(statusCode).toBe(400);
            expectErrorMessage(body)
            expectOperationalError(body)
        })

        afterAll(async()=>{
            await popProductImages(productIdForUpdate);
            await popProductImages(productIdForUpdate);
        })
    })

    describe("Delete Product Controller",()=>{
        let productIdForDelete: ObjectId;
        let productBeforeDelete : IProduct;
        beforeAll(async()=>{
            productBeforeDelete = await createProduct() as IProduct;
            productIdForDelete = productBeforeDelete._id;
        })
        it("Should delete product and return status code 200",async()=>{
            const arrayOfImagesUrl : any = [];
            const arrayOfThumbnailsUrl : any = [];

            productBeforeDelete.images.forEach((item)=>{
                arrayOfImagesUrl.push(item.imageUrl);
                arrayOfThumbnailsUrl.push(item.thumbnailUrl);
            })

            const {body,statusCode} = await supertest(app).delete(`/api/products/${productIdForDelete}/${adminUserId}`)
            .set('Authorization', adminUserToken);
            expect(statusCode).toBe(200);
            expect(body.message).toBe("success");
            expect(body.ArrOfImagesThumbnailToDelete).toStrictEqual(arrayOfThumbnailsUrl);
            expect(body.ArrOfImagesMainToDelete).toStrictEqual(arrayOfImagesUrl);

        })

        it("should return status 500 if product Id was not proper invalid _id",async()=>{
            const productIdForDelete  = "randomString"
            const {statusCode} = await supertest(app).delete(`/api/products/${productIdForDelete}/${adminUserId}`)
            .set('Authorization', adminUserToken);
            expect(statusCode).toBe(500);
        })

        it("should return status 400 and body = {error : product was not found} if product was not found",async()=>{
            const productIdForDelete  = "68ecde9d50cbcdf3920a2c2b"
            const {body,statusCode} = await supertest(app).delete(`/api/products/${productIdForDelete}/${adminUserId}`)
            .set('Authorization', adminUserToken);
            
            expect(statusCode).toBe(400);
            expectErrorMessage(body);
            expectOperationalError(body)
        })
    })

})
