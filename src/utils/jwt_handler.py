from jose import jwt
from datetime import datetime, timedelta
from src.dependencies import oauth2_scheme
from fastapi import Depends, HTTPException

SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"

def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=2)

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        username = payload.get("sub")

        return username

    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
