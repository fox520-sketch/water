# v7.3.0 PWA 驗收報告

驗收日期：2026-06-17

## 驗收環境

- Chromium 149（Linux headless）
- HTTP localhost 安全來源
- GitHub Project Pages 同型子路徑：`/Liangshan_v7.3.0/`
- 390 × 844 手機視窗與 1280 × 900 桌面視窗

## 通過項目

- `manifest.webmanifest` 可正常取得。
- 192 × 192 與 512 × 512 圖示可正常取得。
- Service Worker 成功註冊。
- Service Worker scope 正確落在 `/Liangshan_v7.3.0/`。
- 快取 `liangshan-v7.3.0-awakening` 成功建立。
- 重新載入後頁面由 Service Worker 接管。
- 模擬離線後重新載入，遊戲仍可完整啟動。
- 相對路徑在專案子目錄中可正常解析。
- 390 × 844 手機版無水平溢位。
- 測試期間無 JavaScript 錯誤。
- GitHub Pages Actions workflow 已完成靜態部署設定。

## 公開 GitHub Pages 狀態

本發布環境沒有使用者 GitHub 儲存庫的寫入權限，因此無法直接推送並產生公開 Pages 網址。已完成部署前可驗證的子路徑、Service Worker、快取與離線行為，並提供可直接推送的工作流程。

推送後請依 `DEPLOY_GITHUB_PAGES.md` 的「上線後 PWA 驗收」再確認公開網址。
