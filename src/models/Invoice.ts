import { ObjectId } from "mongodb";
import mongoose,{Schema} from "mongoose";
import { IInvoice } from "../@types/types";

const invoiceSchema= new Schema<IInvoice> ({
    hostedLink:{
        type:String,
        required:true
    },
    pdfLink:{
        type:String,
        required:true
    },
    subTotal:{
        type:Number,
        required:true,
    },
    grandTotal:{
        type:Number,
        required:true,
    },
    userId:{
        type:ObjectId,
        required:true,
        ref:"User",
    },
    orderId:{
        type:ObjectId,
        required:true,
        ref:"Order",
    },
    invoiceItems:[{
        quantity:{
            type:Number,
            validate:{
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        unitPrice:Number,
        productId:{
            type:ObjectId,
            ref:"Product"
        }
    }]
},{
    timestamps:true
})
invoiceSchema.index({orderId:1})
const Invoice = mongoose.model<IInvoice>("Invoice",invoiceSchema)
export default Invoice;