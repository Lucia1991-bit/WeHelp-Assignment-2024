const loginPage = document.getElementById("login");
const signupPage = document.getElementById("signup");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

//藉由按鈕轉換登錄/註冊頁面
function togglePages(showPage, hidePage) {
  showPage.classList.add("show");
  showPage.classList.remove("hide");
  hidePage.classList.remove("show");
  hidePage.classList.add("hide");
}

// 監聽按鈕事件
signupBtn.addEventListener("click", () => {
  togglePages(signupPage, loginPage);
});

loginBtn.addEventListener("click", () => {
  togglePages(loginPage, signupPage);
});


