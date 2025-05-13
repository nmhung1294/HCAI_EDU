from llama_index.core.query_engine import CustomQueryEngine
from llama_index.core import PromptTemplate
from llama_index.llms.google_genai import GoogleGenAI
from pydantic import Field
from freedictionaryapi.clients.sync_client import DictionaryApiClient
import ast
import traceback


def meaning_of_words(words):
    meanings = ""
    try:
        with DictionaryApiClient() as client:
            for word in words:
                    parser = client.fetch_parser(word)
                    meaning = {
                        'Definitions': [v for v in parser.get_all_definitions() if v],
                        'Synonyms': [v for v in parser.get_all_synonyms() if v],
                        'Examples': [v for v in parser.get_all_examples() if v],
                    }

                    parts = []
                    for key, values in meaning.items():
                        value_str = '; '.join(values) if values else 'None'
                        parts.append(f"{key}: {value_str}")

                    final_str = f"Word: {parser.word.word} | " + ' | '.join(parts)
                    meanings += final_str + "\n"
    except Exception as e:
        print(traceback.format_exc())
    return meanings


def get_prompt_template():
    dictionary_prompt = PromptTemplate(
        "Context information is below.\n"
        "---------------------\n"
        "You are a dictionary assistant. You are given a user prompt, and your task is to identify the word or phrase the user wants to know about.\n"
        "The user's prompt may ask for the definition, meaning, usage, or example of a word or multiple words.\n"
        "If the user makes a minor spelling mistake or typo, you should infer the most likely intended word(s) and extract them correctly.\n"
        "You must ONLY return a Python-style list of strings that contains the corrected word(s) or phrase(s) the user is asking about.\n"
        "The output must be in the format: [\"word1\", \"word2\", ...]\n"
        "Do NOT include any explanation or additional text — just the list.\n"
        "---------------------\n"
        "User prompt: {query_str}\n"
    )
    return dictionary_prompt


def parse_word_list(output_str: str) -> list[str]:
    try:
        return ast.literal_eval(output_str.strip())
    except (SyntaxError, ValueError):
        print(traceback.format_exc())
        return []


class DictionaryQueryEngine(CustomQueryEngine):
    """Custom query engine for SQL queries."""

    llm: GoogleGenAI | None = Field(default=None)

    def custom_query(self, query_str: str): #That is user question ?
        prompt = get_prompt_template()
        llm_prompt = prompt.format(query_str=query_str)

        generated_query = self.llm.complete(llm_prompt)

        print(f"Generated query: {generated_query}")
        word_list = parse_word_list(str(generated_query))

        print(f"Word list: {word_list}")

        result = meaning_of_words(word_list)
        print(f"Result: {result}")

        return str(result)

# if __name__ == "__main__":
#     wordlist = ast.literal_eval('["Cumulative"]')
#     print(type(wordlist))
#     for word in wordlist:
#         print(word)
#     # words = ['Cumulative', 'Dog', 'Cat']
#     # result = meaning_of_words(words)
#     # print(result)