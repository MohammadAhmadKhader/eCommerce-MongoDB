import Invoice from "../models/Invoice";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";


export const getInvoiceByOrderId = asyncHandler( async(req ,res ,next)=>{
    const {orderId} = req.params;
    const invoice = await Invoice.findOne({orderId});
    if(!invoice){
        const error = new AppError("Invoice was not found",400);
        return next(error);
    }
        
    return res.status(200).json({message:"success",invoice})
})