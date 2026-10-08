import { afterEach, describe, expect, it } from "vitest";
import { getNetwork, getStationBoard, getStatus, injectBreak, resetService } from "./store";

describe("demo break/reset", () => {
  afterEach(() => {
    resetService();
  });

  it("starts on a healthy baseline", () => {
    resetService();
    expect(getStatus()).toEqual({ broken: false, mode: "normal" });

    const harborfront = getStationBoard("harborfront");
    expect(harborfront).not.toBeNull();
    expect(harborfront?.banner.level).toBe("normal");
    expect(harborfront?.arrivals.length).toBeGreaterThan(0);
    expect(harborfront?.boardError).toBeUndefined();
    expect(harborfront?.arrivals.every((row) => row.platform !== "??")).toBe(
      true,
    );
  });

  it("injects a repeatable disruption and is idempotent", () => {
    resetService();
    const first = injectBreak();
    const second = injectBreak();

    expect(first).toEqual({ broken: true, mode: "disruption" });
    expect(second).toEqual(first);
    expect(getStatus()).toEqual({ broken: true, mode: "disruption" });

    const harborfront = getStationBoard("harborfront");
    expect(harborfront?.banner.level).toBe("disruption");
    expect(harborfront?.arrivals.length).toBeGreaterThan(0);
    expect(
      harborfront?.arrivals.some((row) => row.destination === "SIGNAL LOST"),
    ).toBe(true);
    expect(harborfront?.arrivals.some((row) => row.status === "delayed")).toBe(
      true,
    );

    const midtown = getStationBoard("midtown");
    expect(midtown?.arrivals).toEqual([]);
    expect(midtown?.boardError).toMatch(/offline/i);

    const university = getStationBoard("university");
    expect(university?.arrivals).toEqual([]);
    expect(university?.boardError).toMatch(/feed interrupted/i);

    const network = getNetwork();
    expect(network.stations.find((s) => s.id === "midtown")?.boardError).toBe(
      "Board offline — signal failure",
    );
  });

  it("break then reset: status is disrupted after break and healthy after reset", () => {
    resetService();

    injectBreak();
    expect(getStatus()).toEqual({ broken: true, mode: "disruption" });
    const disrupted = getStationBoard("harborfront");
    expect(disrupted?.banner.level).toBe("disruption");
    expect(
      disrupted?.arrivals.some((row) => row.destination === "SIGNAL LOST"),
    ).toBe(true);

    resetService();
    expect(getStatus()).toEqual({ broken: false, mode: "normal" });
    const healthy = getStationBoard("harborfront");
    expect(healthy?.banner.level).toBe("normal");
    expect(
      healthy?.arrivals.every((row) => row.destination !== "SIGNAL LOST"),
    ).toBe(true);
    expect(healthy?.boardError).toBeUndefined();
  });

  it("reset restores the healthy baseline and is idempotent", () => {
    resetService();
    injectBreak();
    const first = resetService();
    const second = resetService();

    expect(first).toEqual({ broken: false, mode: "normal" });
    expect(second).toEqual(first);

    const harborfront = getStationBoard("harborfront");
    expect(harborfront?.banner.level).toBe("normal");
    expect(harborfront?.boardError).toBeUndefined();
    expect(harborfront?.arrivals.length).toBeGreaterThan(0);
    expect(
      harborfront?.arrivals.every((row) => row.destination !== "SIGNAL LOST"),
    ).toBe(true);
    expect(harborfront?.arrivals.every((row) => /^\d+$/.test(row.platform))).toBe(
      true,
    );

    const midtown = getStationBoard("midtown");
    expect(midtown?.boardError).toBeUndefined();
    expect(midtown?.arrivals.length).toBeGreaterThan(0);
  });
});
