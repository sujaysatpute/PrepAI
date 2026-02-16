from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chatbot, user
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="PrepAI Backend", version="1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(chatbot.router, prefix="/chat", tags=["chat"])
app.include_router(user.router)

@app.get("/")
def root():
    gemini_key = os.getenv("GEMINI_API_KEY")
    return {"message": "PrepAI Backend Running 🚀", "GeminiKeyLoaded": bool(gemini_key)}
