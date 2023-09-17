/* eslint-disable import/no-extraneous-dependencies */
const nodeMailer = require("nodemailer");

// NodeMailer
const sendEmail = async (options) => {
  // 1- create transporter (service that sends Email like "Gmail" , "Mailugn")
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure false >>> port = 587 if secure true >>> port=465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2- Define Email options (like from, to, Email content, subject)
  const mailOptions = {
    from: "E-Commerce App <mr.abdo1920@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3- Send Email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
