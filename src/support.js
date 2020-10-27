const element = typeof document != "undefined"
  ? document.createElement("details")
  : undefined
const elementIsNative = typeof HTMLDetailsElement != "undefined" && element instanceof HTMLDetailsElement

export default {
  open: "open" in element || elementIsNative,
  toggle: "ontoggle" in element
}
