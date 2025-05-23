from llama_index.core.tools import QueryEngineTool
from llama_index.core.selectors import LLMSingleSelector
from llama_index.core.query_engine import RouterQueryEngine

from models.sqlrag_query import SQLQueryEngine, get_sql_template,get_create_table_statement, get_tables
from models.llm_query import LlmQueryEngine
from models.config import *
from models.raptor_query import get_raptor, get_files, RAPTOR, get_files_user
from models.web_scraper_query_engine import WebScraperQueryEngine

from models.user_files import get_user_DB
from models.dictionary_query import DictionaryQueryEngine


def init_tool():
    # Create query engine
    # llm
    llm = get_llm()
    llm_query_engine = LlmQueryEngine(llm_gemini=llm, prompt=DEFUALT_DIRECT_LLM_PROMPT)

    #sql rag
    table_schemas = []
    for table in get_tables():
        table_schemas.append(get_create_table_statement(table))
    schemas_str = "\n".join(table_schemas) #get table schema.
    sql_prompt = get_sql_template(schemas_str)
    sql_query_engine = SQLQueryEngine(prompt=sql_prompt, llm=llm)

    # #RAPTOR
    # velociraptor = get_raptor(files=get_files(), force_rebuild=False)
    # raptor_query_engine = velociraptor.query_engine

    #LLM tool
    llm_tool = QueryEngineTool.from_defaults(
        query_engine=llm_query_engine,
        name="llm_query_tool",
        description=DEFAULT_LLM_QUERY_TOOL_DESCRIPTION,
    )

    #SQL RAG tool
    sql_rag_tool = QueryEngineTool.from_defaults(
        query_engine=sql_query_engine,
        name="sql_rag_tool",
        description=DEFUALT_SQL_RAG_QUERY_TOOL_DESCRIPTION
    )

    # #RAPTOR tool
    # raptor_tool = QueryEngineTool.from_defaults(
    #     query_engine=raptor_query_engine,
    #     name="raptor_query_engine",
    #     description=DEFAULT_RAPTOR_QUERY_TOOL_DESCRIPTION
    # )

    #Web scraper tool
    web_scraper_engine = WebScraperQueryEngine(llm=llm)
    web_scraper_tool = QueryEngineTool.from_defaults(
        query_engine=web_scraper_engine,
        name="web_scraper_tool",
        description=DEFAULT_WEB_SCRAPER_QUERY_TOOL_DESCRIPTION
    )

    dictionary_engine = DictionaryQueryEngine(llm=llm)
    dictionary_tool = QueryEngineTool.from_defaults(
        query_engine=dictionary_engine,
        name='dictionary_tool',
        description=DEFAULT_DICTIONARY_QUERY_TOOL_DESCRIPTION
    )

    return llm_tool, sql_rag_tool, web_scraper_tool, dictionary_tool

def init_raptor_tool():
    #RAPTOR
    velociraptor = get_raptor(files=get_files(),llm=get_llm(), force_rebuild=False)
    raptor_query_engine = velociraptor.query_engine

    #RAPTOR tool
    raptor_tool = QueryEngineTool.from_defaults(
        query_engine=raptor_query_engine,
        name="raptor_query_engine",
        description=DEFAULT_RAPTOR_QUERY_TOOL_DESCRIPTION
    )
    return raptor_tool

def init_custom_raptor_tool(user_id):
    # Get current files (from filesystem)
    # cur_file_paths = os.listdir(os.path.join("models", "uploaded_files", user_id)) or []

    custom_velociraptor = RAPTOR(
        # files=get_files_user(user_id, cur_file_paths),
        files=[],
        collection_name=user_id,
        llm=get_llm(),
        force_rebuild=False
    )
    return custom_velociraptor.query_engine


llm_tool, sql_rag_tool, web_scraper_tool, dictionary_tool = init_tool()

def get_chatbot_response(user_prompt: str) -> str:
    """Generate a chatbot response based on the conversation context."""


    # raptor_tool = init_raptor_tool()
    router_query_engine = RouterQueryEngine(
        selector=LLMSingleSelector.from_defaults(llm=llm),
        query_engine_tools=[llm_tool,
                            sql_rag_tool,
                            dictionary_tool,
                            web_scraper_tool],
        llm=llm
    )
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
        return str(tailored_response)
    elif intent.index == 2:
        print("DICTIONARY INTENT")
        print(response)
        tailored_response = llm.complete(
            f"***Instructions for answering the user query:***\n"
            f"Always make sure to answer in Vietnamese language, but do not translate the code snippets nor IT terms.\n"
            f"You are a good professor and know how to explain things well to students of different levels. Student is asking you the following question:\n"
            f"<LATEST USER QUERY>\n"
            f"{user_prompt} \n"
            f"<LATEST USER QUERY END>\n"
            f"Answer the student directly.\n"
            f"Use the following knowledge to answer the question:\n"
            f"""
            <KNOWLEDGE START>
            {response}
            <KNOWLEDGE END>
            """
        )
        return str(tailored_response)
    elif intent.index == 3:
        print("WEB SCRAPER INTENT")
        print(response)
        tailored_response = llm.complete(
            f"***Instructions for answering the user query:***\n"
            f"Always make sure to answer in Vietnamese language.\n"
            f"Your task is to present the user with the latest news from the website. Here are the news:\n"
            f""""
                <NEWS START>
                {response}
                <NEWS END>
            """
        )
        return str(tailored_response)
    print('Direct LLM')
    return str(response)


def get_chatbot_response_from_file(user_prompt: str, user_id: str, file_paths: list) -> str:
    # Only RAPTOR tools.
    query_engine = init_custom_raptor_tool(user_id)


    response = query_engine.query(user_prompt)
    print(response)
    print("_" * 20)
    tailored_response = llm.complete(
        f"***Instructions for answering the user query:***\n"
        f"Always make sure to answer in Vietnamese language, but do not translate the code snippets nor IT terms.\n"
        f"You are a good professor and know how to explain things well to students of different levels. Student is asking you the following question:\n"
        f"<LATEST USER QUERY>\n"
        f"{user_prompt} \n"
        f"<LATEST USER QUERY END>\n"
        f"Answer the student directly.\n"
        f"Use the following knowledge to answer the question:\n"
        f"""
        <KNOWLEDGE START>
        {response}
        <KNOWLEDGE END>
        """
    )
    return str(tailored_response)
