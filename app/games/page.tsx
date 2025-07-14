'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Star, Clock, Timer, Trophy, Sparkles, Zap, Target, Gamepad2, Home, BarChart3, Library, BookOpen, User, Play, Pause, RotateCcw, Check, X } from 'lucide-react';
import Navbar from '@/components/Navbar';

// --- Types ---
type Emotion = {
  id: number;
  emotion: string;
  description: string;
  color: string;
  uniqueId: number;
  matched: boolean;
};

type GameCompleteHandler = (game: string, score: number, duration: number) => void;

// --- Helper: Record game start ---
const recordGameStart = async (gameId: string) => {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    if (token) {
      await fetch('/api/games/play', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          started: true,
          timestamp: Date.now()
        }),
      });
    }
  } catch (error) {
    console.error('Failed to record game start:', error);
  }
};

// --- Game Components ---
const MoodMatcher = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const emotionPairs = [
    { id: 1, emotion: '😊', description: 'Joy', color: 'bg-yellow-200' },
    { id: 2, emotion: '😌', description: 'Calm', color: 'bg-blue-200' },
    { id: 3, emotion: '🤗', description: 'Loved', color: 'bg-pink-200' },
    { id: 4, emotion: '💪', description: 'Strong', color: 'bg-green-200' },
    { id: 5, emotion: '🌟', description: 'Proud', color: 'bg-purple-200' },
    { id: 6, emotion: '🌈', description: 'Hopeful', color: 'bg-indigo-200' }
  ];

  const startGame = () => {
    const shuffled = [...emotionPairs, ...emotionPairs].sort(() => Math.random() - 0.5);
    setEmotions(shuffled.map((item, index) => ({ ...item, uniqueId: index, matched: false })));
    setGameActive(true);
    setTimeLeft(60);
    setScore(0);
    setMatchedPairs([]);
    setSelectedEmotion(null);
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
      onGameComplete('mood-matcher', score, 60);
    }
  }, [gameActive, timeLeft, score, onGameComplete]);

  const handleEmotionClick = (emotion: Emotion) => {
    if (!gameActive || emotion.matched) return;

    if (!selectedEmotion) {
      setSelectedEmotion(emotion);
    } else if (selectedEmotion.id === emotion.id && selectedEmotion.uniqueId !== emotion.uniqueId) {
      setMatchedPairs([...matchedPairs, emotion.id]);
      setEmotions(prev => prev.map(e =>
        e.id === emotion.id ? { ...e, matched: true } : e
      ));
      setScore(score + 10);
      setSelectedEmotion(null);

      if (matchedPairs.length === emotionPairs.length - 1) {
        setGameActive(false);
        onGameComplete('mood-matcher', score + 10, 60 - timeLeft);
      }
    } else {
      setSelectedEmotion(null);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Mood Matcher</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Score: {score}</span>
          <span className="text-sm text-gray-600">Time: {timeLeft}s</span>
        </div>
      </div>
      <div className="mb-4 text-blue-700 bg-blue-50 rounded-lg p-3 text-center font-medium">
        Match pairs of positive emotions by clicking two matching cards. Try to match all pairs before time runs out!
      </div>

      {!gameActive && emotions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Match positive emotions to boost your mood!</p>
          <button onClick={startGame} className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Start Game
          </button>
        </div>
      )}

      {emotions.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {emotions.map((emotion) => (
            <div
              key={emotion.uniqueId}
              onClick={() => handleEmotionClick(emotion)}
              className={`
                p-4 rounded-lg cursor-pointer transition-all duration-300 text-center
                ${emotion.matched ? 'bg-green-200 opacity-50' : emotion.color}
                ${selectedEmotion?.uniqueId === emotion.uniqueId ? 'ring-4 ring-pink-400' : ''}
                hover:scale-105
              `}
            >
              <div className="text-2xl mb-2">{emotion.emotion}</div>
              <div className="text-sm font-semibold text-gray-700">{emotion.description}</div>
            </div>
          ))}
        </div>
      )}
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
    { name: 'exhale', duration: 6000, instruction: 'Breathe Out', color: 'bg-green-400' }
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
                onGameComplete('anxiety-breather', newCycle * 10, duration);
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
          <span className="text-sm text-gray-600">Score: {score}</span>
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
  const [currentPuzzle, setCurrentPuzzle] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(true);

  const puzzles = [
    { phrase: "You are _ _ _ _ _ _ _", answer: "AMAZING", hint: "You are incredible!" },
    { phrase: "Tomorrow will be _ _ _ _ _ _", answer: "BETTER", hint: "Hope for the future" },
    { phrase: "You _ _ _ _ _ _", answer: "MATTER", hint: "Your existence is important" },
    { phrase: "Stay _ _ _ _ _ _", answer: "STRONG", hint: "Keep your inner power" },
    { phrase: "You are _ _ _ _ _", answer: "LOVED", hint: "People care about you" }
  ];

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
    const puzzle = puzzles[currentPuzzle];
    if (userInput.toUpperCase() === puzzle.answer) {
      setScore(score + 20);
      setFeedback('Correct! ' + puzzle.hint);
      setTimeout(() => {
        if (currentPuzzle < puzzles.length - 1) {
          setCurrentPuzzle(currentPuzzle + 1);
          setUserInput('');
          setFeedback('');
        } else {
          setGameActive(false);
          const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
          onGameComplete('positivity-puzzle', score + 20, duration);
        }
      }, 2000);
    } else {
      setFeedback('Try again! Hint: ' + puzzle.hint);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Positivity Puzzle</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Puzzle: {currentPuzzle + 1}/5</span>
          <span className="text-sm text-gray-600">Score: {score}</span>
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
          <div className="mb-6">
            <p className="text-2xl font-bold text-gray-800 mb-4">{puzzles[currentPuzzle].phrase}</p>
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
            <div className={`mt-4 p-3 rounded-lg ${feedback.includes('Correct') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MindfulMemory = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState<boolean>(false);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);

  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'];

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setLevel(1);
    setScore(0);
    setShowTutorial(false);
    recordGameStart('mindful-memory');
    generateSequence(1);
  };

  const generateSequence = (length: number) => {
    const newSequence = Array.from({ length }, () => Math.floor(Math.random() * colors.length));
    setSequence(newSequence);
    setUserSequence([]);
    setShowSequence(true);

    setTimeout(() => {
      setShowSequence(false);
    }, length * 1000 + 1000);
  };

  const handleColorClick = (colorIndex: number) => {
    if (showSequence || !gameActive) return;

    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    if (newUserSequence.length === sequence.length) {
      if (JSON.stringify(newUserSequence) === JSON.stringify(sequence)) {
        setScore(score + level * 10);
        setLevel(level + 1);
        if (level >= 5) {
          setGameActive(false);
          const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
          onGameComplete('mindful-memory', score + level * 10, duration);
        } else {
          setTimeout(() => generateSequence(level + 1), 1000);
        }
      } else {
        setGameActive(false);
        const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
        onGameComplete('mindful-memory', score, duration);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Mindful Memory</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Level: {level}</span>
          <span className="text-sm text-gray-600">Score: {score}</span>
        </div>
      </div>
      {showTutorial && (
        <div className="mb-4 text-indigo-700 bg-indigo-50 rounded-lg p-3 text-center font-medium">
          Watch the color sequence, then repeat it by clicking the colored tiles in the same order. The first level is just one color to help you learn!
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
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => handleColorClick(index)}
                  className={`
                    w-20 h-20 rounded-lg cursor-pointer transition-all duration-300
                    ${color} hover:scale-105
                    ${showSequence && sequence.includes(index) ? 'ring-4 ring-white animate-pulse' : ''}
                  `}
                >
                  <span className="sr-only">{colorNames[index]}</span>
                </div>
              ))}
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
    </div>
  );
};

const GratitudeBuilder = ({ onGameComplete }: { onGameComplete: GameCompleteHandler }) => {
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startGame = () => {
    setGameActive(true);
    setStartTime(Date.now());
    setGratitudeItems([]);
    setScore(0);
    setCurrentInput('');
    recordGameStart('gratitude-builder');
  };

  const addGratitude = () => {
    if (currentInput.trim()) {
      setGratitudeItems([...gratitudeItems, currentInput.trim()]);
      setScore(score + 15);
      setCurrentInput('');

      if (gratitudeItems.length >= 4) {
        setGameActive(false);
        const duration = startTime !== null ? Math.floor((Date.now() - startTime) / 1000) : 0;
        onGameComplete('gratitude-builder', score + 15, duration);
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Gratitude Builder</h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Items: {gratitudeItems.length}/5</span>
          <span className="text-sm text-gray-600">Score: {score}</span>
        </div>
      </div>

      {!gameActive && (
        <div className="text-center py-8">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-200 to-emerald-200 flex items-center justify-center">
            <Heart className="h-16 w-16 text-green-600" />
          </div>
          <p className="text-gray-600 mb-4">List 5 things you're grateful for today!</p>
          <button onClick={startGame} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
            Start Gratitude List
          </button>
        </div>
      )}

      {gameActive && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="I'm grateful for..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
            />
            <button
              onClick={addGratitude}
              disabled={!currentInput.trim()}
              className="mt-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Add to List
            </button>
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
    </div>
  );
};

// Main Games Component
export default function GamesPage() {
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<{
    totalGames: number;
    totalScore: number;
    totalTime: number;
    achievements: string[];
  }>({
    totalGames: 0,
    totalScore: 0,
    totalTime: 0,
    achievements: []
  });
  const [showStats, setShowStats] = useState<boolean>(false);

  const games = [
    {
      id: 'mindful-coloring',
      name: 'Mood Matcher',
      description: 'Match positive emotions to boost your mood and create positive associations',
      icon: Heart,
      color: 'from-pink-400 to-rose-400',
      component: MoodMatcher
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

  const handleGameComplete = useCallback(async (gameId: string, score: number, duration: number) => {
    setGameStats(prev => ({
      totalGames: prev.totalGames + 1,
      totalScore: prev.totalScore + score,
      totalTime: prev.totalTime + duration,
      achievements: [...prev.achievements, `Completed ${gameId}`]
    }));
    // Record game completion and time spent
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      if (token) {
        await fetch('/api/games/play', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            gameId,
            duration,
            score,
            completed: true,
            timestamp: Date.now()
          }),
        });
      }
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }, []);

  const GameComponent = currentGame ? games.find(g => g.id === currentGame)?.component : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
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
            <div className="text-3xl font-extrabold text-blue-900">{gameStats.totalGames}</div>
            <div className="text-base text-blue-700 font-medium mt-1">Games Played</div>
          </div>
          <div className="bg-gradient-to-br from-pink-200 to-pink-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <Star className="h-10 w-10 text-pink-500 mb-2" />
            <div className="text-3xl font-extrabold text-pink-900">{gameStats.totalScore}</div>
            <div className="text-base text-pink-700 font-medium mt-1">Total Score</div>
          </div>
          <div className="bg-gradient-to-br from-green-200 to-green-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <Clock className="h-10 w-10 text-green-500 mb-2" />
            <div className="text-3xl font-extrabold text-green-900">{Math.floor(gameStats.totalTime / 60)}m</div>
            <div className="text-base text-green-700 font-medium mt-1">Time Played</div>
          </div>
          <div className="bg-gradient-to-br from-purple-200 to-purple-400 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <User className="h-10 w-10 text-purple-500 mb-2" />
            <div className="text-3xl font-extrabold text-purple-900">{gameStats.achievements.length}</div>
            <div className="text-base text-purple-700 font-medium mt-1">Achievements</div>
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