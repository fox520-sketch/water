# v7.9.0 PWA 與快取驗收

本版新增 `update.html` 與維護中心，可檢查 Service Worker、Cache Storage、必要檔案與 v7.9 模組。

已在本機靜態驗證：

- Service Worker 快取名稱包含 v7.9.0。
- 快取清單包含 `update.html`、`modules/stability-v79.js`、`modules/chain-v79.js`、`modules/season-v79.js`。
- 更新包使用英文路徑。

仍需在公開 HTTPS 或 localhost 實測：

- Windows Chrome / Edge 安裝。
- Android Chrome 加到主畫面。
- iPhone Safari 加到主畫面。
- 更新前備份與快取替換。
