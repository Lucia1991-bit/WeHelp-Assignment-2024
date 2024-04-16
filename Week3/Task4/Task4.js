const cotentContainer = document.querySelector(".container");
const loadMoreBtn = document.querySelector("btn"); 

//送出HTTP request取得資料
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
    // console.log(results);
    displayData(results);
    

  } catch (error) {
    //顯示錯誤訊息
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


//處理資料並動態生成畫面
function displayData(spots) {
  
  console.log(spots);

  //loop through存放所有資料的results陣列，只需要前13筆
  for(let i = 0; i < 13; i++) {
    //取得每個spot的title
    const spotTitle = spots[i].stitle;
    //取得照片
    const image = getImageURL(spots[i]);

    //創建Promotion Item 
    const promotionEL = document.createElement("div");
    const pImageEL = document.createElement("div");
    const pTextEL = document.createElement("p");
    
    promotionEL.className = "promotion-item";
    pImageEL.className = "p-img-container";
    
    promotionEL.appendChild(pImageEL);
    promotionEL.appendChild(pTextEL);

    //創建Title Item
    const titleEL = document.createElement("div");
    const starEL = document.createElement("i");
    const textEL = document.createElement("p");

    titleEL.className = "title-item";
    starEL.className = "fa-solid fa-star";
    textEL.className = "text";

    titleEL.appendChild(starEL);
    titleEL.appendChild(textEL);


    //Add 前三筆資料到 Promotion Item
    if(i < 3) {

      pImageEL.style.backgroundImage = `url(${image})`
      pTextEL.textContent = spotTitle;

      //處理RWD狀態下的Element
      //===Promotion Item3在螢幕600-1200px時會span
      if (i == 2) {
        promotionEL.classList.add("item3");
      }

      cotentContainer.appendChild(promotionEL);
    }

    //Add 剩下的資料到 Title Item
    else {
    titleEL.style.backgroundImage = `url(${image})`;
    textEL.textContent = spotTitle;

    //處理RWD狀態下的Element
    //==== item1, item6    
    //==== item9, item10 
    //====另加RWD標籤，i要多加2(加上promotion item)
    switch(i) {
      case 3:
        titleEL.classList.add("item1");
        break;
      case 8:
        titleEL.classList.add("item6");
        break;
      case 11:
        titleEL.classList.add("item9");
        break;
      case 12:
        titleEL.classList.add("item10");
        break;
    }
    //加到DOM
    cotentContainer.appendChild(titleEL);
    }
  };  
}

getData();


// PopUp Menu for Mobile Device
const hamburgerMenu = document.querySelector(".hamburger-menu");
const mobileNav = document.querySelector(".mobile-navbar");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("open");
  mobileNav.classList.toggle("open");
});