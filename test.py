import chromadb
from models.user_files import get_user_DB

#clean

client = chromadb.PersistentClient(path="chroma_db")
l = client.list_collections()
for i in l:
    print(i.name)
    client.delete_collection(str(i.name))


user_db = get_user_DB()
user_db.delete_all_users()