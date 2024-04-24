const form = document.getElementById("myForm");
const checkbox = document.getElementById("termsOfuse");
const numberForm = document.getElementById("numberForm");

//監聽按鈕事件，如果checkbox沒有勾選則阻止表單提交
form.addEventListener("submit", (e) => {
  if (!checkbox.checked) {
    e.preventDefault();
    alert("You must Agree to the Terms and Condictions");
  }
})

//監聽按鈕事件，如果輸入的不是正整數阻止表單提交
//如果表單輸入正確，跳轉頁面
numberForm.addEventListener("submit", (e) => {
  const number = document.getElementById("number").value.trim();
  e.preventDefault(); // 阻止表單的默認提交行為
  if (/^[1-9]\d*$/.test(number)) {
    window.location.href = `/square/${number}`;
  } else {
    alert("Please enter a positive number");
  }
})


