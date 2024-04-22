import { IUser } from './../@types/types.d';
import { Request , Response} from "express"
import User from "../models/user";
import Product from "../models/product";
import { ObjectId } from "mongodb";

export const getAllCartItems = async (req:Request,res:Response)=>{
    try{
        // Should be refactored and use req.user instead of request
        const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({error:"user id is required"})
        }
        
        const cartItems = await User.findById(userId,{cart:1}).populate({
            path:"cart.productId",
            select:"name images offer price finalPrice brand quantity",
        })
        const renamedParams : any = cartItems?.toObject();
        renamedParams?.cart.map((item : any)=>{
            item.cartItem = item.productId
            delete item.productId
        })
        
        if(!cartItems){
            return res.status(400).json({error:"User was not found"})
        }
        
        return res.status(200).json({cart:renamedParams.cart})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const addToCart = async (req:Request,res:Response)=>{
    try{
        const {productId,quantity} : {productId:string,quantity:number} = req.body;
        const user = req.user as IUser;
        const userId = req.user._id;
        if(Number.isNaN(quantity) || quantity <= 0){
            return res.status(400).json({error:"Invalid quantity"})
        }
        
        const doesUserHaveThisItem = user!.cart.filter((item) => item.productId == productId)
        if(doesUserHaveThisItem.length > 0){
            return res.status(400).json({error:"User already have this item"})
        }
        
        const userAfterCartChanged = await User.findOneAndUpdate({_id:userId},{
            $push : {cart : {productId,quantity}}
        },{new:true,select:"-password -__v"})

        return res.status(201).json({message:"success",user:userAfterCartChanged})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const deleteFromCart = async (req:Request,res:Response)=>{
    try{
        const cartItemId = req.body.cartItemId as string;
        const userBeforeCartChange = req.user as IUser;
        const userId = req.user._id as string;

        const userAfterCartChanged = await User.findOneAndUpdate({_id:userId},{
            $pull : {cart : { _id:cartItemId}}
        },{new:true,select:"-password -__v"});
        
        if(userAfterCartChanged?.cart.length === userBeforeCartChange.cart.length){
            return res.status(400).json({error:"Something went wrong cartItem was not removed"})
        }

        return res.status(204).json({message:"success",user:userAfterCartChanged})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const changeCartItemQuantityByOne = async (req:Request,res:Response)=>{
    try{
        const productId = req.body.productId as string;
        const cartItemId = req.body.cartItemId as string;
        const userId : string = req.user._id;
        const operation = req.body.operation;
        let amount = 1;
        let indexInCart : number;
        if(!operation || (operation != "+1" && operation != "-1")){
            return res.status(400).json({message:"operation is required"})
        }
        if(operation == "-1"){
            amount = -1
        }

        const product = await Product.findOne({_id:new ObjectId(productId)},{quantity:1});
        if(!product){
            return res.status(400).json({error:"product does was not found"})
        }
        const user = await User.findOne({_id:new ObjectId(userId)})
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
            { new : true ,select:"-__v",
              arrayFilters: [{ 
                "elem._id": new ObjectId(cartItemId as string)
             }],
            }
        )
        
        return res.status(200).json({message:"success",user:userAfterCartItemQtyWasChanged})
    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

export const clearCart = async (req:Request,res:Response)=>{
    try{
        const userId : string = req.user._id;
        const userAfterCartCleared = await User.findOneAndUpdate({_id:userId},{
            $set : {cart : []}
        },{new:true,select:"-__v"})
        return res.status(201).json({message:"success",user:userAfterCartCleared})

    }catch(error : any){
        console.error(error)
        return res.status(500).json({error:error?.message})
   }
}

