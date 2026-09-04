/**
 * Parakeet-Style AI Answer Formatter & Parser
 * Converts raw LLM output (with [TYPE], [POINTS], [ANSWER] tags or markdown)
 * into a structured, high-contrast, professional teleprompter HUD UI format.
 */

/**
 * Plain text for "Copy Response" — targets the specific structure this file
 * generates (.teleprompter-bullet-list, .bullet-text, .parakeet-para,
 * .parakeet-code-block) rather than walking generic tags. The templates
 * below are multi-line strings, so a generic li/p textContent grab picks up
 * their own indentation whitespace and the decorative bullet-dot glyph
 * alongside the real text — this reads only the meaningful pieces and
 * normalizes whitespace itself.
 */
export function htmlToPlainText(html) {
  if (!html || typeof document === 'undefined') return '';
  const container = document.createElement('div');
  container.innerHTML = html;
  const clean = (text) => String(text || '').replace(/\s+/g, ' ').trim();

  const parts = [];

  container.querySelectorAll('.teleprompter-bullet-list > li').forEach((li) => {
    const textEl = li.querySelector('.bullet-text') || li;
    const text = clean(textEl.textContent);
    if (text) parts.push(`- ${text}`);
  });

  container.querySelectorAll('.parakeet-para').forEach((p) => {
    const text = clean(p.textContent);
    if (text) parts.push(text);
  });

  container.querySelectorAll('.parakeet-code-block').forEach((code) => {
    const text = code.textContent.trim();
    if (text) parts.push(text);
  });

  if (parts.length) return parts.join('\n\n');

  // Fallback for anything outside the known structure (error banners, a raw
  // streaming preview that hasn't reached the final format yet).
  return clean(container.textContent);
}

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
    .replace(/\*\*(.*?)\*\*/g, '<mark class="parakeet-hl">$1</mark>')
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
        let lang = 'CODE';
        if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
          lang = (lines.shift() || 'CODE').toUpperCase();
        }
        const codeContent = lines.join('\n');
        return `
          <div class="parakeet-code-wrapper">
            <div class="parakeet-code-header">
              <span class="parakeet-code-lang">${lang}</span>
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
 * Live-streaming preview, used while tokens are still arriving.
 *
 * The full formatParakeetAnswer() below re-classifies [TYPE]/[POINTS]/[ANSWER]
 * from scratch on every partial substring, so mid-tag fragments ("[TY",
 * "[POINT") get shown as raw body text for a few ticks and then vanish the
 * instant the tag completes and the section state machine reclassifies them —
 * that's the flicker/"blinking" a viewer sees. The backend's answer always
 * carries this preamble ahead of the spoken reply, so instead of rendering
 * anything before [ANSWER] is fully visible, this returns null and the caller
 * keeps the thinking indicator up; once [ANSWER] is found, only the text after
 * it is shown, and that text only ever grows — never reclassified, never
 * removed, so nothing already on screen can disappear.
 */
export function formatStreamingAnswer(accumulatedText) {
  const idx = String(accumulatedText || '').search(/\[ANSWER\]/i);
  if (idx === -1) return null;
  const after = accumulatedText.slice(idx).replace(/^\[ANSWER\]\s*\n?/i, '');
  if (!after) return null;
  return (
    '<div class="parakeet-answer-container">' +
      '<div class="teleprompter-explanation">' +
        `<div class="explanation-body">${formatBodyWithCodeBlocks(after)}</div>` +
      '</div>' +
    '</div>'
  );
}

/**
 * Main function: Formats any AI answer into Parakeet UI HTML
 */
export function formatParakeetAnswer(rawText) {
  if (!rawText) return '';

  const { type, points, answer, hasStructure } = parseAnswerSections(rawText);

  let html = `<div class="parakeet-answer-container">`;

  // 1. Direct Points List Format (Clean Bullet Points)
  if (points && points.length > 0) {
    html += `<ul class="teleprompter-bullet-list">`;

    points.forEach((point, idx) => {
      const starMatch = point.match(/^([STAR])\s*:\s*(.*)/i);

      if (starMatch) {
        const starLetter = starMatch[1].toUpperCase();
        const starText = starMatch[2];
        const starNames = { S: 'SITUATION', T: 'TASK', A: 'ACTION', R: 'RESULT' };
        const starColors = { S: 'star-s', T: 'star-t', A: 'star-a', R: 'star-r' };

        html += `
          <li class="teleprompter-bullet-item star-bullet-item">
            <span class="star-badge ${starColors[starLetter] || ''}">${starLetter}</span>
            <div class="bullet-text">
              <strong class="star-label">${starNames[starLetter] || starLetter}:</strong>
              <span>${formatInlineMarkdown(starText)}</span>
            </div>
          </li>
        `;
      } else {
        html += `
          <li class="teleprompter-bullet-item">
            <span class="bullet-glow-dot">•</span>
            <div class="bullet-text">
              <span>${formatInlineMarkdown(point)}</span>
            </div>
          </li>
        `;
      }
    });

    html += `</ul>`;
  }

  // 2. Explanation / Narrative Delivery Section (if present)
  if (answer) {
    html += `
      <div class="teleprompter-explanation">
        ${points && points.length > 0 ? '<div class="explanation-divider"></div>' : ''}
        <div class="explanation-body">
          ${formatBodyWithCodeBlocks(answer)}
        </div>
      </div>
    `;
  } else if (points && points.length > 0) {
    // The model emitted [POINTS] but dropped the mandatory [ANSWER] tag — a
    // known gpt-4o-mini flake (see the tag reminder in answer.js). Without
    // this, the user sees a bare bullet list and nothing to actually say out
    // loud, which is strictly worse than a rough fallback built from the
    // fragments it did produce.
    html += `
      <div class="teleprompter-explanation">
        <div class="explanation-divider"></div>
        <div class="explanation-body">
          <p class="parakeet-para">${formatInlineMarkdown(points.join('. ') + '.')}</p>
        </div>
      </div>
    `;
  } else if (!hasStructure && !points.length) {
    html += `
      <div class="teleprompter-explanation">
        <div class="explanation-body">
          ${formatBodyWithCodeBlocks(rawText)}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
