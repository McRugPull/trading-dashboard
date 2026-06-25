import { dayOfYear } from './date'

// Trading-mindset quotes. The Home page rotates one per day deterministically.
export const QUOTES = [
  { text: 'The goal of a successful trader is to make the best trades. Money is secondary.', author: 'Alexander Elder' },
  { text: 'Plan the trade and trade the plan.', author: 'Trading proverb' },
  { text: 'It’s not whether you’re right or wrong, but how much money you make when right and how much you lose when wrong.', author: 'George Soros' },
  { text: 'The market is a device for transferring money from the impatient to the patient.', author: 'Warren Buffett' },
  { text: 'Amateurs think about how much money they can make. Professionals think about how much money they could lose.', author: 'Jack Schwager' },
  { text: 'Risk comes from not knowing what you’re doing.', author: 'Warren Buffett' },
  { text: 'In trading, the impossible happens about twice a year.', author: 'Marty Schwartz' },
  { text: 'Don’t focus on making money; focus on protecting what you have.', author: 'Paul Tudor Jones' },
  { text: 'The four most dangerous words in investing are: ‘this time it’s different.’', author: 'Sir John Templeton' },
  { text: 'Letting losses run is the most serious mistake made by most investors.', author: 'William O’Neil' },
  { text: 'Every trader has strengths and weaknesses. Use your strengths, minimize your weaknesses.', author: 'Steve Cohen' },
  { text: 'I’m always thinking about losing money as opposed to making money.', author: 'Paul Tudor Jones' },
  { text: 'The elements of good trading are: cutting losses, cutting losses, and cutting losses.', author: 'Ed Seykota' },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'You don’t need to be a genius to be a great trader. You need discipline.', author: 'Trading proverb' },
  { text: 'A good trader controls risk. A great trader controls themselves.', author: 'Unknown' },
  { text: 'The hard work in trading comes in the preparation. The actual process is effortless.', author: 'Jack Schwager' },
  { text: 'Markets can remain irrational longer than you can remain solvent.', author: 'John Maynard Keynes' },
  { text: 'Be fearful when others are greedy, and greedy when others are fearful.', author: 'Warren Buffett' },
  { text: 'Trade what you see, not what you think.', author: 'Trading proverb' },
  { text: 'The trend is your friend until the end when it bends.', author: 'Ed Seykota' },
  { text: 'Patience is a key attribute of a good trader.', author: 'Trading proverb' },
  { text: 'One good trade does not make you a genius; one bad trade does not make you a fool.', author: 'Unknown' },
  { text: 'Never let a winner turn into a loser.', author: 'Trading proverb' },
  { text: 'Bulls make money, bears make money, pigs get slaughtered.', author: 'Wall Street adage' },
  { text: 'The best traders have no ego.', author: 'Tom Baldwin' },
  { text: 'Confidence is not “I will profit on this trade.” Confidence is “I will be fine if I don’t.”', author: 'Yvan Byeajee' },
  { text: 'Process over outcome. Execute well and the results follow.', author: 'Trading proverb' },
  { text: 'There is a time to go long, a time to go short, and a time to go fishing.', author: 'Jesse Livermore' },
  { text: 'The market does not reward effort. It rewards correctness and discipline.', author: 'Unknown' },
]

export function quoteForDay(date = new Date()) {
  const idx = dayOfYear(date) % QUOTES.length
  return QUOTES[idx]
}
