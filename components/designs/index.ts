import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DesignProps } from "./types";

// Each design is loaded only when it is shown, so guests download one design, not all of them.
const GoldenPoruwa = dynamic<DesignProps>(() => import("./GoldenPoruwa"));
const EternalNoir = dynamic<DesignProps>(() => import("./EternalNoir"));
const KandyanHeritage = dynamic<DesignProps>(() => import("./animated/KandyanHeritage"));
const ChapelDoors = dynamic<DesignProps>(() => import("./animated/ChapelDoors"));
const VelvetNight = dynamic<DesignProps>(() => import("./animated/VelvetNight"));
const WaxSeal = dynamic<DesignProps>(() => import("./animated/WaxSeal"));
const CrimsonCurtain = dynamic<DesignProps>(() => import("./animated/CrimsonCurtain"));
const CoastalDrive = dynamic<DesignProps>(() => import("./animated/CoastalDrive"));
const BoardingPass = dynamic<DesignProps>(() => import("./animated/BoardingPass"));

export type DesignInfo = {
  id: string;
  name: string;
  category: "Traditional" | "Church" | "Homecoming" | "Modern" | "Classic" | "Cinematic";
  animated: boolean;
  swatch: string;
  Component: ComponentType<DesignProps>;
};

/** Add new designs here: they appear in the editor's template picker automatically. */
export const DESIGNS: DesignInfo[] = [
  { id: "kandyan-heritage", name: "Kandyan Heritage", category: "Traditional", animated: true, swatch: "#b08a3e", Component: KandyanHeritage },
  { id: "chapel-doors", name: "Chapel Doors", category: "Church", animated: true, swatch: "#e9dfcb", Component: ChapelDoors },
  { id: "velvet-night", name: "Velvet Night", category: "Homecoming", animated: true, swatch: "#4a2140", Component: VelvetNight },
  { id: "wax-seal", name: "Wax Seal", category: "Classic", animated: true, swatch: "#e6d4b8", Component: WaxSeal },
  { id: "crimson-curtain", name: "Crimson Curtain", category: "Traditional", animated: true, swatch: "#8f1220", Component: CrimsonCurtain },
  { id: "coastal-drive", name: "Coastal Drive", category: "Cinematic", animated: true, swatch: "#3f6b35", Component: CoastalDrive },
  { id: "boarding-pass", name: "Boarding Pass", category: "Cinematic", animated: true, swatch: "#0f1c3d", Component: BoardingPass },
  { id: "golden-poruwa", name: "Golden Poruwa", category: "Classic", animated: false, swatch: "#d6b36a", Component: GoldenPoruwa },
  { id: "eternal-noir", name: "Eternal Noir", category: "Modern", animated: false, swatch: "#0a0a0a", Component: EternalNoir },
];

export function getDesign(id?: string | null): DesignInfo {
  return DESIGNS.find((d) => d.id === id) ?? DESIGNS.find((d) => d.id === "golden-poruwa")!;
}
