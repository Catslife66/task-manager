import secrets
import hmac
from fastapi import HTTPException, status, Request

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

def create_csrf_token():
    return secrets.token_urlsafe(32)

def csrf_protect(request: Request):
    if request.method in SAFE_METHODS:
        return 
    cookie = request.cookies.get("csrf_token")
    header = request.headers.get("x-csrf-token")
    if not cookie or not header:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing.")
    if not hmac.compare_digest(cookie, header):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token invalid.")