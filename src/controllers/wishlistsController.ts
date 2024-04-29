import User from "../models/user";
import { asyncHandler } from "../utils/asyncHandler";
import AppError from "../utils/AppError";

export const getWishList = asyncHandler( async (req, res)=>{
    const userId = req.user._id;
    const user = await User.findOne({_id:userId}).populate({
        path:"wishList.productId",
        select:"-description -reviews"
    })  
    const wishlist = user!.wishList;
    
    const optimizedResponse = wishlist.map((item)=>{
        const wishListItem : any = {};
        wishListItem._id = item._id;
        wishListItem.product = item.productId;
        return wishListItem;
    })

    return res.status(200).json({wishList:optimizedResponse})
})

export const addToWishList = asyncHandler(async (req, res, next)=>{
    const productId = req.body.productId as string;
    const userId = req.user._id;
    const user = req.user;
    
    if(user.wishList.length == 6){
        const error = new AppError("User has reached max wishlist items allowed.",400)
        return next(error);
    }
    const userHaveProductAlready = user.wishList.filter((item) => item.productId?.toString() == productId);
    if(userHaveProductAlready.length != 0){
        const error = new AppError("Product already exists in wishlist.",400)
        return next(error);
    }
    
    const userAfterChanges = await User.findOneAndUpdate({_id:userId},{
        $push: { wishList: { productId:productId} }
    },{new:true,select:"-password -__v"})
        
    return res.status(201).json({message:"success",user:userAfterChanges})
})

export const removeFromWishList = asyncHandler(async (req ,res, next)=>{
    const wishlistItemId = req.body.wishlistItemId as string;
    const user = req.user;

    const isAddressNotExisting = user.wishList.findIndex(wishlistItem => wishlistItem._id.toString() == wishlistItemId);
    if(isAddressNotExisting){
        const error = new AppError("Product was not found in wishlist.",400);
        return next(error);
    }

    const userAfterChanges = await User.findOneAndUpdate({_id:user._id},{
        $pull : { wishList : { _id :wishlistItemId} },
    },{new:true,select:"-password -__v"})

    return res.status(202).json({message:"success",user:userAfterChanges})
})
