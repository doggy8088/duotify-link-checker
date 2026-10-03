# Chrome Web Store Listing — Duotify Link Checker

> Last Updated: 2026-10-04

## Store Listing

**Extension Name**

Duotify Link Checker

**Short Description**

Check visible links, images, CSS images, video and audio. Highlight broken resources and filter a detailed on-page report.

**Detailed Description**

Check the links and media on the page you are viewing, and find broken resources in a clear, filterable report.

Duotify Link Checker checks visible hyperlinks, images, CSS background and decorative images, video URLs and audio URLs. Choose all resources or only external resources. Color-coded outlines help you find affected elements directly on the page.

Review successful, broken and uncertain results, inspect HTTP status codes, follow redirect information, and export your results to CSV. Image checks also verify that the server returns an image content type, helping identify login pages or error pages disguised as images. Local page anchors are checked for missing targets.

To start, open a web page, click the Duotify Link Checker toolbar icon, and select Check all resources or Check external resources. Use the report cards to filter results. You can cancel a check, close and reopen the report, or clear the page highlights.

Checks run only when you start them. Resource requests go directly to the linked websites. The extension does not send reports or browsing history to the developer and does not use analytics or advertising. Checking requests do not include login cookies or the page referrer, so restricted or anti-hotlinking resources may behave differently from normal browsing.

Works on ordinary HTTP and HTTPS pages. Browser-protected pages, embedded frames and content inside website shadow roots are not scanned. Successful results indicate URL and applicable image-type checks, not a guarantee of media playback or page content accuracy.

Support and source code: https://github.com/doggy8088/duotify-link-checker

**Category:** Developer Tools (select the closest equivalent in the current Dashboard)

**Single Purpose:** Check resource URLs on the current page and report broken or uncertain links and media.

**Primary Language:** English. Development documentation is also available in Traditional Chinese.

## Graphics & Assets

| Asset                      | Dimensions   | Status                                 | Filename                           |
| -------------------------- | ------------ | -------------------------------------- | ---------------------------------- |
| Store icon                 | 128×128 PNG  | Ready                                  | public/icons/icon-128.png          |
| Full report screenshot     | 1280×800 PNG | Ready                                  | docs/assets/screenshot-report.png  |
| Invalid results screenshot | 1280×800 PNG | Ready                                  | docs/assets/screenshot-invalid.png |
| Small promotional tile     | 440×280      | Ready (required)                       | docs/assets/promo-440x280.png      |
| Marquee promotional tile   | 1400×560     | Not included; optional promotion asset | —                                  |

Screenshots show the real extension running against the repository's deterministic local test site. No third-party user data appears. The imagegen source and prompt are documented in [docs/assets.md](docs/assets.md).

## Permissions Justification

| Permission    | Type             | Justification                                                                                                                                                                                     |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activeTab     | permissions      | Allows the user to invoke the checker on the tab selected through the extension toolbar. The extension does not automatically scan tabs.                                                          |
| scripting     | permissions      | Loads the local checker and its highlight styles into the selected page so it can inspect visible resource URLs and display results.                                                              |
| http://\*/\*  | host_permissions | Checks HTTP resource URLs found on the selected page, including resources hosted on other domains. Linked domains cannot be known in advance. Only explicit user-started scans initiate requests. |
| https://\*/\* | host_permissions | Checks HTTPS resource URLs found on the selected page, including cross-domain image and media URLs. It reads response status and image content type to assess availability.                       |

No remote code, eval, third-party analytics, browsing-history API, cookies API or persistent storage is used. Broad HTTP/HTTPS access is intrinsic to checking arbitrary linked destinations, not background monitoring.

## Privacy & Data Use

**Developer collection:** No reports, URLs or user data are collected by the developer. The extension processes page resource URLs locally and transmits requests directly to their destination servers. Do not describe this as “no network transmission.”

For the Dashboard, disclose website content and web history/URLs conservatively as needed for the core feature, even though the extension has no history API and stores no browsing history. Apply the Dashboard's current definitions; the behavior described below is authoritative.

| Data type                                       | Processing                                                                  | Off-device transmission                                                       | Purpose / retention                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Personally identifiable information             | Not requested or intentionally extracted; resource URLs may contain it      | Any such portion of a checked URL reaches that URL's server                   | Only requesting the user-selected page's resources; no developer retention |
| Health / financial / authentication information | Not intentionally read or collected                                         | No explicit collection; no login cookies or embedded URL credentials are sent | None                                                                       |
| Personal communications                         | Not read as messages                                                        | Not transmitted as message content                                            | None                                                                       |
| Location                                        | No geolocation access                                                       | Destination servers can observe ordinary network IP addresses                 | Normal resource requests                                                   |
| Web history / URLs                              | Resource URLs from the selected page; no browser-history access             | Checked URLs and redirects reach their destination servers                    | Link checking; current-page memory only                                    |
| User activity                                   | Start/cancel/filter actions handled locally                                 | No event tracking transmission                                                | UI operation only                                                          |
| Website content                                 | Resource URL attributes, CSS image references, visibility, local load state | Only requested resource URLs, not page text or report contents                | Resource checking; current-page memory only                                |

User-triggered CSV export writes a local file. The user controls later sharing and deletion. No data is sold or used for advertising.

### Data Use Certification

- [x] Data is NOT sold to third parties.
- [x] Data is NOT used for purposes unrelated to the extension's core functionality.
- [x] Data is NOT used for creditworthiness or lending purposes.

## Privacy Policy

**Public URL:** https://doggy8088.github.io/duotify-link-checker/privacy-policy.html

**Source:** [docs/privacy-policy.md](docs/privacy-policy.md). The HTML copy is generated by `scripts/build-docs.mjs`.

## Distribution

**Intended visibility:** Public. **Intended regions:** All regions, subject to the publisher's Dashboard choices.

## Developer Info

**Publisher Name:** Will 保哥

**Contact Email:** Requires publisher confirmation before first submission. Do not copy a Git commit email into the public listing without confirmation.

**Support URL:** https://github.com/doggy8088/duotify-link-checker/issues

**Homepage URL:** https://github.com/doggy8088/duotify-link-checker

## Version History

| Version | Date       | Changes                                                                        | Status                                           |
| ------- | ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| 1.0.0   | 2026-10-04 | Initial Manifest V3 migration, reports, cancellation, CSV and automated checks | Prepared; store submission pending account setup |

## Review Notes

The main function needs no account or paid service. Open an ordinary public page, invoke the toolbar popup, then Check all resources. Protected pages are handled with an explanatory message. Source, deterministic fixtures and reproduction instructions are public.

Initial live submission still requires a Dashboard item, public contact email, completed listing/privacy form, and publisher credentials. The GitHub Release workflow is ready to submit updates once enabled; Google review is still required.

Known limitations: [docs/migration.md](docs/migration.md). No rejection history at initial preparation.
