import { validateAddToWishList, validateRemoveFromWishlist } from "../../../middlewares/validationsFunctions";
import { hexWith24Char, hexWith25Char, stringWith24Char } from "../../assets/testData/stringTestData";
import { createResponseNext } from "../../utils/helperTestFunctions.test";
import { Request } from "express";

describe("Wishlists validation middlewares",()=>{
    describe("Testing validateAddToWishList middleware",()=>{
        it("Should return an error that productId is required",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{

                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId is required",
            ]})
        })

        it("Should return an error that when productId is length 24 and not hex",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    productId:stringWith24Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error that when productId is not string",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    productId:[]
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId must be a string",
            ]})
        })

        it("Should return an error that when productId is length is not 24",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    productId:hexWith25Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "productId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when productId is hex 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                body:{
                    productId:hexWith24Char
                }
            } as Request;
            validateAddToWishList(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

    describe("Testing validateRemoveFromWishlist middleware",()=>{
        it("Should return an error that wishlistItemtId is required",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{

                }
            } as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId is required",
            ]})
        })

        it("Should return an error that when wishlistItemId is length 24 and not hex",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    wishlistItemId:stringWith24Char
                }
            } as unknown as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId must only contain hexadecimal characters",
            ]})
        })

        it("Should return an error that when wishlistItemId is not string",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    wishlistItemId:[]
                }
            } as unknown as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId must be a string",
            ]})
        })

        it("Should return an error that when wishlistItemId is length is not 24",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    wishlistItemId:hexWith25Char
                }
            } as unknown as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({error:[
                "wishlistItemId length must be 24 characters long",
            ]})
        })

        it("Should pass successfully when wishlistItemId is hex 24 length",()=>{
            const { next,res } = createResponseNext()
            const req = {
                params:{
                    wishlistItemId:hexWith24Char
                }
            } as unknown as Request;
            validateRemoveFromWishlist(req,res,next);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled()
        })
    })

})