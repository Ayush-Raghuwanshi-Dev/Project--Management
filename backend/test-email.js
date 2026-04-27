import { sendEmail } from "./routes/libs/send-email.js";
sendEmail("51110405490@piemr.edu.in", "Test Verify Account HTML", `This is a test`, `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
    <h2 style="color: #1a1a2e; font-size: 24px; margin-top: 0;">Welcome, Test!</h2>
    <p style="color: #4a4a5a; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
        Thank you for registering. Please click the button below to verify your email address and securely activate your account.
    </p>
    <a href="http://localhost:5173/verify-email?token=test-token-123" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center;">Verify My Account</a>
</div>
`).then(res => console.log("Done", res)).catch(err => console.log("Fail", err));
