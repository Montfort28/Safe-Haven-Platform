// app/resources/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BarChart3, Gamepad2, Library, BookOpen, Video, Phone, User, LogOut, ExternalLink, Heart, Smile, Frown } from 'lucide-react';
import AppShell from '../AppShell';
import stories from './stories';
import Navbar from '@/components/Navbar';

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

const audioTherapy = [
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
];

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Audio Therapy', value: 'audio' },
  { label: 'Videos', value: 'video' },
  { label: 'Articles', value: 'articles' },
  { label: 'Coping Mechanisms', value: 'coping' },
  { label: 'Stories', value: 'stories' },
  { label: 'Curated Resources', value: 'resources' },
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
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'audio' | 'video' | 'articles' | 'coping' | 'stories' | 'resources'>('all');
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<Array<HTMLAudioElement | null>>([]);

  const filteredResources = resources.filter(
    resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mappedStories: Story[] = stories.map((s, idx) => {
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
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 animate-fade-in">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-200 to-purple-100 shadow-xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">You Are Not Alone</h1>
            <p className="text-lg md:text-xl text-slate-700 mb-4 max-w-2xl">Explore trusted resources, real stories, and practical tools for managing anxiety and depression. Safe Haven is your supportive space for mental wellness.</p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a href="#coping" className="btn-primary">Coping Mechanisms</a>
              <a href="#stories" className="btn-secondary">Real Stories</a>
              <a href="#resources" className="btn-tertiary">All Resources</a>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
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

        {/* Coping Mechanisms Section */}
        {(activeFilter === 'all' || activeFilter === 'coping') && (
          <section id="coping" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><Heart className="w-6 h-6 text-pink-500" /> Coping Mechanisms</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {copingMechanisms.map((coping) => (
                <div key={coping.id} className="rounded-2xl p-6 bg-white shadow-lg border border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center gap-4 mb-3">
                    {coping.icon}
                    <h3 className="text-xl font-semibold text-slate-800">{coping.title}</h3>
                  </div>
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    {coping.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audio Therapy Section */}
        {(activeFilter === 'all' || activeFilter === 'audio') && (
          <section id="audio-therapy" className="mb-16">
            <h2 className="text-2xl font-bold text-cyan-800 mb-6 flex items-center gap-2">
              <Library className="w-6 h-6 text-cyan-500" /> Audio Therapy
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {audioTherapy.map((audio, idx) => (
                <div key={audio.id} className="rounded-2xl p-6 bg-white shadow-lg border border-cyan-100 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <Library className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-lg font-semibold text-slate-800">{audio.title}</h3>
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

        {/* Real Stories Section */}
        {(activeFilter === 'all' || activeFilter === 'stories') && (
          <section id="stories" className="mb-16">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2"><User className="w-6 h-6 text-blue-400" /> Real Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {allStories.map(story => (
                <div key={story.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 cursor-pointer hover:scale-[1.03] transition-transform" onClick={() => setOpenStory({ ...story, issue: story.issue === 'depression' ? 'depression' : 'anxiety' })}>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">{story.title}</h3>
                  <p className="text-slate-600 text-sm mb-2">{story.summary}</p>
                  <span className="inline-block text-xs text-blue-600 font-medium">{story.name}{story.age ? `, ${story.age}` : ''}</span>
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

        {/* Resources Section */}
        {(activeFilter === 'all' || activeFilter === 'resources' || activeFilter === 'video') && (
          <section id="resources" className="mb-16">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-500" /> Curated Resources</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg border border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    {resource.type === 'article' && <BookOpen className="w-5 h-5 text-blue-500" />}
                    {resource.type === 'video' && <Video className="w-5 h-5 text-purple-500" />}
                    {resource.type === 'helpline' && <Phone className="w-5 h-5 text-pink-500" />}
                    {resource.type === 'audio' && <Library className="w-5 h-5 text-cyan-500" />}
                    <h3 className="text-lg font-semibold text-slate-800">{resource.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-2">{resource.description}</p>
                  {resource.type === 'audio' ? (
                    <audio controls className="w-full mt-2">
                      <source src={resource.url} type="audio/m4a" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : resource.type === 'helpline' ? (
                    <button
                      onClick={() => setShowHelplineModal(true)}
                      className="btn-primary flex items-center w-fit"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Call Now
                    </button>
                  ) : (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center w-fit"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Resource
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Helpline Modal */}
        {showHelplineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-200/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn overflow-y-auto max-h-[90vh] border border-blue-200">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setShowHelplineModal(false)}>&times;</button>
              <h3 className="text-2xl font-bold text-blue-800 mb-4">National Mental Health and Crisis Hotlines</h3>
              <ul className="mb-4 space-y-2 text-blue-800">
                <li><b>116</b> – Rwanda Biomedical Center Mental Health Helpline<br /><span className="text-slate-600">24/7 free, confidential support for emotional distress and mental health concerns</span></li>
                <li><b>8015</b> – Mental Health First / National Suicide Prevention Hotline<br /><span className="text-slate-600">Operates 24/7; staffed by professional counselors in English, French, and Kinyarwanda</span></li>
                <li><b>112</b> – National Emergency Number (police/ambulance/fire)</li>
                <li><b>3525</b> – Caritas Rwanda Psychological Support<br /><span className="text-slate-600">Available daily from 8 AM to 10 PM</span></li>
                <li><b>3512</b> – Isange One-Stop Center for GBV / trauma (24/7)</li>
                <li><b>+250 788 304 782</b> – MindSky Rwanda Youth Mental Health Line</li>
              </ul>
              <a href="tel:116" className="btn-primary w-full flex items-center justify-center mt-4"><Phone className="w-5 h-5 mr-2" /> Call 116 Now</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}