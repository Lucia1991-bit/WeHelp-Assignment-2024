// 獲取需要的DOM元素
const messageContainer = document.querySelector(".message-container");
const welcomeText = document.querySelector(".current-name");
const searchNameForm = document.getElementById("search-name-form");
const searchNameInput = document.getElementById("search-name-input");
const textName = document.querySelector(".search-text-name");
const textUsername = document.querySelector(".search-text-username");
const searchNameBtn = document.querySelector(".search-name");
const searchNameField = document.querySelector(".search-field");
const input = document.querySelector(".current-name");
const changeNameBtn = document.querySelector(".change-name");

// 使用者隨機頭像的圖片URL數組
const imageURL = [
  "/static/image/image-01.png",
  "/static/image/image-02.png",
  "/static/image/image-03.png",
  "/static/image/image-04.png",
  "/static/image/image-05.png",
  "/static/image/image-06.png",
  "/static/image/image-07.png",
  "/static/image/image-08.png"
];

// 設置目前使用者資訊
let currentName;
let currentID;

// 根據使用者ID獲取對應的頭像圖片URL
function getUserImageIndex(userId) {
  let totalImages = imageURL.length;
  let imageIndex = userId % totalImages;
  return imageURL[imageIndex];
}

// 獲取所有留言資訊
async function getMessage() {
  try {
    const response = await fetch("/api/message_info");
    if (!response.ok) {
      throw new Error("請求發生錯誤");
    }
    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error("Error: ", error);
  }
}

// 獲取登入者資訊
async function getCurrentUser() {
  try {
    const response = await fetch("/api/user_info");
    if (!response.ok) {
      throw new Error("請求發生錯誤");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error: ", error);
    return [];
  }
}


// 根據使用者名稱查詢使用者資訊
async function getUserName() {
  const query = searchNameInput.value;

  try {
    const response = await fetch(`/api/member/?username=${encodeURIComponent(query)}`);
    if (response.status === 404) {
      throw new Error("查無此人或會員沒有登入");
    }
    if (!response.ok) {
      throw new Error("請求發生錯誤");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
}


//當搜尋表單提交時觸發搜尋用戶名請求，將結果顯示在 DOM
searchNameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = await getUserName();
    const { id, name, username } = data;

    textName.textContent = name;
    textUsername .textContent = username;

    //清除表單裡的內容
    searchNameInput.value = "";
    
  } catch (error) {
    //處理錯誤情況
    textName.textContent = "User not found";
    textUsername .textContent = "";
  }
  
});

//按search按鈕，下滑出表單
searchNameBtn.addEventListener("click", () => {
  searchNameField.classList.toggle("show");
});


// 向後端發送修改使用者名稱的請求
async function updateName(newName) {
  console.log("送出更改請求");
  try {
    const response = await fetch("/api/member", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    });
    const data = await response.json();
    if (data.ok) {
      return true;
    } else {
      throw new Error("Request failed");
    }
  } catch (error) {
    console.error("Error updating name:", error);
    return false;
  }
}

// 顯示修改名稱成功的訊息
function showSuccessMessage() {
  const container = document.querySelector(".status");
  const check = document.createElement("i");
  const text = document.createElement("p");
  check.classList.add("fa-sharp", "fa-regular", "fa-circle-check");
  text.textContent = "Updated Success";
  container.classList.add("success");
  container.appendChild(check);
  container.appendChild(text);

  // 2秒後清除訊息
  setTimeout(() => {
    container.innerHTML = '';
  }, 2000);
}

// 顯示修改名稱失敗的訊息
function showFailMessage() {
  const container = document.querySelector(".status");
  const fail = document.createElement("i");
  const text = document.createElement("p");
  fail.classList.add("fa-regular", "fa-circle-xmark");
  text.textContent = "Updated Fail";
  container.classList.add("fail");
  container.appendChild(fail);
  container.appendChild(text);

  // 2秒後清除訊息
  setTimeout(() => {
    container.innerHTML = '';
  }, 2000);
}

// 根據留言資訊創建對應的DOM元素
function createMessageElement(message) {
  ({ name: name, content: content, id: messageID, member_id: memberID, time: time } = message);

  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card");
  messageCard.setAttribute("data-message-id", messageID);

  const imageContainer = document.createElement("div");
  imageContainer.classList.add("img-container");

  const image = document.createElement("img");
  image.src = getUserImageIndex(memberID);
  imageContainer.appendChild(image);

  const textContainer = document.createElement("div");
  textContainer.classList.add("text-container");

  const messageContent = document.createElement("span");
  messageContent.classList.add("message");
  messageContent.textContent = content;
  textContainer.appendChild(messageContent);

  const arthurContent = document.createElement("span");
  arthurContent.classList.add("arthur");
  arthurContent.setAttribute("data-member-id", memberID);
  arthurContent.textContent = name;
  textContainer.appendChild(arthurContent);

  const timeContent = document.createElement("small");
  timeContent.textContent = time;

  if (currentID === memberID) {
    const deleteContainer = document.createElement("div");
    deleteContainer.classList.add("delete-msg");

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");

    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-xmark");
    deleteBtn.appendChild(deleteIcon);
    deleteContainer.appendChild(deleteBtn);

    //在每個刪除按鈕加上監聽事件
    messageCard.appendChild(deleteContainer);
    deleteBtn.addEventListener("click", deleteMessage);
  }

  messageCard.appendChild(imageContainer);
  messageCard.appendChild(textContainer);
  messageCard.appendChild(timeContent);

  return messageCard;
}

// 獲取所有留言資訊並在頁面上顯示
async function displayMessages() {
  const messages = await getMessage();
  const messageContainer = document.getElementById("message-container");

  messages.forEach(message => {
    const messageElement = createMessageElement(message);
    messageContainer.appendChild(messageElement);
  });
}

// 處理刪除留言的操作
async function deleteMessage(e) {
  const messageCard = e.target.closest(".message-card");
  const messageID = messageCard.getAttribute("data-message-id");

  const confirmDelete = confirm("Are you sure you want to delete this message?");

  if (confirmDelete) {
    try {
      const response = await fetch("/deleteMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "message_id": parseInt(messageID),
        })
      });

      if (response.ok) {
        messageCard.remove();
      } else {
        throw new Error("刪除失敗");
      }
    } catch (error) {
      console.log("Error deleting message: ", error);
    }
  }
}

// 為搜尋使用者名稱的表單添加提交事件的監聽器
searchNameForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = await getUserName();
    const { id, name, username } = data;

    textName.textContent = name;
    textUsername.textContent = username;
  } catch (error) {
    textName.textContent = "User not found";
    textUsername.textContent = "";
  }
});

// 為修改使用者名稱的按鈕添加點擊事件的監聽器
changeNameBtn.addEventListener("click", () => {
  input.contentEditable = true;
  input.focus();

  let originName = input.textContent.trim();

  input.addEventListener("blur", handleInputBlur, { once: true });

  async function handleInputBlur(e) {
    try {
      const newName = e.target.textContent.trim();
      console.log("原本的名字是:", originName);
      console.log("輸入的名字:", newName);

      if (newName !== originName) {
        const updateStatus = await updateName(newName);

        if (updateStatus) {
          input.textContent = newName;
          showSuccessMessage();

          const arthurContent = document.querySelectorAll(".arthur");
          arthurContent.forEach(name => {
            const memberID = name.getAttribute("data-member-id");
            if (parseInt(memberID) === parseInt(currentID)) {
              name.textContent = newName;
            }
          });
        } else {
          e.target.textContent = originName;
          throw new Error("更新失敗");
        }
      }
    } catch (error) {
      console.error("Error updating name:", error);
      e.target.textContent = originName;
      showFailMessage();
    } finally {
      input.contentEditable = false;
    }
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  });
});

// 頁面載入時的初始化操作
async function init() {
  //獲取登入者的資訊
  const currentData = await getCurrentUser();
  ({ current_name: currentName, current_id: currentID } = currentData);
  welcomeText.textContent = currentName;

  await displayMessages();

  // 在頁面初始化完成後再對 messageCard區域操作
  // 為留言添加編輯功能
  editMessages();

}

// 頁面載入完成後執行初始化操作
init();

//更新留言
function editMessages() {
  const messageCards = document.querySelectorAll(".message-card");

  messageCards.forEach(messageCard => {
    const messageContent = messageCard.querySelector(".message");
    const messageID = messageCard.getAttribute("data-message-id");
    const memberID  = messageCard.querySelector(".arthur").getAttribute("data-member-id");

    //對照該留言作者是不是該使用者
    if (currentID === parseInt(memberID)) {
      let originContent = messageContent.textContent;

      // 添加編輯模式
      messageContent.contentEditable = true;
    
      messageContent.addEventListener("blur", async() => {
        const newContent = messageContent.textContent.trim();

        //送請求到後端前檢查內容有沒有改變
        if (newContent !== originContent) {
          try {
            const updateStatus = await updateMessage(messageID, newContent);
            if (updateStatus) {
              messageContent.textContent = newContent;
              originContent = newContent;  // 更新原始內容
              console.log("留言更新成功");
            } else {
              throw new Error("留言更新失敗");
            }
          } catch (error) {
            console.log("Error updating message: ", error);
            messageContent.textContent = originContent;
            alert("留言更新失敗,請稍後重試");
          }
        }
        // messageContent.contentEditable = false;
    })  
    messageContent.addEventListener("keydown", function (e) {
      // 添加Enter鍵監聽事件
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });

  }
  })  
}

//向後端發送更新留言的請求
async function updateMessage(messageID, newContent) {
  try {
    const response = await fetch("/updateMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: parseInt(messageID), 
        content: newContent
      })
    })

    if (response.ok) {
      return true;
    } else {
      throw new Error("更新失敗");
    }
  } catch (error) {
    console.log("Error updating message: ", error);
    return false;
  }
}