# 開發指南

## 環境與首次執行

使用 Node.js 24 LTS（最低 22）、npm、Git、Chrome 120 以上。CI 使用 Node 24 與 Playwright 鎖定的 Chromium。

```sh
git clone https://github.com/doggy8088/duotify-link-checker.git
cd duotify-link-checker
npm ci
npx playwright install chromium
npm run build
```

在 `chrome://extensions` 開啟開發人員模式，載入本專案的 `dist/`。修改後重新 build，再按擴充功能的重新載入。網頁也應重新整理，避免使用舊 content script；原本執行中的檢查不跨版本保留。

## 指令

| 指令                            | 用途                                                 |
| ------------------------------- | ---------------------------------------------------- |
| `npm run build`                 | esbuild 封裝三個入口、複製 CSS/HTML/圖示/授權至 dist |
| `npm run icons`                 | 由 imagegen PNG 原圖縮放為 16/32/48/128px            |
| `npm run lint`                  | ESLint 靜態檢查                                      |
| `npm run format`                | Prettier 格式化                                      |
| `npm run format:check`          | 格式檢查                                             |
| `npm test`                      | 單元與發布模擬測試                                   |
| `npm run test:coverage`         | 單元測試及 V8 覆蓋率門檻                             |
| `npm run test:e2e`              | build 後載入 Chromium 執行 E2E                       |
| `HEADED=1 npm run test:e2e`     | 顯示測試瀏覽器（Windows 請先設定環境變數）           |
| `npm run check`                 | lint、format、coverage、E2E、ZIP                     |
| `npm run package`               | build 與 ZIP、SHA-256                                |
| `npm run version:set -- 1.0.1`  | 同步 package、lock 與 manifest 版本                  |
| `node tests/fixture-server.mjs` | 啟動 localhost:4173 人工測試頁                       |

## 目錄與建置

- `public/manifest.json`：唯一 Chrome manifest 來源。
- `public/icons/`：正式使用的 PNG，須提交至 Git。
- `src/background.js`：HTTP 工作與 runtime port 邊界。
- `src/core/`：HTTP 判斷、並行工作池、CSV。
- `src/content/`：DOM 資源收集、特殊 URL、報表、標示、transport 與掃描狀態。
- `src/popup/`：工具列 UI 與按需注入。
- `scripts/`：建置、圖示縮放、確定性 ZIP、版本同步、商店發布。
- `tests/unit/`、`tests/e2e/`：自動測試；fixture server 不會放入正式 ZIP。
- `dist/`、`artifacts/`、`coverage/`、`test-results/`：產出物，不提交 Git。

esbuild 將 content script 打包為 IIFE，background/popup 為 ESM；報表 CSS 以字串打包後放入 Shadow DOM。目標為 Chrome 120。沒有 eval、inline JavaScript、CDN 或遠端載入程式碼。

## 除錯

Popup：在工具列彈出視窗按右鍵檢查。Background：在 `chrome://extensions` 的擴充功能卡片點 service worker。Content script：網頁 DevTools 的執行環境選擇本擴充功能。

網路檢查在 service worker，網頁 Network 面板不一定顯示這些請求。先查看報表 Note 欄的 HEAD/GET 與 MIME，必要時檢查 worker Network。頁面被 Chrome 保護、權限被使用者撤回、擴充功能更新後的舊 content script，均應先重新載入網頁再重試。

## 修改與貢獻

新增資源類型時同步更新 collector、特殊 URL 行為、background 允許類型、Accept、報表與測試。修改權限、網路傳輸或儲存方式時同步更新隱私權政策與 CHROMEWEBSTORE.md。PR 應說明行為改變與執行過的測試；不要提交秘密、個人瀏覽資料或測試 profile。
