import mongoose,{ Schema } from "mongoose";
import { IProduct } from "../@types/types";

const productSchema= new Schema<IProduct>({
    name:{
        type:String,
        required:true,
        trim:true,
        minlength:[3,"product name cant be less than 3 characters"],
        maxlength:[100,"product name cant be more than 100 characters"]
    },
    description:{
        type:String,
        required:true,
        trim:true,
        minlength:[10,"description cant be less than 10 characters"],
        maxlength:[1024,"description cant be more than 1024 characters"]
    },
    categoryId:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    offer:{
        type:Number,
        default:0.00,
        max:[1.00,"offer cant be more than 100%"],
        min:[0.00,"offer cant be minus"],
    },
    price:{
        type:Number,
        required:true,
        min:[0,"price cant be minus"],
        max:[1000,"price cant be more than 1000"]
    },
    finalPrice:{
        type:Number,
        min:[0,"final price cant be minus"],
        max:[1000,"final price cant be more than 1000"],
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
            trim:true,
            minlength:[4,"comment cant be less than 4 characters"],
            maxlength:[256,"comment cant be more than 256 characters"]
        },
        userId : {
            type:Schema.Types.ObjectId,
            required:true,
            ref:'User'
        },
        rating : {
            type:Number,
            required:true,
            enum:[1,2,3,4,5]
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

const Product  = mongoose.model<IProduct>("Product",productSchema);
export default Product;