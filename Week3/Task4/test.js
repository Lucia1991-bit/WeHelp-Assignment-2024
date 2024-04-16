const cotentContainer = document.querySelector(".container");
const loadMoreBtn = document.querySelector(".btn");
let currentItem = 13;
let spots = [];

async function getData() {
  try {
    const response = await fetch("https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1");
    if (!response.ok) {
      throw new Error("Request Failed");
    }
    const { data: { results } } = await response.json();
    spots = results;
    displayInitialData();
  } catch (error) {
    console.log(error);
  }
}

function getImageURL(spot) {
  let rawImgURL = spot.filelist;
  let regex = /http.*?\.jpg/i;
  let match = regex.exec(rawImgURL);
  return match[0];
}

function displayInitialData() {
  for (let i = 0; i < 13; i++) {
    if (i >= spots.length) {
      break;
    }
    displaySpotData(spots[i], i);
  }
}

function displaySpotData(spot, index) {
  const spotTitle = spot.stitle;
  const image = getImageURL(spot);

  if (index < 3) {
    // 顯示 Promotion Item
    const promotionEL = document.createElement("div");
    const pImageEL = document.createElement("div");
    const pTextEL = document.createElement("p");
    promotionEL.className = "promotion-item";
    pImageEL.className = "p-img-container";
    promotionEL.appendChild(pImageEL);
    promotionEL.appendChild(pTextEL);

    pImageEL.style.backgroundImage = `url(${image})`;
    pTextEL.textContent = spotTitle;

    if (index === 2) {
      promotionEL.classList.add("item3");
    }
    cotentContainer.appendChild(promotionEL);
  } else {
    // 顯示 Title Item
    const titleEL = document.createElement("div");
    const starEL = document.createElement("i");
    const textEL = document.createElement("p");
    titleEL.className = "title-item";
    starEL.className = "fa-solid fa-star";
    textEL.className = "text";
    titleEL.appendChild(starEL);
    titleEL.appendChild(textEL);

    titleEL.style.backgroundImage = `url(${image})`;
    textEL.textContent = spotTitle;

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

function loadMoreData() {
  const endIndex = currentItem + 10;
  for (let i = currentItem; i < endIndex; i++) {
    if (i >= spots.length) {
      break;
    }
    displaySpotData(spots[i], i);
  }
  currentItem = endIndex;
  if (currentItem >= spots.length) {
    loadMoreBtn.disabled = true;
  }
}

loadMoreBtn.addEventListener("click", loadMoreData);

getData();