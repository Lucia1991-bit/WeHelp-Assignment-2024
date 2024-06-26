const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-navbar");
const cotentContainer = document.querySelector(".container");
const loadMoreBtn = document.querySelector(".btn");

const initalItemCount = 13; //網頁初始item數量（promoItem 3 + titleItem 10）
let currentIndex = 0;  //目前已載入的item數
let addedItem = 10; //每次按load more時增加的item數量
let totalItems = 0; // 總item數,初始為0,後續會根據獲取的資料進行更新

//載入更多item
async function loadMoreItmes() {
  //計算目前頁面item
  const startIndex = currentIndex;
  const endIndex = startIndex + addedItem;

  try {
      //獲取data
      const data = await fetchData(startIndex, endIndex);

      if (data) {
        //將item顯示於畫面
        //重新計算目前畫面上顯示的item數量
        displayItems(data);
        currentIndex = endIndex;
      
        //如果顯示數量超過總資料量，Load More按鈕停止作用
        if (currentIndex >= totalItems) {
          loadMoreBtn.classList.add("disable");
        }
      } 
    } catch (error) {
      console.log(error);
    }
  
}

//送出HTTP request取得資料
async function fetchData(startIndex, endIndex) {
  try {
    const response = await fetch("https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1");

    // 如果HTTP請求不成功(response.status不在200-299範圍),拋出錯誤
    if (!response.ok) {
      throw new Error("Request failed");
    }

    //把json資料轉換成物件
    //觀察資料後，找出需要的資料在["results"]這個key裡面
    const { data: { results } } = await response.json();
    totalItems = results.length; // 更新總項目數
  
    // const spots = [];
    // for (let i = startIndex; i < endIndex; i++) {
    //   if (i >= totalItems) {
    //     break;
    //   } 
    //   spots.push(results[i]);
    // }
    //控制要顯示的資料數量
    return results.slice(startIndex, endIndex);

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

//顯示Item
function displayItems(spotsData) {

  spotsData.forEach((spot, index) => {
    //獲取文字及圖片網址
    const spotTitle = spot.stitle;
    const image = getImageURL(spot);

    //創建 Promotion Item
    const promotionItem = createPromoItem();
    
    //將前三筆資料輸出至Promotion Item
    if (currentIndex + index < 3) {
      const pImageCon = promotionItem.children[0];
      const pImage = pImageCon.children[0];
      const pText = promotionItem.children[1];
      pImage.setAttribute("src", image);
      pText.textContent = spotTitle;
      
      //放進DOM
      cotentContainer.appendChild(promotionItem);
    }

    //剩下的資料輸出至Title Item
    else {  
      //創建 Title Item
      const titleItem = createTitleItem();
      const imageCon = titleItem.children[0];
      const imageItem = imageCon.children[0];
      const titleText = titleItem.children[2];
      imageItem.setAttribute("src", image);
      titleText.textContent = spotTitle;

      //放進DOM
      cotentContainer.appendChild(titleItem);
    }
  });
}

//載入初始項目
async function startPage() {
  try {
    //fetch最開始的13筆資料
    const data = await fetchData(0, initalItemCount);
    if (data) {
      displayItems(data);
      currentIndex = initalItemCount;//更新目前頁面item數量
    }
  } catch (error) {
      console.log(error);
  }
};

startPage();
//Load more Button
loadMoreBtn.addEventListener('click', loadMoreItmes);
//PopUp Menu for Mobile Device
hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("open");
  mobileNav.classList.toggle("open");
});
