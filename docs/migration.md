# 從 Tampermonkey 遷移

來源為 `TampermonkeyUserscripts/src/LinkChecker.user.js`，版本 1.1.0，作者 Will 保哥，MIT。原始檔保留在原儲存庫，本專案未修改該檔。

本次來源檔 SHA-256：`85f689c9670b9648a9589e75ac9cd53e88e9d624f7f4c8eb5312003758bff09d`。

| 原功能                             | 擴充功能實作與測試                                               |
| ---------------------------------- | ---------------------------------------------------------------- |
| 兩個 GM_registerMenuCommand        | 工具列 popup 的全部/外部檢查；E2E 驗證兩種模式                   |
| GM_addStyle                        | Chrome scripting 注入 outline CSS；報表 CSS 在 Shadow DOM        |
| GM_xmlhttpRequest                  | Service worker fetch，HEAD / GET fallback 與 AbortSignal         |
| 可見的超連結、IMG、影片、音訊      | collector 單次遍歷、分批讓出主執行緒；另補 media source fallback |
| CSS url()、多層背景、偽元素、mask  | 原有 CSS parser 保留並模組化；引號、括號、escape、alias 測試     |
| 內部/外部 origin 比較              | 保留 origin 定義；不使用網域字串猜測                             |
| data/blob、非 HTTP 協定、錨點      | special 模組保留；補 `#` 頁首判定                                |
| 2xx + 圖片 MIME                    | 保留，並拒絕不能證明成功的最終 3xx                               |
| 401/403/429/網路錯誤/逾時          | Skipped，不直接宣告連結損壞                                      |
| 8 個並行工作、Promise cache        | 每次掃描獨立、worker 再限制 8 個 in-flight                       |
| 多資源共用元素的嚴重性框線         | 保留優先順序；完成順序測試                                       |
| 固定尺寸、可篩選的 Shadow DOM 報表 | 保留；改為原生 dialog，增加焦點管理、取消、重開、清除、CSV       |

## 有意調整

請求不傳 Cookie、HTTP 認證資訊或 Referer，也不仿造 User-Agent。瀏覽器端 fetch 不能任意設定 Tampermonkey 可處理的受限制標頭；不為此增加攔截或修改全站請求的權限。因此需登入或依 Referer 防盜連的資源可能與舊版結果不同。Popup、README、隱私權政策及商店描述都公開這個行為。HTML 回傳的圖片 URL 依然應標 Invalid，而不是假裝是圖片。

原腳本每種資源用不同深淺的框線；目前統一每個狀態的顏色，資源類型透過報表及 outline offset 區分，以提升可讀性。原本報表的完整資訊欄位均保留。

## 已知限制

- 不深入 iframe、網站 Shadow DOM、canvas 或 JavaScript 尚未渲染的資源；與來源腳本的主範圍一致。
- 不主動捲動觸發 lazy loading，也不檢查所有 srcset 候選，僅檢查目前被瀏覽器選中的來源。
- 以 HTTP 狀態與圖片 MIME 驗證，不解碼 HTTP 圖片、不實際播放影音、不偵測 soft-404 或惡意網頁。
- data/blob CSS 圖片以及無法判定的連線結果列為 Skipped。
- Chrome 內部頁、Web Store 與其他受保護網頁無法注入；file:// 不在權限範圍。
- 結果不跨頁面導覽或瀏覽器重啟保留；需要保存時先匯出 CSV。
- 網站可更改 DOM、阻止載入、限流，或依網路位置回傳不同結果；不能保證任意網站永久可用。

新增功能或擴大範圍前，先修改本文件、對應測試與權限揭露。
