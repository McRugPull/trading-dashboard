import { dayOfYear } from './date'

// Real, sourced trading quotes. Every quote below was gathered from a documented
// source and then independently verified (wording + attribution) against the
// original book / interview / shareholder letter. Provenance for the whole set
// is documented in SOURCES.md at the repo root. Each entry carries its `source`,
// which is shown on the Home "Today's mindset" card.
//
// Note on the Livermore quotes: "Reminiscences of a Stock Operator" (1923) is by
// Edwin Lefèvre, narrated by the character Larry Livingston — a widely-recognized
// portrait of Jesse Livermore. We credit Lefèvre (the author) and note this in
// the source. "How to Trade in Stocks" (1940) is Livermore's own book.

export const QUOTES = [
  {
    text: 'Don’t focus on making money; focus on protecting what you have.',
    author: 'Paul Tudor Jones',
    source: 'Market Wizards: Interviews with Top Traders, Jack D. Schwager (1989)',
  },
  {
    text: 'It never was my thinking that made the big money for me. It always was my sitting. Got that? My sitting tight!',
    author: 'Edwin Lefèvre',
    source: 'Reminiscences of a Stock Operator (1923), Ch. V — the fictionalized Jesse Livermore',
  },
  {
    text: 'Win or lose, everybody gets what they want out of the market. Some people seem to like to lose, so they win by losing money.',
    author: 'Ed Seykota',
    source: 'Market Wizards, Jack D. Schwager (1989) — Ed Seykota interview',
  },
  {
    text: 'I know where I’m getting out before I get in. The position size on a trade is determined by the stop, and the stop is determined on a technical basis.',
    author: 'Bruce Kovner',
    source: 'Market Wizards, Jack D. Schwager (1989) — Bruce Kovner, “The World Trader”',
  },
  {
    text: 'Anything can happen.',
    author: 'Mark Douglas',
    source: 'Trading in the Zone (2000) — the first of his “five fundamental truths”',
  },
  {
    text: 'I have two basic rules about winning in trading as well as in life: 1) If you don’t bet, you can’t win. 2) If you lose all your chips, you can’t bet.',
    author: 'Larry Hite',
    source: 'Market Wizards, Jack D. Schwager (1989) — “Larry Hite: Respecting Risk”',
  },
  {
    text: 'It is not how likely an event is to happen that matters, it is how much is made when it happens. How frequent the profit is irrelevant; it is the magnitude of the outcome that counts.',
    author: 'Nassim Nicholas Taleb',
    source: 'Fooled by Randomness (2001)',
  },
  {
    text: 'When was I able to turn from a loser to a winner? When I was able to separate my ego needs from making money. When I was able to accept being wrong.',
    author: 'Marty Schwartz',
    source: 'Market Wizards, Jack D. Schwager (1989) — Marty Schwartz, “Champion Trader”',
  },
  {
    text: 'The big money is not in the buying and the selling, but in the waiting.',
    author: 'Charlie Munger',
    source: 'Poor Charlie’s Almanack, ed. Peter D. Kaufman (2005)',
  },
  {
    text: 'The elements of good trading are: 1) cutting losses, 2) cutting losses, and 3) cutting losses.',
    author: 'Ed Seykota',
    source: 'Market Wizards, Jack D. Schwager (1989) — Ed Seykota interview',
  },
  {
    text: 'It’s not whether you’re right or wrong that’s important, but how much money you make when you’re right and how much you lose when you’re wrong.',
    author: 'Stanley Druckenmiller (on George Soros)',
    source: 'The New Market Wizards, Jack D. Schwager (1992) — Druckenmiller interview',
  },
  {
    text: 'The market does not beat them. They beat themselves, because though they have brains they cannot sit tight.',
    author: 'Edwin Lefèvre',
    source: 'Reminiscences of a Stock Operator (1923), Ch. V — the fictionalized Jesse Livermore',
  },
  {
    text: 'A good trader watches his capital as carefully as a professional scuba diver watches his air supply.',
    author: 'Dr. Alexander Elder',
    source: 'Trading for a Living (Wiley, 1993)',
  },
  {
    text: 'Undertrade, undertrade, undertrade. Whatever you think your position ought to be, cut it at least in half.',
    author: 'Bruce Kovner',
    source: 'Market Wizards, Jack D. Schwager (1989) — Bruce Kovner, “The World Trader”',
  },
  {
    text: 'When you genuinely accept the risks, you will be at peace with any outcome. When you’re at peace with any outcome, you make yourself available to perceive and act on whatever the market is offering.',
    author: 'Mark Douglas',
    source: 'Trading in the Zone (2000)',
  },
  {
    text: 'Soros taught me that when you have tremendous conviction on a trade, you have to go for the jugular. It takes courage to be a pig.',
    author: 'Stanley Druckenmiller',
    source: 'The New Market Wizards, Jack D. Schwager (1992) — Druckenmiller interview',
  },
  {
    text: 'A loss never bothers me after I take it. I forget it overnight. But being wrong — not taking the loss — that is what does the damage to the pocketbook and to the soul.',
    author: 'Edwin Lefèvre',
    source: 'Reminiscences of a Stock Operator (1923), Ch. X — the fictionalized Jesse Livermore',
  },
  {
    text: 'Risk control is the best route to loss avoidance. Risk avoidance, on the other hand, is likely to lead to return avoidance as well.',
    author: 'Howard Marks',
    source: 'The Most Important Thing (Columbia University Press, 2011)',
  },
  {
    text: 'The whole secret to winning big in the stock market is not to be right all the time, but to lose the least amount possible when you’re wrong.',
    author: 'William J. O’Neil',
    source: 'How to Make Money in Stocks (McGraw-Hill)',
  },
  {
    text: 'If your goal is to trade like a professional and be a consistent winner, you must start from the premise that the solutions are in your mind, not in the market.',
    author: 'Mark Douglas',
    source: 'Trading in the Zone (2000)',
  },
  {
    text: 'I just wait until there is money lying in the corner, and all I have to do is go over there and pick it up. I do nothing in the meantime.',
    author: 'Jim Rogers',
    source: 'Market Wizards, Jack D. Schwager (1989) — Jim Rogers interview',
  },
  {
    text: '95% of the trading errors you are likely to make will stem from your attitudes about being wrong, losing money, missing out, and leaving money on the table.',
    author: 'Mark Douglas',
    source: 'Trading in the Zone (2000) — the four trading fears',
  },
  {
    text: 'No matter how sophisticated our choices, how good we are at dominating the odds, randomness will have the last word.',
    author: 'Nassim Nicholas Taleb',
    source: 'Fooled by Randomness (2001)',
  },
  {
    text: 'The fastest way to take a bath in the stock market is to try to prove that you are right and the market is wrong.',
    author: 'William J. O’Neil',
    source: 'How to Make Money in Stocks (McGraw-Hill, 1988)',
  },
  {
    text: 'Profits always take care of themselves but losses never do.',
    author: 'Jesse Livermore',
    source: 'How to Trade in Stocks (1940), “The Challenge of Speculation”',
  },
  {
    text: 'The way to build long-term returns is through preservation of capital and home runs.',
    author: 'Stanley Druckenmiller',
    source: 'The New Market Wizards, Jack D. Schwager (1992)',
  },
  {
    text: 'The investor’s chief problem — and even his worst enemy — is likely to be himself.',
    author: 'Benjamin Graham',
    source: 'The Intelligent Investor (1949)',
  },
  {
    text: 'It is when we are unaware of what could go wrong that we have to worry.',
    author: 'George Soros',
    source: 'The Alchemy of Finance (1987)',
  },
  {
    text: 'I could give away all my secrets and it wouldn’t make any difference. Most people can’t control their emotions or follow a system.',
    author: 'Linda Bradford Raschke',
    source: 'The New Market Wizards, Jack D. Schwager (1992) — Raschke interview',
  },
  {
    text: 'Heroes are heroes because they are heroic in behavior, not because they won or lost.',
    author: 'Nassim Nicholas Taleb',
    source: 'Fooled by Randomness (2001)',
  },
  {
    text: 'An intelligent businessman takes only risks that will not put him out of business, even if he makes several mistakes in a row.',
    author: 'Dr. Alexander Elder',
    source: 'The New Trading for a Living (Wiley, 2014)',
  },
  {
    text: 'You don’t trade the markets. You trade your beliefs about the markets.',
    author: 'Van K. Tharp',
    source: 'Core “Tharp Think” principle — Trade Your Way to Financial Freedom (McGraw-Hill)',
  },
  {
    text: 'We simply attempt to be fearful when others are greedy and to be greedy only when others are fearful.',
    author: 'Warren Buffett',
    source: 'Berkshire Hathaway Chairman’s Letter, 1986',
  },
  {
    text: 'The desire for constant action irrespective of underlying conditions is responsible for many losses in Wall Street even among the professionals.',
    author: 'Edwin Lefèvre',
    source: 'Reminiscences of a Stock Operator (1923), Ch. II — the fictionalized Jesse Livermore',
  },
  {
    text: 'Losses are simply the cost of doing business — the amount of money I need to spend to make myself available for the winning trades.',
    author: 'Mark Douglas',
    source: 'Trading in the Zone (2000)',
  },
  {
    text: 'Rule number one: most things will prove to be cyclical. Rule number two: some of the greatest opportunities come when other people forget rule number one.',
    author: 'Howard Marks',
    source: 'The Most Important Thing (2011), “Being Attentive to Cycles”',
  },
  {
    text: 'Confronted with a challenge to distill the secret of sound investment into three words, we venture the motto: margin of safety.',
    author: 'Benjamin Graham',
    source: 'The Intelligent Investor (1949), Ch. 20',
  },
  {
    text: 'Markets need a fresh supply of losers just as builders of the ancient pyramids needed a fresh supply of slaves.',
    author: 'Dr. Alexander Elder',
    source: 'Trading for a Living (Wiley, 1993)',
  },
  {
    text: 'I’m not entitled to have an opinion unless I can state the arguments against my position better than the people who are in opposition.',
    author: 'Charlie Munger',
    source: 'USC Law School Commencement Address (2007); Poor Charlie’s Almanack',
  },
  {
    text: 'Try to change who you are and you will fight yourself all the way — and then wonder, amidst the resistance, why you lack discipline.',
    author: 'Dr. Brett Steenbarger',
    source: 'Trading Psychology 2.0 (Wiley, 2015)',
  },
  {
    text: 'Being too far ahead of your time is indistinguishable from being wrong.',
    author: 'Howard Marks',
    source: 'The Most Important Thing Illuminated (2013); Oaktree Capital memos',
  },
]

export function quoteForDay(date = new Date()) {
  const idx = dayOfYear(date) % QUOTES.length
  return QUOTES[idx]
}

// Pick a random quote (used by the "shuffle" button), avoiding an immediate repeat.
export function randomQuote(exclude) {
  if (QUOTES.length <= 1) return QUOTES[0]
  let q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  let guard = 0
  while (exclude && q.text === exclude.text && guard++ < 10) {
    q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  }
  return q
}
