from fastapi import APIRouter, HTTPException, status
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    db = get_db()
    existing = await db["users"].find_one({"email": body.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user_doc = {
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
    }
    await db["users"].insert_one(user_doc)

    token = create_access_token({"sub": body.email})
    return TokenResponse(access_token=token, name=body.name, email=body.email)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    db = get_db()
    user = await db["users"].find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": body.email})
    return TokenResponse(access_token=token, name=user["name"], email=user["email"])
