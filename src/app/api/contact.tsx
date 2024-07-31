const nodemailer = require("nodemailer");

export default async function handler(req: any, res: any) {
    if (req.method == 'POST') {

        const { name, email, message } = req.body;

        // Create a transporter using SMTP
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",  // Replace with your SMTP host
          port: 587,
          secure: false, // Use TLS
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
    
        try {
          // Send email
          let info = await transporter.sendMail({
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Submission",
            text: `
              Name: ${name}
              Email: ${email}
              Message: ${message}
            `,
            html: `
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong> ${message}</p>
            `,
          });
    
          console.log("Message sent: %s", info.messageId);
          res.status(200).json({ message: 'Form submitted successfully' });
        } catch (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Failed to submit form' });
        }
      } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
      }
}