# 水滸英雄傳：梁山風雲 v2.1.0

純 HTML、CSS、JavaScript 製作的單機章回式網頁 RPG，可直接在瀏覽器遊玩，也可部署至 GitHub Pages。

## v2.1.0「菊花會與招安之議」

- 新增第十回完整章回
- 新增第十名主角「入雲龍・公孫勝」
- 新增同伴「聖手書生・蕭讓」與助陣技能「聖手校書」
- 新增公孫勝技能「五雷正法」「八門遁甲」
- 新增二仙山雷法幻陣與護詔殿前禁軍
- 新增詔書查驗：黃麻紙、關防、赦罪與出征條款
- 新增忠義堂公開議事系統
- 新增四項政治數值：招安支持、自立支持、護民共識、朝廷信任
- 新增三種章回路線：受詔前立三約、拒詔守寨自立、暫緩受詔先行護民
- 新增梁山建築「文書院」
- 新增忠義堂議武場，可重演議事與培養角色
- 英雄譜擴充為十名可切換主角
- 保留語音播報、深色模式、黑白電子紙模式、PWA 與本機存檔
- v1.0～v2.0 舊存檔可自動升級

## 執行方式

直接開啟 `index.html` 即可遊玩。瀏覽器若限制本機檔案功能，可使用簡易 HTTP 伺服器或部署至 GitHub Pages。

PWA 安裝與離線快取須由 HTTPS 網站開啟，例如 GitHub Pages。

## GitHub Pages

請將下列檔案與資料夾直接放在 Repository 根目錄：

- `index.html`
- `styles.css`
- `game.js`
- `manifest.webmanifest`
- `service-worker.js`
- `assets/`
- `README.md`
- `TEST_REPORT.md`

不要只上傳外層 `water-margin-rpg-v2.1.0` 資料夾，否則 GitHub Pages 可能找不到首頁。

## 存檔

存檔使用瀏覽器 LocalStorage，鍵名維持：

```text
liangshan-rpg-save-v1
```

更新版本時不必清除舊進度；清除瀏覽器網站資料則會一併移除存檔。
