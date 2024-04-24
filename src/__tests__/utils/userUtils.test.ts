import { ObjectId } from "mongoose";
import { ICartItem, IUser, IWishListItem } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";
import { expectUnpopulatedWishlistItem } from "./wishlist.test";
import { expectUnpopulatedCart } from "./cart.test";
import { expectAddress } from "./addressUtils.test";

export function expectUser(user: IUser){
    const expectedRoles = ["admin","user"];
    expectId(user._id);
    expect(user.password).toBeUndefined();
    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();
    user.cart.forEach((cartItem)=>{
        expectUnpopulatedCart(cartItem)
    })
    user.wishList.forEach((wishlistItem)=>{
        expectUnpopulatedWishlistItem(wishlistItem)
    })
    user.addresses.forEach((address)=>{
        expectAddress(address);
    })
    
    expect(typeof user.email).toBe("string");
    expect(typeof user.firstName).toBe("string");
    expect(typeof user.lastName).toBe("string");
    if(user.userImg){
        expect(typeof user.userImg).toBe("string");
    }
    expect(expectedRoles).toEqual(expect.arrayContaining([user.role]));
}

