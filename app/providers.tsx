"use client";

import { SeasonProvider } from "@/lib/season-context";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <SeasonProvider>{children}</SeasonProvider>;
}
