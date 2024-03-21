import { Schema } from "mongoose";

export interface IMulterFile {
    buffer: Buffer, 
    encoding: string, 
    fieldname: string, 
    mimetype: string, 
    originalname: string, 
    size: number;
};

export interface ICategory {
    name:String,
    imageUrl:String,
}
export interface IProduct {
    name: string;
    description: string;
    price: number;
    offer:number;
    categoryId:Schema.Types.ObjectId,
    finalPrice?: number;
    quantity: number;
    reviews: {
        comment: string;
        userId: Schema.Types.ObjectId;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }[];
    images: {
        imageUrl: string;
        thumbnailUrl: string;
    }[];
    brand: string;
}

export interface IUser {
    _id:ObjectId;
    email:string;
    password:string;
    firstName:string;
    lastName:string;
    mobileNumber:string;
    userImg:string;
    birthdate:Date;
    role:"user" | "admin";
    passwordChangedAt:Date | undefined;
    addresses:IAddresses[];
    wishList:IWishListItem[];
    cart:ICartItem[];
    createdAt:Date;
    updatedAt:Date;
    isPasswordHasChanged:(JWT_Timestamps:number)=>Promise<boolean>
}

export interface IAddresses {
    fullName:string;
    mobileNumber:string;
    state:string;
    city:string;
    pinCode:string;
    streetAddress:string;
    country:string;
}

export interface IWishListItem {
    _id:ObjectId;
    productId:ObjectId;
}

export interface IImageThumbnailOptions {
    width:number;
    height:number;
    fit:string ;
    responseType: string | any ;
    jpegOptions: {force:boolean,quality:number};
}

export interface ICartItem {
    _id:ObjectId;
    productId:ObjectId;
    quantity:number;
}

export interface IDecodedToken {
    id:string;
    iat:number;
    exp:number;
}

export type image = {
    imageUrl:string,
    thumbnailUrl:string,
}

