import mongoose,{Schema} from "mongoose";
import { ISessionToken } from "../@types/types";

const sessionTokensSchema = new Schema<ISessionToken>({
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

sessionTokensSchema.index({userId:1,token:1})

const SessionToken = mongoose.model<ISessionToken>("SessionToken",sessionTokensSchema);
export default SessionToken;