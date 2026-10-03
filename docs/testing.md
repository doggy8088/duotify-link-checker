# 測試指南

## 自動驗證

```sh
npm ci
npx playwright install chromium
npm run check
```

CI 在 Ubuntu 執行同一套流程，另使用 `playwright install --with-deps chromium` 安裝系統依賴。相依版本由 package-lock.json 鎖定。

### 單元與契約測試

Vitest 驗證 URL 正規化、協定/認證拒絕、CSS escape、可見性、錨點、data/blob、圖片 MIME、HTTP fallback matrix、timeout/cancel、body cancel、工作池、嚴重性標示、CSV 注入防護、port 斷線/重連、worker 來源限制/並行限制、manifest 與圖示尺寸，以及商店發布的 OAuth / upload / polling / publish 錯誤路徑。

V8 覆蓋率包含 `src/core/` 與 content 的 resources、special、highlight、transport 模組。門檻為 statements/lines/functions 90%、branches 85%。報表、collector、popup、掃描協調由真實瀏覽器 E2E 驗證，未計入這個百分比；不可把核心模組覆蓋率宣稱為整個擴充功能覆蓋率。Worker 與發布程式有獨立契約測試。

### 真實擴充功能 E2E

Playwright 建立一次性 profile，載入真正的 `dist/` Manifest V3 擴充功能，從 extension service worker 透過正式 scripting 與 messaging 介面觸發。Popup 也有實際開啟與按鈕測試；沒有將 fetch 直接替換成成功 stub。

本機 HTTP server 產生可預期的正常、404、405→200、302、403、429、MIME 錯誤與延遲回應。localhost 與 127.0.0.1 是不同 origin，可驗證跨來源請求、external filter；server 記錄證明沒有 Cookie/Referer，並計算去重後的請求次數。

涵蓋完整掃描、篩選固定尺寸、CSV 下載、Escape/重開/清除、重複注入、空頁、取消與並行拒絕、400 筆資源、popup 受保護頁提示及窄螢幕。瀏覽器版本由 Playwright 鎖定；Google Chrome 的命令列側載限制使 CI 採其 bundled Chromium，另以安裝的 Chrome 做人工 smoke test。

另測試不可連線與含帳密的 URL，以及透過 CDP 停止 service worker 後，下一次掃描可重新喚醒並完成。

E2E 會更新兩張 1280×800 商店截圖；`playwright-report/` 為報告，失敗時 `test-results/` 保留 trace 與畫面。用 `npx playwright show-trace <trace.zip>` 檢查。測試 fixture 的圖片/影音只為驗證 URL/MIME，不是完整影音樣本。

## Chrome 安裝驗證

本機已透過 Chrome DevTools CLI 載入 `dist/`，並由 popup 執行本機 fixture 掃描。自動化 Chrome 使用獨立的測試 profile，不更改個人主要 profile。手動安裝可依 README 的「載入未封裝項目」操作。

重現方式：

1. `npm run build`，`node tests/fixture-server.mjs`。
2. Chrome 載入 dist，開啟 `http://localhost:4173`。
3. Popup 執行全部檢查，應有 22 筆：13 Valid、4 Invalid、5 Skipped。
4. Invalid 篩選應列出缺頁、錯誤圖片 MIME、CSS 缺圖與遺失錨點。
5. Close 後看框線，重開報表、匯出 CSV，再清除。
6. 外部模式應只列一筆 127.0.0.1 URL。
7. 在 `/cancel` 頁取消延遲請求；在 Chrome 內部頁確認友善錯誤。

## 驗證範圍

測試可重現功能與錯誤分支；無法證明所有網際網路資源都能通過。商店 API 目前以模擬回應測試，首次 live 提交需要擁有者的商店項目及憑證。每次發布須保存 CI 結果，若曾改網路/權限/資料流則重新檢查商店揭露。
