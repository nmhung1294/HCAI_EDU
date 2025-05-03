from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Path, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from models.chat import get_chatbot_response
from fastapi.concurrency import run_in_threadpool
import os, shutil
from fastapi.responses import FileResponse

# DIR To Upload file 
UPLOAD_DIR = os.path.join("models", "uploaded_files")


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/upload_pdf/")
async def upload_pdf(user_id: str = Form(...), file: UploadFile = File(...)):
    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file PDF.")
    # Create folder for user if not exist
    user_folder = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_folder, exist_ok=True)
    file_path = os.path.join(user_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "Upload thành công", "file_path": file_path}

@app.get("/pdf/{user_path:path}")
async def pdf(user_path: str = Path(...)):
    file_path = user_path
    if ".." in file_path or file_path.startswith("/"):
        raise HTTPException(status_code=400, detail="Đường dẫn không hợp lệ")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File không tồn tại")
    return FileResponse(file_path, media_type="application/pdf")

@app.delete("/delete_pdf/")
async def delete_pdf(user_id: str = Form(...), file_path: str = Form(...)):
    # Đảm bảo file_path hợp lệ và thuộc thư mục user
    expected_dir = os.path.join(UPLOAD_DIR, user_id)
    abs_expected_dir = os.path.abspath(expected_dir)
    abs_file_path = os.path.abspath(file_path)
    if not abs_file_path.startswith(abs_expected_dir):
        raise HTTPException(status_code=400, detail="Đường dẫn file không hợp lệ hoặc không thuộc user này.")

    if not os.path.exists(abs_file_path):
        raise HTTPException(status_code=404, detail="File không tồn tại.")

    try:
        os.remove(abs_file_path)
        return {"message": "Xóa file thành công."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa file: {str(e)}")