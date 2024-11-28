import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token, to, subject, body } = req.body;

    if (!token || !to || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Initialize OAuth2 client with the user's token
      const oAuth2Client = new google.auth.OAuth2();
      oAuth2Client.setCredentials({ access_token: token });

      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

      const rawMessage = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;

      const encodedMessage = Buffer.from(rawMessage).toString('base64');
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.status(200).json(response.data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
