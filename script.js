/* Chelsea Anichebe Portfolio — site script + CMS content loader */

// ----- Mobile nav -----
const nav = document.querySelector('.nav');
const menu = document.querySelector('.menu-btn');

menu?.addEventListener('click', () => nav.classList.toggle('open'));

document.querySelectorAll('.nav a').forEach((a) =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

// ----- Scroll reveal animations -----
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  // Fallback for older browsers
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}

// ----- Modals (project + resume) -----
const pm = document.getElementById('projectModal');
const pc = document.getElementById('projectContent');
const rm = document.getElementById('resumeModal');

function openResume() {
  rm.classList.add('open');
  rm.setAttribute('aria-hidden', 'false');
}

document.getElementById('resumeOpen')?.addEventListener('click', openResume);
document.getElementById('resumeOpen2')?.addEventListener('click', openResume);

document.addEventListener('click', (e) => {
  if (
    e.target.matches('[data-close]') ||
    e.target === pm ||
    e.target === rm
  ) {
    e.target.closest('.modal')?.classList.remove('open');
    e.target.closest('.modal')?.setAttribute('aria-hidden', 'true');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    pm?.classList.remove('open');
    rm?.classList.remove('open');

    pm?.setAttribute('aria-hidden', 'true');
    rm?.setAttribute('aria-hidden', 'true');
  }
});

// ----- Helpers -----
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sortVisible(items) {
  return (items || [])
    .filter((i) => i.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });

    if (!res.ok) {
      throw new Error(path + ' ' + res.status);
    }

    return await res.json();
  } catch (err) {
    console.warn('Content load failed:', path, err);
    return null;
  }
}

function mediaPath(path) {
  if (!path) return '';

  const p = String(path);

  if (p.startsWith('http') || p.startsWith('/')) {
    return p;
  }

  return '/' + p.replace(/^\//, '');
}

// In-memory project lookup for modal
let projectsById = {};

// ----- Apply site settings -----
function applySettings(s) {
  if (!s) return;

  document.querySelectorAll('[data-bind]').forEach((el) => {
    const key = el.getAttribute('data-bind');

    if (s[key] != null) {
      el.textContent = s[key];
    }
  });

  document.querySelectorAll('[data-bind-html]').forEach((el) => {
    const key = el.getAttribute('data-bind-html');

    if (s[key] != null) {
      el.innerHTML = String(s[key]).replace(/\n/g, '<br>');
    }
  });

  if (s.siteTitle) {
    document.title = s.siteTitle;
  }

  const meta = document.querySelector('meta[name="description"]');

  if (meta && s.siteDescription) {
    meta.setAttribute('content', s.siteDescription);
  }

  const emailLink = document.getElementById('contact-email');

  if (emailLink && s.email) {
    emailLink.href = 'mailto:' + s.email;
  }

  const li = document.getElementById('contact-linkedin');

  if (li && s.linkedin) {
    li.href = s.linkedin;
  }

  const up = document.getElementById('contact-upwork');

  if (up && s.upwork) {
    up.href = s.upwork;
  }

  // ---- Resume download + PDF preview ----
  const resumeDl = document.getElementById('resume-download');
  const resumeBox = document.querySelector(
    '.resume-placeholder, .resume-viewer'
  );

  if (s.resumeFile) {
    const path =
      s.resumeFile.startsWith('http') || s.resumeFile.startsWith('/')
        ? s.resumeFile
        : s.resumeFile.includes('uploads/')
          ? '/' + s.resumeFile.replace(/^\//, '')
          : s.resumeFile;

    if (resumeDl) {
      resumeDl.href = path;
    }

    if (resumeBox) {
      resumeBox.classList.remove('resume-placeholder');
      resumeBox.classList.add('resume-viewer');

      resumeBox.innerHTML = `
        <iframe
          class="resume-pdf"
          src="${escapeHtml(path)}#toolbar=1&navpanes=0"
          title="Chelsea Anichebe Resume"
          loading="lazy"
        ></iframe>

        <img
          class="resume-image"
          src="/uploads/screenshot-146-c.png"
          alt="Chelsea Anichebe Resume"
        >
      `;
    }
  }

  if (Array.isArray(s.aboutParagraphs) && s.aboutParagraphs.length) {
    const box = document.getElementById('about-paragraphs');

    if (box) {
      box.innerHTML = s.aboutParagraphs
        .map((p) =>
          `<p>${escapeHtml(
            typeof p === 'string' ? p : p.paragraph || p
          )}</p>`
        )
        .join('');
    }
  }

  const portrait = document.getElementById('hero-portrait');

  if (portrait && s.heroPhoto) {
    const src = mediaPath(s.heroPhoto);
    const alt = s.heroPhotoAlt || s.brandName || 'Profile photo';

    portrait.classList.add('has-photo');

    portrait.innerHTML = `
      <img
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
      >
    `;
  }

  const aboutImgBox = document.getElementById('about-image');

  if (aboutImgBox && s.aboutImage) {
    const src = mediaPath(s.aboutImage);
    const alt = s.aboutImageAlt || 'About';

    aboutImgBox.classList.add('has-photo');

    aboutImgBox.innerHTML = `
      <img
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
      >
    `;
  }
}

// ----- Renderers -----
function renderServiceStrip(data) {
  const el = document.getElementById('service-strip-grid');

  if (!el || !data) return;

  const items = sortVisible(data.items);

  if (!items.length) return;

  el.innerHTML = items
    .map((i) => `<div>${escapeHtml(i.name)}</div>`)
    .join('');
}

function renderServices(data) {
  const el = document.getElementById('services-list');

  if (!el || !data) return;

  const items = data.items || [];

  if (!items.length) return;

  el.innerHTML = items
    .map(
      (i) =>
        `<article>
          <span>${escapeHtml(i.number)}</span>

          <div>
            <h3>${escapeHtml(i.title)}</h3>
            <p>${escapeHtml(i.description)}</p>
          </div>
        </article>`
    )
    .join('');
}

function renderProjects(data) {
  const el = document.getElementById('project-grid');

  if (!el || !data) return;

  const items = sortVisible(data.items);

  projectsById = {};

  items.forEach((p) => {
    projectsById[p.id] = p;
  });

  if (!items.length) return;

  el.innerHTML = items
    .map((p) => {
      const cover =
        p.image ||
        (Array.isArray(p.images) &&
          p.images[0] &&
          (p.images[0].src || p.images[0]));

      const thumbContent = cover
        ? `<img
            src="${escapeHtml(mediaPath(cover))}"
            alt="${escapeHtml(p.imageAlt || p.title)}"
          >`
        : `<span>${escapeHtml(p.thumbNumber || '')}</span>`;

      const thumbClasses = cover
        ? 'project-thumb has-image'
        : `project-thumb ${escapeHtml(p.thumbClass || 'thumb-1')}`;

      return `
        <article
          class="project-card"
          data-project="${escapeHtml(p.id)}"
        >
          <div class="${thumbClasses}">
            ${thumbContent}
          </div>

          <div class="project-meta">
            <p>${escapeHtml(p.cardLabel || p.category || '')}</p>

            <h3>${escapeHtml(p.title)}</h3>

            <button class="project-link">
              View Project →
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  el.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => {
      const p = projectsById[card.dataset.project];

      if (!p) return;

      // ----- Skills & Deliverables -----
      const skills = (p.skills || [])
        .map((skill) => `<span>${escapeHtml(skill)}</span>`)
        .join('');

      // ----- Tools Used -----
      const tools = (p.tools || [])
        .map((t) => `<span>${escapeHtml(t)}</span>`)
        .join('');

      const gallerySrcs = [];

      if (p.image) {
        gallerySrcs.push(p.image);
      }

      if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
          const src =
            typeof img === 'string'
              ? img
              : img && img.src;

          if (src && !gallerySrcs.includes(src)) {
            gallerySrcs.push(src);
          }
        });
      }

      let galleryHtml;

      if (gallerySrcs.length) {
        const slides = gallerySrcs
          .map(
            (src, i) =>
              `<div
                class="carousel-slide${i === 0 ? ' is-active' : ''}"
                data-index="${i}"
              >
                <img
                  src="${escapeHtml(mediaPath(src))}"
                  alt="${escapeHtml(
                    p.imageAlt || p.title
                  )} ${i + 1}"
                >
              </div>`
          )
          .join('');

        const showNav = gallerySrcs.length > 1;

        galleryHtml = `
          <div
            class="project-carousel"
            data-total="${gallerySrcs.length}"
          >
            <div class="carousel-viewport">

              <div class="carousel-track">
                ${slides}
              </div>

              ${
                showNav
                  ? `
                    <button
                      type="button"
                      class="carousel-btn carousel-prev"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      class="carousel-btn carousel-next"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  `
                  : ''
              }

            </div>

            ${
              showNav
                ? `
                  <p class="carousel-counter">
                    <span class="carousel-current">1</span>/${gallerySrcs.length}
                  </p>
                `
                : ''
            }
          </div>
        `;
      } else {
        galleryHtml = `
          <div class="modal-gallery placeholder-gallery">
            ${escapeHtml(
              p.imageAlt || 'Project image placeholder'
            )}
          </div>
        `;
      }

      pc.innerHTML = `
        <div class="modal-project">

          ${galleryHtml}

          <p class="eyebrow">
            ${escapeHtml(p.category || '')}
          </p>

          <h2>
            ${escapeHtml(p.title)}
          </h2>

          <p>
            ${escapeHtml(p.description || '')}
          </p>

          ${
            skills
              ? `
                <h3>Skills &amp; Deliverables</h3>

                <div class="tool-tags">
                  ${skills}
                </div>
              `
              : ''
          }

          ${
            tools
              ? `
                <h3>Tools Used</h3>

                <div class="tool-tags">
                  ${tools}
                </div>
              `
              : ''
          }

          <p>
            <button
              class="inline-link"
              data-close
            >
              ← Back to Portfolio
            </button>
          </p>

        </div>
      `;

      pm.classList.add('open');
      pm.setAttribute('aria-hidden', 'false');

      initProjectCarousel(pc);
    });
  });
}

function initProjectCarousel(root) {
  const carousel = root.querySelector('.project-carousel');

  if (!carousel) return;

  const slides = Array.from(
    carousel.querySelectorAll('.carousel-slide')
  );

  const total = slides.length;

  if (total <= 1) return;

  let index = 0;

  const currentEl = carousel.querySelector('.carousel-current');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');

  function goTo(nextIndex) {
    index = (nextIndex + total) % total;

    slides.forEach((slide, i) => {
      slide.classList.toggle(
        'is-active',
        i === index
      );
    });

    if (currentEl) {
      currentEl.textContent = String(index + 1);
    }
  }

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(index - 1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(index + 1);
  });

  const onKey = (e) => {
    if (!pm.classList.contains('open')) return;

    if (e.key === 'ArrowRight') {
      goTo(index + 1);
    }

    if (e.key === 'ArrowLeft') {
      goTo(index - 1);
    }
  };

  document.addEventListener('keydown', onKey);
}

function renderFunFacts(data) {
  const el = document.getElementById('fact-grid');

  if (!el || !data) return;

  const items = sortVisible(data.items);

  if (!items.length) return;

  el.innerHTML = items
    .map((f) => {
      const label = escapeHtml(f.label || '')
        .replace(/ /g, '<br>');

      const img = f.image
        ? `
          <div class="fact-img has-photo">
            <img
              src="${escapeHtml(mediaPath(f.image))}"
              alt="${escapeHtml(f.title || '')}"
            >
          </div>
        `
        : `
          <div class="fact-img">
            ${label}
          </div>
        `;

      return `
        <article>
          ${img}

          <h3>
            ${escapeHtml(f.title)}
          </h3>

          <p>
            ${escapeHtml(f.text)}
          </p>
        </article>
      `;
    })
    .join('');
}

function renderTestimonials(data) {
  const el = document.getElementById('testimonial-grid');

  if (!el) return;

  const items = sortVisible(data?.items);

  if (!items.length) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = items
    .map((t, idx) => {
      const preview = escapeHtml(t.quote || '');
      const full = escapeHtml(t.quote || '');

      const photo = t.photo
        ? `
          <img
            class="t-photo"
            src="${escapeHtml(t.photo)}"
            alt="${escapeHtml(t.name || '')}"
          >
        `
        : `
          <div
            class="t-photo placeholder"
            aria-hidden="true"
          >
            ${escapeHtml(
              (t.name || '?')
                .slice(0, 1)
                .toUpperCase()
            )}
          </div>
        `;

      const badge = t.isPlaceholder
        ? `
          <span class="placeholder-badge">
            Placeholder / Demo
          </span>
        `
        : '';

      return `
        <article
          class="testimonial-card"
          data-index="${idx}"
          tabindex="0"
          role="button"
          aria-expanded="false"
        >

          ${badge}

          <div
            class="quote-mark"
            aria-hidden="true"
          >
            “
          </div>

          <p class="quote-preview">
            ${preview}
          </p>

          <p class="quote-full">
            ${full}
          </p>

          <div class="t-meta">

            ${photo}

            <div>
              <p class="t-name">
                ${escapeHtml(t.name || '')}
              </p>

              <p class="t-role">
                ${escapeHtml(t.role || '')}
              </p>
            </div>

          </div>

          <button
            type="button"
            class="t-toggle"
            aria-hidden="true"
          >
            Read more
          </button>

        </article>
      `;
    })
    .join('');

  el.querySelectorAll('.testimonial-card').forEach((card) => {
    const toggle = () => {
      const open = card.classList.toggle('is-expanded');

      card.setAttribute(
        'aria-expanded',
        open ? 'true' : 'false'
      );

      const btn = card.querySelector('.t-toggle');

      if (btn) {
        btn.textContent = open
          ? 'Show less'
          : 'Read more';
      }
    };

    card.addEventListener('click', () => toggle());

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

// ----- Tools -----

// Automatic logo mapping.
//
// CMS-uploaded logos still take priority if a logo
// is added later.
//
// Some tools do not have the exact brand name available
// as a Simple Icons slug, so reliable alternative brand
// icons are used where necessary.
function getToolLogo(name) {
  const logoMap = {
    'Google Workspace':
      'https://cdn.simpleicons.org/google',

    'Microsoft Office':
      'https://cdn.simpleicons.org/microsoft365',

    'ClickUp':
      'https://cdn.simpleicons.org/clickup',

    'Asana':
      'https://cdn.simpleicons.org/asana',

    'Notion':
      'https://cdn.simpleicons.org/notion',

    'Trello':
      'https://cdn.simpleicons.org/trello',

    'Calendly':
      'https://cdn.simpleicons.org/calendly',

    'Slack':
      'https://cdn.simpleicons.org/slack',

    'Canva':
      'https://cdn.simpleicons.org/canva',

    'Zoom':
      'https://cdn.simpleicons.org/zoom'
  };

  return logoMap[name] || '';
}

function renderTools(data) {
  const el = document.getElementById('tool-cloud');

  if (!el || !data) return;

  const items = sortVisible(data.items);

  if (!items.length) return;

  el.innerHTML = items
    .map((t) => {
      const logoSrc = t.logo
        ? mediaPath(t.logo)
        : getToolLogo(t.name);

      const logo = logoSrc
        ? `
          <img
            class="tool-logo"
            src="${escapeHtml(logoSrc)}"
            alt=""
            aria-hidden="true"
            loading="lazy"
            onerror="this.style.display='none'"
          >
        `
        : '';

      return `
        <span class="tool-item">

          ${logo}

          <span class="tool-name">
            ${escapeHtml(t.name)}
          </span>

        </span>
      `;
    })
    .join('');
}

function renderCertificates(data) {
  const el = document.getElementById('cert-grid');

  if (!el || !data) return;

  const items = sortVisible(data.items);

  if (!items.length) return;

  el.innerHTML = items
    .map((c) => {
      const img = c.image
        ? `
          <img
            src="${escapeHtml(mediaPath(c.image))}"
            alt="${escapeHtml(c.title)}"
            style="width:100%;height:100%;object-fit:cover"
          >
        `
        : `
          CERTIFICATE<br>IMAGE
        `;

      return `
        <article class="certificate">

          <div class="cert-placeholder">
            ${img}
          </div>

          <div>

            <p class="cert-label">
              ${escapeHtml(c.label || '')}
            </p>

            <h3>
              ${escapeHtml(c.title || '')}
            </h3>

            <a
              href="${escapeHtml(c.link || '#')}"
              class="inline-link"
              ${
                c.link && c.link !== '#'
                  ? 'target="_blank" rel="noopener"'
                  : ''
              }
            >
              View Certificate →
            </a>

          </div>

        </article>
      `;
    })
    .join('');
}

// ----- Boot -----
(async function init() {
  const [
    settings,
    serviceStrip,
    services,
    projects,
    testimonials,
    funfacts,
    tools,
    certificates,
  ] = await Promise.all([
    loadJSON('content/settings.json'),
    loadJSON('content/service-strip.json'),
    loadJSON('content/services.json'),
    loadJSON('content/projects.json'),
    loadJSON('content/testimonials.json'),
    loadJSON('content/funfacts.json'),
    loadJSON('content/tools.json'),
    loadJSON('content/certificates.json'),
  ]);

  applySettings(settings);
  renderServiceStrip(serviceStrip);
  renderServices(services);
  renderProjects(projects);
  renderFunFacts(funfacts);
  renderTestimonials(testimonials);
  renderTools(tools);
  renderCertificates(certificates);
})();
