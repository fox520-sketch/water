# GitHub Pages 部署步驟

## 方法一：使用本版附帶的 GitHub Actions

1. 建立或開啟 GitHub 儲存庫。
2. 將本資料夾內所有檔案放到儲存庫根目錄，包括：
   - `.github/workflows/pages.yml`
   - `.nojekyll`
   - `index.html`
   - `game.js`
   - `chapters.js`
   - `styles.css`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `assets/`
3. 推送至 `main` 分支。
4. 到 GitHub 儲存庫的 `Settings` → `Pages`。
5. 將 Build and deployment 的 Source 設為 `GitHub Actions`。
6. 到 `Actions` 查看 `Deploy Liangshan RPG to GitHub Pages` 是否完成。
7. 開啟 Pages 網址，確認首頁可載入。

## 上線後 PWA 驗收

依序檢查：

1. 網址使用 HTTPS。
2. 瀏覽器開發者工具 → Application → Manifest 沒有錯誤。
3. Service Workers 顯示 Activated and is running。
4. Cache Storage 中出現 `liangshan-v7.3.0-awakening`。
5. 重新載入後 `navigator.serviceWorker.controller` 不為空。
6. 切換離線模式後重新載入，遊戲仍可開啟。
7. 發布更新版 Service Worker 後，遊戲顯示更新提示。
8. 更新前 IndexedDB 備份數量增加，且最多保留五份。

## 專案子路徑

所有 PWA 路徑均使用 `./` 相對路徑，因此可部署於：

```text
https://帳號.github.io/儲存庫名稱/
```

不需要將 `start_url`、`scope` 或 Service Worker 資源改成根目錄路徑。

## 常見問題

### 首頁正常，但離線無法開啟

- 確認不是直接以 `file://` 開啟。
- 確認 GitHub Pages 已使用 HTTPS。
- 清除舊 Service Worker 與 Cache Storage 後重新載入。
- 確認 `service-worker.js` 和 `index.html` 位於同一層。

### 更新後仍看到舊版

- 關閉所有遊戲分頁後重新開啟。
- 在 Application → Service Workers 按 Update。
- 確認 `service-worker.js` 的 `VERSION` 與快取名稱已更新。

### Actions 部署失敗

- 確認 Pages Source 已選 GitHub Actions。
- 確認工作流程具有 `pages: write` 與 `id-token: write` 權限。
- 確認檔案位於儲存庫根目錄，或修改 workflow 的 `path`。
