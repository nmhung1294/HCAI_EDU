from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
import jwt  # For JWT token handling
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()
templates = Jinja2Templates(directory="templates")

# Configuration for Google OAuth
CLIENT_SECRETS_FILE = "google_credentials.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email"
]
REDIRECT_URI = "http://localhost:8000/auth/callback"
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_EXPIRY_DAYS = int(os.getenv("JWT_EXPIRY_DAYS", "30"))

# Initialize Google OAuth Flow
def get_google_flow():
    return Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "home.html",
        {"request": request}
    )

@app.get("/login")
async def login():
    try:
        flow = get_google_flow()
        authorization_url, _ = flow.authorization_url(prompt="consent")
        return RedirectResponse(url=authorization_url)
    except Exception as e:
        return templates.TemplateResponse(
            "error.html",
            {"request": Request, "error": f"Login failed: {str(e)}"}
        )

@app.get("/auth/callback")
async def auth_callback(code: str):
    try:
        # Exchange code for tokens
        flow = get_google_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Get user info from Google
        from googleapiclient.discovery import build
        service = build("oauth2", "v2", credentials=credentials)
        user_info = service.userinfo().get().execute()

        # Generate JWT token
        payload = {
            "sub": user_info["id"],
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        # Create response with token
        response = RedirectResponse(url="/dashboard")
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=True,  # Set to False if testing locally without HTTPS
            samesite="lax",
            max_age=JWT_EXPIRY_DAYS * 24 * 60 * 60  # Cookie expires in JWT_EXPIRY_DAYS days
        )
        return response
    except Exception as e:
        return templates.TemplateResponse(
            "error.html",
            {"request": Request, "error": f"Authentication failed: {str(e)}"}
        )

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    # Get token from cookie
    token = request.cookies.get("auth_token")
    if not token:
        return RedirectResponse(url="/login")

    # Verify token
    try:
        user_info = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return RedirectResponse(url="/login")

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "user_info": user_info
        }
    )

@app.get("/logout")
async def logout():
    response = RedirectResponse(url="/")
    response.delete_cookie("auth_token")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)