from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Path, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from models.chat import get_chatbot_response
from fastapi.concurrency import run_in_threadpool
import os, shutil
from fastapi.responses import FileResponse
from typing import List
from models.user_files import get_user_DB
from models.raptor_query import RAPTOR, get_files_user
# DIR To Upload file 
UPLOAD_DIR = os.path.join("models", "uploaded_files")
from models.config import get_llm


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
def chat_with_bot(request: ChatRequest):
    user_input = request.user_input.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    bot_response = get_chatbot_response(f"User: {user_input}\nBot:")
    return ChatResponse(bot_response=bot_response)

class ChatWithFileRequest(BaseModel):
    user_input: str
    user_id: str
    file_path: List[str]

@app.post("/chat_with_file", response_model=ChatResponse)
def chat_with_file(request: ChatWithFileRequest):
    user_input = request.user_input.strip()
    file_paths = [fp.strip() for fp in request.file_path]
    user_id = request.user_id.strip()

    if not user_input:
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    from models.chat import get_chatbot_response_from_file
    bot_response = get_chatbot_response_from_file(user_input, user_id, file_paths)
    return ChatResponse(bot_response=bot_response)


@app.post("/upload_pdf/")
def upload_pdf(user_id: str = Form(...), file: UploadFile = File(...)):
    # Check file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chỉ chấp nhận file PDF.")
    # Create folder for user if not exist
    user_folder = os.path.join(UPLOAD_DIR, user_id)
    os.makedirs(user_folder, exist_ok=True)
    file_path = os.path.join(user_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cur_file_paths = os.listdir(os.path.join("models", "uploaded_files", user_id)) or []

    custom_velociraptor = RAPTOR(
        files=get_files_user(user_id, cur_file_paths),
        collection_name=user_id,
        llm=get_llm(),
        force_rebuild=True
    )

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