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
      4. LANGUAGE SWITCHER
  =========================*/
  const langSelect = document.getElementById('langSelect');

  function applyTranslations(lang) {
      if (typeof translations === 'undefined' || !translations[lang]) return;
      
      const dict = translations[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (dict[key]) {
              if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                  el.placeholder = dict[key];
              } else {
                  el.innerHTML = dict[key];
              }
          }
      });
      
      if (langSelect && langSelect.value !== lang) {
          langSelect.value = lang;
      }
      localStorage.setItem('ks_lang', lang);
  }

  // Init language
  const savedLang = localStorage.getItem('ks_lang') || 'en';
  applyTranslations(savedLang);

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      applyTranslations(selectedLang);
      
      const label = langSelect.options[langSelect.selectedIndex].text;
      showToast(`Language changed to ${label}`, 'success');
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

      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;

      // Providing a comprehensive set of template variables to match whatever the user might have configured
      const templateParams = {
          name: name,
          email: email,
          message: message,
          user_name: name,
          user_email: email,
          reply_to: email,
          from_name: name,
          to_name: "Krishi Sakhi Admin"
      };

      emailjs.send('service_zo3h00j', 'template_34rs97p', templateParams)
        .then(() => {
          showToast('Message sent successfully!', 'success');
          contactForm.reset();
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
          const errorMsg = (error && error.text) ? error.text : 'Please check your EmailJS account settings (Allowed domains) or template variables.';
          showToast('Failed: ' + errorMsg, 'error');
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
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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

  function getBotReply(rawText) {
    const text = rawText.toLowerCase();

    if (/weather|mausam|temperature|rain|मौसम/.test(text)) {
      return "आप होमपेज पर मौसम अनुभाग में लाइव मौसम देख सकते हैं। क्या मैं आपको वहां ले चलूं?";
    }
    if (/mandi|price|rate|भाव|मंडी/.test(text)) {
      return "आज के मंडी भाव इस प्रकार हैं — गेहूं ₹2420, चावल ₹2300, मक्का ₹2100, दालें ₹5650, सरसों ₹6000 प्रति क्विंटल।";
    }
    if (/disease|pest|leaf|bimari|बीमारी|रोग/.test(text)) {
      return "फसल रोग पहचान अनुभाग में प्रभावित पत्ते की एक फोटो अपलोड करें, और मैं आपको बीमारी और बचाव के उपाय बताऊंगी।";
    }
    if (/scheme|yojana|loan|subsidy|योजना/.test(text)) {
      return "मुख्य सरकारी योजनाएं हैं: पीएम किसान सम्मान निधि, किसान क्रेडिट कार्ड (आसान ऋण), और पीएम फसल बीमा योजना (फसल बीमा)।";
    }
    if (/hi|hello|hey|namaste|नमस्ते|हेलो/.test(text)) {
      return "नमस्ते! 🙏 मैं कृषि सखी हूँ। मैं मौसम, मंडी भाव, फसल की बीमारियों या सरकारी योजनाओं में आपकी मदद कर सकती हूँ। बताइए, आपको क्या जानकारी चाहिए?";
    }
    if (/thank|धन्यवाद|शुक्रिया/.test(text)) {
      return "आपकी मदद करके मुझे बहुत खुशी हुई! 🌾 क्या मैं आपकी कुछ और मदद कर सकती हूँ?";
    }
    return "मैं अभी एक डेमो असिस्टेंट हूँ। कृपया मौसम, मंडी भाव, फसल की बीमारी, या सरकारी योजनाओं के बारे में सवाल पूछें।";
  }

  function speakText(text) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Set explicitly to Hindi
      window.speechSynthesis.speak(utterance);
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, 'user');
    chatInput.value = '';
    const typing = showTyping();
    const delay = 600 + Math.random() * 700;
    setTimeout(() => {
      typing.remove();
      const reply = getBotReply(text);
      addMessage(reply, 'bot');
      speakText(reply);
    }, delay);
  }

  chatForm && chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleUserMessage(chatInput.value);
  });

  const chatMicBtn = document.getElementById('chatMicBtn');
  if (chatMicBtn) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;

          chatMicBtn.addEventListener('click', () => {
              recognition.lang = 'hi-IN'; // Explicitly set to Hindi
              
              chatMicBtn.classList.add('recording');
              chatInput.placeholder = "Listening...";
              recognition.start();
          });

          recognition.onresult = (event) => {
              chatMicBtn.classList.remove('recording');
              chatInput.placeholder = "Type your question...";
              const transcript = event.results[0][0].transcript;
              chatInput.value = transcript;
              handleUserMessage(transcript);
          };

          recognition.onerror = (event) => {
              chatMicBtn.classList.remove('recording');
              chatInput.placeholder = "Type your question...";
              showToast("Voice recognition failed. Please try again.");
          };
          
          recognition.onend = () => {
              chatMicBtn.classList.remove('recording');
              chatInput.placeholder = "Type your question...";
          };
      } else {
          chatMicBtn.addEventListener('click', () => {
              showToast("Voice recognition not supported in this browser.");
          });
      }
  }

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
    const tipsHtml = `
      <div style="padding: 10px;">
        <!-- Free Tips Section -->
        <h4 style="margin: 0 0 15px 0; color: var(--text); border-bottom: 2px solid var(--primary); padding-bottom: 5px; display: inline-block;">Daily Free Tips 🌱</h4>
        <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 15px; margin-bottom: 25px;">
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                <li style="display: flex; gap: 10px; align-items: flex-start; color: var(--text);">
                    <i class="fa-solid fa-check" style="color: #28a745; margin-top: 4px;"></i> 
                    <span><strong>Crop Rotation:</strong> Rotate crops each season to maintain soil nutrients and reduce pest build-up.</span>
                </li>
                <li style="display: flex; gap: 10px; align-items: flex-start; color: var(--text);">
                    <i class="fa-solid fa-check" style="color: #28a745; margin-top: 4px;"></i> 
                    <span><strong>Water Management:</strong> Irrigate your fields early morning or late evening to minimize evaporation and save water.</span>
                </li>
            </ul>
        </div>

        <!-- Premium Expert Advice Section -->
        <h4 style="margin: 0 0 15px 0; color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 5px; display: inline-block;">Premium Expert Advice 🌟</h4>
        
        <div style="position: relative; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; overflow: hidden; min-height: 250px;">
            
            <!-- Blurred Content -->
            <div style="filter: blur(6px); opacity: 0.5; pointer-events: none; user-select: none;">
                <h5 style="margin: 0 0 10px 0; font-size: 1.1rem; color: var(--primary);">Advanced Soil Diagnostics</h5>
                <p style="margin: 0 0 15px 0; font-size: 0.95rem; color: var(--text);">Learn the exact Ph balance techniques used by top commercial farmers to double their wheat yield within a single season.</p>
                <h5 style="margin: 0 0 10px 0; font-size: 1.1rem; color: var(--primary);">Predictive Pest Control</h5>
                <p style="margin: 0; font-size: 0.95rem; color: var(--text);">Access our proprietary AI model's 30-day pest forecast for your specific district to prevent infestations before they happen.</p>
            </div>

            <!-- Lock Overlay -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(2px); background: rgba(0,0,0,0.03); padding: 20px; text-align: center; z-index: 5;">
                <div style="background: var(--card); border: 1px solid var(--border); padding: 25px 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 90%; max-width: 320px; display: flex; flex-direction: column; align-items: center;">
                    <div style="background: #ffebee; width: 55px; height: 55px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                        <i class="fa-solid fa-lock" style="font-size: 1.4rem; color: #d32f2f;"></i>
                    </div>
                    <h3 style="margin: 0 0 8px 0; color: var(--text); font-size: 1.2rem;">Krishi Sakhi Premium</h3>
                    <p style="margin: 0 0 18px 0; color: var(--text-light); font-size: 0.9rem; line-height: 1.4;">Unlock direct 1-on-1 calls with agricultural scientists and personalized farming roadmaps.</p>
                    <button style="background: linear-gradient(135deg, #d32f2f, #f44336); color: white; border: none; padding: 10px 22px; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 10px rgba(211, 47, 47, 0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" onclick="showToast('Redirecting to Premium subscription page...')">Upgrade to Premium</button>
                </div>
            </div>
        </div>
      </div>
    `;
    openModal('Farming Tips & Expert Advice', tipsHtml);
  });

  const openTools = document.getElementById('openTools');
  if (openTools) {
    openTools.addEventListener('click', () => {
      const toolSearchHtml = `
        <div class="tool-search-container" style="text-align: center; padding: 10px;">
          <p style="margin-bottom: 15px; color: #444;">Please enter your area or pincode to find tools nearby:</p>
          <input type="text" id="toolAreaInput" placeholder="Enter Area or Pincode" style="width: 80%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;">
          <br>
          <button id="findToolsBtn" class="btn" style="padding: 10px 25px; background-color: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem; transition: background 0.3s;">Search Tools</button>
          <div id="toolResults" style="margin-top: 25px; text-align: left;"></div>
        </div>
      `;
      openModal('Farming Tools & Equipment', toolSearchHtml);

      // Add event listener after modal content is inserted
      setTimeout(() => {
        const findToolsBtn = document.getElementById('findToolsBtn');
        const toolAreaInput = document.getElementById('toolAreaInput');
        const toolResults = document.getElementById('toolResults');

        if (findToolsBtn) {
          findToolsBtn.addEventListener('click', () => {
            const area = toolAreaInput.value.trim();
            if (!area) {
              toolResults.innerHTML = '<p style="color: #d9534f; text-align: center;">Please enter an area to search.</p>';
              return;
            }

            toolResults.innerHTML = '<p style="text-align: center; color: #666;"><i class="fa-solid fa-spinner fa-spin"></i> Searching for tools near <strong>' + area + '</strong>...</p>';
            
            // Simulate network request delay
            setTimeout(() => {
              toolResults.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: var(--primary); font-size: 1.1rem;">Tractor (Mahindra 275)</h4>
                      <p style="margin: 0 0 5px 0; font-size: 0.9em; color: #555;"><i class="fa-solid fa-indian-rupee-sign"></i> 500/hour - Available for Rent</p>
                      <p style="margin: 0; font-size: 0.85em; color: #777;"><i class="fa-solid fa-location-dot"></i> 2.5 km away in ${area}</p>
                    </div>
                    <button style="padding: 8px 15px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Book</button>
                  </div>
                  
                  <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: var(--primary); font-size: 1.1rem;">Wheat Thresher</h4>
                      <p style="margin: 0 0 5px 0; font-size: 0.9em; color: #555;"><i class="fa-solid fa-indian-rupee-sign"></i> 800/hour - Available for Rent</p>
                      <p style="margin: 0; font-size: 0.85em; color: #777;"><i class="fa-solid fa-location-dot"></i> 4.0 km away in ${area}</p>
                    </div>
                    <button style="padding: 8px 15px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Book</button>
                  </div>

                  <div style="border: 1px solid #eee; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div>
                      <h4 style="margin: 0 0 5px 0; color: var(--primary); font-size: 1.1rem;">Rotavator (7 feet)</h4>
                      <p style="margin: 0 0 5px 0; font-size: 0.9em; color: #555;"><i class="fa-solid fa-indian-rupee-sign"></i> 400/hour - Available for Rent</p>
                      <p style="margin: 0; font-size: 0.85em; color: #777;"><i class="fa-solid fa-location-dot"></i> 5.2 km away in ${area}</p>
                    </div>
                    <button style="padding: 8px 15px; background: #28a745; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Book</button>
                  </div>
                </div>
              `;
            }, 800);
          });
        }
      }, 50);
    });
  }

  const openFertilizers = document.getElementById('openFertilizers');
  if (openFertilizers) {
    openFertilizers.addEventListener('click', () => {
      const adsHtml = `
        <div style="padding: 10px;">
          <!-- Search Section -->
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="margin-bottom: 15px; color: #444;">Search for the best seeds and fertilizers for your crop:</p>
            <div style="display: flex; gap: 10px; justify-content: center; width: 100%; margin: 0 auto;">
              <input type="text" placeholder="e.g., Wheat, Rice..." style="flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 1rem;">
              <button class="btn" style="padding: 10px 20px; background-color: var(--primary); color: white; border: none; border-radius: 5px; cursor: pointer; transition: background 0.3s;">Search</button>
            </div>
          </div>

          <!-- Featured Ads Section -->
          <h4 style="margin: 0 0 15px 0; color: #555; border-bottom: 2px solid var(--primary); padding-bottom: 5px; display: inline-block;">Featured Offers & Ads</h4>
          
          <!-- Ad 1: Krishi Sakhi Brand -->
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.08); position: relative; overflow: hidden; border: 1px solid #90caf9;">
            <div style="position: absolute; top: 0; left: 0; background: #ff9800; color: white; font-size: 0.75rem; padding: 4px 12px; border-bottom-right-radius: 8px; font-weight: bold; letter-spacing: 1px; z-index: 1;">AD</div>
            <div style="flex: 1; position: relative; z-index: 2;">
              <h3 style="margin: 0 0 8px 0; color: #1565c0; font-size: 1.3rem;">Krishi Sakhi Premium Seeds</h3>
              <p style="margin: 0 0 12px 0; font-size: 0.95rem; color: #333; line-height: 1.4;">Experience up to <strong>30% higher yield</strong> with our certified organic seeds. Specially tested for local soil conditions!</p>
              <button style="background: #1976d2; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.3s;">Shop Now (20% Off)</button>
            </div>
            <div style="font-size: 4rem; color: #1976d2; opacity: 0.2; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); z-index: 0;">
              <i class="fa-solid fa-seedling"></i>
            </div>
          </div>

          <!-- Ad 2: Local Fertilizer Shop -->
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 20px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.08); position: relative; overflow: hidden; border: 1px solid #a5d6a7;">
            <div style="position: absolute; top: 0; left: 0; background: #4caf50; color: white; font-size: 0.75rem; padding: 4px 12px; border-bottom-right-radius: 8px; font-weight: bold; letter-spacing: 1px; z-index: 1;">SPONSORED</div>
            <div style="flex: 1; position: relative; z-index: 2;">
              <h3 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 1.2rem;">Kisan Agro Fertilizers</h3>
              <p style="margin: 0 0 12px 0; font-size: 0.95rem; color: #333; line-height: 1.4;">Top-quality Urea and DAP available in bulk. <strong>Free delivery</strong> within 10 km!</p>
              <p style="margin: 0; font-size: 0.85rem; color: #555; font-weight: 500;"><i class="fa-solid fa-location-dot"></i> Near Main Market</p>
            </div>
            <div style="z-index: 2; margin-left: 15px;">
              <button style="background: #2e7d32; color: white; border: none; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.3s;">Contact Seller</button>
            </div>
            <div style="font-size: 4rem; color: #2e7d32; opacity: 0.15; position: absolute; right: 20px; bottom: -10px; z-index: 0;">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
        </div>
      `;
      openModal('Seeds & Fertilizers Marketplace', adsHtml);
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

  const originalParents = new Map();

  function openModal(title, content) {
    modalTitle.textContent = title;
    
    // Restore any previously moved DOM element before changing content
    Array.from(modalContent.children).forEach(child => {
        if (originalParents.has(child)) {
            originalParents.get(child).appendChild(child);
            child.style.display = 'none';
        }
    });

    if (typeof content === 'string') {
      modalContent.innerHTML = content;
    } else {
      modalContent.innerHTML = '';
      if (!originalParents.has(content)) {
          originalParents.set(content, content.parentElement);
      }
      modalContent.appendChild(content);
      content.style.display = 'block';
    }
    modalOverlay.classList.add('open');
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    setTimeout(() => {
        Array.from(modalContent.children).forEach(child => {
            if (originalParents.has(child)) {
                originalParents.get(child).appendChild(child);
                child.style.display = 'none';
            }
        });
        if (modalContent.children.length === 0) modalContent.innerHTML = '';
    }, 300);
  }
  
  modalClose && modalClose.addEventListener('click', closeModal);
  modalOverlay && modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // ---- Open Feature Sections as Modals ----
  const openWeatherFeature = document.getElementById('openWeatherFeature');
  const weatherCard = document.querySelector('.weather-card');
  if (openWeatherFeature && weatherCard) {
      openWeatherFeature.addEventListener('click', () => openModal('Weather Updates', weatherCard));
  }

  const openDiseaseFeature = document.getElementById('openDiseaseFeature');
  const diseaseCard = document.getElementById('disease');
  if (openDiseaseFeature && diseaseCard) {
      openDiseaseFeature.addEventListener('click', () => openModal('Crop Disease Detection', diseaseCard));
  }

  const openMandiFeature = document.getElementById('openMandiFeature');
  const mandiCard = document.getElementById('mandi');
  if (openMandiFeature && mandiCard) {
      openMandiFeature.addEventListener('click', () => openModal('Mandi Rates', mandiCard));
  }

  const openSchemesFeature = document.getElementById('openSchemesFeature');
  const schemesSectionCard = document.getElementById('schemesSection');
  if (openSchemesFeature && schemesSectionCard) {
      openSchemesFeature.addEventListener('click', () => openModal('Government Schemes', schemesSectionCard));
  }

  // ---- Navbar Links to Open Modals ----
  const navMandi = document.getElementById('navMandi');
  if (navMandi && openMandiFeature) navMandi.addEventListener('click', () => openMandiFeature.click());

  const navSchemes = document.getElementById('navSchemes');
  if (navSchemes && openSchemesFeature) navSchemes.addEventListener('click', () => openSchemesFeature.click());

  const navDisease = document.getElementById('navDisease');
  if (navDisease && openDiseaseFeature) navDisease.addEventListener('click', () => openDiseaseFeature.click());

  const navFertilizers = document.getElementById('navFertilizers');
  if (navFertilizers && typeof openFertilizers !== 'undefined' && openFertilizers) navFertilizers.addEventListener('click', () => openFertilizers.click());

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

});  // Mandi Location Feature
  const mandiLocInput = document.getElementById('mandiLocationInput');
  const mandiLocBtn = document.getElementById('mandiLocationBtn');
  const mandiLocText = document.getElementById('currentMandiLocation');
  const mandiLocName = document.getElementById('mandiLocName');

  if (mandiLocBtn && mandiLocInput) {
      mandiLocBtn.addEventListener('click', () => {
          const loc = mandiLocInput.value.trim();
          if (loc) {
              mandiLocBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
              setTimeout(() => {
                  mandiLocBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass-location"></i>';
                  mandiLocName.textContent = loc + ' Mandi';
                  mandiLocText.style.display = 'block';
                  
                  const priceElements = document.querySelectorAll('.mandi-card strong, #mandiList .rates strong');
                  priceElements.forEach(el => {
                      const basePrice = parseInt(el.textContent.replace(/\D/g, '')) || 2000;
                      const randomVariation = Math.floor(Math.random() * 400) - 200;
                      const newPrice = Math.max(500, basePrice + randomVariation);
                      el.textContent = '₹' + newPrice + '/क्विंटल';
                      el.style.color = '#10b981';
                      el.style.transition = 'color 0.5s';
                      setTimeout(() => { el.style.color = ''; }, 1000);
                  });
                  
                  if (typeof showToast === 'function') {
                      showToast('Live rates updated for ' + loc + ' Mandi!');
                  }
                  mandiLocInput.value = '';
              }, 800);
          } else {
              if (typeof showToast === 'function') {
                  showToast('Please enter a mandi location.');
              }
          }
      });
  }
