# 發布與 CI/CD

## 已備妥的自動化

- main push / PR：lint、格式、覆蓋率、真實擴充功能 E2E、ZIP、SHA-256、測試報告 artifact。
- `v*` tag：重新執行相同 CI，成功後將驗證過的 ZIP 發布至 GitHub Release。
- 設定 `CWS_PUBLISH_ENABLED=true` 後，同一 tag workflow 將相同 ZIP 上傳商店並申請審核；通過審核後自動公開。
- Actions 使用固定 commit SHA；Dependabot 每週提供 Actions 與 npm 更新。
- 發布工作序列化，不互相取消；商店秘密只在發布 job 的 `chrome-web-store` environment 使用，PR 不會取得。

## 首次商店設定：擁有者一次性操作

Chrome Web Store 要求擁有者登入、開發者註冊及雙步驟驗證。商店項目與憑證不存在時，自動化無法替代這些帳號操作。

1. 到 [Developer Dashboard](https://chrome.google.com/webstore/devconsole) 建立項目，上傳 GitHub Release 的 ZIP。
2. 依根目錄 [CHROMEWEBSTORE.md](../CHROMEWEBSTORE.md) 填標題、描述、單一用途、每項權限理由與隱私揭露；確認公開聯絡信箱。
3. 上傳 `public/icons/icon-128.png`、`docs/assets/promo-440x280.png`，以及 `docs/assets/screenshot-report.png`、`screenshot-invalid.png`（1280×800）。
4. 隱私權 URL 使用 `https://doggy8088.github.io/duotify-link-checker/privacy-policy.html`；啟用 Pages 後先確認可公開讀取。
5. 設定 Public / 所需地區，完成首次手動提交。之後若更改 visibility，可能需要再從 Dashboard 手動發布一次。
6. 在 Google Cloud 專案啟用 Chrome Web Store API，建立 OAuth client，授權 `https://www.googleapis.com/auth/chromewebstore`，取得可更新的 refresh token。依[官方 API 指南](https://developer.chrome.com/docs/webstore/using-api)操作；正式持續發布應使用適當的 OAuth 發布狀態，避免 External Testing 的短期 token 到期。
7. 在 Dashboard 的 Publisher → Settings 取得 Publisher ID，從項目取得 32 字元 Extension ID。不要用本機 unpacked ID 代替商店 ID。

## GitHub 設定

Repository → Settings → Secrets and variables → Actions。

| 類型     | 名稱                | 值                               |
| -------- | ------------------- | -------------------------------- |
| Variable | CWS_PUBLISHER_ID    | Dashboard Publisher ID           |
| Variable | CWS_EXTENSION_ID    | 商店的 32 字元 extension ID      |
| Variable | CWS_PUBLISH_ENABLED | 完成其他設定後設為 `true`        |
| Secret   | CWS_CLIENT_ID       | OAuth client ID                  |
| Secret   | CWS_CLIENT_SECRET   | OAuth client secret              |
| Secret   | CWS_REFRESH_TOKEN   | 授權商店帳號產生的 refresh token |

Secrets 可設在 repository，或建立 `chrome-web-store` environment 放入其中。若 environment 設 required reviewers，發布會停在 GitHub 審核；想完全自動則不要設定該規則。秘密不要貼到 issue、README 或聊天。

可用 gh 互動式輸入秘密，避免出現在 shell history：

```sh
gh secret set CWS_CLIENT_ID
gh secret set CWS_CLIENT_SECRET
gh secret set CWS_REFRESH_TOKEN
gh variable set CWS_PUBLISHER_ID
gh variable set CWS_EXTENSION_ID
gh variable set CWS_PUBLISH_ENABLED --body true
```

## 一般版本發布

```sh
npm run version:set -- 1.0.1
# 更新 docs/release-notes.md 與 CHROMEWEBSTORE.md 的版本紀錄
npm run format
npm run check
git add .
git commit -m "Release 1.0.1"
git tag v1.0.1
git push origin main v1.0.1
```

tag、package.json、lockfile、manifest 版本必須一致。Chrome 版本每個數值需不大於 65535。不要直接 npm version 後漏改 manifest。`workflow_dispatch` 重跑時必須選 tag，branch 執行會被拒絕。

## API 與錯誤處理

`scripts/publish-store.mjs` 先更新 OAuth token，再將原 ZIP POST 至 v2 upload。IN_PROGRESS 時最多輪詢 30 次、每次 2 秒；只有 SUCCEEDED 才 publish。Publish 使用 `DEFAULT_PUBLISH`、`skipReview: false`、`blockOnWarnings: true`。它回報 API 狀態，不把送審當成已上架。

HTTP 錯誤、未知 upload state、版本不一致與發布缺少 state 都會讓 job 失敗。程式不把 token 或完整認證回應寫到 log。發布程式有模擬成功、延遲、錯誤與缺少設定的測試，但 live 授權只能在帳號設定後確認。

若 GitHub Release 成功而商店失敗，查看該 job 與 Dashboard 的拒絕原因。網路 upload 已成功但 publish 失敗時，先在 Dashboard 確認現有草稿/審核狀態，避免盲目重傳同一版本。可從 Dashboard 提交已上傳版本；需要修改程式則提升版本重發。回復舊行為也必須以更高版本重新提交，商店不接受降版。

## Pages 與產出物

Pages 使用 main 的 `/docs`，內含原生靜態 `privacy-policy.html` 與文件首頁。公開原始碼也提供 Markdown 政策備援。正式 ZIP 僅從 dist 打包，不包含 node_modules、測試、商店文案或秘密；附帶 MIT LICENSE。SHA-256 隨 Release 提供。

官方參考：[跨來源請求](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)、[v2 upload](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/media/upload)、[upload states](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/UploadState)、[v2 publish](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/publish)。
