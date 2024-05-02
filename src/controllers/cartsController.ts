import { ICartItem } from './../@types/types.d';
import User from "../models/user";
import Product from "../models/product";
import { ObjectId } from "mongodb";
import { asyncHandler } from '../utils/AsyncHandler';
import AppError from '../utils/AppError';

export const getAllCartItems = asyncHandler( async (req ,res ,next)=>{
    const userId = req.user._id;     
    const cartItems = await User.findById(userId,{cart:1}).populate({
        path:"cart.productId",
        select:"name images offer price finalPrice brand quantity",
    })
        
    const renamedParams : any = cartItems?.toObject();
    renamedParams?.cart.map((item : any)=>{
        item.cartItem = item.productId
        delete item.productId
    })
    
    return res.status(200).json({cart:renamedParams.cart})
})

export const addToCart = asyncHandler(async (req ,res ,next)=>{
    const {productId,quantity} = req.body;
    const user = req.user;
        
    const doesUserHaveThisItem = user!.cart.filter((item) => item.productId.toString() == productId)
    if(doesUserHaveThisItem.length > 0){
        const error = new AppError("Product already in your cart.",400)
        return next(error);
    }
        
    const userAfterCartChanged = await User.findOneAndUpdate({_id:user._id},{
        $push : {cart : {productId,quantity}}
    },{new:true,select:"-password -__v"})

    return res.status(201).json({message:"success",user:userAfterCartChanged}) 
})

export const deleteFromCart = asyncHandler( async (req ,res,next)=>{ 
    const cartItemId = req.params.cartItemId; // => to url
    const userId = req.user._id;
    const userBeforeCartChanged = req.user;

    let isItemInCart = false;
    userBeforeCartChanged.cart.forEach((cartItem)=>{
        if(cartItem._id as unknown as string == cartItemId){
            isItemInCart = true
        }
    });

    if(!isItemInCart || userBeforeCartChanged.cart.length == 0){
        const error = new AppError("An unexpected error has occurred",400)
        return next(error);
    }

    const userAfterCartChanged = await User.findOneAndUpdate({_id:userId},{
        $pull : {cart : { _id:cartItemId}}
    },{new:true,select:"-password -__v"});


    return res.status(204).json({message:"success",user:userAfterCartChanged})    
})

export const changeCartItemQuantityByOne = asyncHandler(async (req ,res ,next)=>{
    const productId = req.body.productId as string;
    const cartItemId = req.params.cartItemId as string;
    const user= req.user;
    const operation = req.body.operation;
    let amount = 1;
    let indexInCart : number;
    if(operation == "-1"){
        amount = -1
    }

    const product = await Product.findOne({_id:new ObjectId(productId)},{quantity:1});
    if(!product){
        const error = new AppError("Product was not found.",400)
        return next(error);
    }

    const wantedCartItem = (user.cart as ICartItem[]).filter((item,index) => {
        if(item._id.toString() == cartItemId && item.productId.toString() == productId){
            indexInCart = index
            return true;
        }
    })
    if(wantedCartItem.length == 0){
        const error = new AppError("Cart item was not found.",400)
        return next(error);
    }
        
    if(typeof indexInCart! === 'number' && (product.quantity <= user.cart[indexInCart].quantity) && operation == "+1"){
        const error = new AppError("There are more items than available product quantity.",400)
        return next(error);
    }else if(typeof indexInCart! === 'number' && user.cart[indexInCart].quantity == 1 && operation == "-1"){
        const error = new AppError("Quantity can't be less than 1.",400)
        return next(error);
    }

    const userAfterCartItemQtyWasChanged = await User.findByIdAndUpdate(
        { _id:user._id , 'cart._id':new ObjectId(cartItemId) },
        { $inc :{ 'cart.$[elem].quantity' : amount}},
        { new : true ,select:"-__v",
          arrayFilters: [{ 
            "elem._id": new ObjectId(cartItemId as string)
         }],
        }
    )
        
    return res.status(200).json({message:"success",user:userAfterCartItemQtyWasChanged})
})

export const clearCart =asyncHandler( async (req ,res ,next)=>{
    const userId = req.user._id;
    const user = req.user;
    if(user.cart.length === 0){
        const error = new AppError("The cart is already empty.",400)
        return next(error);
    }

    const userAfterCartCleared = await User.findOneAndUpdate({_id:userId},{
        $set : {cart : []}
    },{new:true,select:"-__v"})

    return res.status(201).json({message:"success",user:userAfterCartCleared})
})

