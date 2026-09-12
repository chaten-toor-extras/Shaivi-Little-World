# Phase 9.6 quote television

The existing Desk television stays at its island anchor. Following the visual revision, its cabinet reproduces the original HTML TV's rounded brown case, recessed sage CRT, cream tuning dials, speaker grille, branding and power indicator. Previous/Next are above the grille and Power below. Screen, text, hit targets and labels are television-local children. No world placement, CMS schema, admin screen, shared stylesheet, music behavior or navigation controller was changed.

`QuoteTVProvider` bridges the DOM and Canvas. It uses the existing QUOTES mode and public content provider. The shared runtime player retains channel/page through focus exits and Simple Mode; browsing has no network or database operation. Published ordering is preserved. The current CMS has category, not author; an optional supplied author is displayed without inventing one.

The screen auto-powers after camera arrival plus 300 ms. Camera resize disables interaction until the new framing settles. Power animation takes 420 ms, quote transitions 300 ms; reduced motion uses fades. Long content is paginated without character loss. Tap the screen, press Down, or use Next page in the accessible controls. Left/Right tune, P toggles power, Escape/Back returns. Space toggles power outside native buttons; focused buttons retain their normal Space behavior. The Explore menu retains Escape priority.

Drei/Troika Text renders the actual world-space quote in the original Italiana typeface, hosted locally with its OFL license. The screen includes the saved category, channel, quote count and long-quote page details. A bounded screen-local CanvasTexture using system fonts stays visible until text geometry has synchronized. It is disposed when replaced. The readable-text dropdown has been removed. Accessible controls stay visually hidden until keyboard focus; full quotes remain available through polite screen-reader announcements. The camera fits the cabinet to 90% of viewport width or 78% of height, whichever fits first; the antenna/environment can extend beyond this intentional close-up.

`NEXT_PUBLIC_IN_WORLD_QUOTE_TV` defaults to enabled. Set it to `false` in `client/.env.local` and restart development/rebuild production for rollback. Simple Mode, unavailable WebGL, and a CMS-hidden TV use the retained `QuoteTV`. The canonical world anchor remains `RESOLVED_WORLD_OBJECTS.DESK`, exported locally as `QUOTE_TV`.

## Verification

Run from repository root:

```
npm run typecheck
npm run build
npm test
node node_modules/vitest/vitest.mjs run --config client/tests/quoteTV.vitest.config.ts
```

- Baseline: typecheck and 61 server tests passed. Repository lint had 8 errors and 157 warnings before this work.
- Added suite: 27 checks pass, covering camera projection at 1440×900, 390×844, 844×390 and 320×568 across three framing FOVs; lossless long/Unicode/newline pagination; clean tap, out-and-back drag, pinch, cancellation and held-pointer rejection; shared player wrapping/power memory; publication filtering; and the existing telescope, mood, secret and collectible assertion suites.
- New quote-TV source files lint cleanly. Repository lint retains the baseline errors. Existing unrelated uncommitted work was preserved.
- Production build and TypeScript checks pass.

## Acceptance still pending

This phase is **implemented, not visually accepted**. This session's computer-use inventory returned no browsers or apps, so no browser or actual-touch results are claimed. Verify before marking Phase 9.6 complete:

- Physical TV click and Explore → Quotes; no duplicate fullscreen TV.
- Real desktop and portrait/landscape framing, font readability, and tactile button feedback. Closely spaced physical knobs have larger non-overlapping hit meshes; use the accessible controls where these remain too small on a particular device.
- Power/next/previous, rapid presses, power during text fade, and Escape during camera/power animation.
- Empty/one/long quotes, unavailable font network, day/night, all moods, low quality and reduced motion.
- Drag and pinch rejection; return to the saved exploration pose and restored mouse/touch orbit, pan and zoom.
- Keyboard/screen-reader announcements, menu Escape priority, navigation to another section, and focus restoration.
- Simple Mode, simulated WebGL loss and a feature-flag-off build through the actual browser UI.
