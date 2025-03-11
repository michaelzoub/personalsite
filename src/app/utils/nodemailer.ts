import nodemailer from "nodemailer"
const email = process.env.EMAIL_USER
const pass = process.env.PASS_USER

const transporter = nodemailer.createTransport({
host: 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: email,
    pass: pass
  }
});

export async function nodeMailer(from: string, subject: string, text: string) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: from, 
    to: email, 
    subject: subject,
    text: text
  });

  console.log("Message sent: %s", info.messageId);
}
