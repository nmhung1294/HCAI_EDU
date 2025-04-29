from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from models.chat import get_chatbot_response
from fastapi.concurrency import run_in_threadpool
app = FastAPI()

# Define input and output schema
class ChatRequest(BaseModel):
    user_input: str

class ChatResponse(BaseModel):
    bot_response: str

@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(request: ChatRequest):
    user_input = request.user_input.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    last_exception = None
    for attempt in range(2):  # Try twice
        try:
            bot_response = await run_in_threadpool(get_chatbot_response, f"User: {user_input}\nBot:")
            return ChatResponse(bot_response=bot_response)
        except Exception as e:
            last_exception = e

    # If both attempts failed
    raise HTTPException(status_code=500, detail=f"Bot failed to respond: {str(last_exception)}")