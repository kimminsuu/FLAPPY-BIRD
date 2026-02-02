"use client";

import { SessionProvider } from "next-auth/react";
import { SeasonProvider } from "@/lib/season-context";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SeasonProvider>{children}</SeasonProvider>
    </SessionProvider>
  );
}
