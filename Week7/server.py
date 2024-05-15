from fastapi import FastAPI, Request, Query, Form, Depends, HTTPException, Body
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from database import db_depend, get_user_data, add_new_member, get_all_message, update_user_name, create_new_message, check_message_arthur, delete_current_message, update_current_message


load_dotenv()

# 創建 FastAPI 物件
app = FastAPI()

# 導入 HTML 及 CSS
# 設置模板引擎
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 啟用 session功能
secret_key = os.getenv("SECRET_KEY")
app.add_middleware(SessionMiddleware, secret_key=secret_key)

# 建立 CryptContext 物件，處理加密/解密
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 驗證密碼
def verify_password(plain_password, hashed_password):
    return bcrypt_context.verify(plain_password, hashed_password)


# 設定首頁
@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# 註冊頁面
@app.post("/signup")
async def signup(request: Request, db: db_depend, name: str = Form(), username: str = Form(), password: str = Form()):
    # 從資料庫檢查username是否已被註冊
    # 如果 username 已被註冊，導向錯誤頁面
    # 如果沒有，將資料新增進資料庫並導向首頁
    try:
        if get_user_data(db, username):
            error_message = "Account has been Registered"
            return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

        # 將密碼加密
        hashed_password = bcrypt_context.hash(password)

        add_new_member(db, name, username, hashed_password)

        return RedirectResponse(url="/", status_code=303)

    except Exception as e:
        print("資料庫查詢發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 登錄頁面
@app.post("/signin")
async def signin(request: Request, db: db_depend, username: str = Form(), password: str = Form()):
    # 驗證使用者 username及 password
    # 若驗證失敗，導向錯誤頁面
    try:
        error_message = "Invalid username or password"
        #  資料形式：[("1", "name", "username"...)] Tuple list
        result = get_user_data(db, username)
        if not result:
            return RedirectResponse(url=f"/error?message={error_message}", status_code=303)
        if not verify_password(password, result[3]):
            return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

        # 驗證成功，將使用者狀態及資訊存進 session中，並導向welcome頁面
        request.session["authenticated"] = True
        request.session["user_id"] = result[0]
        request.session["name"] = result[1]
        return RedirectResponse(url="/welcome", status_code=303)

    except Exception as e:
        print(f"查詢資料發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 歡迎頁面
@app.get("/welcome")
async def welcome(request: Request):
    # 檢查用戶是否已登錄
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/", status_code=302)
    return templates.TemplateResponse("welcome.html", {"request": request})


# 錯誤頁面
@app.get("/error")
async def error(request: Request, message: str = None):
    return templates.TemplateResponse("error.html", {"request": request, "error_message": message})


# 登出頁面
@app.get("/signout")
async def signout(request: Request):
    request.session.pop("authenticated", None)
    request.session.pop("user_id", None)
    request.session.pop("name", None)
    return RedirectResponse(url="/", status_code=302)


# 獲取目前登入者的資訊 API頁面
@app.get("/api/user_info")
async def get_user_info(request: Request):
    # 檢查登錄狀態
    if request.session.get("authenticated"):
        current_name = request.session["name"]
        current_id = request.session["user_id"]
        data = {
            "current_name": current_name,
            "current_id": current_id
        }
        print("成功獲取登入者資料")
        return JSONResponse(content=data)
    else:
        return RedirectResponse(url="/", status_code=302)


# 獲取所有message資料 API頁面
@app.get("/api/message_info")
async def get_message_info(request: Request, db: db_depend):
    # 檢查登錄狀態
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/", status_code=302)
    else:
        try:
            result = get_all_message(db)
            # 整理獲取的 message資料
            messages = []
            for message_row in result:
                message = {
                    "name": message_row[0],
                    "content": message_row[1],
                    "id": message_row[2],
                    "member_id": message_row[3],
                    "time": message_row[4].strftime("%Y-%m-%d %H:%M:%S")
                }
                messages.append(message)
            data = {
                "messages": messages
            }
            print("成功獲取留言資料")
            return JSONResponse(content=data)

        except Exception as e:
            print(f"查詢資料發生錯誤: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if db.is_connected():
                db.close()
                print("資料庫已關閉")


# 查詢 username獲取會員名字 API頁面
@app.get("/api/member/")
def get_member_name(request: Request, db: db_depend, username: str = Query(None, max_length=50)):
    # 從資料庫獲取資料
    result = get_user_data(db, username)

    # 若查無此人或會員沒有登入，返回 None
    error_response = {"data": None}

    if not result:
        return JSONResponse(content=error_response, status_code=404)
    if not request.session.get("authenticated"):
        return JSONResponse(content=error_response, status_code=401)

    # 轉換資料格式(tuple list 轉成 dict)
    data = {
        "data": {
            "id": result[0],
            "name": result[1],
            "username": result[2]
        }
    }
    print("成功獲取會員資料:", data)
    return JSONResponse(content=data, headers={"Cache-Control": "no-cache"})


class UpdateName(BaseModel):
    name: str


# 更新會員名字頁面
# 要標註參數是request body
@app.patch("/api/member")
async def update_name(request: Request, db: db_depend, name_input: UpdateName = Body(...)):
    error_response = {"error": True}

    # 檢查登錄狀態
    if not request.session.get("authenticated"):
        return JSONResponse(content=error_response, status_code=401)

    try:
        new_name = name_input.name

        if not new_name:
            return JSONResponse(content=error_response)

        # 從session獲取目前登入者的 userID
        user_id = request.session.get("user_id")

        # 更新資料庫中的名字
        update_user_name(db, new_name, user_id)

        # 更新 session
        request.session["name"] = new_name

        print("成功更新名字", request.session["name"])

        return JSONResponse(content={"ok": True})

    except Exception as e:
        print(f"更新名字發生錯誤: {e}")
        return JSONResponse(content=error_response)

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 會員頁面
# 使用 獲得目前會員資訊以及message資料，以 javascript 動態顯示
@app.get("/member")
def member(request: Request):
    if request.session.get("authenticated"):
        return templates.TemplateResponse("member.html", {"request": request})
    else:
        return RedirectResponse(url="/", status_code=302)


# 會員留言頁面
@app.post("/createMessage")
async def create_message(request: Request, db: db_depend, content: str = Form()):
    if request.session.get("authenticated"):
        member_id = request.session["user_id"]
        try:
            create_new_message(member_id, db, content)
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


class DeleteMessage(BaseModel):
    message_id: int


class UpdateRequest(BaseModel):
    message_id: int
    content: str


# 會員更新留言頁面
@app.post("/updateMessage")
def update_message(request: Request, db: db_depend, update_request: UpdateRequest = Body(...)):
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/", status_code=303)

    message_id = update_request.message_id
    update_content = update_request.content
    current_user = request.session["user_id"]
    try:
        # 查詢並獲取與該 message 對應的 member_id
        result = check_message_arthur(db, message_id)
        member_id = result[0]

        # 確認目前使用者與該 message的 member_id有對上才執行更改
        if int(current_user) == int(member_id):
            update_current_message(db, update_content, message_id)
            return RedirectResponse(url="/member", status_code=303)

        # 如果對不上，導向錯誤頁面
        else:
            error_message = "You are not authorized to change this message"
            return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

    except Exception as e:
        print(f"查詢資料發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")


# 會員刪除留言頁面
@app.post("/deleteMessage")
async def delete_message(request: Request, db: db_depend, message_id_input: DeleteMessage = Body(...)):
    # 檢查登錄狀況
    if not request.session.get("authenticated"):
        return RedirectResponse(url="/", status_code=303)

    current_user = request.session["user_id"]
    message_id = message_id_input.message_id

    try:
        # 查詢並獲取與該 message 對應的 member_id
        result = check_message_arthur(db, message_id)
        member_id = result[0]

        # 確認目前使用者與該 message的 member_id有對上才執行刪除
        if int(current_user) == int(member_id):
            delete_current_message(db, message_id)
            return RedirectResponse(url="/member", status_code=303)

        # 如果對不上，導向錯誤頁面
        else:
            error_message = "You are not authorized to delete this message"
            return RedirectResponse(url=f"/error?message={error_message}", status_code=303)

    except Exception as e:
        print(f"查詢資料發生錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if db.is_connected():
            db.close()
            print("資料庫已關閉")
