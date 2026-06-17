# Firebase 可選雲端存檔設定（v7.5.0）

未設定 Firebase 時，遊戲仍會使用 IndexedDB、localStorage 相容鏡像與十份輪替備份，可以完全離線遊玩。

## 一、建立 Firebase 專案

1. 在 Firebase Console 建立專案。
2. 在「Authentication → Sign-in method」啟用 **Email/Password**。
3. 建立 Cloud Firestore 資料庫。
4. 將本資料夾的 `firebase.rules` 貼到 Firestore Rules 並發布。
5. 在「專案設定 → 你的應用程式」新增 Web App。
6. 記下 `apiKey`、`projectId` 與 `authDomain`。
7. 開啟遊戲的「雲端」頁，填入上述三項設定。

## 二、Firestore 資料結構

```text
users/{uid}/saves/main
users/{uid}/history/{版本ID}
```

- `saves/main`：目前主要雲端存檔。
- `history`：最近的雲端版本歷史。
- Rules 只允許登入者讀寫自己 UID 下的文件。

## 三、跨裝置驗收步驟

1. 電腦 A 建立 Firebase 帳號並登入。
2. 完成一回章回或修改裝備後，按「上傳並建立版本」。
3. 手機 B 使用同一帳號登入。
4. 按「比較主存檔」。
5. 檢查章回數、英雄、裝備、建築、銀兩與更新時間差異。
6. 選擇「智慧合併」或「完全使用雲端」。
7. 回到電腦 A 再修改一次並上傳，確認版本歷史增加。
8. 測試離線遊玩後重新連線，再進行比較與合併。

## 四、安全原則

- Firebase Web API Key 是網頁應用程式識別設定，不是伺服器私鑰。
- 真正的資料隔離由 Firebase Authentication 與 Firestore Rules 執行。
- 密碼不會寫入遊戲存檔或 localStorage。
- 登入權杖只保存在目前瀏覽器分頁的 sessionStorage。
- 套用雲端或智慧合併前，遊戲會先建立本機備份。

## 五、常見錯誤

### `PERMISSION_DENIED`

- 確認已登入。
- 確認 `firebase.rules` 已發布。
- 確認 Rules 同時包含 `saves` 與 `history`。
- 確認文件路徑中的 UID 與登入帳號一致。

### `API_KEY_INVALID` 或登入失敗

- 檢查 API Key 是否完整。
- 確認 Email/Password 登入方式已啟用。
- 確認 Firebase 專案沒有刪除或停用。

### 上傳成功但讀不到版本歷史

- 檢查 `users/{uid}/history/{historyId}` 的 Rules。
- 在 Firestore Console 確認 history 文件是否建立。

## 六、本發布包的驗收界線

本發布包已完成雲端模組、Schema、校驗、智慧合併、版本歷史與模擬 REST 測試。由於製作環境沒有你的 Firebase 專案權限與第二台實體裝置，公開專案上的真實跨裝置測試仍需依本文件完成。
