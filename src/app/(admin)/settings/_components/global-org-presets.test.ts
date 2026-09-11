import { describe, it, expect } from "vitest";
import { GLOBAL_ORG_PRESETS } from "./global-org-presets-modal";

describe("GLOBAL_ORG_PRESETS", () => {
  it("contains valid global academic standard presets", () => {
    expect(GLOBAL_ORG_PRESETS.length).toBeGreaterThanOrEqual(6);

    for (const preset of GLOBAL_ORG_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.nameTh).toBeTruthy();
      expect(preset.nameEn).toBeTruthy();
      expect(preset.category).toBeTruthy();
      expect(preset.categoryLabel).toBeTruthy();
      expect(preset.icon).toBeDefined();
      expect(preset.description).toBeTruthy();

      // Validate length constraints
      expect(preset.nameTh.length).toBeLessThanOrEqual(255);
      expect(preset.nameEn.length).toBeLessThanOrEqual(255);
    }
  });

  it("includes representative university & faculty categories", () => {
    const categories = GLOBAL_ORG_PRESETS.map((p) => p.category);
    expect(categories).toContain("graduate");
    expect(categories).toContain("engineering");
    expect(categories).toContain("medicine");
    expect(categories).toContain("interdisciplinary");
  });
});
