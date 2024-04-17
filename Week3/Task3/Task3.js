const cotentContainer = document.querySelector(".container");

//送出HTTP request取得資料
async function fetchData() {
  try {
    const response = await fetch("https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1");

    //如果HTTP請求不成功(response.status不在200-299範圍)，拋出錯誤
    if (!response.ok) {
      throw new Error("Request Failed");
    }
    //把json資料轉換成物件
    //觀察資料後，找出需要的資料在["results"]這個key裡面
    const { data: { results } } = await response.json();
    // console.log(results);
    displayData(results);

  } catch (error) {
    //顯示錯誤訊息
    cotentContainer.textContent = "Request failed";
    console.log(error);
  }
}

//處理filelist裡面的照片網址長字串
//使用Regular Expressions匹配以http開頭 .jpg結尾(不分大小寫)的字
function getImageURL(spot) {
  let rawImgURL = spot.filelist;
  let regex = /http.*?\.jpg/i;
  let match = regex.exec(rawImgURL);
  // 回傳值會是array，所以取第一個值
  return match[0];
}

//創建 Promotion Item
function createPromoItem() {
  const promotionItem = document.createElement("div");
  const pImageEL = document.createElement("div");
  const pTextEL = document.createElement("p");
  promotionItem.className = "promotion-item";
  pImageEL.className = "p-img-container";
  promotionItem.appendChild(pImageEL);
  promotionItem.appendChild(pTextEL);
  return promotionItem;
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


//處理資料並動態生成畫面
function displayData(spots) {
  //loop through存放所有資料的results陣列，只需要前13筆
  for(let i = 0; i < 13; i++) {
    //取得每個spot的title
    const spotTitle = spots[i].stitle;
    //取得照片
    const image = getImageURL(spots[i]);
    
    //創建Promotion Item 
    const promotionItem = createPromoItem();

    //Add 前三筆資料到 Promotion Item
    if(i < 3) {
      const pImage = promotionItem.children[0];
      const pText = promotionItem.children[1];

      pImage.style.backgroundImage = `url(${image})`;
      pText.textContent = spotTitle;

      //處理RWD狀態下的Element
      //===Promotion Item3在螢幕600-1200px時會span
      if (i == 2) {
        promotionItem.classList.add("item3");
      }
      //放進DOM
      cotentContainer.appendChild(promotionItem);
    }

    //Add 剩下的資料到 Title Item
    else {
      //創建 Title Item
      const titleItem = createTitleItem();
      
      const titleText = titleItem.children[1];
      titleItem.style.backgroundImage = `url(${image})`;
      titleText.textContent = spotTitle;

      //處理RWD狀態下的Element
      //==== item1, item6    
      //==== item9, item10 
      //====另加RWD標籤，i要多加2(加上promotion item)
      switch(i) {
        case 3:
          titleItem.classList.add("item1");
          break;
        case 8:
          titleItem.classList.add("item6");
          break;
        case 11:
          titleItem.classList.add("item9");
          break;
        case 12:
          titleItem.classList.add("item10");
          break;
      }
      //放進DOM
      cotentContainer.appendChild(titleItem);
    }
  };  
}

fetchData();


// PopUp Menu for Mobile Device
const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-navbar");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("open");
  mobileNav.classList.toggle("open");
});