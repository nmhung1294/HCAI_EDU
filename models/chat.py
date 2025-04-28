from llama_index.core.tools import QueryEngineTool
from llama_index.core.selectors import LLMSingleSelector
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.core.query_engine import CustomQueryEngine
from pydantic import Field
from models.config import *
from dotenv import load_dotenv

import os

# Load environment variables
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")

# Initialize LLM
llm = GoogleGenAI(model="models/gemini-2.0-flash", google_api_key=google_api_key)

class LlmQueryEngine(CustomQueryEngine):
    """Custom query engine for direct calls to the LLM model."""
    llm_gemini: GoogleGenAI | None = Field(default=None)
    prompt: str

    def custom_query(self, query_str: str):
        llm = self.llm_gemini
        llm_prompt = self.prompt.format(query=query_str)
        llm_response = llm.complete(llm_prompt)
        return str(llm_response)

# Create query engine
llm_query_engine = LlmQueryEngine(llm_gemini=llm, prompt=DEFUALT_DIRECT_LLM_PROMPT)

llm_tool = QueryEngineTool.from_defaults(
    query_engine=llm_query_engine,
    name="llm_query_tool",
    description=DEFAULT_LLM_QUERY_TOOL_DESCRIPTION,
)

router_query_engine = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(llm=llm),
    query_engine_tools=[llm_tool],
    llm=llm
)

def get_chatbot_response(conversation_context: str) -> str:
    """Generate a chatbot response based on the conversation context."""
    response = router_query_engine.query(conversation_context)
    return str(response)