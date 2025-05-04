import chromadb

client = chromadb.PersistentClient(path="chroma_db")
client.delete_collection('IuLAyPWiZwV4unB2TdXqvXpyXup1')
