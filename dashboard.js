/*==================================================
    KRISHI SAKHI — DASHBOARD LOGIC
==================================================*/

document.addEventListener('DOMContentLoaded', () => {

    /*=========================
        0. AUTH GUARD
    =========================*/
    const USER_KEY = 'krishiSakhiUser';
    let user;
    try {
        user = JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
        user = null;
    }

    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    /*=========================
        1. THEME SYNC
    =========================*/
    const THEME_KEY = 'krishiSakhiTheme';
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        themeToggle.innerHTML = theme === 'dark'
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
    }
    const savedTheme = localStorage.getItem(THEME_KEY) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });

    /*=========================
        2. TOAST
    =========================*/
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    /*=========================
        3. POPULATE USER INFO
    =========================*/
    const firstName = user.name.split(' ')[0];
    const initial = firstName.charAt(0).toUpperCase();

    document.getElementById('topAvatar').textContent = initial;
    document.getElementById('topName').textContent = firstName;
    document.getElementById('topArea').textContent = user.area || '—';
    document.getElementById('welcomeText').textContent = `Namaste, ${firstName} 🙏`;

    document.getElementById('profileAvatar').textContent = initial;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileMobile').textContent = `+91 ${user.mobile}`;
    document.getElementById('profileArea').textContent = user.area || '—';
    document.getElementById('profileFarmerType').textContent = user.farmerType || '—';
    document.getElementById('profileDistrict').textContent = user.district || '—';
    document.getElementById('profileState').textContent = user.state || '—';
    document.getElementById('profilePincode').textContent = user.pincode || '—';

    document.getElementById('pageDate').textContent = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    function logout() {
        localStorage.removeItem(USER_KEY);
        window.location.href = 'login.html';
    }
    document.getElementById('sidebarLogout').addEventListener('click', logout);
    document.getElementById('profileLogout').addEventListener('click', logout);

    /*=========================
        4. SIDEBAR NAV + MOBILE TOGGLE
    =========================*/
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.dash-section');
    const pageTitle = document.getElementById('pageTitle');

    function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); }
    function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

    menuBtn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    function setActive(target) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.target === target));
        const link = [...navLinks].find(l => l.dataset.target === target);
        if (link) pageTitle.textContent = link.textContent.trim();
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.target);
            target.scrollIntoView({ behavior: 'smooth' });
            setActive(link.dataset.target);
            closeSidebar();
        });
    });

    document.querySelectorAll('[data-target]').forEach(el => {
        if (el.tagName !== 'A') {
            el.addEventListener('click', () => {
                const target = document.getElementById(el.dataset.target);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    setActive(el.dataset.target);
                }
            });
        }
    });

    // Highlight sidebar link as sections scroll into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(sec => observer.observe(sec));

    document.getElementById('quickChatBtn').addEventListener('click', () => {
        showToast('AI chat assistant coming soon on the dashboard 🌱');
    });
    document.getElementById('chatFab').addEventListener('click', () => {
        showToast('AI chat assistant coming soon on the dashboard 🌱');
    });

    document.getElementById('notifBtn').addEventListener('click', () => {
        showToast('🔔 You have 2 new notifications: "Weather alert: light rain expected tomorrow" and "New PM Kisan updates".');
        document.querySelector('.notif-dot').style.display = 'none'; // clear notification dot
    });

    /*=========================
        5. LIVE WEATHER (Open-Meteo — free, no key)
    =========================*/
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherDesc = document.getElementById('weatherDesc');
    const weatherHumidity = document.getElementById('weatherHumidity');
    const weatherRain = document.getElementById('weatherRain');
    const weatherWind = document.getElementById('weatherWind');
    const weatherSun = document.getElementById('weatherSun');
    const statTemp = document.getElementById('statTemp');

    const WMO_MAP = {
        0: ['☀️', 'Clear Sky'], 1: ['🌤️', 'Mainly Clear'], 2: ['⛅', 'Partly Cloudy'], 3: ['☁️', 'Overcast'],
        45: ['🌫️', 'Fog'], 48: ['🌫️', 'Rime Fog'],
        51: ['🌦️', 'Light Drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Dense Drizzle'],
        61: ['🌧️', 'Light Rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy Rain'],
        71: ['❄️', 'Light Snow'], 73: ['❄️', 'Snow'], 75: ['❄️', 'Heavy Snow'],
        80: ['🌧️', 'Rain Showers'], 81: ['🌧️', 'Heavy Showers'], 82: ['⛈️', 'Violent Showers'],
        95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Thunderstorm w/ Hail'], 99: ['⛈️', 'Severe Thunderstorm']
    };
    function weatherFromCode(code) { return WMO_MAP[code] || ['🌡️', 'Weather']; }

    function applyWeatherTheme(code) {
        const card = document.querySelector('.weather-card');
        if (!card) return;
        
        card.classList.remove('theme-sunny', 'theme-cloudy', 'theme-rainy', 'theme-snowy', 'theme-thunderstorm');
        
        if (code <= 1) card.classList.add('theme-sunny');
        else if (code <= 3 || code === 45 || code === 48) card.classList.add('theme-cloudy');
        else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) card.classList.add('theme-rainy');
        else if (code >= 71 && code <= 77) card.classList.add('theme-snowy');
        else if (code >= 95 && code <= 99) card.classList.add('theme-thunderstorm');
        else card.classList.add('theme-cloudy');
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

    async function loadWeather(lat, lon, placeNameFallback) {
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
                `&daily=sunrise,sunset,precipitation_probability_max&timezone=auto&forecast_days=1`;

            const res = await fetch(url);
            if (!res.ok) throw new Error('Weather API error');
            const data = await res.json();
            const [icon, desc] = weatherFromCode(data.current.weather_code);

            weatherIcon.textContent = icon;
            weatherTemp.textContent = `${Math.round(data.current.temperature_2m)}°C`;
            statTemp.textContent = `${Math.round(data.current.temperature_2m)}°C`;
            weatherDesc.textContent = desc;
            weatherHumidity.textContent = `${data.current.relative_humidity_2m}%`;
            weatherRain.textContent = `${data.daily.precipitation_probability_max[0] ?? 0}%`;
            weatherWind.textContent = `${Math.round(data.current.wind_speed_10m)} km/h`;
            weatherSun.textContent = `${formatTime(data.daily.sunrise[0])} / ${formatTime(data.daily.sunset[0])}`;

            applyWeatherTheme(data.current.weather_code);

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
        }
    }

    const DEFAULT_LAT = 25.7573, DEFAULT_LON = 82.6844; // Jaunpur, UP fallback
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude, user.district || 'Your Location'),
            () => loadWeather(DEFAULT_LAT, DEFAULT_LON, user.district || 'Jaunpur, Uttar Pradesh'),
            { timeout: 6000 }
        );
    } else {
        loadWeather(DEFAULT_LAT, DEFAULT_LON, user.district || 'Jaunpur, Uttar Pradesh');
    }

    /*=========================
        6. MY CROPS (per-user, saved to localStorage)
    =========================*/
    const cropInput = document.getElementById('cropInput');
    const cropAddBtn = document.getElementById('cropAddBtn');
    const cropList = document.getElementById('cropList');
    const cropEmptyHint = document.getElementById('cropEmptyHint');
    const CROPS_KEY = `krishiSakhiCrops_${user.mobile}`;

    function loadCrops() {
        try { return JSON.parse(localStorage.getItem(CROPS_KEY)) || []; }
        catch { return []; }
    }
    function saveCrops(crops) {
        localStorage.setItem(CROPS_KEY, JSON.stringify(crops));
    }
    function renderCrops() {
        const crops = loadCrops();
        cropList.innerHTML = '';
        cropEmptyHint.classList.toggle('show', crops.length === 0);
        crops.forEach((crop, i) => {
            const chip = document.createElement('div');
            chip.className = 'crop-chip';
            chip.innerHTML = `🌾 ${crop} <button data-i="${i}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>`;
            cropList.appendChild(chip);
        });
        cropList.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const crops = loadCrops();
                crops.splice(Number(btn.dataset.i), 1);
                saveCrops(crops);
                renderCrops();
            });
        });
    }
    function addCrop() {
        const val = cropInput.value.trim();
        if (!val) { showToast('Please enter a crop name'); return; }
        const crops = loadCrops();
        crops.push(val);
        saveCrops(crops);
        cropInput.value = '';
        renderCrops();
        showToast(`${val} added to your crops`);
    }
    cropAddBtn.addEventListener('click', addCrop);
    cropInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCrop(); });
    renderCrops();

    /*=========================
        7. DISEASE DETECTION (simulated analysis)
    =========================*/
    const cropImageInput = document.getElementById('crop-image');
    const previewImg = document.getElementById('previewImg');
    const uploadContent = document.getElementById('uploadContent');
    const diseaseResult = document.getElementById('diseaseResult');
    const statReports = document.getElementById('statReports');
    const REPORTS_KEY = `krishiSakhiReports_${user.mobile}`;

    let reportCount = Number(localStorage.getItem(REPORTS_KEY) || 0);
    statReports.textContent = reportCount;

    const SAMPLE_RESULTS = [
        { status: 'Healthy Leaf', color: '#1B8A43', note: 'No visible signs of disease. Keep monitoring weekly and maintain regular irrigation.' },
        { status: 'Early Blight Detected', color: '#B78103', note: 'Brown concentric spots detected. Apply a recommended fungicide and remove affected leaves.' },
        { status: 'Leaf Rust Detected', color: '#DC2626', note: 'Orange pustules found on the leaf surface. Isolate affected plants and consult your local Krishi Kendra.' }
    ];

    cropImageInput.addEventListener('change', () => {
        const file = cropImageInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.classList.add('show');
            uploadContent.style.display = 'none';
        };
        reader.readAsDataURL(file);

        diseaseResult.innerHTML = `
            <div class="result-placeholder">
                <div class="spinner-inline"></div>
                <p>Analyzing your crop image…</p>
            </div>
        `;

        // Simulated analysis delay — replace with a real fetch() to your AI model endpoint.
        setTimeout(() => {
            const result = SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)];
            diseaseResult.innerHTML = `
                <div class="result-content">
                    <span class="r-status" style="background:${result.color}20; color:${result.color}">
                        <i class="fa-solid fa-circle-check"></i> ${result.status}
                    </span>
                    <h4>Analysis Complete</h4>
                    <p>${result.note}</p>
                </div>
            `;
            reportCount += 1;
            localStorage.setItem(REPORTS_KEY, reportCount);
            statReports.textContent = reportCount;
            showToast('Analysis complete');
        }, 1800);
    });

    ['dragover', 'dragleave', 'drop'].forEach(evt => {
        document.getElementById('uploadBox').addEventListener(evt, (e) => e.preventDefault());
    });
    document.getElementById('uploadBox').addEventListener('drop', (e) => {
        if (e.dataTransfer.files[0]) {
            cropImageInput.files = e.dataTransfer.files;
            cropImageInput.dispatchEvent(new Event('change'));
        }
    });

    /*=========================
        8. MANDI SEARCH
    =========================*/
    const mandiSearch = document.getElementById('mandiSearch');
    const mandiCards = [...document.querySelectorAll('.mandi-card')];
    const mandiNoResults = document.getElementById('mandiNoResults');

    mandiSearch.addEventListener('input', () => {
        const q = mandiSearch.value.trim().toLowerCase();
        let visible = 0;
        mandiCards.forEach(card => {
            const match = card.dataset.name.toLowerCase().includes(q);
            card.style.display = match ? '' : 'none';
            if (match) visible++;
        });
        mandiNoResults.style.display = visible === 0 ? 'block' : 'none';
    });

});
    /*=========================
        10. MARKETPLACE TABS
    =========================*/
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-content').style.display = 'block';
        });
    });

    const dashToolSearchBtn = document.getElementById('dashToolSearchBtn');
    const dashToolSearch = document.getElementById('dashToolSearch');
    if (dashToolSearchBtn && dashToolSearch) {
        dashToolSearchBtn.addEventListener('click', () => {
            if (!dashToolSearch.value.trim()) {
                showToast('Please enter a location to search.');
                return;
            }
            showToast('Searching tools in ' + dashToolSearch.value + '...');
        });
    }

