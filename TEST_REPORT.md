# v7.8.0 更新檔案測試報告

## 覆蓋更新包檢查
- 只含相對於 v7.7.0 需要覆蓋或新增的檔案。
- ZIP 全英文路徑。
- 最長路徑小於 220 字元。
- ZIP CRC 測試通過。

## 靜態檢查
- index.html 載入 v7.8 模組：通過。
- game.js 版本號：v7.8.0。
- manifest.webmanifest 版本說明：v7.8.0。
- service-worker.js 快取名稱：liangshan-v7.8.0-cache-1。
- 108 回手工章回模組：通過。
- 108 英雄第三輪平衡模組：通過。
- 遠征 v7.8 模組：通過。
- 操作與診斷 v7.8 模組：通過。
- 無障礙 v7.8 修正模組：通過。
- 新增重要英雄精修立繪：36 張。
- 新增遠征首領立繪：8 張。

## 已知限制
本環境無 GitHub、Firebase 寫入權限，也無法實際操作 NVDA／VoiceOver／TalkBack。相關項目提供正式驗收流程與紀錄表，不宣稱已代替你完成實機驗收。

- V78_DEPLOYMENT_RESULTS.md：已加入，避免 Service Worker 快取缺檔。
