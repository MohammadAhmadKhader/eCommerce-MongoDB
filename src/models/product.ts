import mongoose,{ Schema } from "mongoose";
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
        validate:[{ 
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            },{
                validator: function(value : number){
                    return value >= 0;
                },
                message: 'Quantity Cant Be Minus'
            }]
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
        createdAt:{
            type:Date,
            default:Date.now()
        },
        updatedAt:{
            type:Date,
            default:Date.now()
        }
    }],
    images:[{
        imageUrl:String,
        thumbnailUrl:String,
    }],
    brand:{
        type:String,
        required:true,
        ref:"Brand",
    },
},{
    timestamps:true,
})

productSchema.index({categoryId:1});
productSchema.index({brand:1});

const Product = mongoose.model("Product",productSchema);
export default Product;