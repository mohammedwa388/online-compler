const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);

document
  .querySelectorAll(
    '.box-hero-text, .box-hero-img, .feature-card, .box-testimonial, .cta-card, .logo-item',
  )
  .forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

const header = document.querySelector('.main-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const deployBtn = document.querySelector('.button-action');

function showToast(msg, type = 'success') {
  document.querySelectorAll('.df-toast').forEach((t) => t.remove());

  const toast = document.createElement('div');
  toast.className = `df-toast df-toast--${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('df-toast--show'));

  setTimeout(() => {
    toast.classList.remove('df-toast--show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// if (deployBtn) {
//   deployBtn.addEventListener('click', () => {
//     deployBtn.textContent = 'Deploying…';
//     deployBtn.disabled = true;

//     setTimeout(() => {
//       showToast('🚀 Deployed successfully to production!', 'success');
//       deployBtn.textContent = 'Deploy';
//       deployBtn.disabled = false;
//     }, 1800);
//   });
// }

document.querySelectorAll('.btn--fill, .btn--cta').forEach((btn) => {
  btn.addEventListener('click', () => {
    showToast('✨ Redirecting to the editor…', 'info');

    setTimeout(() => {
      window.location.href = 'ideBoard.html';
    }, 1200);
  });
});

document.querySelector('.btn--outline')?.addEventListener('click', () => {
  showToast('📄 Opening documentation…', 'info');
});

const notifBtn = document.querySelector('.nav-icon[onclick], .nav-icon');
const allNavIcons = document.querySelectorAll('.nav-icon');

if (allNavIcons[0]) {
  allNavIcons[0].addEventListener('click', () => {
    showToast('🔔 No new notifications', 'info');
  });
}

if (allNavIcons[1]) {
  allNavIcons[1].addEventListener('click', () => {
    showToast('⚙️ Settings coming soon…', 'info');
  });
}

const codeLines = document.querySelectorAll('.code-content p');

function typewriterReveal() {
  codeLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-8px)';
    line.style.transition = `opacity 0.3s ease ${i * 0.12}s, transform 0.3s ease ${i * 0.12}s`;

    setTimeout(
      () => {
        line.style.opacity = '1';
        line.style.transform = 'translateX(0)';
      },
      400 + i * 120,
    );
  });
}

const terminalWindow = document.querySelector('.terminal-window');
if (terminalWindow) {
  const termObs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        typewriterReveal();
        termObs.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  termObs.observe(terminalWindow);
}

const dotRed = document.querySelector('.dot--red');
const dotYellow = document.querySelector('.dot--yellow');
const dotGreen = document.querySelector('.dot--green');

dotRed?.addEventListener('click', () =>
  showToast('❌ Close — not yet!', 'error'),
);
dotYellow?.addEventListener('click', () => {
  terminalWindow?.classList.toggle('minimized');
  showToast('🟡 Minimized', 'info');
});
dotGreen?.addEventListener('click', () => {
  terminalWindow?.classList.toggle('fullscreen-sim');
  showToast('🟢 Fullscreen mode', 'success');
});

document.querySelectorAll('.lang-tags span').forEach((tag) => {
  tag.style.cursor = 'pointer';
  tag.addEventListener('click', () => {
    showToast(`Language selected: ${tag.textContent}`, 'info');

    document
      .querySelectorAll('.lang-tags span')
      .forEach((t) => t.classList.remove('lang-active'));
    tag.classList.add('lang-active');
  });
});

const ctaDesc = document.querySelector('.cta-descrabtion');

function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.textContent = el.textContent.replace(/\d+k\+/, `${current}k+`);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (ctaDesc) {
  const counterObs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(ctaDesc, 100);
        counterObs.disconnect();
      }
    },
    { threshold: 0.5 },
  );
  counterObs.observe(ctaDesc);
}

document.querySelectorAll('.btn-fotter').forEach((link) => {
  link.addEventListener('click', (e) => {
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
      showToast(`📄 ${link.textContent} — coming soon`, 'info');
    }
  });
});

const style = document.createElement('style');
style.textContent = `
  /* Scroll Reveal */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Navbar Shrink */
  .main-header {
    transition: padding 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s;
  }
  .main-header.scrolled {
    padding-block: 6px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.4);
    backdrop-filter: blur(12px);
  }

  /* Toast */
  .df-toast {
    position: fixed;
    bottom: 32px;
    right: 24px;
    background: #1e1e2e;
    border: 1px solid #45475a;
    border-left: 3px solid #a6e3a1;
    color: #cdd6f4;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Consolas', monospace;
    z-index: 9999;
    opacity: 0;
    transform: translateX(16px);
    transition: opacity 0.3s, transform 0.3s;
    max-width: 300px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .df-toast--show { opacity: 1; transform: translateX(0); }
  .df-toast--error { border-left-color: #f38ba8; }
  .df-toast--info  { border-left-color: #89b4fa; }

  /* Lang tag active */
  .lang-tags span { transition: background 0.2s, color 0.2s; }
  .lang-tags .lang-active { background: #89b4fa !important; color: #1e1e2e !important; }

  /* Terminal dot hover */
  .dot { cursor: pointer; transition: transform 0.15s; }
  .dot:hover { transform: scale(1.3); }

  /* Terminal minimized sim */
  .terminal-window.minimized .terminal-body-wrapper,
  .terminal-window.minimized .terminal-footer { display: none; }

  /* Deploy btn disabled */
  .button-action:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Stagger reveal delays for cards */
  .feature-card:nth-child(2) { transition-delay: 0.1s; }
  .feature-card:nth-child(3) { transition-delay: 0.2s; }
  .feature-card:nth-child(4) { transition-delay: 0.3s; }
  .logo-item:nth-child(2) { transition-delay: 0.08s; }
  .logo-item:nth-child(3) { transition-delay: 0.16s; }
  .logo-item:nth-child(4) { transition-delay: 0.24s; }
  .logo-item:nth-child(5) { transition-delay: 0.32s; }
`;
document.head.appendChild(style);
