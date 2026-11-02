/* ========================================
   MAIN JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initProjectModal();
  initAnalytics();
});

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
  const navLinks = document.querySelectorAll('.ds-nav a');

  if (!sections.length || !navLinks.length) return;

  function setActive(sectionId) {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === `#${sectionId}`) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveLink() {
    const scrollPosition = window.pageYOffset + 100;

    // Short trailing sections (e.g. contact) never reach the top boundary
    // because the page runs out of scroll room. Once we're near the bottom,
    // pin the last section as active.
    const nearBottom = window.innerHeight + window.pageYOffset >=
      document.documentElement.scrollHeight - 120;
    if (nearBottom) {
      setActive(sections[sections.length - 1].getAttribute('id'));
      return;
    }

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        setActive(sectionId);
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

  // Project data
  const projects = {
    routeplanner: {
      title: 'AI Route Planner for Cycling and Running',
      tags: ['TypeScript', 'Cloudflare', 'MapLibre'],
      image: null,
      description: `
        <p>A website that plans road rides and runs. Ask for something like "a 40 mile loop with some climbing" and it builds a route that fits, then gives you the forecast along the way and a GPX file for your bike computer or watch.</p>
        <p><strong>How it works:</strong></p>
        <ul>
          <li>Road data from OpenStreetMap is turned into a graph in the browser, with hills added from elevation tiles</li>
          <li>Each road is scored on how good it is to ride or run, and A* search keeps the route closest to what you asked for</li>
          <li>Routes are built in the browser because a large area's road data can take about 400 MB of memory</li>
          <li>A Cloudflare Worker runs the chat with Claude, caches road data in R2, and handles sign-in, Strava, and email</li>
        </ul>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Plan by chat, or by hand with distance, climbing, surface, and traffic controls</li>
          <li>Drag the route on the map, add stops, or draw areas to stay out of</li>
          <li>Weather for the time you'd actually reach each part of the route, plus what to wear</li>
          <li>Strava sync, so routes can favor roads you know or find new ones</li>
          <li>After a ride, an email links to a page where you mark roads you liked or want to avoid, and future routes follow those notes</li>
        </ul>
      `
    },
    tutoring: {
      title: 'AI Tutoring App for Education',
      tags: ['Next.js', 'LangGraph', 'Supabase'],
      image: null,
      description: `
        <p>A tutoring app built for a client, where students learn from their instructor's own course material.</p>
        <ul>
          <li>Built a document ingestion pipeline that turns course documents (Word files and slide decks) into text, using a vision LLM to describe slides and visuals</li>
          <li>Grounded the agentic tutor chat and quiz generation in course material with RAG</li>
          <li>Students can take generated quizzes, review their answers, and track progress and milestones through a course</li>
          <li>Next.js on Cloudflare Workers, with Supabase for auth and Postgres</li>
        </ul>
        <p>The client returned for a second engagement.</p>
      `
    },
    lpr: {
      title: 'License Plate Recognition for Parking Enforcement',
      tags: ['React', 'Supabase', 'OpenALPR'],
      image: null,
      description: `
        <p>I led development of a parking validation system that reads plates from camera feeds, streams them live over WebSockets, and checks each one against active parking sessions.</p>
        <ul>
          <li>Drivers scan a QR code at the lot, verify their phone number by SMS, and register their plate</li>
          <li>They then validate parking by paying, uploading a receipt, or getting validated by an employee</li>
          <li>Employees watch a live video feed with plate detections, with sound cues for detection confidence, and an admin dashboard per lot</li>
          <li>Plate reading runs on OpenALPR, with React Router and Supabase for the app</li>
        </ul>
        <p>Business outreach showed weak-to-nonexistent market signals.</p>
      `
    },
    segments: {
      title: 'Strava Segment Time Predictor',
      tags: ['TypeScript', 'Cloudflare D1'],
      image: null,
      description: `
        <p>Finds Strava segments in an area where I could realistically take a top-10 or KOM, given my weight and power PRs.</p>
        <ul>
          <li>Predicts segment times with a validated cycling power model (Martin et al., 1998)</li>
          <li>Integrates the equation of motion along the segment's real elevation profile, instead of using one average grade, which under-predicts time because the slow uphill sections dominate</li>
          <li>Builds a power-duration curve from my PRs, so a 45 second sprint uses sprint power and a 6 minute climb uses threshold power</li>
          <li>Ranks segments by how winnable they are, and can back-solve the watts a leaderboard holder likely needed</li>
          <li>A TypeScript engine on Cloudflare Workers, with a React front end</li>
        </ul>
      `
    },
    slam: {
      title: 'Robot Localization, Mapping, and Planning',
      tags: ['Python', 'GTSAM', 'OMPL'],
      image: null,
      description: `
        <p>A set of projects from graduate courses in sensing, estimation, and planning at UC San Diego.</p>
        <ul>
          <li><strong>LiDAR SLAM:</strong> ICP scan matching, an occupancy grid map, and a GTSAM factor graph with loop closures to correct drift</li>
          <li><strong>Visual-inertial SLAM:</strong> IMU localization, landmark triangulation from stereo features, and an EKF that updates the robot's pose and the landmarks together</li>
          <li><strong>3D motion planning:</strong> weighted A* on a discretized space and RRT from OMPL in continuous space, comparing path length and nodes explored</li>
          <li><strong>Trajectory tracking under noise:</strong> receding-horizon certainty equivalent control and generalized policy iteration for a differential-drive robot avoiding obstacles</li>
        </ul>
      `
    },
    aegis: {
      title: 'Aegis',
      tags: ['IoT', 'Smart Home'],
      image: 'assets/aegis-hardware.png',
      imageWebp: 'assets/aegis-hardware.webp',
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
      image: 'assets/turbo-e46.jpeg',
      imageWebp: 'assets/turbo-e46.webp',
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
      image: 'assets/hard-hack-edited.jpg',
      imageWebp: 'assets/hard-hack-edited.webp',
      description: `
        <p>A prosthetic device project built at HARD Hack 2023, where my team and I came in as overall runner-up.</p>
        <p>HARD Hack is a hardware-focused hackathon hosted by UCSD students, challenging teams to build physical devices in a limited time.</p>
        <p><a href="https://github.com/ymorsi7/ProstheTech" target="_blank" data-track="prosthetech_github">View on GitHub</a></p>
      `
    },
    ece148: {
      title: 'Autonomous Car',
      tags: ['Autonomous Vehicles', 'Robotics'],
      image: 'assets/auto-car.jpeg',
      imageWebp: 'assets/auto-car.webp',
      description: `
        <p>Autonomous vehicle project for ECE 148 (Introduction to Autonomous Vehicles) at UC San Diego.</p>
        <p>I worked on the hardware platform and helped get the car driving autonomously using computer vision and control systems.</p>
      `
    },
    tritoncrit: {
      title: 'Triton Crit',
      tags: ['Event Planning', 'Cycling'],
      image: 'assets/triton_crit.jpg',
      imageWebp: 'assets/triton_crit.webp',
      description: `
        <p>Launched an annual criterium cycling race in San Diego for the UCSD Cycling Team. It draws 120+ unique racers, and running it means coordinating with the City of San Diego, university administration, USA Cycling, and local businesses.</p>
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
    modalTags.innerHTML = project.tags.map(tag => `<span class="ds-tag">${tag}</span>`).join('');
    modalDescription.innerHTML = project.description;

    modalImage.hidden = !project.image;

    if (project.image) {
      const webpSource = project.imageWebp ? `<source srcset="${project.imageWebp}" type="image/webp">` : '';
      modalImage.innerHTML = `<picture>${webpSource}<img src="${project.image}" alt="${project.title}"></picture>`;
    } else {
      modalImage.innerHTML = '';
    }

    modal.showModal();
    document.body.style.overflow = 'hidden';

    track('project_opened', { project: projectId });
  }

  // Event listeners - make entire card clickable
  document.querySelectorAll('[data-project]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(card.dataset.project);
    });
  });

  // Escape and the Close button are handled by <dialog> itself
  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
  });

  // A click on the backdrop lands on the dialog element, not its contents
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

/* ---- Analytics ---- */

// PostHog loads from the snippet in index.html. Tracking must never break the
// page, so do nothing if that snippet is missing.
function track(event, properties) {
  window.posthog?.capture?.(event, properties);
}

function initAnalytics() {
  // Any link with data-track reports a click, including links added to the
  // page later such as the ones inside the project dialog.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-track]');
    if (!link) return;

    const area = link.closest('section[id], header, footer, dialog');
    track('link_clicked', {
      link: link.dataset.track,
      location: area?.id || area?.localName
    });
  });

  // Report each section once per visit, when half of it is showing or it fills
  // half the screen. Both are needed: Projects can be too tall to ever be half
  // showing, and Contact too short to ever fill half the screen.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const halfShowing = entry.intersectionRatio >= 0.5;
      const fillsHalfScreen = entry.intersectionRect.height >= entry.rootBounds.height / 2;

      if (halfShowing || fillsHalfScreen) {
        track('section_viewed', { section: entry.target.id });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] });

  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}

/* ---- Email Obfuscation ---- */

function initEmailObfuscation() {
  const emailLink = document.getElementById('emailLink');
  if (!emailLink) return;

  // Split up to avoid scrapers
  const user = 'domvorlando';
  const domain = 'gmail';
  const tld = 'com';

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

  // Show skeleton placeholders until data arrives (progressive enhancement:
  // no-JS visitors keep the static "--" fallback in the markup)
  Object.values(statElements).forEach(el => {
    el.textContent = '';
    el.classList.add('ds-skeleton');
  });

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
      // Clear skeletons and show placeholder values on error
      Object.values(statElements).forEach(el => {
        el.classList.remove('ds-skeleton');
        el.textContent = '--';
      });
    }
  }

  // Simple number animation
  function animateNumber(element, target, separator = '') {
    element.classList.remove('ds-skeleton');
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
  const komsMessage = (text) => `<tr><td colspan="6" class="ds-quiet">${text}</td></tr>`;

  // Segment names are written by Strava users, so never trust them as HTML
  const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  })[c]);

  async function fetchKOMs() {
    if (!komsList) return;

    // Show 5 skeleton rows while loading (we always render up to 5 KOMs)
    komsList.innerHTML = Array.from({ length: 5 }, () => `
      <tr aria-hidden="true">${'<td><span class="ds-skeleton"></span></td>'.repeat(6)}</tr>
    `).join('');

    try {
      const response = await fetch(`${STRAVA_WORKER_URL}/koms`);

      if (!response.ok) {
        throw new Error('Failed to fetch KOMs');
      }

      const koms = await response.json();

      if (koms.length === 0) {
        komsList.innerHTML = komsMessage('No KOMs yet');
        return;
      }

      komsList.innerHTML = koms.map(kom => `
        <tr>
          <td>${escapeHtml(kom.segment_name)}</td>
          <td data-num>${escapeHtml(kom.distance ?? '')}</td>
          <td data-num>${escapeHtml(kom.speed ?? '')}</td>
          <td data-num>${escapeHtml(kom.average_grade ?? '')}</td>
          <td data-num>${escapeHtml(kom.time)}</td>
          <td data-num>${kom.average_watts ? `${Math.round(kom.average_watts)} W` : ''}</td>
        </tr>
      `).join('');

    } catch (error) {
      console.warn('Could not load KOMs:', error);
      komsList.innerHTML = komsMessage('Could not load KOMs');
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
