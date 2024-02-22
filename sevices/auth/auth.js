const jwt = require("jsonwebtoken");

function createToken(visibleUser, maxAge = 60 * 60 * 24 * 3) {
    return jwt.sign(
        visibleUser, 
        process.env.JWT_SECRET || "my-jwt-secret", {
            expiresIn: maxAge,
    });
}

function verifyToken(_token) {
    if (!_token) {
        return null;
    }
    const verifiedToken = jwt.verify(
        _token, process.env.JWT_SECRET || "my-jwt-secret"
    );
    return verifiedToken;
}

module.exports = {
    createToken,
    verifyToken,
};