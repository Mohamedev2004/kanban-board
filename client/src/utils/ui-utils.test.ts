import { cn } from "@/utils/ui-utils"

describe("cn", () => {
  it("merges multiple class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2")
  })

  it("dedupes conflicting tailwind classes, keeping the last", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("ignores falsy conditional values", () => {
    const hidden = false
    const block = true
    expect(cn("base", hidden && "hidden", block && "block")).toBe("base block")
  })
})
