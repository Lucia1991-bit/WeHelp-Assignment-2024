// 處理每個用戶隨機對應頭像圖片，若用戶超過頭像圖片數量則重複
const messageCards = document.querySelectorAll(".message-card");
const image = document.getElementById("img-icon");
const imgUrls = image.dataset.imgUrls;
const imagePaths = JSON.parse(imgUrls);

// 定義 nameIconMap 空物件
const nameIconMap = {};

messageCards.forEach(card => {
    const img = card.querySelector('img'); // 在每個卡片裡面找到 img 元素
    const name = img.dataset.name; // 獲取每個 img 的 data-name 屬性
  
    if(!(name in nameIconMap)) {
        let iconIndex = Object.keys(nameIconMap).length % imagePaths.length;
        nameIconMap[name] = imagePaths[iconIndex];
    }
    // 針對每個 'message-card' 的 'img' 子元素做處理
    if (img) {
        const iconPath = nameIconMap[name];
        img.src = iconPath; // 將 img 的 src 屬性設置為對應的 iconPath
    }
});

//刪除留言，按下刪除按鈕後先 confirm，確定後再向後端送出 POST請求
const deleteForms = document.querySelectorAll(".delete-msg");

//===message-card有很多個，因此必須全部都要監聽
deleteForms.forEach(form => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const messageId = form.querySelector('input[name="message_id_str"]').value;
    if (confirm("Are you sure you want to delete this message?")) {
      form.submit();
      console.log(`刪除messageID ${messageId} 成功`);
    } else {
      console.log(`刪除messageID ${messageId} 操作已取消`);
    }
  });
});