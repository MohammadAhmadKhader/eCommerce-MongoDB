import imageThumbnail from "image-thumbnail"
import { convertBufferToBase64 } from "./CloudinaryUtils"
import { IImageThumbnailOptions } from "../@types/types";

export const ImageThumbnailOptions : IImageThumbnailOptions = { width: 100, height: 100, fit:"inside", responseType: 'base64', jpegOptions: { force:true, quality:100 } }

export async function CreateThumbnailFromBuffer(buffer: Buffer){

    const imageAsBase64 = convertBufferToBase64(buffer);
    const thumbnailAsBase64 = await imageThumbnail(imageAsBase64,ImageThumbnailOptions)
    return thumbnailAsBase64 as unknown as string;
}