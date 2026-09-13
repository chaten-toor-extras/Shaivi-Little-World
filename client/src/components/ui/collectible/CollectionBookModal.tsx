"use client";

import CollectiblePreviewCanvas from "@/components/world/collectibles/CollectiblePreviewCanvas";
import { COLLECTIBLE_MODELS } from "@/components/world/collectibles/modelRegistry";
import { useCompletionCinematicStore } from "@/components/world/completion/useCompletionCinematicStore";
import { useWorldSettings } from "@/providers/ContentProvider";
import { useCollectibleStore } from "@/store/useCollectibleStore";
import type { PublicCollectible } from "@/types";
import React, { useEffect, useMemo, useRef } from "react";
import styles from "./CollectionBook.module.css";

const CATEGORY_ICONS: Record<string, string> = {
  STAR: "✦",
  FLOWER: "✿",
  ART: "✎",
  MEMORY: "▧",
  MUSIC: "♫",
  LETTER: "✉",
  NATURE: "❀",
  MAGIC: "✧",
};

export default function CollectionBookModal() {
  const bookOpen = useCollectibleStore((s) => s.bookOpen);
  const closeBook = useCollectibleStore((s) => s.closeBook);
  const definitions = useCollectibleStore((s) => s.definitions);
  const collected = useCollectibleStore((s) => s.collected);
  const selectedBookItemId = useCollectibleStore((s) => s.selectedBookItemId);
  const selectBookItem = useCollectibleStore((s) => s.selectBookItem);
  const getActiveTotal = useCollectibleStore((s) => s.getActiveTotal);
  const getCollectedCount = useCollectibleStore((s) => s.getCollectedCount);
  const worldSettings = useWorldSettings();
  const hasPlayed = useCompletionCinematicStore((s) => s.hasPlayed);

  const handleReplay = () => {
    closeBook();
    // Allow book modal to cleanly exit and restore focus before triggering cinematic
    setTimeout(() => {
      useCompletionCinematicStore.getState().startCinematic(true);
    }, 200);
  };

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Active, published collectibles
  const activeItems = useMemo(() => {
    return definitions.filter((d) => d.enabled && d.isPublished);
  }, [definitions]);

  // Selected item
  const selectedItem: PublicCollectible | undefined = useMemo(() => {
    if (!activeItems.length) return undefined;
    return (
      activeItems.find((d) => d._id === selectedBookItemId) ||
      activeItems[0]
    );
  }, [activeItems, selectedBookItemId]);

  const isSelectedCollected = Boolean(
    selectedItem && collected[selectedItem._id]
  );

  // Escape key handler
  useEffect(() => {
    if (!bookOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeBook();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookOpen, closeBook]);

  if (!bookOpen) return null;

  const collectedCount = getCollectedCount();
  const activeTotal = getActiveTotal();

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Keepsakes Collection Book"
      onClick={closeBook}
    >
      <div className={styles.book} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerSparkle}>✦</span>
            <span>Little Keepsakes</span>
            <span className={styles.progressPill}>
              {collectedCount} / {activeTotal} found
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={closeBook}
            aria-label="Close Keepsakes Collection"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        <div className={styles.content}>
          {/* Item Grid */}
          <div className={styles.itemList}>
            {activeItems.map((item) => {
              const isItemCollected = Boolean(collected[item._id]);
              const isSelected = selectedItem?._id === item._id;
              const categoryIcon = CATEGORY_ICONS[item.category] || "✦";

              return (
                <button
                  key={item._id}
                  type="button"
                  className={`${styles.itemCard} ${isSelected ? styles.selected : ""} ${!isItemCollected ? styles.uncollected : ""}`}
                  onClick={() => selectBookItem(item._id)}
                  aria-selected={isSelected}
                >
                  <div className={styles.thumbnailPlaceholder}>
                    {isItemCollected ? (
                      <span>{categoryIcon}</span>
                    ) : (
                      <span className={styles.silhouette}>?</span>
                    )}
                  </div>
                  <div className={styles.itemName}>
                    {isItemCollected ? item.name : "???"}
                  </div>
                  <div className={styles.itemCategory}>
                    {isItemCollected ? item.category : "undiscovered"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Single Shared 3D Preview and Detail Panel */}
          {selectedItem && (
            <div className={styles.detailPanel}>
              <div className={styles.previewBox}>
                {isSelectedCollected ? (
                  <CollectiblePreviewCanvas
                    modelKey={selectedItem.model?.modelKey}
                    scalePreset="FEATURED"
                    rotationPreset={selectedItem.model?.rotationPreset}
                    glowColor={selectedItem.appearance?.glowColor}
                    accentColor={selectedItem.appearance?.accentColor}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      fontSize: "3.5rem",
                      color: "#cdbcaa",
                    }}
                  >
                    ✦
                  </div>
                )}
              </div>

              <h4 className={styles.detailTitle}>
                {isSelectedCollected ? selectedItem.name : "Unfound Keepsake"}
              </h4>

              <div className={styles.detailBadge}>
                {isSelectedCollected
                  ? `${selectedItem.category} · ${selectedItem.rarity}`
                  : "Somewhere on the island"}
              </div>

              {isSelectedCollected ? (
                <>
                  <p className={styles.detailDesc}>
                    {selectedItem.description ||
                      COLLECTIBLE_MODELS[selectedItem.model?.modelKey]?.description ||
                      "A small piece of this world."}
                  </p>
                  {collected[selectedItem._id]?.collectedAt && (
                    <div className={styles.detailDate}>
                      Discovered{" "}
                      {new Date(
                        collected[selectedItem._id].collectedAt
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className={styles.detailDesc}>
                    This item has not yet been discovered. Follow your curiosity
                    across the island.
                  </p>
                  {selectedItem.hint && (
                    <div className={styles.detailHint}>
                      “{selectedItem.hint}”
                    </div>
                  )}
                </>
              )}

              {hasPlayed && (worldSettings.completion?.enabled ?? true) && (
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px dashed rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={handleReplay}
                    style={{
                      background: "rgba(255, 255, 255, 0.6)",
                      border: "1px solid rgba(60, 47, 61, 0.2)",
                      borderRadius: "16px",
                      padding: "0.35rem 0.85rem",
                      fontSize: "0.75rem",
                      color: "#554854",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    aria-label="Replay final world moment"
                  >
                    {worldSettings.completion?.replayLabel || "Replay final moment ✦"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

