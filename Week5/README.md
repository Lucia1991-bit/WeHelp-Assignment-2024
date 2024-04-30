# Week5 mySQL 任務操作說明
## Task2:

1. 建立新資料庫 website：
```SQL
CREATE DATABASE webite;
```
![ScreenShot1](./image/截圖%202024-04-29%20下午6.02.36.png "截圖1")

<br>

2. 按照指定格式，創建新表單member：
```SQL
CREATE TABLE member(
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  follower_count INT UNSIGNED NOT NULL DEFAULT 0,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
```
![ScreenShot2](./image/截圖%202024-04-29%20下午6.38.45.png "截圖2")
![ScreenShot3](./image/截圖%202024-04-29%20下午6.43.56.png "截圖3")

<br>

## Task3:
1. 輸入資料：
```sql
/*輸入任意資料，第一筆 username, password設為 test*/
/*===需單獨執行 INSERT 語句。每個語句才會記錄在不同的時間點*/

INSERT INTO member (name, username, password, follower_count) 
VALUE ('test', 'test', 'test', '100');

INSERT INTO member (name, username, password, follower_count) 
VALUE ('Yuichi Nakamura', 'user1', 'password', '500');

INSERT INTO member (name, username, password, follower_count)
VALUE ('Junichi Okada', 'user2', 'password2', '40');

INSERT INTO member (name, username, password, follower_count)
VALUE ('Ryan Gosling', 'user3', 'password3', '80');

INSERT INTO member (name, username, password, follower_count)
VALUE ('Yokoyama You', 'user4', 'password4', '60');
```
![ScreenShot4](./image/截圖%202024-04-30%20下午5.38.45.png "截圖4")

<br>

1. 取得所有在 member 資料表中的會員資料：
```sql
SELECT * FROM member;
```
![ScreenShot5](./image/截圖%202024-04-30%20下午5.12.13.png "截圖5")

<br>

3. 取得所有在 member 資料表中的會員資料，按照 time 欄位時間由新至舊排列：
```sql
SELECT * FROM member
ORDER BY time DESC; 
```
![ScreenShot6](./image/截圖%202024-04-30%20下午5.14.13.png "截圖6")

<br>

4. 按照欄位 time 時間由新至舊降序排列，取得排名第二至第四筆資料：
```sql
SELECT * FROM member
ORDER BY time DESC
LIMIT 3 OFFSET 1;
```
![ScreenShot7](./image/截圖%202024-04-30%20下午5.14.42.png "截圖7")

<br>

5. 取得欄位 username 為 “test” 的資料：
```sql
SELECT * FROM member
WHERE username = 'test';
```
![ScreenShot8](./image/截圖%202024-04-30%20下午5.15.29.png "截圖8")

<br>

6. 取得欄位 name 含有 “es” 的資料：
```sql
SELECT * FROM member
WHERE name LIKE '%es%'
```
![ScreenShot9](./image/截圖%202024-04-30%20下午5.16.12.png "截圖9")

<br>

7. 取得欄位 username 與欄位 password 同為 “test” 的資料：
```sql
SELECT * FROM member
WHERE username = 'test' AND password = 'test';
```
![ScreenShot10](./image/截圖%202024-04-30%20下午5.16.43.png "截圖10")

<br>

8. 找出欄位 username 等於 test 的資料 ，將這筆資料的 name 欄位的值更新為 ”test2“：
```sql
UPDATE member SET name = 'test2'
WHERE username = 'test';
```
![ScreenShot11](./image/截圖%202024-04-30%20下午5.17.45.png "截圖11")

<br>

## Task4:
1. 取得 member 資料表中，總共有幾筆資料：
```sql
SELECT COUNT(*) AS 'total members' FROM member;
```
![ScreenShot12](./image/截圖%202024-04-29%20晚上11.35.16.png "截圖12")

<br>

2. 取得 member資料表中，follower_count 欄位的總和：
```sql
SELECT SUM(follower_count) AS 'total followers' FROM member;
```
![ScreenShot13](./image/截圖%202024-04-30%20凌晨12.12.35.png "截圖13")

<br>

3. 取得 member資料表中，follower_count 欄位的平均：
```sql
SELECT AVG(follower_count) AS 'average followers' FROM member;
```
![ScreenShot14](./image/截圖%202024-04-30%20凌晨12.18.38.png "截圖14")

<br>

4. 將 member 資料表按照 follower_count 遞減排序，取得前 2 名的資料，並計算其 follower_count 的平均值：
```sql
CREATE VIEW top_two_follower_count AS
SELECT follower_count
FROM member
ORDER BY follower_count DESC
LIMIT 2;

SELECT AVG(follower_count) AS 'average of top two followers'
FROM top_two_follower_count;
```
![ScreenShot15](./image/截圖%202024-04-30%20凌晨1.49.58.png "截圖15")
![ScreenShot16](./image/截圖%202024-04-30%20凌晨1.50.15.png "截圖16")

<br>

## Task5:
1. 在website資料庫中，按照指定格式，創建新表單message：
```sql
CREATE TABLE message(
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  content VARCHAR(255) NOT NULL,
  like_count INT UNSIGNED NOT NULL  DEFAULT 0,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES member(id)
  );
```
![ScreenShot17](./image/截圖%202024-04-30%20下午1.39.16.png "截圖17")
![ScreenShot18](./image/截圖%202024-04-30%20下午1.39.29.png "截圖18")

<br>

> 輸入留言
```sql
INSERT INTO message (member_id, content, like_count)
VALUES (3, 'New member here! Excited to learn and share.', 39);

INSERT INTO message (member_id, content, like_count)
VALUES (2, 'Cute squirrel chasing acorns in the park today.', 50);

INSERT INTO message (member_id, content, like_count)
VALUES (5, 'Completed 3-month fitness program. Feeling great!', 20);

INSERT INTO message (member_id, content, like_count)
VALUES (4, 'Thoughts on the new Italian place downtown?', 14);

INSERT INTO message (member_id, content, like_count)
VALUES (1, 'New member here! Excited to learn and share.', 40);
```
![ScreenShot19](./image/截圖%202024-04-30%20下午2.04.52.png "截圖19")

<br>

2. 透過 JOIN 與 member 資料表關聯，取得 message資料表所有留言，結果需包含發送者的姓名：
```sql
SELECT 
  m1.id AS 'message id',
  m2.name AS 'member name',
  m1.content,
  m1.like_count,
  m1.time
FROM message m1
JOIN member m2 ON m1.member_id = m2.id; 
```
![ScreenShot20](./image/截圖%202024-04-30%20下午2.26.30.png "截圖20")

<br>

3. 透過 JOIN 與 member 資料表關聯，取得 message 資料表中欄位對應 username 是 test 的所有留言，結果需包含發送者的姓名：
>新增兩則 usetname為‘test’的留言
```sql
INSERT INTO message (member_id, content, like_count)
VALUES (1, 'My birthday tomorrow! Beach getaway with family.', 12);

INSERT INTO message (member_id, content, like_count)
VALUES (1, 'Travel recommendations for next month\'s trip?', 42);
```

>選取所有 usetname為‘test’的留言
```sql
SELECT 
  m1.id AS 'message id',
  m2.name AS 'member name',
  m1.content,
  m1.like_count,
  m1.time
FROM message m1
JOIN member m2 ON m1.member_id = m2.id
WHERE m2.username = 'test';
```
![ScreenShot21](./image/截圖%202024-04-30%20下午5.31.17.png "截圖21")

<br>

1. 透過 JOIN 與 member 資料表關聯，取得 message 資料表中欄位對應 username 是 test 的平均按讚數：

>計算平均按讚數
```sql
SELECT username, AVG(like_count) AS 'average likes'
FROM message m1
JOIN member m2 ON m1.member_id = m2.id
WHERE m2.username = 'test';
```
![ScreenShot23](./image/截圖%202024-04-30%20下午3.51.25.png "截圖23")

<br>

5. 透過 JOIN 與 member 資料表關聯，取得 message 資料表中的平均按讚數，並以 member 資料表的username分類：
```sql
SELECT m2.username, AVG(like_count) AS 'average likes'
FROM message m1
JOIN member m2 ON m1.member_id = m2.id
GROUP BY m2.username;
```
![ScreenShot24](./image/截圖%202024-04-30%20下午3.51.16.png "截圖24")

<br>

### Export
> 透過 mysqldump 語法匯出資料庫 (需離開mysql後執行)

```sql
 mysqldump -u root -p website > data.sql;
```
