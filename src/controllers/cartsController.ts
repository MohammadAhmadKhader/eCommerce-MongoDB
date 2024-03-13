import { Request , Response} from "express"
import User from "../models/user";
import Product from "../models/product";
import { ObjectId } from "mongodb";

export const getAllCartItems = async (req:Request,res:Response)=>{
    try{
        const userId = req.params.userId;
        const arrayOfProductsIds : any = []
        const user = await User.findById(userId,{cart:1})
        if(!user){
            return res.status(400).json({error:"user was not found"});
        }
        if(user.cart.length == 0){
            return res.status(200).json({cartItems:[]})
        }

        user.cart.forEach((cartItem)=>{
            arrayOfProductsIds.push(cartItem.productId);
        })
        
        console.log(arrayOfProductsIds)
        const cartItems = await Product.find(
            {_id: {$in : arrayOfProductsIds }},
            {reviews:0,__v:0,description:0,categoryId:0,brand:0})
        

        return res.status(200).json({cartItems})
    }catch(error){
        return res.status(500).json({error})
    }
}

export const addToCart = async (req:Request,res:Response)=>{
    try{
        let userId = req.body.userId;
        let productId = req.body.productId
        const quantity = Number(parseInt(req.body.quantity));
        if(Number.isNaN(quantity) || quantity <= 0){
            return res.status(400).json({error:"Invalid quantity"})
        }
        
        const user = await User.findById(userId,{password:0,__v:0})
        
        const doesUserHaveThisItem = user!.cart.filter((item) => item.productId == productId)
        if(doesUserHaveThisItem.length > 0){
            return res.status(400).json({error:"User already have this item"})
        }
        
        const userAfterCartChanged = await User.findOneAndUpdate({_id:userId},{
            $push : {cart : {productId,quantity}}
        },{new:true,select:"-password -__v"})

        return res.status(201).json({message:"success",user:userAfterCartChanged})
    }catch(error){
        return res.status(500).json({error})
    }
}

export const deleteFromCart = async (req:Request,res:Response)=>{
    try{
        const cartItemId = req.body.cartItemId as string;
        const userId = req.body.userId as string;

        const userAfterCartChanged = await User.findOneAndUpdate({_id:userId},{
            $pull : {cart : { _id:cartItemId}}
        },{new:true,select:"-password -__v"})

        return res.status(204).json({message:"success",user:userAfterCartChanged})
    }catch(error){
        return res.status(500).json({error})
    }
}

export const changeCartItemQuantityByOne = async (req:Request,res:Response)=>{
    try{
        const productId = req.body.productId;
        const cartItemId = req.body.cartItemId;
        const userId = req.body.userId;
        const operation = req.body.operation;
        let amount = 1;
        let indexInCart : number;
        if(!operation || (operation != "+1" && operation != "-1")){
            return res.status(400).json({message:"operation is required"})
        }
        if(operation == "-1"){
            amount = -1
        }

        const product = await Product.findById(productId,{quantity:1});
        if(!product){
            return res.status(400).json({error:"product does was not found"})
        }
        const user = await User.findById(userId)
        if(!user){
            return res.status(400).json({error:"wrong user id"})
        }

        const wantedCartItem = user.cart.filter((item,index) => {
            if(item._id == cartItemId && item.productId == productId){
                indexInCart = index
                return true;
            }
        })
        if(wantedCartItem.length == 0){
            return res.status(400).json({error:"cart item was not found"})
        }
        
        if(typeof indexInCart! === 'number' && (product.quantity <= user.cart[indexInCart].quantity!) && operation == "+1"){
            return res.status(400).json({error:"There are more items than product quantity"})
        }else if(typeof indexInCart! === 'number' && user.cart[indexInCart].quantity! == 1 && operation == "-1"){
            return res.status(400).json({error:"Quantity can't be less than 1"})
        }

        const userAfterCartItemQtyWasChanged = await User.findByIdAndUpdate(
            { _id:userId , 'cart._id':new ObjectId(cartItemId as string) },
            { $inc :{ 'cart.$[elem].quantity' : amount}},
            { new : true ,select:"-password -__v",
              arrayFilters: [{ 
                "elem._id": new ObjectId(cartItemId as string)
             }],
            }
        )
        
        return res.status(200).json({message:"success",user:userAfterCartItemQtyWasChanged})
    }catch(error){
        console.log(error)
        return res.status(500).json({error})
    }
}

export const clearCart = async (req:Request,res:Response)=>{
    try{
        const userId = req.body.userId;
        const userAfterCartCleared = await User.findOneAndUpdate({_id:userId},{
            $set : {cart : []}
        },{new:true,select:"-password -__v"})
        console.log(userAfterCartCleared)
        return res.status(201).json({message:"success",user:userAfterCartCleared})

    }catch(error){
        console.log(error)
        return res.status(500).json({error})
    }
}

