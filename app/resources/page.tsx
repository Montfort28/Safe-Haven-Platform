'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BarChart3, Gamepad2, Library, BookOpen, Video, Phone, User, LogOut, ExternalLink, Heart, Smile, Frown } from 'lucide-react';
import AppShell from '../AppShell';
import stories from './stories';
import Navbar from '@/components/Navbar';
import EmergencySupport from '@/components/EmergencySupport';
import { anxietyDetails, depressionDetails } from './copingDetails';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'helpline' | 'audio';
  url: string;
}

interface Story {
  id: string;
  name: string;
  age: number;
  title: string;
  summary: string;
  content: string;
  issue: 'anxiety' | 'depression';
}

const copingMechanisms = [
  {
    id: 'anxiety',
    title: 'Coping with Anxiety',
    icon: <Smile className="w-7 h-7 text-blue-500" />,
    steps: [
      'Practice deep breathing (4-7-8 technique)',
      'Ground yourself with the 5-4-3-2-1 method',
      'Limit caffeine and sugar intake',
      'Talk to a trusted friend or therapist',
      'Try guided meditation or mindfulness apps',
      'Move your body: take a walk or stretch',
    ],
    color: 'from-blue-100 to-blue-50',
  },
  {
    id: 'depression',
    title: 'Coping with Depression',
    icon: <Frown className="w-7 h-7 text-purple-500" />,
    steps: [
      'Break tasks into small steps',
      'Keep a daily routine (sleep, meals, activity)',
      'Reach out to someone you trust',
      'Write down your thoughts and feelings',
      'Spend time outdoors in sunlight',
      'Seek professional help if needed',
    ],
    color: 'from-purple-100 to-purple-50',
  },
];

const audioTherapy: Resource[] = [
  {
    id: 'audio-1',
    title: 'How To Deal With Depression',
    description: 'Audio therapy session for dealing with depression.',
    type: 'audio',
    url: '/audios/How To Deal With Depression.m4a',
  },
  {
    id: 'audio-2',
    title: 'Overcome Depression & Anxiety',
    description: 'Guided audio for overcoming depression and anxiety.',
    type: 'audio',
    url: '/audios/Overcome Depression & Anxiety.m4a',
  },
];

const resources: Resource[] = [
  {
    id: '1',
    title: 'Understanding Anxiety',
    description: 'A comprehensive guide to recognizing and managing anxiety symptoms.',
    type: 'article',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
  },
  {
    id: '2',
    title: 'Coping with Depression',
    description: 'Strategies and tips for managing depression in daily life.',
    type: 'article',
    url: 'https://www.helpguide.org/articles/depression/coping-with-depression.htm',
  },
  {
    id: '3',
    title: 'Guided Meditation for Anxiety',
    description: 'A calming 10-minute meditation to reduce stress and anxiety.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
  },
  {
    id: '4',
    title: 'National Suicide Prevention Lifeline',
    description: '24/7 crisis support for those in distress.',
    type: 'helpline',
    url: 'tel:988',
  },
  // Add audio therapy audios to resources
  ...audioTherapy,
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Audio Therapy', value: 'audio' },
  { label: 'Videos', value: 'video' },
  { label: 'Articles', value: 'articles' },
  { label: 'Coping Mechanisms', value: 'coping' },
  { label: 'Stories', value: 'stories' },
  { label: 'Hotlines', value: 'hotlines' },
];

const articles = [
  {
    id: 'a1',
    title: 'Coping with Depression',
    description: 'Strategies and tips for managing depression in daily life.',
    url: 'https://www.helpguide.org/articles/depression/coping-with-depression.htm',
  },
  {
    id: 'a2',
    title: 'Understanding Anxiety',
    description: 'A comprehensive guide to recognizing and managing anxiety symptoms.',
    url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
  },
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openStory, setOpenStory] = useState<Story | null>(null);
  const [openCopingModal, setOpenCopingModal] = useState<'anxiety' | 'depression' | null>(null);
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'audio' | 'video' | 'articles' | 'coping' | 'stories' | 'hotlines'>('all');
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<Array<HTMLAudioElement | null>>([]);

  // Improved search: filter and sort by match relevance (type, then title/desc)
  const term = searchTerm.toLowerCase();
  let filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(term) ||
    resource.description.toLowerCase().includes(term) ||
    resource.type.toLowerCase().includes(term)
  );
  // Sort: if search term matches a type exactly, show that type first
  if (term) {
    filteredResources = filteredResources.sort((a, b) => {
      const aTypeMatch = a.type.toLowerCase().startsWith(term) ? 1 : 0;
      const bTypeMatch = b.type.toLowerCase().startsWith(term) ? 1 : 0;
      if (aTypeMatch !== bTypeMatch) return bTypeMatch - aTypeMatch;
      // Then by title match
      const aTitleMatch = a.title.toLowerCase().startsWith(term) ? 1 : 0;
      const bTitleMatch = b.title.toLowerCase().startsWith(term) ? 1 : 0;
      if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch;
      // Then by description match
      const aDescMatch = a.description.toLowerCase().includes(term) ? 1 : 0;
      const bDescMatch = b.description.toLowerCase().includes(term) ? 1 : 0;
      return bDescMatch - aDescMatch;
    });
  }

  // ...existing code...

  // Place the new story first and ensure its details are shown correctly
  const mappedStories: Story[] = [
    {
      id: 'story-4',
      name: 'Anonymous',
      age: 24,
      title: 'Mental Fog, Sleepless Nights, and a Silent Battle',
      summary: 'I stopped going to class, thinking it was just stress. But I was battling something deeper, and I didn’t know how to talk about it.',
      content: `# Mental Fog, Sleepless Nights, and a Silent Battle\n\n*Anonymous, 24, Final Year Student at INES Ruhengeri*\n\nI never thought I'd deal with depression. I'm the kind of guy who always laughs with people, always keeps it moving. But somewhere between deadlines, noisy roommates in the ghetto, and pressure from all sides — something cracked.\n\n## When Normal Got Too Heavy\n\nIn my third year, I started skipping lectures. I wasn’t partying or being lazy. I just couldn’t concentrate anymore. Even reading a paragraph was too much. Nights became longer, sleep became rare, and I felt like I was running on fumes. I would stay silent around people, but inside I was screaming.\n\n## Realizing Something Was Wrong\n\nOne day, after failing to present in class because I froze, I overheard a classmate saying, “He’s falling off hard.” That hit me. I knew I needed help, but didn’t know where to begin. Therapy felt out of reach. So I started researching ways to understand what was going on inside me.\n\n## How This Platform Could Have Helped\n\nIf **Safe Haven** had been around then, it could’ve changed everything. Here's how:\n- **Journaling privately** would’ve helped me release what I couldn't say to anyone.\n- The **mood tracker** could've shown me that this wasn’t "just stress" — it was a pattern.\n- **Real stories** from other students would've reminded me I’m not alone.\n- Watching my **mind garden grow** as I took small steps like logging moods or writing would’ve encouraged me to keep going.\n\n## Why Platforms Like This Matter\n\nWe don’t talk about mental health at INES — not really. Most people are scared to say they’re struggling. This platform gives us quiet tools to heal in private. And that’s powerful.\n\n> “Sometimes, we need a place that listens, even if no one else does. That’s what Safe Haven feels like.”\n\n## Where I Am Now\n\nI'm still on my journey. I journal more now. I track my moods. I understand myself better. And I know when it's time to rest.\n\nTo anyone going through it — your mind matters. You’re not weak. You’re just carrying more than most can see.`,
      issue: 'depression',
    },
    ...stories.slice(1).map((s) => {
      let name = '', age = 0, issue: 'anxiety' | 'depression' = 'anxiety';
      if (s.author) {
        const match = s.author.match(/([A-Za-z]+), (\d+)/);
        if (match) {
          name = match[1];
          age = parseInt(match[2], 10);
        } else {
          name = s.author.split(',')[0];
          age = 0;
        }
      }
      if (s.tags && s.tags.some(t => t.toLowerCase().includes('depress'))) issue = 'depression';
      else issue = 'anxiety';
      return {
        id: s.id,
        name,
        age,
        title: s.title,
        summary: s.excerpt,
        content: s.content,
        issue,
      };
    })
  ];

  const extraStories = [
    {
      id: 's4',
      name: 'Aline',
      age: 22,
      title: 'Finding Light in the Dark',
      summary: 'How I learned to manage my anxiety and find hope.',
      content: 'I used to feel overwhelmed every day... *But I found help* through friends and therapy.\n- Practice gratitude daily\n- Reach out for support',
      issue: 'anxiety',
    },
    {
      id: 's5',
      name: 'Eric',
      age: 28,
      title: 'Steps Toward Healing',
      summary: 'My journey with depression and recovery.',
      content: 'Depression made me feel isolated... *But small steps* made a difference.\n- Set tiny goals\n- Celebrate progress',
      issue: 'depression',
    },
  ];
  const allStories = [...mappedStories, ...((activeFilter === 'stories') ? extraStories : [])];

  useEffect(() => {
    if (!openStory) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpenStory(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openStory]);

  function handleAudioPlay(idx: number) {
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== idx) audio.pause();
    });
  }

  function renderStoryContent(content: string) {
    let html = content
      .replace(/^#+\s?/gm, '')
      .replace(/\*([^*]+)\*/g, '<span class="font-semibold text-blue-700">$1</span>') // Bold for *text*
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, ' ');
    html = `<p>${html}</p>`;
    html = html.replace(/(<li>.*?<\/li>)/g, '<ul class="list-disc pl-6 text-blue-700 my-2">$1</ul>');
    return <div className="text-lg leading-relaxed text-slate-800" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Filtered articles, audio, and video based on search
  const filteredArticles = filteredResources.filter(r => r.type === 'article');
  const filteredAudio = filteredResources.filter(r => r.type === 'audio');
  const filteredVideo = filteredResources.filter(r => r.type === 'video');
  const hotlineResource = resources.find(r => r.type === 'helpline');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-100 animate-fade-in">
      <EmergencySupport />
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-200 to-blue-200 shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">You Are Not Alone</h1>
            <p className="text-lg md:text-xl text-slate-700 mb-4 max-w-xl">Explore trusted resources, real stories, and practical tools for managing anxiety and depression. Safe Haven is your supportive space for mental wellness.</p>
            <div className="flex flex-row gap-4 mt-6">
              <a href="#coping" className="btn-primary">Coping Mechanisms</a>
              <a href="#stories" className="btn-secondary">Real Stories</a>
            </div>
          </div>
        </section>

        {/* Search Bar & Emotion Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center w-full">
          {/* Enhanced Search Bar */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search resources, articles, videos..."
              className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 focus:ring-4 focus:ring-blue-200 bg-white text-blue-800 text-base shadow-lg transition-all duration-200 pr-12"
              style={{ boxShadow: '0 2px 12px 0 rgba(59,130,246,0.07)' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.15 10.15Z" /></svg>
            </span>
          </div>
          {/* Enhanced Filter Bar */}
          <div className="relative w-full md:w-64 min-w-[180px]">
            <select
              className="w-full px-5 py-3 rounded-xl border-2 border-blue-300 focus:ring-4 focus:ring-blue-200 bg-white text-blue-800 text-base shadow-lg transition-all duration-200 appearance-none"
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value as any)}
              aria-label="Filter by type"
              style={{ boxShadow: '0 2px 12px 0 rgba(59,130,246,0.07)' }}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
          {/* Enhanced Emotion Filter */}
          <div className="relative w-full md:w-64 min-w-[180px]">
            <select
              className="w-full px-5 py-3 rounded-xl border-2 border-green-300 focus:ring-4 focus:ring-green-200 bg-white text-green-800 text-base shadow-lg transition-all duration-200 appearance-none"
              defaultValue=""
              onChange={e => {
                const emotion = e.target.value;
                if (emotion === "") return;
                if (emotion === "anxious") {
                  setActiveFilter("coping");
                  setSearchTerm("anxiety");
                  setOpenCopingModal('anxiety');
                } else if (emotion === "depressed") {
                  setActiveFilter("coping");
                  setSearchTerm("depression");
                  setOpenCopingModal('depression');
                } else if (emotion === "sad") {
                  setActiveFilter("audio");
                  setSearchTerm("music");
                } else if (emotion === "stressed") {
                  setActiveFilter("coping");
                  setSearchTerm("stress");
                } else if (emotion === "lonely") {
                  setActiveFilter("stories");
                  setSearchTerm("lonely");
                } else if (emotion === "hopeful") {
                  setActiveFilter("stories");
                  setSearchTerm("hope");
                } else if (emotion === "energetic") {
                  setActiveFilter("audio");
                  setSearchTerm("energy");
                } else if (emotion === "calm") {
                  setActiveFilter("audio");
                  setSearchTerm("calm");
                } else {
                  setSearchTerm(emotion);
                }
              }}
              aria-label="Filter by emotion"
              style={{ boxShadow: '0 2px 12px 0 rgba(16,185,129,0.07)' }}
            >
              <option value="">How are you feeling?</option>
              <option value="anxious">I feel anxious</option>
              <option value="depressed">I feel depressed</option>
              <option value="sad">I feel sad</option>
              <option value="stressed">I feel stressed</option>
              <option value="lonely">I feel lonely</option>
              <option value="hopeful">I feel hopeful</option>
              <option value="energetic">I feel energetic</option>
              <option value="calm">I feel calm</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
        </div>

        {/* Filter Bar (legacy, now replaced by select above) */}
        {/*
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value as any)}
              className={`px-4 py-2 rounded-full border font-semibold transition-all ${activeFilter === option.value ? 'bg-blue-600 text-white shadow' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        */}

        {/* Coping Mechanisms Section - should come first */}
        {(activeFilter === 'all' || activeFilter === 'coping') && (
          <section id="coping" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><Heart className="w-6 h-6 text-pink-500" /> Coping Mechanisms</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {copingMechanisms.map((coping) => (
                <div key={coping.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 flex flex-col gap-2 cursor-pointer hover:scale-[1.03] transition-transform" onClick={() => setOpenCopingModal(coping.id as 'anxiety' | 'depression')}>
                  <div className="flex items-center gap-4 mb-3">
                    {coping.icon}
                    <h3 className="text-xl font-semibold text-blue-800">{coping.title}</h3>
                  </div>
                  <ul className="list-disc pl-6 text-slate-600 space-y-1">
                    {coping.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Real Stories Section - should follow Coping Mechanisms */}
        {(activeFilter === 'all' || activeFilter === 'stories') && (
          <section id="stories" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><User className="w-6 h-6 text-blue-400" /> Real Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {mappedStories.map(story => (
                <div key={story.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 flex flex-col gap-2 transition-transform hover:scale-[1.03]">
                  <h3 className="text-lg font-semibold text-blue-800 mb-1">{story.title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{story.summary}</p>
                  <span className="inline-block text-xs text-blue-600 font-medium">{story.name}{story.age ? `, ${story.age}` : ''}</span>
                  <button className="btn-primary mt-3 w-fit" onClick={() => setOpenStory(story)}>Read Story</button>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Articles Section - below Real Stories */}
        {(activeFilter === 'all' || activeFilter === 'articles') && filteredArticles.length > 0 && (
          <section id="articles" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-500" /> Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {filteredArticles.map((article) => (
                <div key={article.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 flex flex-col gap-2 transition-transform hover:scale-[1.03]">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-blue-800">{article.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-2">{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center w-fit"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Article
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Hotlines Section - only visible in hotlines filter */}
        {activeFilter === 'hotlines' && hotlineResource && (
          <section id="hotlines" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><Phone className="w-6 h-6 text-pink-500" /> Hotlines / Emergency Contact</h2>
            <div className="grid md:grid-cols-1 gap-8">
              <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-pink-50 shadow-lg border border-pink-100 flex flex-col gap-2 transition-transform hover:scale-[1.03] cursor-pointer group" onClick={() => setShowHelplineModal(true)}>
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-pink-500 animate-pulse group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-blue-800">{hotlineResource.title}</h3>
                </div>
                <p className="text-slate-600 mb-2">{hotlineResource.description}</p>
                <button className="btn-primary flex items-center w-fit group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Hotlines
                </button>
              </div>
            </div>
          </section>
        )}
        {/* Video Section - only visible in video filter */}
        {activeFilter === 'video' && (
          <section id="video" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><Video className="w-6 h-6 text-purple-500" /> Videos</h2>
            <div className="grid md:grid-cols-1 gap-8">
              {filteredVideo.map((video) => (
                <div key={video.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 flex flex-col gap-2 transition-transform hover:scale-[1.03]">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-blue-800">{video.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-2">{video.description}</p>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center w-fit"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Video
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Modal for Coping Mechanism */}
        {openCopingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-200/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh] border border-blue-200">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setOpenCopingModal(null)}>&times;</button>
              <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight">{openCopingModal === 'anxiety' ? anxietyDetails.title : depressionDetails.title}</h3>
              <p className="text-base text-slate-700 mb-4">{openCopingModal === 'anxiety' ? anxietyDetails.description : depressionDetails.description}</p>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">What is it?</h4>
                <p className="text-slate-800">{openCopingModal === 'anxiety' ? anxietyDetails.whatIsIt : depressionDetails.whatIsIt}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Causes</h4>
                <ul className="list-disc pl-6 text-slate-800">
                  {(openCopingModal === 'anxiety' ? anxietyDetails.causes : depressionDetails.causes).map((cause, idx) => <li key={idx}>{cause}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Signs & Symptoms</h4>
                <ul className="list-disc pl-6 text-slate-800">
                  {(openCopingModal === 'anxiety' ? anxietyDetails.signs : depressionDetails.signs).map((sign, idx) => <li key={idx}>{sign}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Prevention</h4>
                <ul className="list-disc pl-6 text-slate-800">
                  {(openCopingModal === 'anxiety' ? anxietyDetails.prevention : depressionDetails.prevention).map((prev, idx) => <li key={idx}>{prev}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">What to Do</h4>
                <ul className="list-disc pl-6 text-slate-800">
                  {(openCopingModal === 'anxiety' ? anxietyDetails.whatToDo : depressionDetails.whatToDo).map((doit, idx) => <li key={idx}>{doit}</li>)}
                </ul>
              </div>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-700 mb-2">Helpful Resources</h4>
                <ul className="list-disc pl-6 text-blue-700">
                  {(openCopingModal === 'anxiety' ? anxietyDetails.resources : depressionDetails.resources).map((res, idx) => <li key={idx}><a href={res.url} target="_blank" rel="noopener noreferrer" className="underline">{res.title}</a></li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Audio Therapy Section */}
        {(activeFilter === 'all' || activeFilter === 'audio') && filteredAudio.length > 0 && (
          <section id="audio-therapy" className="mb-16">
            <h2 className="text-2xl font-bold text-cyan-800 mb-6 flex items-center gap-2">
              <Library className="w-6 h-6 text-cyan-500" /> Audio Therapy
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {filteredAudio.map((audio, idx) => (
                <div key={audio.id} className="rounded-2xl p-6 bg-white shadow-lg border border-cyan-100 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Library className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-lg font-semibold text-blue-800">{audio.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-2">{audio.description}</p>
                  <audio
                    ref={el => { audioRefs.current[idx] = el; }}
                    controls
                    className="w-full mt-2"
                    onPlay={() => handleAudioPlay(idx)}
                  >
                    <source src={audio.url} type="audio/mp4" />
                    <source src={audio.url} type="audio/m4a" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Modal for Story */}
        {openStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-200/60 backdrop-blur-sm">
            <div
              ref={modalRef}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh] border border-blue-200"
            >
              <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setOpenStory(null)}>&times;</button>
              <h3 className="text-2xl font-extrabold text-blue-800 mb-4 tracking-tight">{openStory.title}</h3>
              <div className="text-base leading-relaxed text-slate-800 prose prose-blue max-w-none">{renderStoryContent(openStory.content)}</div>
              <div className="flex items-center gap-2 mt-6">
                <span className="text-base text-blue-600 font-medium">{openStory.name}{openStory.age ? `, ${openStory.age}` : ''}</span>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 ml-2">{openStory.issue.charAt(0).toUpperCase() + openStory.issue.slice(1)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Helpline Modal */}
        {showHelplineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-200/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh] border border-blue-200">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setShowHelplineModal(false)}>&times;</button>
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Rwanda Crisis Hotlines & Mental Health Support</h3>
              <div className="mb-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">Mental Health Helpline - RBC</div>
                      <a href="tel:116" className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1">116</a>
                      <div className="text-sm text-gray-600">24/7 free & confidential support for emotional distress</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">Caritas Rwanda Crisis Support</div>
                      <a href="tel:3525" className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1">3525</a>
                      <div className="text-sm text-gray-600">Psychological support & crisis intervention (8AM-10PM daily)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">Solid Minds Counseling Clinic</div>
                      <a href="tel:+250788503528" className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1">+250 788 503 528</a>
                      <div className="text-sm text-gray-600">Licensed outpatient therapy for depression, anxiety & trauma</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">MindSky Rwanda Youth Helpline</div>
                      <a href="tel:+250788304782" className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1">+250 788 304 782</a>
                      <div className="text-sm text-gray-600">Youth mental health & suicide prevention (9AM-6PM Mon-Sat)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 mb-1">Emergency Services</div>
                      <a href="tel:112" className="text-blue-600 hover:text-blue-700 hover:underline font-bold text-lg break-all block mb-1">112</a>
                      <div className="text-sm text-gray-600">National emergency line for police, fire & medical services</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                <p className="italic text-purple-700 font-semibold text-center leading-relaxed">
                  "Your mental health matters. Professional help is available."
                </p>
              </div>
              <div className="text-center">
                <p className="text-base text-gray-700 font-medium mb-2">
                  Crisis support is available 24/7. You don't have to face this alone.
                </p>
                <p className="text-sm text-gray-600">
                  Free, confidential help for mental health crises, emotional distress, and suicide prevention.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}