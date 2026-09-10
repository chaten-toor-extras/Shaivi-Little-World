# Shaivi’s Little World

A procedural 3D island with six immersive experiences, built with Next.js, React Three Fiber, Drei, GSAP and Zustand. Static export; no backend or API keys.

## Run and check

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

Production files are exported to `out/`.

## Experiences

- Art: 12 draggable, stacking prints, keyboard-accessible index, full-screen viewer, arrow and swipe navigation. Print positions survive closing the viewer.
- Quotes: analog television, original demo quotes, channel controls and power switch.
- Contact: validated letter form with a folding animation. Demo only: nothing is sent or saved.
- Music: seven imaginary tracks, six moods, progress and volume controls. Visual playback only; no music is streamed.
- Artist: editorial biography with a clearly labeled stock portrait.
- Journey: selectable constellation milestones.

Escape returns to the island; inside an artwork it first returns to the desk. Dialogs manage focus and background scroll. The simple portfolio works without WebGL. Reduced motion follows the OS and can be toggled. Island ambience is opt-in and separate from the visual music player.

## Replace demo content

Edit `src/data/artist.ts`, `artworks.ts`, `quotes.ts`, `songs.ts`, `timeline.ts`, and `contact.ts`. Reference photographs and credits live in `images.json`; the stock portrait is in `artist.ts`. Replace these with authorized artwork and a real portrait before presenting them as Shaivi’s work. `portfolio.ts` contains navigation labels and the butterfly secret.

World geometry lives in `src/components/world`; camera poses and travel live in `src/components/experience/CameraRig.tsx`. Individual section components live in `src/components/ui`. `src/app/immersive.css` contains the themed, responsive experiences.

## Performance

Bounded DPR, selectable quality, instanced flowers, lightweight procedural geometry, and one shadow-casting light. Drag updates use refs and CSS translation without React renders per pointer move. Physical-device frame-rate profiling remains recommended before a public launch.
