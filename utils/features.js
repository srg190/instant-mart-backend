import jwt, { verify } from "jsonwebtoken";
import crypto from "crypto";

export const sendCookie = (user, res, message, statusCode = 200) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.COOKIE_EXPIRE * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Development" ? false : true,
    })
    .json({
      success: true,
      message,
      token,
      user,
    });
};

export const getResetPasswordToken = () => {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Return the reset token
  return resetToken;
};

export const generateResetPasswordToken = (user) => {
  // Create the JWT token
  const resetToken = getResetPasswordToken();
  // const token = jwt.sign({ id: user._id, resetToken }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRE,
  // });
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

export const verifyResetPasswordToken = (token) => {
  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return the decoded token
    return decoded;
  } catch (error) {
    // Token verification failed
    return null;
  }
};

export const jwtSignCart = (_id) => {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  return token;
};
function isTokenExpired(token) {
  const payloadBase64 = token.split(".")[1];
  const decodedJson = Buffer.from(payloadBase64, "base64").toString();
  const decoded = JSON.parse(decodedJson);
  const exp = decoded.exp;
  const expired = Date.now() >= exp * 1000;
  return expired;
}
export const VerifyCartId = (token) => {
  if (!toke || isTokenExpired(token)) {
    return false;
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded._id;
};
