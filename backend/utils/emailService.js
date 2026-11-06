const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // In dev / test when SMTP is not configured, create a mock JSON transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || '"SharePlate Support" <no-reply@shareplate.org>';
  
  // Always log prominently in development for immediate visibility
  console.log('\n============================================================');
  console.log('📧  OUTGOING EMAIL NOTIFICATION');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('------------------------------------------------------------');
  console.log(text || html);
  console.log('============================================================\n');

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Failed to send email via SMTP (falling back to console):', error.message);
    return null;
  }
};

const sendDonorRegistrationOTP = async (email, otp) => {
  const subject = `Your SharePlate Food Donor Registration OTP: ${otp}`;
  const text = `Hello,\n\nYour One-Time Password (OTP) for food donor account registration on SharePlate is: ${otp}\n\nThis OTP is valid for 10 minutes. Please do not share this OTP with anyone.\n\nWarm regards,\nThe SharePlate Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">SharePlate Food Rescue</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>Hello,</p>
      <p>Thank you for registering as a food donor on SharePlate. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <div style="background-color: #ffedd5; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #c2410c;">${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>. If you did not initiate this request, please disregard this email.</p>
      <br/>
      <p>Together for zero waste,<br/><strong>The SharePlate Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

const sendNGOActivationOTP = async (email, otp, ngoName) => {
  const subject = `SharePlate NGO Account Activation OTP: ${otp}`;
  const text = `Hello ${ngoName},\n\nYour One-Time Password (OTP) for activating your NGO account on SharePlate is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nWarm regards,\nThe SharePlate Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">SharePlate NGO Portal</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>Hello <strong>${ngoName}</strong>,</p>
      <p>Please use the following One-Time Password (OTP) to verify your email and complete your NGO account activation:</p>
      <div style="background-color: #ffedd5; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #c2410c;">${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>
      <br/>
      <p>Warm regards,<br/><strong>The SharePlate Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

const sendNGOApplicationReceived = async (email, ngoName, applicationReferenceId) => {
  const subject = `Application Received: SharePlate NGO Verification [${applicationReferenceId}]`;
  const text = `Dear ${ngoName},\n\nYour NGO verification application has been successfully submitted.\n\nApplication Reference ID: ${applicationReferenceId}\n\nOur administration team will manually verify your documents and organization details. The verification process may take 10–15 days. You will receive an email once your application has been reviewed.\n\nThank you for partnering with us.\n\nWarm regards,\nThe SharePlate Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">SharePlate NGO Verification</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>Dear <strong>${ngoName}</strong>,</p>
      <p>Your NGO verification application has been successfully submitted!</p>
      <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Application Reference ID:</strong> <code style="font-size: 16px; color: #0f172a;">${applicationReferenceId}</code></p>
      </div>
      <p>Our administration team will manually verify your documents and organization details. The verification process may take <strong>10–15 days</strong>. You will receive an email once your application has been reviewed.</p>
      <br/>
      <p>Thank you for partnering with us to fight hunger and reduce food waste.<br/><strong>The SharePlate Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

const sendNGOApprovalEmail = async (email, ngoName, registrationId) => {
  const subject = `Application Approved! Your SharePlate NGO Registration ID: ${registrationId}`;
  const text = `Dear ${ngoName},\n\nWe are pleased to inform you that your NGO verification application has been APPROVED by the SharePlate administration team!\n\nYour Unique NGO Registration ID is: ${registrationId}\n\nNext Steps to Activate Your Account:\n1. Visit the SharePlate website.\n2. Click "Register as NGO".\n3. Select "Already Have a Registration ID?".\n4. Enter your Registration ID (${registrationId}) and complete account activation by verifying your email and choosing a password.\n\nNOTE: Keep this Registration ID confidential and do not share it with unauthorized individuals.\n\nWelcome to SharePlate!\n\nWarm regards,\nThe SharePlate Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #16a34a; text-align: center;">Application Approved! 🎉</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>Dear <strong>${ngoName}</strong>,</p>
      <p>We are delighted to inform you that your NGO verification application has been officially <strong>APPROVED</strong> by the SharePlate administration team.</p>
      
      <div style="background-color: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #166534; text-transform: uppercase; font-weight: bold;">Your Unique NGO Registration ID</p>
        <span style="font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #15803d;">${registrationId}</span>
      </div>

      <h3 style="color: #0f172a; margin-top: 25px;">Instructions to Activate Your Account:</h3>
      <ol style="line-height: 1.8; color: #334155;">
        <li>Visit the SharePlate website.</li>
        <li>Click <strong>"Register as NGO"</strong>.</li>
        <li>Select <strong>"Already Have a Registration ID?"</strong>.</li>
        <li>Enter your Registration ID (<code>${registrationId}</code>) and your registered email.</li>
        <li>Complete the one-time email OTP verification and set your account password.</li>
      </ol>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; color: #991b1b;">
          <strong>Security Note:</strong> This Registration ID is unique to your organization. Do not share this ID with unauthorized individuals.
        </p>
      </div>

      <br/>
      <p>We look forward to saving meals together,<br/><strong>The SharePlate Administration Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

const sendNGORejectionEmail = async (email, ngoName, reason) => {
  const subject = `Update on your SharePlate NGO Verification Application`;
  const text = `Dear ${ngoName},\n\nThank you for your interest in partnering with SharePlate.\n\nAfter reviewing your submitted documentation, we regret to inform you that your NGO verification application could not be approved at this time.\n\nReason for Rejection:\n${reason}\n\nIf you believe this is in error or if you have updated documentation, please feel free to contact us or submit a fresh application.\n\nWarm regards,\nThe SharePlate Administration Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #dc2626; text-align: center;">Application Status Update</h2>
      <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
      <p>Dear <strong>${ngoName}</strong>,</p>
      <p>Thank you for your interest in joining the SharePlate Food Rescue Network.</p>
      <p>After careful review of your submitted documents and organization details, we regret to inform you that your application could not be approved at this time.</p>
      
      <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 12px 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 5px 0; font-weight: bold; color: #991b1b;">Reason for Rejection:</p>
        <p style="margin: 0; color: #7f1d1d;">${reason || 'Documents did not meet verification criteria.'}</p>
      </div>

      <p>If you have any questions or have corrected documentation, you are welcome to contact our support team or submit a new application.</p>
      <br/>
      <p>Warm regards,<br/><strong>The SharePlate Administration Team</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendDonorRegistrationOTP,
  sendNGOActivationOTP,
  sendNGOApplicationReceived,
  sendNGOApprovalEmail,
  sendNGORejectionEmail,
};
