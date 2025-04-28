import aj from "../config/arcjet.js"

// first we need to create an instance of arcject in the config file
const arcjetMiddleware = async (req, res, next) => {
    try{
        // Whitelist Postman user agent
        const postmanUserAgent = "PostmanRuntime";
        if (req.headers["user-agent"]?.includes(postmanUserAgent)) {
            return next(); // Skip Arcjet protection for Postman requests
        }
        const decision = await aj.protect(req, {requested: 1});

        // console.log(decision.reason);
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()) return res.status(429).json({message: "Too many attempts, rate limit exceeded"});
            if(decision.reason.isBot()) return res.status(403).json({message: "Bot detected"});

            return res.status(403).json({message: "Access denied"});
        }
        next();
    }catch(e){
        next(e)
    }
};

export default arcjetMiddleware; // additional layer of protection :)