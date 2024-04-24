import { IProductImage, IWishListItem, IWishListItemPopulated } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";
import { expectProductImageObj } from "./productUtils.test";

export function expectUnpopulatedWishlistItem(wishlistItem:IWishListItem){
    expectId(wishlistItem._id);
    expectId(wishlistItem.productId);
}

export function expectPopulatedWishlistItem(wishlistItem : IWishListItemPopulated){
    expectId(wishlistItem._id)
    expect(wishlistItem.product).toBeTruthy();
    expect(typeof wishlistItem.product.name).toBe("string");
    expect(typeof wishlistItem.product.categoryId).toBe("string");
    expect(typeof wishlistItem.product.price).toBe("number");
    expect(typeof wishlistItem.product.finalPrice).toBe("number");
    expect(typeof wishlistItem.product.quantity).toBe("number");
    expect(typeof wishlistItem.product.brand).toBe("string");
    expect(wishlistItem.product.images).toBeTruthy();
    (wishlistItem.product.images as IProductImage[]).forEach((image)=>{
        expectProductImageObj(image);
    })
}