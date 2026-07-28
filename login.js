/*==================================================
    KRISHI SAKHI — LOGIN / SIGN UP LOGIC
==================================================*/

document.addEventListener('DOMContentLoaded', () => {

    /*=========================
        0. THEME SYNC (matches main site)
    =========================*/
    const THEME_KEY = 'krishiSakhiTheme';
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');

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

    themeToggle.addEventListener('click', () => {
        const next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });

    /*=========================
        1. TOAST HELPER
    =========================*/
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
    }

    /*=========================
        1b. ALREADY LOGGED IN?
    =========================*/
    const existing = localStorage.getItem('krishiSakhiUser');
    if (existing) {
        try {
            const user = JSON.parse(existing);
            document.getElementById('stepDetails').insertAdjacentHTML('afterbegin', `
                <div class="session-banner">
                    You're already signed in as <strong>${user.name}</strong>.
                    <button type="button" id="continueSession" class="link-btn">Go to dashboard</button>
                    <span class="dot">·</span>
                    <button type="button" id="clearSession" class="link-btn">Use a different account</button>
                </div>
            `);
            document.getElementById('continueSession').addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
            document.getElementById('clearSession').addEventListener('click', () => {
                localStorage.removeItem('krishiSakhiUser');
                document.querySelector('.session-banner')?.remove();
                showToast('Signed out. You can log in again below.');
            });
        } catch (e) { /* ignore malformed session */ }
    }

    /*=========================
        2. ELEMENTS
    =========================*/
    const stepDetails = document.getElementById('stepDetails');
    const stepOtp = document.getElementById('stepOtp');
    const stepSuccess = document.getElementById('stepSuccess');
    const growFill = document.getElementById('growFill');
    const stages = document.querySelectorAll('.grow-stage');

    const fullName = document.getElementById('fullName');
    const village = document.getElementById('village');
    const district = document.getElementById('district');
    const stateSel = document.getElementById('state');
    const pincode = document.getElementById('pincode');
    const mobile = document.getElementById('mobile');

    const mobileDisplay = document.getElementById('mobileDisplay');
    const welcomeName = document.getElementById('welcomeName');
    const otpBoxes = [...document.querySelectorAll('.otp-box')];
    const resendBtn = document.getElementById('resendBtn');
    const resendTimerEl = document.getElementById('resendTimer');

    let generatedOtp = '';
    let resendInterval;

    /*=========================
        3. VALIDATION HELPERS
    =========================*/
    function setError(id, msg) {
        const el = document.getElementById('err-' + id);
        const input = document.getElementById(id);
        if (el) el.textContent = msg;
        if (input) input.closest('.input-group')?.classList.toggle('invalid', !!msg);
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
        document.querySelectorAll('.input-group').forEach(g => g.classList.remove('invalid'));
    }

    function validateDetails() {
        clearErrors();
        let valid = true;

        if (fullName.value.trim().length < 3) {
            setError('fullName', 'Please enter your full name');
            valid = false;
        }
        if (village.value.trim().length < 2) {
            setError('village', 'Please enter your village / area');
            valid = false;
        }
        if (district.value.trim().length < 2) {
            setError('district', 'Please enter your district');
            valid = false;
        }
        if (!stateSel.value) {
            setError('state', 'Please select your state');
            valid = false;
        }
        if (!/^\d{6}$/.test(pincode.value.trim())) {
            setError('pincode', 'Enter a valid 6-digit pincode');
            valid = false;
        }
        if (!/^[6-9]\d{9}$/.test(mobile.value.trim())) {
            setError('mobile', 'Enter a valid 10-digit mobile number');
            valid = false;
        }
        return valid;
    }

    /*=========================
        4. STEP / STEPPER CONTROL
    =========================*/
    function goToStep(n) {
        [stepDetails, stepOtp, stepSuccess].forEach(s => s.classList.remove('active'));
        if (n === 1) stepDetails.classList.add('active');
        if (n === 2) stepOtp.classList.add('active');
        if (n === 3) stepSuccess.classList.add('active');

        growFill.style.width = n === 1 ? '0%' : n === 2 ? '50%' : '100%';
        stages.forEach(stage => {
            const stageNum = Number(stage.dataset.stage);
            stage.classList.toggle('active', stageNum === n);
            stage.classList.toggle('done', stageNum < n);
        });
    }

    /*=========================
        5. STEP 1 -> SEND OTP
    =========================*/
    document.getElementById('stepDetails').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateDetails()) {
            showToast('Please fix the highlighted fields');
            return;
        }

        mobileDisplay.textContent = mobile.value.trim();
        generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

        // Demo only: in production the OTP is sent via SMS gateway, never shown client-side.
        showToast(`OTP sent! (Demo code: ${generatedOtp})`);

        otpBoxes.forEach(b => b.value = '');
        goToStep(2);
        startResendTimer();
        setTimeout(() => otpBoxes[0].focus(), 400);
    });

    /*=========================
        6. OTP BOX BEHAVIOUR
    =========================*/
    otpBoxes.forEach((box, i) => {
        box.addEventListener('input', () => {
            box.value = box.value.replace(/\D/g, '').slice(0, 1);
            if (box.value && otpBoxes[i + 1]) otpBoxes[i + 1].focus();
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && otpBoxes[i - 1]) {
                otpBoxes[i - 1].focus();
            }
        });

        box.addEventListener('paste', (e) => {
            e.preventDefault();
            const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, 6);
            digits.forEach((d, idx) => { if (otpBoxes[idx]) otpBoxes[idx].value = d; });
            const next = otpBoxes[Math.min(digits.length, 5)];
            if (next) next.focus();
        });
    });

    /*=========================
        7. RESEND TIMER
    =========================*/
    function startResendTimer() {
        let secs = 30;
        resendBtn.disabled = true;
        resendTimerEl.textContent = secs;
        clearInterval(resendInterval);

        resendInterval = setInterval(() => {
            secs -= 1;
            if (secs <= 0) {
                clearInterval(resendInterval);
                resendBtn.disabled = false;
                resendBtn.innerHTML = 'Resend OTP';
            } else {
                resendBtn.innerHTML = `Resend in <span id="resendTimer">${secs}</span>s`;
            }
        }, 1000);
    }

    resendBtn.addEventListener('click', () => {
        generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        showToast(`New OTP sent! (Demo code: ${generatedOtp})`);
        otpBoxes.forEach(b => b.value = '');
        otpBoxes[0].focus();
        startResendTimer();
    });

    /*=========================
        8. EDIT MOBILE / BACK
    =========================*/
    document.getElementById('editMobile').addEventListener('click', () => {
        clearInterval(resendInterval);
        goToStep(1);
        mobile.focus();
    });
    document.getElementById('backToDetails').addEventListener('click', () => {
        clearInterval(resendInterval);
        goToStep(1);
    });

    /*=========================
        9. VERIFY OTP -> SUCCESS
    =========================*/
    document.getElementById('stepOtp').addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = otpBoxes.map(b => b.value).join('');

        if (entered.length < 6) {
            document.getElementById('err-otp').textContent = 'Enter the complete 6-digit code';
            showToast('Please fill all 6 digits');
            return;
        }

        if (entered !== generatedOtp) {
            document.getElementById('err-otp').textContent = 'Incorrect OTP. Please try again.';
            otpBoxes.forEach(b => b.value = '');
            otpBoxes[0].focus();
            showToast('That code did not match');
            return;
        }

        document.getElementById('err-otp').textContent = '';
        clearInterval(resendInterval);
        welcomeName.textContent = fullName.value.trim().split(' ')[0] || 'Farmer';
        goToStep(3);

        // Save the session so index.html knows who's logged in.
        const session = {
            name: fullName.value.trim(),
            mobile: mobile.value.trim(),
            village: village.value.trim(),
            district: district.value.trim(),
            state: stateSel.value,
            pincode: pincode.value.trim(),
            loggedInAt: Date.now()
        };
        localStorage.setItem('krishiSakhiUser', JSON.stringify(session));

        // Redirect to the farmer dashboard after a short pause.
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 2600);
    });

    /*=========================
        10. LIVE INPUT CLEANUP
    =========================*/
    mobile.addEventListener('input', () => mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10));
    pincode.addEventListener('input', () => pincode.value = pincode.value.replace(/\D/g, '').slice(0, 6));

});