/* ========================================
   MAIN JAVASCRIPT - Dynamic Motion
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initProjectModal();
});

/* ---- Scroll Animations (Intersection Observer) ---- */

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (!animatedElements.length) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show all elements immediately if user prefers reduced motion
    animatedElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optionally unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

/* ---- Header Scroll Behavior ---- */

function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  function updateHeader() {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class for background
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Initial check
  updateHeader();
}

/* ---- Mobile Menu ---- */

function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navOverlay = document.getElementById('navOverlay');

  if (!menuToggle || !mainNav) return;

  function toggleMenu() {
    const isOpen = mainNav.classList.contains('is-open');

    menuToggle.classList.toggle('is-open');
    mainNav.classList.toggle('is-open');

    if (navOverlay) {
      navOverlay.classList.toggle('is-visible');
    }

    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';

    // Update ARIA
    menuToggle.setAttribute('aria-expanded', !isOpen);
  }

  function closeMenu() {
    menuToggle.classList.remove('is-open');
    mainNav.classList.remove('is-open');
    if (navOverlay) {
      navOverlay.classList.remove('is-visible');
    }
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', toggleMenu);

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Close menu when clicking nav links
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && mainNav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ---- Smooth Scroll for Anchor Links ---- */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#"
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerHeight = document.getElementById('header')?.offsetHeight || 0;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without jumping
      history.pushState(null, null, href);
    });
  });
}

/* ---- Active Navigation Link ---- */

function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__link');

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('header__link--active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('header__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveLink);
  }, { passive: true });

  updateActiveLink();
}

/* ---- Parallax Effect (Optional) ---- */

function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');

  if (!parallaxElements.length) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  function updateParallax() {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach(el => {
      const speed = el.dataset.parallax || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateParallax);
  }, { passive: true });
}

/* ---- Form Handling (Basic) ---- */

function initContactForm() {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Simple loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual endpoint)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      submitBtn.textContent = 'Sent!';
      form.reset();

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);

    } catch (error) {
      submitBtn.textContent = 'Error. Try again.';
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);
    }
  });
}

// Initialize additional features
initActiveNavLink();
initEmailObfuscation();
initStravaStats();

/* ---- Project Modal ---- */

function initProjectModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const modalImage = document.getElementById('modalImage');
  const modalTags = document.getElementById('modalTags');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const closeBtn = modal.querySelector('.modal__close');
  const backdrop = modal.querySelector('.modal__backdrop');

  // Project data
  const projects = {
    aegis: {
      title: 'Aegis',
      tags: ['IoT', 'Smart Home'],
      image: 'assets/aegis-hardware.png',
      description: `
        <p>Aegis is a smart electricity monitoring system designed to give homeowners visibility and control over their power usage.</p>
        <p><strong>Technical Details:</strong></p>
        <ul>
          <li>ESP32 microcontroller as the main processing unit</li>
          <li>Current sensors to monitor electricity consumption</li>
          <li>Temperature and humidity sensors for environmental data</li>
          <li>MQTT protocol for publish/subscribe messaging</li>
          <li>Raspberry Pi as central hub running the thermostat logic</li>
          <li>Web interface for data visualization and controls</li>
          <li>Integration with furnace and AC for HVAC control</li>
        </ul>
      `
    },
    e46: {
      title: 'E46 Turbo Build',
      tags: ['Automotive', 'Fabrication'],
      image: null,
      description: `
        <p>My 2002 BMW 325ci that I've been building from the ground up. Started as an automatic daily driver, now it's a turbocharged drift car.</p>
        <p><strong>Modifications:</strong></p>
        <ul>
          <li>Manual swapped with a 5-speed from an E46</li>
          <li>Lightened flywheel with stronger clutch and pressure plate</li>
          <li>Custom exhaust header and downpipe</li>
          <li>GT35-clone turbocharger</li>
          <li>Electronic boost control</li>
          <li>Wideband O2 sensor</li>
          <li>Custom MS43 (ECU) tuning</li>
          <li>MAF from an Audi RS4</li>
          <li>M50 manifold conversion</li>
          <li>Freshly built 3.0L engine with thicker head gasket and cutting rings</li>
          <li>Welded differential (3.46 ratio) for drifting</li>
        </ul>
      `
    },
    prosthetech: {
      title: 'ProstheTech',
      tags: ['Hackathon', 'Hardware'],
      image: 'assets/hard-hack-edited.webp',
      description: `
        <p>A prosthetic device project built at HARD Hack 2023, where my team and I came in as overall runner-up.</p>
        <p>HARD Hack is a hardware-focused hackathon hosted by UCSD students, challenging teams to build physical devices in a limited time.</p>
        <p><a href="https://github.com/ymorsi7/ProstheTech" target="_blank">View on GitHub</a></p>
      `
    },
    ece148: {
      title: 'Autonomous Car',
      tags: ['Autonomous Vehicles', 'Robotics'],
      image: null,
      description: `
        <p>Autonomous vehicle project for ECE 148 (Introduction to Autonomous Vehicles) at UC San Diego.</p>
        <p>I worked on the hardware platform and helped get the car driving autonomously using computer vision and control systems.</p>
      `
    },
    tritoncrit: {
      title: 'Triton Crit',
      tags: ['Event Planning', 'Cycling'],
      image: 'assets/triton_crit.jpg',
      description: `
        <p>Organized and hosted a criterium cycling race in San Diego for the UCSD Cycling Team.</p>
        <p><strong>Responsibilities:</strong></p>
        <ul>
          <li>Secured venue and submitted permit application with City of San Diego (2+ months in advance)</li>
          <li>Obtained USAC (USA Cycling) permit and sanctioning</li>
          <li>Coordinated with police for cost estimates and required safety equipment</li>
          <li>Managed special event insurance requirements</li>
          <li>Conducted business outreach - distributed flyers and coordinated access for businesses open on race day</li>
          <li>Handled race day logistics and safety coordination</li>
        </ul>
      `
    }
  };

  function openModal(projectId) {
    const project = projects[projectId];
    if (!project) return;

    // Set content
    modalTitle.textContent = project.title;
    modalTags.innerHTML = project.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    modalDescription.innerHTML = project.description;

    if (project.image) {
      modalImage.innerHTML = `<img src="${project.image}" alt="${project.title}">`;
    } else {
      modalImage.innerHTML = `<span class="modal__image-placeholder">${project.title.substring(0, 3).toUpperCase()}</span>`;
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Event listeners - make entire card clickable
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(card.dataset.project);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* ---- Email Obfuscation ---- */

function initEmailObfuscation() {
  const emailLink = document.getElementById('emailLink');
  if (!emailLink) return;

  // Split up to avoid scrapers
  const user = 'dorlando';
  const domain = 'ucsd';
  const tld = 'edu';

  emailLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'mailto:' + user + '@' + domain + '.' + tld;
  });
}

/* ---- Strava Stats ---- */

function initStravaStats() {
  // Update this URL to your deployed Cloudflare Worker
  const STRAVA_WORKER_URL = 'https://strava-stats.domvorlando.workers.dev';

  const statElements = {
    rides: document.getElementById('statRides'),
    miles: document.getElementById('statMiles'),
    elevation: document.getElementById('statElevation'),
    hours: document.getElementById('statHours'),
    koms: document.getElementById('statKoms'),
    careerMiles: document.getElementById('statCareerMiles'),
  };

  // Check if all elements exist
  if (!Object.values(statElements).every(el => el)) return;

  async function fetchStats() {
    try {
      const response = await fetch(`${STRAVA_WORKER_URL}/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();

      // Animate the numbers
      animateNumber(statElements.rides, data.ytd_ride.count);
      animateNumber(statElements.miles, data.ytd_ride.distance_miles, ',');
      animateNumber(statElements.elevation, data.ytd_ride.elevation_feet, ',');
      animateNumber(statElements.hours, data.ytd_ride.moving_time_hours);
      animateNumber(statElements.koms, data.koms_count);
      animateNumber(statElements.careerMiles, data.all_ride.distance_miles, ',');

    } catch (error) {
      console.warn('Could not load Strava stats:', error);
      // Show placeholder values on error
      Object.values(statElements).forEach(el => { el.textContent = '--'; });
    }
  }

  // Simple number animation
  function animateNumber(element, target, separator = '') {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeProgress);

      element.textContent = separator
        ? current.toLocaleString()
        : current.toString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Fetch KOMs
  const komsList = document.getElementById('komsList');

  async function fetchKOMs() {
    if (!komsList) return;

    try {
      const response = await fetch(`${STRAVA_WORKER_URL}/koms`);

      if (!response.ok) {
        throw new Error('Failed to fetch KOMs');
      }

      const koms = await response.json();

      if (koms.length === 0) {
        komsList.innerHTML = '<p class="cycling__koms-loading">No KOMs yet</p>';
        return;
      }

      komsList.innerHTML = koms.map(kom => `
        <div class="cycling__kom-item">
          <div>
            <p class="cycling__kom-segment">${kom.segment_name}</p>
            <div class="cycling__kom-meta">
              ${kom.distance ? `<span>${kom.distance}</span>` : ''}
              ${kom.speed ? `<span>${kom.speed}</span>` : ''}
              ${kom.average_grade ? `<span>${kom.average_grade}</span>` : ''}
            </div>
          </div>
          <div class="cycling__kom-stats">
            <span class="cycling__kom-time">${kom.time}</span>
            <span class="cycling__kom-power">${kom.average_watts ? `${kom.average_watts}W` : ''}</span>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.warn('Could not load KOMs:', error);
      komsList.innerHTML = '<p class="cycling__koms-loading">--</p>';
    }
  }

  // Fetch stats when cycling section is in view
  const cyclingSection = document.getElementById('cycling');
  if (!cyclingSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fetchStats();
        fetchKOMs();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(cyclingSection);
}
