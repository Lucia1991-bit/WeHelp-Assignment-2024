//====================Task 1====================
// 解題思路：
//1.將捷運圖做成有順序的陣列
//2.將message與currentSation與捷運資料比對，得到雙方所在捷運站的index

//支線處理:
//支線處理:（可能不適合路線複雜的情況...)
// 小碧潭index設定與七張相同(防止距離七張下兩站比七張還近的情況)
// 小碧潭到其他站距離 = 七張到其他站距離 + 1（因到其他站都應需多經過七張）

//4.計算各站距離（index相減）
//5.比較距離大小，若有相同最小值距離，則將名字一同存進陣列，轉換為字串回傳

const mrtStations = [
  "Songshan",
  "Nanjing Shanmin",
  "Taipei Arena",
  "Nanjing Fuxing",
  "Songjiang Nanjing",
  "Zhongshan",
  "Beimen",
  "Ximen",
  "Xiaonanmen",
  "Chiang Kai-Shek Memorial Hall",
  "Guting",
  "Taipower Building",
  "Gongguan",
  "Wanlong",
  "Jingmei",
  "Dapinglin",
  "Qizhang",
  "Xiaobitan",
  "Xindian City Hall",
  "Xindian",
];

const messages = {
  Bob: "I'm at Ximen MRT station.",
  Mary: "I have a drink near Jingmei MRT station.",
  Copper: "I just saw a concert at Taipei Arena.",
  Leslie: "I'm at home near Xiaobitan station.",
  Vivian: "I'm at Xindian station waiting for you.",
};

//取得車站的index
function getLocationIndex(location) {
  //支線處理：如果是小碧潭，回傳與七張相同的index
  if (location === "Xiaobitan") {
    return mrtStations.indexOf("Qizhang");
  }
  return mrtStations.indexOf(location);
}

function findAndPrint(messages, currentStation) {
  let nearest;
  let nearestDistance;

  //處理message與currentStation
  //Object.entries將messages變成[{Bob: "..."}, {Mary: "..."}]的陣列
  //[friend, message]是解構語法，將該陣列每個元素的Key指定給friend，"..."訊息指定給message
  Object.entries(messages).forEach(([friend, message]) => {
    //與mrtStation比對，找出message中的車站名
    let friendLocation = mrtStations.find((station) =>
      message.includes(station)
    );

    let currentStationIndex = getLocationIndex(currentStation);
    let friendStationIndex = getLocationIndex(friendLocation);

    //計算各站距離
    //支線處理：
    //小碧潭站與其他站距離 = 七張站與其他站的距離 + 1
    let bias = 0;
    if (currentStation === "Xiaobitan" || friendLocation === "Xiaobitan") {
      bias += 1;
    }
    let distance = Math.abs(friendStationIndex - currentStationIndex) + bias;

    //檢查是否找到了一個到目前車站距離較短的朋友
    //如果是，將 nearest 重置為只包含這個朋友，並更新最小距離。
    if (nearestDistance === undefined || distance < nearestDistance) {
      nearest = [friend];
      nearestDistance = distance;
    } else if (distance === nearestDistance) {
      nearest.push(friend); // 如果有人距離與最小距離一樣，則增加朋友至陣列
    }
  });

  //nearest包含一個或多個最近的朋友
  console.log(nearest.join(" "));
}

findAndPrint(messages, "Wanlong"); // print Mary
findAndPrint(messages, "Songshan"); // print Copper
findAndPrint(messages, "Qizhang"); // print Leslie
findAndPrint(messages, "Ximen"); // print Bob
findAndPrint(messages, "Xindian City Hall"); // print Vivian

console.log("==============");

//====================Task 2====================
//1.在諮詢師資料中增加時間表追蹤
//  bookTimes: [{start: startTime, end: endTime}]
//2.如果時間表有空，就將諮詢師加入availble陣列

//3.將有空的諮詢師按優先條件排序
//4.選擇符合條件的諮詢師，若沒有則印“No service”
//5.更新預約

const consultants = [
  { name: "John", rate: 4.5, price: 1000 },
  { name: "Bob", rate: 3, price: 1200 },
  { name: "Jenny", rate: 3.8, price: 800 },
];

function book(consultants, hour, duration, criteria) {
  const availableConsultants = [];

  //處理預約時間
  for (let consultant of consultants) {
    // 檢查是否已經有時間表，如果沒有則新增一個空的時間表
    if (!consultant.hasOwnProperty("schedules")) {
      consultant["schedules"] = [];
    }

    //檢查是否有空(預約時間不能和時間表時間重疊)
    let isAvailable = consultant.schedules.every((schedule) => {
      let bookEndTime = hour + duration;
      return !(hour < schedule.endTime && bookEndTime > schedule.startTime);
    });

    //如果有空，就將諮詢師加入陣列
    if (isAvailable) {
      availableConsultants.push(consultant);
    }
  }

  if (availableConsultants.length > 0) {
    let selectedConsultant;
    //優先選價格低，所以升序排列
    if (criteria === "price") {
      availableConsultants.sort((a, b) => a.price - b.price);
      selectedConsultant = availableConsultants[0];
    }

    //優先選擇評價高，所以降序排列
    else if (criteria === "rate") {
      availableConsultants.sort((a, b) => b.rate - a.rate);
      selectedConsultant = availableConsultants[0];
    }

    //在被選中的顧問加入預約時間
    //(因為這些資料都是指向原陣列的參考，更新後原本的時間表也會更新)
    selectedConsultant["schedules"].push({
      startTime: hour,
      endTime: hour + duration,
    });

    console.log(selectedConsultant.name);
  } else {
    console.log("No Service");
  }
}

book(consultants, 15, 1, "price"); // Jenny
book(consultants, 11, 2, "price"); // Jenny
book(consultants, 10, 2, "price"); // John
book(consultants, 20, 2, "rate"); // John
book(consultants, 11, 1, "rate"); // Bob
book(consultants, 11, 2, "rate"); // No Service
book(consultants, 14, 3, "price"); // John

console.log("==============");

//====================Task 3====================
//解題思路：
//1.建立紀錄所有中間名出現次數的Obj
// middleCount {
//   middleName: {
//     counter: 0,
//     fullNames: []
//   }
// }
//2.Loop傳進來的資料，根據不同長度名字的情況，將中間名存進Obj
//3.檢查中間名有沒有在Obj裡，有就把counter+1，並把名字push進陣列
//4.如果沒有就建立新的Key: Value
//5.Loop Obj，回傳counter只有1的名字，如果沒有就回傳“沒有”

function checkNameCount(obj) {
  let notFound = true;
  for (item in obj) {
    if (obj[item].counter === 1) {
      notFound = false;
      console.log(obj[item].fullNames.join(" "));
    }
  }
  if (notFound) {
    console.log("沒有");
  }
}

function func(...data) {
  const middleCount = {};

  //根據名字長度不同找出middleName
  for (let name of data) {
    let middleName = name[Math.floor(name.length / 2)];
    //檢查MiddleName在middleCount中是否存在，不存在就創建新的
    if (middleCount.hasOwnProperty(middleName)) {
      middleCount[middleName].counter += 1;
    } else {
      middleCount[middleName] = {
        counter: 1,
        fullNames: [],
      };
    }
    middleCount[middleName].fullNames.push(name);
  }

  //檢查nameCount裡middleName的counter
  checkNameCount(middleCount);
}

func("彭大牆", "陳王明雅", "吳明"); // print 彭大牆
func("郭靜雅", "王立強", "郭林靜宜", "郭立恆", "林花花"); // print 林花花
func("郭宣雅", "林靜宜", "郭宣恆", "林靜花"); // print 沒有
func("郭宣雅", "夏曼藍波安", "郭宣恆"); // print 夏曼藍波安

console.log("==============");

//====================Task 4====================
//找出數列的關係性，印出第n個的值
// 解題思路：
//         |----7----||----7----||----7----||---
//             -3 +1    -3  +1      -3  +1
//value:    0, 4, 8, 7, 11, 15, 14, 18, 22, 21, 25
//index(n): 0, 1, 2, 3,  4,  5, 6,  7,  8,  9,  10

//n = 3, 6, 9     7*(n/3)            if n % 3 == 0
//n = 1, 4, 7     7*((n+2)/3) - 3    if n % 3 == 1
//n = 2, 5, 8     7*((n+1)/3) + 1    if n % 3 == 2

function getNumber(index) {
  let value = 0;
  if (index % 3 === 0) {
    value = 7 * Math.floor(index / 3);
  } else if (index % 3 == 1) {
    value = 7 * Math.floor((index + 2) / 3) - 3;
  } else {
    value = 7 * Math.floor((index + 1) / 3) + 1;
  }
  console.log(value);
}

getNumber(1); // print 4
getNumber(5); // print 15
getNumber(10); // print 25
getNumber(30); // print 70

console.log("==============");

// ====================Task 5====================
// 比較兩個車廂陣列，將可載客且座位數大於乘客數的車廂連同index資料以Obj方式存進陣列
// 如果沒有符合條件的車廂，回傳-1
// 將符合條件的車廂資料與乘客數n比較，找出座位與乘客數最接近的車廂，回傳車廂index

function find(spaces, stat, n) {
  //先把可載客的車廂篩出來
  //將車廂索引及車廂座位以字典方式存進陣列
  const freeSeats = [];
  for (let i = 0; i < spaces.length; i++) {
    if (stat[i] === 1 && spaces[i] >= n) {
      freeSeats.push({ index: i, seat: spaces[i] });
    }
  }

  //如果沒有可載客車廂，回傳-1
  let bestFit;
  if (freeSeats.length === 0) {
    return -1;
  } else {
    //在可載客的選項中找出座位與乘客數量最接近的車廂，回傳車廂index
    bestFit = freeSeats.reduce(function (prev, curr) {
      if (Math.abs(curr.seat - n) < Math.abs(prev.seat - n)) {
        return curr;
      } else {
        return prev;
      }
    });
  }
  return bestFit.index;
}

console.log(find([3, 1, 5, 4, 3, 2], [0, 1, 0, 1, 1, 1], 2)); // print 5
console.log(find([1, 0, 5, 1, 3], [0, 1, 0, 1, 1], 4)); // print -1
console.log(find([4, 6, 5, 8], [0, 1, 1, 1], 4)); // print 2
