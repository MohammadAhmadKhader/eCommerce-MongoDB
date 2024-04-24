
import jwt from "jsonwebtoken" ;
import util from "util"
import fs from "fs"
import Stripe from "stripe";
import { IOrder } from "../@types/types";
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

export const setProductTestData = (filePath:string,newProductId : string,route:string)=>{
    const testDataFilePath = filePath;
    fs.readFile(testDataFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading testData.json:', err);
          return;
        }
  
        const testData = JSON.parse(data);
        testData.productsRoute[route] = newProductId;
        const updatedTestData = JSON.stringify(testData, null, 2);

        fs.writeFile(testDataFilePath, updatedTestData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing to testData.json:', err);
            return;
          }
        });
    });
}

export const setTestData = (filePath:string,appendedNewData : any,route:string)=>{
    const testDataFilePath = filePath;
    if(!route){
        throw "Route is required"
    }
    const data = fs.readFileSync(testDataFilePath, 'utf8')
    const testData = JSON.parse(data);
    testData[route] = appendedNewData;
    const updatedTestData = JSON.stringify(testData, null, 2);
    fs.writeFileSync(testDataFilePath, updatedTestData, 'utf8');
};


export const getProductTestData = async(filePath : string,route:string) : Promise<string | undefined>=>{
    const testDataFilePath = filePath;
    try{
        const data = await fs.promises.readFile(testDataFilePath, 'utf8');
        const testData = JSON.parse(data);
        const productId = testData.productsRoute[route] as string;

        if(typeof productId != "string" || !productId){
            throw "ProductId does not exist"
        }
        return productId;
    }catch(error){
        console.error(error);
        return undefined
    }
}

export const getAdminUserTokenTestData = async(filePath : string) : Promise<string | undefined>=>{
    const testDataFilePath = filePath;
    try{
        const data = await fs.promises.readFile(testDataFilePath, 'utf8');
        const testData = JSON.parse(data);
        const adminUserToken = testData.adminUserToken as string;

        if(typeof adminUserToken != "string" || !adminUserToken){
            throw "token does not exist"
        }
        return adminUserToken;
    }catch(error){
        console.error(error);
        return undefined
    }
}

export const getAdminUserIdTestData = async(filePath : string) : Promise<string | undefined>=>{
    const testDataFilePath = filePath;
    try{
        const data = await fs.promises.readFile(testDataFilePath, 'utf8');
        const testData = JSON.parse(data);
        const adminUserId = testData.adminUserId as string;

        if(typeof adminUserId != "string" || !adminUserId){
            throw "admin user id does not exist"
        }
        return adminUserId;
    }catch(error){
        console.error(error);
        return undefined
    }
}

export const getCategoryIdTestData = async(filePath : string) : Promise<string | undefined>=>{
    const testDataFilePath = filePath;
    try{
        const data = await fs.promises.readFile(testDataFilePath, 'utf8');
        const testData = JSON.parse(data);
        const categoryId = testData.categoryIdForTesting as string;

        if(typeof categoryId != "string" || !categoryId){
            throw "category id does not exist"
        }
        return categoryId;
    }catch(error){
        console.error(error);
        return undefined
    }
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