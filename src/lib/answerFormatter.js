/**
 * Parakeet-Style AI Answer Formatter & Parser
 * Converts raw LLM output (with [TYPE], [POINTS], [ANSWER] tags or markdown)
 * into a structured, high-contrast, professional teleprompter HUD UI format.
 */

/**
 * Detects if the question is asking for code, programming, implementation, queries, or functions.
 */
export function isCodingQuestion(text) {
  const q = String(text || '').toLowerCase().trim();
  if (!q) return false;

  // Direct code / program / syntax / implementation keywords
  if (/\b(example|sample|demo|snippet|syntax)\s+code\b/i.test(q)) return true;
  if (/\bcode\s+(example|sample|demo|snippet|template|syntax|solution)\b/i.test(q)) return true;
  if (/\b(write|create|implement|provide|generate|give|show|build|develop|solve|draft|need|want|share)\b.*?\b(code|program|script|function|class|method|query|algorithm|snippet|solution|component|syntax)\b/i.test(q)) return true;
  if (/\b(write\s+a?\s*code|write\s+code|code\s+(for|to|of|in|that|addition|subtraction|multiplication|division)|coding\s+question|coding\s+problem)\b/i.test(q)) return true;
  if (/\b(python|javascript|typescript|java|c\+\+|cpp|c#|golang|go|rust|ruby|php|swift|kotlin|sql|html|css|bash|powershell|regex)\s+(code|script|program|solution|function|implementation|snippet|syntax)\b/i.test(q)) return true;
  if (/\b(code|function|program|script|solution|implementation|snippet|syntax)\s+(in|using|with|for)\s+(python|javascript|typescript|java|c\+\+|cpp|c#|golang|go|rust|ruby|php|swift|kotlin|sql|html|css|bash|powershell)\b/i.test(q)) return true;
  if (/\b(with|in)\s+code\b/i.test(q)) return true;
  if (/\b(write\s+(a\s+)?python|write\s+(a\s+)?javascript|write\s+(a\s+)?typescript|write\s+(a\s+)?java|write\s+(a\s+)?c\+\+|write\s+(a\s+)?cpp|write\s+(a\s+)?sql|write\s+(a\s+)?query)\b/i.test(q)) return true;
  if (/\b(sql\s+query|select\s+.*\s+from|insert\s+into|update\s+.*\s+set|delete\s+from|create\s+table)\b/i.test(q)) return true;
  if (/\b(leetcode|hackerrank|codewars)\b/i.test(q)) return true;
  if (/\b(write\s+a\s+program|write\s+program|program\s+to\s+[a-z]+|function\s+to\s+[a-z]+)\b/i.test(q)) return true;
  if (/\b(implement|code|program)\s+(a\s+|an\s+|the\s+)?([a-z0-9_-]+\s+)?(binary search|quicksort|mergesort|dfs|bfs|dijkstra|lru cache|linked list|stack|queue|tree|heap|two sum|fibonacci|palindrome|reverse|if condition|while loop|for loop)\b/i.test(q)) return true;
  if (/\b(if\s+condition|for\s+loop|while\s+loop|switch\s+case)\s+code\b/i.test(q)) return true;
  return false;
}

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

  const bodyEl = container.querySelector('.explanation-body') || container;
  bodyEl.querySelectorAll('.parakeet-subheading, .parakeet-para, .parakeet-code-block, .parakeet-sub-bullet, .parakeet-sub-numbered').forEach((el) => {
    if (el.classList.contains('parakeet-subheading')) {
      const text = clean(el.textContent);
      if (text) parts.push(`\n### ${text}`);
    } else if (el.classList.contains('parakeet-sub-bullet')) {
      const text = clean(el.textContent);
      if (text) parts.push(`- ${text}`);
    } else if (el.classList.contains('parakeet-sub-numbered')) {
      const text = clean(el.textContent);
      if (text) parts.push(text);
    } else if (el.classList.contains('parakeet-code-block')) {
      const text = el.textContent.trim();
      if (text) parts.push(`\`\`\`\n${text}\n\`\`\``);
    } else if (el.classList.contains('parakeet-para')) {
      const text = clean(el.textContent);
      if (text) parts.push(text);
    }
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

    // Check Section Headers (supports [TYPE], [TYPE: ...], [POINTS], [POINTS: ...], [ANSWER], [ANSWER: ...])
    if (/^\[TYPE/i.test(line)) {
      currentSection = 'type';
      hasStructure = true;
      const typeVal = line.replace(/^\[TYPE:?\s*\]?/i, '').replace(/\]$/, '').trim();
      if (typeVal) type = typeVal;
      continue;
    }

    if (/^\[POINTS/i.test(line)) {
      currentSection = 'points';
      hasStructure = true;
      const rest = line.replace(/^\[POINTS:?\s*\]?/i, '').replace(/\]$/, '').trim();
      if (rest) {
        const cleaned = rest.replace(/^[-*•\d.]+\s*/, '').trim();
        if (cleaned) points.push(cleaned);
      }
      continue;
    }

    if (/^\[ANSWER/i.test(line)) {
      currentSection = 'answer';
      hasStructure = true;
      const rest = line.replace(/^\[ANSWER:?\s*\]?/i, '').replace(/\]$/, '').trim();
      if (rest) {
        answer += (answer ? '\n' : '') + rest;
      }
      continue;
    }

    // Process Line Content based on active section
    if (currentSection === 'type') {
      if (line && !type && !/^\[/i.test(line)) {
        type = line;
      }
    } else if (currentSection === 'points') {
      if (/^\[/i.test(line)) {
        continue;
      }
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
        if (/^\[/i.test(line)) {
          continue;
        }
        answer += (answer ? '\n' : '') + lines[i];
      }
    }
  }

  // Fallback: If no [ANSWER] tag was explicitly provided but body text was entered
  if (!answer && !hasStructure && rawText.trim()) {
    answer = rawText.trim();
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

  // If there is an unclosed code block during live streaming, temporarily close it for clean layout
  let formattedText = text;
  const backtickMatches = formattedText.match(/```/g);
  if (backtickMatches && backtickMatches.length % 2 !== 0) {
    formattedText += '\n```';
  }

  const parts = formattedText.split(/(```[\s\S]*?```)/g);

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

      // Format text content with clean block parsing (headings, lists, paragraphs)
      return renderMarkdownBlocks(part);
    })
    .join('');
}

/**
 * Parses markdown blocks (headings, lists, paragraphs) preserving line structure.
 */
function renderMarkdownBlocks(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const blocks = [];
  let currentList = null;
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push(`<p class="parakeet-para">${currentParagraph.join('<br />')}</p>`);
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      const tag = currentList.type === 'ol' ? 'ol' : 'ul';
      const itemClass = currentList.type === 'ol' ? 'parakeet-sub-numbered' : 'parakeet-sub-bullet';
      const items = currentList.items
        .map((it) => `<li class="${itemClass}">${formatInlineMarkdown(it)}</li>`)
        .join('');
      blocks.push(`<${tag} class="parakeet-sub-list">${items}</${tag}>`);
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph();
      flushList();
      const hText = line.replace(/^#{1,4}\s+/, '');
      blocks.push(`<h4 class="parakeet-subheading">${formatInlineMarkdown(hText)}</h4>`);
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(line.replace(/^[-*•]\s+/, ''));
      continue;
    }

    if (/^\d+[.)]\s+/.test(line)) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(line);
      continue;
    }

    flushList();
    currentParagraph.push(formatInlineMarkdown(line));
  }

  flushParagraph();
  flushList();
  return blocks.join('');
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
 * Streams points and answer content smoothly and immediately without waiting for stream completion.
 */
export function formatStreamingAnswer(accumulatedText) {
  if (!accumulatedText || typeof accumulatedText !== 'string') return null;

  const { points, answer, hasStructure, type } = parseAnswerSections(accumulatedText);

  if (hasStructure) {
    if (!points.length && !answer) {
      // Tokens have started arriving! Provide immediate live visual feedback instead of staying stuck on thinking spinner
      return (
        '<div class="parakeet-answer-container">' +
          '<div class="teleprompter-live-indicator" style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:9999px;background:rgba(0,245,255,0.08);border:1px solid rgba(0,245,255,0.25);color:#00f5ff;font-size:12px;font-weight:600;letter-spacing:0.02em;">' +
            '<span class="live-dot-pulse" style="width:7px;height:7px;border-radius:50%;background:#00f5ff;box-shadow:0 0 8px #00f5ff;display:inline-block;"></span> ' +
            `Streaming ${type ? escapeHtml(type.toLowerCase()) : 'solution'}…` +
          '</div>' +
        '</div>'
      );
    }

    let html = '<div class="parakeet-answer-container">';

    if (points.length > 0) {
      html += '<ul class="teleprompter-bullet-list">';
      points.forEach((point) => {
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
      html += '</ul>';
    }

    if (answer) {
      html += `
        <div class="teleprompter-explanation">
          ${points.length > 0 ? '<div class="explanation-divider"></div>' : ''}
          <div class="explanation-body">
            ${formatBodyWithCodeBlocks(answer)}
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  // Non-tagged output (e.g. Chat direct prompt or direct code solution)
  const cleanedText = accumulatedText.replace(/^\[[A-Z_\s-]*\]?/i, '').trim();
  const textToRender = cleanedText.length > 0 ? cleanedText : accumulatedText;

  if (textToRender.trim().length > 2) {
    return (
      '<div class="parakeet-answer-container">' +
        '<div class="teleprompter-explanation">' +
          `<div class="explanation-body">${formatBodyWithCodeBlocks(textToRender)}</div>` +
        '</div>' +
      '</div>'
    );
  }

  return null;
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
    const cleanAns = answer.replace(/\s+/g, ' ').trim().toLowerCase();
    const cleanPoints = (points || []).join('. ').replace(/\s+/g, ' ').trim().toLowerCase();
    const isRedundantRepeat = (points && points.length > 0) && (
      cleanAns === cleanPoints ||
      cleanAns === cleanPoints + '.'
    );

    if (!isRedundantRepeat) {
      html += `
        <div class="teleprompter-explanation">
          ${points && points.length > 0 ? '<div class="explanation-divider"></div>' : ''}
          <div class="explanation-body">
            ${formatBodyWithCodeBlocks(answer)}
          </div>
        </div>
      `;
    }
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
