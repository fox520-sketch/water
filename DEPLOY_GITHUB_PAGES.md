# 部署至 GitHub Pages

1. 將 `Liangshan_v7.4.0` 資料夾內容放到儲存庫根目錄。
2. 確認 `.github/workflows/pages.yml` 已一併上傳。
3. 到 GitHub 儲存庫的 **Settings → Pages**。
4. 將 Source 設為 **GitHub Actions**。
5. 推送到 `main` 後，Actions 會自動部署。

遊戲使用相對路徑，可部署在 `https://帳號.github.io/儲存庫名稱/`。Service Worker 的 scope 也限制在該專案路徑內。

公開部署後請驗收：
- 線上開啟與重新整理
- 安裝 PWA
- 離線重新開啟
- 發布新版後的更新提示
- Firebase 登入與跨裝置同步
