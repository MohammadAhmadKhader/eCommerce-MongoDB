import mongoose,{Schema} from "mongoose";

const brandSchema = new Schema ({
    name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    }
},{
    timestamps:false
})

const Brand = mongoose.model("brand",brandSchema)
export default Brand;