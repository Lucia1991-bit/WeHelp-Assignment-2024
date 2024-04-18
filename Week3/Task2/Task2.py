import csv
import urllib.request as req
import bs4

# 處理Mac系統異常
import ssl
ssl._create_default_https_context = ssl._create_unverified_context


# 發送HTTP GET請求取得網站上的資訊
# 建立request物件，附加request headers資訊
def get_page_html(url):
    headers = {
        "Cookie": "over18=1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"}
    request = req.Request(url, headers=headers)
    try:
        with req.urlopen(request) as response:
            html_content = response.read().decode('utf-8')
    except request.HTTPError as http_error:
        print(f"HTTP error occurred: {http_error}")
    except Exception as error:
        print(f"Other error occurred: {error}")
    # 解析原始碼
    soup = bs4.BeautifulSoup(html_content, "lxml")
    return soup


# 獲取標題及按讚數
def get_titles_and_likes(soup):

    # 獲取標題
    # <div class="title"><a href="/bbs/Lottery/M.1713346663.A.5A9.html">[報牌]39二合</a></div>
    # ===包在<div class="title">及<a>底下
    titles_with_tag = soup.find_all("div", class_="title")
    titles = [item.a.string for item in titles_with_tag if item.a != None]

    # 獲取按讚數
    # <div class="r-ent"><div class="nrec"> <span class="hl f2"> 1 </span> </div> ...</div>
    # ===如果按讚數為0的話，<span>不存在
    # ===如果文章被刪除，<span>也不存在，必須排除
    likes_with_tag = soup.find_all("div", class_="r-ent")
    likes = []
    for i, item in enumerate(likes_with_tag):
        # 如果<span>不存在，補上0
        if item.div.span == None:
            # 排除文章被刪除的情況
            if titles_with_tag[i].a == None:
                pass
            else:
                likes.append("0")
        else:
            likes.append(item.div.span.string)
    return titles, likes


# 獲取每篇文章的日期
def get_dates(soup):
    # 獲取標題的連結
    titles_with_tag = soup.find_all("div", class_="title")
    title_link_with_tag = [
        item.a for item in titles_with_tag if item.a != None]
    links = ["https://www.ptt.cc" + a.get("href") for a in title_link_with_tag]

    # 連結進每個標題網址
    dates = []
    for i, link in enumerate(links):
        article = get_page_html(link)
        # print(article)
        # 觀察資料總共有四組<class="article-metaline"><"article-meta-value">
        # 用CSS選擇器選取包含時間的第四組
        date_with_tag = article.select_one(
            ".article-metaline:nth-of-type(4) .article-meta-value")
        # 如果沒有找到時間，填入空字串
        if date_with_tag == None:
            dates.append(" ")
        else:
            dates.append(date_with_tag.string)
    return dates


# 爬取三頁
# 由上一頁button獲取上一頁的連結
# =====<a class="btn wide" href="/bbs/Lottery/index2079.html">‹ 上頁</a>
def get_previous_link(soup):
    previous_link_with_tag = soup.find("a", string="‹ 上頁")
    previous_link = "https://www.ptt.cc" + previous_link_with_tag["href"]
    return previous_link


# 整合取得的一頁資料
# 將所有資料合併成字典陣列
# [ {標題: [按讚數, 時間]}, {標題: [按讚數, 時間]} ]
def process_data(url):
    soup = get_page_html(url)
    titles, likes = get_titles_and_likes(soup)
    dates = get_dates(soup)
    result = [{"標題": title, "按讚數": like, "發文時間": date}
              for title, like, date in zip(titles, likes, dates)]
    return result


# 合併所有頁面資料
src = "https://www.ptt.cc/bbs/Lottery/index.html"

all_data = []

# 爬取三頁資料
for i in range(3):
    soup = get_page_html(src)  # 獲取第一頁html
    data = process_data(src)[::-1]  # 獲取第一頁需要的資料，把每頁最新文章放到最前面
    all_data.extend(data)    # 把獲取的頁面陣列合併，使用extend()可以直接修改原陣列

    previous_link = get_previous_link(soup)
    src = get_previous_link(soup)  # 更新連結（換成前一頁連結）


# 輸出至article.csv
with open("article.csv", "w", encoding="utf-8", newline="") as file:
    fieldnames = ["標題", "按讚數", "發文時間"]
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    for row in all_data:
        writer.writerow(row)
