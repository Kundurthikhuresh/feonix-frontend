"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How do the 5 free trial sessions work?',
    a: 'Every newly registered account automatically receives 5 free trial sessions. Each free trial is valid for exactly 10 minutes of live audio/screen copilot or practice coach access. A trial session is consumed as soon as you launch a session. No credit card or upfront commitment is required.',
  },
  {
    q: 'What is the difference between free trials and paid credits?',
    a: 'Free trials (5 sessions × 10 minutes) allow you to test all platform features without paying. Paid credits are separate: 1 paid credit provides 1 full hour of uninterrupted access. You can purchase one-time credit packs (e.g. 1, 3, or 6 sessions) or subscribe to weekly or monthly unlimited tiers.',
  },
  {
    q: 'Is Feonix AI completely invisible during screen-sharing?',
    a: 'Yes. Feonix AI uses native desktop window display affinity APIs (WDA_EXCLUDEFROMCAPTURE). When you share your entire screen or individual app window on Zoom, Microsoft Teams, Google Meet, or Webex, the video encoder captures everything except the Feonix teleprompter overlay. Only you see it on your physical display.',
  },
  {
    q: 'How fast does it transcribe questions and generate answers?',
    a: 'Under 1.2 seconds. Streaming dual-channel audio continuously feeds low-latency transcription models, allowing technical questions to be recognized mid-sentence and structuring talking points before you finish acknowledging the interviewer.',
  },
  {
    q: 'Can it tailor answers to my actual resume and past projects?',
    a: 'Yes. In your dashboard, you can upload your PDF/Word resume and paste the target job description. The AI extracts your genuine achievements, metrics, and technology stacks, ensuring all STAR answers sound authentic and personal rather than robotic.',
  },
  {
    q: 'What programming languages and frameworks are supported?',
    a: 'All major software engineering languages: Python, JavaScript, TypeScript, Go, Java, C++, C#, Rust, SQL, along with major frontend and cloud distributed system architectures.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" style={{ padding: '60px 0 80px 0' }}>
      <div className="px-container">
        <div className="px-section-header">
          <div className="px-section-tag">
            <HelpCircle size={13} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="px-section-title">
            Everything You Need to Know
          </h2>
          <p className="px-section-desc">
            Direct answers regarding trial minutes, paid credits, screen-share protection, and technical compatibility.
          </p>
        </div>

        <div className="px-faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className={`px-faq-item ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="px-faq-question"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                      color: isOpen ? '#38bdf8' : '#94a3b8',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="px-faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

