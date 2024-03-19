import Joi from "joi"

export const userRegistrationSchema = Joi.object({
    firstName:Joi.string().alphanum().min(4).max(32).required(),
    lastName:Joi.string().alphanum().min(4).max(32).required(),
    email:Joi.string().email().min(5).max(64).required(),
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
    pinCode:Joi.string().min(3).max(12).required(),
})

export const updatingAddressSchema = Joi.object({
    fullName:Joi.string().min(4).max(32),
    streetAddress:Joi.string().min(4).max(62),
    city:Joi.string().min(3).max(32),
    state:Joi.string().min(4).max(32),
    mobileNumber:Joi.string().min(6).max(15),
    pinCode:Joi.string().min(3).max(12),
})

export const creatingProductValidationSchema = Joi.object({
    name:Joi.string().min(3).max(100).required(),
    description:Joi.string().min(10).max(1024),
    categoryId:Joi.string().hex().length(24).required(),
    offer:Joi.number().min(0.00).max(1.00),
    price:Joi.number().min(0).max(1000).required(),
    finalPrice:Joi.number().min(0).max(1000),
    quantity:Joi.number().min(0),
    brand:Joi.string().valid("Nike","Levi's","Calvin Klein","Casio","Adidas","Biba").required(),
    images:Joi.array().items(
        Joi.object({
            imageUrl:Joi.string().max(256).required(),
            thumbnailUrl:Joi.string().max(256).required(),
        }).required(),
    ),

}).when(
    Joi.object({ offer: Joi.number().valid(0) }), {
      then: Joi.object({
        price: Joi.number().valid(Joi.ref('finalPrice')).required(),
      }),
    }
  );

export const sendingMessageSchema = Joi.object({
    fullName:Joi.string().min(4).max(32).required(),
    email:Joi.string().email().min(5).max(64).required(),
    subject: Joi.string().min(4).max(32),
    message: Joi.string().min(4).max(256),
})