# 行為規格

## 收集範圍

僅目前頂層文件中有渲染矩形、非隱藏的元素；不限制於目前 viewport。Chrome `checkVisibility` 處理祖先的 opacity/visibility，並以 computed style 與 client rects 輔助。掃描開始後新增的元素須再執行一次檢查。

超連結讀取 `href`；圖片優先 currentSrc，支援瀏覽器已選定的 srcset；媒體優先 currentSrc/src，尚未選定時採第一個 source。CSS 讀 computed style，涵蓋 background-image、border-image-source、list-style-image、mask-image、-webkit-mask-image、content，並處理 ::before / ::after。list-style-image 只對 list-item 收集；同一元素/偽元素內同 URL 的屬性別名去重。

外部定義為不同 URL origin，包含協定或 port 不同；子網域也屬外部。非 HTTP 協定不列入 external 模式。

## 驗證決策

| 結果     | 判斷                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| Valid    | 最終 2xx；圖片還須具體 `image/子類型` MIME                                     |
| Invalid  | GET 確認 HTTP 錯誤，或圖片 MIME 缺少/錯誤；找不到的本頁 fragment；無法解析 URL |
| Skipped  | 401/403、429、網路錯誤、逾時、取消、特殊協定、連線中斷                         |
| Checking | 尚未得到結果                                                                   |

HEAD 通過即完成；429 不馬上以 GET 重試。其他 HEAD 失敗，包括圖片 HEAD MIME 不正確，皆以 GET 再確認。重新導向會跟隨並在 Note 顯示最終 URL。GET 到達標頭即取消本文，不讀取整個影片。無法完成的 redirect 不當作健康的 3xx。

同頁 fragment 以解碼後 id 或 name 尋找；單一 `#` 指頁首。data/blob 圖片看 complete/naturalWidth；data/blob 媒體看 error/readyState。CSS data/blob 沒有獨立 DOM load state，列 Skipped。本頁 SVG mask fragment 不以 HTML 的 MIME 當圖片失敗。

HTTP 圖片不檢查位元內容是否能解碼；HTTP 影片/音訊不驗證 codec 或 MIME，因此 Valid 不是可播放保證。HTTP 200 的一般超連結也可能是站方的 soft-404。

## 顯示與匯出

同一元素多資源的框線優先級為 Invalid > Checking > Skipped > Valid，非同步完成順序不會以成功覆蓋錯誤。連結框線 offset 較大，因此包住圖片的超連結可與圖片各自顯示。

報表提供 Type、Status、HTTP、Scope、URL、Note；固定桌面尺寸並限制於 viewport。篩選不改變 dialog 尺寸。CSV 匯出所有當下結果（不受畫面篩選影響），包含 BOM、CRLF、完整 quoting；以 `= + - @` 開頭的儲存格加前導單引號，避免試算表公式執行。

Cancel 停止未完成工作，但保留已完成結果。Close/Escape 不取消檢查。清除所有標示後也移除報表；重新載入頁面同樣會清除。
