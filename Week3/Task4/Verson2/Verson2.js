const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-navbar");
const cotentContainer = document.querySelector(".container");
const loadMoreBtn = document.querySelector(".btn");


const screenWidth = window.innerWidth;//視窗大小
let spots = [];//從網頁獲取的資料

const initalItemCount = 13; //網頁初始item數量（promoItem 3 + titleItem 10）
let currentItem = 13; //目前已載入的item數
let totalItems = spots.length; // 總item數,初始為0,後續會根據獲取的資料進行更新

let isFirstClick = true; // 用於跟蹤是否是第一次點擊 "Load More" 按鈕


//送出HTTP request取得資料
async function fetchData() {
  try {
    const response = await fetch("https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1");

    // 如果HTTP請求不成功(response.status不在200-299範圍),拋出錯誤
    if (!response.ok) {
      throw new Error("Request failed");
    }

    //把json資料轉換成物件
    //觀察資料後，找出需要的資料在["results"]這個key裡面
    const { data: { results } } = await response.json();
    spots = results;
    //顯示初始頁面(最初13個items)
    displayInitialData();

  } catch (error) {
    //顯示錯誤訊息
    cotentContainer.textContent = "Request failed";
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

//創建 Promotion Item
function createPromoItem() {
  const promotionEL = document.createElement("div");
  const pImageConEL = document.createElement("div");
  const pImageEL = document.createElement("img");
  const pTextEL = document.createElement("p");
  const pAnimationContent = document.createElement("span"); //for Loading Animation

  pImageEL.className = "pImg";
  pAnimationContent.textContent = "&nbsp;";
  promotionEL.className = "promotion-item ";
  pImageConEL.className = "p-img-container animated-bg";
  
  
  pTextEL.appendChild(pAnimationContent);
  pImageConEL.appendChild(pImageEL);
  promotionEL.appendChild(pImageConEL);
  promotionEL.appendChild(pTextEL);
  return promotionEL;
}

//創建 Title Item
function createTitleItem() {
  const titleEL = document.createElement("div");
  const imgCon = document.createElement("div");
  const imgEL = document.createElement("img");
  const starEL = document.createElement("i");
  const textEL = document.createElement("p");

  imgCon.className = "titleImg-container";
  imgEL.className = "titleImg"
  titleEL.className = "title-item animated-bg";
  starEL.className = "fa-solid fa-star";
  textEL.className = "text";

  imgCon.appendChild(imgEL);
  titleEL.appendChild(imgCon);
  titleEL.appendChild(starEL);
  titleEL.appendChild(textEL);
  console.log(titleEL);
  return titleEL;
}

//生成初始畫面(前13筆資料)
function displayInitialData() {
  for (let i = 0; i < initalItemCount; i++) {
    if (i >= spots.length) {
      break;
    }
    //將前13筆資料傳進去
    displayItems(spots[i], i);
  }
}

//顯示Item到 DOM 裡面
function displayItems(spot, index) {

  //獲取文字及圖片網址
  const spotTitle = spot.stitle;
  const image = getImageURL(spot);

  //創建 Promotion Item
  const promotionItem = createPromoItem();
  
  //將前三筆資料輸出至Promotion Item
  if (index < 3) {
    const pImageCon = promotionItem.children[0];
    const pImage = pImageCon.children[0];
    const pText = promotionItem.children[1];
    pImage.setAttribute("src", image);
    pText.textContent = spotTitle;

    cotentContainer.appendChild(promotionItem);
  }

  //將前10筆資料輸出至Title Item
  else {
    // 創建 Title Item
    const titleItem = createTitleItem();
    const imageCon = titleItem.children[0];
    const imageItem = imageCon.children[0];
    const titleText = titleItem.children[2];
    imageItem.setAttribute("src", image);
    titleText.textContent = spotTitle;
    
    //CSS改成nth-child選取item後就不用個別處裡class
    // 放進 DOM
    cotentContainer.appendChild(titleItem);
  }
}

//處理Load More後的RWD情況
function handleRWD_AfterLoad() {
  if (screenWidth < 1200) {
    // 移除倒數兩個title item的span2屬性
    const elems1 = document.querySelectorAll(".title-item:nth-last-child(2)");
    const elems2 = document.querySelectorAll(".title-item:last-child");

    // 為每一個元素設定新的 grid-column 值
    elems1.forEach(elem => elem.style.gridColumn = "span 1");
    elems2.forEach(elem => elem.style.gridColumn = "span 1");
  }
}


//按下 Load More後加載資料
function loadMoreItmes() {
 // 計算剩餘的資料數量
  const remainingItems = spots.length - currentItem;
  
  // 每次加載10筆資料
  const itemsToLoad = Math.min(10, remainingItems);
  
  // 加載資料
  for (let i = 0; i < itemsToLoad; i++) {
    displayItems(spots[currentItem + i], currentItem + i);
  }
  
  // 按下 "Load More" 後改變螢幕小於1200的排版（從442變成444）
  handleRWD_AfterLoad();
  
  // 更新 currentItem
  currentItem += itemsToLoad;
  
  // 檢查是否已經載入了所有的資料
  if (currentItem >= spots.length) {
    loadMoreBtn.classList.add("disable");
  }
}

fetchData();
//Load more Button
loadMoreBtn.addEventListener('click', loadMoreItmes);

//PopUp Menu for Mobile Device
  hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("open");
  mobileNav.classList.toggle("open");
});