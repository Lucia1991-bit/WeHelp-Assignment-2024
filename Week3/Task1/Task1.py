import csv
import json
import urllib.request

# 處理Mac系統異常
import ssl
ssl._create_default_https_context = ssl._create_unverified_context


# 發送HTTP GET請求取得網站上的資訊
src = "https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-1"

src2 = "https://padax.github.io/taipei-day-trip-resources/taipei-attractions-assignment-2"

try:
    with urllib.request.urlopen(src) as response:
        data = json.loads(response.read().decode('utf-8'))
    with urllib.request.urlopen(src2) as response2:
        data2 = json.loads(response2.read().decode('utf-8'))

except Exception as error:
    print(f"Request Failed: {error}")


# 解析資料，取出需要的部分
spot_data = data["data"]["results"]
mrt_data = data2["data"]


# 觀察資料發現每個捷運的SERIAL_NO能對上一個景點，並含有該景點地址
# 兩個資料陣列長度一樣
def put_district_and_mrt_into_spots(spots, mrts):
    # 取每個捷運站的SERIAL_NO值創建一個字典方便對照：
    # ====mrt_dict = {mrt["SERIAL_NO"]: {剩下的mrt資料} }
    mrt_dict = {mrt["SERIAL_NO"]: mrt for mrt in mrts}

    for spot in spots:
        # 互相比對是否有相同的 SERIAL_NO
        # ====這裡是用spots的 SERIAL_NO值跟mrt_dict的key比較
        # ====創建新字典，將捷運資料中需要的資訊放進景點資料
        same_number_key = spot["SERIAL_NO"]

        if same_number_key in mrt_dict:

            # 如果SERIAL_NO相同，在該spot中新增 {MRT: XX站}字典
            mrt = mrt_dict[same_number_key]["MRT"]
            spot.setdefault("MRT", mrt)

            # 擷取 address中的 district
            # ====觀察到 address中台北市與 district間是用空格隔開
            # ====取split後陣列["台北市", " ", "剩下的地址"]的第三個元素的字串
            # ====再取前三個字(台北市都是XX區三個字)
            district = mrt_dict[same_number_key]["address"].split(" ")[2][:3]
            spot.setdefault("district", district)
    return spots


# # 輸出spot.csv
def output_sopt_csv(spots, mrts):
    with open("spot.csv", "w", encoding='utf-8', newline="") as file:
        writer = csv.writer(file)
        # 欄位名稱
        writer.writerow(["景點名稱", "區域", "經度", "緯度", "圖片網址"])

        # 合併整理兩筆資料
        new_data = put_district_and_mrt_into_spots(spots, mrts)

        # 檢查整理好的資料
        for spot in new_data:

            # 取得景點名稱
            spot_title = spot["stitle"]
            # 取得區域
            district = spot["district"]
            # 取得經度
            longitude = spot["longitude"]
            # 取得緯度
            latitude = spot["latitude"]
            # 取得第一張圖片網址
            # [" ", "去掉https://後的第一個網址", ...]
            image_url = "https://" + spot["filelist"].split('https://')[1]

            writer.writerow([spot_title, district,
                            longitude, latitude, image_url])


# 以捷運站名將景點分組
# ====創建{捷運站: [景點1, 景點2...]}的字典
def group_spots_by_mrt(data):
    mrt_group = {}

    # 如果spot的捷運站不在字典中，創建新key，並將該spot加進景點陣列中
    for spot in data:
        mrt = spot["MRT"]
        if mrt not in mrt_group:
            mrt_group[mrt] = []
        mrt_group[mrt].append(spot["stitle"])

    return mrt_group


# ＃ 輸出mrt.csv
def output_mrt_csv(spots, mrts):
    with open("mrt.csv", "w", encoding="utf-8", newline="") as file:
        # 合併整理兩筆資料
        new_data = put_district_and_mrt_into_spots(spots, mrts)
        # 以捷運站名將景點分組
        mrt_and_spots = group_spots_by_mrt(new_data)

        # 欄位名稱
        # 需將每個景點個別分開
        # ===找出最長的景點陣列
        max_sopts = max(len(spot) for spot in mrt_and_spots.values())

        # 欄位名稱
        # ===已得知最長景點為6個
        chinese_num = ["一", "二", "三", "四", "五", "六"]

        fieldnames = ["捷運站"] + [f"景点{chinese_num[i]}"
                                for i in range(max_sopts)]

        # 分組好的捷運景點資料是字典，使用 csv.DictWriter寫入
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for mrt, spots in mrt_and_spots.items():
            # 創建新字典
            row = {'捷運站': mrt}
            for i, spot in enumerate(spots):
                row[f"景点{chinese_num[i]}"] = spot
            writer.writerow(row)


# # 將檔案輸出至spot.csvx
output_sopt_csv(spot_data, mrt_data)

# # 將檔案輸出至mrt.csv
output_mrt_csv(spot_data, mrt_data)
