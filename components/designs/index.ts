import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DesignProps } from "./types";

// Each design is loaded only when it is shown, so guests download one design, not all of them.
const PampasEmboss = dynamic<DesignProps>(() => import("./story/PampasEmboss"));

export type DesignInfo = {
  id: string;
  name: string;
  category: "Story";
  animated: boolean;
  swatch: string;
  Component: ComponentType<DesignProps>;
};

/** Add new designs here: they appear in the editor's template picker automatically. */
export const DESIGNS: DesignInfo[] = [
  { id: "pampas-emboss", name: "Pampas Emboss", category: "Story", animated: true, swatch: "#e9dfd2", Component: PampasEmboss },
];

export function getDesign(id?: string | null): DesignInfo {
  return DESIGNS.find((d) => d.id === id) ?? DESIGNS[0];
}
