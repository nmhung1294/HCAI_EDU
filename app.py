from fastapi import FastAPI, HTTPException, File, Form, UploadFile, Path, Body
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from models.chat import get_chatbot_response
import os, shutil, json, re
from fastapi.responses import FileResponse
from typing import List, Dict
from models.user_files import get_user_DB
from models.raptor_query import RAPTOR, get_files_user
from models.config import get_llm
from llama_index.llms.google_genai import GoogleGenAI
from models.web_scraper_query_engine import WebScraperQueryEngine
import random
from datetime import datetime

# Import from exercise_utils
from models.exercise_utils import (
    extract_vocabulary,
    generate_fill_in_blank_question,
    generate_story_gap_exercise,
    save_exercise_history,
    get_exercise_history,
    check_answers,
    generate_practice_questions,
    generate_random_questions
)

# DIR To Upload file 
UPLOAD_DIR = os.path.join("models", "uploaded_files")
EXERCISE_HISTORY_DIR = os.path.join("models", "exercise_history")

# Create exercise history directory if it doesn't exist
os.makedirs(EXERCISE_HISTORY_DIR, exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mô hình dữ liệu cho request
class QueryRequest(BaseModel):
    query: str
    custom_url: str | None = None
    user_id: str | None = None

class CheckAnswersRequest(BaseModel):
    answers: Dict[str, str]
    exercise_id: str
    user_id: str

class SaveExerciseRequest(BaseModel):
    exercise_id: str
    user_id: str
    vocabulary: List[str]
    questions: List[dict]
    story_gap: dict

class PracticeQuestionRequest(BaseModel):
    vocabulary: List[str]
    type: str = "fill_in_blank"

class RandomQuestionRequest(BaseModel):
    count: int = 5

# Khởi tạo LLM và Query Engine
llm = GoogleGenAI(api_key=os.getenv("GOOGLE_API_KEY"))
query_engine = WebScraperQueryEngine(llm=llm)

# Story templates
STORY_TEMPLATES = [
    """
    The Research Project

    In a {word1} laboratory, Dr. Sarah {word2} her team's findings. The project had {word3} many challenges, but their {word4} never wavered. After months of {word5} work, they finally {word6} a breakthrough. Their research {word7} the way we understand {word8}, and the results were truly {word9}. The team's ability to {word10} complex data was key to their success.
    """,
    """
    The Business Innovation

    The startup company {word1} a new approach to {word2} market trends. Their team {word3} various strategies before {word4} the perfect solution. The CEO's {word5} vision {word6} the company's success. They {word7} their findings in a way that {word8} the industry. The project's {word9} impact {word10} their reputation in the market.
    """,
    """
    The Environmental Initiative

    The environmental group {word1} to {word2} the effects of climate change. They {word3} data from multiple sources to {word4} their findings. The team's {word5} approach {word6} significant results. Their work {word7} the community's understanding of {word8}, and the project's {word9} success {word10} their commitment to the cause.
    """,
    """
    The Educational Journey

    The student {word1} to {word2} the complex subject matter. Through {word3} study and {word4} practice, they {word5} their understanding. The teacher's {word6} guidance {word7} the learning process. Their {word8} efforts {word9} in academic success, and the experience {word10} their future career path.
    """,
    """
    The Cultural Exchange

    The international program {word1} to {word2} cultural understanding. Participants {word3} their experiences while {word4} new perspectives. The program's {word5} activities {word6} meaningful connections. Their {word7} approach {word8} the way people view {word9}, and the impact {word10} lasting relationships.
    """
]

def generate_fill_in_blank_question(word: str) -> dict:
    """Generate a fill-in-the-blank question for a given word."""
    # Dictionary of word definitions and example sentences
    word_contexts = {
        "implement": {
            "definition": "to put a plan or system into operation",
            "examples": [
                "The company plans to _____ the new software next month.",
                "We need to _____ these changes carefully.",
                "The government will _____ the new policy in January."
            ]
        },
        "analyze": {
            "definition": "to examine something in detail",
            "examples": [
                "Scientists will _____ the data from the experiment.",
                "Let's _____ the results of the survey.",
                "The team needs to _____ the market trends."
            ]
        },
        "evaluate": {
            "definition": "to assess or judge something",
            "examples": [
                "Teachers must _____ students' performance.",
                "We need to _____ the effectiveness of the program.",
                "The committee will _____ all applications."
            ]
        },
        "synthesize": {
            "definition": "to combine different elements into a whole",
            "examples": [
                "The research aims to _____ information from various sources.",
                "Students must _____ the key points in their essays.",
                "The report will _____ findings from multiple studies."
            ]
        },
        "demonstrate": {
            "definition": "to show or prove something",
            "examples": [
                "The experiment will _____ the theory.",
                "Please _____ how to use the new software.",
                "The results _____ the effectiveness of the treatment."
            ]
        }
    }

    # Get context for the word or use default
    context = word_contexts.get(word.lower(), {
        "definition": "to use or apply something",
        "examples": [
            f"The team will _____ the new strategy.",
            f"We need to _____ this approach carefully.",
            f"The project will _____ these changes."
        ]
    })

    # Generate question with definition and example
    question = {
        "text": f"Word: {word}\nDefinition: {context['definition']}\n\nComplete the sentence:\n{random.choice(context['examples'])}",
        "options": [word, f"not_{word}", f"anti_{word}", f"pre_{word}"],
        "correct_answer": word,
        "explanation": f"The word '{word}' means {context['definition']}. In this context, it is the most appropriate choice to complete the sentence."
    }
    return question

def generate_story_gap_exercise(vocabulary: List[str]) -> dict:
    """Generate a story with gaps for vocabulary practice."""
    # Select a random story template
    story_template = random.choice(STORY_TEMPLATES)
    
    # Fill in the story with the vocabulary
    story = story_template
    for i, word in enumerate(vocabulary, 1):
        story = story.replace(f"{{word{i}}}", f"_____")
    
    # Create hints for each gap
    hints = []
    for word in vocabulary:
        if word.endswith('ing'):
            hints.append(f"Verb in present continuous form")
        elif word.endswith('ed'):
            hints.append(f"Verb in past tense")
        elif word.endswith('s'):
            hints.append(f"Noun in plural form or verb in third person")
        else:
            hints.append(f"Word related to {word}")
    
    return {
        "story": story,
        "gaps": vocabulary,
        "hints": hints,
        "correct_answers": vocabulary,
        "title": "Complete the Story",
        "instructions": "Fill in the blanks with the appropriate words from the vocabulary list. Pay attention to the context and grammar of each sentence."
    }

@app.post("/generate_practice")
async def generate_practice_questions_endpoint(request: PracticeQuestionRequest):
    """Generate practice questions based on vocabulary."""
    return generate_practice_questions(request.vocabulary, request.type)

@app.post("/generate_random_questions")
async def generate_random_questions_endpoint(request: RandomQuestionRequest):
    """Generate random practice questions."""
    return generate_random_questions(request.count)

@app.post("/query", response_model=dict)
async def query_ielts_vocabulary(request: QueryRequest):
    """Query IELTS vocabulary based on a user question."""
    try:
        result = query_engine.custom_query(request.query, request.custom_url)
        
        # Extract vocabulary from the response
        vocabulary = extract_vocabulary(result.get("response", ""))
        
        if vocabulary:
            # Generate practice questions
            fill_in_blank_questions = [generate_fill_in_blank_question(word) for word in vocabulary]
            
            # Generate story gap exercise
            story_gap = generate_story_gap_exercise(vocabulary)
            
            # Create exercise ID
            exercise_id = f"ex_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Add practice exercises to the response
            result["practice_exercises"] = {
                "exercise_id": exercise_id,
                "fill_in_blank": fill_in_blank_questions,
                "story_gap": story_gap
            }
            
            # Save exercise if user_id is provided
            if request.user_id:
                save_exercise_history(request.user_id, {
                    "exercise_id": exercise_id,
                    "vocabulary": vocabulary,
                    "questions": fill_in_blank_questions,
                    "story_gap": story_gap,
                    "query": request.query
                })
            
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/check_answers")
async def check_answers_endpoint(request: CheckAnswersRequest):
    """Check user's answers for an exercise."""
    try:
        return check_answers(request.user_id, request.exercise_id, request.answers)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/exercise_history/{user_id}")
async def get_exercise_history_endpoint(user_id: str):
    """Get user's exercise history."""
    try:
        history = get_exercise_history(user_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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