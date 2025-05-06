import sqlite3
import json
from typing import List, Optional
import os

class UserFileDB:
    def __init__(self, db_path: str):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_table()

    def _create_table(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_files (
                user_id TEXT PRIMARY KEY,
                file_paths TEXT
            )
        ''')
        self.conn.commit()

    def insert_user_files(self, user_id: str, file_paths: List[str]):
        json_paths = json.dumps(file_paths)
        self.cursor.execute('''
            INSERT INTO user_files (user_id, file_paths)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET file_paths=excluded.file_paths
        ''', (user_id, json_paths))
        self.conn.commit()

    def get_user_files(self, user_id: str) -> Optional[List[str]]:
        self.cursor.execute('SELECT file_paths FROM user_files WHERE user_id = ?', (user_id,))
        result = self.cursor.fetchone()
        return json.loads(result[0]) if result else None

    def delete_user(self, user_id: str):
        self.cursor.execute('DELETE FROM user_files WHERE user_id = ?', (user_id,))
        self.conn.commit()

    def close(self):
        self.conn.close()
    def delete_all_users(self):
        self.cursor.execute('DELETE FROM user_files')
        self.conn.commit()


def get_user_DB():
    return UserFileDB(os.path.join(os.path.dirname(__file__), 'db', 'user_files.db'))
# Example usage
if __name__ == '__main__':
    db = UserFileDB(os.path.join(os.path.dirname(__file__), 'db', 'user_files.db'))
    db.insert_user_files('user123', ['file1.txt', 'file2.txt'])
    db.insert_user_files('user123', ['file2.txt', 'file4.txt'])
    print(db.get_user_files('user123'))  # ['file1.txt', 'file2.txt']
    db.delete_user('user123')
    print(db.get_user_files('user123'))  # None
    db.close()
