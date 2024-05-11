import { ICategory } from "../../@types/types";
import { expectId } from "./helperTestFunctions.test";

export function expectCategory(category : ICategory){
    expectId(category?._id);
    expect(typeof category?.imageUrl).toBe("string");
    expect(typeof category?.name).toBe("string");
    expect(category?.imageUrl).toBeTruthy();
    expect(category?.name).toBeTruthy();
}