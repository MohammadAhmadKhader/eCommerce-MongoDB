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

export type image = {
    imageUrl:string,
    thumbnailUrl:string,
}

