from llama_index.core.tools import QueryEngineTool
from llama_index.core.selectors import LLMSingleSelector
from llama_index.core.query_engine import RouterQueryEngine

from sqlrag_query import SQLQueryEngine, get_sql_template,get_create_table_statement, get_tables
from llm_query import LlmQueryEngine
from models.config import *


# Create query engine
# llm
llm_query_engine = LlmQueryEngine(llm_gemini=llm, prompt=DEFUALT_DIRECT_LLM_PROMPT)

#sql rag
table_schemas = []
for table in get_tables():
    table_schemas.append(get_create_table_statement(table))
schemas_str = "\n".join(table_schemas) #get table schema.
sql_prompt = get_sql_template(schemas_str)
sql_query_engine = SQLQueryEngine(prompt=sql_prompt, llm=llm)

llm_tool = QueryEngineTool.from_defaults(
    query_engine=llm_query_engine,
    name="llm_query_tool",
    description=DEFAULT_LLM_QUERY_TOOL_DESCRIPTION,
)

sql_rag_tool = QueryEngineTool.from_defaults(
    query_engine=sql_query_engine,
    name="sql_rag_tool",
    description=DEFUALT_SQL_RAG_QUERY_TOOL_DESCRIPTION
)


router_query_engine = RouterQueryEngine(
    selector=LLMSingleSelector.from_defaults(llm=llm),
    query_engine_tools=[llm_tool, sql_rag_tool],
    llm=llm
)

def get_chatbot_response(user_prompt: str) -> str:
    """Generate a chatbot response based on the conversation context."""
    response = router_query_engine.query(user_prompt)
    intent = response.metadata["selector_result"].selections[0]
    if intent.index == 1:
        print("SQL RAG INTENT")
        tailored_response = llm.complete(
            f"***Instructions for answering the user query:***\n"
            f"Always make sure to answer in Vietnamese language.\n"
            f"Based on user query and result SQL query result. Answer the user question directly to user.\n"
            f"User has asked the following question:\n"
            f"<LATEST USER QUERY>\n"
                f"{user_prompt} \n"
                f"<LATEST USER QUERY END>\n"
            f"Here is the result of the SQL query:\n"
            f""""
                <SQL QUERY RESULT START>
                {response}
                <SQL QUERY RESULT END>
            """
        )
        return tailored_response
    return str(response)