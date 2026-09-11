export const quotes = [
  "Some ideas arrive loudly. The good ones usually stay quietly.",
  "Maybe creating is just paying attention for a little longer.",
  "I like things that feel unfinished enough to still breathe.",
  "Not every thought needs to become something. But some deserve a page.",
  "The smallest details somehow become the whole memory.",
  "Some days are for making. Some are for noticing.",
  "Art feels better when it leaves a little room for interpretation.",
  "Maybe the best ideas are the ones that don’t try too hard.",
].map((text, i) => ({
  id: `quote-${i + 1}`,
  text,
  category: ["On noticing", "Small beginnings", "From the notebook"][i % 3],
}));
