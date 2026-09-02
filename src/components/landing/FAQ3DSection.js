"use client";

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How fast are the real-time AI answer suggestions?',
    a: 'Typically under 1.5 seconds! Our optimized backend pipelines process incoming audio chunks concurrently, converting voice cues into structured prompts immediately using low-latency streaming inference.',
  },
  {
    q: 'Is my interview data secure and private?',
    a: 'Yes, absolutely. All sessions operate in isolated sandboxes. Your voice recordings, uploaded documents, and generated transcripts are private to your authenticated account and can be permanently purged at any time.',
  },
  {
    q: 'Can I customize the AI response guidelines?',
    a: 'Yes. You can upload custom resumes, CVs, and specific guidelines, or even paste entire job descriptions. The AI cross-references this information to match the context during your live calls.',
  },
  {
    q: 'Does it support multiple programming languages and domains?',
    a: 'Yes, it parses coding questions and displays syntax-highlighted solutions for JavaScript, TypeScript, Python, C++, Java, Go, Rust, SQL, and system design architectures.',
  },
  {
    q: 'Can I use Feonix AI directly in my browser without installing software?',
    a: 'Yes! Feonix AI features a full-featured browser teleprompter workspace with microphone and tab audio capture, alongside native desktop apps for Windows and macOS.',
  },
];

export default function FAQ3DSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="faq-3d-section" id="faq">
      <div className="faq-3d-container">
        {/* Section Header */}
        <div className="section-header-centered">
          <div className="section-pill">
            <HelpCircle size={14} className="pill-icon text-cyan" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 className="section-title">
            Frequently Asked <span className="gradient-text-cyan">Questions</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to know about the Feonix AI real-time architecture and sandbox security.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-3d-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`faq-3d-item ${isOpen ? 'is-expanded' : ''}`}
              >
                <button
                  className="faq-trigger-btn"
                  onClick={() => toggleFaq(idx)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.q}</span>
                  <div className={`faq-icon-chevron ${isOpen ? 'rotate' : ''}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="faq-answer-container">
                    <p className="faq-answer-text">{faq.a}</p>
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
