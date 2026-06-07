# 水滸英雄傳：梁山風雲 v1.7.0

純 HTML、CSS、JavaScript 製作的單機章回式網頁 RPG，可直接放上 GitHub Pages。

## v1.7.0 新增

- 第六回「潯陽樓題反詩・江州劫法場」
- 江州牢城、琵琶亭、潯陽樓、死囚牢、江州法場、白龍廟、梁山泊
- 題詩風險：豪情原句、收鋒改寫、不題詩三條路線
- 假回書查驗：紙張、印記、官樣措辭
- 兩階段法場救援：刑臺刀斧手、無為軍追兵
- 新主角「黑旋風李逵」與雙斧專屬技能
- 新同伴「神行太保戴宗」
- 六英雄自由切換
- 梁山據點雛形：聚義廳、醫館、鐵匠鋪，最高 Lv.5
- 新增梁山水寨演武與建材獎勵
- 完整保留 v1.0～v1.6 存檔相容、語音播報、PWA、三種顯示模式

## 執行

直接開啟 `index.html` 即可遊玩。PWA 與離線快取需透過 HTTPS（例如 GitHub Pages）使用。

## GitHub Pages

將 `index.html`、`game.js`、`styles.css`、`manifest.webmanifest`、`service-worker.js`、`assets/` 等內容放在儲存庫最上層。

## 存檔

使用瀏覽器 LocalStorage，鍵名維持 `liangshan-rpg-save-v1`。清除網站資料會刪除存檔。
