# v7.6.0 Firebase 雲端存檔設定

1. 在 Firebase Console 建立專案。
2. Authentication → Sign-in method，啟用 Email/Password。
3. 建立 Firestore Database。
4. 使用 Firebase CLI 或 Console 部署本包的 `firebase.rules`。
5. Project settings → Your apps，建立 Web App。
6. 在遊戲「雲端」頁填入：
   - API Key
   - Project ID
   - Auth Domain
7. 建立測試帳號，執行「Firebase 真實連線診斷」。
8. 使用兩台裝置驗證上傳、比較、智慧合併與歷史還原。

Firebase 網頁 API Key 不是私密金鑰。資料安全依靠 Authentication 與 Firestore Rules；仍不得把管理員私鑰、Service Account JSON 或私人憑證上傳 GitHub。
