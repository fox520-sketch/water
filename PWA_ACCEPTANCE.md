# v7.6.0 PWA 驗收狀態

## 已完成

- Manifest 名稱、圖示、相對 start_url 與 scope 檢查。
- Service Worker v7.6.0 快取清單檢查。
- GitHub Pages 專案子路徑使用相對路徑。
- 新版等待中提示、更新前備份與 `SKIP_WAITING` 流程。
- 營運診斷可檢查安全來源、Service Worker、IndexedDB、Manifest、安裝模式、網路及 Firebase 狀態。
- ZIP 與單一 HTML 發布一致性檢查。

## 必須在公開 HTTPS 或實機完成

- Service Worker 真正安裝與離線接管。
- Windows Chrome／Edge 安裝。
- Android Chrome 安裝。
- iPhone Safari「加入主畫面」。
- v7.6.0 更新至後續版本並保留存檔。
- 網路中斷後離線開啟，再重新連線同步。

本環境的瀏覽器管理政策阻擋 localhost 與 file URL 導覽，因此以上實機項目未宣稱完成。
