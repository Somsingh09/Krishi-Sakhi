document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formResponse = document.getElementById('formResponse');
    
    // Toast helper
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg, isError = false) {
        clearTimeout(toastTimer);
        toast.textContent = msg;
        toast.className = 'toast show';
        if (isError) toast.style.backgroundColor = '#DC2626'; // red
        else toast.style.backgroundColor = '#333'; // default dark
        
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill all fields', true);
                return;
            }

            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json();

                if (data.success) {
                    showToast('Message sent successfully! We will get back to you soon.');
                    contactForm.reset();
                } else {
                    showToast(data.message || 'Failed to send message', true);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                showToast('Network error, please try again later', true);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});
