# GitHub Pages 正式部署步驟（v7.5.0）

## 方法一：使用內附 GitHub Actions

1. 建立或開啟 GitHub 儲存庫。
2. 將 `Liangshan_v7.5.0` 資料夾內所有檔案放到儲存庫根目錄。
3. 確認包含：
   - `.github/workflows/pages.yml`
   - `.github/workflows/release.yml`
   - `.nojekyll`
   - `index.html`
   - `game.js`
   - `chapters.js`
   - `styles.css`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `modules/`
   - `assets/`
4. 推送到 `main` 分支。
5. 到 GitHub 儲存庫的 `Settings → Pages`。
6. 將 Source 設為 **GitHub Actions**。
7. 到 `Actions` 查看 `Deploy GitHub Pages` 是否成功。
8. 開啟 Actions 顯示的 Pages 網址。

## 專案子路徑

本版所有資源都使用相對路徑，可部署在：

```text
https://你的帳號.github.io/儲存庫名稱/
```

不需要手動修改 `start_url`、`scope` 或 Service Worker 路徑。

## 正式上線後必做

請依 `LIVE_DEPLOYMENT_CHECKLIST.md` 驗證：

- HTTPS 與公開網址。
- Manifest 與兩種圖示。
- Service Worker 註冊及快取。
- 離線重新啟動。
- 舊版更新至 v7.5.0。
- 更新前自動備份。
- Windows、Android、iPhone 安裝。
- Firebase 電腦／手機同步。

## GitHub Release

建立 `v7.5.0` 標籤並推送後，`release.yml` 會產生：

- `Liangshan_v7.5.0_Windows.zip`
- `Liangshan_v7.5.0_Standalone.html`
- `Liangshan_v7.5.0_Windows.sha256.txt`

## 常見問題

### 頁面顯示 404

- 確認 Source 已選 GitHub Actions。
- 確認 workflow 成功。
- 確認 `index.html` 位於儲存庫根目錄。

### 首頁能開，但離線失敗

- 不要使用 `file://` 驗證 PWA。
- 確認公開網址為 HTTPS。
- 清除舊 Service Worker 與 Cache Storage 後重開。
- 確認 `service-worker.js` 與 `index.html` 在同一層。

### 更新後仍顯示舊版本

- 關閉所有遊戲分頁後重新開啟。
- 在開發者工具的 Service Workers 按 Update。
- 確認快取名稱為 `liangshan-v7.5.0-cache-1`。
