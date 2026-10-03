const STATUS = "data-duotify-link-check-status";
const TYPE = "data-duotify-link-check-type";
let states = new WeakMap();
const priority = { invalid: 3, checking: 2, skipped: 1, valid: 0 };

export function applyElementStatus(record, status) {
  const entries = states.get(record.element) || new Map();
  states.set(record.element, entries);
  entries.set(record, status);
  let selected = record;
  let selectedStatus = status;
  for (const [candidate, value] of entries) {
    if (priority[value] > priority[selectedStatus]) {
      selected = candidate;
      selectedStatus = value;
    }
  }
  record.element.setAttribute(TYPE, selected.type);
  record.element.setAttribute(STATUS, selectedStatus);
}

export function clearMarks() {
  states = new WeakMap();
  document.querySelectorAll(`[${STATUS}],[${TYPE}]`).forEach((element) => {
    element.removeAttribute(STATUS);
    element.removeAttribute(TYPE);
  });
}
