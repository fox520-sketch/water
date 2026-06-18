# Firebase 跨裝置同步驗收流程 v7.7.0

## 必要服務

- Firebase Authentication：Email / Password
- Cloud Firestore

## 驗收流程

1. 電腦 A 登入 Firebase，完成第一回並上傳。
2. 手機 B 使用同帳號登入，下載雲端存檔。
3. 手機 B 完成第二回，上傳新版本。
4. 電腦 A 離線完成第三回，重新連線後開啟合併預覽。
5. 檢查細項：
   - 章回：本機獨有、雲端獨有
   - 英雄：等級差異
   - 裝備：獨有裝備與同 ID 衝突
   - 建築與遠征紀錄
6. 選擇智慧合併，確認合併前已建立本機備份。
7. 從雲端歷史版本還原上一版，確認還原前再次備份。

## 權限規則

`firebase.rules` 已限制：

- `users/{uid}/saves/main` 僅本人可讀寫
- `users/{uid}/history/{version}` 僅本人可讀寫

請在 Firebase Rules Simulator 測試帳號 A 不可讀取帳號 B。
