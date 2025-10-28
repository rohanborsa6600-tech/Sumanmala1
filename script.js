// --- Utilities ---
const DEVANAGARI_RE = /[\u0900-\u097F]/;            // Devanagari block
const DEV_DIGIT_RE  = /^[\u0966-\u096F0-9]+\s*/;    // Leading digits (मराठी/अरबी)

// Check if a text has Devanagari characters
const hasDevanagari = (t) => DEVANAGARI_RE.test(t);

// Wrap a text node's full content with [translate: ...] if Devanagari is present
function wrapDevanagariInTranslate(node){
  const txt = node.textContent;
  if(!txt || !hasDevanagari(txt)) return;
  if(txt.includes('[translate:')) return; // already wrapped
  // Replace the text node with the bracketed markup
  node.replaceWith(document.createTextNode(`[translate:${txt}]`));
}

// Walk all text nodes under a root and wrap Devanagari
function autoWrapTranslate(root){
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(wrapDevanagariInTranslate);
}

// Heuristic: determine if an element is a "chapter title" candidate
function isChapterTitle(el){
  if(!(el instanceof HTMLElement)) return false;
  const t = (el.textContent || '').trim();
  if(!t) return false;

  // Class-based hints from your sample
  const cls = el.className || '';
  if(cls.includes('p8') || cls.includes('section-title')) return true; // prominent title
  if(cls.includes('p12')) return true; // higher-level header

  // Numeric prefix (e.g., "११ प्रभो राजसी...")
  if(DEV_DIGIT_RE.test(t)) return true;

  // Styling hint via inner spans like s7/s8 often used for headers
  const inner = el.querySelector('span.s7, span.s8');
  if(inner) return true;

  return false;
}

// Parse raw HTML string into a DOM fragment safely
function htmlToFragment(raw){
  // Ensure angle brackets exist; if user pasted without starting '<', try to normalize
  const normalized = raw.trim().startsWith('<') ? raw : `<div>${raw}</div>`;
  const tpl = document.createElement('template');
  tpl.innerHTML = normalized;
  return tpl.content.cloneNode(true);
}

// Build chapters: split stream by titles; return array of {titleEl, bodyEls[]}
function extractChapters(rootFrag){
  // Collect only block-level <p>, headings, and allowed blocks in order
  const blocks = Array.from(rootFrag.querySelectorAll('p, h1, h2, h3, div'))
    .filter(el => (el.textContent || '').trim().length > 0);

  const chapters = [];
  let current = null;

  blocks.forEach(el => {
    if(isChapterTitle(el)){
      // Start new chapter
      current = { titleEl: el.cloneNode(true), bodyEls: [] };
      chapters.push(current);
    }else if(current){
      current.bodyEls.push(el.cloneNode(true));
    }else{
      // No chapter started yet: skip or buffer as preface
    }
  });

  return chapters;
}

// Render chapters into the #chapters container, with collapsible bodies
function renderChapters(chapters){
  const mount = document.getElementById('chapters');
  mount.innerHTML = '';

  chapters.forEach((ch, idx) => {
    const section = document.createElement('section');
    section.className = 'chapter';
    section.id = `chapter-${idx+1}`;

    // Title -> h3; text preserved (already auto-wrapped later)
    const h3 = document.createElement('h3');
    h3.textContent = (ch.titleEl.textContent || '').trim();
    section.appendChild(h3);

    const body = document.createElement('div');
    body.className = 'body';

    // Append body elements; preserve inner HTML text
    ch.bodyEls.forEach(el => body.appendChild(el));
    section.appendChild(body);

    // Toggle on title click
    h3.addEventListener('click', () => {
      const open = body.style.display === 'block';
      body.style.display = open ? 'none' : 'block';
    });

    mount.appendChild(section);
  });
}

// Generate TOC from rendered chapters
function buildTOC(){
  const tocItems = document.getElementById('toc-items');
  tocItems.innerHTML = '';
  const chapters = document.querySelectorAll('.chapter');

  chapters.forEach(ch => {
    const h3 = ch.querySelector('h3');
    const a = document.createElement('a');
    a.href = `#${ch.id}`;
    a.className = 'toc-link';
    a.textContent = h3 ? h3.textContent : ch.id;
    tocItems.appendChild(a);
  });
}

// Main process: take raw HTML -> wrap -> split into chapters -> render -> TOC
function processRaw(){
  const src = document.getElementById('rawInput').value.trim();
  if(!src){
    alert('कृपया Raw HTML पेस्ट करा.'); return;
  }

  // 1) Parse to fragment
  const frag = htmlToFragment(src);

  // 2) Auto-wrap Devanagari text in [translate:...]
  autoWrapTranslate(frag);

  // 3) Extract chapters by title heuristics
  const chapters = extractChapters(frag);

  // 4) Render and build TOC
  renderChapters(chapters);
  buildTOC();

  // 5) Auto-open first chapter
  const firstBody = document.querySelector('.chapter .body');
  if(firstBody) firstBody.style.display = 'block';
}

// --- UI wiring ---
document.addEventListener('DOMContentLoaded', () => {
  const processBtn = document.getElementById('processBtn');
  const toggleInputBtn = document.getElementById('toggleInputBtn');
  const rawPanel = document.getElementById('rawPanel');
  const loadSample = document.getElementById('loadSample');
  const rawHtmlDiv = document.getElementById('raw-html-input');
  const rawInput = document.getElementById('rawInput');

  processBtn.addEventListener('click', processRaw);

  toggleInputBtn.addEventListener('click', () => {
    const show = rawPanel.style.display !== 'none';
    rawPanel.style.display = show ? 'none' : 'block';
  });

  loadSample.addEventListener('click', () => {
    rawInput.value = rawHtmlDiv.textContent.trim();
  });

  // TOC toggle + back to top
  const toggleTOC = document.getElementById('toggleTOC');
  const toc = document.getElementById('toc');
  toggleTOC.addEventListener('click', () => toc.classList.toggle('hidden'));
  document.getElementById('backToTop').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
