import Invoice from "../models/Invoice";
import { asyncHandler } from "../utils/AsyncHandler";
import AppError from "../utils/AppError";
import { IInvoicesSortObj } from "../@types/types";


export const getInvoiceByOrderId = asyncHandler( async(req ,res ,next)=>{
    const {orderId} = req.params;
    const invoice = await Invoice.findOne({orderId});
    if(!invoice){
        const error = new AppError("Invoice was not found",400);
        return next(error);
    }
        
    return res.status(200).json({message:"success",invoice})
})


export const getAllInvoices = asyncHandler( async(req ,res ,next)=>{
    const {skip,limit,page} = req.pagination;
    const {sort} = req.query;

    let sortObj : IInvoicesSortObj = {createdAt:-1};
    if(sort && (sort === "subTotal_asc" || sort === "subTotal_desc" || sort === "grandTotal_asc" || sort === "grandTotal_desc" )){
        if(sort === "subTotal_asc"){
            sortObj = {subTotal:1};
        }
        if(sort === "subTotal_desc"){
            sortObj = {subTotal:-1};
        }
        if(sort === "grandTotal_desc"){
            sortObj = {grandTotal:-1};
        }
        if(sort === "grandTotal_asc"){
            sortObj = {grandTotal:1};
        }
    }

    const invoice = await Invoice.find({},{},{sort:sortObj,skip,limit}).lean();
    const count = await Invoice.find({}).countDocuments().lean();
        
    return res.status(200).json({count,page,limit,invoice})
});