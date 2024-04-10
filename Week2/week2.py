# ===================== Task 1 =====================
# 解題思路：
# 1.將捷運圖做成有順序的陣列
# 2.將message與currentSation與捷運資料比對，得到雙方所在捷運站的index

# 支線處理:（可能不適合路線負責的情況...)
# 小碧潭index設定與七張相同(防止距離七張下兩站比七張還近的情況)
# 小碧潭到其他站距離 = 七張到其他站距離 + 1（因到其他站都應需多經過七張）

# 4.計算各站距離（index相減）
# 5.比較距離大小，若有相同最小值距離，則將名字一同存進陣列，轉換為字串回傳

mrt_stations = [
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
]

messages = {
    "Bob": "I'm at Ximen MRT station.",
    "Mary": "I have a drink near Jingmei MRT station.",
    "Copper": "I just saw a concert at Taipei Arena.",
    "Leslie": "I'm at home near Xiaobitan station.",
    "Vivian": "I'm at Xindian station waiting for you.",
}

# 獲取捷運站的index


def get_location_index(location):
    if location == "Xiaobitan":
        return mrt_stations.index("Qizhang")
    else:
        return mrt_stations.index(location)


def find_and_print(messages, current_station):
    nearest = None
    nearest_distance = None
    distance = None
    # 處理message:獲取站名及index
    # 跟mrt_Station比對，如果有相同站名就取出來存在新變數
    for name, message in messages.items():
        friend_location = None
        for station in mrt_stations:
            if station in message:
                friend_location = station
        # 也可用next()配上理解式比較簡潔
        # friendLocation = next(
        #     (station for station in mrtStations if station in message), None)

        current_station_index = get_location_index(current_station)
        friend_location_index = get_location_index(friend_location)

        # 計算各站距離
        # 支線處理：
        # 小碧潭站與其他站距離 = 七張站與其他站的距離 + 1
        bias = 0
        if current_station == "Xiaobitan" or friend_location == "Xiaobitan":
            bias += 1
        distance = abs(current_station_index - friend_location_index) + bias

        # 檢查是否找到了一個到目前車站距離較短的朋友
        # 如果是，將 nearest 重置為只包含這個朋友，並更新最小距離。
        if nearest_distance == None or distance < nearest_distance:
            nearest = [name]
            nearest_distance = distance
        elif distance == nearest_distance:
            nearest.append(name)
    print("".join(nearest))


find_and_print(messages, "Wanlong")            # print Mary
find_and_print(messages, "Songshan")           # print Copper
find_and_print(messages, "Qizhang")            # print Leslie
find_and_print(messages, "Ximen")              # print Bob
find_and_print(messages, "Xindian City Hall")  # print Vivian

print("=============")

# ==================== Task 2 ====================
# 在諮詢師資料中增加時間表追蹤
# bookTimes: [{start: startTime, end: endTime}]
# 如果時間表有空，就將諮詢師加入availble陣列

# 將有空的諮詢師按優先條件排序
# 選擇符合條件的諮詢師，若沒有則印“No service”
# 更新預約

consultants = [
    {"name": "John", "rate": 4.5, "price": 1000},
    {"name": "Bob", "rate": 3, "price": 1200},
    {"name": "Jenny", "rate": 3.8, "price": 800}
]


# 檢查時間表跟預約有沒有重疊
def is_available(consultant, hour, duration):
    for schedule in consultant["schedules"]:
        book_end_time = hour + duration
        if hour < schedule["end_time"] and book_end_time > schedule["start_time"]:
            return False
    return True


def book(consultants, hour, duration, criteria):
    available_consultants = []

    # 檢查預約間表
    # 如果沒有時間表就新增
    for consultant in consultants:
        if "schedules" not in consultant:
            consultant["schedules"] = []

        # 檢查是否有空
        # 如果有空，就將顧問加進陣列
        if is_available(consultant, hour, duration):
            available_consultants.append(consultant)

    # 如果有空，按照不同要求排序，並選取最符合的諮詢師
    # 更新被選中的諮詢師的時間表
    if len(available_consultants) > 0:
        if criteria == "price":
            available_consultants.sort(key=lambda x: x["price"])
            selected_consultant = available_consultants[0]

        elif criteria == "rate":
            available_consultants.sort(key=lambda x: x["rate"], reverse=True)
            selected_consultant = available_consultants[0]

        selected_consultant["schedules"].append({
            "start_time": hour,
            "end_time": hour + duration
        })

        print(selected_consultant["name"])

    else:
        print("No Service")


book(consultants, 15, 1, "price")  # Jenny
book(consultants, 11, 2, "price")  # Jenny
book(consultants, 10, 2, "price")  # John
book(consultants, 20, 2, "rate")  # John
book(consultants, 11, 1, "rate")  # Bob
book(consultants, 11, 2, "rate")  # No Service
book(consultants, 14, 3, "price")  # John

print("=============")

# ==================== Task 3 ====================
# 解題思路：
# 建立紀錄所有中間名出現次數的Dict
# middle_count {
#     middle_name: {
#         counter: 0,
#         full_names: []
#     }
# }
# Loop傳進來的資料，根據不同長度名字的情況，將中間名存進Dict
# 檢查中間名的字有沒有在Dict裡，有就把counter+1，並把名字push進陣列
# 如果沒有就建立新的物件
# Loop Dict，回傳counter只有1的名字，如果沒有就回傳“沒有”


def check_counter(middle_names):
    # loop 每個middle_name子字典
    # 如果counter == 1 印出對應的全名
    not_found = True
    for middle_name in middle_names:
        if middle_name["counter"] == 1:
            not_found = False
            full_name = " ".join(middle_name["full_name"])
            print(full_name)
    # 找一圈都沒有，印出“沒有”
    if not_found:
        print("沒有")


def func(*data):
    middle_count = {}
    middle_name = None

    # loop傳進來的字串list，根據名字長度找出中間名
    # 檢查中間名有沒有在Dict裡面，有就增加counter並且把對應的全名放進去
    # 如果沒有就創建新的
    for name in data:
        middle_name = name[len(name) // 2]

        if middle_name in middle_count:
            middle_count[middle_name]["counter"] += 1
        else:
            middle_count[middle_name] = {
                "counter": 1,
                "full_name": []
            }
            middle_count[middle_name]["full_name"].append(name)

    # 檢查Dict中的中間名counter
    # 把字典middle_count的值(middle_name子字典)傳進去
    check_counter(middle_count.values())


func("彭大牆", "陳王明雅", "吳明")  # print 彭大牆
func("郭靜雅", "王立強", "郭林靜宜", "郭立恆", "林花花")  # print 林花花
func("郭宣雅", "林靜宜", "郭宣恆", "林靜花")  # print 沒有
func("郭宣雅", "夏曼藍波安", "郭宣恆")  # print 夏曼藍波安
# func("彭大牆", "郭靜雅", "郭宣恆", "林花花")  # print 全部

print("=============")

# ====================Task 4====================
# 找出數列的關係性，印出第n個的值
#  解題思路：
#          |----7----||----7----||----7----||---
#              -3 +1    -3  +1      -3  +1
# value:    0, 4, 8, 7, 11, 15, 14, 18, 22, 21, 25
# index(n): 0, 1, 2, 3,  4,  5, 6,  7,  8,  9,  10

# n = 3, 6, 9     7*(n/3)            if n % 3 == 0
# n = 1, 4, 7     7*((n+2)/3) - 3    if n % 3 == 1
# n = 2, 5, 8     7*((n+1)/3) + 1    if n % 3 == 2


def get_number(index):
    value = 0
    if index % 3 == 0:
        value = 7 * (index // 3)
    elif index % 3 == 1:
        value = 7 * ((index + 2) // 3) - 3
    elif index % 3 == 2:
        value = 7 * ((index + 1) // 3) + 1
    print(value)


get_number(1)   # print 4
get_number(5)   # print 15
get_number(10)  # print 25
get_number(30)  # print 70
