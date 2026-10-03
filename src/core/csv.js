function cell(value) {
  let text = String(value ?? "");
  // Neutralize spreadsheet formulas, including whitespace-prefixed formulas.
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function toCsv(records) {
  return (
    "\uFEFF" +
    [
      ["Type", "Status", "HTTP", "URL", "Source", "Note"],
      ...records.map((record) => [
        record.type,
        record.result?.status || "checking",
        record.result?.httpStatus,
        record.url,
        record.source,
        record.result?.note,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n")
  );
}
