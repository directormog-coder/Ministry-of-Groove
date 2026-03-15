// Function to handle login
function handleLogin(role, password) {
    // Simple check (You can replace '1234' with your actual codes)
    if (role === 'director' && password === 'admin-pass') {
        localStorage.setItem('userRole', 'director');
        window.location.href = 'pages/directorate.html';
    } 
    else if (role === 'operative' && password === 'op-pass') {
        localStorage.setItem('userRole', 'operative');
        window.location.href = 'index.html';
    } 
    else {
        alert("Access Denied: Invalid Credentials");
    }
}

// Function to PROTECT pages (Add this to the top of your HTML files)
function checkAccess(requiredRole) {
    const currentRole = localStorage.getItem('userRole');
    if (!currentRole) {
        window.location.href = '../login.html'; // Send to login if not logged in
    }
}
