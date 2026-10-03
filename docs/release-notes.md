# Duotify Link Checker 1.0.0

將原 LinkChecker userscript 轉為獨立 Chrome Manifest V3 擴充功能。

- 手動檢查全部或外部可見資源：超連結、IMG、CSS 圖片、影片及音訊。
- HEAD / GET fallback、圖片 MIME 驗證、錨點檢查與無法確認狀態。
- 分批掃描、8 路並行、重複請求去重、取消。
- 頁面框線與可篩選報表、CSV、重新開啟與清除。
- imagegen 原創圖示、MIT 授權、開發及上架文件、自動測試與 tag 發布流程。

下載 ZIP 後解壓，在 `chrome://extensions` 開啟開發人員模式，選擇「載入未封裝項目」。需 Chrome 120+。

檢查不傳登入 Cookie 或 Referer，登入限定/防盜連資源可能與正常瀏覽不同。商店自動發布需先設定擁有者帳號、項目及 GitHub Secrets；本 GitHub Release 不表示已通過 Chrome Web Store 審核。
