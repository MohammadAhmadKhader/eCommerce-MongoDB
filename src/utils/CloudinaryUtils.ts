import imageThumbnail from 'image-thumbnail';
import { v2 as Cloudinary } from "cloudinary"
import { IMulterFile } from "../@types/types"
import { ImageThumbnailOptions } from './ThumbnailUtils';

export function convertBufferToBase64(buffer : Buffer){
    return buffer.toString('base64')
}

function getImageName(url : string){
    const splitted = url.split("/");
    const imgNameWithExt = splitted[splitted.length - 1]
    const imgName = imgNameWithExt.split(".")[0]
    return imgName
}

async function UploadOne(Image : IMulterFile,Folder : string,width=1400,height=1400){
    const base64 = convertBufferToBase64(Image.buffer)

    const { secure_url } = await Cloudinary.uploader.upload(`data:image/png;base64,${base64}`,{
        use_filename: true,
        resource_type: "image",
        folder: Folder,
        transformation: [{ width: width, height: height, crop: "fit" }],
    })
    
    return secure_url;
}

async function UploadOneFromBase64(ImageAsBase64:string,Folder : string,width=1400,height=1400){
    const { secure_url } = await Cloudinary.uploader.upload(`data:image/png;base64,${ImageAsBase64}`,{
        use_filename: true,
        resource_type: "image",
        folder: Folder,
        transformation: [{ width: width, height: height, crop: "fit" }],
    })
    
    console.log(secure_url)
    return secure_url;
}

async function UploadManySubImagesAndThumbnails(Iterable : IMulterFile[]){
    const arrayOfImages = [];
    for(let i = 0;i < Iterable.length; i++){
        const secure_url = await UploadOne(Iterable[i],process.env.ProductsImagesFolder as string);
        const thumbnailAsBase64 = await imageThumbnail({uri:secure_url},ImageThumbnailOptions);
        const thumbnailUrl = await CloudinaryUtils.UploadOneFromBase64(thumbnailAsBase64 as unknown as string,process.env.ThumbnailsImagesFolder as string);
        arrayOfImages.push({
            imageUrl:secure_url,
            thumbnailUrl:thumbnailUrl
        })
    }

    if(arrayOfImages.length == 0){
        throw new Error("Images has failed to upload successfully");
    }
    return [...arrayOfImages]
}

async function DeleteOne(ImageLink : string,Folder : string){
    const ImageName = getImageName(ImageLink);

    const deleteAnImage = await Cloudinary.api.delete_resources(
        [`${Folder}/${ImageName}`],
        { type: 'upload', resource_type: 'image' })
    return deleteAnImage
}

async function DeleteMany(ImagesArray : string[],Folder:string){
    const ArrOfImagesDirectory :string[]= []
    ImagesArray.forEach((img)=>{
        ArrOfImagesDirectory.push(`${Folder}/${getImageName(img)}`)
    })

    const deleteAnImage = await Cloudinary.api.delete_resources(
        ArrOfImagesDirectory,
        { type: 'upload', resource_type: 'image' })
    return deleteAnImage
}

const CloudinaryUtils = {
    UploadOne,
    DeleteOne,
    UploadOneFromBase64,
    UploadManySubImagesAndThumbnails,
    DeleteMany
}

export default CloudinaryUtils;