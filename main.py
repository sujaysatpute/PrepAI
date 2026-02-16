from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables early
load_dotenv()

app = FastAPI(title="PrepAI Backend", version="1.0.0")

# CORS - Configure for Flutter web and mobile apps
# Allow all origins for development (use specific origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routes
from routes.chatbot import router as chatbot_router  # noqa: E402

app.include_router(chatbot_router, prefix="/chat", tags=["chat"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "PrepAI Backend"}



