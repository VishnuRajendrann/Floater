import { rmSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const iconsDir = join(process.cwd(), "src-tauri", "icons");

if (!existsSync(iconsDir)) {
  process.exit(0);
}

const dropDirs = ["ios", "android"];
for (const dir of dropDirs) {
  rmSync(join(iconsDir, dir), { recursive: true, force: true });
}

const dropFiles = ["icon.icns", "icon.png", "StoreLogo.png"];
for (const name of readdirSync(iconsDir)) {
  if (dropFiles.includes(name) || /^Square\d+x\d+Logo\.png$/i.test(name)) {
    rmSync(join(iconsDir, name), { force: true });
  }
}
