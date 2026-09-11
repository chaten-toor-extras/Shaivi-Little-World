"use client";

import { milestones as defaultMilestones } from "@/data/timeline";
import { useJourney } from "@/providers/ContentProvider";
import type { JourneyMilestone } from "@/types";
import {
  Component,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import StarJourney from "./StarJourney";
import TelescopeJourney from "./telescope/TelescopeJourney";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class JourneyErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(
      "TelescopeJourney rendering encountered an error, falling back to StarJourney:",
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function JourneyExperience() {
  const cmsMilestones = useJourney();
  const [simpleMode, setSimpleMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("simple") === "true" || params.get("mode") === "simple") {
        setSimpleMode(true);
      }
    }
  }, []);

  const milestones: JourneyMilestone[] = useMemo(() => {
    const raw =
      cmsMilestones && cmsMilestones.length > 0
        ? cmsMilestones
        : defaultMilestones;
    return (raw as any[]).map((m, i) => ({
      _id: m._id || `milestone-${i}`,
      title: m.title || "",
      year: m.year || "",
      text: m.text || "",
      image: m.image,
      altText: m.altText,
      order: typeof m.order === "number" ? m.order : i,
      isPublished: m.isPublished ?? true,
      desktopPosition: m.desktopPosition,
      telescope: m.telescope,
      createdAt: m.createdAt || "",
      updatedAt: m.updatedAt || "",
    }));
  }, [cmsMilestones]);

  const isFeatureEnabled =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_TELESCOPE_JOURNEY_ENABLED !== "false";

  // Progressive enhancement check: if simple mode or feature disabled, use classic StarJourney
  if (simpleMode || !isFeatureEnabled) {
    return <StarJourney />;
  }

  return (
    <JourneyErrorBoundary fallback={<StarJourney />}>
      <TelescopeJourney milestones={milestones} />
    </JourneyErrorBoundary>
  );
}
