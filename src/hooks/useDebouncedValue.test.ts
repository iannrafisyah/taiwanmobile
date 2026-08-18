import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("mengembalikan nilai awal secara langsung", () => {
    const { result } = renderHook(() => useDebouncedValue("kopi", 300));
    expect(result.current).toBe("kopi");
  });

  it("menunda pembaruan sampai delay terlewati", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "k" },
    });

    rerender({ value: "kopi" });
    expect(result.current).toBe("k");

    act(() => void vi.advanceTimersByTime(299));
    expect(result.current).toBe("k");

    act(() => void vi.advanceTimersByTime(1));
    expect(result.current).toBe("kopi");
  });

  it("hanya menghasilkan nilai terakhir saat pengetikan beruntun", () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "" },
    });

    for (const value of ["k", "ko", "kop", "kopi"]) {
      rerender({ value });
      act(() => void vi.advanceTimersByTime(100));
    }

    expect(result.current).toBe("");

    act(() => void vi.advanceTimersByTime(300));
    expect(result.current).toBe("kopi");
  });
});
