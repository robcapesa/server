const nodemailer = require('nodemailer');

// Create a transporter to send emails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'uptimemonitor50@gmail.com', // Replace with your Gmail email
    pass: 'tkhnhlwqxpawpgcc', // Replace with your Gmail password
  },
});

// Function to send an email
const sendEmail = (toEmail, subject, message) => {
  const mailOptions = {
    from: 'uptimemonitor50@gmail.com', // Replace with your Gmail email
    to: toEmail,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = sendEmail;
