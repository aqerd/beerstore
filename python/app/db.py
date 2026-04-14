import os
from contextlib import contextmanager

import psycopg2
from psycopg2.extras import RealDictCursor


def get_db_url() -> str:
    return os.getenv('DB_URL', 'postgresql://postgres:postgres@localhost:5432/golden_liquid')


@contextmanager
def get_conn(autocommit: bool = False):
    conn = psycopg2.connect(get_db_url(), cursor_factory=RealDictCursor)
    conn.autocommit = autocommit
    try:
        yield conn
    finally:
        conn.close()
