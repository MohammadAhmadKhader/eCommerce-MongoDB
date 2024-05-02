import multer from "multer"
import { UploadOptions } from "../@types/types";

const upload = (options : UploadOptions= {})=>{
    const defaultOptions = {
        fileSize: Infinity,
        filesNum: Infinity,
        fileFilter: undefined
    };

    const mergedOptions = {...defaultOptions,...options};

    const storage = multer.memoryStorage()
    const multerUpload = multer({
        storage,
        limits:{
            fileSize:mergedOptions.fileSize !== Infinity ? mergedOptions.fileSize * 1000 : Infinity,
            files:mergedOptions.filesNum
        },
        fileFilter:mergedOptions.fileFilter,
    })
    return multerUpload;
    
}

export default upload;
