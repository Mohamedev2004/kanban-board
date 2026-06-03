import { render, screen } from "@testing-library/react"

import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument()
  })

  it("reflects the variant and size as data attributes", () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    )

    const button = screen.getByRole("button", { name: "Delete" })
    expect(button).toHaveAttribute("data-variant", "destructive")
    expect(button).toHaveAttribute("data-size", "sm")
  })

  it("can be disabled", () => {
    render(<Button disabled>Submit</Button>)

    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled()
  })
})
