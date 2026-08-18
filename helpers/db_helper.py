import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()


class DbHelper:
    def __init__(self):
        self.host = os.getenv("SQL_HOST")
        self.user = os.getenv("SQL_USER")
        self.password = os.getenv("SQL_PASSWORD")
        self.database = os.getenv("SQL_DB_NAME")
        self.port = os.getenv("SQL_DB_PORT")

    def execute_query(self, query: str, params: tuple = None):
        conn = None
        try:
            conn = psycopg2.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
                raise RuntimeError(
                    f'[DB Error] ошибка выоплнения запроса: {e}')
        finally:
            if conn:
                conn.close()

    def fetch_one(self, query: str, params: tuple = None):
        try:
            conn = psycopg2.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchone()
        except Exception as e:
            raise RuntimeError(f"[DB Error] ошибка получения данных: {e}")
        finally:
            if conn:
                conn.close()
