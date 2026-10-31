"use client";

import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

const TESTIMONIALS = [
  {
    initials: 'DK',
    role: 'Senior Distributed Systems Candidate',
    context: 'System Design & Concurrency Round',
    quote:
      'During my L6 infrastructure loop, the interviewer threw a surprise multi-region Kafka replication bottleneck at me. Feonix AI immediately structured the talking points with explicit trade-offs. I stayed composed and received the offer.',
  },
  {
    initials: 'AM',
    role: 'Fullstack Software Engineer',
    context: 'CoderPad Live Coding Interview',
    quote:
      'I usually get nervous when live coding with someone watching my keystrokes. Having the sub-1.2s algorithmic time and space complexity notes visible gave me the exact mental anchor I needed to deliver clean code without blanking out.',
  },
  {
    initials: 'SL',
    role: 'Engineering Manager Candidate',
    context: 'Voice Mock Practice & Behavioral Rounds',
    quote:
      'I practiced with the AI Mock Coach for three consecutive evenings. The vocal cadence feedback and filler word counter eliminated my rambling habit. In the real interview, my STAR structured responses were crisp and executive-ready.',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: '60px 0' }}>
      <div className="px-container">
        <div className="px-section-header">
          <div className="px-section-tag">
            <MessageSquare size={13} />
            <span>Candidate Feedback</span>
          </div>
          <h2 className="px-section-title">
            Engineered for Engineers
          </h2>
          <p className="px-section-desc">
            Early candidate experiences across system design, live algorithm challenges, and behavioral leadership loops.
          </p>
        </div>

        <div className="px-testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="px-testimonial-card">
              <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                ))}
              </div>
              <p className="px-testimonial-quote">"{t.quote}"</p>
              <div className="px-testimonial-author">
                <div className="px-author-avatar">{t.initials}</div>
                <div>
                  <div className="px-author-name">{t.role}</div>
                  <div className="px-author-role">{t.context}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

