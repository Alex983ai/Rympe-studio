/* ───── MOBILE NAV ───── */
function toggleMobNav(){
  const nav=document.getElementById('mobNav');
  const btn=document.getElementById('mobBtn');
  if(!nav||!btn)return;
  const open=nav.classList.toggle('open');
  btn.classList.toggle('open',open);
  btn.setAttribute('aria-expanded',open?'true':'false');
  nav.setAttribute('aria-hidden',open?'false':'true');
  document.body.classList.toggle('mob-nav-open',open);
}
function closeMobNav(){
  const nav=document.getElementById('mobNav');
  const btn=document.getElementById('mobBtn');
  if(!nav||!btn)return;
  nav.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
  nav.setAttribute('aria-hidden','true');
  document.body.classList.remove('mob-nav-open');
}
document.querySelectorAll('.mob-nav a').forEach(a=>a.addEventListener('click',()=>closeMobNav()));

/* ───── LEAD MAGNET ───── */
async function sendLeadMagnet(){
  const n=document.getElementById('lmName').value.trim();
  const e=document.getElementById('lmEmail').value.trim();
  const c=document.getElementById('lmCompany').value.trim();
  if(!n||!e){alert('Please fill in your name and email.');return}

  const payload={
    type:'LEAD_MAGNET_DOWNLOAD',
    name:n,email:e,company:c||'Not specified',
    resource:'CGI Production Cost Guide 2026',
    submitted_at:new Date().toISOString(),
    source:'rympe.com'
  };

  // Show success
  document.getElementById('lmForm').style.display='none';
  document.getElementById('lmSuccess').classList.add('on');

  // Send to Formspree
  if(typeof FORMSPREE_URL!=='undefined' && FORMSPREE_URL && !FORMSPREE_URL.includes('YOUR_FORM_ID')){
    try{await fetch(FORMSPREE_URL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})}catch(e){}
  }

  // Telegram notify
  if(typeof TG_TOKEN!=='undefined' && TG_TOKEN && TG_CHAT_ID){
    const msg=`📥 LEAD MAGNET DOWNLOAD\n\n👤 ${n}\n📧 ${e}\n🏢 ${c||'No company'}\n\n📘 Resource: CGI Production Cost Guide 2026\n⏱ ${new Date().toLocaleString()}`;
    try{await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:TG_CHAT_ID,text:msg})})}catch(e){}
  }

  // Save in localStorage
  try{
    const leads=JSON.parse(localStorage.getItem('rympe_leads')||'[]');
    leads.push(payload);
    localStorage.setItem('rympe_leads',JSON.stringify(leads));
  }catch(e){}
}

/* ───── REFERRAL CALC ───── */
function updateRefCalc(){
  const amt=parseFloat(document.getElementById('refAmount').value)||0;
  const pct=parseFloat(document.getElementById('refTier').value)||0;
  const single=Math.round(amt*pct/100);
  const yearly=single*5;
  document.getElementById('refSingle').textContent='$'+single.toLocaleString();
  document.getElementById('refYear').textContent='$'+yearly.toLocaleString();
  document.getElementById('refBig').textContent='$'+yearly.toLocaleString();
}
const refA=document.getElementById('refAmount');
const refT=document.getElementById('refTier');
if(refA){refA.addEventListener('input',updateRefCalc);refT.addEventListener('change',updateRefCalc);updateRefCalc();}

/* PROMO BANNER */
function closePromo(){
  document.getElementById('promoBanner').classList.add('hidden');
  document.body.classList.remove('has-promo');
  try{localStorage.setItem('rympe_promo_dismissed','1')}catch(e){}
}
try{
  if(localStorage.getItem('rympe_promo_dismissed')){
    document.getElementById('promoBanner').classList.add('hidden');
    document.body.classList.remove('has-promo');
  }
}catch(e){}

/* LOADER */
setTimeout(()=>{document.getElementById('loader').classList.add('gone');document.body.classList.remove('locked')},2000);
setTimeout(()=>{const l=document.getElementById('loader');if(l)l.remove()},3200);

/* ───── LENIS SMOOTH SCROLL ───── */
let lenisInstance=null;
if(typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion:reduce)').matches){
  lenisInstance=new Lenis({
    duration:1.2,
    easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)),
    smoothWheel:true,
    wheelMultiplier:1,
    touchMultiplier:1.5,
  });
  function raf(time){lenisInstance.raf(time);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);
}

/* ───── CUSTOM CURSOR + MAGNETIC BUTTONS ───── */
(function initCursor(){
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  const dot=document.getElementById('cursor-dot');
  const ring=document.getElementById('cursor-ring');
  const txt=document.getElementById('curText');
  let mx=0,my=0,rx=0,ry=0;

  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.left=mx+'px';dot.style.top=my+'px';
    txt.style.left=mx+'px';txt.style.top=my+'px';
  });

  (function loop(){
    rx+=(mx-rx)*.18;ry+=(my-ry)*.18;
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mousedown',()=>ring.classList.add('click'));
  document.addEventListener('mouseup',()=>ring.classList.remove('click'));

  /* Hover effects on interactive elements + magnetic buttons */
  const hoverSelectors='a,button,.wcard,.tier-tab,.svc,.addon,.calc-cell,.calc-addon,.mkt,.faq-q,.testimonial';
  document.querySelectorAll(hoverSelectors).forEach(el=>{
    el.addEventListener('mouseenter',()=>{
      dot.classList.add('hover');
      ring.classList.add('hover');
      const label=el.dataset.curtext;
      if(label){txt.textContent=label;txt.classList.add('on')}
    });
    el.addEventListener('mouseleave',()=>{
      dot.classList.remove('hover');
      ring.classList.remove('hover');
      txt.classList.remove('on');
      el.style.transform='';
    });
  });

  /* Magnetic effect for primary buttons */
  document.querySelectorAll('.btn-p,.nb,.fsub,.calc-btn-p,.td-cta-p').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=(e.clientX-(r.left+r.width/2))*.25;
      const dy=(e.clientY-(r.top+r.height/2))*.25;
      btn.style.transform=`translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave',()=>{
      btn.style.transform='';
    });
  });
})();

/* Add cursor labels to work cards */
document.querySelectorAll('.wcard').forEach(c=>c.dataset.curtext='View Case →');
document.querySelectorAll('.tier-tab').forEach(c=>c.dataset.curtext='Select Tier');


/* ───── I18N ───── */
const I18N = {
  en:{brand:'RYMPE.',nav_work:'Work',nav_pricing:'Pricing',nav_corporate:'Corporate',nav_process:'Process',nav_faq:'FAQ',nav_start:'Start a Project',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'WE MAKE',hero_2:'BRANDS',hero_3:'MOVE.',
      hero_sub:'Cinematic 3D production for Web3 companies, NFT collections, DeFi platforms and tech brands that demand more than ordinary.',
      hero_cta1:'Get a Quote',hero_cta2:'View Work',
      stat_1:'Minimum engagement',stat_2:'Projects delivered',stat_3:'Brief response',stat_4:'Remote · Global',
      sec_01:'01 / Selected Work',work_h1:'RECENT',work_h2:'PROJECTS.',work_intro:'Real client work shipped across Web3, NFT, and product verticals. Every project below was delivered end-to-end — concept through final render.',
      sec_02:'02 / Services & Pricing',price_h1:'CHOOSE YOUR',price_h2:'PRODUCTION TIER.',price_intro:'Three core packages built around how brands actually buy CGI. Click any tier to see scope, deliverables, real-world example, and timeline.',
      sec_03:'03 / Enterprise & Partnerships',corp_h1:'FOR',corp_h2:'CORPORATIONS.',corp_intro:'Long-term partnerships with brands, agencies, and tech companies that need predictable CGI capacity.',
      sec_04:'04 / Production Pipeline',proc_h1:'FIVE PHASES.',proc_h2:'ZERO SURPRISES.',proc_intro:'Every project follows the same proven pipeline. You see deliverables at each phase before we move forward.',
      sec_05:'05 / Common Questions',faq_h1:'QUICK',faq_h2:'ANSWERS.',faq_intro:'Real answers to questions we hear on every discovery call.',
      sec_06:'06 / Get Started',cta_h1:'READY TO BUILD',cta_h2:'SOMETHING',cta_h3:'REMARKABLE?',cta_p:'Send your brief — even a rough one. We\'ll respond within 48 hours with a production plan, recommended tier, and clear quote.',cta_b1:'Send a Brief',cta_b2:'Copy hi@rympe.com'},
  ru:{brand:'RYMPE.',nav_work:'Работы',nav_pricing:'Цены',nav_corporate:'Корпоративно',nav_process:'Процесс',nav_faq:'FAQ',nav_start:'Начать проект',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'МЫ ЗАСТАВЛЯЕМ',hero_2:'БРЕНДЫ',hero_3:'ДВИГАТЬСЯ.',
      hero_sub:'Кинематографичное 3D-производство для Web3, NFT, DeFi и технологичных брендов, которые требуют большего.',
      hero_cta1:'Получить расчёт',hero_cta2:'Смотреть работы',
      stat_1:'Минимальный бюджет',stat_2:'Сданных проектов',stat_3:'Ответ на бриф',stat_4:'Удалённо · Глобально',
      sec_01:'01 / Избранные работы',work_h1:'НЕДАВНИЕ',work_h2:'ПРОЕКТЫ.',work_intro:'Реальные клиентские работы в Web3, NFT и продуктовых нишах. Каждый проект сделан от концепции до финального рендера.',
      sec_02:'02 / Услуги и цены',price_h1:'ВЫБЕРИТЕ ВАШ',price_h2:'УРОВЕНЬ ПРОДАКШНА.',price_intro:'Три основных пакета, основанных на том, как бренды реально покупают CGI. Нажмите любой уровень — увидите объём, результаты, пример и сроки.',
      sec_03:'03 / Корпоративное партнёрство',corp_h1:'ДЛЯ',corp_h2:'КОРПОРАЦИЙ.',corp_intro:'Долгосрочное сотрудничество с брендами, агентствами и tech-компаниями, нуждающимися в стабильной CGI-мощности.',
      sec_04:'04 / Производственный пайплайн',proc_h1:'ПЯТЬ ФАЗ.',proc_h2:'НОЛЬ СЮРПРИЗОВ.',proc_intro:'Каждый проект проходит по проверенному пайплайну. Вы видите результаты на каждой фазе до перехода к следующей.',
      sec_05:'05 / Частые вопросы',faq_h1:'БЫСТРЫЕ',faq_h2:'ОТВЕТЫ.',faq_intro:'Реальные ответы на вопросы, которые мы слышим на каждом первом созвоне.',
      sec_06:'06 / Начать',cta_h1:'ГОТОВЫ СДЕЛАТЬ',cta_h2:'ЧТО-ТО',cta_h3:'ВЫДАЮЩЕЕСЯ?',cta_p:'Пришлите бриф — даже черновик. Мы ответим в течение 48 часов с планом и расчётом.',cta_b1:'Отправить бриф',cta_b2:'Скопировать hi@rympe.com'},
  uk:{brand:'RYMPE.',nav_work:'Роботи',nav_pricing:'Ціни',nav_corporate:'Корпоративно',nav_process:'Процес',nav_faq:'FAQ',nav_start:'Розпочати проєкт',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'МИ ЗМУШУЄМО',hero_2:'БРЕНДИ',hero_3:'РУХАТИСЯ.',
      hero_sub:'Кінематографічне 3D-виробництво для Web3, NFT, DeFi та технологічних брендів, що прагнуть більшого.',
      hero_cta1:'Отримати розрахунок',hero_cta2:'Дивитись роботи',
      stat_1:'Мінімальний бюджет',stat_2:'Зданих проєктів',stat_3:'Відповідь на бриф',stat_4:'Віддалено · Глобально',
      sec_01:'01 / Вибрані роботи',work_h1:'НЕЩОДАВНІ',work_h2:'ПРОЄКТИ.',work_intro:'Реальні клієнтські роботи у Web3, NFT та продуктових нішах. Кожен проєкт виконано від концепції до фінального рендеру.',
      sec_02:'02 / Послуги та ціни',price_h1:'ОБЕРІТЬ ВАШ',price_h2:'РІВЕНЬ ПРОДАКШНУ.',price_intro:'Три основні пакети. Натисніть будь-який рівень — побачите обсяг, результати та терміни.',
      sec_03:'03 / Корпоративне партнерство',corp_h1:'ДЛЯ',corp_h2:'КОРПОРАЦІЙ.',corp_intro:'Довгострокова співпраця з брендами та агенціями, що потребують стабільної CGI-потужності.',
      sec_04:'04 / Виробничий пайплайн',proc_h1:'П\'ЯТЬ ФАЗ.',proc_h2:'НУЛЬ СЮРПРИЗІВ.',proc_intro:'Кожен проєкт проходить перевіреним пайплайном.',
      sec_05:'05 / Часті питання',faq_h1:'ШВИДКІ',faq_h2:'ВІДПОВІДІ.',faq_intro:'Реальні відповіді на запитання з кожного першого дзвінка.',
      sec_06:'06 / Розпочати',cta_h1:'ГОТОВІ СТВОРИТИ',cta_h2:'ЩОСЬ',cta_h3:'ВИДАТНЕ?',cta_p:'Надішліть бриф — навіть чорновий. Відповімо протягом 48 годин.',cta_b1:'Надіслати бриф',cta_b2:'Скопіювати hi@rympe.com'},
  es:{brand:'RYMPE.',nav_work:'Trabajo',nav_pricing:'Precios',nav_corporate:'Corporativo',nav_process:'Proceso',nav_faq:'FAQ',nav_start:'Iniciar Proyecto',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'HACEMOS QUE',hero_2:'LAS MARCAS',hero_3:'SE MUEVAN.',
      hero_sub:'Producción 3D cinematográfica para Web3, NFT, DeFi y marcas tecnológicas que exigen lo extraordinario.',
      hero_cta1:'Solicitar Presupuesto',hero_cta2:'Ver Trabajos',
      stat_1:'Compromiso mínimo',stat_2:'Proyectos entregados',stat_3:'Respuesta al brief',stat_4:'Remoto · Global',
      sec_01:'01 / Trabajo Seleccionado',work_h1:'PROYECTOS',work_h2:'RECIENTES.',work_intro:'Trabajos reales para clientes en Web3, NFT y producto.',
      sec_02:'02 / Servicios y Precios',price_h1:'ELIGE TU',price_h2:'NIVEL DE PRODUCCIÓN.',price_intro:'Tres paquetes principales. Haz clic en cualquier nivel para ver alcance y entregables.',
      sec_03:'03 / Alianzas Corporativas',corp_h1:'PARA',corp_h2:'CORPORACIONES.',corp_intro:'Alianzas a largo plazo con marcas, agencias y empresas tecnológicas.',
      sec_04:'04 / Pipeline de Producción',proc_h1:'CINCO FASES.',proc_h2:'CERO SORPRESAS.',proc_intro:'Cada proyecto sigue el mismo pipeline probado.',
      sec_05:'05 / Preguntas Frecuentes',faq_h1:'RESPUESTAS',faq_h2:'RÁPIDAS.',faq_intro:'Respuestas reales a las preguntas de cada llamada.',
      sec_06:'06 / Empezar',cta_h1:'¿LISTO PARA CREAR',cta_h2:'ALGO',cta_h3:'EXTRAORDINARIO?',cta_p:'Envía tu brief. Responderemos en 48 horas.',cta_b1:'Enviar Brief',cta_b2:'Copiar hi@rympe.com'},
  de:{brand:'RYMPE.',nav_work:'Arbeiten',nav_pricing:'Preise',nav_corporate:'Unternehmen',nav_process:'Prozess',nav_faq:'FAQ',nav_start:'Projekt Starten',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'WIR BRINGEN',hero_2:'MARKEN',hero_3:'IN BEWEGUNG.',
      hero_sub:'Kinematografische 3D-Produktion für Web3, NFT, DeFi und Tech-Marken, die mehr als das Übliche fordern.',
      hero_cta1:'Angebot Anfordern',hero_cta2:'Arbeiten Ansehen',
      stat_1:'Mindestauftrag',stat_2:'Projekte umgesetzt',stat_3:'Brief-Antwort',stat_4:'Remote · Global',
      sec_01:'01 / Ausgewählte Arbeiten',work_h1:'AKTUELLE',work_h2:'PROJEKTE.',work_intro:'Echte Kundenarbeiten in Web3, NFT und Produkt-Bereichen.',
      sec_02:'02 / Leistungen & Preise',price_h1:'WÄHLEN SIE IHRE',price_h2:'PRODUKTIONSSTUFE.',price_intro:'Drei Kernpakete. Klicken Sie auf eine Stufe für Details.',
      sec_03:'03 / Unternehmenspartnerschaften',corp_h1:'FÜR',corp_h2:'UNTERNEHMEN.',corp_intro:'Langfristige Partnerschaften mit Marken, Agenturen und Tech-Unternehmen.',
      sec_04:'04 / Produktions-Pipeline',proc_h1:'FÜNF PHASEN.',proc_h2:'KEINE ÜBERRASCHUNGEN.',proc_intro:'Jedes Projekt folgt derselben bewährten Pipeline.',
      sec_05:'05 / Häufige Fragen',faq_h1:'SCHNELLE',faq_h2:'ANTWORTEN.',faq_intro:'Echte Antworten auf häufige Fragen.',
      sec_06:'06 / Loslegen',cta_h1:'BEREIT FÜR',cta_h2:'ETWAS',cta_h3:'BEMERKENSWERTES?',cta_p:'Senden Sie Ihren Brief. Wir antworten innerhalb von 48 Stunden.',cta_b1:'Brief Senden',cta_b2:'hi@rympe.com kopieren'},
  fr:{brand:'RYMPE.',nav_work:'Travaux',nav_pricing:'Tarifs',nav_corporate:'Entreprise',nav_process:'Processus',nav_faq:'FAQ',nav_start:'Démarrer un Projet',
      hero_badge:'CGI · 3D · Web3 · Motion',hero_1:'NOUS FAISONS',hero_2:'BOUGER',hero_3:'LES MARQUES.',
      hero_sub:'Production 3D cinématographique pour Web3, NFT, DeFi et marques tech qui exigent l\'extraordinaire.',
      hero_cta1:'Obtenir un Devis',hero_cta2:'Voir les Travaux',
      stat_1:'Engagement minimum',stat_2:'Projets livrés',stat_3:'Réponse au brief',stat_4:'À distance · Global',
      sec_01:'01 / Travaux Sélectionnés',work_h1:'PROJETS',work_h2:'RÉCENTS.',work_intro:'Vrais travaux clients en Web3, NFT et produits.',
      sec_02:'02 / Services et Tarifs',price_h1:'CHOISISSEZ VOTRE',price_h2:'NIVEAU DE PRODUCTION.',price_intro:'Trois packages principaux. Cliquez sur un niveau pour les détails.',
      sec_03:'03 / Partenariats Entreprises',corp_h1:'POUR LES',corp_h2:'ENTREPRISES.',corp_intro:'Partenariats à long terme avec marques, agences et entreprises tech.',
      sec_04:'04 / Pipeline de Production',proc_h1:'CINQ PHASES.',proc_h2:'ZÉRO SURPRISE.',proc_intro:'Chaque projet suit le même pipeline éprouvé.',
      sec_05:'05 / Questions Fréquentes',faq_h1:'RÉPONSES',faq_h2:'RAPIDES.',faq_intro:'Vraies réponses aux questions de chaque appel.',
      sec_06:'06 / Commencer',cta_h1:'PRÊT À CRÉER',cta_h2:'QUELQUE CHOSE',cta_h3:'D\'EXCEPTIONNEL?',cta_p:'Envoyez votre brief. Réponse sous 48 heures.',cta_b1:'Envoyer le Brief',cta_b2:'Copier hi@rympe.com'},
  zh:{brand:'RYMPE.',nav_work:'作品',nav_pricing:'价格',nav_corporate:'企业合作',nav_process:'流程',nav_faq:'常见问题',nav_start:'开始项目',
      hero_badge:'CGI · 3D · Web3 · 动态',hero_1:'我们让',hero_2:'品牌',hero_3:'动起来。',
      hero_sub:'为Web3、NFT、DeFi及科技品牌提供电影级3D制作。',
      hero_cta1:'获取报价',hero_cta2:'查看作品',
      stat_1:'最低起价',stat_2:'已交付项目',stat_3:'简报响应',stat_4:'远程·全球',
      sec_01:'01 / 精选作品',work_h1:'近期',work_h2:'项目。',work_intro:'Web3、NFT和产品垂直领域的真实客户案例。',
      sec_02:'02 / 服务与价格',price_h1:'选择您的',price_h2:'制作级别。',price_intro:'三个核心套餐。点击任何级别查看范围、交付物、案例和时间表。',
      sec_03:'03 / 企业合作',corp_h1:'面向',corp_h2:'企业。',corp_intro:'与品牌、代理机构和科技公司建立长期合作。',
      sec_04:'04 / 制作流程',proc_h1:'五个阶段。',proc_h2:'零意外。',proc_intro:'每个项目都遵循同一经过验证的流程。',
      sec_05:'05 / 常见问题',faq_h1:'快速',faq_h2:'答案。',faq_intro:'每次咨询都会被问到的真实问题。',
      sec_06:'06 / 立即开始',cta_h1:'准备好打造',cta_h2:'非凡',cta_h3:'作品了吗？',cta_p:'发送您的简报——即使是粗略的。48小时内回复。',cta_b1:'发送简报',cta_b2:'复制 hi@rympe.com'}
};

let currentLang='en';
function applyLang(lang){
  currentLang=lang;
  document.documentElement.lang=lang;
  const dict=I18N[lang];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.getAttribute('data-i18n');
    if(dict[key])el.textContent=dict[key];
  });
  document.getElementById('langCur').textContent=lang.toUpperCase();
  document.querySelectorAll('.lang-opt').forEach(o=>{
    o.classList.toggle('active',o.dataset.lang===lang);
  });
}

function toggleLang(){document.getElementById('lang').classList.toggle('open')}
document.querySelectorAll('.lang-opt').forEach(o=>{
  o.addEventListener('click',()=>{applyLang(o.dataset.lang);document.getElementById('lang').classList.remove('open')});
});
document.addEventListener('click',e=>{
  if(!e.target.closest('#lang'))document.getElementById('lang').classList.remove('open');
});

/* ───── TIER DATA WITH REAL-WORLD EXAMPLES ───── */
const TIERS=[
  {tag:'Entry Tier · Short-form',name:'Brand Clip',
   desc:'Short-form CGI content for social media, product teasers, and event announcements.',
   example:'<strong>Example use:</strong> A Web3 wallet startup needs a 20-second teaser for their Twitter launch announcement. We deliver a slick 3D animation of their logo morphing into key product features — they post it, get <strong>3x more engagement</strong> than their previous static reveal.',
   price:'$5,000',priceUnit:'starting',
   meta:[{lbl:'Duration',val:'15–30 sec'},{lbl:'Timeline',val:'2–3 weeks'},{lbl:'Revisions',val:'2 rounds'}],
   deliverables:[
     {n:'01',name:'Concept Development',sub:'2 creative directions with moodboards',val:'Phase 1'},
     {n:'02',name:'3D Scene Build',sub:'Cinema 4D modelling & materials',val:'Phase 2'},
     {n:'03',name:'Redshift Rendering',sub:'4K quality, multi-pass output',val:'Phase 3'},
     {n:'04',name:'AE Compositing',sub:'Final composite, grade & polish',val:'Phase 4'},
     {n:'05',name:'Delivery Pack',sub:'H.264 web + ProRes master',val:'Final'}
   ]},
  {tag:'Core Tier · Cinematic',name:'CGI Commercial',
   desc:'Full cinematic production for product launches, brand films, NFT drops, and DeFi platform reveals.',
   example:'<strong>Example use:</strong> A DeFi protocol launches their main platform. We build a 60-second cinematic film showing their isometric "vault city" — used as homepage hero, conference reveal, and ad campaign. Result: <strong>raised $4M in week-1 deposits</strong> with the video as primary marketing asset.',
   price:'$15,000',priceUnit:'starting',
   meta:[{lbl:'Duration',val:'30–90 sec'},{lbl:'Timeline',val:'4–6 weeks'},{lbl:'Revisions',val:'3 rounds'}],
   deliverables:[
     {n:'01',name:'Full Creative Direction',sub:'Strategy, storyboard, style frames',val:'Phase 1'},
     {n:'02',name:'Custom 3D Environments',sub:'Bespoke world & asset creation',val:'Phase 2'},
     {n:'03',name:'Character Animation',sub:'Optional rigged character cycles',val:'Phase 2'},
     {n:'04',name:'VFX & Simulation',sub:'Particles, fluids, dynamics',val:'Phase 3'},
     {n:'05',name:'Sound Design',sub:'Music licensing + custom SFX layer',val:'Phase 4'},
     {n:'06',name:'Multi-format Pack',sub:'16:9, 9:16, 1:1 platform cuts',val:'Final'}
   ]},
  {tag:'Enterprise Tier · Campaign',name:'Campaign Production',
   desc:'Multi-asset campaigns and complex VFX-driven productions for major brand launches.',
   example:'<strong>Example use:</strong> A crypto exchange announces a major rebrand. We produce 1 hero film (90s), 6 platform cutdowns (15s each), and 3 OOH static frames — deployed across TV, billboards, YouTube pre-roll, and social. Result: <strong>+62% brand recognition</strong> in 30 days, measured via independent survey.',
   price:'$35,000',priceUnit:'starting',
   meta:[{lbl:'Scope',val:'Multi-asset'},{lbl:'Timeline',val:'8–14 weeks'},{lbl:'Revisions',val:'Unlimited'}],
   deliverables:[
     {n:'01',name:'Full Pre-Production',sub:'Strategy, scripts, animatic, casting',val:'Phase 1'},
     {n:'02',name:'Hero + Cutdown Assets',sub:'1 main film + 4–6 platform cutdowns',val:'Phase 2'},
     {n:'03',name:'Platform Adaptations',sub:'Optimized for TikTok, IG, YT, web',val:'Phase 3'},
     {n:'04',name:'Dedicated Producer',sub:'Single point of contact, weekly calls',val:'Ongoing'},
     {n:'05',name:'Unlimited Revisions',sub:'Within agreed creative scope',val:'Ongoing'},
     {n:'06',name:'Source File Library',sub:'Full 3D scenes, AE projects, assets',val:'Final'}
   ]},
  {tag:'Retainer · Ongoing Capacity',name:'Monthly Retainer',
   desc:'Dedicated production capacity for brands with ongoing motion needs.',
   example:'<strong>Example use:</strong> An NFT marketplace runs a weekly drop schedule. Instead of hiring an in-house motion team ($15K/month for one mid-level hire), they retain us at $8K/month — getting <strong>4 short clips, 1 mid-length promo, and unlimited motion graphics support</strong>. Faster output, no HR overhead.',
   price:'$8,000',priceUnit:'per month',
   meta:[{lbl:'Capacity',val:'40 hours/mo'},{lbl:'Commit',val:'3-month min.'},{lbl:'Discount',val:'–20%'}],
   deliverables:[
     {n:'01',name:'Dedicated Producer',sub:'Your point of contact, weekly syncs',val:'Always'},
     {n:'02',name:'Priority Pipeline',sub:'Jump the queue on incoming briefs',val:'Always'},
     {n:'03',name:'Brand Asset Library',sub:'Reusable 3D assets across projects',val:'Built'},
     {n:'04',name:'Monthly Roadmap',sub:'Quarterly creative planning sessions',val:'Strategic'},
     {n:'05',name:'Flexible Scope',sub:'Mix short clips, motion graphics, films',val:'Flexible'},
     {n:'06',name:'Reduced Hourly Rate',sub:'Effective 20% saving vs project work',val:'Pricing'}
   ]}
];

const display=document.getElementById('tierDisplay');
function renderTier(i){
  const t=TIERS[i];
  display.classList.add('swap');
  setTimeout(()=>{
    display.innerHTML=`
      <div class="td-left">
        <div>
          <div class="td-tag">${t.tag}</div>
          <div class="td-name">${t.name}</div>
          <div class="td-desc">${t.desc}</div>
          <div class="td-example">
            <div class="td-example-lbl">Real-World Use Case</div>
            ${t.example}
          </div>
          <div class="td-meta">${t.meta.map(m=>`<div class="td-meta-item"><div class="tdm-lbl">${m.lbl}</div><div class="tdm-val">${m.val}</div></div>`).join('')}</div>
        </div>
        <div class="td-cta">
          <button class="td-cta-p" onclick="openM()">Start This Tier</button>
          <button class="td-cta-g" onclick="openM()">Discuss Scope</button>
        </div>
      </div>
      <div class="td-right">
        <div class="td-pricetag">${t.price}<span>${t.priceUnit}</span></div>
        <div class="tdr-label">What's Included</div>
        <ul class="tdr-list">${t.deliverables.map(d=>`<li><span class="num">${d.n}</span><span class="name">${d.name}<small>${d.sub}</small></span><span class="val">${d.val}</span></li>`).join('')}</ul>
      </div>`;
    display.classList.remove('swap');
  },220);
}
renderTier(0);
document.querySelectorAll('.tier-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tier-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    renderTier(+tab.dataset.tier);
  });
});

/* FAQ */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement;
    const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!wasOpen)item.classList.add('open');
  });
});

/* PARTICLES */
const cv=document.getElementById('c'),cx=cv.getContext('2d');
let W,H,P=[];
const rsz=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};
const ip=()=>{
  P=[];
  for(let i=0;i<120;i++){
    const big=Math.random()<.12;
    P.push({x:Math.random()*W,y:Math.random()*H,r:big?(1.2+Math.random()*1.6):(.3+Math.random()*.8),
      vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,
      a:big?(.6+Math.random()*.35):(.15+Math.random()*.3),
      tw:Math.random()*Math.PI*2,twSpd:.02+Math.random()*.035,big});
  }
};
const df=()=>{
  cx.clearRect(0,0,W,H);
  P.forEach(p=>{
    p.tw+=p.twSpd;
    const aa=p.a*(.7+Math.sin(p.tw)*.3);
    cx.beginPath();cx.arc(p.x,p.y,p.r,0,Math.PI*2);
    cx.fillStyle=`rgba(140,190,255,${aa})`;cx.fill();
    if(p.big){
      cx.beginPath();cx.arc(p.x,p.y,p.r*3,0,Math.PI*2);
      const grad=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
      grad.addColorStop(0,`rgba(120,180,255,${aa*.35})`);
      grad.addColorStop(1,'rgba(120,180,255,0)');
      cx.fillStyle=grad;cx.fill();
    }
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
  });
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
    const dx=P[i].x-P[j].x,dy=P[i].y-P[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<130){cx.beginPath();cx.strokeStyle=`rgba(29,127,255,${.06*(1-d/130)})`;cx.lineWidth=.4;cx.moveTo(P[i].x,P[i].y);cx.lineTo(P[j].x,P[j].y);cx.stroke()}
  }
  requestAnimationFrame(df);
};
rsz();ip();df();
addEventListener('resize',()=>{rsz();ip()});

/* REVEAL */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('v');io.unobserve(e.target)}}),{threshold:.06});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ───── QUANTUM SCROLL ───── */
const qContent=document.getElementById('qContent');
const qFlash=document.getElementById('qflash');
let isQuantumScrolling=false;

function quantumScroll(id){
  if(isQuantumScrolling)return;
  if(id==='top'){
    window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  isQuantumScrolling=true;
  qFlash.classList.add('on');
  qContent.classList.remove('quantum-in');
  qContent.classList.add('quantum-out');
  setTimeout(()=>{
    const t=document.getElementById(id);
    if(t){
      const y=t.getBoundingClientRect().top+window.pageYOffset-70;
      window.scrollTo({top:y,behavior:'auto'});
    }
    qContent.classList.remove('quantum-out');
    qContent.classList.add('quantum-in');
    setTimeout(()=>{
      qContent.classList.remove('quantum-in');
      qFlash.classList.remove('on');
      isQuantumScrolling=false;
    },650);
  },550);
}

document.querySelectorAll('[data-scroll]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    quantumScroll(a.dataset.scroll);
  });
});

/* MODAL */
const mo=document.getElementById('mo');
function openM(){mo.classList.add('on');document.body.style.overflow='hidden'}
function clM(){mo.classList.remove('on');document.body.style.overflow=''}
function coO(e){if(e.target===mo)clM()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')clM()});
/* ═══════ FORM SUBMIT — real Formspree + Telegram webhook ═══════ */
/*
  SETUP INSTRUCTIONS:
  1) Go to https://formspree.io — sign up, create new form, copy your endpoint
     and paste below into FORMSPREE_URL (it looks like https://formspree.io/f/xxxxxxx)

  2) For Telegram instant notifications:
     - Open Telegram, search @BotFather, create bot, get TOKEN
     - Search @userinfobot to get your CHAT_ID
     - Replace TG_TOKEN and TG_CHAT_ID below

  If both blank — form still works as fake demo (no real send).
*/
const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';   // <-- paste here
const TG_TOKEN      = '';                                       // <-- paste bot token
const TG_CHAT_ID    = '';                                       // <-- paste chat id

async function sendF(){
  const n=document.getElementById('mn').value.trim();
  const em=document.getElementById('me').value.trim();
  const tp=document.getElementById('mtype').value;
  const br=document.getElementById('mb').value.trim();
  if(!n||!em){alert('Please enter your project name and email.');return}

  const payload={
    project: n,
    email: em,
    type: tp || 'Not specified',
    brief: br || 'No brief provided',
    submitted_at: new Date().toISOString(),
    source: 'rympe.com'
  };

  // Show success immediately (don't block UX)
  document.getElementById('mf').style.display='none';
  document.getElementById('fok').style.display='block';

  // Send to Formspree (silent failure ok)
  if(FORMSPREE_URL && !FORMSPREE_URL.includes('YOUR_FORM_ID')){
    try{
      await fetch(FORMSPREE_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload)
      });
    }catch(e){console.warn('Formspree failed:',e)}
  }

  // Send to Telegram bot (silent failure ok)
  if(TG_TOKEN && TG_CHAT_ID){
    const msg=`🔔 NEW RYMPE LEAD\n\n📌 ${payload.project}\n📧 ${payload.email}\n📁 ${payload.type}\n\n📝 ${payload.brief}\n\n⏱ ${new Date().toLocaleString()}`;
    try{
      await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({chat_id:TG_CHAT_ID, text:msg, parse_mode:'HTML'})
      });
    }catch(e){console.warn('Telegram failed:',e)}
  }

  // Save backup in localStorage so leads aren't lost even if both fail
  try{
    const leads=JSON.parse(localStorage.getItem('rympe_leads')||'[]');
    leads.push(payload);
    localStorage.setItem('rympe_leads',JSON.stringify(leads));
  }catch(e){}

  setTimeout(clM,3200);
  setTimeout(()=>{
    document.getElementById('mf').style.display='';
    document.getElementById('fok').style.display='none';
    ['mn','me','mb'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('mtype').selectedIndex=0;
  },3700);
}
/* ═══════ FLOATING CHAT ═══════ */
function toggleFc(){
  const opts=document.getElementById('fcOpts');
  const trig=document.getElementById('fcTrigger');
  opts.classList.toggle('on');
  trig.classList.toggle('x');
}
function closeFc(){
  document.getElementById('fcOpts').classList.remove('on');
  document.getElementById('fcTrigger').classList.remove('x');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.float-chat'))closeFc();
});

/* ═══════ CALENDLY ═══════ */
const CALENDLY_URL = '';  // <-- paste your https://calendly.com/your-link here

function openCal(){
  const frame=document.getElementById('calFrame');
  if(CALENDLY_URL){
    frame.innerHTML=`<iframe src="${CALENDLY_URL}?hide_event_type_details=1&hide_gdpr_banner=1&background_color=09090e&text_color=cdd0e8&primary_color=1d7fff" loading="lazy"></iframe>`;
  }
  document.getElementById('calBg').classList.add('on');
  document.body.style.overflow='hidden';
}
function closeCal(){
  document.getElementById('calBg').classList.remove('on');
  document.body.style.overflow='';
}
function calOvr(e){if(e.target.id==='calBg')closeCal()}

/* ═══════ CASE STUDIES ═══════ */
const CASES=[
  {
    visual:'vis-dex',
    tag:'01 · DeFi Platform · 2023',
    title:'DEXVAULT — CGI BRAND FILM',
    sub:'A full cinematic 3D commercial for a decentralized finance investment platform — built to drive deposits and conviction.',
    brief:'DexVault was preparing to launch a new vault product targeting sophisticated DeFi users. Their challenge: how do you make a financial protocol feel <strong>tangible, exciting, and trustworthy</strong> all at once — when the product itself is invisible code?',
    challenge:'No physical product to film. Audience that distrusts hype. Tight 4-week timeline before token launch event. We needed to invent a visual world for <strong>"yield farming"</strong> that felt premium, not gimmicky — and ship it before the launch date.',
    approach:'We designed an isometric "vault city" — a futuristic blue-lit metropolis where each building represents a different yield strategy. Crypto assets float between vaults like packages on a logistics network. <strong>Cinema 4D + Redshift</strong> for hero renders, After Effects for compositing, custom-composed score by sound partner.',
    results:[
      {n:'$4M+',l:'Week-1 deposits',d:'Direct attribution to launch campaign'},
      {n:'+340%',l:'Twitter engagement',d:'Vs. previous static reveals'},
      {n:'3.2M',l:'Total views',d:'Across YouTube, Twitter, native'}
    ],
    deliverables:[
      {l:'Final Output',v:'60-sec hero film + 6 cutdowns'},
      {l:'Formats',v:'4K ProRes, 1080p H.264, vertical, square'},
      {l:'Timeline',v:'4 weeks · on budget · on schedule'},
      {l:'Team',v:'CGI lead, 2D animator, sound designer'}
    ]
  },
  {
    visual:'vis-dape',
    tag:'02 · NFT Project · 2023',
    title:'DAPE NFT PROMO',
    sub:'Character-driven 3D commercial for a browser extension app built for NFT holders.',
    brief:'DAPE wanted to launch their NFT-holder-exclusive browser extension with a memorable promo that felt <strong>more like an Adidas commercial than a crypto ad</strong>. The challenge was bringing static PFP characters to life in a way that NFT communities would actually share.',
    challenge:'Three different DAPE characters — each with distinct visual personalities. They needed to feel <strong>cohesive yet individual</strong>, like a real squad. And the entire piece had to work as 30-sec social cuts as well as a long-form launch trailer.',
    approach:'Custom 3D rigs built for each character with full facial expression sets. Stylized commercial setting — moody lighting, urban-night vibes. Camera moves and timing borrowed from streetwear ad playbooks rather than crypto launch tropes.',
    results:[
      {n:'1.3K',l:'Behance appreciations',d:'Featured on Behance gallery'},
      {n:'15K+',l:'Twitter shares',d:'In first 72 hours post-launch'},
      {n:'+62%',l:'Wallet installs',d:'Vs. pre-launch baseline'}
    ],
    deliverables:[
      {l:'Final Output',v:'45-sec hero promo + 3 character cuts'},
      {l:'Characters',v:'3 fully-rigged 3D characters'},
      {l:'Timeline',v:'5 weeks including character design'},
      {l:'Stack',v:'Cinema 4D + Redshift + After Effects'}
    ]
  },
  {
    visual:'vis-prod',
    tag:'03 · Product Animation Service',
    title:'PRODUCT ANIMATION REELS',
    sub:'Ongoing service line — photorealistic CGI for physical and digital products starting at $999 per asset.',
    brief:'Our most-requested service: small and medium brands need <strong>premium product visualization</strong> but can\'t justify hiring a full agency. We built a productized service to deliver photoreal product CGI at startup prices.',
    challenge:'Make photoreal CGI <strong>affordable without compromising quality</strong>. Standardize the pipeline enough to deliver in 1 week, but keep the output indistinguishable from a $20K agency render.',
    approach:'Pre-built lighting rigs, material library, and camera presets. Client provides product references → we deliver in 7 days. Add-ons stack on top: animation, multiple angles, environments. Average client comes back 3× per year.',
    results:[
      {n:'$999',l:'Entry price',d:'Per still product render'},
      {n:'7 days',l:'Average delivery',d:'From brief to final asset'},
      {n:'3.4×',l:'Repeat rate',d:'Average clients per year'}
    ],
    deliverables:[
      {l:'Base Tier',v:'1 photoreal still render, 4K'},
      {l:'Animation Add-on',v:'+ 5-10 sec animation loop'},
      {l:'Multi-angle Pack',v:'4 hero angles, same model'},
      {l:'Source Files',v:'Available as add-on'}
    ]
  },
  {
    visual:'vis-ites',
    tag:'04 · Retail / Commercial · 2022',
    title:'ITES STORE COMMERCIAL',
    sub:'A fully CGI branded retail environment used for in-store advertising and brand reveal.',
    brief:'ITES needed to showcase a new branded retail concept <strong>before any physical store existed</strong>. The client wanted to use the commercial for franchise pitches and investor decks — the entire store had to feel real enough to sell the concept.',
    challenge:'Build an entire retail environment in CGI — store layout, product staging, dramatic lighting, ambient details. Make it look like a high-end <strong>commercial shoot</strong>, not a 3D render.',
    approach:'Dramatic warm lighting setup mimicking late-evening retail commercials. Photoreal product staging with brand-accurate textures. Cinematic camera moves: dolly-ins, slow reveals, hero close-ups. Final output cut for both 16:9 broadcast and 9:16 social.',
    results:[
      {n:'12',l:'Franchise interest',d:'Inquiries within 30 days of reveal'},
      {n:'$2.1M',l:'Pre-launch investment',d:'Secured using the film'},
      {n:'4',l:'Stores opened',d:'Within 8 months of commercial'}
    ],
    deliverables:[
      {l:'Final Output',v:'90-sec commercial + still frames'},
      {l:'Use Cases',v:'Investor pitch + franchise sales'},
      {l:'Timeline',v:'6 weeks end-to-end'},
      {l:'Style',v:'Photoreal · cinematic · warm'}
    ]
  },
  {
    visual:'vis-pencil',
    tag:'05 · Creative / Product · 2022',
    title:'PRISMA PENCIL SERIES',
    sub:'Vivid product visualization for a creative stationery line — reimagining everyday objects as art pieces.',
    brief:'A stationery brand wanted to launch their premium pencil line with a campaign that <strong>didn\'t look like another office-supply ad</strong>. The pencils needed to feel like collectible objects, not commodity products.',
    challenge:'Make pencils interesting. Seriously. Pencils. The brand wanted a campaign that would <strong>justify their premium pricing</strong> against $2 pencils on Amazon.',
    approach:'Hyper-saturated color palette borrowed from contemporary art galleries. Dramatic studio lighting that turned each pencil into a sculptural object. Macro renders showing material details — paint texture, graphite tip, brand stamp.',
    results:[
      {n:'+85%',l:'Direct sales',d:'In first month post-campaign'},
      {n:'5×',l:'Average order value',d:'Vs. previous campaigns'},
      {n:'48',l:'Press features',d:'Design blogs and magazines'}
    ],
    deliverables:[
      {l:'Hero Renders',v:'8 individual product hero images'},
      {l:'Animation',v:'Optional 5-sec loop per product'},
      {l:'Formats',v:'Print, digital, social, OOH'},
      {l:'Style',v:'Vivid · macro · gallery-quality'}
    ]
  }
];

function openCase(idx){
  const c=CASES[idx];
  const html=`
    <div class="cs-hero wcard-visual ${c.visual}">
      <div class="wcard-3d" style="opacity:.4">
        <div class="dex-blk h2"></div>
      </div>
      <div class="cs-hero-content">
        <div class="cs-hero-tag">${c.tag}</div>
        <div class="cs-hero-title">${c.title}</div>
        <div class="cs-hero-sub">${c.sub}</div>
      </div>
    </div>
    <div class="cs-body">
      <div class="cs-section">
        <div class="cs-section-lbl">The Brief</div>
        <div class="cs-section-title">What the client needed</div>
        <div class="cs-section-text">${c.brief}</div>
      </div>
      <div class="cs-section">
        <div class="cs-section-lbl">The Challenge</div>
        <div class="cs-section-title">Why this wasn't easy</div>
        <div class="cs-section-text">${c.challenge}</div>
      </div>
      <div class="cs-section">
        <div class="cs-section-lbl">Our Approach</div>
        <div class="cs-section-title">How we delivered</div>
        <div class="cs-section-text">${c.approach}</div>
      </div>
      <div class="cs-section">
        <div class="cs-section-lbl">The Results</div>
        <div class="cs-section-title">What happened next</div>
        <div class="cs-results">
          ${c.results.map(r=>`
            <div class="cs-res">
              <div class="cs-res-n">${r.n}</div>
              <div class="cs-res-l">${r.l}</div>
              <div class="cs-res-d">${r.d}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="cs-section">
        <div class="cs-section-lbl">Scope & Deliverables</div>
        <div class="cs-section-title">What was shipped</div>
        <div class="cs-deliv-grid">
          ${c.deliverables.map(d=>`
            <div class="cs-deliv">
              <div class="cs-deliv-lbl">${d.l}</div>
              <div class="cs-deliv-val">${d.v}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="cs-cta">
      <button class="td-cta-p" onclick="closeCase();openCalc()">Start a Similar Project →</button>
      <button class="td-cta-g" onclick="closeCase()">Close</button>
    </div>
  `;
  document.getElementById('csContent').innerHTML=html;
  document.getElementById('csBg').classList.add('on');
  document.body.style.overflow='hidden';
}

function closeCase(){
  document.getElementById('csBg').classList.remove('on');
  document.body.style.overflow='';
}
function csOvr(e){if(e.target.id==='csBg')closeCase()}

/* ═══════ SHOWREEL ROTATION (hero background) ═══════ */
const srFrames=document.querySelectorAll('.showreel-bg .sr-frame');
let srIdx=0;
setInterval(()=>{
  srFrames[srIdx].classList.remove('active');
  srIdx=(srIdx+1)%srFrames.length;
  srFrames[srIdx].classList.add('active');
},3500);

/* ═══════ FULL-SCREEN SHOWREEL PLAYER ═══════ */
const srOverlay=document.getElementById('srOverlay');
const srStageFrames=document.querySelectorAll('#srStage .sr-player-frame');
const srProgress=document.getElementById('srProgress');
let srPlayerIdx=0;
let srInterval=null;
let srProgressInterval=null;
const SR_DURATION=8000;

function openReel(){
  srOverlay.classList.add('on');
  document.body.style.overflow='hidden';
  srPlayerIdx=0;
  srStageFrames.forEach((f,i)=>f.classList.toggle('active',i===0));
  startReel();
}

function startReel(){
  let elapsed=0;
  srProgress.style.width='0%';
  srProgressInterval=setInterval(()=>{
    elapsed+=100;
    const pct=(elapsed/(SR_DURATION*srStageFrames.length))*100;
    srProgress.style.width=Math.min(pct,100)+'%';
  },100);

  srInterval=setInterval(()=>{
    srStageFrames[srPlayerIdx].classList.remove('active');
    srPlayerIdx=(srPlayerIdx+1)%srStageFrames.length;
    srStageFrames[srPlayerIdx].classList.add('active');
    if(srPlayerIdx===0){
      srProgress.style.width='0%';
      // restart on loop
    }
  },SR_DURATION);
}

function closeReel(){
  srOverlay.classList.remove('on');
  document.body.style.overflow='';
  clearInterval(srInterval);
  clearInterval(srProgressInterval);
}
function srOvr(e){if(e.target.id==='srOverlay')closeReel()}

function copyMail(){
  navigator.clipboard.writeText('hi@rympe.com').then(()=>{
    const btn=event.target.closest('button');
    if(!btn)return;
    const old=btn.textContent;
    btn.textContent='✓ Copied';
    setTimeout(()=>{btn.textContent=old},1800);
  });
}

/* ═══════ CALCULATOR LOGIC ═══════ */
const CALC_TIERS=[
  {id:'clip',     name:'Brand Clip',          tag:'Entry',      desc:'Short-form CGI · 15–30 sec · 2–3 weeks',                 price:5000,  unit:'starting'},
  {id:'comm',     name:'CGI Commercial',      tag:'Core',       desc:'Cinematic film · 30–90 sec · 4–6 weeks',                 price:15000, unit:'starting'},
  {id:'campaign', name:'Campaign Production', tag:'Enterprise', desc:'Multi-asset campaign · 8–14 weeks · unlimited revisions',price:35000, unit:'starting'},
  {id:'retainer', name:'Monthly Retainer',    tag:'Retainer',   desc:'40h/mo dedicated capacity · 3-month minimum',            price:8000,  unit:'per month'}
];

const CALC_ADDONS=[
  {id:'character', name:'Custom 3D Character',  desc:'Rigged character + 1 min animation cycles',     price:3500, unit:'per character', qty:true,  max:5},
  {id:'lottie',    name:'Web Animation Export', desc:'Rive / Lottie files from 3D for web & mobile',  price:1200, unit:'per asset pack',qty:true,  max:5},
  {id:'music',     name:'Original Music & SFX', desc:'Custom score + full sound design layer',        price:2000, unit:'per track',     qty:true,  max:3},
  {id:'source',    name:'Source Files Pack',    desc:'Full 3D scenes, AE projects, asset library',    price:1500, unit:'one-time',      qty:false}
];

const calcState={tier:null, addons:{}, rush:false};

/* CURRENCY */
const CURR={
  USD:{sym:'$',rate:1,after:false},
  EUR:{sym:'€',rate:0.93,after:false},
  UAH:{sym:'₴',rate:42,after:true},
  GBP:{sym:'£',rate:0.79,after:false}
};
let currentCurr='USD';
function fmt(n){
  const c=CURR[currentCurr];
  const v=Math.round(n*c.rate);
  const s=v.toLocaleString();
  return c.after?`${s} ${c.sym}`:`${c.sym}${s}`;
}
document.querySelectorAll('.curr-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.curr-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentCurr=b.dataset.curr;
    renderCalcTiers();
    renderCalcAddons();
    // re-mark selections
    if(calcState.tier){
      const cell=document.querySelector(`[data-tier="${calcState.tier}"]`);
      if(cell)cell.classList.add('sel');
    }
    for(const aid in calcState.addons){
      const cell=document.querySelector(`[data-addon="${aid}"]`);
      if(cell){
        cell.classList.add('sel');
        const qty=cell.querySelector('.calc-qty');
        if(qty){
          qty.style.display='flex';
          qty.querySelector('.calc-qty-val').textContent=calcState.addons[aid].qty;
        }
      }
    }
    updateCalc();
  });
});

/* RENDER TIERS */
function renderCalcTiers(){
  const wrap=document.getElementById('calcTiers');
  wrap.innerHTML=CALC_TIERS.map(t=>`
    <div class="calc-cell" data-tier="${t.id}">
      <div class="calc-cell-tag">
        <span>${t.tag}</span>
        <span class="check">✓</span>
      </div>
      <div class="calc-cell-name">${t.name}</div>
      <div class="calc-cell-desc">${t.desc}</div>
      <div class="calc-cell-price">
        <span class="calc-cell-price-val">${fmt(t.price)}</span>
        <span class="calc-cell-price-unit">${t.unit}</span>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('.calc-cell').forEach(c=>{
    c.addEventListener('click',()=>{
      calcState.tier=c.dataset.tier;
      wrap.querySelectorAll('.calc-cell').forEach(x=>x.classList.remove('sel'));
      c.classList.add('sel');
      updateCalc();
    });
  });
}

/* RENDER ADDONS */
function renderCalcAddons(){
  const wrap=document.getElementById('calcAddons');
  wrap.innerHTML=CALC_ADDONS.map(a=>`
    <div class="calc-addon" data-addon="${a.id}">
      <div class="calc-addon-check"></div>
      <div class="calc-addon-body">
        <div class="calc-addon-name">${a.name}</div>
        <div class="calc-addon-desc">${a.desc}</div>
        <div class="calc-addon-pr">+ ${fmt(a.price)} <span class="calc-addon-pr-unit">${a.unit}</span></div>
        ${a.qty?`
        <div class="calc-qty" style="display:none">
          <button class="calc-qty-btn" data-act="minus">−</button>
          <span class="calc-qty-val">1</span>
          <button class="calc-qty-btn" data-act="plus">+</button>
        </div>`:''}
      </div>
    </div>
  `).join('');

  wrap.querySelectorAll('.calc-addon').forEach(el=>{
    const id=el.dataset.addon;
    const addon=CALC_ADDONS.find(a=>a.id===id);
    el.addEventListener('click',e=>{
      if(e.target.classList.contains('calc-qty-btn'))return;
      if(calcState.addons[id]){
        delete calcState.addons[id];
        el.classList.remove('sel');
        if(addon.qty){
          el.querySelector('.calc-qty').style.display='none';
          el.querySelector('.calc-qty-val').textContent='1';
        }
      }else{
        calcState.addons[id]={qty:1};
        el.classList.add('sel');
        if(addon.qty)el.querySelector('.calc-qty').style.display='flex';
      }
      updateCalc();
    });

    if(addon.qty){
      el.querySelectorAll('.calc-qty-btn').forEach(b=>{
        b.addEventListener('click',e=>{
          e.stopPropagation();
          if(!calcState.addons[id])return;
          const valEl=el.querySelector('.calc-qty-val');
          let q=calcState.addons[id].qty;
          if(b.dataset.act==='plus'&&q<addon.max)q++;
          if(b.dataset.act==='minus'&&q>1)q--;
          calcState.addons[id].qty=q;
          valEl.textContent=q;
          updateCalc();
        });
      });
    }
  });
}

/* RUSH TOGGLE */
document.getElementById('calcRush').addEventListener('click',function(){
  calcState.rush=!calcState.rush;
  this.classList.toggle('sel',calcState.rush);
  updateCalc();
});

/* UPDATE */
function updateCalc(){
  const list=document.getElementById('calcList');
  const empty=document.getElementById('calcEmpty');
  const submit=document.getElementById('calcSubmit');

  let subtotal=0;
  let lines=[];

  if(calcState.tier){
    const t=CALC_TIERS.find(x=>x.id===calcState.tier);
    subtotal+=t.price;
    lines.push({name:t.name,meta:t.tag+' tier',val:t.price});
  }

  for(const aid in calcState.addons){
    const a=CALC_ADDONS.find(x=>x.id===aid);
    const q=calcState.addons[aid].qty;
    const total=a.price*q;
    subtotal+=total;
    lines.push({
      name:a.name,
      meta: a.qty?`${q} × ${fmt(a.price)}`:'One-time add-on',
      val:total
    });
  }

  let rushAmount=0;
  if(calcState.rush && calcState.tier){
    const t=CALC_TIERS.find(x=>x.id===calcState.tier);
    rushAmount=Math.round(t.price*0.3);
  }

  const total=subtotal+rushAmount;

  if(lines.length===0){
    empty.style.display='block';
    list.innerHTML='';
    list.appendChild(empty);
    submit.disabled=true;
  }else{
    list.innerHTML=lines.map(l=>`
      <div class="calc-line">
        <div>
          <div class="calc-line-name">${l.name}</div>
          <div class="calc-line-meta">${l.meta}</div>
        </div>
        <div class="calc-line-val">${fmt(l.val)}</div>
      </div>
    `).join('');
    submit.disabled=false;
  }

  document.getElementById('calcSubtotal').textContent=fmt(subtotal);
  document.getElementById('calcTotal').textContent=fmt(total);

  const rushRow=document.getElementById('calcRushRow');
  if(rushAmount>0){
    rushRow.style.display='flex';
    document.getElementById('calcRushVal').textContent='+ '+fmt(rushAmount);
  }else{
    rushRow.style.display='none';
  }

  const t=calcState.tier?CALC_TIERS.find(x=>x.id===calcState.tier):null;
  document.getElementById('calcUnit').textContent=
    (t&&t.id==='retainer')?'/ month':(total>0?'estimate':'');
}

/* RESET */
function resetCalc(){
  calcState.tier=null;
  calcState.addons={};
  calcState.rush=false;
  document.querySelectorAll('#calcTiers .calc-cell').forEach(c=>c.classList.remove('sel'));
  document.querySelectorAll('#calcAddons .calc-addon').forEach(c=>{
    c.classList.remove('sel');
    const qty=c.querySelector('.calc-qty');
    if(qty){qty.style.display='none';qty.querySelector('.calc-qty-val').textContent='1'}
  });
  document.getElementById('calcRush').classList.remove('sel');
  updateCalc();
}

/* OPEN / CLOSE */
function openCalc(){
  document.getElementById('calcBg').classList.add('on');
  document.body.style.overflow='hidden';
}
function closeCalc(){
  document.getElementById('calcBg').classList.remove('on');
  document.body.style.overflow='';
}
function calcOvr(e){
  if(e.target.id==='calcBg')closeCalc();
}

/* SUBMIT - hand off to brief form with pre-filled data */
function sendCalc(){
  let summary='';
  if(calcState.tier){
    const t=CALC_TIERS.find(x=>x.id===calcState.tier);
    summary+=`Tier: ${t.name} ($${t.price.toLocaleString()})\n`;
  }
  for(const aid in calcState.addons){
    const a=CALC_ADDONS.find(x=>x.id===aid);
    const q=calcState.addons[aid].qty;
    summary+=`+ ${a.name}${a.qty?' ×'+q:''} ($${(a.price*q).toLocaleString()})\n`;
  }
  if(calcState.rush)summary+='+ Rush Delivery (+30%)\n';

  const total=document.getElementById('calcTotal').textContent;
  summary+=`\nEstimated total: ${total}`;

  closeCalc();
  setTimeout(()=>{
    openM();
    const mb=document.getElementById('mb');
    if(mb)mb.value=`Project quote from calculator:\n\n${summary}\n\n--- Additional details ---\n`;
    const mtype=document.getElementById('mtype');
    if(mtype && calcState.tier){
      const map={clip:'Brand Clip ($5K+)',comm:'CGI Commercial ($15K+)',campaign:'Campaign Production ($35K+)',retainer:'Monthly Retainer ($8K/mo)'};
      const target=map[calcState.tier];
      for(let i=0;i<mtype.options.length;i++){
        if(mtype.options[i].text===target){mtype.selectedIndex=i;break}
      }
    }
  },300);
}

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobNav();closeCalc();closeCase();closeReel();closeCal();clM();closeFc()}});

/* INIT */
renderCalcTiers();
renderCalcAddons();
updateCalc();
