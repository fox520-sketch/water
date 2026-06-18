# v7.9.1 測試報告

發布前檢查：**14/14 通過**。

- ✅ game.js 語法檢查：OK
- ✅ index.html 存在
- ✅ manifest.webmanifest 存在
- ✅ service-worker.js 存在
- ✅ update.html 存在
- ✅ 版本已更新為 7.9.1
- ✅ 新增 trialDisplay 標準化函式
- ✅ 判斷選項不再直接 esc(o)
- ✅ 行動紀錄不再輸出 trial.options[i]
- ✅ modal 標題不再直接使用 trial.icon
- ✅ 支援 question 欄位
- ✅ 支援 object option text 欄位
- ✅ Liangshan_v7.9.1_UpdateFiles.zip CRC：OK
- ✅ Liangshan_v7.9.1_RollbackTo_v7.9.0.zip CRC：OK

## 修正驗證
- 已修正章回判斷題標題 undefined。
- 已修正 A／B／C 顯示 [object Object]。
- 已支援 v7.8/v7.9 物件格式判斷資料與舊版字串格式判斷資料。

## 已知限制
公開 GitHub Pages、真實 Firebase、NVDA／VoiceOver／TalkBack 仍需在你的實際環境驗收。
