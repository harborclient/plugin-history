import { describe, expect, it } from "vitest";
import {
  MAX_BODY_BYTES,
  mergeHistoryEntries,
  truncateBody,
} from "./historyEntry.js";

describe("truncateBody", () => {
  it("returns the original body when under the cap", () => {
    expect(truncateBody("hello")).toEqual({ body: "hello", truncated: false });
  });

  it("truncates bodies larger than the cap", () => {
    const large = "x".repeat(MAX_BODY_BYTES + 100);
    const result = truncateBody(large);
    expect(result.truncated).toBe(true);
    expect(result.body).toContain("[truncated");
    expect(new TextEncoder().encode(result.body).length).toBeLessThanOrEqual(
      MAX_BODY_BYTES + 200
    );
  });
});

describe("mergeHistoryEntries", () => {
  it("returns existing when pending is empty", () => {
    const existing = [{ id: "a" } as never];
    expect(mergeHistoryEntries([], existing)).toEqual(existing);
  });

  it("returns pending when existing is empty", () => {
    const pending = [{ id: "a" } as never];
    expect(mergeHistoryEntries(pending, [])).toEqual(pending);
  });

  it("places pending before existing and dedupes by id", () => {
    const pending = [{ id: "b" } as never, { id: "a" } as never];
    const existing = [{ id: "a" } as never, { id: "c" } as never];
    expect(
      mergeHistoryEntries(pending, existing).map((entry) => entry.id)
    ).toEqual(["b", "a", "c"]);
  });
});
