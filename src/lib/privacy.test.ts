import { describe, expect, it } from "vitest";
import { maskEmail } from "./privacy";

describe("maskEmail", () => {
  it("keeps the first letter and the domain only", () => {
    expect(maskEmail("ana@example.com")).toBe("a**@example.com");
    expect(maskEmail("roman.popescu@company.ro")).toBe("r*****@company.ro");
    expect(maskEmail("  Ana@Example.com ")).toBe("A**@Example.com");
  });

  it("never reveals a short name in full", () => {
    expect(maskEmail("a@b.co")).toBe("a**@b.co");
    expect(maskEmail("ab@b.co")).toBe("a**@b.co");
  });

  it("copes with something that is not an email", () => {
    expect(maskEmail("")).toBe("***");
    expect(maskEmail("no-at-sign")).toBe("***");
    expect(maskEmail("@x.com")).toBe("***");
  });
});
