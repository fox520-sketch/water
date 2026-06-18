# v7.9.0 正式上線驗收清單

## GitHub Pages

- [ ] 公開網址可開啟首頁，標題顯示 v7.9.0。
- [ ] `update.html` 可執行並匯出檢查結果。
- [ ] `game.js`、`styles.css`、`service-worker.js`、三個 v7.9 模組皆為 HTTP 200。
- [ ] Service Worker 快取名稱顯示 v7.9.0。
- [ ] PWA 離線重開可進入遊戲。
- [ ] 從 v7.8.0 更新後，存檔遷移報告無錯誤。

## Firebase 跨裝置

- [ ] 電腦登入並上傳存檔。
- [ ] 手機登入同帳號並下載。
- [ ] 兩端離線修改後重新連線，顯示合併預覽。
- [ ] 帳號 A 無法讀取帳號 B 的 saves/history。
- [ ] 匯出 Firebase 跨裝置同步報告 JSON。

## 回復測試

- [ ] 使用 rollback 包回復 v7.8.0。
- [ ] 清除梁山快取後，首頁恢復 v7.8.0。
- [ ] 再次套用 v7.9.0 更新包可成功。
