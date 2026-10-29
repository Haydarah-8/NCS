export { cn } from "cn"

/** URL fragment for a service group, e.g. "Venues & events" -> "venues-events". */
export function groupAnchor(group: string) {
  return group.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "")
}
