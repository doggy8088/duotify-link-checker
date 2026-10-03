# 架構

## 元件與資料流

```mermaid
sequenceDiagram
    actor User
    participant Popup
    participant Content as Content script
    participant Worker as Service worker
    participant Site as Resource server
    User->>Popup: Check all / external
    Popup->>Content: Inject scripts and DLC_START
    Content->>Content: Collect visible resources in batches
    Content->>Content: Check fragments and data/blob locally
    Content->>Worker: Port message: id, url, resourceType
    Worker->>Site: HEAD; GET fallback if needed
    Site-->>Worker: Status, Content-Type, final URL
    Worker-->>Content: id, result
    Content->>Content: Update marks and filterable report
    User->>Content: Cancel
    Content->>Worker: Disconnect port
    Worker->>Site: Abort in-flight requests
```

## 執行週期

沒有宣告式 content scripts，也沒有頁面載入時自動檢查。Popup 開啟時注入本地 CSS/JS，只有 DLC_START 會開始掃描。隔離環境中的 `__duotifyLinkChecker` 防止重複安裝 listener；網頁主世界無法以同名全域變數攔截。

每個分頁的 content script 擁有掃描狀態、結果、元素參照與每次掃描的 Promise cache。狀態不需永久儲存，頁面導覽即丟棄。Worker 可被 Chrome 停止；只有目前 port 的 AbortController 與 active 計數器存在記憶體，不把結果或設定存放於 worker 全域狀態。

每次 HTTP 探測最多 12 秒；HEAD + GET 最多約 24 秒。content transport 在 27 秒內未收到回應則將結果列為 Skipped。port 中斷會立即結束目前等待，之後的新請求可重新建立 port。取消會標示未完成項目為 Skipped，並避免繼續啟動工作。頁面關閉會斷開 port、取消 worker 中的請求。

關閉報表只隱藏原生 dialog；檢查繼續執行，可由 popup 重新顯示。清除須等工作結束，避免舊結果寫回已清除的狀態。

## 訊息協定

| 訊息               | 方向             | 資料與回應                                          |
| ------------------ | ---------------- | --------------------------------------------------- |
| DLC_STATUS         | popup → content  | `{running, hasReport, error}`                       |
| DLC_START          | popup → content  | `mode: all / external`；立即回 `{ok}`，背景繼續工作 |
| DLC_SHOW           | popup → content  | 重新顯示報表                                        |
| DLC_CANCEL         | popup → content  | 中止掃描、關閉 port                                 |
| DLC_CLEAR          | popup → content  | 刪除報表與標示；執行中回傳錯誤                      |
| duotify-check port | content → worker | `{id, url, resourceType}`                           |
| port result        | worker → content | `{id, result: {status, httpStatus, note}}`          |

## 權限與邊界

`activeTab` 授權使用者當下操作的分頁，`scripting` 載入本地內容程式。HTTP/HTTPS host permissions 讓 worker 檢查頁面所連到的任意站點，繞過網頁 CORS；沒有 cookies、history、tabs、webRequest、downloads 或 storage 權限。

Worker 只接受同一 extension ID、頂層 HTTP/HTTPS 分頁的指定 port。URL 必須是 HTTP/HTTPS、長度受限、不得包含帳密；類型必須在 allowlist 中。每個 port 最多 8 個同時請求。沒有 externally_connectable，沒有 window.postMessage bridge，也不會接受任意 HTTP method、headers 或 request body。

請求由瀏覽器處理 redirect，使用 `credentials: omit` 與 `referrerPolicy: no-referrer`。不模擬或竄改 User-Agent / Referer。這可降低副作用，但無法防止設計不當的網站讓 GET 產生副作用；掃描者應只檢查其打算存取的頁面。這不是安全掃描器，也不判斷連結是否惡意。

報表以 textContent 寫入頁面資料；只有 HTTP/HTTPS URL 可點擊，使用 `noopener noreferrer`。CSV 防止公式注入；Shadow DOM 隔離 UI 樣式，原生 dialog 提供焦點管理與 Escape。頁面仍可能移除或讀取 DOM 報表，因此 DOM 不是秘密儲存區。

## 效能

DOM 每 100 個元素讓出主執行緒；報表建列與標示也分批。網路以類型 + 去除 fragment 的 URL 共享 Promise，同次掃描的重複元素不重複請求。報表每筆只改該列，避免每次結果都重新掃描整張表；使用者切換篩選時才遍歷全部列。GET 只需標頭，取得後取消 response body。極大型頁面仍會消耗與元素/結果數量成正比的記憶體。
