from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str
    DB_NAME: str = "ai_career_coach"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
