from llama_index.core.query_engine import CustomQueryEngine
from llama_index.llms.google_genai import GoogleGenAI
from pydantic import Field

class LlmQueryEngine(CustomQueryEngine):
    """Custom query engine for direct calls to the LLM model."""

    llm_gemini: GoogleGenAI | None = Field(default=None)
    prompt: str

    def custom_query(self, query_str: str):
        llm = self.llm_gemini
        llm_prompt = self.prompt.format(query=query_str)
        llm_response = llm.complete(llm_prompt)
        return str(llm_response)