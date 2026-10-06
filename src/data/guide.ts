export type Block = { h2: string } | { p: string } | { ul: string[] } | { tds: true };
export interface Article {
  slug: string; title: string; description: string;
  group: "Technology" | "Testing & choosing" | "Your space" | "Your area";
  published: boolean; location?: boolean; related: string[]; body: Block[];
}

const planned = (slug: string, title: string, group: Article["group"], description: string, location = false): Article =>
  ({ slug, title, group, description, published: false, location, related: [], body: [] });

export const ARTICLES: Article[] = [
  {
    slug: "uf-vs-nano-vs-ro", title: "UF vs Nano vs RO: which filtration fits your water?", group: "Technology", published: true,
    description: "A plain-language comparison of the three filtration types HIQ installs, and how your water test decides between them.",
    related: ["hw-np-200", "vp-cu-200", "hw-np-100m"],
    body: [
      { p: "Most HIQ systems come in more than one filtration type. The three you'll see most are UF, Nano and RO. They are not better or worse versions of each other. Each one suits a different kind of incoming water, and that's why HIQ asks to see your water quality before recommending one." },
      { h2: "UF (ultrafiltration)" },
      { p: "UF suits water that is already fairly well treated — for example a condo or an office building with its own central treatment system. It keeps the setup simple and does not need a pump." },
      { h2: "Nano" },
      { p: "Nano filtration is finer than UF and can also help where the water is harder. HIQ usually suggests it for water that measures between 151 and 190 ppm TDS." },
      { h2: "RO (reverse osmosis)" },
      { p: "RO gives the deepest purification of the three. HIQ recommends it for lower-quality supplies, deep wells and water that measures above 190 ppm TDS. An RO system uses a pump and releases some wastewater as part of how it works, so it is worth planning where it drains." },
      { h2: "Where UV fits in" },
      { p: "UV is not a separate filter type you choose instead of the others. It is an added ultraviolet stage built into selected models, such as the HWLP UV countertop unit." },
      { h2: "HIQ's usual guideline" },
      { tds: true },
      { p: "This guideline is a starting point. The final choice depends on your measured water quality, which is why HIQ requests a water report or tests your water on a site visit before installation." },
    ],
  },
  {
    slug: "water-testing-tds", title: "Water testing and TDS, explained", group: "Testing & choosing", published: true,
    description: "What TDS means, how it's measured, and how HIQ uses it to choose between UF, Nano and RO.",
    related: ["hw-np-200", "w2-170p"],
    body: [
      { p: "TDS stands for total dissolved solids. It's a single number, measured in parts per million (ppm), that shows how much material is dissolved in your water. A handheld TDS meter gives a reading in a few seconds." },
      { h2: "Why HIQ asks for it" },
      { p: "TDS is the quickest way to narrow down which filtration type suits your supply. It is not a full water analysis, and it doesn't tell you everything about your water. That's why HIQ may also ask for a water-quality report or visit your site." },
      { h2: "How the reading guides the choice" },
      { tds: true },
      { h2: "Some models have a TDS limit" },
      { p: "A few systems are designed for water within a certain range. The HW NP 200, for example, needs inlet water that tests below 190 ppm TDS. If your reading is above that, HIQ will suggest a different system." },
      { h2: "Getting a reading" },
      { ul: ["Share a recent water-quality report from your building administrator, if you have one.", "Book a water test or site visit with HIQ.", "Supply quality can change between buildings on the same street, so a reading from your own tap is the one that counts."] },
    ],
  },
  {
    slug: "condo-water", title: "Filtered water in a condo: what to know", group: "Your space", published: true,
    description: "Choosing a system for a condo unit, from cabinet space to building rules and installation.",
    related: ["hwlp-uv-hq9", "eghw-200", "vp-cu-200"],
    body: [
      { p: "Many condos treat their water centrally, so the supply reaching your unit may already be fairly well treated. That often makes UF a good fit — but your own reading decides it." },
      { h2: "Under the sink or on the counter?" },
      { ul: ["Under-sink systems keep the counter clear but need cabinet space and a dedicated faucet.", "Countertop units such as the HWLP UV or the EGHW-200 sit beside the sink. The EGHW-200 needs no power.", "Bottleless dispensers stand on their own and connect to your water line for hot and cold water."] },
      { h2: "Building rules" },
      { p: "Check with your property manager before any plumbing work. HIQ's service team installs all purchased and rented direct-plumbed, bottleless systems, and can talk you through what the building will need." },
      { h2: "Next step" },
      { p: "Answer six quick questions in Find My System, or book a water test so HIQ can confirm the right filtration for your unit." },
    ],
  },
  {
    slug: "water-in-metro-manila", title: "Water in Metro Manila", group: "Your area", published: true, location: true,
    description: "How to approach filtered water in Metro Manila, where supply varies by building and source.",
    related: ["hw-np-200", "w2-170p", "hw-np-100m"],
    body: [
      { p: "Homes and offices across Metro Manila draw water from different sources and buildings, and many condos add their own treatment. Two units a few streets apart can measure quite differently." },
      { p: "Because of that, HIQ doesn't recommend a filtration type based on your city alone. A TDS reading from your own tap, or a water-quality report from your building, is the starting point." },
      { h2: "How HIQ helps" },
      { ul: ["A water test or site visit before installation.", "A recommendation of UF, Nano or RO based on your reading.", "Installation and ongoing service by HIQ's own team."] },
    ],
  },
  planned("how-filtration-works", "How water filtration works", "Technology", "The stages inside a typical HIQ system, from sediment to the final filter."),
  planned("uv", "What a UV stage does", "Technology", "Where an ultraviolet stage fits in selected HIQ models."),
  planned("carbon", "Carbon filters", "Technology", "What carbon stages are and where they're used."),
  planned("sediment", "Sediment filters", "Technology", "The first stage in many systems, explained."),
  planned("alkaline", "Alkaline filters", "Technology", "Optional alkaline stages on HIQ systems."),
  planned("mineral", "Mineral filters", "Technology", "What mineral stages add to a system."),
  planned("choosing-a-system", "Choosing a system", "Testing & choosing", "Space, people, hot and cold, and your water reading."),
  planned("home-water", "Filtered water at home", "Your space", "Kitchens, family use and whole-house options."),
  planned("office-water", "Filtered water at the office", "Your space", "Dispensers, users and service plans for offices."),
  planned("alabang", "Water in Alabang", "Your area", "Approaching filtered water in Alabang.", true),
  planned("laguna", "Water in Laguna", "Your area", "Approaching filtered water in Laguna.", true),
  planned("cebu", "Water in Cebu", "Your area", "Approaching filtered water in Cebu.", true),
  planned("other-areas", "Water in other areas", "Your area", "Deep wells and provincial supplies.", true),
];
export const getArticle = (slug: string) => ARTICLES.find((a) => a.slug === slug);
