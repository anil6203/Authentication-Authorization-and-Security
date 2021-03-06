// npm i nodemailer
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1). Create a transporter
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //     // activate in gmail "less secure app" option
  //   });

  //1). create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2). Define the email options
  const mailOptions = {
    from: 'Anil Kumar <hello@anil.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3).Actually send the email with nodemailer
  // send mail is an asynchronous function
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
