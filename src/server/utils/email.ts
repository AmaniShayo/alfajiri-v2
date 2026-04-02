import { Resend } from "resend";
import { RESEND_API_KEY } from "../config";

const resend = new Resend(RESEND_API_KEY);

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const mailOptions = {
    from: `Alfajiri <onboarding@alfajiri.app>`,
    to: email,
    subject: "Verify Your Account",
    text: `Your verification token is: ${token}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: #000539ff; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .token { font-size: 24px; font-weight: bold; color: #000539ff; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #000539ff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to <strong>Alfajiri</strong></h1>
          </div>
          <div class="content">
            <p>Thank you for signing up! Please use the following token to verify your account:</p>
            <div class="token">${token}</div>
            <p>Enter this token in the verification field to activate your account.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Alfajiri. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await resend.emails.send(mailOptions).catch((error) => {
    console.error("Error sending verification email:", error);
    throw error;
  });
};

export const sendInvitationEmail = async (
  email: string,
  token: string,
  business: string
): Promise<void> => {
  const mailOptions = {
    from: `Alfajiri <onboarding@alfajiri.app>`,
    to: email,
    subject: `You're Invited to Join ${business}`,
    text: `You've been added to ${business}. Use this password to log in: ${token}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: #000539ff; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .token { font-size: 24px; font-weight: bold; color: #000539ff; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #000539ff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Join ${business}</h1>
          </div>
          <div class="content">
            <p>You've been invited to join <strong>${business}</strong> on <strong>Alfajiri!</strong></p>
            <p>Use the following temporary password to log in:</p>
            <div class="token">${token}</div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Alfajiri. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await resend.emails.send(mailOptions).catch((error) => {
    console.error("Error sending invitation email:", error);
    throw error;
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  temporaryPassword: string
): Promise<void> => {
  const mailOptions = {
    from: `Alfajiri <onboarding@alfajiri.app>`,
    to: email,
    subject: "Your New Password for Alfajiri",
    text: `Your temporary password is: ${temporaryPassword}. Please log in and change it in your account settings.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: #000539ff; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; }
          .password { font-size: 24px; font-weight: bold; color: #000539ff; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #000539ff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset for <strong>Alfajiri</strong></h1>
          </div>
          <div class="content">
            <p>We’ve reset your password. Use the temporary password below to log in to your account:</p>
            <div class="password">${temporaryPassword}</div>
            <p>Please log in with this temporary password and update it immediately in your account settings.</p>
            <a href="https://alfajiri.app/login" class="button">Log In Now</a>
            <p>For security, this temporary password will expire in 24 hours.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Alfajiri. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await resend.emails.send(mailOptions).catch((error) => {
    console.error("Error sending password reset email:", error);
    throw error;
  });
};
