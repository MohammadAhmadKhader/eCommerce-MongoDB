import { ICartItem } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";

export function expectUnpopulatedCart(cartItem : ICartItem){
    expectId(cartItem._id);
    expectId(cartItem.productId);
    expect(typeof cartItem.quantity).toBe("number");
    expect(cartItem.quantity).toBeGreaterThanOrEqual(1);
}