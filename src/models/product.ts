import mongoose, { Schema } from "mongoose";
import { IProduct } from "../@types/types";

const productSchema: Schema<IProduct>= new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    offer:{
        type:Number,
        default:0.00,
        max:1.00,
        min:0.00,
    },
    price:{
        type:Number,
        required:true,
    },
    finalPrice:{
        type:Number,
        default:function(this : IProduct){
            if(this.offer == 0){
                return this.price
            }
        }
    },
    quantity:{
        type:Number,
        default:1,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    reviews:[{
        comment:{
            type:String,
            required:true,
        },
        userId : {
            type:Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
        rating : {
            type:Number,
            required:true
        },
    }],
    images:[{
        imageUrl:String,
        thumbnailUrl:String,
    }],
    brand:{
        type:String,
        required:true
    },
},{
    timestamps:true
})


//productSchema.index({_id:1,'reviews.userId':1},{unique:true})


const Product = mongoose.model("Product",productSchema);
export default Product;