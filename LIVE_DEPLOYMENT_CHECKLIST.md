# v7.5.0 正式上線驗收清單

> 這份清單必須在公開 GitHub Pages HTTPS 網址與你自己的 Firebase 專案上執行。

## GitHub Pages

- [ ] GitHub Actions 部署成功。
- [ ] 公開網址可開啟，首頁顯示 v7.5.0。
- [ ] 所有 JS、CSS、Manifest、圖示均回傳 200。
- [ ] 專案子路徑沒有 404。
- [ ] Service Worker scope 正確。
- [ ] 快取名稱為 `liangshan-v7.5.0-cache-1`。
- [ ] 離線後重新載入仍能進入遊戲。
- [ ] 從舊版本升級時出現更新提示。
- [ ] 更新前自動備份增加一份。

## PWA 裝置

- [ ] Windows Chrome／Edge 可安裝。
- [ ] Android Chrome 可加到主畫面並離線啟動。
- [ ] iPhone Safari 可加到主畫面。
- [ ] 三種裝置均能讀取本機 IndexedDB 存檔。

## Firebase 真實跨裝置

- [ ] Email/Password 已啟用。
- [ ] `firebase.rules` 已發布。
- [ ] 電腦 A 可建立帳號、登入、上傳。
- [ ] Firestore 出現 `users/{uid}/saves/main`。
- [ ] Firestore 出現 `users/{uid}/history/{版本ID}`。
- [ ] 手機 B 使用同一帳號能讀取比較結果。
- [ ] 智慧合併可保留雙方較佳章回、英雄與裝備。
- [ ] 完全套用雲端前會建立本機備份。
- [ ] 不同帳號無法讀取彼此存檔。
- [ ] 離線修改後重新連線，可正常比較衝突。

## 發布結論

只有以上項目全部完成，才能標記為「公開 GitHub Pages 與真實 Firebase 跨裝置正式驗收完成」。
