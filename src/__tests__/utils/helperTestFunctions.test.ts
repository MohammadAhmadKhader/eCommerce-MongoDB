import { Response } from "express";
import SessionToken from "../../models/sessionToken";
import { signToken } from "../../utils/HelperFunctions";
import User from "../../models/user";
import { ITokensCache } from "../../@types/types";
import Order from "../../models/order";
import Product from "../../models/product";
import testData from "../assets/testData/testData.json"
import { faker } from "@faker-js/faker";
import crypto from 'crypto';
import ResetPassCode from "../../models/resetPassCode";

const tokensCache : ITokensCache = {};

export function expectId(expectedId: any){
    expect(typeof expectedId).toBe("string");
    expect(expectedId.length).toBe(24);
}

export function createResponseNext(){
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        sendStatus:jest.fn()
    } as unknown as Response;
    const next = jest.fn(); 
    return { next , res }
}

export async function createUserTokenAndCache(userId : string){
    try{
        if(tokensCache[userId]){
            return tokensCache[userId];
        }
        const user = await User.findOne({_id:userId});
        if(!user){
            throw new Error(`User was not found for the _id : ${userId}`);
        }

        const newToken = signToken(userId,user.email);

        const renewedToken = await SessionToken.findOneAndUpdate({
            userId:userId
        },{
            token:newToken
        },{
            new:true,
            upsert:true
        });

        tokensCache[userId] = renewedToken.token;
        return renewedToken.token;
    }catch(error){
        console.error(error);
    }
}

export async function createAddressAndReturnId(userId:string,newAddress : any){
    try{
        const createNewAddress = await User.findOneAndUpdate({_id:userId},{
            $push:{
                addresses:{
                    ...newAddress
                }
            }
        });
        if(!createNewAddress){
            throw new Error("Failed to create new address")
        }
        const addressId = createNewAddress.addresses[createNewAddress.addresses.length - 1]._id as unknown as string;
        return addressId
    }catch(error){
        console.error(error)
    }
}

export async function popUserAddress(userId:string,amountToPop : number){
    try{
        const newAddress = await User.findOneAndUpdate({_id:userId},{
            $pop : { addresses : amountToPop }
        });
        if(!newAddress){
            throw new Error("Failed to remove last address from user")
        }
    }catch(error){
        console.error(error)
    }
}

export async function createManyCartItemsByUserId(userId : string,cartItems : {productId:string;quantity:number}[] = []){ 
    try{
        const createCartItems = await User.updateOne({_id:userId},{
            $push:{
                cart:{
                    $each:[
                        ...cartItems
                    ],
                }
            }
        });
        if(createCartItems.modifiedCount == 0){
            throw new Error(`cart was not updated with userId : ${userId}`);
        }
    }catch(error){
        console.error(error)
    }
    
}

export async function resetOrderStatus(orderId:string,statusToSet : "Placed" | "Completed" | "Processing" | "Cancelled"){
    try{
        const resetOrderStatus = await Order.updateOne({
            _id:orderId
        },{
            status:statusToSet
        })

        if(resetOrderStatus.modifiedCount == 0){
            throw new Error(`order with id : ${orderId} was not reset`);
        }
    }catch(error){
        console.error(error)
    }
}

export async function createProduct(){
    try{
        const imgUrl = "https://res.cloudinary.com/doxhxgz2g/image/upload/v1714071486/eCommerce-React-app/BrandsLogos/p1kuv3kgkij8fwzpcr4j.jpg"
        const product = await Product.create({
            name:"ProductForTesting",
            description:"ProductForTesting",
            categoryId:testData.categoryIdForTesting,
            brand:"Nike",
            price:100,
            images:[{
                imageUrl:imgUrl,
                thumbnailUrl:imgUrl
            }]
        })
         
        return product;
    }catch(error){
        console.error(error)
    }
}

export async function pullUserReview(userId:string,productId:string){
    try{
        const pullReviews = await Product.updateOne(
            {_id:productId},
            { $pull: { reviews :
                {
                    userId:userId,
                }
            }}
        )
        if(pullReviews.modifiedCount == 0 || pullReviews.matchedCount == 0){
            throw new Error(`Failed to pull user review userId = ${userId}, on product with productId = ${productId}`)
        }
    }catch(error){
        console.error(error);
    }
}

export async function insertUserReview(userId:string,productId:string){
    try{
        let reviewId = "";
        const product = await Product.findOneAndUpdate(
            {_id:productId},
                {    
                    $push: {
                         reviews :
                            {
                                userId:userId,
                                comment:faker.word.words({count:{min:1,max:5}}),
                                rating:faker.number.int({min:1,max:5}),
                            }
                        }
                },{
                    new:true
                }
        )
        if(!product){
            throw new Error(`Product with id : ${productId} was not found`);
        }
        product.reviews.forEach((review)=>{
            if(review["userId"].toString() == userId){
                reviewId = review._id.toString();
            }
        })

        if(!reviewId){
            throw new Error(`Review for user with id : ${userId} on product with productId : ${productId} was not found`);
        }

        return reviewId;
    }catch(error){
        console.error(error);
    }
}

export async function changeUserUpdateAt(userId:string,newUpdateAt:Date | number,timestamps : boolean = false){
    try{
        const updateUser = await User.findOneAndUpdate({
            _id:userId,
        },
        {
           $set:{ updatedAt:newUpdateAt}
        },{
            timestamps:timestamps,
            
        });
        
        if(!updateUser){
            throw new Error(`User with id : ${userId} was not found during attempt to update its "updatedAt" to : ${newUpdateAt} with timestamps set to : ${timestamps}`)
        }
        return updateUser
    }catch(error){
        console.error(error)
    }
}

export async function createResetCode(userId : string){
    try{
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetCode = await ResetPassCode.create({
            userId:userId,
            code:resetToken,
        });
        
        return resetCode;
    }catch(error){
        console.error(error)
    }
}

export async function popProductImages(productId : string){
    try{
        await Product.findOneAndUpdate({_id:productId},{
            $pop:{images:1}
        },{multi:true})
    }catch(error){
        console.error(error)
    }
}