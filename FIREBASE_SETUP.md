# v7.9.0 Firebase 跨裝置同步驗收

本版新增跨裝置同步實測報告匯出。

## 驗收流程

1. 在 Firebase Console 啟用 Email / Password 登入。
2. 部署 Firestore Rules，確保 `saves` 與 `history` 僅限本人 UID 讀寫。
3. 在電腦登入並上傳存檔。
4. 在手機登入同一帳號並下載存檔。
5. 分別離線修改不同章回或裝備。
6. 重新連線，確認合併預覽可分別勾選章回、英雄、裝備與建築。
7. 匯出 Firebase 跨裝置同步報告 JSON。

未設定 Firebase 時，本遊戲仍可完全離線遊玩。
