"use client";

import Experience from "@/components/experience/Experience";
import { ContentProvider } from "@/providers/ContentProvider";

export default function Page() {
  return (
    <ContentProvider>
      <Experience />
    </ContentProvider>
  );
}
