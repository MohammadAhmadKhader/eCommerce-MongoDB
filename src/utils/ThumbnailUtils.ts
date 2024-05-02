import imageThumbnail from "image-thumbnail"
import { IImageThumbnailOptions } from "../@types/types";

export const ImageThumbnailOptions : IImageThumbnailOptions =
 { width: 100, height: 100, fit:"inside", responseType: "buffer" , jpegOptions: { force:true, quality:100 } }

export async function getThumbnailImageBuffer(buffer : Buffer){
    const thumbnailBuffer = await imageThumbnail(buffer,ImageThumbnailOptions)
    return thumbnailBuffer;
}