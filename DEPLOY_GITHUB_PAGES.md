# GitHub Pages 實際部署檢查流程 v7.7.0

## 一、推送檔案

1. 解壓縮 `Liangshan_v7.7.0_Windows.zip`。
2. 將 `Liangshan_v7.7.0` 內所有檔案推送到 GitHub 儲存庫。
3. 保留 `.nojekyll`，避免 GitHub Pages 忽略底線資料夾。
4. 在 Settings → Pages 選擇 GitHub Actions 或 `main / root`。

## 二、部署後檢查

打開公開網址後，進入「雲端傳承 → 執行目前環境診斷」。

必須通過：

- HTTPS 安全來源
- Service Worker 支援與註冊
- IndexedDB
- Web App Manifest
- 108 角色卡資產規則
- Firebase 設定狀態

## 三、資產檢查

請直接開啟：

- `assets/portraits/hero-001.svg`
- `assets/portraits/hero-108.svg`
- `assets/backgrounds/scene-12.svg`
- `manifest.webmanifest`
- `service-worker.js`

若任何一項 404，請確認部署根目錄與 `start_url: "./"`。

## 四、更新驗收

從 v7.6.0 升級到 v7.7.0 時，應先看到新版本快取，重整後顯示 v7.7.0，且 IndexedDB 存檔仍存在。
