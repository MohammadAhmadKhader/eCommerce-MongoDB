import multer,{ FileFilterCallback,} from "multer";
import {Request,Response ,NextFunction} from "express"

const storage = multer.memoryStorage()

export interface IAuthenticateMiddleware {
    (req: Request, res: Response, next: NextFunction) : Promise<void | Response<any, Record<string, any>>>
}
/**
 * 
 *  
 This middleware is not suitable to apply validate then authenticate then upload on put/patch routes
 as multer does not run fileFilter and does not parse body if there is no image was sent,
 therefore use it only when existing an image is an always case scenario
*/ 
export function validateThenAuthThenUpload
(validationMiddleware  :any,authenticationMiddleware: IAuthenticateMiddleware, imageName: string = "",
options: {injectedFunction:(req:Request,res:Response,next:NextFunction)=>any;injected:boolean} = { injectedFunction :async ()=>{},injected:false} ){
    
    return (req : Request,res : Response,next: NextFunction)=>{     
        try{
            const mockNextFunction : NextFunction = ()=>{}
            const validator = validationMiddleware;
            const authenticator = authenticationMiddleware;

            const upload = multer({
                storage,
                fileFilter:async (req : Request ,file : Express.Multer.File ,cb: FileFilterCallback )=>  {
                    validator(req,res,mockNextFunction);
                    
                    if(req.validationError){
                        cb(null, false);
                        throw new Error("Error occurred during filtering file")
                    }
                    await authenticator(req,res,mockNextFunction);
                    
                    if(options.injected){
                        await options.injectedFunction(req,res,mockNextFunction);
                    }
                    
                    cb(null, true);
                }
            });
            
            if(imageName){
                upload.single(imageName)(req,  res , next);
            }else{
                upload.any()(req,  res , next);
            }
            
        }catch(error){
            console.error(error)
            return res.status(500).json({error})
        }
    }
}