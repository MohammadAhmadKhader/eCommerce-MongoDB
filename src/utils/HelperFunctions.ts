
import jwt from "jsonwebtoken" ;
import util from "util"
import Stripe from "stripe";
import { IOrder, IProduct } from "../@types/types";
import { Schema } from "mongoose";
export function isJSON(brand:string){
    try{
        JSON.parse(brand)
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