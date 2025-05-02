import os
import json
from typing import Literal, Optional, Dict, Any
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from datetime import datetime, timedelta
import jwt

class GoogleAuth:
    def __init__(
        self,
        client_secrets_path: str,
        redirect_uri: str,
        jwt_secret: str,
        jwt_expiry_days: float = 30.0
    ):
        """
        Initialize Google OAuth authentication
        
        Args:
            client_secrets_path: Path to Google OAuth client secrets JSON file
            redirect_uri: OAuth redirect URI
            jwt_secret: Secret key for JWT token generation
            jwt_expiry_days: Number of days until JWT token expires
        """
        self.client_secrets_path = client_secrets_path
        self.redirect_uri = redirect_uri
        self.jwt_secret = jwt_secret
        self.jwt_expiry_days = jwt_expiry_days

    def get_authorization_url(self) -> str:
        """
        Get Google OAuth authorization URL
        
        Returns:
            str: Authorization URL
        """
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            self.client_secrets_path,
            scopes=["openid", "https://www.googleapis.com/auth/userinfo.profile", 
                   "https://www.googleapis.com/auth/userinfo.email"],
            redirect_uri=self.redirect_uri,
        )

        authorization_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
        )
        return authorization_url

    def get_user_info(self, auth_code: str) -> Dict[str, Any]:
        """
        Get user information from Google OAuth code
        
        Args:
            auth_code: OAuth authorization code
            
        Returns:
            Dict containing user information
        """
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            self.client_secrets_path,
            scopes=["openid", "https://www.googleapis.com/auth/userinfo.profile", 
                   "https://www.googleapis.com/auth/userinfo.email"],
            redirect_uri=self.redirect_uri,
        )
        
        flow.fetch_token(code=auth_code)
        credentials = flow.credentials
        
        user_info_service = build(
            serviceName="oauth2",
            version="v2",
            credentials=credentials,
        )
        
        return user_info_service.userinfo().get().execute()

    def generate_token(self, user_info: Dict[str, Any]) -> str:
        """
        Generate JWT token for authenticated user
        
        Args:
            user_info: User information from Google
            
        Returns:
            str: JWT token
        """
        payload = {
            'name': user_info.get('name'),
            'email': user_info.get('email'),
            'picture': user_info.get('picture'),
            'id': user_info.get('id'),
            'exp': datetime.utcnow() + timedelta(days=self.jwt_expiry_days)
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify JWT token and return user information
        
        Args:
            token: JWT token to verify
            
        Returns:
            Dict containing user information if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None 