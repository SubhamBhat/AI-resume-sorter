"""
Configuration for TalentAI Backend
"""

import os
from typing import Optional

class Settings:
    """Application settings and configuration"""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]
    
    # Model settings
    SEMANTIC_MODEL: str = "all-MiniLM-L6-v2"
    NER_MODEL: str = "en_core_web_sm"
    NER_MODE: str = os.getenv("NER_MODE", "auto")
    
    # Processing settings
    MAX_PDF_SIZE_MB: int = 50  # Maximum PDF file size in MB
    MAX_RESUMES: int = 100  # Maximum number of resumes to process
    TEXT_CHUNK_SIZE: int = 500  # Size of text chunks for processing
    
    # Timeout settings
    PROCESSING_TIMEOUT_SECONDS: int = 300  # 5 minutes max per request
    
    # Model cache settings
    CACHE_MODELS: bool = True  # Cache models in memory
    
    @classmethod
    def get_settings(cls) -> "Settings":
        """Get application settings"""
        return cls()

# Create settings instance
settings = Settings.get_settings()
