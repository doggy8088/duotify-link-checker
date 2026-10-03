import {
  isVisible,
  absoluteUrl,
  shouldIncludeRecord,
  collectCssImages,
} from "./resources.js";
import { yieldToPage } from "../core/pool.js";

export const HOST_ID = "duotify-link-checker-report-host";

export async function collectVisibleResources(mode, signal) {
  const records = [];
  const add = (record) => {
    if (record.url && shouldIncludeRecord(record, mode)) records.push(record);
  };
  const elements = document.querySelectorAll("*");
  for (let i = 0; i < elements.length; i++) {
    if (signal?.aborted) break;
    const element = elements[i];
    if (element.id !== HOST_ID && isVisible(element)) {
      const tag = element.localName;
      if (tag === "a" && element.hasAttribute("href")) {
        add({
          element,
          type: "link",
          typeLabel: "Link",
          url: absoluteUrl(element.getAttribute("href")),
          source: "href",
        });
      }
      if (["img", "video", "audio"].includes(tag)) {
        const value =
          element.currentSrc ||
          element.getAttribute("src") ||
          (tag !== "img" &&
            element.querySelector("source[src]")?.getAttribute("src"));
        if (value)
          add({
            element,
            type: tag === "img" ? "image" : tag,
            typeLabel:
              tag === "img" ? "Image" : tag[0].toUpperCase() + tag.slice(1),
            url: absoluteUrl(value),
            source: "src/currentSrc",
          });
      }
      collectCssImages(element, add);
    }
    if (i % 100 === 99) await yieldToPage();
  }
  return records;
}
