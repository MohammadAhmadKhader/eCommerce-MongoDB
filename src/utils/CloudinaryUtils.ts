import { v2 as Cloudinary, UploadApiResponse} from "cloudinary"

function getImageName(url : string){
    const splitted = url.split("/");
    const imgNameWithExt = splitted[splitted.length - 1]
    const imgName = imgNameWithExt.split(".")[0]
    return imgName
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
interface IUploadOneOptions {
    width?:number;
    height?:number;
    crop?: "fit"
}
async function UploadOne(buffer : Buffer,folder : string,options:IUploadOneOptions={width:1400,height:1400,crop:"fit" }) : Promise<UploadApiResponse | undefined>{
    
    const defaultOptions = {
        width:1400,
        height:1400,
        crop:"fit"
    }

    const mergedOptions = {...defaultOptions,...options};

    return new Promise((resolve, reject)   => {
        const uploadStream = Cloudinary.uploader.upload_stream(
          { resource_type: "image",
          folder,
          use_filename: true,
          transformation: [{ width: mergedOptions.width, height: mergedOptions.height, crop: mergedOptions.crop }],
         },

          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
    
        uploadStream.end(buffer);
      });
}
 

const CloudinaryUtils = {
    DeleteOne,
    DeleteMany,
    UploadOne
}

export default CloudinaryUtils;