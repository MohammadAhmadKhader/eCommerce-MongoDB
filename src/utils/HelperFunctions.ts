
import jwt from "jsonwebtoken" ;
import util from "util"
export function isJSON(brand:string){
    try{
        JSON.parse(brand)
        return true
    }catch{
        return false
    }
}

export const signToken = (id:string,email:string)=>{
    return jwt.sign({id,email},process.env.TOKEN_SECRET as string,{
        expiresIn:process.env.LOGIN_EXPIRES,
    })
}

export const verifyAndDecodeToken = async(token:string)=>{
    //@ts-expect-error
    const decodedToken : IDecodedToken = await util.promisify(jwt.verify)(token,process.env.TOKEN_SECRET as string);
    return decodedToken;
}