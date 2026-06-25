import { dayOfYear } from './date'

// A larger curated set of trading + mindset + discipline quotes.
// The Home "Today's mindset" card shows one per day (deterministic) and the
// shuffle button picks a random one. Attributions use "Trading proverb" /
// "Unknown" where a reliable source isn't certain, to avoid misattribution.
export const QUOTES = [
  // — Trading psychology & risk —
  { text: 'The goal of a successful trader is to make the best trades. Money is secondary.', author: 'Alexander Elder' },
  { text: 'Amateurs think about how much money they can make. Professionals think about how much money they could lose.', author: 'Jack Schwager' },
  { text: 'It’s not whether you’re right or wrong, but how much money you make when right and how much you lose when wrong.', author: 'George Soros' },
  { text: 'I’m always thinking about losing money as opposed to making money.', author: 'Paul Tudor Jones' },
  { text: 'Don’t focus on making money; focus on protecting what you have.', author: 'Paul Tudor Jones' },
  { text: 'The elements of good trading are: cutting losses, cutting losses, and cutting losses.', author: 'Ed Seykota' },
  { text: 'Risk comes from not knowing what you’re doing.', author: 'Warren Buffett' },
  { text: 'Letting losses run is the most serious mistake made by most investors.', author: 'William O’Neil' },
  { text: 'Never let a winner turn into a loser.', author: 'Trading proverb' },
  { text: 'The market is a device for transferring money from the impatient to the patient.', author: 'Warren Buffett' },
  { text: 'Markets can remain irrational longer than you can remain solvent.', author: 'John Maynard Keynes' },
  { text: 'In trading, the impossible happens about twice a year.', author: 'Marty Schwartz' },
  { text: 'The four most dangerous words in investing are: ‘this time it’s different.’', author: 'Sir John Templeton' },
  { text: 'Be fearful when others are greedy, and greedy when others are fearful.', author: 'Warren Buffett' },
  { text: 'Bulls make money, bears make money, pigs get slaughtered.', author: 'Wall Street adage' },
  { text: 'The trend is your friend until the end when it bends.', author: 'Ed Seykota' },
  { text: 'There is a time to go long, a time to go short, and a time to go fishing.', author: 'Jesse Livermore' },
  { text: 'It was never my thinking that made the big money for me. It was my sitting.', author: 'Jesse Livermore' },
  { text: 'The hard work in trading comes in the preparation. The actual process is effortless.', author: 'Jack Schwager' },
  { text: 'Every trader has strengths and weaknesses. Use your strengths, minimize your weaknesses.', author: 'Steve Cohen' },
  { text: 'The best traders have no ego.', author: 'Tom Baldwin' },
  { text: 'Confidence is not “I will profit on this trade.” Confidence is “I will be fine if I don’t.”', author: 'Yvan Byeajee' },
  { text: 'Trade what you see, not what you think.', author: 'Trading proverb' },
  { text: 'Plan the trade and trade the plan.', author: 'Trading proverb' },
  { text: 'One good trade does not make you a genius; one bad trade does not make you a fool.', author: 'Unknown' },
  { text: 'The market does not reward effort. It rewards correctness and discipline.', author: 'Unknown' },
  { text: 'A good trader controls risk. A great trader controls themselves.', author: 'Unknown' },
  { text: 'Your job is not to predict the market. Your job is to react to it with discipline.', author: 'Trading proverb' },
  { text: 'The goal is consistency, not a single great trade.', author: 'Trading proverb' },
  { text: 'Protect your capital and your confidence — both are finite.', author: 'Unknown' },
  { text: 'Losses are the cost of doing business. Big losses are a choice.', author: 'Unknown' },
  { text: 'You don’t have to trade today. Cash is a position.', author: 'Trading proverb' },
  { text: 'The market will be here tomorrow. Make sure your account is too.', author: 'Unknown' },
  { text: 'Wait for the trade to come to you. Boredom is not a signal.', author: 'Trading proverb' },
  { text: 'Trade your plan when it’s hard, and you’ll have an edge when it’s easy.', author: 'Unknown' },

  // — Discipline, patience & process —
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'Discipline equals freedom.', author: 'Jocko Willink' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'Process over outcome. Execute well and the results follow.', author: 'Trading proverb' },
  { text: 'Patience is a key attribute of a good trader.', author: 'Trading proverb' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'You will never always be motivated. You have to learn to be disciplined.', author: 'Unknown' },
  { text: 'Small disciplines repeated with consistency lead to great achievements.', author: 'John C. Maxwell' },
  { text: 'It’s not the daily increase but daily decrease. Hack away at the unessential.', author: 'Bruce Lee' },
  { text: 'Slow is smooth, and smooth is fast.', author: 'Navy SEAL maxim' },
  { text: 'How you do anything is how you do everything.', author: 'Unknown' },
  { text: 'The successful warrior is the average person, with laser-like focus.', author: 'Bruce Lee' },
  { text: 'Do something today that your future self will thank you for.', author: 'Unknown' },
  { text: 'Don’t count the days, make the days count.', author: 'Muhammad Ali' },

  // — Mindset, resilience & growth —
  { text: 'Whether you think you can, or you think you can’t — you’re right.', author: 'Henry Ford' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Hard work beats talent when talent doesn’t work hard.', author: 'Tim Notke' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'A river cuts through rock not because of its power, but its persistence.', author: 'Jim Watkins' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Confucius' },
  { text: 'You miss 100% of the shots you don’t take.', author: 'Wayne Gretzky' },
  { text: 'What stands in the way becomes the way.', author: 'Marcus Aurelius' },
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'Luck is what happens when preparation meets opportunity.', author: 'Seneca' },
  { text: 'The obstacle is the way.', author: 'Ryan Holiday' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Champions keep playing until they get it right.', author: 'Billie Jean King' },
  { text: 'Pressure is a privilege.', author: 'Billie Jean King' },
  { text: 'It’s not about perfect. It’s about effort.', author: 'Jillian Michaels' },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Don’t wish it were easier. Wish you were better.', author: 'Jim Rohn' },
  { text: 'Comparison is the thief of joy.', author: 'Theodore Roosevelt' },
  { text: 'Either you run the day, or the day runs you.', author: 'Jim Rohn' },
  { text: 'The mind is everything. What you think you become.', author: 'Buddha' },
  { text: 'Knowing yourself is the beginning of all wisdom.', author: 'Aristotle' },
  { text: 'Mastering others is strength. Mastering yourself is true power.', author: 'Lao Tzu' },
]

export function quoteForDay(date = new Date()) {
  const idx = dayOfYear(date) % QUOTES.length
  return QUOTES[idx]
}

// Pick a random quote (used by the "shuffle" button). Optionally avoid repeating
// the one currently shown.
export function randomQuote(exclude) {
  if (QUOTES.length <= 1) return QUOTES[0]
  let q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  let guard = 0
  while (exclude && q.text === exclude.text && guard++ < 10) {
    q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
  }
  return q
}
