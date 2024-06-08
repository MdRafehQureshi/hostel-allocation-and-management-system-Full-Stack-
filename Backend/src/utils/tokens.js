import jwt from "jsonwebtoken";

function generateAccessToken(userId, role) {
    const accessToken = jwt.sign(
        {
            id: userId,
            role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "2h",
        }
    );
    return accessToken;
}

function generateRefreshToken(userId, role) {
    const refreshToken = jwt.sign(
        {
            id: userId,
            role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "1d",
        }
    );
    return refreshToken;
}

export { generateAccessToken, generateRefreshToken };
