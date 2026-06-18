# 《水滸英雄傳：梁山風雲 v7.7.0》測試報告

版本：正式上線驗收與百回精修版

## 測試摘要

- 靜態、語法、資產、Service Worker 與發布檢查：65／65 通過
- v7.7 專屬模組、資料、ZIP 與 Standalone 邏輯檢查：52／52 通過
- 合計：117／117 通過

## 主要通過項目

- JavaScript 語法檢查：`game.js`、`chapters.js` 與所有模組通過。
- 108 章回資料完整。
- 36 天罡與 72 地煞資料完整。
- 手工章回數量提升至 72 回。
- 第 37～108 張地煞角色卡已存在。
- 108 張角色卡列入 Service Worker 快取清單。
- v7.7 四個新模組已由首頁與單一 HTML 載入：
  - `epic-chapters-v77.js`
  - `roguelike-v77.js`
  - `balance-v77.js`
  - `operations-v77.js`
- 遠征系統含 10 層路線、遺物組合與專屬首領資料。
- 第二輪平衡模組可回傳 108 英雄調整結果，正常觀察區達 80 名以上。
- ZIP CRC 通過。
- ZIP 內路徑全部為英文。
- ZIP 為單一根目錄 `Liangshan_v7.7.0/`。
- ZIP 最長路徑小於 220 字元。
- 單一 HTML 版內嵌 v7.7 模組與 SVG 角色卡／背景資產。
- SHA-256 校驗檔與 ZIP 相符。

## 已知限制

本執行環境封鎖瀏覽器直接開啟 `localhost` 與 `file://`，因此無法在此環境完成真實瀏覽器 UI 操作測試。已改以 Node 動態模組檢查、發布檢查、ZIP CRC、Service Worker 快取清單、Standalone 內嵌檢查替代。

以下項目仍需在你的真實環境完成：

- GitHub Pages 公開 HTTPS 網址驗收。
- Firebase 真實電腦／手機跨裝置同步。
- Windows、Android、iPhone 三平台 PWA 安裝與離線重開。
- NVDA、Narrator、VoiceOver、TalkBack 真人無障礙測試。

## 自訂檢查明細

- 通過：JS 語法 game.js
- 通過：JS 語法 chapters.js
- 通過：JS 語法 accessibility.js
- 通過：JS 語法 audio-v76.js
- 通過：JS 語法 balance-v76.js
- 通過：JS 語法 balance-v77.js
- 通過：JS 語法 cloud-sync.js
- 通過：JS 語法 content-v74.js
- 通過：JS 語法 dizha.js
- 通過：JS 語法 endgame.js
- 通過：JS 語法 epic-chapters-v76.js
- 通過：JS 語法 epic-chapters-v77.js
- 通過：JS 語法 epic-chapters.js
- 通過：JS 語法 operations-v76.js
- 通過：JS 語法 operations-v77.js
- 通過：JS 語法 roguelike-v76.js
- 通過：JS 語法 roguelike-v77.js
- 通過：JS 語法 roguelike.js
- 通過：JS 語法 save-schema.js
- 通過：JS 語法 telemetry.js
- 通過：JS 語法 tiangang.js
- 通過：Node 動態模組載入
- 通過：108 章回資料 — `108`
- 通過：36 天罡資料 — `36`
- 通過：72 地煞資料 — `72`
- 通過：72 回手工章回 — `72`
- 通過：第 108 張角色卡路徑 — `assets/portraits/hero-108.svg`
- 通過：平衡正常區提升 — `{'normal': 83, 'strong': 12, 'weak': 13, 'total': 108, 'previousNormal': 72, 'improvement': 11}`
- 通過：遠征專屬首領 — `{'version': '7.7.0', 'relics': 30, 'combos': 6, 'bosses': 8, 'map': '10 層三岔視覺地圖'}`
- 通過：遠征 10 層地圖 — `10`
- 通過：108 角色卡資產
- 通過：12 背景資產
- 通過：SW 版本 v7.7.0
- 通過：SW 快取 modules/epic-chapters-v77.js
- 通過：SW 快取 modules/roguelike-v77.js
- 通過：SW 快取 modules/balance-v77.js
- 通過：SW 快取 modules/operations-v77.js
- 通過：SW 快取 assets/portraits/hero-108.svg
- 通過：Manifest v7.7.0
- 通過：ZIP 存在
- 通過：ZIP CRC
- 通過：ZIP 英文路徑
- 通過：ZIP 單一根目錄
- 通過：ZIP 含第 108 角色卡
- 通過：ZIP 含 v77 模組
- 通過：ZIP 最長路徑 < 220 — `49`
- 通過：Standalone 存在
- 通過：Standalone v7.7.0
- 通過：Standalone 內嵌資產
- 通過：Standalone 內嵌 v77 模組
- 通過：SHA 存在
- 通過：SHA 相符
