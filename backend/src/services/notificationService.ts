import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmailOtp = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"NeedStu Security" <${process.env.MAIL_USER || 'no-reply@needstu.com'}>`,
    to: email,
    subject: '[NeedStu] Account Verification OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #3b82f6; text-align: center;">NeedStu Hub Verification</h2>
        <p>Hello,</p>
        <p>You requested to verify your account. Please use the following One-Time Password (OTP) to complete the verification:</p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #64748b;">This OTP code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">NeedStu Inc., Localhost Environment</p>
      </div>
    `,
  };

  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log(`\n=========================================`);
      console.log(`[Email OTP Mock]: SMTP credentials missing. OTP for ${email} is: ${otp}`);
      console.log(`=========================================\n`);
      return true;
    }
    await transporter.sendMail(mailOptions);
    console.log(`[Email Sent]: Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email Error]: Failed to send email to ${email}:`, error);
    console.log(`\n=========================================`);
    console.log(`[Email OTP Mock Fallback]: OTP for ${email} is: ${otp}`);
    console.log(`=========================================\n`);
    return false;
  }
};

export const sendPhoneOtp = async (phone: string, otp: string) => {
  console.log(`\n=========================================`);
  console.log(`[SMS OTP Mock]: Verification Code for ${phone} is: ${otp}`);
  console.log(`=========================================\n`);
  return true;
};

export const sendExpirationWarningEmail = async (email: string, daysLeft: number) => {
  const mailOptions = {
    from: `"NeedStu Support" <${process.env.MAIL_USER || 'no-reply@needstu.com'}>`,
    to: email,
    subject: '[NeedStu] WARNING: Your account is expiring soon!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 12px;">
        <h2 style="color: #ef4444; text-align: center;">Account Expiration Warning</h2>
        <p>Hello,</p>
        <p>This is a warning that your account has not been verified recently, or has been inactive. It will be <strong>deleted permanently in ${daysLeft} days</strong> to free up database storage.</p>
        <p>To prevent this, please log in to the NeedStu App and confirm that you are still active in the Profile Settings.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:3000" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">Keep My Account Active</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">NeedStu Inc., Localhost Environment</p>
      </div>
    `,
  };

  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log(`\n=========================================`);
      console.log(`[Email Warning Mock]: Account expiration warning mock sent to ${email} (${daysLeft} days remaining)`);
      console.log(`=========================================\n`);
      return true;
    }
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`[Email Warning Error]: Failed to send warning to ${email}:`, error);
    return false;
  }
};
