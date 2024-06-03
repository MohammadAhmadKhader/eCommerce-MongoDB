import Joi from "joi";
import { fileImageSchema } from "./sharedValidationSchemas";

export const createBrandSchema = Joi.object({
    brandName:Joi.string().trim().min(1).max(32).required(),
    brandLogo:fileImageSchema.required()
})

const atLeastOneFieldRequiredBrand = (value : {brandLogo:Express.Multer.File,brandName:string}) => {
    const { brandLogo,brandName } = value;
    if (!brandLogo && !brandName ) {
        throw new Error()
    }
};

export const updateBrandSchema = Joi.object({
    brandName:Joi.string().trim().min(1).max(32),
    brandLogo:fileImageSchema
})
.required().custom(atLeastOneFieldRequiredBrand)
.message("At least one of the following fields is required: name, image");