const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, link) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="background-color: #f4f7f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            
            <div style="background-color: #1a202c; padding: 25px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">
                    Task<span style="color: #8fbc8f;">Manager</span>
                </h1>
            </div>
            
            <div style="padding: 40px 30px; color: #444444; line-height: 1.6;">
                <p style="font-size: 16px;">Dear User,</p>
                <p style="font-size: 16px;">Aapne apne <strong>TaskManager</strong> account ka password reset karne ki request ki thi. Agar ye aap hain, toh niche diye gaye button par click karein:</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${link}" style="background-color: #8fbc8f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; transition: background-color 0.3s;">Reset My Password</a>
                </div>
                
                <p style="font-size: 14px; color: #666666;">Ye link agle <strong>5 minutes</strong> tak valid rahega. Agar aapne ye request nahi ki, toh aap is email ko ignore kar sakte hain.</p>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} TaskManager Team. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"TaskManager Support" <${process.env.USER_EMAIL}>`,
      to: email,
      subject: "TaskManager - Password Reset Request",
      html: htmlContent,
    });
  } catch (error) {
    console.log("Email not sent:", error);
  }
};

module.exports = { sendEmail };
