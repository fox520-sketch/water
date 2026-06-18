# 水滸英雄傳：梁山風雲 v7.6.0

## 全章回精修與正式營運版

本版以 v7.5.0 為基底，重點放在正式平衡、重要章回精修、新手導引、分岔遠征、雲端合併預覽、裝備方案、派遣經濟、無障礙與發布一致性。

## 主要更新

- 108 名英雄第一輪正式平衡係數，套用於技能與實戰數值。
- 36 個重要章回具三條故事方案、專屬判斷與多重結局。
- 36 天罡程序式水墨角色卡，另有 12 組章回場景背景。
- 十層分岔 Rogue-like 遠征，每層最多三條路線、36 件遺物與每週挑戰碼。
- 七步互動式新手教學；編隊、英雄、鍛造、山寨與遠征依章回完成數逐步開放。
- 三套裝備方案、批次鎖定／解鎖、批次選取與分解。
- 派遣疲勞、大成功、奇遇，以及依聚義廳等級計算的 14～24 小時離線收益上限。
- Firebase 雲端存檔欄位差異預覽、智慧合併、歷史版本比較與還原前備份。
- IndexedDB Schema v6、localStorage 相容鏡像與 12 份輪替備份。
- 高對比、文字縮放、減少動畫、螢幕閱讀器精簡播報與低效能模式。
- GitHub Pages、Firebase、Service Worker、Manifest 與安裝狀態的營運診斷頁。
- Windows 英文路徑 ZIP，以及內嵌角色卡與背景的單一 HTML 版。

## 功能解鎖

| 完成章回 | 開放功能 |
|---:|---|
| 0 | 首頁、章回、雲端設定 |
| 1 | 自由編隊與戰術 AI |
| 2 | 英雄技能樹與覺醒 |
| 3 | 鍛造、裝備與裝備方案 |
| 5 | 山寨建設、派遣與離線生產 |
| 8 | 分岔遠征、無盡塔、每週挑戰與首領再戰 |

## 啟動方式

### Windows 相容 ZIP

1. 對 `Liangshan_v7.6.0_Windows.zip` 按右鍵。
2. 選擇「全部解壓縮」。
3. 進入 `Liangshan_v7.6.0`。
4. 開啟 `index.html`。

### 免解壓版

直接開啟 `Liangshan_v7.6.0_Standalone.html`。角色卡、場景背景、CSS 與遊戲程式都已內嵌；Firebase 與 PWA 安裝仍需要 HTTPS 網站。

## 正式部署界線

發布包包含 GitHub Actions、Firestore Rules、Firebase 設定與營運診斷，但未代替使用者完成以下工作：

- 推送到實際 GitHub 儲存庫。
- 建立並設定實際 Firebase 專案。
- 電腦與手機之間的真實跨裝置同步。
- Windows、Android、iPhone 的實機 PWA 驗收。
- NVDA、Narrator、VoiceOver、TalkBack 真人操作驗收。

請參閱：

- `DEPLOY_GITHUB_PAGES.md`
- `FIREBASE_SETUP.md`
- `LIVE_DEPLOYMENT_CHECKLIST.md`
- `SCREEN_READER_CHECKLIST.md`
- `PWA_ACCEPTANCE.md`
