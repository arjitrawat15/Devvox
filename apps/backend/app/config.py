from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    openai_key: str
    gemini_api_key: str
    proxy_url: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    google_client_id: str = ""
    google_client_secret: str = ""
    jwt_secret: str = "change-me-in-production"
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
