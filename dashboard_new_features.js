// NEW FEATURES FOR KRISHI SAKHI MVP: Farms, Crops, Activities, Expenses, Reminders

document.addEventListener('DOMContentLoaded', async () => {
    const USER_KEY = 'krishiSakhiUser';
    let user;
    try {
        user = JSON.parse(localStorage.getItem(USER_KEY));
    } catch (e) {
        return; // Handled by dashboard.js
    }
    
    if (!user) return;
    const userId = user.id || user._id; // depending on backend

    // Utility for toasts
    const toast = document.getElementById('toast');
    let toastTimer;
    function showToast(msg) {
        clearTimeout(toastTimer);
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
        }
    }

    // Common fetch wrapper
    async function apiFetch(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            return await res.json();
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Network error' };
        }
    }

    /*==================================================
        FARMS & CROPS MANAGEMENT
    ==================================================*/
    const farmAddBtn = document.getElementById('farmAddBtn');
    const farmList = document.getElementById('farmList');
    const farmEmptyHint = document.getElementById('farmEmptyHint');
    const cropFarmSelect = document.getElementById('cropFarmSelect');
    const activityCropSelect = document.getElementById('activityCropSelect');
    const expenseCropSelect = document.getElementById('expenseCropSelect');

    async function loadFarms() {
        const data = await apiFetch(`/api/farms/user/${userId}`);
        if (data.success) {
            renderFarms(data.farms);
            populateFarmSelects(data.farms);
        }
    }

    function renderFarms(farms) {
        farmList.innerHTML = '';
        if (farms.length === 0) {
            farmEmptyHint.style.display = 'block';
            return;
        }
        farmEmptyHint.style.display = 'none';
        farms.forEach(farm => {
            const el = document.createElement('div');
            el.className = 'tip-card';
            el.innerHTML = `
                <h4><i class="fa-solid fa-map-location-dot" style="color:var(--primary);"></i> ${farm.name}</h4>
                <p><strong>Size:</strong> ${farm.size} Acres | <strong>Soil:</strong> ${farm.soilType} | <strong>Irrigation:</strong> ${farm.irrigationType}</p>
            `;
            farmList.appendChild(el);
        });
    }

    function populateFarmSelects(farms) {
        if (!cropFarmSelect) return;
        cropFarmSelect.innerHTML = '<option value="">Select Farm...</option>';
        farms.forEach(f => {
            cropFarmSelect.innerHTML += `<option value="${f._id}">${f.name}</option>`;
        });
    }

    if (farmAddBtn) {
        farmAddBtn.addEventListener('click', async () => {
            const name = document.getElementById('farmNameInput').value;
            const size = document.getElementById('farmSizeInput').value;
            const soilType = document.getElementById('farmSoilInput').value;
            const irrigationType = document.getElementById('farmIrrigationInput').value;

            if (!name || !size) return showToast('Please enter Farm Name and Size');

            const res = await apiFetch('/api/farms', {
                method: 'POST',
                body: JSON.stringify({ userId, name, size, soilType, irrigationType })
            });

            if (res.success) {
                showToast('Farm added successfully!');
                document.getElementById('farmNameInput').value = '';
                document.getElementById('farmSizeInput').value = '';
                loadFarms();
            } else {
                showToast('Failed to add farm');
            }
        });
    }

    const cropInstanceAddBtn = document.getElementById('cropInstanceAddBtn');
    const cropInstanceList = document.getElementById('cropInstanceList');
    const cropInstanceEmptyHint = document.getElementById('cropInstanceEmptyHint');

    async function loadCrops() {
        const data = await apiFetch(`/api/farms/user/${userId}/crops`);
        if (data.success) {
            renderCrops(data.crops);
            populateCropSelects(data.crops);
        }
    }

    function renderCrops(crops) {
        if(!cropInstanceList) return;
        cropInstanceList.innerHTML = '';
        if (crops.length === 0) {
            cropInstanceEmptyHint.style.display = 'block';
            return;
        }
        cropInstanceEmptyHint.style.display = 'none';
        crops.forEach(crop => {
            const el = document.createElement('div');
            el.className = 'crop-item';
            el.style.background = '#f8fafc';
            el.style.padding = '15px';
            el.style.borderRadius = '8px';
            el.style.marginBottom = '10px';
            el.style.borderLeft = '4px solid var(--primary)';
            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong>${crop.cropName}</strong> <span style="font-size:0.8rem; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${crop.season}</span>
                        <p style="margin:5px 0 0 0; font-size:0.9rem;">Planted: ${new Date(crop.plantingDate).toLocaleDateString()} | Area: ${crop.areaPlanted} Acres</p>
                    </div>
                    <div>
                        <span style="background:${crop.status === 'Active' ? '#dcfce7' : '#e2e8f0'}; color:${crop.status === 'Active' ? '#166534' : '#475569'}; padding:4px 8px; border-radius:12px; font-size:0.8rem; font-weight:bold;">${crop.status}</span>
                    </div>
                </div>
            `;
            cropInstanceList.appendChild(el);
        });
    }

    function populateCropSelects(crops) {
        const activeCrops = crops.filter(c => c.status === 'Active');
        if (activityCropSelect) {
            activityCropSelect.innerHTML = '<option value="">Select Crop...</option>';
            activeCrops.forEach(c => activityCropSelect.innerHTML += `<option value="${c._id}">${c.cropName} (${c.season})</option>`);
        }
        if (expenseCropSelect) {
            expenseCropSelect.innerHTML = '<option value="">Select Crop...</option>';
            activeCrops.forEach(c => expenseCropSelect.innerHTML += `<option value="${c._id}">${c.cropName} (${c.season})</option>`);
        }
    }

    if (cropInstanceAddBtn) {
        cropInstanceAddBtn.addEventListener('click', async () => {
            const farmId = document.getElementById('cropFarmSelect').value;
            const cropName = document.getElementById('cropNameInput').value;
            const season = document.getElementById('cropSeasonInput').value;
            const areaPlanted = document.getElementById('cropAreaInput').value;
            const plantingDate = document.getElementById('cropDateInput').value;

            if (!farmId || !cropName || !areaPlanted || !plantingDate) return showToast('Please fill all crop details');

            const res = await apiFetch('/api/farms/crop', {
                method: 'POST',
                body: JSON.stringify({ farmId, userId, cropName, season, areaPlanted, plantingDate })
            });

            if (res.success) {
                showToast('Crop added successfully!');
                document.getElementById('cropNameInput').value = '';
                document.getElementById('cropAreaInput').value = '';
                loadCrops();
            } else {
                showToast('Failed to add crop');
            }
        });
    }

    /*==================================================
        ACTIVITIES & EXPENSES
    ==================================================*/
    const activityAddBtn = document.getElementById('activityAddBtn');
    if (activityAddBtn) {
        activityAddBtn.addEventListener('click', async () => {
            const cropInstanceId = document.getElementById('activityCropSelect').value;
            const activityType = document.getElementById('activityTypeInput').value;
            const date = document.getElementById('activityDateInput').value;
            const notes = document.getElementById('activityNotesInput').value;

            if (!cropInstanceId || !date) return showToast('Please select crop and date');

            const res = await apiFetch('/api/farms/activity', {
                method: 'POST',
                body: JSON.stringify({ cropInstanceId, activityType, date, notes })
            });

            if (res.success) {
                showToast('Activity logged!');
                document.getElementById('activityDateInput').value = '';
                document.getElementById('activityNotesInput').value = '';
                loadExpensesAndHistory(); // Refresh history
            } else {
                showToast('Failed to log activity');
            }
        });
    }

    const expenseAddBtn = document.getElementById('expenseAddBtn');
    if (expenseAddBtn) {
        expenseAddBtn.addEventListener('click', async () => {
            const cropInstanceId = document.getElementById('expenseCropSelect').value;
            const category = document.getElementById('expenseCategoryInput').value;
            const amount = document.getElementById('expenseAmountInput').value;
            const date = document.getElementById('expenseDateInput').value;
            const notes = document.getElementById('expenseNotesInput').value;

            if (!cropInstanceId || !amount || !date) return showToast('Please fill crop, amount, and date');

            const res = await apiFetch('/api/farms/expense', {
                method: 'POST',
                body: JSON.stringify({ cropInstanceId, userId, category, amount, date, notes })
            });

            if (res.success) {
                showToast('Expense logged!');
                document.getElementById('expenseAmountInput').value = '';
                document.getElementById('expenseDateInput').value = '';
                document.getElementById('expenseNotesInput').value = '';
                loadExpensesAndHistory();
            } else {
                showToast('Failed to log expense');
            }
        });
    }

    async function loadExpensesAndHistory() {
        const historyList = document.getElementById('historyList');
        const totalExpensesHist = document.getElementById('totalExpensesHist');
        if (!historyList) return;

        const data = await apiFetch(`/api/farms/user/${userId}/expenses`);
        if (data.success) {
            const expenses = data.expenses;
            historyList.innerHTML = '';
            let total = 0;
            if (expenses.length === 0) {
                historyList.innerHTML = '<p class="empty-hint" style="display:block;">No expenses logged yet.</p>';
            } else {
                expenses.forEach(exp => {
                    total += exp.amount;
                    const el = document.createElement('div');
                    el.className = 'tip-card';
                    el.innerHTML = `
                        <div style="display:flex; justify-content:space-between;">
                            <div>
                                <strong>${exp.category}</strong> <span style="color:#64748b; font-size:0.9rem;">- ${exp.cropInstanceId?.cropName || 'Unknown Crop'}</span>
                                <p style="margin:5px 0 0 0; font-size:0.85rem;">${new Date(exp.date).toLocaleDateString()} | ${exp.notes || ''}</p>
                            </div>
                            <div style="color:#DC2626; font-weight:bold;">₹${exp.amount}</div>
                        </div>
                    `;
                    historyList.appendChild(el);
                });
            }
            totalExpensesHist.textContent = `₹${total}`;
        }
    }

    /*==================================================
        REMINDERS
    ==================================================*/
    const reminderAddBtn = document.getElementById('reminderAddBtn');
    const reminderList = document.getElementById('reminderList');
    const reminderEmptyHint = document.getElementById('reminderEmptyHint');

    async function loadReminders() {
        const data = await apiFetch(`/api/farms/user/${userId}/reminders`);
        if (data.success) {
            renderReminders(data.reminders);
        }
    }

    function renderReminders(reminders) {
        if (!reminderList) return;
        reminderList.innerHTML = '';
        if (reminders.length === 0) {
            reminderEmptyHint.style.display = 'block';
            return;
        }
        reminderEmptyHint.style.display = 'none';
        reminders.forEach(rem => {
            const el = document.createElement('div');
            el.className = 'tip-card';
            el.style.opacity = rem.isCompleted ? '0.6' : '1';
            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="text-decoration: ${rem.isCompleted ? 'line-through' : 'none'}; margin:0;">${rem.title}</h4>
                        <p style="margin:5px 0 0 0; font-size:0.85rem;">Due: ${new Date(rem.dueDate).toLocaleDateString()} | ${rem.description}</p>
                    </div>
                    <button class="primary-btn toggle-rem-btn" data-id="${rem._id}" style="background:${rem.isCompleted ? '#e2e8f0' : 'var(--primary)'}; color:${rem.isCompleted ? '#475569' : 'white'}; padding:8px; border:none; border-radius:50%; cursor:pointer;">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            `;
            reminderList.appendChild(el);
        });

        document.querySelectorAll('.toggle-rem-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const res = await apiFetch(`/api/farms/reminder/${id}/toggle`, { method: 'PUT' });
                if (res.success) loadReminders();
            });
        });
    }

    if (reminderAddBtn) {
        reminderAddBtn.addEventListener('click', async () => {
            const title = document.getElementById('reminderTitleInput').value;
            const description = document.getElementById('reminderDescInput').value;
            const dueDate = document.getElementById('reminderDateInput').value;

            if (!title || !dueDate) return showToast('Please enter Title and Due Date');

            const res = await apiFetch('/api/farms/reminder', {
                method: 'POST',
                body: JSON.stringify({ userId, title, description, dueDate })
            });

            if (res.success) {
                showToast('Reminder added!');
                document.getElementById('reminderTitleInput').value = '';
                document.getElementById('reminderDescInput').value = '';
                document.getElementById('reminderDateInput').value = '';
                loadReminders();
            } else {
                showToast('Failed to add reminder');
            }
        });
    }

    // INITIAL LOAD
    loadFarms();
    loadCrops();
    loadExpensesAndHistory();
    loadReminders();

    // Tab switching logic for new sections (if not handled by main js)
    document.querySelectorAll('.marketplace-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            if (!tabId) return;
            const parentSection = e.target.closest('.dash-section');
            if (parentSection) {
                parentSection.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                parentSection.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
                e.target.classList.add('active');
                const content = document.getElementById(tabId + '-content');
                if (content) content.style.display = 'block';
            }
        });
    });

});
