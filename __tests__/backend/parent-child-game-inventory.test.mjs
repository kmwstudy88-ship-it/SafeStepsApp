import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const gamesDirectory = path.join(
  root,
  "curriculum/source-imports/curriculum-archive/canonical-root-cleanup-20260726/games",
);
const manifestPath = path.join(root, "lib/games/parentChildInteractionGameManifest.json");

describe("parent-child interaction game inventory", () => {
  test("contains exactly games 1 through 150", () => {
    const files = fs.readdirSync(gamesDirectory)
      .filter((name) => /^game_\d+\.json$/.test(name));
    const ids = files.map((name) => name.replace(".json", ""));

    expect(files).toHaveLength(150);
    expect(new Set(ids)).toEqual(
      new Set(Array.from({ length: 150 }, (_, index) => `game_${index + 1}`)),
    );
  });

  test("all game JSON files are readable and match their filename", () => {
    for (let index = 1; index <= 150; index += 1) {
      const filename = `game_${index}.json`;
      const raw = fs.readFileSync(path.join(gamesDirectory, filename), "utf8").replace(/^\uFEFF/, "");
      expect(JSON.parse(raw).id).toBe(`game_${index}`);
    }
  });

  test("canonical manifest keeps the library outside curriculum", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    expect(manifest.expectedGameCount).toBe(150);
    expect(manifest.games).toHaveLength(150);
    expect(manifest.curriculum).toBe(false);
    expect(manifest.libraryType).toBe("relationship_assessment_and_bond_building");
    expect(manifest.interpretationRules.noAutomaticCaseDecision).toBe(true);
  });
});
