# v7.9.0 GitHub Pages 部署步驟

1. 先備份目前 v7.8.0 專案資料夾。
2. 解壓縮 `Liangshan_v7.9.0_UpdateFiles.zip`。
3. 將內容覆蓋到 GitHub Pages 專案根目錄。
4. Commit 並 push。
5. 開啟公開網址 `/update.html` 執行一鍵更新檢查。
6. 開啟遊戲「維護」頁，匯出 GitHub Pages 實測報告。
7. 確認 Service Worker 快取名稱為 v7.9.0。

如果更新失敗，請使用 `Liangshan_v7.9.0_RollbackTo_v7.8.0.zip` 覆蓋回 v7.8.0，並清除梁山快取。
