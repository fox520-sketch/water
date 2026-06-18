# v7.8.0 GitHub Pages 實際部署檢查流程

1. 將 v7.8 更新檔案覆蓋到你的 GitHub Pages 專案根目錄。
2. Commit 並 Push。
3. 到 GitHub Actions 確認 Pages workflow 成功。
4. 開啟公開網址，確認首頁顯示 v7.8.0。
5. 開 DevTools Network，確認無 404，尤其是：
   - modules/epic-chapters-v78.js
   - modules/roguelike-v78.js
   - modules/balance-v78.js
   - modules/operations-v78.js
   - modules/accessibility-v78.js
   - assets/bosses/*.svg
   - assets/portraits/refined/*.svg
6. 到「雲端傳承」頁執行正式營運診斷。

結果請記錄到 LIVE_DEPLOYMENT_CHECKLIST.md。
