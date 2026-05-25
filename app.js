// ============================================================
// FUNDATEC PWA — app.js
// ============================================================

// ---------- CONFIGURAÇÃO ----------
const API_KEY_STORAGE = 'fundatec_api_key';
const DB_KEY = 'fundatec_db';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

const SUBJ_COLORS = [
  '#3949ab','#00897b','#e65100','#c2185b',
  '#6a1b9a','#1565c0','#2e7d32','#4e342e'
];

const MODES = {
  1: {
    name: 'Simulado fiel',
    cls: 'm1',
    desc: 'As questões aparecem exatamente como na prova original da FUNDATEC — mesmo enunciado, mesmas alternativas. Ideal para simular a experiência real do concurso.'
  },
  2: {
    name: 'Questão adaptada',
    cls: 'm2',
    desc: 'A IA reescreve a questão com nova formulação, mantendo tema e dificuldade no estilo FUNDATEC. Evita memorização mecânica e força o real entendimento do conteúdo.'
  },
  3: {
    name: 'Inferência da banca',
    cls: 'm3',
    desc: 'A IA analisa o perfil da FUNDATEC e gera questões inéditas no mesmo estilo: foco em legislação, interpretação e aplicação prática. Máxima preparação para o inesperado.'
  }
};

const SEED_QUESTIONS = {
  "Português": [
    { year:"2023", cargo:"Técnico Adm.", text:"Assinale a alternativa em que a regência verbal está corretamente empregada.", opts:["Ela aspirava o cargo de diretora.","Os alunos assistiram ao filme indicado.","Ele visou o documento sem conferir.","O juiz implicou os réus na sentença.","A professora preferia mais cantar que dançar."], correct:1 },
    { year:"2022", cargo:"Agente Adm.", text:"Em qual das frases abaixo a crase está empregada corretamente?", opts:["Ele foi à pé até a escola.","Entregou o documento à vista de todos.","Referia-se à uma situação delicada.","Às vezes ele chegava atrasado.","Estava à beira de um colapso nervoso."], correct:3 },
    { year:"2021", cargo:"Aux. Adm.", text:"Identifique a alternativa com concordância verbal correta.", opts:["Faz anos que não nos vemos.","Haviam muitos candidatos inscritos.","Fazem dois meses que ele partiu.","Houveram problemas no sistema.","Existem um erro neste relatório."], correct:0 },
    { year:"2022", cargo:"Assistente de Gestão", text:"Em qual das frases abaixo há uso correto da vírgula?", opts:["O diretor, enviou o relatório, para todos os setores.","Os servidores trabalharam muito, e concluíram o projeto.","Embora chovesse muito, o evento foi realizado normalmente.","O aluno, estudou, com afinco para a prova.","Ele foi, portanto ao médico ontem."], correct:2 }
  ],
  "Direito Administrativo": [
    { year:"2023", cargo:"Técnico Judiciário", text:"De acordo com o princípio da legalidade, a Administração Pública:", opts:["Pode fazer tudo que a lei não proibir.","Somente pode agir quando a lei autorizar.","Tem discricionariedade plena em todos os atos.","Pode editar atos que contrariem a lei.","Está dispensada de motivar atos discricionários."], correct:1 },
    { year:"2022", cargo:"Analista Jurídico", text:"São requisitos de validade do ato administrativo, EXCETO:", opts:["Competência.","Finalidade.","Forma.","Motivação.","Objeto."], correct:3 },
    { year:"2023", cargo:"Agente de Adm.", text:"Sobre o poder disciplinar da Administração Pública, é correto afirmar:", opts:["É um poder vinculado, sem discricionariedade.","Aplica-se somente a servidores estatutários.","Permite punir infrações funcionais de agentes.","Independe de processo administrativo prévio.","Pode ser delegado a particulares sem restrição."], correct:2 }
  ],
  "Raciocínio Lógico": [
    { year:"2023", cargo:"Técnico em TI", text:"Se todos os contadores são auditores e alguns auditores são advogados, é correto concluir que:", opts:["Todos os advogados são contadores.","Alguns contadores são advogados.","Nenhum contador é advogado.","Todos os contadores são advogados.","Nenhum auditor é advogado."], correct:1 },
    { year:"2022", cargo:"Analista de Sistemas", text:"Série lógica: 2, 6, 12, 20, 30, __. Qual é o próximo número?", opts:["40","42","44","46","48"], correct:1 },
    { year:"2021", cargo:"Técnico Judiciário", text:"Em um grupo de 50 pessoas, 30 falam inglês, 25 falam espanhol e 10 falam ambos. Quantas não falam nenhum?", opts:["5","10","15","20","25"], correct:0 }
  ],
  "Informática": [
    { year:"2023", cargo:"Técnico em TI", text:"No Microsoft Excel, a função que retorna o maior valor em um intervalo de células é:", opts:["MAIOR()","MAX()","MÁXIMO()","TOPO()","ALTO()"], correct:1 },
    { year:"2022", cargo:"Técnico Adm.", text:"Qual protocolo é utilizado para envio de e-mails?", opts:["FTP","HTTP","SMTP","DNS","SSH"], correct:2 },
    { year:"2023", cargo:"Analista de TI", text:"Qual atalho abre o Gerenciador de Tarefas no Windows 10?", opts:["Ctrl+Alt+F4","Ctrl+Shift+Esc","Alt+F4","Windows+R","Ctrl+Alt+Del+T"], correct:1 }
  ],
  "Legislação": [
    { year:"2023", cargo:"Agente Público", text:"Conforme a Lei 8.112/1990, o estágio probatório do servidor público federal tem duração de:", opts:["12 meses","18 meses","24 meses","36 meses","48 meses"], correct:3 },
    { year:"2022", cargo:"Técnico Judiciário", text:"É vedado à União, Estados, DF e Municípios cobrar tributos:", opts:["Sobre grandes fortunas.","Com alíquota progressiva.","No mesmo exercício em que publicada a lei que os instituiu.","Retroativamente em qualquer situação.","Sem aprovação do Congresso."], correct:2 }
  ],
  "Contabilidade": [
    { year:"2023", cargo:"Técnico em Contabilidade", text:"No Balanço Patrimonial, o Ativo Circulante compreende:", opts:["Bens realizáveis após o exercício seguinte.","Bens e direitos realizáveis no exercício seguinte.","Apenas o disponível (caixa e bancos).","Somente os estoques da empresa.","Imóveis e equipamentos da empresa."], correct:1 },
    { year:"2022", cargo:"Analista Financeiro", text:"O regime de competência determina que receitas e despesas sejam reconhecidas:", opts:["Quando há recebimento ou pagamento em dinheiro.","No período em que são geradas, independente do fluxo financeiro.","Somente quando houver nota fiscal emitida.","No encerramento do exercício social.","Após aprovação em assembleia."], correct:1 }
  ]
};

// ---------- ESTADO ----------
let DB = loadDB();
let quizState = { mode:1, subjs:[], queue:[], idx:0, right:0, wrong:0, answered:false, currentQ:null };
let deferredInstall = null;

function loadDB() {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return {
    questions: JSON.parse(JSON.stringify(SEED_QUESTIONS)),
    pdfs: 0,
    stats: { total:0, right:0, wrong:0, bySubj:{}, streak:0, lastDate:null }
  };
}

function saveDB() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(DB)); } catch(e) {}
}

// ---------- API KEY ----------
function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

async function callClaude(prompt) {
  const key = getApiKey();
  const headers = { 'Content-Type': 'application/json' };
  if (key) headers['x-api-key'] = key;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1000,
      messages: [{ role:'user', content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

// ---------- NAVEGAÇÃO ----------
function goTab(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const s = document.getElementById(id);
  if (s) s.classList.add('active');
  const t = document.getElementById('tab-' + id);
  if (t) t.classList.add('active');
  document.getElementById('content').scrollTop = 0;

  if (id === 's-home') renderHome();
  if (id === 's-stats') renderStats();
  if (id === 's-upload') {}
}

function goSetup(mode) {
  quizState.mode = mode;
  const m = MODES[mode];
  document.getElementById('setup-title').textContent = m.name;
  document.getElementById('setup-desc').textContent = m.desc;
  renderSubjChips();
  goTab('s-setup');
}

// ---------- HOME ----------
function renderHome() {
  const s = DB.stats;
  const pct = s.total > 0 ? Math.round(s.right / s.total * 100) : null;
  document.getElementById('h-total').textContent = s.total;
  document.getElementById('h-pct').textContent = pct !== null ? pct + '%' : '—%';
  document.getElementById('h-pdfs').textContent = DB.pdfs;
  document.getElementById('streak-n').textContent = s.streak || 0;

  const list = document.getElementById('home-subj-list');
  list.innerHTML = '';
  Object.keys(DB.questions).forEach((subj, i) => {
    const qs = DB.questions[subj];
    const bs = s.bySubj[subj] || { total:0, right:0 };
    const p = bs.total > 0 ? Math.round(bs.right / bs.total * 100) : 0;
    const col = SUBJ_COLORS[i % SUBJ_COLORS.length];
    const row = document.createElement('div');
    row.className = 'subj-row';
    row.innerHTML = `
      <div class="subj-dot" style="background:${col}"></div>
      <div class="subj-info">
        <div class="subj-name">${subj}</div>
        <div class="subj-meta">${qs.length} questões · ${bs.total} respondidas</div>
        <div class="subj-prog"><div class="subj-prog-fill" style="width:${p}%;background:${col}"></div></div>
      </div>
      <div class="subj-pct" style="color:${col}">${bs.total > 0 ? p + '%' : '—'}</div>`;
    row.onclick = () => { goSetup(1); setTimeout(() => selectSubjChip(subj), 80); };
    list.appendChild(row);
  });

  // Install banner
  const wrap = document.getElementById('install-banner-wrap');
  if (deferredInstall && !localStorage.getItem('install_dismissed')) {
    wrap.innerHTML = `<div class="install-banner" onclick="installPWA()">
      <span class="install-banner-icon">📲</span>
      <div class="install-banner-text">
        <div class="install-banner-title">Instalar app no celular</div>
        <div class="install-banner-sub">Funciona offline, sem precisar do navegador</div>
      </div>
      <button class="install-banner-close" onclick="dismissInstall(event)">✕</button>
    </div>`;
  } else {
    wrap.innerHTML = '';
  }
}

function installPWA() {
  if (deferredInstall) {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => { deferredInstall = null; renderHome(); });
  }
}

function dismissInstall(e) {
  e.stopPropagation();
  localStorage.setItem('install_dismissed', '1');
  document.getElementById('install-banner-wrap').innerHTML = '';
}

// ---------- SETUP ----------
function renderSubjChips() {
  const container = document.getElementById('subj-chips');
  container.innerHTML = '';
  Object.keys(DB.questions).forEach(subj => {
    const chip = document.createElement('div');
    chip.className = 'subj-chip';
    chip.textContent = subj;
    chip.dataset.subj = subj;
    chip.onclick = () => { chip.classList.toggle('sel'); updateStartBtn(); };
    container.appendChild(chip);
  });
  updateStartBtn();
}

function selectSubjChip(subj) {
  document.querySelectorAll('.subj-chip').forEach(c => {
    if (c.dataset.subj === subj) c.classList.add('sel');
  });
  updateStartBtn();
}

function updateStartBtn() {
  const sel = document.querySelectorAll('.subj-chip.sel');
  document.getElementById('start-btn').disabled = sel.length === 0;
}

// ---------- QUIZ ----------
function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

function launchQuiz() {
  const selSubjs = [...document.querySelectorAll('.subj-chip.sel')].map(c => c.dataset.subj);
  let pool = [];
  selSubjs.forEach(s => {
    if (DB.questions[s]) pool.push(...DB.questions[s].map(q => ({ ...q, subj: s })));
  });
  pool = shuffle(pool).slice(0, 10);
  quizState = { ...quizState, subjs: selSubjs, queue: pool, idx: 0, right: 0, wrong: 0, answered: false, currentQ: null };

  const m = MODES[quizState.mode];
  const pill = document.getElementById('mode-pill');
  pill.className = 'mode-pill ' + m.cls;
  pill.textContent = m.name;

  goTab('s-quiz');
  renderQ();
}

async function renderQ() {
  if (quizState.idx >= quizState.queue.length) { showDone(); return; }
  quizState.answered = false;
  document.getElementById('result-box').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';

  const q = quizState.queue[quizState.idx];
  const total = quizState.queue.length;
  const pct = Math.round(quizState.idx / total * 100);
  document.getElementById('qpf').style.width = pct + '%';
  document.getElementById('q-prog-text').textContent = (quizState.idx + 1) + '/' + total;
  document.getElementById('q-right').textContent = quizState.right;
  document.getElementById('q-wrong').textContent = quizState.wrong;

  document.getElementById('q-tags').innerHTML =
    `<span class="q-tag year">${q.year}</span>` +
    `<span class="q-tag cargo">${q.cargo}</span>` +
    `<span class="q-tag subj">${q.subj}</span>`;

  let displayQ = q;
  if (quizState.mode === 2 || quizState.mode === 3) {
    document.getElementById('q-text').innerHTML =
      `<div style="display:flex;align-items:center;gap:8px;color:#757575;font-size:12px">
        <div class="spinner"></div>
        ${quizState.mode === 2 ? 'Adaptando no estilo FUNDATEC...' : 'Gerando questão inédita pela banca...'}
      </div>`;
    document.getElementById('opts').innerHTML = '';
    displayQ = await generateAIQuestion(q, quizState.mode);
  }

  document.getElementById('q-text').textContent = displayQ.text;
  quizState.currentQ = displayQ;

  const optsEl = document.getElementById('opts');
  optsEl.innerHTML = '';
  displayQ.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'opt';
    btn.innerHTML = `<span class="opt-letter">${String.fromCharCode(65 + i)}</span><span class="opt-text">${opt}</span>`;
    btn.onclick = () => selectOpt(i, displayQ);
    optsEl.appendChild(btn);
  });
}

async function generateAIQuestion(q, mode) {
  const prompt = mode === 2
    ? `Reescreva a questão abaixo com nova formulação, mantendo tema, nível e estilo FUNDATEC. Mantenha a mesma resposta correta (posição ${q.correct}).

Matéria: ${q.subj}
Original: ${q.text}
Opções: ${q.opts.map((o,i) => String.fromCharCode(65+i)+') '+o).join(' | ')}

Responda APENAS JSON: {"text":"enunciado","opts":["A","B","C","D","E"],"correct":0}`
    : `Crie uma questão INÉDITA no estilo da banca FUNDATEC sobre "${q.subj}".
Estilo FUNDATEC: enunciados diretos, foco em legislação, interpretação e aplicação prática.
5 alternativas (A-E), apenas uma correta.

Responda APENAS JSON: {"text":"enunciado","opts":["A","B","C","D","E"],"correct":0}`;
  try {
    const raw = await callClaude(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { ...q, ...parsed };
  } catch(e) { return q; }
}

function selectOpt(chosen, q) {
  if (quizState.answered) return;
  quizState.answered = true;
  const isRight = chosen === q.correct;

  if (isRight) quizState.right++; else quizState.wrong++;
  document.getElementById('q-right').textContent = quizState.right;
  document.getElementById('q-wrong').textContent = quizState.wrong;

  // Salvar nas estatísticas
  DB.stats.total++;
  if (isRight) DB.stats.right++; else DB.stats.wrong++;
  if (!DB.stats.bySubj[q.subj]) DB.stats.bySubj[q.subj] = { total:0, right:0 };
  DB.stats.bySubj[q.subj].total++;
  if (isRight) DB.stats.bySubj[q.subj].right++;
  updateStreak();
  saveDB();

  document.querySelectorAll('.opt').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosen && !isRight) btn.classList.add('wrong');
    else btn.classList.add('dimmed');
  });

  const rb = document.getElementById('result-box');
  const rh = document.getElementById('result-header');
  const rc = document.getElementById('result-content');
  rb.style.display = 'block';
  rh.className = 'result-header ' + (isRight ? 'ok' : 'err');
  rh.innerHTML = isRight
    ? '<span class="result-header-icon">✅</span> Resposta correta!'
    : `<span class="result-header-icon">❌</span> Incorreta — correta é <strong>${String.fromCharCode(65 + q.correct)}</strong>`;
  rc.innerHTML = '<div class="ai-loading"><div class="spinner"></div> Analisando conforme perfil FUNDATEC...</div>';
  document.getElementById('next-btn').style.display = 'block';

  getExplanation(q, chosen, isRight, rc);
  rb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function getExplanation(q, chosen, isRight, container) {
  const prompt = `Você é professor especialista em concursos FUNDATEC. Explique em 3 frases curtas e diretas por que a alternativa ${String.fromCharCode(65+q.correct)} é correta nesta questão de ${q.subj}, seguindo o raciocínio da banca FUNDATEC.${!isRight ? ' Mencione brevemente por que a alternativa '+String.fromCharCode(65+chosen)+' está errada.' : ''} Seja objetivo, sem introduções.

Questão: ${q.text}
Correta: ${q.opts[q.correct]}`;
  try {
    const text = await callClaude(prompt);
    container.innerHTML = '<div class="result-body">' + text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>') + '</div>';
  } catch(e) {
    container.innerHTML = `<div class="result-body">A alternativa <strong>${String.fromCharCode(65+q.correct)}</strong> corresponde ao gabarito oficial FUNDATEC. Revise o conteúdo para reforçar o aprendizado.</div>`;
  }
}

function nextQ() { quizState.idx++; renderQ(); }

function showDone() {
  const total = quizState.queue.length;
  const pct = Math.round(quizState.right / total * 100);
  const quizEl = document.getElementById('s-quiz');
  quizEl.innerHTML = `<div class="done-screen">
    <div class="done-icon">🏆</div>
    <div class="done-title">Simulado concluído!</div>
    <div class="done-sub">${MODES[quizState.mode].name}</div>
    <div class="done-score">${pct}%</div>
    <div class="done-score-sub">${quizState.right} de ${total} questões corretas</div>
    <button class="big-btn" onclick="goTab('s-home')">Voltar ao início</button>
    <button class="outline-btn" onclick="location.reload()">Novo simulado</button>
  </div>`;
}

// ---------- STREAK ----------
function updateStreak() {
  const today = new Date().toDateString();
  const last = DB.stats.lastDate;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (last === yesterday) DB.stats.streak = (DB.stats.streak || 0) + 1;
  else DB.stats.streak = 1;
  DB.stats.lastDate = today;
}

// ---------- UPLOAD PDF ----------
async function handlePdf(input) {
  const file = input.files[0];
  if (!file) return;
  const area = document.getElementById('process-area');
  area.innerHTML = `<div class="process-card">
    <div class="process-header">
      <span class="process-header-icon">📄</span>
      <div>
        <div class="process-name">${file.name}</div>
        <div class="process-size">${(file.size/1024).toFixed(0)} KB</div>
      </div>
    </div>
    <div id="steps">
      ${makeStep(1,'active','Lendo PDF...')}
      ${makeStep(2,'wait','Extraindo questões com IA')}
      ${makeStep(3,'wait','Analisando perfil da banca')}
      ${makeStep(4,'wait','Salvando no banco de questões')}
    </div>
  </div>`;

  // Ler PDF
  let text = '';
  try {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        text += tc.items.map(it => it.str).join(' ') + '\n';
      }
    }
  } catch(e) { text = '[PDF sem texto extraível]'; }

  setStep(2);
  const subj = await extractQuestions(text, file.name);
  setStep(3);
  await analyzeBanca(text, area);
  setStep(4);
  DB.pdfs++;
  saveDB();
  setTimeout(() => {
    area.insertAdjacentHTML('beforeend', `
      <div style="background:#e8f5e9;border-radius:12px;padding:12px 14px;font-size:13px;color:#1b5e20;display:flex;align-items:center;gap:8px;margin-top:10px">
        ✅ PDF processado! Questões adicionadas ao banco de estudos.
      </div>`);
    renderHome();
  }, 600);
  input.value = '';
}

function makeStep(n, state, label) {
  const icon = state === 'done' ? '✓' : state === 'active' ? '<div class="spinner" style="width:12px;height:12px"></div>' : n;
  return `<div class="step" id="step-${n}"><div class="step-dot ${state}">${icon}</div>${label}</div>`;
}

function setStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('step-' + i);
    if (!el) continue;
    const dot = el.querySelector('.step-dot');
    if (i < n) { dot.className = 'step-dot done'; dot.textContent = '✓'; }
    else if (i === n) { dot.className = 'step-dot active'; dot.innerHTML = '<div class="spinner" style="width:12px;height:12px"></div>'; }
    else { dot.className = 'step-dot wait'; dot.textContent = i; }
  }
}

async function extractQuestions(text, fname) {
  const subj = guessSubject(fname + ' ' + text);
  const prompt = `Você é especialista em concursos FUNDATEC. Extraia ATÉ 5 questões de múltipla escolha do texto abaixo de uma prova FUNDATEC.

Texto:
${text.substring(0, 3000)}

Se não houver questões claras, crie 3 questões sobre "${subj}" no estilo FUNDATEC.

Responda APENAS JSON:
{"materia":"${subj}","questoes":[{"year":"2023","cargo":"cargo","text":"enunciado","opts":["A","B","C","D","E"],"correct":0}]}`;
  try {
    const raw = await callClaude(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const mat = parsed.materia || subj;
    if (!DB.questions[mat]) DB.questions[mat] = [];
    (parsed.questoes || []).forEach(q => DB.questions[mat].push({ ...q, subj: mat }));
    saveDB();
    return mat;
  } catch(e) { return subj; }
}

async function analyzeBanca(text, area) {
  const prompt = `Analise o trecho de prova FUNDATEC abaixo e identifique 6 características do perfil da banca (temas recorrentes, estilo de cobrança, nível, tipo de questão, legislação cobrada, competência avaliada).

Responda APENAS JSON: {"perfil":["característica 1","característica 2","característica 3","característica 4","característica 5","característica 6"]}

Texto:
${text.substring(0, 2000)}`;
  try {
    const raw = await callClaude(prompt);
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const processCard = area.querySelector('.process-card');
    if (processCard && parsed.perfil) {
      const chips = parsed.perfil.map((p, i) => `<span class="banca-chip ${i < 3 ? 'hi' : ''}">${p}</span>`).join('');
      processCard.insertAdjacentHTML('beforeend', `
        <div class="banca-analysis">
          <div class="banca-analysis-title">Perfil da banca detectado</div>
          <div class="banca-chips">${chips}</div>
        </div>`);
    }
  } catch(e) {}
}

function guessSubject(text) {
  const t = text.toLowerCase();
  if (t.includes('português') || t.includes('língua') || t.includes('gramática')) return 'Português';
  if (t.includes('direito admin') || t.includes('legalidade') || t.includes('ato administrativo')) return 'Direito Administrativo';
  if (t.includes('lógic') || t.includes('silogismo') || t.includes('proposição')) return 'Raciocínio Lógico';
  if (t.includes('informática') || t.includes('excel') || t.includes('windows')) return 'Informática';
  if (t.includes('contabil') || t.includes('balanço') || t.includes('ativo')) return 'Contabilidade';
  if (t.includes('legisl') || t.includes('lei ') || t.includes('constituição')) return 'Legislação';
  return 'Conhecimentos Gerais';
}

// ---------- STATS ----------
function renderStats() {
  const s = DB.stats;
  const pct = s.total > 0 ? Math.round(s.right / s.total * 100) : null;
  document.getElementById('st-pct').textContent = pct !== null ? pct + '%' : '—%';
  document.getElementById('st-label').textContent = s.total > 0
    ? `${s.right} corretas de ${s.total} respondidas`
    : 'Responda questões para ver seu progresso';
  document.getElementById('st-total').textContent = s.total;
  document.getElementById('st-streak2').textContent = s.streak || 0;

  const list = document.getElementById('subj-stats');
  list.innerHTML = '';
  Object.keys(DB.questions).forEach((subj, i) => {
    const bs = s.bySubj[subj] || { total:0, right:0 };
    const p = bs.total > 0 ? Math.round(bs.right / bs.total * 100) : 0;
    const col = SUBJ_COLORS[i % SUBJ_COLORS.length];
    list.innerHTML += `<div class="subj-stat-row">
      <div class="subj-stat-dot" style="background:${col}"></div>
      <div class="subj-stat-name">${subj}</div>
      <div class="subj-stat-bar-wrap"><div class="subj-stat-bar-fill" style="width:${p}%;background:${col}"></div></div>
      <div class="subj-stat-pct">${bs.total > 0 ? p + '%' : '—'}</div>
    </div>`;
  });
}

// ---------- OFFLINE ----------
window.addEventListener('online', () => { document.getElementById('offline-badge').style.display = 'none'; });
window.addEventListener('offline', () => { document.getElementById('offline-badge').style.display = 'inline-block'; });

// ---------- PWA INSTALL ----------
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  renderHome();
});

// ---------- SERVICE WORKER ----------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ---------- INIT ----------
renderHome();
