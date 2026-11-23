// Redirect if already logged in
if (localStorage.getItem('token') && localStorage.getItem('user')) {
    window.location.href = 'dashboard.html';
}

function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
    });
    document.getElementById('login-tab').classList.toggle('active', tab === 'login');
    document.getElementById('register-tab').classList.toggle('active', tab === 'register');
    // Clear alerts on tab switch
    document.getElementById('login-alert').classList.add('hidden');
    document.getElementById('register-alert').classList.add('hidden');
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    icon.classList.toggle('fa-eye', !isPassword);
    icon.classList.toggle('fa-eye-slash', isPassword);
}

function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    el.className = `alert alert-${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
    el.classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    document.getElementById('login-alert').classList.add('hidden');

    try {
        const data = await api.login({
            username: document.getElementById('loginUsername').value.trim(),
            password: document.getElementById('loginPassword').value
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            roles: Array.from(data.roles || [])
        }));

        window.location.href = 'dashboard.html';
    } catch (err) {
        showAlert('login-alert', err.message || 'Invalid username or password');
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span><i class="fas fa-arrow-right"></i>';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const btn = document.getElementById('registerBtn');
    const password = document.getElementById('regPassword').value;
    const username = document.getElementById('regUsername').value.trim();

    if (username.length < 3) {
        showAlert('register-alert', 'Username must be at least 3 characters');
        return;
    }
    if (password.length < 6) {
        showAlert('register-alert', 'Password must be at least 6 characters');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    document.getElementById('register-alert').classList.add('hidden');

    try {
        await api.register({
            username,
            email: document.getElementById('regEmail').value.trim(),
            password,
            fullName: document.getElementById('regFullName').value.trim(),
            phone: document.getElementById('regPhone').value.trim()
        });

        showAlert('register-alert', 'Account created successfully! Please sign in.', 'success');
        document.getElementById('registerForm').reset();
        setTimeout(() => showTab('login'), 1800);
    } catch (err) {
        showAlert('register-alert', err.message || 'Registration failed. Please try again.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Create Account</span><i class="fas fa-user-plus"></i>';
    }
}

function socialLogin(provider) {
    showToastAuth(`${provider} login coming soon!`);
}

function showToastAuth(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4f46e5;color:white;padding:14px 20px;border-radius:10px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:9999;';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
}
