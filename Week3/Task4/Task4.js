const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-navbar");
const cotentContainer = document.querySelector(".container");
const loadMoreBtn = document.querySelector(".btn");

//送出HTTP request取得資料
let currentItem = 13;
let spots = [];

async function getData() {
  try {
    const response = await fetch("https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1");

    //如果HTTP請求不成功(response.status不在200-299範圍)，拋出錯誤
    if (!response.ok) {
      throw new Error("Request Failed");
    }

    //把json資料轉換成物件
    //觀察資料後，找出需要的資料在["results"]這個key裡面
    const { data: { results } } = await response.json();
    spots = results;
    displayInitialData();
  } catch (error) {
    //顯示錯誤訊息
    cotentContainer.classList.add("error-message");
    cotentContainer.textContent = error;
    loadMoreBtn.classList.add("disable");
    console.log(error);
  }
}
//處理filelist裡面的照片網址長字串
//使用Regular Expressions匹配以http開頭 .jpg結尾(不分大小寫)的字
function getImageURL(spot) {
  let rawImgURL = spot.filelist;
  let regex = /http.*?\.jpg/i;
  let match = regex.exec(rawImgURL);
  return match[0];
}


//生成初始畫面(前13筆資料)
function displayInitialData() {
  for (let i = 0; i < 13; i++) {
    if (i >= spots.length) {
      break;
    }
    displaySpotData(spots[i], i);
  }
}

//把資料顯示在畫面上
function displaySpotData(spot, index) {
  //獲取文字及圖片網址
  const spotTitle = spot.stitle;
  const image = getImageURL(spot);

  //創建 Promotion Item
  const promotionEL = document.createElement("div");
  const pImageEL = document.createElement("div");
  const pTextEL = document.createElement("p");
  promotionEL.className = "promotion-item";
  pImageEL.className = "p-img-container";
  promotionEL.appendChild(pImageEL);
  promotionEL.appendChild(pTextEL);


  //創建 Title Item
  const titleEL = document.createElement("div");
  const starEL = document.createElement("i");
  const textEL = document.createElement("p");
  titleEL.className = "title-item";
  starEL.className = "fa-solid fa-star";
  textEL.className = "text";
  titleEL.appendChild(starEL);
  titleEL.appendChild(textEL);

  //前三筆資料輸出至 Promotion Item
  if (index < 3) {
    
    pImageEL.style.backgroundImage = `url(${image})`;
    pTextEL.textContent = spotTitle;

    //處理RWD情況
    if (index === 2) {
      promotionEL.classList.add("item3");
    }
    cotentContainer.appendChild(promotionEL);

    //剩下的資料輸出至Title Item
  } else {
    
    titleEL.style.backgroundImage = `url(${image})`;
    textEL.textContent = spotTitle;

    //RWD處理
    if (index % 10 === 3) {
      titleEL.classList.add("item1");
    } else if (index % 10 === 8) {
      titleEL.classList.add("item6");
    } else if (index % 10 === 1) {
      titleEL.classList.add("item9");
    } else if (index % 10 === 2) {
      titleEL.classList.add("item10");
    }
    cotentContainer.appendChild(titleEL);
  }
}

//點擊Load More 顯示後10筆資料
function loadMoreData() {
  const endIndex = currentItem + 10;
  for (let i = currentItem; i < endIndex; i++) {
    if (i >= spots.length) {
      break;
    }
    
    displaySpotData(spots[i], i);
    
  }
  //每次10筆繼續增加，直到沒有資料後把按鈕隱藏
  currentItem = endIndex;
  if (currentItem >= spots.length) {
    loadMoreBtn.classList.add("disable");
  }
}

getData();
loadMoreBtn.addEventListener("click", loadMoreData);

// PopUp Menu for Mobile Device
hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("open");
  mobileNav.classList.toggle("open");
});
