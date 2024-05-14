import mysql.connector
from fastapi import Depends, Form
from typing import Annotated
import json
from dotenv import load_dotenv
import os

load_dotenv()

# 資料庫連接設定
# .env通常儲存key=value pair，如果想儲存整個字典需先轉換成字串
database_config_str = os.getenv("DATABASE_CONFIG")
database_config = json.loads(database_config_str)


# 連接資料庫
def get_db():
    try:
        db = mysql.connector.connect(**database_config)
        print("資料庫連線成功")
        return db
    except Exception as e:
        print(f"資料庫連線發生錯誤: {e}")


# Dependency: 獲取資料庫連接
db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


# 執行資料庫查詢(只查一筆)
def execute_query(db: db_depend, query: str, param: tuple = None):
    try:
        with db.cursor(buffered=True) as cursor:
            cursor.execute(query, param)
            result = cursor.fetchone()
            print("查詢資料庫成功")
            return result
    except Exception as e:
        raise e


# 執行資料庫查詢(查全部)
def execute_query_all(db: db_depend, query: str, param: tuple = None):
    try:
        with db.cursor(buffered=True) as cursor:
            cursor.execute(query, param)
            result = cursor.fetchall()
            print("查詢資料庫成功")
            return result
    except Exception as e:
        raise e


# 執行資料庫新增/修改/刪除
def execute_command(db: db_depend, query: str, param: tuple = None):
    try:
        with db.cursor(buffered=True) as cursor:
            cursor.execute(query, param)
            db.commit()
            print("新增/刪除資料成功")
    except Exception as e:
        # 如果操作失敗，回到操作前的狀態
        db.rollback()
        raise e


# 查詢與該 message_id 對應的 member_id 是不是目前的使用者
def check_message_arthur(db: db_depend, message_id: int):
    sql_check = "SELECT member_id FROM message WHERE id = %s"
    result = execute_query(db, sql_check, (message_id,))
    return result


# 更新留言
def update_current_message(db: db_depend, content: str, message_id: int):
    sql_delete = "UPDATE message SET content = %s WHERE id = %s"
    execute_command(db, sql_delete, (content, message_id,))


# 刪除留言
def delete_current_message(db: db_depend, message_id: int):
    sql_delete = "DELETE FROM message WHERE id = %s"
    execute_command(db, sql_delete, (message_id,))


# 新增留言
def create_new_message(member_id: int, db: db_depend, content: str = Form(), ):
    sql_create = """
    INSERT INTO message (member_id, content)
    VALUES (%s, %s)
    """
    execute_command(db, sql_create, (member_id, content,))


# 更新用戶名字
def update_user_name(db: db_depend, name: str, user_id: int):
    sql_update = "UPDATE member SET name = %s WHERE id = %s"
    execute_command(db, sql_update, (name, user_id, ))


# 檢查用戶是否存在，並獲取查詢結果
def get_user_data(db: db_depend, username: str):
    sql_check = "SELECT * FROM member WHERE username = %s"
    result = execute_query(db, sql_check, (username,))
    return result


# 將用戶資訊與加密過的密碼新增進資料庫
def add_new_member(db: db_depend, name: str, username: str, hashed_password: str):
    sql_create = "INSERT INTO member (name, username, password) VALUES (%s, %s, %s)"
    execute_command(db, sql_create, (name, username, hashed_password,))


# 獲取 message資料
def get_all_message(db: db_depend):
    sql_check = """
    SELECT m.name, msg.content, msg.id, msg.member_id, msg.time
    FROM member m
    JOIN message msg ON m.id = msg.member_id
    ORDER BY msg.time DESC
    """
    result = execute_query_all(db, sql_check)
    return result
