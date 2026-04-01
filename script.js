// Data Storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
let payments = JSON.parse(localStorage.getItem('payments')) || [];
let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

// Initialize demo admin if no users
if (students.length === 0) {
    const adminUser = {
        id: Date.now(),
        fullName: 'Admin User',
        email: 'admin@forexacademy.com',
        country: 'Ethiopia',
        city: 'Addis Ababa',
        phone: '0912345678',
        password: 'admin123',
        registeredAt: new Date().toISOString(),
        isAdmin: true
    };
    students.push(adminUser);
    localStorage.setItem('students', JSON.stringify(students));
}

// Page Navigation
function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active-page');
        page.style.display = 'none';
    });
    
    const selectedPage = document.getElementById(pageName);
    if (selectedPage) {
        selectedPage.style.display = 'block';
        selectedPage.classList.add('active-page');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(pageName.toLowerCase())) {
            link.classList.add('active');
        }
    });
    
    // Update URL hash
    window.location.hash = pageName;
    
    // Update dashboard if needed
    if (pageName === 'dashboard' && currentUser) {
        updateDashboard();
    }
    
    // Load settings if needed
    if (pageName === 'settings' && currentUser) {
        loadSettings();
    }
    
    // Update student count on home
    if (pageName === 'home') {
        updateStudentCount();
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('show');
}

// Update student count on home page
function updateStudentCount() {
    const studentCountSpan = document.getElementById('studentCount');
    if (studentCountSpan) {
        studentCountSpan.textContent = students.length;
    }
}

// Sign Up
document.getElementById('signupForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    // Check if email already exists
    if (students.some(s => s.email === document.getElementById('email').value)) {
        showMessage('Email already registered!', 'error');
        return;
    }
    
    const student = {
        id: Date.now(),
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        country: document.getElementById('country').value,
        city: document.getElementById('city').value,
        phone: document.getElementById('phone').value,
        password: password,
        registeredAt: new Date().toISOString(),
        isAdmin: false,
        coursesEnrolled: 0,
        completedLessons: 0,
        certificates: 0
    };
    
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    showMessage('Account created successfully! Please login.', 'success');
    this.reset();
    showPage('login');
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = students.find(s => s.email === email && s.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage(`Welcome back, ${user.fullName}!`, 'success');
        showPage('dashboard');
    } else {
        showMessage('Invalid email or password!', 'error');
    }
});

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showMessage('Logged out successfully!', 'success');
    showPage('home');
}

// Contact Form
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = {
        id: Date.now(),
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        date: new Date().toISOString(),
        status: 'unread'
    };
    
    contactMessages.push(message);
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
    
    showMessage('Message sent successfully! We will contact you soon.', 'success');
    this.reset();
});

// Update Dashboard
function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('studentName').innerHTML = currentUser.fullName;
    document.getElementById('coursesEnrolled').innerHTML = currentUser.coursesEnrolled || 0;
    document.getElementById('completedLessons').innerHTML = currentUser.completedLessons || 0;
    document.getElementById('certificates').innerHTML = currentUser.certificates || 0;
    
    // Show uploaded files
    displayUserFiles();
    
    // Show admin panel if user is admin
    const adminPanel = document.getElementById('adminPanel');
    if (currentUser.isAdmin) {
        adminPanel.style.display = 'block';
        loadAdminData();
    } else {
        adminPanel.style.display = 'none';
    }
}

// Display user uploaded files
function displayUserFiles() {
    const userFiles = uploadedFiles.filter(f => f.userEmail === currentUser.email);
    const container = document.getElementById('uploadedFilesList');
    if (!container) return;
    
    if (userFiles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No files uploaded yet</p>';
        return;
    }
    
    container.innerHTML = userFiles.map(file => `
        <div class="file-item">
            <div class="file-info">
                <strong>${file.name}</strong><br>
                <small>Uploaded: ${new Date(file.date).toLocaleDateString()}</small>
            </div>
            <button class="view-btn" onclick="viewFile('${file.id}')">View</button>
        </div>
    `).join('');
}

// Upload File
function uploadFile(input) {
    const file = input.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
        showMessage('File size must be less than 10MB!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            data: e.target.result,
            userEmail: currentUser?.email || 'guest',
            userName: currentUser?.fullName || 'Guest',
            date: new Date().toISOString()
        };
        
        uploadedFiles.push(fileData);
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        showMessage('File uploaded successfully!', 'success');
        displayUserFiles();
        
        // Clear input
        input.value = '';
    };
    reader.readAsDataURL(file);
}

// View File
function viewFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
        const win = window.open();
        win.document.write(`
            <html>
                <head><title>${file.name}</title></head>
                <body style="margin:0; padding:20px; text-align:center;">
                    ${file.type.startsWith('image/') ? 
                        `<img src="${file.data}" style="max-width:100%;">` : 
                        `<iframe src="${file.data}" style="width:100%; height:90vh;"></iframe>`
                    }
                </body>
            </html>
        `
