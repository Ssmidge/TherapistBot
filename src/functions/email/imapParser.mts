import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import readline from 'readline';

// Load credentials
const TOKEN_PATH = 'token.json';

async function loadCredentials() : Promise<any> {
  return JSON.parse(process.env.GMAIL_API_CREDENTIALS);
}

async function authenticate(): Promise<OAuth2Client> {
  const { client_id, client_secret, redirect_uris } = (await loadCredentials() as any).installed;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  try {
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (error) {
    await getNewToken(oAuth2Client);
  }
  return oAuth2Client;
}

async function getNewToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'],
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return console.error('Error retrieving access token', err);

      oAuth2Client.setCredentials(token!);

      // Store the token for future use
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log('Token stored to', TOKEN_PATH);
    });
  });
}

async function getLastAuthCode(auth: OAuth2Client): Promise<string> {
  const gmail = google.gmail({ version: 'v1', auth });
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: "from:(*@slack.com) Slack confirmation code: label:unread"
  }); 
  const messages = res.data.messages || [];

  let authCode = "NONE";
  for(const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id!,
    });
    if (!msg.data.payload?.headers?.find((header) => header.name === 'Subject')?.value?.includes("Slack confirmation code: ")) return authCode;
    const payload = msg.data.payload?.headers?.find((header) => header.name === 'Subject')?.value?.split("Slack confirmation code: ")[1];
    if (authCode === "NONE") authCode = payload!;
    // mark as read
    await gmail.users.messages.modify({
        userId: 'me',
        id: message.id!,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
    });
  }
  return authCode;
}

export default async function getSlackAuthCode(): Promise<string> {
  const auth = await authenticate();
  return await getLastAuthCode(auth);
}