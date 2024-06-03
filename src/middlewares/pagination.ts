import { NextFunction, Request, Response } from "express";


const pagination = (minLimit:number=0,maxLimit:number=30)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        let limit = Number(parseInt(req.query.limit as string));
        let page = Number(parseInt(req.query.page as string));

        if(Number.isNaN(page) || Number.isNaN(limit) || limit > maxLimit || limit <= minLimit || page <= 0){
            limit = 9;
            page = 1;
        }
        let skip = limit  * (page - 1);

        req.pagination = {
            limit,
            page,
            skip,
        }
        next();
    }
}

export const paginationUser = pagination(1,30);
export const paginationAdmin = pagination(1,100);