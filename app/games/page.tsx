'use client';

import { useState, useEffect, useCallback } from 'react';
import { PUZZLES, Puzzle } from '@/lib/puzzles';
import { Heart, Star, Clock, Timer, Trophy, Sparkles, Zap, Target, Gamepad2, Home, BarChart3, Library, BookOpen, User, Play, Pause, RotateCcw, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';

// --- Types ---
type Emotion = {
  id: number;
  emotion: string;
  description: string;
  color: string;
  uniqueId: number;
  matched: boolean;
};

type GameCompleteHandler = (game: string, score: number, duration: number, achievement?: string) => void;

// --- Helper: Record game start ---
const recordGameStart = async (gameId: string) => {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    // Map frontend gameId to backend validGames
    const idMap: Record<string, string> = {
      'puzzle-game': 'puzzle-game',
      'breathing-exercise': 'breathing-exercise',
      'progressive-relaxation': 'progressive-relaxation',
      'mindful-coloring': 'mindful-coloring',
      'memory-garden': 'memory-garden',
      'emotion-regulation': 'emotion-regulation',
      'gratitude-flow': 'gratitude-flow',
      'anxiety-tamer': 'anxiety-tamer',
      'focus-builder': 'focus-builder',
      'stress-sculptor': 'stress-sculptor',
      'mood-mixer': 'mood-mixer',
      'positivity-puzzle': 'emotion-regulation',
      'anxiety-breather': 'breathing-exercise',
      'mindful-memory': 'memory-garden',
      'gratitude-builder': 'gratitude-flow',
    };
    const backendGameId = idMap[gameId] || gameId;
    if (token) {
      // Save the start time globally for duration tracking
      if (typeof window !== 'undefined') {
        (window as any).gameStartTime = Date.now();
      }
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: backendGameId,
          started: true,
          completed: false,
          score: 0,
          duration: 1, // Always send at least 1 second
          timestamp: Date.now(),
        }),
      });
      if (res.status === 400) {
        const data = await res.json();
        if (data && data.error && data.error.includes('Invalid game')) {
          alert('Error: Invalid game. Please contact support.');
          console.error('Invalid game error:', backendGameId);
        }
      }
    }
  } catch (error) {
    console.error('Failed to record game start:', error);
  }
};

// --- New Multi-Level Puzzle Game with many questions per level, persistent progress, and backend sync ---
const PuzzleGame = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [level, setLevel] = useState<number>(1); // 1: Easy, 2: Medium, 3: Hard
  const [questions, setQuestions] = useState<Puzzle[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [showCongratsModal, setShowCongratsModal] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  // Load questions for the current level from the puzzle bank
  useEffect(() => {
    const levelQuestions = PUZZLES.filter(q => q.level === level && q.game === 'puzzle-game');
    setQuestions(levelQuestions.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setUserInput('');
    setShowCongratsModal(false);
    setGameComplete(false);
  }, [level]);

  // Load persistent progress/achievements from backend (if available)
  useEffect(() => {
    // TODO: Optionally fetch user progress for this game from backend
  }, []);

  const handleSubmit = () => {
    if (!questions[currentIndex]) return;
    if (userInput.trim().toUpperCase() === questions[currentIndex].answer) {
      setScore(prev => prev + 50 * level);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setUserInput('');
        setShowCongratsModal(false);
      } else {
        // Level complete
        setCompletedLevels(prev => [...prev, level]);
        setShowCongratsModal(true);
        onGameComplete('puzzle-game', 5, 30 * level);
        if (level < 3) {
          setTimeout(() => {
            setLevel(level + 1);
            setShowCongratsModal(false);
          }, 1200);
        } else {
          // All levels complete
          const achievement = 'Puzzle Master: Beat all levels!';
          setAchievements(prev => prev.includes(achievement) ? prev : [...prev, achievement]);
          setGameComplete(true);
          onGameComplete('puzzle-game', 5, 30 * level, achievement);
        }
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl relative">
      {/* Animated Congrats Modal for Level Completion */}
      {showCongratsModal && !gameComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">Level Complete!</div>
            <div className="text-lg text-purple-700 mb-4">Get ready for the next level!</div>
            <div className="flex justify-center">
              <svg className="h-16 w-16 text-pink-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Puzzle Game (Level {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'})</h3>
        <div className="flex items-center space-x-4">
          {/* Removed Score label as requested */}
        </div>
      </div>
      {questions.length > 0 && !gameComplete && (
        <>
          <div className="mb-4 text-blue-700 bg-blue-50 rounded-lg p-3 text-center font-medium">
            {questions[currentIndex]?.question}
            <br />
            <span className="text-xs text-gray-500">Hint: {questions[currentIndex]?.hint}</span>
          </div>
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              placeholder="Your answer..."
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              disabled={!userInput.trim()}
            >
              Submit
            </button>
          </div>
        </>
      )}
      {gameComplete && (
        <div className="text-center mt-4">
          <div className="text-2xl font-bold text-green-600 mb-2">Congratulations!</div>
          <div className="text-lg text-purple-700">You beat all levels and earned an achievement!</div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="font-bold text-gray-700 mb-2">Achievements</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {achievements.length === 0 && <li>No achievements yet.</li>}
          {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
        </ul>
      </div>
    </div>
  );
};

const AnxietyBreather = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [phase, setPhase] = useState<string>('ready');
  const [cycle, setCycle] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const phases = [
    { name: 'inhale', duration: 4000, instruction: 'Breathe In', color: 'bg-blue-400' },
    { name: 'hold', duration: 4000, instruction: 'Hold', color: 'bg-purple-400' },
    { name: 'exhale', duration: 4000, instruction: 'Breathe Out', color: 'bg-green-400' }
  ];

  const startBreathing = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setCycle(0);
    setScore(0);
    setPhase('inhale');
    setShowInstructions(false);
    recordGameStart('anxiety-breather');
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase < phases.length) {
        setPhase(phases[currentPhase].name);
        setTimeout(() => {
          currentPhase++;
          if (currentPhase >= phases.length) {
            setCycle(prev => {
              const newCycle = prev + 1;
              setScore(newCycle * 10);
              if (newCycle >= 5) {
                clearInterval(interval);
                setGameActive(false);
                setPhase('complete');
                const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
                // Award 5 points for completing the game
                onGameComplete('anxiety-breather', 5, duration);
              }
              return newCycle;
            });
            currentPhase = 0;
          }
        }, phases[currentPhase].duration);
      }
    }, phases.reduce((acc, p) => acc + p.duration, 0));
  };

  const getCurrentPhase = () => phases.find(p => p.name === phase) || phases[0];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Anxiety Breather</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Cycle: {cycle}/5</span>
          {/* Removed Score label as requested */}
        </div>
      </div>
      {showInstructions && (
        <div className="mb-4 text-blue-700 bg-blue-50 rounded-lg p-3 text-center font-medium">
          Follow the breathing pattern: Inhale, Hold, Exhale. Complete 5 cycles to finish. Watch the color and instruction change for each phase.
        </div>
      )}

      <div className="text-center">
        {phase === 'ready' && (
          <div className="py-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-200 to-green-200 flex items-center justify-center">
              <Heart className="h-16 w-16 text-blue-600" />
            </div>
            <p className="text-gray-600 mb-4">Follow the breathing pattern to calm your mind</p>
            <button onClick={startBreathing} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Start Breathing
            </button>
          </div>
        )}

        {gameActive && (
          <div className="py-8">
            <div className={`w-32 h-32 mx-auto mb-4 rounded-full ${getCurrentPhase().color} transition-all duration-1000 flex items-center justify-center animate-pulse`}>
              <span className="text-white font-bold text-lg">{getCurrentPhase().instruction}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">{getCurrentPhase().instruction}</p>
            <p className="text-gray-600">Complete 5 breathing cycles</p>
          </div>
        )}

        {phase === 'complete' && (
          <div className="py-8">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center">
              <Check className="h-16 w-16 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600 mb-2">Well Done!</p>
            <p className="text-gray-600">You've completed your breathing exercise</p>
          </div>
        )}
      </div>

      {gameActive && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(cycle / 5) * 100}%` }}></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">Progress: {cycle}/5 cycles</div>
        </div>
      )}
    </div>
  );
};

const PositivityPuzzle = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [level, setLevel] = useState<number>(1); // 1: Easy, 2: Medium, 3: Hard
  const [currentPuzzle, setCurrentPuzzle] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showCongratsModal, setShowCongratsModal] = useState<boolean>(false);
  const [congratsLevel, setCongratsLevel] = useState<number | null>(null);

  // Load positivity puzzles from central bank
  const puzzles = PUZZLES.filter(q => q.level === level && q.game === 'positivity-puzzle');

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setCurrentPuzzle(0);
    setScore(0);
    setUserInput('');
    setFeedback('');
    setShowInstructions(false);
    recordGameStart('positivity-puzzle');
  };

  const handleSubmit = () => {
    if (!puzzles.length || !puzzles[currentPuzzle]) return;
    const puzzle = puzzles[currentPuzzle];
    if (userInput.toUpperCase() === puzzle.answer) {
      setScore(score + 20 * level);
      setFeedback('Correct! ' + puzzle.hint);
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(currentPuzzle + 1);
          setUserInput('');
          setFeedback('');
        } else {
          // Level complete
          setCongratsLevel(level);
          setShowCongratsModal(true);
          onGameComplete('positivity-puzzle', 5, startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0);
        }
      }, 1500);
    } else {
      setFeedback('Try again! Hint: ' + puzzle.hint);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl relative">
      {/* Animated Congrats Modal */}
      {showCongratsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl shadow-2xl p-10 max-w-md w-full border-4 border-yellow-600 relative animate-bounce-in">
            <button onClick={() => setShowCongratsModal(false)} className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900 text-2xl font-bold">&times;</button>
            <div className="flex flex-col items-center">
              <Sparkles className="h-16 w-16 text-yellow-400 animate-spin mb-4" />
              <h2 className="text-3xl font-extrabold text-yellow-800 mb-2 drop-shadow-lg">Level {congratsLevel} Complete!</h2>
              <p className="text-lg text-orange-900 mb-4 font-semibold">You passed this level! Keep going or return to the game selection.</p>
              <div className="flex gap-4 mt-2">
                {congratsLevel && congratsLevel < 3 && (
                  <button onClick={() => { setShowCongratsModal(false); setLevel(congratsLevel + 1); setCurrentPuzzle(0); setUserInput(''); setFeedback(''); }} className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-yellow-700 transition-all animate-pop">Next Level</button>
                )}
                <button onClick={() => { setShowCongratsModal(false); setGameActive(false); setLevel(1); setCurrentPuzzle(0); setUserInput(''); setFeedback(''); }} className="bg-white text-yellow-700 px-6 py-2 rounded-lg font-bold shadow-lg border border-yellow-400 hover:bg-yellow-100 transition-all animate-pop">Back to Game</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Positivity Puzzle (Level {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'})</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Puzzle: {currentPuzzle + 1}/{puzzles.length}</span>
          {/* Removed Score label as requested */}
        </div>
      </div>
      {showInstructions && (
        <div className="mb-4 text-yellow-700 bg-yellow-50 rounded-lg p-3 text-center font-medium">
          Complete the positive affirmation by filling in the blanks. Use the hint to help you!
        </div>
      )}

      {!gameActive && (
        <div className="text-center py-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-yellow-600" />
          </div>
          <p className="text-gray-600 mb-4">Complete positive affirmations to boost your mood!</p>
          <button onClick={startGame} className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            Start Puzzle
          </button>
        </div>
      )}

      {gameActive && (
        <div className="text-center">
          {(!puzzles.length || !puzzles[currentPuzzle]) ? (
            <div className="mb-6 text-red-600 font-bold">No puzzles available for this level. Please try another game or level.</div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-800 mb-4">{puzzles[currentPuzzle].question}</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full max-w-md mx-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              >
                Submit Answer
              </button>
              {feedback && (
                <div className={`mt-4 p-3 rounded-lg ${feedback.includes('Correct') ? 'bg-green-100 text-green-700' : feedback.includes('Level up!') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {feedback}
                </div>
              )}
            </>
          )}
        </div>
      )}
      <div className="mt-6">
        <h4 className="font-bold text-gray-700 mb-2">Achievements</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {achievements.length === 0 && <li>No achievements yet.</li>}
          {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
        </ul>
      </div>
    </div>
  );
};

const MindfulMemory = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [level, setLevel] = useState<number>(1); // 1: Easy, 2: Medium, 3: Hard
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState<boolean>(false);
  const [currentShowIndex, setCurrentShowIndex] = useState<number>(-1); // NEW: index of sequence being shown
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showCongratsModal, setShowCongratsModal] = useState<boolean>(false);
  const [congratsLevel, setCongratsLevel] = useState<number | null>(null);
  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'];
  const levelSettings: { [key: number]: { length: number; rounds: number } } = {
    1: { length: 3, rounds: 2 },
    2: { length: 5, rounds: 3 },
    3: { length: 7, rounds: 4 },
  };
  const [round, setRound] = useState<number>(1);

  // Show sequence one by one
  useEffect(() => {
    if (showSequence && sequence.length > 0) {
      setCurrentShowIndex(0);
      let i = 0;
      const interval = setInterval(() => {
        setCurrentShowIndex(i);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setTimeout(() => {
            setShowSequence(false);
            setCurrentShowIndex(-1);
          }, 500);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [showSequence, sequence]);

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setLevel(1);
    setScore(0);
    setShowTutorial(false);
    setCompletedLevels([]);
    setAchievements([]);
    setRound(1);
    generateSequence(levelSettings[1].length);
    recordGameStart('mindful-memory');
  };

  const generateSequence = (length: number) => {
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * colors.length));
    setSequence(newSequence);
    setUserSequence([]);
    setShowSequence(true);
    setCurrentShowIndex(-1);
  };

  const handleColorClick = (colorIndex: number) => {
    if (showSequence || !gameActive) return;
    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);
    if (newUserSequence.length === sequence.length) {
      if (JSON.stringify(newUserSequence) === JSON.stringify(sequence)) {
        setScore(score + 10 * level);
        if (round < levelSettings[level].rounds) {
          setRound(round + 1);
          setTimeout(() => generateSequence(levelSettings[level].length), 1000);
        } else {
          setCompletedLevels([...completedLevels, level]);
          setCongratsLevel(level);
          setShowCongratsModal(true);
          onGameComplete('mindful-memory', 5, startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0);
        }
      } else {
        setGameActive(false);
        const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
        onGameComplete('mindful-memory', 0, duration);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl relative">
      {/* Animated Congrats Modal */}
      {showCongratsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-gradient-to-br from-indigo-300 to-purple-400 rounded-3xl shadow-2xl p-10 max-w-md w-full border-4 border-indigo-600 relative animate-bounce-in">
            <button onClick={() => setShowCongratsModal(false)} className="absolute top-2 right-2 text-indigo-700 hover:text-indigo-900 text-2xl font-bold">&times;</button>
            <div className="flex flex-col items-center">
              <Sparkles className="h-16 w-16 text-yellow-400 animate-spin mb-4" />
              <h2 className="text-3xl font-extrabold text-indigo-800 mb-2 drop-shadow-lg">Level {congratsLevel} Complete!</h2>
              <p className="text-lg text-purple-900 mb-4 font-semibold">You passed this level! Keep going or return to the game selection.</p>
              <div className="flex gap-4 mt-2">
                {congratsLevel && congratsLevel < 3 && (
                  <button onClick={() => {
                    setShowCongratsModal(false);
                    setLevel(congratsLevel + 1);
                    setRound(1);
                    setUserSequence([]);
                    setShowSequence(false);
                    setCurrentShowIndex(-1);
                    generateSequence(levelSettings[congratsLevel + 1].length);
                  }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition-all animate-pop">Next Level</button>
                )}
                <button onClick={() => {
                  setShowCongratsModal(false);
                  setGameActive(false);
                  setLevel(1);
                  setRound(1);
                  setUserSequence([]);
                  setShowTutorial(true);
                  setShowSequence(false);
                  setCurrentShowIndex(-1);
                }} className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold shadow-lg border border-indigo-400 hover:bg-indigo-100 transition-all animate-pop">Back to Game</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Mindful Memory (Level {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'})</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Round: {round}/{levelSettings[level].rounds}</span>
          {/* Removed Score label as requested */}
        </div>
      </div>
      {showTutorial && (
        <div className="mb-4 text-indigo-700 bg-indigo-50 rounded-lg p-3 text-center font-medium">
          Watch the color sequence, then repeat it by clicking the colored tiles in the same order. Each level gets harder!
        </div>
      )}
      {!gameActive && (
        <div className="text-center py-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
            <Target className="h-16 w-16 text-indigo-600" />
          </div>
          <p className="text-gray-600 mb-4">Remember the color sequence to train your focus!</p>
          <button onClick={startGame} className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
            Start Memory Game
          </button>
        </div>
      )}
      {gameActive && (
        <div className="text-center">
          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              {showSequence ? 'Watch the sequence...' : 'Repeat the sequence'}
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {colors.map((color, index) => {
                let highlight = false;
                if (showSequence && currentShowIndex !== -1 && sequence[currentShowIndex] === index) {
                  highlight = true;
                }
                return (
                  <div
                    key={index}
                    onClick={() => handleColorClick(index)}
                    className={`
                      w-20 h-20 rounded-lg cursor-pointer transition-all duration-300
                      ${color} hover:scale-105
                      ${highlight ? 'ring-4 ring-white animate-pulse' : ''}
                    `}
                  >
                    <span className="sr-only">{colorNames[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Progress: {userSequence.length}/{sequence.length}
          </div>
          {gameActive && (
            <div className="mb-4 text-purple-700 bg-purple-50 rounded-lg p-3 text-center font-medium">
              {showSequence ? 'Watch the sequence...' : 'Now repeat the sequence by clicking the colors below!'}
            </div>
          )}
        </div>
      )}
      <div className="mt-6">
        <h4 className="font-bold text-gray-700 mb-2">Achievements</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {achievements.length === 0 && <li>No achievements yet.</li>}
          {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
        </ul>
      </div>
    </div>
  );
};

const GratitudeBuilder = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [level, setLevel] = useState<number>(1); // 1: Easy, 2: Medium, 3: Hard
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showCongratsModal, setShowCongratsModal] = useState<boolean>(false);
  const [congratsLevel, setCongratsLevel] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Level settings from central bank (for demo, use as prompts)
  const levelSettings: { [key: number]: { count: number } } = {
    1: { count: 3 },
    2: { count: 5 },
    3: { count: 7 },
  };
  // Optionally, you could use PUZZLES for prompts

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setLevel(1);
    setGratitudeItems([]);
    setScore(0);
    setCurrentInput('');
    setCompletedLevels([]);
    setAchievements([]);
    recordGameStart('gratitude-builder');
  };

  const addGratitude = async () => {
    const wordCount = currentInput.trim().split(/\s+/).length;
    setError('');
    let errorMsg = '';
    if (level === 1) {
      if (!currentInput.trim()) {
        errorMsg = 'Please enter something you are grateful for.';
      }
    } else if (level === 2) {
      if (wordCount < 20) {
        errorMsg = 'Please write at least 20 words explaining what and why you are grateful.';
      }
    } else if (level === 3) {
      if (wordCount < 40) {
        errorMsg = 'Please write at least 40 words for a deeper reflection.';
      }
    }
    if (errorMsg) {
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setGratitudeItems([...gratitudeItems, currentInput.trim()]);
    setScore(score + 15 * level);
    setCurrentInput('');
    try {
      const { logMindGardenActivity } = await import('@/lib/utils');
      await logMindGardenActivity('journal', 15 * level);
    } catch (err) {
      console.error('Failed to log gratitude activity:', err);
    }
    if (gratitudeItems.length + 1 >= levelSettings[level].count) {
      onGameComplete('gratitude-builder', 5, startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0);
      setCongratsLevel(level);
      setShowCongratsModal(true);
      if (level < 3) {
        setCompletedLevels([...completedLevels, level]);
      } else {
        setCompletedLevels([...completedLevels, level]);
        const achievement = 'Gratitude Guru: Beat all levels!';
        setAchievements((prev) => [...prev, achievement]);
        setGameActive(false);
        const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
        onGameComplete('gratitude-builder', 5, duration, achievement);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl relative">
      {/* Animated Congrats Modal */}
      {showCongratsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-gradient-to-br from-green-300 to-emerald-400 rounded-3xl shadow-2xl p-10 max-w-md w-full border-4 border-green-600 relative animate-bounce-in">
            <button onClick={() => setShowCongratsModal(false)} className="absolute top-2 right-2 text-green-700 hover:text-green-900 text-2xl font-bold">&times;</button>
            <div className="flex flex-col items-center">
              <Sparkles className="h-16 w-16 text-yellow-400 animate-spin mb-4" />
              <h2 className="text-3xl font-extrabold text-green-800 mb-2 drop-shadow-lg">Level {congratsLevel} Complete!</h2>
              <p className="text-lg text-emerald-900 mb-4 font-semibold">You passed this level! Keep going or return to the game selection.</p>
              <div className="flex gap-4 mt-2">
                {congratsLevel && congratsLevel < 3 && (
                  <button onClick={() => { setShowCongratsModal(false); setLevel(congratsLevel + 1); setGratitudeItems([]); }} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-all animate-pop">Next Level</button>
                )}
                <button onClick={() => { setShowCongratsModal(false); setGameActive(false); }} className="bg-white text-green-700 px-6 py-2 rounded-lg font-bold shadow-lg border border-green-400 hover:bg-green-100 transition-all animate-pop">Back to Game</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ...existing code... */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Gratitude Builder (Level {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'})</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Items: {gratitudeItems.length}/{levelSettings[level].count}</span>
          {/* Removed Score label as requested */}
        </div>
      </div>
      {!gameActive && (
        <div className="text-center py-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
            <Heart className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">
            {level === 1 && 'List things you are grateful for.'}
            {level === 2 && 'Write a short paragraph (at least 20 words) about what and why you are grateful.'}
            {level === 3 && 'Write a longer reflection (at least 40 words) about gratitude, with deeper thought.'}
          </p>
          <button onClick={startGame} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
            Start Gratitude List
          </button>
        </div>
      )}
      {gameActive && (
        <div>
          <div className="mb-6">
            {level === 1 ? (
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="I'm grateful for..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
              />
            ) : (
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={level === 2 ? 'Write a short paragraph about what and why you are grateful...' : 'Write a longer reflection about gratitude...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px]"
              />
            )}
            <button
              onClick={addGratitude}
              disabled={!currentInput.trim()}
              className="mt-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Add to List
            </button>
            {error && <div className="mt-2 text-red-600 text-sm animate-fade-in">{error}</div>}
          </div>
          <div className="space-y-2">
            {gratitudeItems.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-green-200 flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="font-bold text-gray-700 mb-2">Achievements</h4>
        <ul className="list-disc list-inside text-sm text-gray-600">
          {achievements.length === 0 && <li>No achievements yet.</li>}
          {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
        </ul>
      </div>
    </div>
  );
};
// --- Achievements Modal ---
import React from 'react';
const AchievementsModal = ({ achievements, onClose }: { achievements: string[]; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Your Achievements</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        {(!achievements || !Array.isArray(achievements) || achievements.length === 0) && <li>No achievements yet.</li>}
        {Array.isArray(achievements) && achievements.map((ach, i) => <li key={i}>{ach}</li>)}
      </ul>
    </div>
  </div>
);

// Main Games Component
export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  // Persistent stats from backend
  const [userStats, setUserStats] = useState<any>({ gamesPlayed: 0, totalTime: 0, totalPoints: 0, streak: 0 });
  // Fetch persistent stats from backend
  const fetchGameStats = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (token) {
        const res = await fetch('/api/games/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            // If backend returns an array, pick the first with nonzero stats, else fallback to first
            let stats = Array.isArray(data.data)
              ? data.data.find((s: any) => (s.gamesPlayed || s.totalTime || s.totalPoints || s.streak)) || data.data[0]
              : data.data;
            setUserStats({
              gamesPlayed: stats.gamesPlayed || 0,
              totalTime: stats.totalTime || 0,
              totalPoints: stats.totalPoints || 0,
              streak: stats.streak || 0,
            });
          }
        }
      }
    } catch (e) {
      setUserStats({ gamesPlayed: 0, totalTime: 0, totalPoints: 0, streak: 0 });
    }
  };

  useEffect(() => {
    fetchGameStats();
  }, []);
  const [showStats, setShowStats] = useState<boolean>(false);

  const games = [
    {
      id: 'puzzle-game',
      name: 'Puzzle Game',
      description: 'Solve awesome puzzles with increasing difficulty and unlock achievements!',
      icon: Trophy,
      color: 'from-pink-400 to-purple-400',
      component: PuzzleGame
    },
    {
      id: 'breathing-exercise',
      name: 'Anxiety Breather',
      description: 'Practice breathing exercises to calm anxiety and reduce stress',
      icon: Sparkles,
      color: 'from-blue-400 to-cyan-400',
      component: AnxietyBreather
    },
    {
      id: 'emotion-regulation',
      name: 'Positivity Puzzle',
      description: 'Complete positive affirmations to rewire your thinking patterns',
      icon: Zap,
      color: 'from-yellow-400 to-orange-400',
      component: PositivityPuzzle
    },
    {
      id: 'memory-garden',
      name: 'Mindful Memory',
      description: 'Train your focus and mindfulness through memory challenges',
      icon: Target,
      color: 'from-indigo-400 to-purple-400',
      component: MindfulMemory
    },
    {
      id: 'gratitude-flow',
      name: 'Gratitude Builder',
      description: 'Build a daily gratitude practice to improve your overall wellbeing',
      icon: Star,
      color: 'from-green-400 to-emerald-400',
      component: GratitudeBuilder
    }
  ];

  // Remove achievements logic, only use totalPoints

  const handleGameComplete = useCallback(async (gameId: string, score: number, duration: number, achievement?: string) => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      // Map frontend gameId to backend validGames
      const idMap: Record<string, string> = {
        'puzzle-game': 'puzzle-game',
        'breathing-exercise': 'breathing-exercise',
        'progressive-relaxation': 'progressive-relaxation',
        'mindful-coloring': 'mindful-coloring',
        'memory-garden': 'memory-garden',
        'emotion-regulation': 'emotion-regulation',
        'gratitude-flow': 'gratitude-flow',
        'anxiety-tamer': 'anxiety-tamer',
        'focus-builder': 'focus-builder',
        'stress-sculptor': 'stress-sculptor',
        'mood-mixer': 'mood-mixer',
        'positivity-puzzle': 'emotion-regulation',
        'anxiety-breather': 'breathing-exercise',
        'mindful-memory': 'memory-garden',
        'gratitude-builder': 'gratitude-flow',
      };
      const backendGameId = idMap[gameId] || gameId;
      // Only increment gamesPlayed when the user completes the final level of a game (not per level)
      // This is determined by the presence of an achievement (which only happens on final level)
      let realDuration = duration;
      if (!realDuration && typeof window !== 'undefined' && (window as any).gameStartTime) {
        realDuration = Math.max(1, Math.floor((Date.now() - (window as any).gameStartTime) / 1000));
      }
      if (token) {
        // Only send completed=true and increment gamesPlayed if achievement is present (final level)
        const isFinalLevel = !!achievement;
        const res = await fetch('/api/games/play', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gameId: backendGameId,
            duration: realDuration || 1,
            score: score || 0,
            completed: isFinalLevel,
            timestamp: Date.now(),
            achievement: achievement || undefined,
          }),
        });
        if (res.status === 400) {
          const data = await res.json();
          if (data && data.error && data.error.includes('Invalid game')) {
            alert('Error: Invalid game. Please contact support.');
            console.error('Invalid game error:', backendGameId);
          }
        }
        // After saving, fetch persistent stats again
        await fetchGameStats();
      }
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }, []);

  const GameComponent = currentGame ? games.find(g => g.id === currentGame)?.component : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
      <EmergencySupport />
      <Navbar />
      <div className="w-full px-2 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-6 mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-700 mb-4 drop-shadow-lg">
            Therapeutic Games
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Engage in fun, therapeutic games designed to boost your mood, reduce anxiety, and build positive mental habits
          </p>
        </div>

        {/* Enhanced Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-200 to-blue-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <Trophy className="h-10 w-10 text-yellow-500 mb-2" />
            <div className="text-3xl font-extrabold text-blue-900">{userStats.gamesPlayed}</div>
            <div className="text-base text-blue-700 font-medium mt-1">Games Played</div>
          </div>
          <div className="bg-gradient-to-br from-pink-200 to-pink-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <Star className="h-10 w-10 text-pink-500 mb-2" />
            <div className="text-3xl font-extrabold text-pink-900">{userStats.streak || 0}</div>
            <div className="text-base text-pink-700 font-medium mt-1">Streak</div>
          </div>
          <div className="bg-gradient-to-br from-green-200 to-green-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <Clock className="h-10 w-10 text-green-500 mb-2" />
            <div className="text-3xl font-extrabold text-green-900">{
              (() => {
                const totalSeconds = userStats.totalTime || 0;
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                return `${hours}h ${minutes}m`;
              })()
            }</div>
            <div className="text-base text-green-700 font-medium mt-1">Time Played</div>
          </div>
          <div className="bg-gradient-to-br from-purple-200 to-purple-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <User className="h-10 w-10 text-purple-500 mb-2" />
            <div className="text-3xl font-extrabold text-purple-900">{userStats.totalPoints}</div>
            <div className="text-base text-purple-700 font-medium mt-1">Total Points</div>
          </div>
        </div>

        {/* Game Selection or Current Game */}
        {!currentGame ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => {
              const IconComponent = game.icon;
              return (
                <div
                  key={game.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                  onClick={() => setCurrentGame(game.id)}
                >
                  <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                    <IconComponent className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h3>
                    <p className="text-gray-600 mb-4">{game.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tap to play</span>
                      <Play className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {games.find(g => g.id === currentGame)?.name}
                  </h2>
                  <button
                    onClick={() => setCurrentGame(null)}
                    className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    ← Back to Games
                  </button>
                </div>
              </div>

              <div className="p-6">
                {GameComponent && (
                  <GameComponent onGameComplete={handleGameComplete} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Motivational Messages */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">You're Not Alone</h3>
            <p className="text-lg opacity-90">
              Every game you play is a step toward better mental health. You're doing great! 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}