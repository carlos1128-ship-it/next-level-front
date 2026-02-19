import { useEffect, useState } from "react";
import type { DetailLevel } from "../types/domain";

const DETAIL_STORAGE_KEY = "ai_detail_level";

function resolveInitialDetailLevel(): DetailLevel {
  const stored = localStorage.getItem(DETAIL_STORAGE_KEY);
  if (stored === "low" || stored === "medium" || stored === "high") return stored;
  return "medium";
}

export function useDetailLevel() {
  const [detailLevel, setDetailLevel] =
    useState<DetailLevel>(resolveInitialDetailLevel);

  useEffect(() => {
    localStorage.setItem(DETAIL_STORAGE_KEY, detailLevel);
  }, [detailLevel]);

  return { detailLevel, setDetailLevel };
}
