# Quote Sources

The "Today's mindset" quotes in this app are **not** generic internet "trading proverbs." Each was gathered from a documented source and then **independently verified** (wording + attribution) against the original book, interview, or shareholder letter. Candidates that turned out to be apocryphal or misattributed were discarded.

The canonical list with per-quote sources lives in [`src/lib/quotes.js`](src/lib/quotes.js); each quote also shows its source on the Home card.

## Primary sources

| Source | Author / Editor | Used for |
|---|---|---|
| **Market Wizards: Interviews with Top Traders** (1989) | Jack D. Schwager | Paul Tudor Jones, Ed Seykota, Bruce Kovner, Marty Schwartz, Larry Hite, Jim Rogers |
| **The New Market Wizards** (1992) | Jack D. Schwager | Stanley Druckenmiller, Linda Bradford Raschke |
| **Reminiscences of a Stock Operator** (1923) | Edwin Lefèvre | The "Larry Livingston" narrator — a portrait of Jesse Livermore |
| **How to Trade in Stocks** (1940) | Jesse Livermore | Livermore's own book |
| **Trading in the Zone** (2000) | Mark Douglas | Trading psychology / the "five fundamental truths" |
| **Trading for a Living** (1993) / **The New Trading for a Living** (2014) | Dr. Alexander Elder | Risk & capital preservation |
| **The Most Important Thing** (2011) / *Illuminated* (2013) | Howard Marks | Risk control, cycles |
| **The Intelligent Investor** (1949) | Benjamin Graham | "Margin of safety," investor psychology |
| **Poor Charlie's Almanack** (2005) / USC Law Commencement (2007) | Charlie Munger | Patience, intellectual honesty |
| **Fooled by Randomness** (2001) | Nassim Nicholas Taleb | Asymmetry, randomness |
| **The Alchemy of Finance** (1987) | George Soros | Reflexivity, risk awareness |
| **Berkshire Hathaway Chairman's Letter, 1986** | Warren Buffett | "Fearful when others are greedy…" |
| **How to Make Money in Stocks** | William J. O'Neil | Cutting losses |
| **Trade Your Way to Financial Freedom** | Van K. Tharp | "Trade your beliefs" |
| **Trading Psychology 2.0** (2015) | Dr. Brett Steenbarger | Discipline / self |

## Methodology

The set was assembled by a multi-agent research pass:

1. **Gather** — eight researchers, one per source cluster above, pulled candidate quotes *with* a claimed source (64 candidates).
2. **Verify** — each candidate was independently web-checked for accurate wording and correct attribution; 59 of 64 survived (the rest were apocryphal/misattributed and dropped).
3. **Curate** — the strongest 41 were selected for variety across risk, psychology, discipline, patience, conviction, and losing well.

## Notes on attribution

- *Reminiscences of a Stock Operator* is a **fictionalized** account written by journalist Edwin Lefèvre; its narrator "Larry Livingston" is universally read as Jesse Livermore. Those quotes are credited to **Lefèvre** (the actual author) with the Livermore connection noted in the source line. The separate *How to Trade in Stocks* (1940) is Livermore's own book and is credited to him directly.
- Where a quote is lightly condensed for the card (e.g., trimming a clause), the meaning and wording are preserved; the full source is always shown.
