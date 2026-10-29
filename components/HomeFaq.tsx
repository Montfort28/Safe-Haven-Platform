'use client';

import { useState } from 'react';
import HomeWave from '@/components/HomeWave';

const faqs = [
  {
    question: 'What exactly is Safe Haven?',
    answer: (
      <p>
        Safe Haven is a digital wellbeing companion designed to make everyday
        emotional care feel more approachable. It brings simple tools for
        reflection, mood awareness, calming activities, and self-guided support
        together in one welcoming space.
      </p>
    ),
  },
  {
    question: 'Is Safe Haven a therapy app or a replacement for a therapist?',
    answer: (
      <p>
        No. Safe Haven is intended to complement—not replace—trusted
        relationships, qualified mental health professionals, or emergency
        services. It does not diagnose conditions or provide clinical
        treatment; it is a starting point for reflection and connection.
      </p>
    ),
  },
  {
    question: 'What tools are available on the platform?',
    answer: (
      <>
        <p>Safe Haven currently includes:</p>
        <ul>
          <li>Mood check-ins to reflect on feelings and notice patterns.</li>
          <li>Guided journaling and gratitude prompts.</li>
          <li>Mind Garden, a virtual garden that grows as you complete activities.</li>
          <li>Breathing exercises and calming audio.</li>
          <li>Wellbeing games and progress tracking.</li>
          <li>Affirmations and supportive resources.</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Who is Safe Haven designed for?',
    answer: (
      <p>
        It is for anyone looking for approachable ways to reflect, build
        healthy routines, or find a starting point for a wellbeing
        conversation. Organizations and community groups can also use its
        supportive, non-clinical activities with their members.
      </p>
    ),
  },
  {
    question: 'Does the platform cost anything?',
    answer: (
      <p>
        Safe Haven is free to use. You can create an account and explore the
        wellbeing tools currently available—including mood check-ins, guided
        journaling, breathing activities, games, and your Mind Garden—without
        paying to access the platform.
      </p>
    ),
  },
  {
    question: 'Why is Safe Haven focusing on Rwanda and Africa?',
    answer: (
      <p>
        Stigma, privacy concerns, and limited access to affordable support can
        make it difficult to talk about mental health. Safe Haven aims to offer
        a gentle, discreet entry point that makes wellbeing part of everyday
        conversation, while making room for local cultures and languages.
      </p>
    ),
  },
  {
    question: 'Is my data private and secure?',
    answer: (
      <>
        <p>
          Your account gives you a personal space to use Safe Haven. To help
          protect your account:
        </p>
        <ul>
          <li>Choose a strong, unique password and do not share it.</li>
          <li>Sign out when using a shared or public device.</li>
          <li>
            Avoid entering information you would not feel comfortable storing
            online.
          </li>
        </ul>
        <p>
          Safe Haven is a wellbeing tool, not a confidential clinical record or
          a substitute for professional care.
        </p>
      </>
    ),
  },
  {
    question: 'What should I do if I am in crisis or need immediate help?',
    answer: (
      <p>
        Safe Haven is not an emergency service. The “Need urgent help?” button
        available throughout the app opens Rwanda support contacts, including
        emergency services at 112. If you are outside Rwanda, contact your
        local emergency service or a trusted crisis service in your country. If
        you may be in immediate danger, call emergency services now.
      </p>
    ),
  },
];

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="home-faq" aria-labelledby="home-faq-title">
      <HomeWave
        className="home-wave-faq-top"
        color="#d9e7e1"
      />
      <div className="home-faq-layout">
        <div className="home-faq-intro">
          <span className="home-section-label">A little more clarity</span>
          <h2 id="home-faq-title">
            Questions,
            <br />
            answered.
          </h2>
          <p>
            Explore how Safe Haven works, what it can offer, and where to turn
            when you need more support.
          </p>
        </div>
        <div className="home-faq-list">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            const answerId = `home-faq-answer-${index + 1}`;

            return (
              <article
                className={`home-faq-item${isOpen ? ' is-open' : ''}`}
                key={question}
              >
                <h3 className="home-faq-heading">
                  <button
                    className="home-faq-trigger"
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="home-faq-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="home-faq-question">{question}</span>
                    <span className="home-faq-toggle" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="home-faq-answer"
                  id={answerId}
                  aria-hidden={!isOpen}
                >
                  <div className="home-faq-answer-inner">{answer}</div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
