import Joi from "joi";
import { CategoryDto } from "../../@types/types";
import { fileImageSchema } from "./sharedValidationSchemas";

export const createCategorySchema = Joi.object({
    name:Joi.string().trim().min(2).max(64).required(),
    image:fileImageSchema.required()
})

const atLeastOneFieldRequiredCategory = (value : CategoryDto ) => {
    const { image,name } = value;
    if (!name && !image ) {
        throw new Error()
    }
};

export const updateCategorySchema = Joi.object({
    name:Joi.string().trim().min(2).max(64),
    image:fileImageSchema,
})
.custom(atLeastOneFieldRequiredCategory,"When nothing is given to update throw error")
.message("At least one of the following fields is required: name, image");
