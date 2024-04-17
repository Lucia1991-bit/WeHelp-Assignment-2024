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
    console.log(results);
    
    
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
  const pImageEL = document.createElement("div");
  const pTextEL = document.createElement("p");
  promotionEL.className = "promotion-item";
  pImageEL.className = "p-img-container";
  promotionEL.appendChild(pImageEL);
  promotionEL.appendChild(pTextEL);
  return promotionEL;
}

//創建 Title Item
function createTitleItem() {
  const titleEL = document.createElement("div");
  const starEL = document.createElement("i");
  const textEL = document.createElement("p");
  titleEL.className = "title-item";
  starEL.className = "fa-solid fa-star";
  textEL.className = "text";
  titleEL.appendChild(starEL);
  titleEL.appendChild(textEL);
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
      const pImage = promotionItem.children[0];
      const pText = promotionItem.children[1];

      pImage.style.backgroundImage = `url(${image})`;
      pText.textContent = spotTitle;

      //處理RWD情況
      //promotion item3有加個別class
      if (index === 2) {
        promotionItem.classList.add("item3");
      }
      //放進DOM
      cotentContainer.appendChild(promotionItem);
    }

    //剩下的資料輸出至Title Item
    else {  
      //創建 Title Item
      const titleItem = createTitleItem();
      
      const titleText = titleItem.children[1];
      titleItem.style.backgroundImage = `url(${image})`;
      titleText.textContent = spotTitle;

      //處理RWD情況
      //title item1, title item6, title item9, title item10有加個別的class
      //===因為有加上前三個promotion item，所以index要特別計算
      //===currentIndex 是目前已載入的項目數, 
      //===index 是當前項目在本次載入的項目中的索引, 
      //===3 是初始的promoItem數量。
      const relativeIndex = (currentIndex + index - 3) % 10;
      

      if (relativeIndex % 10 === 0) {
        titleItem.classList.add("item1");
      } else if (relativeIndex % 10 === 5) {
        titleItem.classList.add("item6");
      } else if (relativeIndex % 10 === 8) {
        titleItem.classList.add("item9");
      } else if (relativeIndex % 10 === 9) {
        titleItem.classList.add("item10");
      }

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
