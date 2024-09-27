const nodemailer = require('nodemailer');
const { ErrorHandler } = require('./errohandler');

const sendMail = async ({ email, firstname }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.AUTH,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH,
    to: email,
    subject: 'Thank you for contacting Sharif Stone',
    html: `
      <html>
        <body>
          <p>Dear ${firstname},</p>
          <p>hellow world </p>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions, (error) => {
    if (error) {
      throw new ErrorHandler('Email Not Send', 400);
    }
  });
};

module.exports = { sendMail };
