const nodemailer = require('nodemailer');

// Create a Nodemailer transporter using a Gmail account
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'kailashkumartkg@gmail.com',
    pass: 'Kailash2000'
  }
});

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP
};

// Compose the email
const otp = generateOTP();
const mailOptions = {
  from: 'kailashkumartkg@gmail.com',
  to: 'kabita20@navgurukul.org',
  subject: 'Your OTP Code',
  text: `Your OTP code is: ${otp}`
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email: ' + error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
