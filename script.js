const header = document.getElementById('header');
const topBtn = document.getElementById('topBtn');
const menuBtn = document.getElementById('menuBtn');
const mobilePanel = document.getElementById('mobilePanel');
const mobileBackdrop = document.getElementById('mobileBackdrop');
const siteLoader = document.getElementById('siteLoader');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  setTimeout(() => siteLoader.classList.add('hidden'), 350);
});

function updateScrollUI(){
  header.classList.toggle('scrolled', window.scrollY > 35);
  topBtn.classList.toggle('show', window.scrollY > 550);
}
window.addEventListener('scroll', updateScrollUI, {passive:true});
updateScrollUI();

topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

function setMenu(open){
  mobilePanel.classList.toggle('open', open);
  mobileBackdrop.classList.toggle('show', open);
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(!mobilePanel.classList.contains('open')));
mobileBackdrop.addEventListener('click', () => setMenu(false));
mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if(e.key === 'Escape') setMenu(false); });

/* Scroll reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if(entry.isIntersecting){
      entry.target.style.transitionDelay = `${Math.min(i * 45, 260)}ms`;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:.12, rootMargin:'0px 0px -35px 0px'});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Hero counters */
const counters = document.querySelectorAll('[data-count]');
let countersStarted = false;
const counterTarget = document.querySelector('.hero-meta');
if(counterTarget){
  const counterObserver = new IntersectionObserver(entries => {
    if(!entries[0].isIntersecting || countersStarted) return;
    countersStarted = true;
    counters.forEach(counter => {
      const target = Number(counter.dataset.count);
      const start = performance.now();
      const duration = 1100;
      function tick(now){
        const p = Math.min((now-start)/duration, 1);
        const eased = 1 - Math.pow(1-p, 3);
        counter.textContent = `${Math.floor(target*eased)}+`;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    counterObserver.disconnect();
  }, {threshold:.5});
  counterObserver.observe(counterTarget);
}

/* Floating hero particles */
const particleHost = document.getElementById('particles');
if(particleHost && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  for(let i=0;i<22;i++){
    const dot = document.createElement('span');
    dot.className='particle';
    dot.style.left = `${Math.random()*100}%`;
    dot.style.animationDelay = `${Math.random()*8}s`;
    dot.style.animationDuration = `${9+Math.random()*8}s`;
    dot.style.width = `${2+Math.random()*3}px`;
    dot.style.height = dot.style.width;
    particleHost.appendChild(dot);
  }
}

/* Portfolio filtering */
const portfolioData = [
  {title:'Annual Prize Giving', type:'photo', icon:'fa-camera', meta:'Photography'},
  {title:'College Sports Meet', type:'video', icon:'fa-video', meta:'Videography'},
  {title:'Campaign Creative', type:'design', icon:'fa-palette', meta:'Graphic Design'},
  {title:'Cultural Festival', type:'photo', icon:'fa-camera-retro', meta:'Photography'},
  {title:'School Event Highlight', type:'video', icon:'fa-film', meta:'Videography'},
  {title:'Digital Announcement', type:'design', icon:'fa-pen-nib', meta:'Graphic Design'}
];
const portfolioGrid = document.getElementById('portfolioGrid');
function renderPortfolio(filter='all'){
  portfolioGrid.innerHTML='';
  const items = portfolioData.filter(item => filter==='all' || item.type===filter);
  if(!items.length){
    portfolioGrid.innerHTML='<div class="portfolio-empty">No items in this category yet.</div>';
    return;
  }
  items.forEach((item, index) => {
    const article=document.createElement('article');
    article.className='portfolio-item';
    article.style.animationDelay=`${index*70}ms`;
    article.innerHTML=`<div class="portfolio-art"><i class="fa-solid ${item.icon}"></i></div><div class="portfolio-overlay"><div class="portfolio-info"><b>${item.title}</b><span>${item.meta} · Replace demo visual</span></div></div>`;
    portfolioGrid.appendChild(article);
  });
}
renderPortfolio();
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderPortfolio(btn.dataset.filter);
}));

/* Inquiry system */
const inquiryForm = document.getElementById('inquiryForm');
const formMessage = document.getElementById('formMessage');
const ticketPreview = document.getElementById('ticketPreview');
const STORAGE_KEY = 'sanghabodhi_media_unit_ticket';
let ticketCounter = Number(localStorage.getItem(STORAGE_KEY) || 0);
function nextTicket(){
  ticketCounter += 1;
  localStorage.setItem(STORAGE_KEY, String(ticketCounter));
  return `MU-${new Date().getFullYear()}-${String(ticketCounter).padStart(3,'0')}`;
}
ticketPreview.textContent = `MU-${new Date().getFullYear()}-${String(ticketCounter+1).padStart(3,'0')}`;

inquiryForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(inquiryForm).entries());
  const ticket = nextTicket();
  const subject = encodeURIComponent(`Media Unit Inquiry · ${ticket} · ${data.type}`);
  const body = encodeURIComponent([
    `Inquiry ID: ${ticket}`,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'N/A'}`,
    `Inquiry Type: ${data.type}`,
    `Event Date: ${data.date || 'N/A'}`,
    `Priority: ${data.priority || 'Medium'}`,
    '',
    'Project Details:',
    data.message
  ].join('\n'));

  formMessage.textContent = `Inquiry ${ticket} prepared. Your email app will open next.`;
  formMessage.classList.add('show');
  ticketPreview.textContent = ticket;
  window.location.href = `mailto:media@sanghabodhi.lk?subject=${subject}&body=${body}`;
  inquiryForm.reset();
  setTimeout(() => formMessage.classList.remove('show'), 6000);
});

/* Fixed-header anchor scrolling */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if(!target) return;
    event.preventDefault();
    const offset = window.innerWidth <= 760 ? 70 : 82;
    window.scrollTo({top: target.getBoundingClientRect().top + window.scrollY - offset, behavior:'smooth'});
  });
});
