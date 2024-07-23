var express = require("express");
var router = express.Router();
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.email',
  secure: false,
  service: 'gmail',
  auth: {
    user: 'abdullahsaigal@gensols.org',
    pass: 'yxvh vcoc zbte eida'
  },
});

const upload = multer({ dest: 'uploads/' });

const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const recipients = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => recipients.push(data.email)) // Assumes the CSV has a column named 'email'
      .on('end', () => resolve(recipients))
      .on('error', (error) => reject(error));
  });
};

const formatMessage = (message) => {
  return message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/ {2}/g, '&nbsp;&nbsp;')
    .replace(/ {1}/g, '&nbsp;');
};

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const recipients = await readCSV(filePath);
    const { message } = req.body;

    const source = fs.readFileSync(path.join(__dirname, 'new-email.html'), 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
      message: formatMessage(message),
    };
    const htmlToSend = template(replacements);

    const emailPromises = recipients.map((recipient) => {
      return transporter.sendMail({
        from: 'abdullahsaigal@gensols.org',
        to: recipient,
        subject: 'Welcome to Gensols',
        text: message, // Plain text version
        html: htmlToSend, // HTML version
      });
    });

    const info = await Promise.all(emailPromises);

    console.log('Messages sent: %s', info.map((i) => i.response).join(', '));
    res.send('Emails Sent!');
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).send('An error occurred while sending emails');
  } finally {
    fs.unlinkSync(req.file.path); // Delete the uploaded file
  }
});

module.exports = router;