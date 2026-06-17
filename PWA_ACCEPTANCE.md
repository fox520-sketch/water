# v7.5.0 PWA 部署前驗收報告

驗收日期：2026-06-17

## 已完成

- Manifest 可解析，版本為 v7.5.0。
- `start_url` 與 `scope` 使用相對路徑 `./`。
- 192 × 192 與 512 × 512 圖示存在。
- Service Worker 快取名稱為 `liangshan-v7.5.0-cache-1`。
- Service Worker 預快取包含所有遊戲模組與部署文件。
- GitHub Pages Actions 與 Release Actions 檔案存在。
- Windows ZIP 使用英文根目錄及英文發布檔名。
- ZIP CRC、最長路徑及 SHA-256 通過。
- 單一 HTML 由同一份原始碼生成並通過瀏覽器測試。

## 本環境無法代替完成

- 將程式推送到你的 GitHub 儲存庫。
- 產生你的公開 GitHub Pages URL。
- 在公開 HTTPS 網址實際安裝 Windows／Android／iPhone PWA。
- 使用你的 Firebase 專案完成電腦與手機跨裝置同步。
- 驗證不同真實帳號的 Firestore Rules 隔離。

完成部署後，請依 `LIVE_DEPLOYMENT_CHECKLIST.md` 逐項驗收。
