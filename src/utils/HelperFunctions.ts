
import jwt from "jsonwebtoken" ;
export function isJSON(brand:string){
    try{
        JSON.parse(brand)
        return true
    }catch{
        return false
    }
}



export const signToken = (id:string)=>{
    return jwt.sign({id},process.env.TOKEN_SECRET as string,{
        expiresIn:process.env.LOGIN_EXPIRES,
    })
}
