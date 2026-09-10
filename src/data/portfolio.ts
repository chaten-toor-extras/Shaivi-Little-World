export const sections = [
  "ABOUT",
  "QUOTES",
  "GALLERY",
  "JOURNEY",
  "CONTACT",
  "MUSIC",
] as const;
export type Section = (typeof sections)[number];
export const labels: Record<Section, string> = {
  ABOUT: "Artist",
  QUOTES: "Read quotes",
  GALLERY: "Open art",
  JOURNEY: "Look through",
  CONTACT: "Post a letter",
  MUSIC: "Play music",
};
export const portfolio = {
  person: {
    name: "Shaivi",
    about:
      "This is a little space for my ideas, experiments, and things I’m learning to make.",
    note: "Your introduction goes here. Add your creative interests, background, and what you’d love to make next.",
  },
  projects: [
    {
      title: "A softer kind of digital",
      category: "Digital experience",
      description:
        "A sample project space. Replace this with the story behind your work, the problem you explored, and what you created.",
      role: "Your role",
      tools: ["Design", "Creative development"],
      color: "#d9b9cd",
    },
    {
      title: "Everyday, reimagined",
      category: "Brand exploration",
      description:
        "A sample identity project. Add your own images, process, and the little details that made it special.",
      role: "Your role",
      tools: ["Art direction", "Visual identity"],
      color: "#dfbe85",
    },
    {
      title: "Small moments, collected",
      category: "Creative experiment",
      description:
        "A place for an experiment you loved making. Tell visitors what sparked it and what you learned.",
      role: "Your role",
      tools: ["Illustration", "Experimentation"],
      color: "#aabdaa",
    },
  ],
  artworks: [
    { title: "Studies in sunlight", year: "Sample artwork", color: "#dc9c73" },
    { title: "Somewhere quiet", year: "Sample artwork", color: "#a8b4a2" },
    { title: "A little daydream", year: "Sample artwork", color: "#b9a1c4" },
  ],
  timeline: [
    {
      title: "Beginning",
      text: "Add the moment your creative curiosity began.",
    },
    {
      title: "Experimenting",
      text: "Add an early experiment or a new interest.",
    },
    {
      title: "Learning",
      text: "Add a course, mentor, or meaningful discovery.",
    },
    {
      title: "Creating",
      text: "Add a project or collaboration you’re proud of.",
    },
    { title: "Now", text: "Share what you are exploring next." },
  ],
  interests: [
    "A song on repeat",
    "A well-loved book",
    "A film to get lost in",
    "Making things by hand",
  ],
  contact: { email: "", socials: [] as { label: string; url: string }[] },
  secret: [
    "Sample fact: my best ideas arrive at inconvenient times.",
    "Sample fact: every notebook deserves another notebook.",
  ],
};
