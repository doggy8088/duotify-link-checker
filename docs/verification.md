# 初版驗證紀錄

日期：2026-10-04。環境：macOS、Node.js 24、Chrome 154；CI 使用 Ubuntu 與 Playwright 鎖定的 Chromium。

- 145 個單元/契約測試通過。
- 11 個真實擴充功能 E2E 測試通過。
- 納入統計的核心模組：lines/statements/functions 100%，branches 99.52%。這不是整個 UI 的覆蓋率；範圍見 [testing.md](testing.md)。
- 本機 Chrome 154 已透過 Chrome DevTools CLI 安裝 dist，點選實際 popup 按鈕後得到 `Completed 22 / 22`，21 個元素被標示（部分元素有多筆資源）。
- Manifest 與圖示尺寸、MIT Unicode copyright、程式碼格式與 ESLint 已驗證。
- ZIP 僅含 background/content/popup、manifest、CSS、四種圖示與 LICENSE。
- 上架 API 已通過模擬測試；live Chrome Web Store 尚需首次項目/帳號設定與發布憑證。

自動化結果以 [GitHub Actions](https://github.com/doggy8088/duotify-link-checker/actions) 每次執行的報告為準。Release 附可安裝 ZIP 與 SHA-256。每次後續版本應重新執行檢查，不將這份初版紀錄視為永久保證。
