import mongoose,{ Schema } from "mongoose";

const orderSchema = new Schema({
    subTotal:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
    },
    deliveryFee:{
        type:Number,
        default:0
    },
    grandTotal:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        default:"Processing",
        enum: {
            values:["Completed","Processing","Cancelled"],
            message:"Value must be one of Completed, Processing or Cancelled"
        }
    },
    date:{
        type:Date,
        default:new Date().toUTCString()
    },
    updatedDate:{
        type:Date,
        default:new Date().toUTCString()
    },
    orderItems:[{
        name:String,
        quantity:Number,
        productId:Schema.Types.ObjectId,
        thumbnailUrl:String,
        price:Number,
        subTotal:Number,
    }],
    address:{
        fullName:String,
        mobileNumber:String,
        state:String,
        city:String,
        pinCode:String,
        streetAddress:String,
    },
    paymentDetails:{
        type:String,
        default:"Cash on Delivery"
    },
},{
    timestamps:true
})


const Order = mongoose.model("Order",orderSchema)
export default Order;