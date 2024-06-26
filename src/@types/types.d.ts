import { ObjectId,Schema } from 'mongoose';
import multer,{FileFilterCallback} from "multer"
import { ObjectId,FilterOperations } from 'mongodb';
import type {QuerySelector, RootQuerySelector}from "mongoose";

export interface ICategory {
    _id:Schema.Types.ObjectId;
    name:String,
    imageUrl:String,
}
export interface IProduct{
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
    createdAt:string;
    updatedAt:string;
}
export type ISingleProduct = Omit<IProduct, "reviews"> & {
    avgRating:number;
    ratingNumbers: number;
}
export type IReview = IProduct["reviews"][number];
export type IProductImage = IProduct["images"][number];
export type image = Omit<IProduct["images"][number] ,"_id">

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
    responseType: "buffer"  ;
    jpegOptions: {force:boolean;quality:number};
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
    _id:Schema.Types.ObjectId;
    name:string,
    quantity:number,
    productId:Schema.Types.ObjectId,
    thumbnailUrl:string,
    price:number,
    subTotal:number,
    brand:string;
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

export interface ICartItemPopulated {
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

export interface ISessionToken {
    _id:Schema.Types.ObjectId;
    userId:Schema.Types.ObjectId;
    token:string;
    updatedAt:Date;
    createdAt:Date;
}

export interface IBrand {
    _id:Schema.Types.ObjectId;
    name:string;
    imageUrl:string;
}

export interface UploadOptions {
    fileSize?: number;
    filesNum?: number;
    fileFilter?: (req: any, file: Express.Multer.File, callback: FileFilterCallback) => void;
}

export type CategoryDto ={
    name:string;
    image:Express.Multer.File
}

export interface IFilterAndSortAllUsers {
    email?:string | undefined;
    name?:string|undefined;
    mobileNumber?:string | undefined;
    sort? : {
        createdAt?:"asc" | "desc";
        email?:"asc" | "desc";
        name?:"asc" | "desc";
    }
}
export interface ISortQuery {
    createdAt:1|-1;
    email?:1|-1;
    name?:1|-1;
}

export interface IUsersMatchStage {
    email?:string;
    name?:string;
    mobileNumber?:string;
}

export interface IInvoicesSortObj {
    subTotal?: 1 | -1;
    createdAt?: 1 | -1;
    grandTotal?: 1 | -1;
}

type RootQuerySelectors<K>= {
    [Selector in keyof RootQuerySelector<K>]: any;
};

export type MongooseMatchStage<Schema> = FilterOperations<Schema> & RootQuerySelectors<Schema>;

export type allowedFields<Schema> ={
    [Field in keyof Schema]?: {fixedValue?:any,fixedCheck?:any};
}

export type OAuthGithubResponse = {
    email:string;
    primary:boolean;
    verified:boolean;
    visibility:null | "public" | "private";
}[]