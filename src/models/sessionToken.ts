import mongoose,{Schema} from "mongoose";

const sessionTokensSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        unique:true
    },
    token:{
        type:String,
        required:true,
        unique:true
    }
},{
    timestamps:true
})

const SessionToken = mongoose.model("SessionToken",sessionTokensSchema);
export default SessionToken;