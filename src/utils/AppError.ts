class AppError extends Error{
    statusCode: number;
    isOperational: boolean;
    constructor(message: string | undefined, statusCode: number){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
