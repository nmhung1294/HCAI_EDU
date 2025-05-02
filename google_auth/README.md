# Google Authentication Setup

This is a FastAPI application that implements Google OAuth2 authentication.

## Prerequisites

- Python 3.7+
- Google Cloud Platform account
- Google OAuth 2.0 Client ID and Client Secret

## Setup Instructions

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Google OAuth 2.0:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials
   - Create OAuth 2.0 Client ID
   - Set the authorized redirect URI to: `http://localhost:8000/auth/callback`
   - Download the client credentials and save as `google_credentials.json` in this directory

3. Create a `.env` file in the project root with the following variables:
```
REDIRECT_URI=http://localhost:8000/auth/callback
JWT_SECRET=your-secret-key-here
JWT_EXPIRY_DAYS=30
```

4. Run the application:
```bash
python loginGG.py
```

5. Access the application at `http://localhost:8000`

## Security Notes

- The JWT_SECRET should be a strong, random string
- In production, set `secure=True` in the cookie settings
- Use HTTPS in production
- Keep your `google_credentials.json` and `.env` files secure and never commit them to version control

## Features

- Google OAuth2 authentication
- JWT token-based session management
- User profile information display
- Secure cookie handling
- Error handling and display

## Project Structure

```
google_auth/
├── templates/
│   ├── home.html
│   ├── dashboard.html
│   └── error.html
├── loginGG.py
├── requirements.txt
├── google_credentials.json
└── .env
``` 