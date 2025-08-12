import nodemailer from 'nodemailer';

const createTransporter = () => {
return nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

};

export async function sendPasswordResetEmail(email: string, resetCode: string, username: string) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Invoice Generator" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Code - Invoice Generator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>You requested a password reset for your Invoice Generator account. Use the verification code below to reset your password:</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 4px;">${resetCode}</h1>
          </div>
          
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Invoice Generator" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Invoice Generator!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Welcome to Invoice Generator!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for joining Invoice Generator</p>
          <p>Your account has been successfully created and verified.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send welcome email' };
  }
}

export async function sendVerificationEmail(email: string, username: string, verificationToken: string) {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"Invoice Generator" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Invoice Generator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 >Invoice Generator</h1>
              <h2 >Verify Your Email Address</h2>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${username},</p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for signing up for Invoice Generator! Please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #4f46e5; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            
            <div >
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Verification Code:</strong> ${verificationToken}
              </p>
              <p >
                This verification link will expire in 24 hours.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send verification email' };
  }
}
