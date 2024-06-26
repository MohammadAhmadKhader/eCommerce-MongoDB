
import jwt from "jsonwebtoken" ;
import util from "util"
import Stripe from "stripe";
import { IOrder, IProduct, MongooseMatchStage, OAuthGithubResponse, allowedFields } from "../@types/types";
import { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import { OAuth2Client } from "google-auth-library";

export function isJSON(brand:string){
    try{
        JSON.parse(brand);
        return true
    }catch{
        return false
    }
}

export const signToken = (id:string,email:string)=>{
    return jwt.sign({id,email},process.env.TOKEN_SECRET as string,{
        expiresIn:process.env.LOGIN_EXPIRES,
    })
}

function isHex24String(value : string) {
    return /^[0-9a-fA-F]{24}$/.test(value);
}

export const verifyAndDecodeToken = async(token:string)=>{
    //@ts-expect-error
    const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(token,process.env.TOKEN_SECRET as string);
    return decodedToken;
}


export function collectInvoiceData(finalizingTheInvoice :  Stripe.Invoice,order:IOrder){
    const InvoiceData : any = {};
        InvoiceData["hostedLink"] = finalizingTheInvoice.hosted_invoice_url;
        InvoiceData["pdfLink"] = finalizingTheInvoice.invoice_pdf;
        InvoiceData["subTotal"] = finalizingTheInvoice.subtotal;
        InvoiceData["grandTotal"] = finalizingTheInvoice.total;
        InvoiceData["userId"] = order.userId;
        InvoiceData["orderId"] = order._id;
        InvoiceData["invoiceItems"] = [];

        finalizingTheInvoice.lines.data.forEach((item)=> {
            const newInvoiceLine : any = {};
            newInvoiceLine["quantity"] = item.quantity;
            newInvoiceLine["productId"] = item.metadata.productId;
            newInvoiceLine["unitPrice"] = (item.price! as any).unit_amount / 100;
            (InvoiceData["invoiceItems"] as Array<any>).push(newInvoiceLine)
        });
    return InvoiceData
}

export function getImageObjById(product:IProduct,imageId:string | Schema.Types.ObjectId){
    const imageObj = product.images.filter((imgObj)=> imgObj._id == imageId);
    if(!imageId) return null;
     
    const {_id,imageUrl,thumbnailUrl} = imageObj[0]
    return {_id,imageUrl,thumbnailUrl};
}

export interface SortFieldsOptions<T> {
    fieldInQuery:keyof T | (string & {});
    fieldInDb:keyof T | {};
    allowedDir?: "asc" | "desc" | "both"
}

export const createSortQuery = <T>(sortQuery:any,sortedFields:SortFieldsOptions<T>[]) =>{
    if(typeof sortQuery !== "string"){
        sortQuery = "createdAt_desc";
    }
    
    // default sort
    let SortFieldObject :any ={fieldInDb:"createdAt" ,fieldInQuery:"createdAt",allowedDir:"desc"};
    sortedFields = sortedFields.map((SortField)=>{
        const defaultSortOptions: SortFieldsOptions<T> = {
            fieldInQuery:SortField.fieldInQuery,
            fieldInDb:SortField.fieldInDb || SortField.fieldInQuery as keyof T,
            allowedDir:"both",
        }

        if(SortField.fieldInQuery == sortQuery.split("_")[0]){
            SortFieldObject = {...defaultSortOptions,...SortField};
        }
        return {...defaultSortOptions,...SortField}
    });
   
    let {sortFieldName:sortField} = getSortFieldName(sortQuery);
    let sortDirection: 1 | -1 = -1;
    
    if(sortField == `${SortFieldObject.fieldInQuery as unknown as string}`){
        const sortQueries = (sortQuery as string).split("_");
        if(sortQueries[1] == "desc" && (SortFieldObject.allowedDir == "desc" || SortFieldObject.allowedDir == "both")){
            sortDirection = -1
        }else if(sortQueries[1] == "asc" && (SortFieldObject.allowedDir == "asc" || SortFieldObject.allowedDir == "both")){
            sortDirection = 1
        }else if(SortFieldObject.allowedDir == "asc"){
            sortDirection = 1
        }

        sortField = SortFieldObject.fieldInDb as string;
    }
    
    const sortObject = {
        [sortField]:sortDirection
    }
    return sortObject
}
// TODO must assert direction to be "desc" or "asc" and type to be one of them.
function getSortFieldName(sortQuery : string,defaultFieldName:string="createdAt") :{sortFieldName:string,sortDirection:string} {
    const sortField = sortQuery?.split("_")?.[0] || defaultFieldName;
    const sortDirection = sortQuery?.split("_")?.[1] || "desc";

    return {sortFieldName:sortField,sortDirection};
}


type checks = "gte" | "lte" | "gt" | "lt" | "eq";

export type Filter<TSchema> = {
    fieldNameInQuery:any;
    fieldNameInDB:keyof TSchema | {};
    value:any;
    type?:"Array" | "ObjectId" | "Number" |"SearchType" | "Boolean";
    checks?:checks[];
    search?:(keyof TSchema)[] | {}
};
export type SearchParams<TSchema> = {
    [Field in keyof TSchema]?:TSchema[Field]
} & {text:string;isSensitive?:Boolean}

function isStringOrNumber(numberOrString:any){
    if(typeof numberOrString === "number" || typeof numberOrString==="string"){
        return true
    }
    return false;
}

export function createFilter<TSchemaType>(ArrayOfFilters:Filter<TSchemaType>[],allowedFields?:allowedFields<TSchemaType | any>){
    const matchStage = {} as any;

    ArrayOfFilters.map((filter)=>{
        const {fieldNameInDB,fieldNameInQuery,value,checks,type,search} = filter;

        const isAllowedValue = allowedFields?.[fieldNameInQuery] || false;
        const fixedValue = allowedFields?.[fieldNameInQuery]?.fixedValue;
        const fixedCheck= allowedFields?.[fieldNameInQuery]?.fixedCheck;

        if(isAllowedValue && type === "SearchType" && typeof value === "string"){
            matchStage.$or =[]
            const applyRegexSearch = (search as string[])?.forEach((path)=>{
                matchStage.$or.push({[path] : { $regex : `.*${value}.*`,$options:"i" } });
            })
            return;
        }

        if(checks?.length && isAllowedValue && isStringOrNumber(value)){
            checks?.forEach((check : string)=>{
                if(!matchStage[fieldNameInDB]){
                    matchStage[fieldNameInDB] = {};
                }
                
                const usedCheck = fixedCheck ? fixedCheck : check;
                matchStage[fieldNameInDB][`$${usedCheck}`] = (fixedValue || fixedValue == 0) ? fixedValue : (type === "Number" ? (Number(value) ? Number(value) : Number(value) === 0 ? 0 :delete matchStage[fieldNameInDB]) : value);
            })
            
            return;
        }
        
        if(isAllowedValue && type === "Array" && Array.isArray(value)){
            matchStage[fieldNameInDB] = {};
            matchStage[fieldNameInDB] = { $in :value };
            return;
        }

        if(isAllowedValue && type === "ObjectId"){
            if(isHex24String(value)){
                matchStage[fieldNameInDB] = new ObjectId(value as string);
            }
            return;
        }

        if(isAllowedValue && type === "Boolean"){
            matchStage[fieldNameInDB] = value === "true" ? true : false;
            return;
        }
    })
    
    return matchStage as MongooseMatchStage<TSchemaType>; 
}

export function convertBrandArrayStringToArray(brand : any) : Pick<IProduct,"brand">[] | undefined{
    try{
        const brandsArray = JSON.parse(brand);
        if(Array.isArray(brandsArray)){
            const assertedBrands = brandsArray.map((brand)=>{
                if(typeof brand === "string"){
                   return brand;
                }}
             );
            
            return assertedBrands as unknown as undefined | Pick<IProduct,"brand">[];
        }

        return undefined
    }catch(err){
        return undefined
    }
}

export function filterDate(matchObj:any={},
    createdAt_lte:string | undefined,
    createdAt_gte:string | undefined,
    updatedAt_lte:string | undefined,
    updatedAt_gte:string | undefined,
    value:any) {
    
    if(createdAt_lte){
        matchObj.createdAt = {}
        matchObj.createdAt = {
            $lte:value
        }
        return matchObj;
    }
    if(createdAt_gte){
        matchObj.createdAt = {}
        matchObj.createdAt = {
            $gte:value
        }
        return matchObj;
    }
    
    if(updatedAt_gte){
        matchObj.updatedAt = {}
        matchObj.updatedAt = {
            $gte:value
        }
        return matchObj;
    }
    if(updatedAt_lte){
        matchObj.updatedAt = {}
        matchObj.updatedAt = {
            $lte:value
        }
        return matchObj;
    }      

    return null;
}

export async function getOAuthGoogleUserData(tokenId:string){
    const googleOAuthClientID = process.env.OAUTH_GOOGLE_CLIENT_ID;
    const googleOAuthSecret = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
    
    const OAuthClient = new OAuth2Client(
        googleOAuthClientID,
        googleOAuthSecret,
    )
    
    const ticket = await OAuthClient.verifyIdToken({
        idToken: tokenId,
        audience: googleOAuthClientID, 
    })
    
    const payload = ticket.getPayload() || null;
    return { payload };
}

export function handleUserNameGoogleSignUp(name:string | undefined,email:string){
    let firstName:string;
    let lastName:string | undefined;
    if(name){
       const splittedName = name.split(" ");
       firstName = splittedName[0];
       lastName = splittedName[1]; // user name might be just firstName so this might be undefined
    }else{
        const emailName = email.split("@")[0];
        firstName = emailName;
    }

    return {firstName,lastName};
}

// TODO Add OAuth with github
export function extractGithubUserData(userData:OAuthGithubResponse) {
    let userEmail : null | string= null;
    let isUserVerified = false;
    if(!Array.isArray(userData)){
        return { userEmail ,isUserVerified};
    }

    for(let i = 0; i< userData.length ; i++){
        
        if(userData[0].primary === true){
            userEmail = userData[0].email;
        }
        if(!userData[0].verified){
            isUserVerified = false;
            break;
        }
    }

    return { userEmail ,isUserVerified}
}