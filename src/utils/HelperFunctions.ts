
import jwt from "jsonwebtoken" ;
import util from "util"
import Stripe from "stripe";
import { IOrder, IProduct, MongooseMatchStage, allowedFields } from "../@types/types";
import { Schema } from "mongoose";
import { ObjectId } from "mongodb";
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
    fieldInDb:keyof T | undefined;
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


type checks = "gte" | "lte" | "gt" | "lt";

export type Filter<TSchema> = {
    fieldNameInQuery:any;
    fieldNameInDB:keyof TSchema;
    value:any;
    type?:"Array" | "ObjectId" | "Number" |"SearchType";
    checks?:checks[];
    search?:SearchParams<TSchema>[]
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

    ArrayOfFilters.forEach((filter)=>{
        const {fieldNameInDB,fieldNameInQuery,value,checks,type} = filter;

        const isAllowedValue = allowedFields?.[fieldNameInQuery] || false;
        const fixedValue = allowedFields?.[fieldNameInQuery]?.fixedValue;
        const fixedCheck= allowedFields?.[fieldNameInQuery]?.fixedCheck;

        if(checks?.length && isAllowedValue && isStringOrNumber(value)){
            checks?.forEach((check : string)=>{
                if(!matchStage[fieldNameInDB]){
                    matchStage[fieldNameInDB] = {};
                }
                const usedCheck = fixedCheck ? fixedCheck : check;
                matchStage[fieldNameInDB][`$${usedCheck}`] = (fixedValue || fixedValue == 0) ? fixedValue : (type === "Number" ? Number(value) : value);
            })
        }
        
        if(isAllowedValue && type === "Array" && Array.isArray(value)){
            matchStage[fieldNameInDB] = {};
            matchStage[fieldNameInDB] = { $in :value };
        }

        if(isAllowedValue && type === "ObjectId"){
            if(isHex24String(value)){
                matchStage[fieldNameInDB] = new ObjectId(value as string);
            }   
        }
        if(isAllowedValue && type === "SearchType" && typeof value === "string"){
            matchStage.$or =[]
            matchStage.$or.push({name: { $regex : `.*${value}.*`,$options:"i" } });
            matchStage.$or.push({description : { $regex : `.*${value}.*`,$options:"i" } });
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