/**
 * Parakeet-Style AI Answer Formatter & Parser
 * Converts raw LLM output (with [TYPE], [POINTS], [ANSWER] tags or markdown)
 * into a structured, high-contrast, professional teleprompter HUD UI format.
 */

export function parseAnswerSections(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      type: '',
      points: [],
      answer: '',
      hasStructure: false,
    };
  }

  let type = '';
  const points = [];
  let answer = '';
  let hasStructure = false;

  const lines = rawText.split('\n');
  let currentSection = 'body';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check Section Headers
    if (/^\[TYPE\]/i.test(line)) {
      currentSection = 'type';
      hasStructure = true;
      const typeVal = line.replace(/^\[TYPE\]/i, '').trim();
      if (typeVal) type = typeVal;
      continue;
    }

    if (/^\[POINTS\]/i.test(line)) {
      currentSection = 'points';
      hasStructure = true;
      continue;
    }

    if (/^\[ANSWER\]/i.test(line)) {
      currentSection = 'answer';
      hasStructure = true;
      continue;
    }

    // Process Line Content based on active section
    if (currentSection === 'type') {
      if (line && !type) {
        type = line;
      }
    } else if (currentSection === 'points') {
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•') || /^[0-9]+\./.test(line)) {
        const cleaned = line.replace(/^[-*•\d.]+\s*/, '').trim();
        if (cleaned) points.push(cleaned);
      } else if (line.length > 0) {
        // Line without bullet prefix in points block
        points.push(line);
      }
    } else if (currentSection === 'answer') {
      answer += (answer ? '\n' : '') + lines[i];
    } else {
      // If no tag has been encountered yet
      if (!hasStructure) {
        answer += (answer ? '\n' : '') + lines[i];
      }
    }
  }

  // Fallback: If no [ANSWER] tag was explicitly provided but [POINTS] was,
  // check if points contains everything or if answer is empty
  if (hasStructure && !answer && points.length > 0) {
    // If the model only returned points so far during stream
  }

  return {
    type: type || 'Technical Answer',
    points,
    answer: answer.trim(),
    hasStructure,
  };
}

/**
 * Format markdown inline elements (bold, italic, inline code)
 */
function formatInlineMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="parakeet-highlight">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="parakeet-em">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="parakeet-inline-code">$1</code>');
}

/**
 * Parses and formats code blocks inside spoken answers
 */
function formatBodyWithCodeBlocks(text) {
  if (!text) return '';

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts
    .map((part) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        let lang = 'code';
        if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
          lang = lines.shift() || 'code';
        }
        const codeContent = lines.join('\n');
        return `
          <div class="parakeet-code-wrapper">
            <div class="parakeet-code-header">
              <span class="parakeet-code-lang">${lang.toUpperCase()}</span>
              <span class="parakeet-code-hint">SOLUTION TEMPLATE</span>
            </div>
            <pre class="parakeet-code-block"><code>${escapeHtml(codeContent)}</code></pre>
          </div>
        `;
      }

      // Format normal paragraphs
      const paragraphs = part.split(/\n\n+/).filter((p) => p.trim());
      return paragraphs
        .map((p) => {
          const lines = p.split('\n').map((l) => formatInlineMarkdown(l.trim())).filter(Boolean);
          return `<p class="parakeet-para">${lines.join(' ')}</p>`;
        })
        .join('');
    })
    .join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Main function: Formats any AI answer into Parakeet UI HTML
 */
export function formatParakeetAnswer(rawText) {
  if (!rawText) return '';

  const { type, points, answer, hasStructure } = parseAnswerSections(rawText);

  // Type Tag Formatter
  const normalizedType = (type || 'TECHNICAL').toUpperCase();
  let typeBadgeColor = 'cyan';
  if (normalizedType.includes('BEHAVIOR')) typeBadgeColor = 'violet';
  else if (normalizedType.includes('CODE') || normalizedType.includes('SQL')) typeBadgeColor = 'emerald';
  else if (normalizedType.includes('SYSTEM')) typeBadgeColor = 'sky';

  let html = `<div class="parakeet-answer-container">`;

  // 1. Header Type Bar
  html += `
    <div class="parakeet-top-bar">
      <div class="parakeet-badge-pill ${typeBadgeColor}">
        <span class="parakeet-dot"></span>
        <span class="parakeet-badge-label">${normalizedType}</span>
      </div>
      <div class="parakeet-meta-pill">
        <span class="parakeet-tele-label">TELEPROMPTER SCALE</span>
      </div>
    </div>
  `;

  // 2. Key Talking Points Section (Parakeet Bullet Beats)
  if (points && points.length > 0) {
    html += `
      <div class="parakeet-points-card">
        <div class="parakeet-section-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          <span>KEY TALKING BEATS (GLANCE & SPEAK)</span>
        </div>
        <div class="parakeet-points-grid">
    `;

    points.forEach((point, idx) => {
      // Check for STAR prefixes (S:, T:, A:, R:)
      const starMatch = point.match(/^([STAR])\s*:\s*(.*)/i);

      if (starMatch) {
        const starLetter = starMatch[1].toUpperCase();
        const starText = starMatch[2];
        const starNames = { S: 'SITUATION', T: 'TASK', A: 'ACTION', R: 'RESULT' };
        const starColors = { S: 'star-s', T: 'star-t', A: 'star-a', R: 'star-r' };

        html += `
          <div class="parakeet-point-item star-item">
            <span class="star-badge ${starColors[starLetter] || ''}">${starLetter}</span>
            <div class="point-text-wrapper">
              <strong class="star-label">${starNames[starLetter] || starLetter}:</strong>
              <span>${formatInlineMarkdown(starText)}</span>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="parakeet-point-item">
            <span class="point-num-badge">${idx + 1}</span>
            <div class="point-text-wrapper">
              <span>${formatInlineMarkdown(point)}</span>
            </div>
          </div>
        `;
      }
    });

    html += `
        </div>
      </div>
    `;
  }

  // 3. Spoken Answer Narrative (Read Aloud Section)
  if (answer) {
    html += `
      <div class="parakeet-spoken-card">
        <div class="parakeet-section-title spoken">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>FULL EXPLANATION (VERBAL DELIVERY)</span>
        </div>
        <div class="parakeet-spoken-body">
          ${formatBodyWithCodeBlocks(answer)}
        </div>
      </div>
    `;
  } else if (!hasStructure && !points.length) {
    // If raw unstructured answer
    html += `
      <div class="parakeet-spoken-card">
        <div class="parakeet-spoken-body">
          ${formatBodyWithCodeBlocks(rawText)}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
