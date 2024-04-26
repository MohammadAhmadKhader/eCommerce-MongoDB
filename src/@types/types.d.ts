import { ObjectId } from 'mongoose';
import { IReview } from './types.d';
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
    _id:Schema.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    offer:number;
    categoryId:Schema.Types.ObjectId;
    finalPrice?: number;
    quantity: number;
    reviews: {
        _id:Schema.Types.ObjectId;
        comment: string;
        userId: Schema.Types.ObjectId;
        rating: number;
        createdAt: Date;
        updatedAt: Date;
    }[];
    images: {
        _id:Schema.Types.ObjectId;
        imageUrl: string;
        thumbnailUrl: string;
    }[];
    brand: string;
}

export interface IReview {
    comment: string;
    userId: Schema.Types.ObjectId;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    _id:Schema.Types.ObjectId;
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
    _id:Schema.Types.ObjectId;
    fullName:string;
    mobileNumber:string;
    state:string;
    city:string;
    pinCode:string;
    streetAddress:string;
    country:string;
}

export interface IWishListItem {
    _id:Schema.Types.ObjectId;
    productId:Schema.Types.ObjectId;
}

export interface IWishListItemPopulated {
    _id:Schema.Types.ObjectId;
    product:{
        name:string;
        categoryId:Schema.Types.ObjectId;
        price:number;
        finalPrice:number;
        offer:number;
        quantity:number;
        images:image[];
        brand:string;
    }
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
    email:string;
    iat:number;
    exp:number;
}

export interface IOrder {
    _id:Schema.Types.ObjectId
    subTotal:number,
    discount:number,
    userId:Schema.Types.ObjectId,
    deliveryFee:number,
    grandTotal:number,
    isPaid:Boolean,
    status:"Placed" | "Processing" | "Cancelled" | "Completed",
    orderItems:IOrderItem[],
    address:IAddresses;
    paymentDetails:string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export interface IInvoice {
    _id:Schema.Types.ObjectId,
    hostedLink:string;
    pdfLink:string;
    subTotal:number;
    grandTotal:number;
    userId:Schema.Types.ObjectId;
    orderId:Schema.Types.ObjectId;
    invoiceItems:IInvoiceItem[];
    createdAt:Date;
    updatedAt:Date;
}

export interface IInvoiceItem {
    quantity:number;
    unitPrice:number;
    productId:Schema.Types.ObjectId;
    _id:Schema.Types.ObjectId;
}

export interface IOrderItem {
    name:string,
    quantity:number,
    productId:Schema.Types.ObjectId,
    thumbnailUrl:string,
    price:number,
    subTotal:number,
    brand:string;

}

export interface IProductImage {
    _id:Schema.Types.ObjectId;
    imageUrl:string;
    thumbnailUrl:string;
}

export type image = {
    imageUrl:string,
    thumbnailUrl:string,
}

export interface ITokensCache {
    [key:string] : string
}

export interface IResetPassCode {
    _id:ObjectId;
    userId:Schema.Types.ObjectId;
    code:string | undefined;
    expiredAt:Date;
}

export interface IAuthenticateMiddleware {
    (req: Request, res: Response, next: NextFunction) : Promise<void | Response<any, Record<string, any>>>
}

export interface IUserChangeInformation {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    birthdate?: string;
}