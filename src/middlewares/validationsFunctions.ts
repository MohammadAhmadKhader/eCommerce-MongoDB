import { NextFunction, Request, Response } from "express";
import { addToCartSchema, addToWishlistSchema, changeCartItemQuantityByOneSchema, createOrderSchema,
     orderIdSchema, creatingAddressSchema, createProductSchema, deleteFromCartSchema, deleteUserReviewSchema, 
     editUserReviewSchema, forgotPasswordSchema, removeFromWishlistSchema, resetPasswordViaCodeSchema, reviewSchema, 
     sendingMessageSchema, updatingAddressSchema, userChangePasswordSchema, userRegistrationSchema, userSignInSchema, 
     ordersStatusSchema, 
     appendImagesToProductSchema,
     userChangeInformationSchema,
     createBrandSchema,
     createCategorySchema,
     updateCategorySchema,
     updateBrandSchema,
     updateProductSchema,
     updateProductSingleImageSchema,} from "./validationsSchemas";
import Joi from "joi";
import AppError from "../utils/AppError";

export const validateUserRegistration = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userRegistrationSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        password:req.body.password
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateUserChangePassword = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userChangePasswordSchema.validate({
        oldPassword:req.body.oldPassword,
        newPassword:req.body.newPassword,
        confirmNewPassword:req.body.confirmNewPassword
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = reviewSchema.validate({
        rating:req.body.rating,
        comment:req.body.comment,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateCreatingAddress = (req:Request,res:Response,next:NextFunction)=>{
     
    const {error} = creatingAddressSchema.validate({
        fullName:req.body.fullName,
        streetAddress:req.body.streetAddress,
        state:req.body.state,
        city:req.body.city,
        pinCode:req.body.pinCode,
        mobileNumber:req.body.mobileNumber
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    
    return next()
}

export const validateUpdatingAddress = (req:Request,res:Response,next:NextFunction)=>{
    const addressToUpdate : any = {
        fullName:req.body.fullName,
        streetAddress:req.body.streetAddress,
        state:req.body.state,
        city:req.body.city,
        pinCode:req.body.pinCode,
        mobileNumber:req.body.mobileNumber
    }
    const {error} = updatingAddressSchema.validate(addressToUpdate,{abortEarly:false})

    if(error){
        return next(error);
    }

    for(const key in addressToUpdate){
        if(addressToUpdate[key] === undefined){
            delete addressToUpdate[key]
        }
    }
    
    if(Object.keys(addressToUpdate).length == 0){
        const details = [
            {
                message: 'one field at least is required',
                path: [],
                type: 'any.required',
                context: {},
            }
        ]
        
        const error = new Joi.ValidationError("one field at least is required",details,{})
        return next(error);
    }
    return next()
}

export const validateCreateProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createProductSchema.validate({
        name:req.body.name,
        description:req.body.description,
        categoryId:req.body.categoryId,
        offer:req.body.offer,
        price:req.body.price,
        finalPrice:req.body.finalPrice,
        quantity:req.body.quantity,
        brand:req.body.brand,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["categoryId"]}
        return next(error);
    }
    return next()
}

export const validateUpdateProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateProductSchema.validate({
        name:req.body.name,
        description:req.body.description,
        categoryId:req.body.categoryId,
        offer:req.body.offer,
        price:req.body.price,
        finalPrice:req.body.finalPrice,
        quantity:req.body.quantity,
        brand:req.body.brand,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["categoryId"]}
        return next(error);
    }

    if (!req.body.brand && !req.body.categoryId && !req.body.description && 
        !req.body.quantity && !req.body.name && !req.body.offer && 
        !req.body.price && !req.body.finalPrice) {

        const error= new AppError("Something went wrong during updating product, please try again later!",500)
        return next(error);
    }
    return next()
}

export const validateUpdateSingleImageProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateProductSingleImageSchema.validate({
        imageId:req.body.imageId,
        image:req.file,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }

    return next()
}

export const validateSendingMessage = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = sendingMessageSchema.validate({
        fullName:req.body.fullName,
        email:req.body.email,
        subject:req.body.subject,
        message:req.body.message,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateAddingToCart = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = addToCartSchema.validate({
        productId:req.body.productId,
        quantity:req.body.quantity,
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId"]};
        return next(error);
    }
    return next()
}

export const validateUserSignIn = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userSignInSchema.validate({
        email:req.body.email,
        password:req.body.password,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateChangeCartItemQuantityByOne = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = changeCartItemQuantityByOneSchema.validate({
        cartItemId:req.params.cartItemId,
        productId:req.body.productId,
        operation:req.body.operation,
    },{abortEarly:false})
    
    if(error){
        req.validationError = {blacklistedKeys:["productId","cartItemId"]};
        return next(error);
    }
    return next()
}

export const validateDeletingFromCart = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = deleteFromCartSchema.validate({
        cartItemId:req.params.cartItemId,
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["cartItemId"]};
        return next(error);
    }
    return next()
}

export const validateResetPasswordViaCode = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = resetPasswordViaCodeSchema.validate({
        newPassword:req.body.newPassword,
        confirmedNewPassword:req.body.confirmedNewPassword,
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateForgotPassword = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = forgotPasswordSchema.validate({
        email:req.body.email
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validateAddToWishList = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = addToWishlistSchema.validate({
        productId:req.body.productId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId"]};
        return next(error);
    }
    return next()
}

export const validateRemoveFromWishlist = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = removeFromWishlistSchema.validate({
        wishlistItemId:req.params.wishlistItemId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["wishlistItemId"]};
        return next(error);
    }
    return next()
}

export const validateEditUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = editUserReviewSchema.validate({
        comment:req.body.comment,
        rating:req.body.rating,
        reviewId:req.params.reviewId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["reviewId"]};
        return next(error);
    }
    return next()
}

export const validateDeleteUserReview = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = deleteUserReviewSchema.validate({
        productId:req.params.productId,
        reviewId:req.params.reviewId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["productId","reviewId"]};
        return next(error);
    }
    return next()
}

export const validateCheckOrder = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createOrderSchema.validate({
        orderId:req.body.orderId,
        address:req.body.address
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["orderId"]};
        return next(error);
    }
    return next()
}

export const validateOrderId = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = orderIdSchema.validate({
        orderId:req.params.orderId
    },{abortEarly:false})

    if(error){
        return next(error);
    }
    return next()
}

export const validatePaymentIntent = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = orderIdSchema.validate({
        orderId:req.body.orderId
    },{abortEarly:false})

    if(error){
        req.validationError = {blacklistedKeys:["orderId"]};
        return next(error);
    }
    return next()
}

export const validateOrdersStatus = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = ordersStatusSchema.validate({
        status:req.query.status
    },{abortEarly:false})
    

    if(error){
        return next(error);
    }
    return next()
}

export const validateAppendImagesToProduct = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = appendImagesToProductSchema.validate({
        imagesLength:req.files?.length
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateUserChangeInformation = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = userChangeInformationSchema.validate({
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        mobileNumber:req.body.mobileNumber,
        birthdate:req.body.birthdate,
    },{abortEarly:false})
    
    if(error){
        return next(error);
    }
    return next()
}

export const validateCreateBrand = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createBrandSchema.validate({
        brandName:req.body.brandName,
        brandLogo:req.file
    },{abortEarly:false})

    if(error){
        return next(error)
    }
    return next()
}

export const validateUpdateBrand = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateBrandSchema.validate({
        brandName:req.body.brandName,
        brandLogo:req.file
    },{abortEarly:false})

    if(error){
        return next(error)
    }
    return next()
}

export const validateCreateCategory = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = createCategorySchema.validate({
        name:req.body.name,
        image:req.file
    },{abortEarly:false})
    
    if(error){
        return next(error)
    }
    return next()
}

export const validateUpdateCategory = (req:Request,res:Response,next:NextFunction)=>{
    const {error} = updateCategorySchema.validate({
        name:req.body.name,
        image:req.file
    },{abortEarly:false})
   
    if(error){
        return next(error)
    }
    return next()
}