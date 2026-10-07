"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Ob prihodu na katerokoli stran si zapomni UTM parametre (glej lib/attribution).
export default function CaptureAttribution() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
