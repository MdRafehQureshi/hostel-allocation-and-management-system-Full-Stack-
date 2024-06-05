import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

async function sendEmail(otp, email) {
    const info = await transporter.sendMail({
        from: `"Maulana Abul Kalam Azad University of Technology , West Bengal - Hostel"<${process.env.NODEMAILER_USER}>`,
        to: email,
        subject: "Email Verification",
        text: `Your One Time Password (OTP) for email verification is ${otp}
        Please do not share it with anyone.`,
        html: `<div style="text-align:center;"><p>Your <bold>One Time Password (OTP)</bold> for email verification is:</p> <h2>${otp}</h2>
        <p>Please do not share it with anyone.</p></div>`,
    });
    return info;
}

export { sendEmail };
