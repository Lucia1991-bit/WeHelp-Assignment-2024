import mysql.connector
from fastapi import FastAPI, Request, Form, Depends, status, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Annotated
from starlette.middleware.sessions import SessionMiddleware
import bcrypt
import json

# 創建 FastAPI 物件
app = FastAPI()

# 導入 HTML及 CSS
# 設置模板引擎
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 啟用 session功能
app.add_middleware(SessionMiddleware, secret_key="this_secret_key")

# 資料庫連接設定
config = {
    'user': 'root',
    'password': 'root1234',
    'host': 'localhost',
    'database': 'NewWebsite'
}


# Dependency: 獲取資料庫連接
def get_db():
    try:
        db = mysql.connector.connect(**config)
        print("資料庫連線成功")
        return db
    except Exception as e:
        print(f"資料庫連接發生錯誤: {e}")


db_depend = Annotated[mysql.connector.MySQLConnection, Depends(get_db)]


# 使用者頭像圖片路徑
image_urls = [
    "/static/image/image-01.png",
    "/static/image/image-02.png",
    "/static/image/image-03.png",
    "/static/image/image-04.png",
    "/static/image/image-05.png",
    "/static/image/image-06.png",
    "/static/image/image-07.png",
    "/static/image/image-08.png"
]

# 傳到前端前先轉成JSON檔，不然很難處理
json_image_urls = json.dumps(image_urls)


# 設定首頁
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# 註冊頁面
@app.post("/signup")
async def signup(request: Request, db: db_depend, name: str = Form(), username: str = Form(), password: str = Form()):

    # 從資料庫檢查username是否已被註冊
    try:
        with db.cursor() as cursor:
            sql_check = "SELECT * FROM member WHERE username = %s"
            cursor.execute(sql_check, (username,))
            result = cursor.fetchone()
            # 如果 username 已被註冊，導向錯誤頁面
            if result:
                error_message = "Account has been Registered"
                return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

            # 將密碼進行加密
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)

            # 如果 username 不存在，將資料新增進資料庫，並導向首頁
            sql_insert = "INSERT INTO member (name, username, password) VALUES (%s, %s, %s)"
            cursor.execute(sql_insert, (name, username, hashed_password))
            db.commit()
            return RedirectResponse(url="/", status_code=303)

    except Exception as e:
        print(f"查詢資料發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 登錄頁面
@app.post("/signin")
async def signin(request: Request, db: db_depend, username: str = Form(), password: str = Form()):
    # 從資料庫檢查 username 及 password
    try:
        with db.cursor() as cursor:
            sql_check = "SELECT * FROM member WHERE username = %s"
            cursor.execute(sql_check, (username,))
            result = cursor.fetchone()
            # 若 username不存在，導向錯誤頁面
            if not result:
                error_message = "Invalid username or password"
                return RedirectResponse(url=f"/error?message={error_message}", status_code=303)
            # 檢查 password
            stroed_password = result[3]
            is_correct_password = bcrypt.checkpw(
                password.encode('utf-8'), stroed_password.encode('utf-8'))

            # 若 username不存在 或 password錯誤，導向錯誤頁面
            if not is_correct_password:
                error_message = "Invalid password"
                return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

            # 登錄成功，將資料新增進 user state 並導向 member頁面
            request.session['authenticated'] = True
            request.session["member_id"] = result[0]
            request.session["name"] = result[1]
            request.session["username"] = result[2]
            return RedirectResponse(url="/member", status_code=303)

    except Exception as e:
        print(f"查詢資料發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 錯誤頁面
@app.get("/error")
async def error(request: Request, message: str = None):
    return templates.TemplateResponse("error.html", {"request": request, "error_message": message})


# 登出頁面
@app.get("/signout")
async def signout(request: Request):
    request.session.pop("authenticated", None)
    request.session.pop("id", None)
    request.session.pop("name", None)
    request.session.pop("username", None)
    return RedirectResponse(url="/", status_code=302)


# 會員頁面
@app.get("/member")
async def member(request: Request, db: db_depend):
    if request.session.get("authenticated"):
        current_user = request.session["name"]
        member_id = request.session["member_id"]
        try:
            with db.cursor() as cursor:
                sql_check = """
                SELECT m.name, msg.content, msg.id, msg.member_id, msg.time
                FROM member m
                JOIN message msg ON m.id = msg.member_id
                ORDER BY msg.time DESC
                """
                cursor.execute(sql_check)
                result = cursor.fetchall()  # 回傳值為 tuple list
                print(result)
                # 整理獲取的 message資料
                messages = []
                for message_row in result:
                    message = {
                        "name": message_row[0],
                        "content": message_row[1],
                        "id": message_row[2],
                        "member_id": message_row[3],
                        # 格式化時間
                        "time": message_row[4].strftime('%Y-%m-%d %H:%M:%S'),
                    }
                    messages.append(message)

            return templates.TemplateResponse("member.html", {"request": request,
                                                              "current_user": current_user,
                                                              "member_id": member_id,
                                                              "image_urls": json_image_urls,
                                                              "messages": messages})  # 要記得傳入需要的session資訊
        except Exception as e:
            print(f"查詢資料發生錯誤: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            if db.is_connected():
                db.close()
                print("資料庫已關閉")
    else:
        return RedirectResponse(url="/", status_code=302)


# 會員留言頁面
@app.post("/createMessage")
async def create_message(request: Request, db: db_depend, content: str = Form()):
    if request.session.get("authenticated"):
        member_id = request.session["member_id"]
        try:
            with db.cursor() as cursor:
                sql_check = """
                INSERT INTO message (member_id, content)
                VALUES (%s, %s)                           
                """
                cursor.execute(sql_check, (member_id, content))
                db.commit()
                return RedirectResponse(url="/member", status_code=303)
        except Exception as e:
            print(f"查詢資料發生錯誤: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            if db.is_connected():
                db.close()
                print("資料庫已關閉")
    else:
        return RedirectResponse(url="/", status_code=303)


# 會員刪除留言頁面
@app.post("/deleteMessage")
async def delete_message(request: Request, db: db_depend, message_id_str: str = Form()):
    if request.session.get("authenticated"):
        # 轉換成 integer
        message_id = int(message_id_str)
        try:

            with db.cursor() as cursor:
                sql_deltete = "DELETE FROM message WHERE id = %s"
                cursor.execute(sql_deltete, (message_id,))
                db.commit()

                return RedirectResponse(url="/member", status_code=303)

        except Exception as e:
            print(f"查詢資料發生錯誤: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        finally:
            if db.is_connected():
                db.close()
                print("資料庫已關閉")

    else:
        return RedirectResponse(url="/", status_code=303)
