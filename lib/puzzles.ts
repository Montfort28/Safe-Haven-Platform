// Centralized puzzle questions for all games and levels
export type Puzzle = { question: string; answer: string; hint: string; level: number; category?: string; game?: string };

export const PUZZLES: Puzzle[] = [
    // Easy (level 1)
    { level: 1, game: 'puzzle-game', question: 'What has keys but can’t open locks?', answer: 'PIANO', hint: 'It makes music.' },
    { level: 1, game: 'puzzle-game', question: 'What has hands but can’t clap?', answer: 'CLOCK', hint: 'It tells time.' },
    { level: 1, game: 'puzzle-game', question: 'What can you catch but not throw?', answer: 'COLD', hint: 'It makes you sneeze.' },
    { level: 1, game: 'puzzle-game', question: 'What has a face and two hands but no arms or legs?', answer: 'CLOCK', hint: 'It hangs on the wall.' },
    { level: 1, game: 'puzzle-game', question: 'What gets wetter as it dries?', answer: 'TOWEL', hint: 'You use it after a shower.' },
    { level: 1, game: 'puzzle-game', question: 'What has a neck but no head?', answer: 'BOTTLE', hint: 'You pour from it.' },
    { level: 1, game: 'puzzle-game', question: 'What has hands but can’t clap?', answer: 'CLOCK', hint: 'It tells time.' },
    { level: 1, game: 'puzzle-game', question: 'What has one eye but can’t see?', answer: 'NEEDLE', hint: 'Used in sewing.' },
    // Medium (level 2)
    // Medium (level 2)
    { level: 2, game: 'puzzle-game', question: 'What comes once in a minute, twice in a moment, but never in a thousand years?', answer: 'M', hint: 'It’s a letter.' },
    { level: 2, game: 'puzzle-game', question: 'What can travel around the world while staying in a corner?', answer: 'STAMP', hint: 'It’s on an envelope.' },
    { level: 2, game: 'puzzle-game', question: 'What has a neck but no head?', answer: 'BOTTLE', hint: 'It holds liquid.' },
    { level: 2, game: 'puzzle-game', question: 'What is always in front of you but can’t be seen?', answer: 'FUTURE', hint: 'It’s not the past.' },
    { level: 2, game: 'puzzle-game', question: 'What has cities, but no houses; forests, but no trees; and water, but no fish?', answer: 'MAP', hint: 'It helps you find places.' },
    // Hard (level 3)
    // Hard (level 3)
    { level: 3, game: 'puzzle-game', question: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', answer: 'MAP', hint: 'You use me to find your way.' },
    { level: 3, game: 'puzzle-game', question: 'What disappears as soon as you say its name?', answer: 'SILENCE', hint: 'It’s very quiet.' },
    { level: 3, game: 'puzzle-game', question: 'The more you take, the more you leave behind. What are they?', answer: 'FOOTSTEPS', hint: 'You make them when you walk.' },
    { level: 3, game: 'puzzle-game', question: 'What breaks yet never falls, and what falls yet never breaks?', answer: 'DAY AND NIGHT', hint: 'It happens every 24 hours.' },
    { level: 3, game: 'puzzle-game', question: 'What can fill a room but takes up no space?', answer: 'LIGHT', hint: 'You turn it on in the dark.' },
    // Add positivity-puzzle questions for all levels
    // Positivity Puzzle - Level 1 (Easy)
    {
        game: 'positivity-puzzle',
        level: 1,
        question: 'I am _ and capable.',
        answer: 'STRONG',
        hint: 'S_____',
    },
    {
        game: 'positivity-puzzle',
        level: 1,
        question: 'Today is a _ day.',
        answer: 'GOOD',
        hint: 'G___',
    },
    // Positivity Puzzle - Level 2 (Medium)
    {
        game: 'positivity-puzzle',
        level: 2,
        question: 'I choose to be _ today.',
        answer: 'HAPPY',
        hint: 'H____',
    },
    {
        game: 'positivity-puzzle',
        level: 2,
        question: 'I am grateful for my _.',
        answer: 'LIFE',
        hint: 'L___',
    },
    // Positivity Puzzle - Level 3 (Hard)
    {
        game: 'positivity-puzzle',
        level: 3,
        question: 'I believe in my _ to succeed.',
        answer: 'ABILITY',
        hint: 'A______',
    },
    {
        game: 'positivity-puzzle',
        level: 3,
        question: 'Every challenge is an _ to grow.',
        answer: 'OPPORTUNITY',
        hint: 'O__________',
    },
];
