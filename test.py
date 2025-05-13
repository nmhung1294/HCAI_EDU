import chromadb
from models.user_files import get_user_DB

#clean

client = chromadb.PersistentClient(path="chroma_db")
client.delete_collection('IuLAyPWiZwV4unB2TdXqvXpyXup1')

user_db = get_user_DB()
user_db.delete_all_users()