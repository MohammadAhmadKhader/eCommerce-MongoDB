import { NextFunction, Request, Response } from "express";

export const pagination = (req:Request,res:Response,next:NextFunction)=>{
    let limit = Number(parseInt(req.query.limit as string));
    let page = Number(parseInt(req.query.page as string));

    if(Number.isNaN(page) || Number.isNaN(limit) || limit > 30 || limit <= 0 || page <= 0){
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