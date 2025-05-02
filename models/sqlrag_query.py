from llama_index.core.query_engine import CustomQueryEngine
from llama_index.core import PromptTemplate
from llama_index.llms.google_genai import GoogleGenAI
from sqlalchemy import text, create_engine, MetaData
from sqlalchemy.schema import CreateTable
from pydantic import Field
import os


def get_tables():
    engine = get_engine()
    try:
        metadata = MetaData()
        metadata.reflect(bind=engine)

        table_names = metadata.tables.keys()

        print(f"Tables in the database: {table_names}")
        return list(table_names)
    except Exception as e:
        print(f"An error occurred while retrieving the tables: {e}")
        return []

def get_create_table_statement(table_name: str) -> str:
    try:
        engine = get_engine()
        metadata = MetaData()
        metadata.reflect(bind=engine)

        if table_name not in metadata.tables:
            raise ValueError(f"Table '{table_name}' does not exist in the database.")

        table = metadata.tables[table_name]
        create_table_stmt = str(CreateTable(table))

        return create_table_stmt
    except Exception as e:
        print(f"An error occurred while generating the CREATE TABLE statement: {e}")
        return None

def get_engine():
    db_path = os.path.join(os.path.dirname(__file__), 'db', 'database.db')
    db_uri = f'sqlite:///{db_path}'
    engine = create_engine(db_uri)
    return engine
def remove_sql_markdown(input_string: str) -> str:
    if input_string.startswith("```sql") and input_string.endswith("```"):
        return input_string[6:-3].strip()
    return input_string

def run_query(query_str):
    try:
        engine = get_engine()
        print(f"Engine created: {engine}")

        with engine.connect() as connection:
            print(f"Executing query: {query_str}")

            result = connection.execute(text(query_str))

            results = [row for row in result.fetchall()]

            print(f"Query executed successfully: {query_str}")
            print(f"Number of rows returned: {len(results)}")

            for row in results:
                print(f"Row: {row}")

            return results
    except Exception as e:
        print(f"An error occurred while running the query: {e}")
        return None

def get_sql_template(schemas_str: str):
    sql_prompt = PromptTemplate(
                    f"Context information is below.\n"
                    f"---------------------\n"
                    f"You are a professional SQL developer. You are given a task to write a SQL query to retrieve data from the database.\n"
                    f"You must ALWAYS return SQL query only and nothing else.\n"
                    f"---------------------\n"
                    f"{schemas_str}\n"
                    f"---------------------\n"
                    f"Given the database schemas and example rows, structure the SQL query from given User prompt\n"
                    f"User prompt: {{query_str}}\n"
                )
    return sql_prompt

class SQLQueryEngine(CustomQueryEngine):
    """Custom query engine for SQL queries."""

    llm: GoogleGenAI | None = Field(default=None)
    prompt: PromptTemplate

    def custom_query(self, query_str: str):

        llm_prompt = self.prompt.format(query_str=query_str)

        generated_query = self.llm.complete(llm_prompt)

        query_normalized = remove_sql_markdown(generated_query.text)

        # Run the SQL query
        result = run_query(query_normalized)

        print(f"SQL result: {result}")

        # st.session_state["generated_query.text"] = query_normalized # ???

        # answer_prompt = f"Answer the user question: {query_str} based on the result from the database query: {result}. Answer in Croatian."
        # answer = llm.complete(answer_prompt)

        return str(result)
        # return str(answer)