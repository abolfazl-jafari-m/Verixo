import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPersistedRecord } from "@/lib/storage/persisted-record";
import { z } from "zod";

import { MemoryStorage } from "@/lib/storage/__tests__/memory-storage";
let storage: MemoryStorage;
const make = () =>
  createPersistedRecord({
    name: "new",
    initial: { count: 0 },
    parse: (value) => z.object({ count: z.number() }).parse(value),
    legacy(target) {
      const raw = target.getItem("old");
      return raw === null ? null : { value: JSON.parse(raw), keys: ["old"] };
    },
  });
beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});
afterEach(() => vi.unstubAllGlobals());
describe("persisted browser records", () => {
  it("does not hydrate until requested; persists only domain data", () => {
    storage.setItem("old", JSON.stringify({ count: 3 }));
    const record = make();
    expect(record.store.getState()).toEqual({ value: { count: 0 }, ready: false, available: true });
    expect(record.store.persist.hasHydrated()).toBe(false);
    expect(record.read().value.count).toBe(3);
    expect(JSON.parse(storage.getItem("new")!)).toEqual({
      version: 1,
      state: { value: { count: 3 } },
    });
    expect(storage.getItem("old")).toBeNull();
    record.save({ count: 7 });
    expect(make().read().value.count).toBe(7);
  });
  it("never overwrites a new record with stale legacy values", () => {
    make().save({ count: 9 });
    storage.setItem("old", JSON.stringify({ count: 1 }));
    expect(make().read().value.count).toBe(9);
    expect(make().read().value.count).toBe(9);
  });
  it("keeps valid legacy data when migration cannot be saved", () => {
    storage.setItem("old", JSON.stringify({ count: 3 }));
    storage.failWrites = true;
    const record = make();
    expect(() => record.read()).toThrow("quota");
    expect(record.store.getState().value.count).toBe(3);
    expect(record.store.getState().available).toBe(false);
    expect(storage.getItem("old")).not.toBeNull();
    storage.failWrites = false;
    expect(record.read().value.count).toBe(3);
    expect(storage.getItem("old")).toBeNull();
  });
  it.each([
    "{",
    '{"version":1,"state":{"value":{"count":"bad"}}}',
    '{"version":99,"state":{"value":{"count":1}}}',
  ])("rejects malformed/unsupported state without rewriting it: %s", (raw) => {
    storage.setItem("new", raw);
    expect(() => make().read()).toThrow();
    expect(storage.getItem("new")).toBe(raw);
  });
  it("rolls back failed saves and supports recovery", () => {
    const record = make();
    record.save({ count: 2 });
    const published: number[] = [];
    record.store.subscribe((state) => published.push(state.value.count));
    storage.failWrites = true;
    expect(() => record.save({ count: 4 })).toThrow();
    expect(record.store.getState().value.count).toBe(2);
    expect(published).not.toContain(4);
    expect(record.store.getState().available).toBe(false);
    storage.failWrites = false;
    record.save({ count: 4 });
    expect(record.store.getState().available).toBe(true);
  });
  it("handles blocked storage and never touches storage in SSR", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    const record = make();
    expect(() => record.read()).toThrow("blocked");
    vi.unstubAllGlobals();
    expect(make().read().ready).toBe(false);
    expect(() => make().save({ count: 1 })).toThrow("Browser storage required");
  });
});
