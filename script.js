/*==================================================
    KRISHI SAKHI — MAIN JAVASCRIPT
    Covers: mobile menu, dark mode, AI chat widget,
    crop disease upload (simulated), live weather
    (Open-Meteo, no API key), testimonial carousel,
    mandi/scheme search + "view all" modal,
    newsletter form, toast notifications.
==================================================*/

document.addEventListener('DOMContentLoaded', () => {

  /*=========================
      1. MOBILE HAMBURGER MENU
  =========================*/
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('show');
    });

    // close menu after clicking a link (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('show');
      });
    });
  }

  /*=========================
      2. DARK MODE TOGGLE
  =========================*/
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;
  const THEME_KEY = 'krishiSakhiTheme';

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /*=========================
      3. TOAST NOTIFICATIONS
  =========================*/
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message, type = 'default', duration = 3200) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  /*=========================
      4. LANGUAGE SELECT (placeholder)
  =========================*/
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      const label = langSelect.options[langSelect.selectedIndex].text;
      showToast(`Language set to ${label}. (Hook this up to your translation strings to make it live.)`);
    });
  }

  /*=========================
      5. CONTACT FORM (EmailJS)
  =========================*/
  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init("QdLkGwcfLTY7Zre9i");
  }

  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      emailjs.sendForm('service_zo3h00j', 'template_9cg63yi', this)
        .then(() => {
          showToast('Message sent successfully! We will get back to you soon.', 'success');
          contactForm.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          showToast('Failed to send message. Please try again later.', 'error');
        })
        .finally(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  /*=========================
      6. AI CHAT ASSISTANT
  =========================*/
  const chatFab = document.getElementById('chatFab');
  const chatWidget = document.getElementById('chatWidget');
  const chatClose = document.getElementById('chatClose');
  const chatBody = document.getElementById('chatBody');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatQuick = document.getElementById('chatQuick');
  const heroChatBtn = document.getElementById('heroChatBtn');
  const openChatFeature = document.getElementById('openChatFeature');
  const openChatTips = document.getElementById('openChatTips');

  function openChat() {
    chatWidget.classList.add('open');
    chatInput && chatInput.focus();
  }
  function closeChat() {
    chatWidget.classList.remove('open');
  }
  function toggleChat() {
    chatWidget.classList.contains('open') ? closeChat() : openChat();
  }

  chatFab && chatFab.addEventListener('click', toggleChat);
  chatClose && chatClose.addEventListener('click', closeChat);
  heroChatBtn && heroChatBtn.addEventListener('click', openChat);
  openChatFeature && openChatFeature.addEventListener('click', openChat);

  function addMessage(text, sender = 'bot') {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
    return typing;
  }

  // Simple rule-based demo assistant. Swap this out for a real backend / LLM API call.
  function getBotReply(rawText) {
    const text = rawText.toLowerCase();

    if (/weather|mausam|temperature|rain/.test(text)) {
      return "You can check live weather in the Weather Forecast card on the homepage — it auto-detects your location. Want me to scroll you there?";
    }
    if (/mandi|price|rate|भाव/.test(text)) {
      return "Today's mandi rates are listed in the Mandi Rates section — Wheat ₹2420, Rice ₹2300, Maize ₹2100, Pulses ₹5650, Mustard ₹6000 per quintal. Tap 'View All' for more crops.";
    }
    if (/disease|pest|leaf|bimari|बीमारी/.test(text)) {
      return "Upload a clear photo of the affected leaf in the Crop Disease Detection section and tap 'Analyze Leaf' — I'll give you a quick assessment and next steps.";
    }
    if (/scheme|yojana|loan|subsidy|योजना/.test(text)) {
      return "Popular schemes: PM Kisan Samman Nidhi (₹6000/year), Kisan Credit Card (easy loans), and PM Fasal Bima Yojana (crop insurance). Check the Government Schemes section for details and links.";
    }
    if (/hi|hello|hey|namaste|नमस्ते/.test(text)) {
      return "Namaste! 🙏 I can help with weather, mandi rates, crop diseases, or government schemes. What do you need?";
    }
    if (/thank/.test(text)) {
      return "Happy to help! 🌾 Anything else you'd like to know?";
    }
    return "I'm a demo assistant right now — connect me to a real AI backend (e.g. the Claude API) to answer anything a farmer asks. Meanwhile, try asking about weather, mandi rates, disease detection, or schemes.";
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    chatInput.value = '';
    const typing = showTyping();
    const delay = 600 + Math.random() * 700;
    setTimeout(() => {
      typing.remove();
      addMessage(getBotReply(text), 'bot');
    }, delay);
  }

  chatForm && chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(chatInput.value);
  });

  chatQuick && chatQuick.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-q]');
    if (!btn) return;
    const map = {
      weather: 'What is the weather today?',
      mandi: 'What are today\'s mandi rates?',
      disease: 'My crop leaf looks sick, help me.',
      scheme: 'Which government schemes can I apply for?'
    };
    openChat();
    handleUserMessage(map[btn.dataset.q] || btn.textContent);
  });

  openChatTips && openChatTips.addEventListener('click', () => {
    openChat();
    setTimeout(() => addMessage("Tip 🌱: Rotate crops each season to keep soil healthy and reduce pest build-up. Want more tips like this?", 'bot'), 400);
  });

  const openTools = document.getElementById('openTools');
  if (openTools) {
    openTools.addEventListener('click', () => {
      openChat();
      setTimeout(() => addMessage("Looking for farming tools or tractors? Tell me what you need, and I'll find nearby sellers and rental options for you.", 'bot'), 400);
    });
  }

  const openFertilizers = document.getElementById('openFertilizers');
  if (openFertilizers) {
    openFertilizers.addEventListener('click', () => {
      openChat();
      setTimeout(() => addMessage("Need seeds or fertilizers? Let me know which crop you're planting and I'll suggest the best local shops and varieties.", 'bot'), 400);
    });
  }

  // Intercept empty links to show a coming soon toast
  document.querySelectorAll('a[href="#"]:not(.scroll-top)').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('This page is coming soon! Stay tuned. 🌱');
    });
  });

  /*=========================
      7. CROP DISEASE UPLOAD (simulated AI)
  =========================*/
  const cropImageInput = document.getElementById('crop-image');
  const uploadBox = document.getElementById('uploadBox');
  const previewImg = document.getElementById('previewImg');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const diseaseResult = document.getElementById('diseaseResult');

  // Demo result bank — replace with a real call to your vision/AI model.
  const demoResults = [
    { status: 'ok', title: '✅ Leaf looks healthy', lines: ['No visible signs of disease detected.', 'Keep monitoring weekly and maintain regular watering.'] },
    { status: 'warning', title: '⚠️ Possible Leaf Blight', lines: ['Yellow-brown patches detected on the leaf edges.', 'Recommendation: remove affected leaves and apply a copper-based fungicide.', 'Consult your local Krishi Vigyan Kendra to confirm.'] },
    { status: 'warning', title: '⚠️ Possible Powdery Mildew', lines: ['White powdery spots detected on the surface.', 'Recommendation: improve airflow between plants and reduce overhead watering.'] }
  ];

  if (cropImageInput) {
    cropImageInput.addEventListener('change', () => {
      const file = cropImageInput.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('Image is larger than 5MB. Please choose a smaller file.', 'error');
        cropImageInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        uploadBox.classList.add('has-image');
        analyzeBtn.classList.add('show');
        diseaseResult.classList.remove('show');
      };
      reader.readAsDataURL(file);
    });
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';

      // Simulated analysis delay — replace with a real fetch() to your AI model endpoint.
      setTimeout(() => {
        const result = demoResults[Math.floor(Math.random() * demoResults.length)];
        diseaseResult.className = 'disease-result show' + (result.status === 'warning' ? ' warning' : '');
        diseaseResult.innerHTML = `<h4>${result.title}</h4>` +
          result.lines.map(l => `<p>${l}</p>`).join('') +
          `<p style="margin-top:8px;font-size:12px;opacity:.7;">Demo result — connect a real crop-disease model for production use.</p>`;

        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Analyze Another';
      }, 1600);
    });
  }

  /*=========================
      8. LIVE WEATHER (Open-Meteo — free, no key)
  =========================*/
  const weatherLocation = document.getElementById('weatherLocation');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherDesc = document.getElementById('weatherDesc');
  const weatherHumidity = document.getElementById('weatherHumidity');
  const weatherRain = document.getElementById('weatherRain');
  const weatherWind = document.getElementById('weatherWind');
  const weatherSun = document.getElementById('weatherSun');
  const forecastBtn = document.getElementById('forecastBtn');

  const WMO_MAP = {
    0: ['☀️', 'Clear Sky'], 1: ['🌤️', 'Mainly Clear'], 2: ['⛅', 'Partly Cloudy'], 3: ['☁️', 'Overcast'],
    45: ['🌫️', 'Fog'], 48: ['🌫️', 'Rime Fog'],
    51: ['🌦️', 'Light Drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Dense Drizzle'],
    61: ['🌧️', 'Light Rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy Rain'],
    71: ['❄️', 'Light Snow'], 73: ['❄️', 'Snow'], 75: ['❄️', 'Heavy Snow'],
    80: ['🌧️', 'Rain Showers'], 81: ['🌧️', 'Heavy Showers'], 82: ['⛈️', 'Violent Showers'],
    95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm w/ Hail'], 99: ['⛈️', 'Severe Thunderstorm']
  };

  function weatherFromCode(code) {
    return WMO_MAP[code] || ['🌡️', 'Weather'];
  }

  function formatTime(iso) {
    if (!iso) return '--:--';
    const d = new Date(iso);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  let lastForecastData = null;

  async function loadWeather(lat, lon, placeNameFallback) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=sunrise,sunset,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code` +
        `&timezone=auto&forecast_days=5`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      lastForecastData = data;

      const [icon, desc] = weatherFromCode(data.current.weather_code);

      weatherIcon.textContent = icon;
      weatherTemp.textContent = `${Math.round(data.current.temperature_2m)}°C`;
      weatherDesc.textContent = desc;
      weatherHumidity.textContent = `${data.current.relative_humidity_2m}%`;
      weatherRain.textContent = `${data.daily.precipitation_probability_max[0] ?? 0}%`;
      weatherWind.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
      weatherSun.textContent = `${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}`;

      // Try to resolve a human-readable place name (free, no key, client-side reverse geocode)
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (geoRes.ok) {
          const geo = await geoRes.json();
          const place = [geo.locality || geo.city, geo.principalSubdivision].filter(Boolean).join(', ');
          weatherLocation.textContent = place || placeNameFallback;
        } else {
          weatherLocation.textContent = placeNameFallback;
        }
      } catch {
        weatherLocation.textContent = placeNameFallback;
      }

    } catch (err) {
      weatherDesc.textContent = 'Weather unavailable';
      weatherLocation.textContent = placeNameFallback;
      showToast('Could not load live weather. Showing default info.', 'error');
    }
  }

  // Default fallback: Jaunpur, Uttar Pradesh
  const DEFAULT_LAT = 25.7573, DEFAULT_LON = 82.6844;

  if (weatherTemp) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude, 'Your Location'),
        () => loadWeather(DEFAULT_LAT, DEFAULT_LON, 'Jaunpur, Uttar Pradesh'),
        { timeout: 6000 }
      );
    } else {
      loadWeather(DEFAULT_LAT, DEFAULT_LON, 'Jaunpur, Uttar Pradesh');
    }
  }

  // ---- Modal (shared by Forecast, Mandi View All, Schemes View All) ----
  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');
  const modalClose = document.getElementById('modalClose');

  function openModal(title, contentHtml) {
    modalTitle.textContent = title;
    modalContent.innerHTML = contentHtml;
    modalOverlay.classList.add('open');
  }
  function closeModal() {
    modalOverlay.classList.remove('open');
  }
  modalClose && modalClose.addEventListener('click', closeModal);
  modalOverlay && modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  forecastBtn && forecastBtn.addEventListener('click', () => {
    if (!lastForecastData) {
      showToast('Weather is still loading, try again in a moment.');
      return;
    }
    const days = lastForecastData.daily.time.map((date, i) => {
      const [icon, desc] = weatherFromCode(lastForecastData.daily.weather_code[i]);
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      return `<div class="modal-row">
        <span>${icon} ${dayName} — ${desc}</span>
        <strong>${Math.round(lastForecastData.daily.temperature_2m_max[i])}° / ${Math.round(lastForecastData.daily.temperature_2m_min[i])}°</strong>
      </div>`;
    }).join('');
    openModal('5-Day Forecast', days);
  });

  /*=========================
      9. MANDI RATES — SEARCH + VIEW ALL
  =========================*/
  const mandiSearch = document.getElementById('mandiSearch');
  const mandiList = document.getElementById('mandiList');
  const mandiNoResults = document.getElementById('mandiNoResults');
  const mandiViewAll = document.getElementById('mandiViewAll');

  if (mandiSearch && mandiList) {
    mandiSearch.addEventListener('input', () => {
      const q = mandiSearch.value.trim().toLowerCase();
      let visibleCount = 0;
      mandiList.querySelectorAll('.rates').forEach(row => {
        const crop = (row.dataset.crop || '').toLowerCase();
        const match = crop.includes(q);
        row.style.display = match ? '' : 'none';
        const line = row.nextElementSibling;
        if (line && line.classList.contains('line')) line.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });
      mandiNoResults.classList.toggle('show', visibleCount === 0);
    });
  }

  const extraMandiRates = [
    { name: 'Soybean (सोयाबीन)', price: '₹4650/क्विंटल' },
    { name: 'Groundnut (मूंगफली)', price: '₹5800/क्विंटल' },
    { name: 'Cotton (कपास)', price: '₹7200/क्विंटल' },
    { name: 'Sugarcane (गन्ना)', price: '₹350/क्विंटल' },
    { name: 'Potato (आलू)', price: '₹1200/क्विंटल' },
    { name: 'Onion (प्याज)', price: '₹1850/क्विंटल' }
  ];

  mandiViewAll && mandiViewAll.addEventListener('click', () => {
    const baseRows = [
      { name: 'Wheat (गेहूँ)', price: '₹2420/क्विंटल' },
      { name: 'Rice (चावल)', price: '₹2300/क्विंटल' },
      { name: 'Maize (मक्का)', price: '₹2100/क्विंटल' },
      { name: 'Pulses (दाल)', price: '₹5650/क्विंटल' },
      { name: 'Mustard (सरसों)', price: '₹6000/क्विंटल' },
      ...extraMandiRates
    ];
    const html = baseRows.map(r => `<div class="modal-row"><span>${r.name}</span><strong>${r.price}</strong></div>`).join('');
    openModal('All Mandi Rates', html);
  });

  /*=========================
      10. SCHEMES — SEARCH + VIEW ALL
  =========================*/
  const schemeSearch = document.getElementById('schemeSearch');
  const schemesList = document.getElementById('schemesList');
  const schemesNoResults = document.getElementById('schemesNoResults');
  const schemesViewAll = document.getElementById('schemesViewAll');

  if (schemeSearch && schemesList) {
    schemeSearch.addEventListener('input', () => {
      const q = schemeSearch.value.trim().toLowerCase();
      let visibleCount = 0;
      schemesList.querySelectorAll('.scheme-card').forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const match = name.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });
      schemesNoResults.classList.toggle('show', visibleCount === 0);
    });
  }

  const extraSchemes = [
    { icon: '🚜', name: 'Sub-Mission on Agricultural Mechanization', desc: 'Subsidy on farm equipment', link: 'https://agrimachinery.nic.in/' },
    { icon: '💧', name: 'Pradhan Mantri Krishi Sinchayee Yojana', desc: 'Irrigation support for farms', link: 'https://pmksy.gov.in/' },
    { icon: '🌾', name: 'National Food Security Mission', desc: 'Boosting food-grain production', link: 'https://nfsm.gov.in/' },
    { icon: '🐄', name: 'National Livestock Mission', desc: 'Support for livestock farmers', link: 'https://dahd.nic.in/' }
  ];

  schemesViewAll && schemesViewAll.addEventListener('click', () => {
    const base = [
      { icon: '🌱', name: 'PM Kisan Samman Nidhi', desc: '₹6000 per year assistance', link: 'https://pmkisan.gov.in/' },
      { icon: '💳', name: 'Kisan Credit Card', desc: 'Easy loans for farmers', link: 'https://fasalrin.gov.in/' },
      { icon: '🌾', name: 'PM Fasal Bima Yojana', desc: 'Crop insurance for farmers', link: 'https://pmfby.gov.in/' },
      ...extraSchemes
    ];
    const html = base.map(s => `
      <div class="modal-row">
        <span>${s.icon} ${s.name} — <small style="opacity:.7;">${s.desc}</small></span>
        <a href="${s.link}" target="_blank" rel="noopener" style="color:var(--primary);font-weight:600;white-space:nowrap;">View</a>
      </div>`).join('');
    openModal('All Government Schemes', html);
  });

  /*=========================
      11. TESTIMONIAL CAROUSEL
  =========================*/
  const testimonialText = document.getElementById('testimonialText');
  const testimonialAuthor = document.getElementById('testimonialAuthor');
  const testimonialImg = document.getElementById('testimonialImg');
  const testimonialDots = document.getElementById('testimonialDots');
  const testimonialBox = document.querySelector('.testimonial-box');

  const testimonials = [
    {
      text: 'Krishi Sakhi ने मेरी फसल में बीमारी को समय पर पहचानने में मदद की और सही सलाह दी। इससे मेरी फसल बच गई।',
      author: '— Ram Tirth, Jaunpur',
      img: 'https://thumbs.dreamstime.com/b/indian-farmer-holding-crop-plant-his-wheat-field-indian-farmer-holding-crop-plant-his-wheat-field-123557695.jpg'
    },
    {
      text: 'अब मुझे मंडी जाए बिना ही रोज़ के भाव पता चल जाते हैं। इससे मेरा समय और पैसा दोनों बचता है।',
      author: '— Sunita Devi, Prayagraj',
      img: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80'
    },
    {
      text: 'सरकारी योजनाओं की जानकारी अब एक ही जगह मिल जाती है। PM Kisan का फॉर्म भरना बहुत आसान हो गया।',
      author: '— Mahesh Yadav, Varanasi',
      img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80'
    }
  ];

  let testimonialIndex = 0;
  let testimonialTimer = null;

  function renderTestimonial(i) {
    const t = testimonials[i];
    testimonialText.style.opacity = 0;
    setTimeout(() => {
      testimonialText.textContent = t.text;
      testimonialAuthor.textContent = t.author;
      testimonialImg.src = t.img;
      testimonialText.style.opacity = 1;
    }, 200);

    testimonialDots.querySelectorAll('span').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === i);
    });
  }

  function nextTestimonial() {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial(testimonialIndex);
  }

  function startTestimonialAutoplay() {
    testimonialTimer = setInterval(nextTestimonial, 6000);
  }

  if (testimonialDots) {
    testimonialText.style.transition = 'opacity .2s ease';
    testimonialDots.addEventListener('click', (e) => {
      const dot = e.target.closest('span');
      if (!dot) return;
      testimonialIndex = parseInt(dot.dataset.index, 10);
      renderTestimonial(testimonialIndex);
      clearInterval(testimonialTimer);
      startTestimonialAutoplay();
    });

    startTestimonialAutoplay();

    if (testimonialBox) {
      testimonialBox.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
      testimonialBox.addEventListener('mouseleave', startTestimonialAutoplay);
    }
  }

  /*=========================
      12. SCROLL TO TOP
  =========================*/
  document.querySelectorAll('.scroll-top').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

});