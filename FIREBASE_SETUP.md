# Firebase 可選雲端存檔設定

未設定 Firebase 時，遊戲仍可使用 IndexedDB、localStorage 鏡像與十份輪替備份，完全離線遊玩。

## 建立專案

1. 在 Firebase Console 建立專案。
2. 在「Authentication → Sign-in method」啟用 **Email/Password**。
3. 建立 Cloud Firestore 資料庫。
4. 將本資料夾的 `firebase.rules` 貼到 Firestore Rules 並發布。
5. 在「專案設定 → 你的應用程式」新增 Web App，取得 `apiKey`、`projectId` 與 `authDomain`。
6. 開啟遊戲的「雲端」頁，填入上述設定。

## 安全原則

- 遊戲不會把 Firebase 密碼寫入存檔或 localStorage；登入權杖只保存在目前分頁工作階段的 sessionStorage。
- Firebase Web API Key 是專案識別設定，不應被當成伺服器私鑰；真正的存取限制由 Authentication 與 Firestore Rules 執行。
- 規則只允許登入者讀寫 `users/{自己的 uid}/saves/main`。

## 同步流程

- 「上傳本機」：計算 SHA-256 後，把完整匯出資料寫入自己的 Firestore 文件。
- 「比較並下載」：先驗證 Schema 與校驗碼，再比較完成章回數及更新時間。
- 遊戲不會自動覆蓋本機，套用雲端前會建立 IndexedDB 備份。
