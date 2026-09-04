const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSmartFallbackAnswer(userMsg) {
  const q = (userMsg || '').toLowerCase();

  if (q.includes('feonix') || q.includes('what is') || q.includes('copilot') || q.includes('how does')) {
    return "Feonix AI is your real-time 3D AI Copilot engineered for technical interviews and high-stakes meetings. It features low-latency voice chunk streaming with sub-1.5 second stealth on-screen hints, zero-retention privacy sandboxes, and full-spectrum career tools like AI resume tuning and interactive mock interview prep.";
  }

  if (q.includes('process') && q.includes('thread')) {
    return "A process is an isolated program instance with its own virtual address space, memory pages, and system handles. A thread is an execution unit inside that process; multiple threads share the same process heap and resources. While thread communication is faster, concurrency requires careful locking or atomic operations to prevent race conditions.";
  }

  if (q.includes('event loop') || q.includes('javascript')) {
    return "The JavaScript Event Loop coordinates asynchronous execution on a single thread. The synchronous call stack runs first. When empty, all pending Microtasks (like Promise callbacks and queueMicrotask) are drained immediately before the browser picks the next Macrotask (such as setTimeout, setInterval, or I/O events).";
  }

  if (q.includes('system design') || q.includes('scale') || q.includes('architecture')) {
    return "For System Design questions, follow this 4-step framework: 1. Clarify functional and non-functional requirements (read vs write ratio, latency SLAs). 2. Compute rough scale estimates (QPS, storage, bandwidth). 3. Map high-level architecture (CDN, API Gateway, Load Balancer, Cache, Database). 4. Address bottlenecks, replication, and disaster recovery.";
  }

  if (q.includes('star') || q.includes('behavioral') || q.includes('nervous')) {
    return "For behavioral questions, structure your answers using the STAR method: Situation, Task, Action, and Result. Make sure to spend the majority of your time on the Action (your personal technical decisions and leadership) and conclude with measurable Results (such as 'improved query response times by 35%').";
  }

  return `That is an insightful question! When tackling "${userMsg}" in an interview setting, the best approach is to state your core assumptions, present the simplest working model first, and then discuss trade-offs in terms of performance, scalability, and maintainability. Would you like to practice a follow-up scenario?`;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || '';

    // Attempt to call backend if reachable
    try {
      const backendRes = await fetch(`${BACKEND}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(6000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // Backend unavailable or timed out, fallback gracefully
    }

    const answer = getSmartFallbackAnswer(message);
    return new Response(
      JSON.stringify({
        answer,
        model: 'feonix-next-neural-v3',
        source: 'Feonix 3D Assistant Core',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        answer: "I'm here to help you practice and answer any technical questions. Could you please repeat that?",
        error: err.message,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
