import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve("../../config/.env") });
import nodemailer from "nodemailer";
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.PASSWORD,
        },
    });

    async function main(to, sub, html) {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_ADDRESS, // sender address (no name, no emoji)
            to: process.env.EMAIL_ADDRESS, // always send to this email
            subject: sub || "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: html || "<b>Hello world?</b>", // html body
        });

        if(info.accepted.length){
            return true;
        }
        else{
            return false;
        }
    }

export default main