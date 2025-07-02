// middleware for authentication, when ever a user tries to access a protected route, this middleware will check if the user is authenticated 


const jwt = require("jsonwebtoken")
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token; //get the token from the cookies, this is where we store the JWT after login
    console.log("Token from cookies:", token);
    
    //if token does not exists, redirect user to login page upfront
    if(!token) return res.status(401).send("Unauthorized Access");

    try {
        //if token exists, verify the token
        const decoded = jwt.verify(token, process.env.NEED_THIS_WHY);

        //find the user by the id that was stored in JWT and later decoded 
        const { _id } = decoded;
        const user = await User.findById(_id);

        if(!user){
            throw new Error("User not found");
        }

        //store the user info in the request and jump to next handler
        req.user = user;
        next();

    } catch (err) {
        //if 1. token invalid, 2. token expired, 3. any other unexpexted error 
        res.status(400).send("Error: " + err.message);        
    }
};

module.exports = authMiddleware;