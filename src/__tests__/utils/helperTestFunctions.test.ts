import { Response } from "express";
import SessionToken from "../../models/sessionToken";
import { signToken } from "../../utils/HelperFunctions";
import User from "../../models/user";

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

export async function createUserToken(userId : string){
    try{
        const user = await User.findOne({_id:userId});
        if(!user){
            throw new Error(`User was not found for the _id : ${userId}`);
        }
        const newToken = signToken(userId,user.email)
        const renewedToken = await SessionToken.findOneAndUpdate({
            userId:userId
        },{
            token:newToken
        },{
            new:true,
            upsert:true
        });
        
        return renewedToken.token;
    }catch(error){
        console.error(error)
    }
}