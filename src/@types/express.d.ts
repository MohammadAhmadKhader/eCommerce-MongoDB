import { IUser } from "./types";

declare global{
    namespace Express {
        interface Request {
            pagination: {
              limit: number;
              skip: number;
              page: number;
            };
            user:IUser;
            validationError:any;
        }
    }
}

