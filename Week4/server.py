from fastapi import FastAPI, Request, Form, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.sessions import SessionMiddleware

# 創建 FastAPI 物件
app = FastAPI()
security = HTTPBasic()

# 導入 HTML及 CSS
# 設置模板引擎
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 管理使用者及密碼資料
# 啟用 session功能
# ===secret_key參數用於加密session數據
credential = {"username": "test", "password": "test"}
app.add_middleware(SessionMiddleware, secret_key="this_secret_key")


# 設定首頁 回應格式為HTML 渲染出 index HTML
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# 登入資料驗證
# ===使用Form(None)將參數設為optional，後續才不會一直出現error (設為必填時程式會出錯)
@app.post("/signin")
async def signin(request: Request, username: str = Form(None), password: str = Form(None)):
    # 如果帳號密碼正確，將帳號存進session，並在session創建登入狀態為 true
    if username == credential["username"] and password == credential["password"]:
        request.session["username"] = username
        request.session["authenticated"] = True
        return RedirectResponse(url="/member", status_code=status.HTTP_303_SEE_OTHER)
        # 從 post轉到 get頁面時 status code 改成 303，防止post重複執行

    if not username or not password:
        error_message = "Please enter Username and Password"
        return RedirectResponse(url=f"/error?message={error_message}", status_code=status.HTTP_303_SEE_OTHER)

    else:
        error_message = "Incorrect Username or Password"
        return RedirectResponse(url=f"/error?message={error_message}", status_code=status.HTTP_303_SEE_OTHER)


# 登入成功頁面
@app.get("/member")
async def member(request: Request):
    if request.session.get("authenticated"):
        return templates.TemplateResponse("member.html", {"request": request})
    else:
        return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


# 登入失敗頁面
# ===將自定錯誤訊息動態顯示到畫面中
@app.get("/error")
async def error(request: Request, message: str = None):
    return templates.TemplateResponse("error.html", {"request": request, "error_message": message})


# 登出頁面
# 清除session中的使用者資訊
@app.get("/signout")
async def signout(request: Request):
    request.session["authenticated"] = False
    request.session.pop("username", None)
    return RedirectResponse(url="/", status_code=status.HTTP_302_FOUND)


# squared number頁面
@app.get("/square/{number}")
async def squared_number(request: Request, number: int):
    squared = number ** 2
    result = f"The squared number of {number} is {squared}"
    return templates.TemplateResponse("square.html", {"request": request, "result": result})
