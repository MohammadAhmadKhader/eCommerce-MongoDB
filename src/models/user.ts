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
    },
    firstName:{
        type:String,
    },
    lastName:{
        type:String,
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
        productId:Schema.Types.ObjectId,
    }],
    role:{
        type:String,
        default:"user",
        enum:["user","admin"]
    },
    cart:[{
        productId:Schema.Types.ObjectId,
        quantity:Number,
    }], 
},{
    timestamps:true
})


const User = mongoose.model("User",userSchema);
export default User;