
declare namespace Express {
    interface Request {
        pagination: {
          limit: number;
          skip: number;
          page: number;
        };
    }
}
