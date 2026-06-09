# 水滸英雄傳：梁山風雲 v2.5.0

章回式單機網頁 RPG，使用 HTML、CSS 與 JavaScript 製作，可直接部署至 GitHub Pages，也可安裝為 PWA 離線遊玩。

## v2.5.0「第十四回・王慶之亂與淮西平定」

本版新增：

- 第十四回完整主線「征王慶・宛州潛行」
- 第十四名可操作英雄「浪子燕青」
- 燕青專屬技能「川弩穿楊」「燕青相撲」
- 紀山暗渡巡哨戰與宛州夜巡戰
- 暗語、潮汐、糧簿、三色燈號四項潛行線索
- 五階段「宛州水陸潛行」軍略
- 李俊水軍協同與民船保護
- 首領戰「杜壆與宛州親軍」
- 新建築「梁山暗哨營」
- 宛州巧弩相撲演武場
- 十四英雄自由切換
- v1.0～v2.4.0 舊存檔相容

## 潛行軍略正確順序

1. 燕青易服取得換班暗語
2. 李俊潛水割斷封河鐵鏈
3. 戴宗傳遞假令調開巡哨
4. 花榮一箭熄滅三色烽燈
5. 燕青開民門護送渡戶

## 執行方式

直接開啟 `index.html` 即可遊玩。PWA 與離線快取建議透過 HTTPS 或本機 HTTP 伺服器執行。

## GitHub Pages 部署

請把下列內容直接放在 repository 根目錄：

```text
index.html
styles.css
game.js
manifest.webmanifest
service-worker.js
README.md
TEST_REPORT.md
assets/
```

不要只上傳外層 `water-margin-rpg-v2.5.0` 資料夾，否則 GitHub Pages 可能找不到首頁。

## 更新注意事項

Service Worker 快取名稱已更新為 `liangshan-rpg-v2.5.0`。覆蓋新版檔案後，請使用 `Ctrl + F5` 強制重新整理；已安裝成 PWA 時，請完全關閉後重新開啟。

## 存檔

遊戲沿用既有存檔鍵：

```text
liangshan-rpg-save-v1
```

載入舊存檔時會自動補入燕青、淮西任務、潛行線索、暗哨營及第十四回資料，不會清除既有進度。
