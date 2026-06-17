import { describe, it, expect } from "vitest";
import { parseTagsInput, getTagColor, truncate } from "../utils/helpers";

describe("helpers", () => {
  it("parseTagsInput splits and normalizes tags", () => {
    expect(parseTagsInput("Work, Personal, work")).toEqual(["work", "personal"]);
  });

  it("parseTagsInput limits to 20 tags", () => {
    const input = Array.from({ length: 25 }, (_, i) => `tag${i}`).join(", ");
    expect(parseTagsInput(input)).toHaveLength(20);
  });

  it("getTagColor returns consistent color for same tag", () => {
    expect(getTagColor("work")).toBe(getTagColor("work"));
    expect(getTagColor("work")).not.toBe(getTagColor("personal"));
  });

  it("truncate shortens long text", () => {
    expect(truncate("hello world", 5)).toBe("hello…");
    expect(truncate("hi", 5)).toBe("hi");
  });
});
