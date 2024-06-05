import crypto from "crypto";

function generateOtp() {
    const otp = 100000 + crypto.randomInt(899999);
    return otp.toString();
}

function hashOtp(otp) {
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    return hashedOtp;
}

function verifyOtp(providedOtp, storedHashedOtp) {
    const hashedProvidedOtp = hashOtp(providedOtp.toString());
    return hashedProvidedOtp === storedHashedOtp;
}

export { generateOtp, hashOtp, verifyOtp };
