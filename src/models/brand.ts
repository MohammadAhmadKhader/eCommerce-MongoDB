import mongoose,{PipelineStage, Schema} from "mongoose";
import { IBrand } from "../@types/types";

const brandSchema= new Schema<IBrand> ({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:[1,"brand name cant be empty"],
        maxlength:[32,"brand name cant be more than 32 character"]
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:false
})

const Brand = mongoose.model<IBrand>("Brand",brandSchema)
export default Brand;