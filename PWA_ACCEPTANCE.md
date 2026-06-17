# v7.4.0 PWA 部署前驗收

## 已完成

- `manifest.webmanifest` 名稱、圖示、`start_url` 與 `scope` 均使用相對路徑。
- `service-worker.js` 通過 JavaScript 語法檢查。
- 16 個預快取項目皆存在，沒有遺漏檔案。
- Service Worker scope 設為 `./`，適合 GitHub Pages 專案子目錄。
- 舊版快取會在 activate 階段刪除。
- 更新前會建立存檔備份，再送出 `SKIP_WAITING`。
- GitHub Pages Actions 工作流程已包含於 `.github/workflows/pages.yml`。
- Windows ZIP 與單一 HTML 版皆由同一份原始碼產生。

## 尚需公開網站完成

由於目前沒有使用者 GitHub 儲存庫的寫入權限，尚未能在實際公開網址驗證以下項目：

- GitHub Pages 公開 HTTPS 首次載入
- Windows／Android 的 PWA 安裝提示
- iPhone Safari 加到主畫面
- 從 v7.4.0 更新到下一版時的真實 Service Worker 接管
- 真實 Firebase 專案的跨裝置同步

部署後可依 `DEPLOY_GITHUB_PAGES.md` 的清單完成最後驗收。
