# Privacy Policy — Duotify Link Checker

Effective date: October 4, 2026

Duotify Link Checker is developed by Will 保哥. Its purpose is to check links and media resources on the web page you choose.

## What the extension processes

Only when you start a check, the extension reads resource URLs and related element information from the current page, including links, images, CSS image references, video and audio. It uses page element visibility and local image/media load state to decide which resources to check. Results are held in that page's memory until you clear them, navigate away, or close the tab. It does not maintain browsing history or upload reports to the developer.

## Network requests

The extension sends HEAD requests and, when needed, GET requests directly to the resource URLs on the selected page. Requests may follow redirects. As with normal web traffic, destination servers receive your IP address, browser-controlled request headers, and the requested URL, which may contain query parameters or personal information already present in the page's links. These servers may log requests under their own policies. The extension does not include login cookies or a page Referer in its checking requests and does not read response bodies for analysis. It cancels GET bodies after headers arrive when possible.

No resource URLs, page contents, results, analytics, advertising identifiers, or telemetry are sent to Will 保哥 or a separate analytics service. The extension has no developer-operated backend, advertising, tracking SDK, account system, or payment processing.

## Storage and export

The extension does not use persistent extension storage or browser sync. If you choose Export CSV, the report is saved to a file on your device. That file can contain resource URLs and should be shared only as you intend. You may delete exported files yourself. Uninstalling the extension does not delete files you exported.

## Permissions and control

The activeTab and scripting permissions let the extension operate on the page you select. HTTP/HTTPS host access allows it to check resources across the websites linked by that page. Checks are manual; it does not automatically crawl websites in the background. You can cancel a scan, clear marks, restrict site access in Chrome, or remove the extension.

## Data use

The developer does not sell data, use data for unrelated purposes, or use data for creditworthiness or lending decisions. Resource URL processing and direct requests are used only for the link-checking feature. No personally identifiable information is requested from you by the extension.

## Contact and updates

Questions can be submitted at [the project's support page](https://github.com/doggy8088/duotify-link-checker/issues). Avoid including private URLs or sensitive reports in a public issue. Policy changes will be published here with a revised effective date.

---

本擴充功能只在使用者啟動檢查後讀取目前頁面的資源網址，直接向該資源伺服器送出 HEAD / GET。目的站點會收到 IP、網址及一般請求標頭；檢查不附登入 Cookie 或 Referer。結果留在頁面記憶體，不傳給開發者、不做追蹤、不儲存瀏覽紀錄。使用者主動匯出的 CSV 保存在本機，請自行管理分享與刪除。
