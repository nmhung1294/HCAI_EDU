from models.config import *
import time
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import SimpleDirectoryReader
from llama_index.packs.raptor import RaptorPack
from llama_index.packs.raptor import RaptorRetriever
# from models.custom_raptor_retriever import CustomRaptorRetriever as RaptorRetriever
from llama_index.embeddings.cohere import CohereEmbedding
from llama_index.core.query_engine import RetrieverQueryEngine
import pandas as pd



import chromadb

class RAPTOR:
    def __init__(self, files, collection_name="edubot_raptor", force_rebuild=False):
        self.files = files
        self.collection_name = collection_name
        # Set up logging
        print("Initializing RAPTOR with collection_name: %s", collection_name)

        # start_time = time.time()

        try:
            self.client = chromadb.PersistentClient(path="chroma_db")

            if force_rebuild:
                print("Force rebuilding collection...")
                self.client.delete_collection(collection_name)

            self.collection = self.client.get_or_create_collection(collection_name)

            self.vector_store = ChromaVectorStore(chroma_collection=self.collection)

            print("Loading provided documents...")
            self.documents = SimpleDirectoryReader(input_files=files).load_data()

            if force_rebuild or len(os.listdir("chroma_db")) == 1:
                self.retriever = self.build_raptor_tree()

            self.retriever = self.setup_retriever()
            self.query_engine = self.setup_query_engine()
        except Exception as e:
            print("An error occurred during initialization: %s", e)
            raise

        # end_time = time.time()
        # setup_duration = end_time - start_time
        # print("RAPTOR setup completed in %s seconds", setup_duration)

    def build_raptor_tree(self):
        try:
            print("Creating RaptorPack and building raptor tree...")
            raptor_pack = RaptorPack(
                self.documents,
                embed_model=CohereEmbedding(
                    model_name=EMBEDDING_MODEL,
                    api_key=cohere_api_key
                ),  # Explicitly passing the API key
                llm=llm,
                vector_store=self.vector_store,
                similarity_top_k=SIMILARITY_TOP_K,
                mode=RETRIEVAL_METHOD,
            )
            modules = raptor_pack.get_modules()
            return modules["retriever"]
        except Exception as e:
            print("An error occurred while building raptor tree: %s", e)
            raise

    def setup_retriever(self):
        try:
            print("Setting up RaptorRetriever")
            return RaptorRetriever(
                [],
                embed_model=CohereEmbedding(
                    model_name=EMBEDDING_MODEL,
                    api_key=cohere_api_key
                ),  # Explicitly passing the API key
                llm=llm,
                vector_store=self.vector_store,
                similarity_top_k=SIMILARITY_TOP_K,
                mode=RETRIEVAL_METHOD,
            )
        except Exception as e:
            print("An error occurred while setting up RaptorRetriever: %s", e)
            raise

    def setup_query_engine(self):
        try:
            print("Setting up RetrieverQueryEngine")
            return RetrieverQueryEngine.from_args(
                self.retriever, llm=llm,
                streaming=True
            )
        except Exception as e:
            print("An error occurred while setting up RetrieverQueryEngine: %s", e)
            raise

UPLOAD_DIR = "models/uploaded_files"
STATE_FILE = "models/file_state.csv"

def get_files():
    df = pd.read_csv(STATE_FILE)
    used_files_df = df[df['is_used'] == True]
    used_files = used_files_df['file_name'].tolist()
    full_paths = [os.path.join(UPLOAD_DIR, file) for file in used_files]
    print("full_paths", full_paths)
    return full_paths


def get_raptor(files, force_rebuild=False):
    velociraptor = RAPTOR(files=files, collection_name="edubot_raptor", force_rebuild=force_rebuild)
    return velociraptor