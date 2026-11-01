import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const DISPLAY = "Anton";
export const MARKER = "PermanentMarker";
export const SANS = "InterStory";

let loaded = false;
export const loadFonts = () => {
  if (loaded) return;
  loaded = true;
  loadFont({ family: DISPLAY, url: staticFile("fonts/anton-latin-400-normal.woff2") });
  loadFont({ family: MARKER, url: staticFile("fonts/permanent-marker-latin-400-normal.woff2") });
  loadFont({ family: SANS, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });
  loadFont({ family: SANS, url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800" });
};

export const COLORS = {
  pink: "#ff4fa3",
  pinkDeep: "#e0237f",
  sky: "#7fe0ff",
  cream: "#fff6e9",
  ink: "#1a1030",
};
