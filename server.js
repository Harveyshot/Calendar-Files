const express = require('express');
const cors    = require('cors');
const { Resend } = require('resend');

const app  = express();
const port = process.env.PORT || 3000;

// Use the standard CORS middleware to allow all origins
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Simple GET route to test server reachability
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.use(express.json());

const resend     = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'onboarding@resend.dev';

app.post('/send-email', async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `<p>${body}</p>`
    });
    res.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
