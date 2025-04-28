from dotenv import load_dotenv
from llama_index.llms.google_genai import GoogleGenAI
import os

def read_prompt_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        print("Error reading the file. Please check the file encoding.")
        return ""

def save_prompt(file_path, content):
    print("saving prompt!")
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            print("opened file!")
            file.write(content)
        print(f"Prompt successfully saved to {file_path}")
    except Exception as e:
        print(f"Error saving the prompt: {e}")

load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
cohere_api_key = os.getenv("COHERE_API_KEY")

llm = GoogleGenAI(model="models/gemini-2.0-flash", google_api_key=google_api_key)

DEFUALT_DIRECT_LLM_PROMPT = read_prompt_file("./prompts/default/DEFUALT_DIRECT_LLM_PROMPT.txt")
DEFAULT_LLM_QUERY_TOOL_DESCRIPTION = read_prompt_file("./prompts/default/DEFAULT_LLM_QUERY_TOOL_DESCRIPTION.txt")
DEFUALT_SQL_RAG_QUERY_TOOL_DESCRIPTION = read_prompt_file("./prompts/default/DEFAULT_SQL_RAG_QUERY_TOOL_DESCRIPTION.txt")
DEFAULT_RAPTOR_QUERY_TOOL_DESCRIPTION = read_prompt_file("./prompts/default/DEFAULT_RAPTOR_QUERY_TOOL_DESCRIPTION.txt")


RETRIEVAL_METHOD="collapsed"
SIMILARITY_TOP_K=6
EMBEDDING_MODEL = "embed-multilingual-v3.0"

