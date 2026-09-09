# Shaivi’s Little World

An explorable, procedural 3D portfolio built with Next.js, React, Three.js / React Three Fiber, Drei, GSAP and Zustand. No model files, backend, or API keys are required.

## Run

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

The production website is exported to `out/` for static hosting. Serve `out/` with any static HTTP server.

## Personalize

Edit `src/data/portfolio.ts` for all biography, projects, gallery, journey, interests, contact and secret content. The initial content is explicitly illustrative and does not claim real achievements. An empty contact email deliberately leaves the email action inactive. Set an actual email to activate mailto and copy actions. Add social URLs in the same file.

World objects live in `src/components/world`. Camera poses and transition behavior live in `src/components/experience/CameraRig.tsx`. The monitor uses a spatial DOM surface; other destination content is framed in a responsive paper panel. The desktop can be replaced by a model while keeping its interaction wrapper and HTML screen.

## Controls and accessibility

Tap objects or their labels, or use Explore for keyboard navigation. Drag gently to orbit. Escape and Back return to the island. The gallery supports swipe and arrow keys. Sound is opt-in and generated with Web Audio. Detail controls cap DPR and shadow quality. Reduced motion follows the OS preference and can be toggled in the UI. The simple version exposes all content without WebGL; initialization failures and context loss also lead to HTML content.

## Performance

Low-poly procedural geometry, instanced flowers, one shadow-casting light, bounded DPR, mobile defaults and no post-processing. Frame rate on physical mobile devices still needs profiling before a public launch. Google Fonts are optional and fall back to local system fonts.
