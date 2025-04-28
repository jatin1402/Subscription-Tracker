const errorMiddleware = (err, req, res, next) => {
    
    try{
        // we are actually intercepting the error and trying to find more information about it so we can quickly act 

        let error = {...err};
        error.message = err.message;
        //mongosse bad objectId
        if(err.name === "CastError") {
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new Error(message);
            error.statusCode = 404;
        }
        // mongoose duplicate key error
        if(err.code === 11000) {
            const message = `Duplicate field value entered: ${err.keyValue.name}`;
            error = new Error(message);
            error.statusCode = 400;
        }
        // mongoose validation error
        if(err.name=== "ValidationError") {
            const message = Object.values(err.errors).map((value) => value.message);
            error = new Error(message.join(", "));
            error.statusCode = 400;
        }
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        })
    } catch(error) {
       next(error);
    }
}

export default errorMiddleware;

// we are going to use this middleware to handle errors in our application
// lets create a subscriction -> it will call middleware (check for renewal date) -> next middleware (check for error) -> next() -> controller