"use client";

import { SeasonProvider } from "@/lib/season-context";
import { UserProvider } from "@/lib/user-context";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <UserProvider>
      <SeasonProvider>{children}</SeasonProvider>
    </UserProvider>
  );
}
