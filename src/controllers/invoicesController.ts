import {Response,Request} from "express"
import Invoice from "../models/Invoice";


export const getInvoiceByOrderId = async(req:Request,res:Response)=>{
    try{
        const {orderId} = req.params;
        const invoice = await Invoice.findOne({orderId});
        if(!invoice){
            return res.status(400).json({error:"Invoice was not found"});
        }
        
        return res.status(200).json({message:"success",invoice})
    }catch(error : any){
        console.error(error);
        return res.status(500).json({error:error?.message})
    }
}