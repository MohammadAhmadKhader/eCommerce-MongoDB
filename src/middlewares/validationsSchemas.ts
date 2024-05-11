import Joi from "joi"
import { CategoryDto, IProduct, IUserChangeInformation } from "../@types/types"
import AppError from "../utils/AppError"

const fileImageSchema = Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    buffer: Joi.binary().required()
})

export const userRegistrationSchema = Joi.object({
    firstName:Joi.string().alphanum().min(4).max(32).required(),
    lastName:Joi.string().alphanum().min(4).max(32).required(),
    email:Joi.string().email().min(6).max(64).required(),
    password:Joi.string().min(6).max(24).required()
})

export const userChangePasswordSchema = Joi.object({
    oldPassword:Joi.string().min(6).max(24).required(),
    newPassword:Joi.string().min(6).max(24).required(),
    confirmNewPassword:Joi.string().min(6).max(24).equal(Joi.ref("newPassword")).required().messages({"any.only":"Password Must Match"}),
})

export const reviewSchema = Joi.object({
    rating:Joi.number().valid(1,2,3,4,5).required(),
    comment:Joi.string().min(4).max(256).required()
})

export const creatingAddressSchema = Joi.object({
    fullName:Joi.string().min(4).max(32).required(),
    streetAddress:Joi.string().min(4).max(62).required(),
    city:Joi.string().min(3).max(32).required(),
    state:Joi.string().min(4).max(32).required(),
    mobileNumber:Joi.string().min(6).max(15).required(),
    pinCode:Joi.alternatives().try(
        Joi.string().min(3).max(12),
    ).optional(),
})

export const updatingAddressSchema = Joi.object({
    fullName:Joi.alternatives().try(
        Joi.string().min(4).max(32),
    ).optional(),
    streetAddress:Joi.alternatives().try(
        Joi.string().min(4).max(62),
    ).optional(),
    city:Joi.alternatives().try(
        Joi.string().min(3).max(32),
    ).optional(),
    state:Joi.alternatives().try(
        Joi.string().min(4).max(32),
    ).optional(),
    mobileNumber:Joi.alternatives().try(
        Joi.string().min(6).max(15),
    ).optional(),
    pinCode:Joi.alternatives().try(
        Joi.string().min(3).max(12),
    ).optional()
})

export const createProductSchema = Joi.object({
    name:Joi.string().min(3).max(100).required(),
    description:Joi.string().min(10).max(1024).required(),
    categoryId:Joi.string().hex().length(24).required(),
    offer:Joi.number().min(0.00).max(1.00),
    price:Joi.number().min(0).max(1000).required(),
    finalPrice:Joi.number().min(0).max(1000),
    quantity:Joi.number().integer().min(0),
    brand:Joi.string().valid("Nike","Levi's","Calvin Klein","Casio","Adidas","Biba").required(),
}).when(
    Joi.object({ offer: Joi.number().valid(0) }), {
      then: Joi.object({
        price: Joi.number().valid(Joi.ref('finalPrice')).required(),
      }),
    }
);

export const updateProductSchema = Joi.object({
    name:Joi.string().min(3).max(100),
    description:Joi.string().min(10).max(1024),
    categoryId:Joi.string().hex().length(24),
    offer:Joi.number().min(0.00).max(1.00),
    price:Joi.number().min(0).max(1000),
    finalPrice:Joi.number().min(0).max(1000),
    quantity:Joi.number().integer().min(0),
    brand:Joi.string().valid("Nike","Levi's","Calvin Klein","Casio","Adidas","Biba"),
}).when(
    Joi.object({ offer: Joi.number().valid(0) }), {
      then: Joi.object({
        price: Joi.number().valid(Joi.ref('finalPrice')).required(),
      }).required(),
    }
)

export const sendingMessageSchema = Joi.object({
    fullName:Joi.string().min(4).max(32).required(),
    email:Joi.string().email().min(6).max(64).required(),
    subject: Joi.string().min(4).max(32),
    message: Joi.string().min(4).max(256),
})

export const userSignInSchema = Joi.object({
    email:Joi.string().email().min(6).max(64).required(),
    password:Joi.string().min(6).max(24).required()
})

export const addToCartSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    quantity:Joi.number().min(1).integer().required()
})

export const deleteFromCartSchema = Joi.object({
    cartItemId:Joi.string().hex().length(24).required(),
})

export const changeCartItemQuantityByOneSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    cartItemId:Joi.string().hex().length(24).required(),
    operation:Joi.string().valid("+1","-1").required()
})

export const resetPasswordViaCodeSchema = Joi.object({
    newPassword:Joi.string().min(6).max(24).required(),
    confirmedNewPassword:Joi.string().min(6).max(24).equal(Joi.ref("newPassword")).required().messages({"any.only":"Password Must Match"}),
})

export const forgotPasswordSchema = Joi.object({
    email:Joi.string().email().min(6).max(64).required(),
})

export const addToWishlistSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
})

export const removeFromWishlistSchema = Joi.object({
    wishlistItemId:Joi.string().hex().length(24).required(),
})

export const editUserReviewSchema = Joi.object({
    rating:Joi.number().valid(1,2,3,4,5).required(),
    comment:Joi.string().min(4).max(256).required(),
    reviewId:Joi.string().hex().length(24).required(),
})

export const deleteUserReviewSchema = Joi.object({
    productId:Joi.string().hex().length(24).required(),
    reviewId:Joi.string().hex().length(24).required(),
})

export const createOrderSchema = Joi.object({
    orderId:Joi.string().hex().length(24).required(),
    address:creatingAddressSchema.required(),
})

export const orderIdSchema = Joi.object({
    orderId:Joi.string().hex().length(24).required(),
})

export const ordersStatusSchema = Joi.object({
    status:Joi.string().valid("Completed","Processing","Cancelled","Placed").required(),
})

export const appendImagesToProductSchema = Joi.object({
    imagesLength:Joi.number().integer().min(1).max(9).required().messages({
        'number.base': 'Images were not sent',
        'number.min': 'At least one image must be provided',
        'number.max': 'Maximum of 9 images allowed',
        'any.required': 'Images were not sent'
    }),
})

const atLeastOneFieldRequiredUserInfo = (value : IUserChangeInformation, helpers : Joi.CustomHelpers<IUserChangeInformation>) => {
    const { firstName, lastName, email, mobileNumber, birthdate } = value;
    const detailedErrorMessage = `: At least one of the following fields is required: 'firstName', 'lastName', 'email', 'mobileNumber', 'birthdate'`;
    if (!firstName && !lastName && !email && !mobileNumber && !birthdate) {
        throw new Error(detailedErrorMessage)
    }
};

export const userChangeInformationSchema = Joi.object({
    firstName:Joi.alternatives().try(
        Joi.string().alphanum().min(4).max(32).required(),
    ).optional(), 
    lastName:Joi.alternatives().try(
        Joi.string().alphanum().min(4).max(32).required(),
    ).optional(),
    email:Joi.alternatives().try(
        Joi.string().email().min(6).max(64).required(),
    ).optional(),
    mobileNumber:Joi.alternatives().try(
        Joi.string().min(6).max(15),
    ).optional(),
    birthdate:Joi.alternatives().try(
        Joi.date().max(new Date(Date.now() - 157680000000 /**before 5 years */)).min(new Date(Date.now() - 2522880000000/**before 80 years */)).allow("")
    ).optional(),
}).custom(atLeastOneFieldRequiredUserInfo,"atLeastOneFieldRequired")

export const createBrandSchema = Joi.object({
    brandName:Joi.string().min(1).max(32).required(),
    brandLogo:fileImageSchema.required()
})

const atLeastOneFieldRequiredBrand = (value : {brandLogo:Express.Multer.File,brandName:string}) => {
    const { brandLogo,brandName } = value;
    if (!brandLogo && !brandName ) {
        throw new Error()
    }
};

export const updateBrandSchema = Joi.object({
    brandName:Joi.string().min(1).max(32),
    brandLogo:fileImageSchema
})
.required().custom(atLeastOneFieldRequiredBrand)
.message("At least one of the following fields is required: name, image");

export const createCategorySchema = Joi.object({
    name:Joi.string().min(2).max(64).required(),
    image:fileImageSchema.required()
})

const atLeastOneFieldRequiredCategory = (value : CategoryDto ) => {
    const { image,name } = value;
    if (!name && !image ) {
        throw new Error()
    }
};

export const updateCategorySchema = Joi.object({
    name:Joi.string().min(2).max(64),
    image:fileImageSchema,
})
.custom(atLeastOneFieldRequiredCategory,"When nothing is given to update throw error")
.message("At least one of the following fields is required: name, image");

export const updateProductSingleImageSchema = Joi.object({
    image:fileImageSchema.required(),
    imageId:Joi.string().hex().length(24).required(),
})

