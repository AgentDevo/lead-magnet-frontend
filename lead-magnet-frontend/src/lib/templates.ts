export interface LeadMagnetTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  emoji: string;
  content: string;
}

export const TEMPLATES: LeadMagnetTemplate[] = [
  {
    id: 'saas-metrics-cheat-sheet',
    title: 'SaaS Metrics Cheat Sheet',
    description: 'The 12 essential SaaS metrics every founder must track — with formulas and benchmarks.',
    type: 'guide',
    emoji: '📊',
    content: `<h2>The 12 SaaS Metrics Every Founder Must Track</h2>

<h3>Growth Metrics</h3>
<ul>
  <li><strong>MRR (Monthly Recurring Revenue)</strong> — Sum of all active subscription revenue per month. Benchmark: 10–15% MoM growth for early-stage.</li>
  <li><strong>ARR (Annual Recurring Revenue)</strong> — MRR × 12. The headline number for SaaS valuations.</li>
  <li><strong>MRR Growth Rate</strong> — (New MRR + Expansion MRR − Churned MRR) / Previous MRR. Target: >10% MoM.</li>
  <li><strong>New MRR</strong> — Revenue from new customers this month. Track separately from expansion.</li>
</ul>

<h3>Retention Metrics</h3>
<ul>
  <li><strong>Churn Rate</strong> — Churned customers / Total customers at start of period. Target: &lt;2% monthly for SMB, &lt;0.5% for Enterprise.</li>
  <li><strong>Net Revenue Retention (NRR)</strong> — (Starting MRR + Expansion − Contraction − Churn) / Starting MRR. Target: >110%.</li>
  <li><strong>Gross Revenue Retention (GRR)</strong> — Revenue retained excluding expansion. Target: >85%.</li>
</ul>

<h3>Acquisition Metrics</h3>
<ul>
  <li><strong>CAC (Customer Acquisition Cost)</strong> — Total sales &amp; marketing spend / New customers. Target: CAC payback &lt;12 months.</li>
  <li><strong>LTV (Lifetime Value)</strong> — ARPU / Churn Rate. Target: LTV:CAC ratio >3:1.</li>
  <li><strong>CAC Payback Period</strong> — CAC / (ARPU × Gross Margin). Target: &lt;12 months for SMB.</li>
</ul>

<h3>Efficiency Metrics</h3>
<ul>
  <li><strong>Magic Number</strong> — Net New ARR × 4 / Sales &amp; Marketing Spend. Target: >0.75.</li>
  <li><strong>Burn Multiple</strong> — Net Burn / Net New ARR. Target: &lt;1.5 at Series A.</li>
</ul>

<p><em>Tip: Track all 12 weekly in a simple spreadsheet. Revenue metrics lag decisions by months — the leading indicators (trial-to-paid conversion, activation rate) are what you actually control.</em></p>`,
  },
  {
    id: 'landing-page-copy-formula',
    title: 'Landing Page Copywriting Formula',
    description: 'A proven 7-section framework for writing high-converting landing page copy from scratch.',
    type: 'guide',
    emoji: '✍️',
    content: `<h2>The 7-Section Landing Page Copy Framework</h2>
<p>Use this formula to write a landing page that converts visitors into leads in under 2 hours.</p>

<h3>1. Headline (Above the Fold)</h3>
<p>Formula: <strong>[Outcome] + [Timeframe] + [Objection Handler]</strong></p>
<p>Example: "Double Your Email List in 30 Days — Without Paid Ads"</p>
<p>Rules: One idea only. Under 10 words. Specific beats vague.</p>

<h3>2. Subheadline</h3>
<p>Expand on the headline. Answer: "Who is this for and why should they care?" One sentence.</p>
<p>Example: "For bootstrapped founders who want predictable lead flow from organic content."</p>

<h3>3. Problem Agitation</h3>
<p>Name the pain. Use the exact words your audience uses to describe the problem.</p>
<ul>
  <li>Start with "You already know how painful it is when..."</li>
  <li>List 3–4 specific symptoms, not causes</li>
  <li>End with: "There's a better way."</li>
</ul>

<h3>4. Solution Introduction</h3>
<p>Introduce your lead magnet as the bridge from problem to outcome. Keep it to 2–3 sentences.</p>

<h3>5. What's Inside (Bullets)</h3>
<p>5–7 benefit-led bullets. Format: <strong>[Specific result] so you can [emotional payoff]</strong></p>
<p>Example: "The exact email sequence that recovered $4,200 in churned revenue — copy it word for word"</p>

<h3>6. Social Proof</h3>
<p>One testimonial or trust signal. Specificity trumps enthusiasm.</p>
<p>Good: "Got 47 new leads in the first week using this exact checklist."</p>
<p>Bad: "This is amazing! Highly recommend!"</p>

<h3>7. CTA + Micro-commitment</h3>
<p>Button text: Use first person. "Send me the [specific thing]" outperforms "Download Now."</p>
<p>Below button: Address the #1 objection in 1 line. "No credit card. Unsubscribe anytime."</p>`,
  },
  {
    id: 'email-subject-line-swipe-file',
    title: 'Email Subject Line Swipe File',
    description: '30 proven subject line templates across 6 categories that consistently get 35%+ open rates.',
    type: 'checklist',
    emoji: '📧',
    content: `<h2>30 Proven Email Subject Lines (Swipe &amp; Customize)</h2>
<p>These templates are drawn from campaigns with 35%+ open rates. Replace the [brackets] with your specifics.</p>

<h3>Curiosity Gap (works for cold + warm)</h3>
<ul>
  <li>The [industry] mistake that's costing you [outcome]</li>
  <li>Why [common belief] is wrong (and what to do instead)</li>
  <li>What nobody tells you about [topic]</li>
  <li>I was wrong about [topic]</li>
  <li>The weird [strategy] that [impressive result]</li>
</ul>

<h3>Specificity &amp; Numbers</h3>
<ul>
  <li>[X] ways to [desired outcome] in [timeframe]</li>
  <li>How I [specific result] in [timeframe] without [objection]</li>
  <li>The [X]-minute [task] that [outcome]</li>
  <li>[X]% of [audience] don't know this</li>
  <li>From [bad state] to [good state] in [timeframe]</li>
</ul>

<h3>Direct Value Offer</h3>
<ul>
  <li>Free [resource]: [specific benefit]</li>
  <li>[X] templates for [specific use case]</li>
  <li>Steal my [system/process/template]</li>
  <li>[Specific tool] just released — here's how to use it for [goal]</li>
  <li>Quick [timeframe] read: [specific topic]</li>
</ul>

<h3>Social Proof &amp; Authority</h3>
<ul>
  <li>How [well-known company] [achieved result] (breakdown)</li>
  <li>[Name/company] used this to [result] — here's the playbook</li>
  <li>[X] [experts/founders] swear by this [method]</li>
  <li>The strategy behind [impressive outcome]</li>
  <li>Case study: [specific transformation]</li>
</ul>

<h3>Re-engagement</h3>
<ul>
  <li>Still interested in [topic]?</li>
  <li>I haven't heard from you — is [pain point] still a problem?</li>
  <li>Last chance: [offer] expires [timeframe]</li>
  <li>Quick question about [specific thing]</li>
  <li>Did this help? (reply and let me know)</li>
</ul>

<h3>Pattern Interrupt</h3>
<ul>
  <li>Bad news + good news about [topic]</li>
  <li>Honest confession: [relevant truth]</li>
  <li>I almost didn't send this</li>
  <li>Unpopular opinion: [controversial but defensible take]</li>
  <li>Re: your [problem] — I found something</li>
</ul>

<p><em>Pro tip: A/B test subject lines with at least 200 recipients per variant. The winner is rarely what you'd predict.</em></p>`,
  },
  {
    id: 'freelancer-client-checklist',
    title: 'Freelancer Client Onboarding Checklist',
    description: 'A 20-step checklist to onboard new clients professionally and set projects up for success.',
    type: 'checklist',
    emoji: '✅',
    content: `<h2>20-Step Freelancer Client Onboarding Checklist</h2>
<p>Follow this checklist with every new client to eliminate scope creep, late payments, and miscommunication.</p>

<h3>Before the Project Starts</h3>
<ul>
  <li>☐ Send a welcome email within 24 hours of signing</li>
  <li>☐ Share a signed contract (include: scope, deliverables, revision policy, payment terms)</li>
  <li>☐ Collect 50% deposit before starting any work</li>
  <li>☐ Send an onboarding questionnaire (goals, audience, brand voice, competitors)</li>
  <li>☐ Schedule a kickoff call (30–60 min) to align on expectations</li>
  <li>☐ Set up a shared project folder (Google Drive / Notion / Dropbox)</li>
  <li>☐ Confirm communication channel and response time SLA</li>
</ul>

<h3>Kickoff Call Agenda</h3>
<ul>
  <li>☐ Review project goals and definition of success</li>
  <li>☐ Walk through deliverables and timeline milestone by milestone</li>
  <li>☐ Clarify revision rounds (number, process, turnaround time)</li>
  <li>☐ Identify key decision-maker (the one who approves deliverables)</li>
  <li>☐ Agree on feedback format (written, not verbal-only)</li>
</ul>

<h3>During the Project</h3>
<ul>
  <li>☐ Send a weekly status update (even if short: "on track, next milestone is X")</li>
  <li>☐ Document any scope change requests in writing before doing the work</li>
  <li>☐ Send milestone invoices on the agreed schedule</li>
  <li>☐ Store all feedback and approvals in the shared folder</li>
</ul>

<h3>Project Close</h3>
<ul>
  <li>☐ Deliver final files in all agreed formats</li>
  <li>☐ Send final invoice immediately on delivery</li>
  <li>☐ Share a brief "what's next" doc (maintenance, retainer options)</li>
  <li>☐ Ask for a testimonial or referral 2 weeks after delivery</li>
</ul>

<p><em>Template note: Customize the kickoff call agenda and questionnaire to your specific service. The items above apply to 90% of freelance engagements.</em></p>`,
  },
  {
    id: 'startup-validation-framework',
    title: 'Startup Idea Validation Framework',
    description: 'A 5-step process to validate your startup idea before writing a single line of code.',
    type: 'guide',
    emoji: '🚀',
    content: `<h2>5-Step Startup Idea Validation Framework</h2>
<p>Most startups fail because founders build before validating. Use this framework to get signal in 2 weeks, not 2 years.</p>

<h3>Step 1: Problem Clarity (Day 1–2)</h3>
<p>Write a single sentence: <strong>"[Specific person] struggles with [specific problem] when [specific context]."</strong></p>
<p>Validation criteria:</p>
<ul>
  <li>Can you name 10 real people who have this problem right now?</li>
  <li>Is it a problem they're actively trying to solve (not just complaining about)?</li>
  <li>Do they currently pay money for an imperfect solution?</li>
</ul>
<p>If you can't answer yes to all three, redefine the problem or switch ideas.</p>

<h3>Step 2: Customer Discovery Interviews (Day 3–7)</h3>
<p>Run 10 interviews with people who fit your ICP. Use this script:</p>
<ul>
  <li>"Tell me about the last time you faced [problem]."</li>
  <li>"What did you do to solve it?"</li>
  <li>"How much did that cost you in time or money?"</li>
  <li>"What would a perfect solution look like?"</li>
</ul>
<p>Listen for: frequency, intensity, and existing spend. Don't pitch. Just listen.</p>

<h3>Step 3: Competitive Landscape (Day 6–7)</h3>
<p>Map every existing solution. For each competitor, identify:</p>
<ul>
  <li>Who they serve best (and who they underserve)</li>
  <li>Their pricing and business model</li>
  <li>Top 3 complaints in reviews (G2, Capterra, Reddit)</li>
</ul>
<p>Your wedge = the intersection of underserved segment + unaddressed complaint.</p>

<h3>Step 4: Demand Test (Day 8–11)</h3>
<p>Build a 1-page landing page describing the solution (not built yet). Drive 200+ targeted visitors via:</p>
<ul>
  <li>Direct outreach to interview participants</li>
  <li>Relevant Reddit/Slack/Discord communities</li>
  <li>$50–100 of targeted ads</li>
</ul>
<p>Target: 10%+ conversion to "join waitlist" or pre-purchase. Below 5% = weak signal.</p>

<h3>Step 5: Concierge MVP (Day 12–14)</h3>
<p>Deliver the solution manually to 3–5 paying customers before building anything. Charge a real price (not free). This validates:</p>
<ul>
  <li>Willingness to pay (the ultimate signal)</li>
  <li>Exact workflow and edge cases</li>
  <li>Whether the outcome you promised is actually achievable</li>
</ul>
<p>Only start building after a paying concierge customer says "I need this every week."</p>`,
  },
  {
    id: 'content-repurposing-playbook',
    title: 'Content Repurposing Playbook',
    description: 'Turn one piece of long-form content into 12 pieces across 4 channels — a step-by-step workflow.',
    type: 'guide',
    emoji: '♻️',
    content: `<h2>The 1-to-12 Content Repurposing Playbook</h2>
<p>Create once, distribute everywhere. This workflow turns a single long-form piece into 12 content assets across LinkedIn, Twitter/X, email, and short video.</p>

<h3>The Source Asset</h3>
<p>Start with one piece of "pillar content" — a long-form article, a case study, a webinar, or a detailed tutorial (1,500+ words or 20+ minutes). Everything else derives from this.</p>

<h3>What You'll Create</h3>
<ul>
  <li>1 long-form article or transcript (the source)</li>
  <li>3 LinkedIn posts (hook + insight + CTA)</li>
  <li>3 X/Twitter threads (the best 3 frameworks from the source)</li>
  <li>2 email newsletter editions (intro + deep dive)</li>
  <li>2 short-form videos (60s each — one hook, one tip)</li>
  <li>1 carousel post (Instagram or LinkedIn)</li>
  <li>1 lead magnet PDF (the condensed checklist or framework)</li>
</ul>

<h3>Step-by-Step Workflow</h3>

<h3>Phase 1: Extract (30 min)</h3>
<ul>
  <li>Identify the 3 best standalone insights from your source asset</li>
  <li>Find the single most counterintuitive or surprising claim</li>
  <li>Pull out any frameworks, formulas, or step-by-step processes</li>
  <li>Note every specific number, stat, or result mentioned</li>
</ul>

<h3>Phase 2: Format for Each Channel (2 hours)</h3>
<ul>
  <li><strong>LinkedIn:</strong> Hook (one surprising stat or claim) → 4–6 insights as numbered list → soft CTA to full article</li>
  <li><strong>X/Twitter:</strong> Thread = 1 framework per thread. Tweet 1 = bold claim. Tweets 2–8 = one point each. Last tweet = link.</li>
  <li><strong>Email:</strong> Edition 1 = "Here's the problem" (tease the insight). Edition 2 = Full breakdown with a CTA.</li>
  <li><strong>Video:</strong> Script = first 3 seconds must state the payoff. No intro. Cut to value immediately.</li>
</ul>

<h3>Phase 3: Schedule (15 min)</h3>
<ul>
  <li>LinkedIn: Tuesday and Thursday, 8–9am audience timezone</li>
  <li>X/Twitter: Monday, Wednesday, Friday — morning</li>
  <li>Email: Tuesday morning (intro), Thursday morning (deep dive)</li>
  <li>Video: Wednesday and Saturday</li>
</ul>

<p><em>Key principle: Each piece should stand alone. Never say "as I mentioned in the full article." Every derivative asset must deliver complete value on its own.</em></p>`,
  },
];
