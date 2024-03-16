import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    mobileNumber:{
        type:String,
    },
    userImg:{
        type:String,
    },
    birthdate:{
        type:Date,
    },
    addresses:[{
        fullName:String,
        mobileNumber:String,
        state:String,
        city:String,
        pinCode:String,
        streetAddress:String,
    }],
    wishList:[{
        productId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
    }],
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    cart:[{
        productId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:Number,
    }], 
},{
    timestamps:true
})


const User = mongoose.model("User",userSchema);
export default User;