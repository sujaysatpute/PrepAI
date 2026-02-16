# Put secret keys here or use environment variables.
#OPENAI_API_KEY = ""  # set your OpenAI key or keep empty for mock responses
from dotenv import load_dotenv
import os

load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")

print("OpenAI Key Loaded:", bool(openai_key))
