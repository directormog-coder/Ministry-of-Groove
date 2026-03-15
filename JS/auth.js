// 1. LOGIN LOGIC
function handleLogin(role, password) {
    // Define your access codes here
    const CREDENTIALS = {
        director: { pass: 'COMMAND-01', target: 'pages/directorate.html' },
        operative: { pass: 'GROOVE-99', target: 'index.html' }
    };

    if (CREDENTIALS[role] && password === CREDENTIALS[role].pass) {
        localStorage.setItem('userRole', role);
        localStorage.setItem('isAuth', 'true');
        window.location.href = CREDENTIALS[role].target;
    } else {
        alert("ACCESS DENIED: Credentials not recognized by the Ministry.");
    }
}

// 2. SECURITY CHECK (Run this on every page)
function checkAccess(requiredRole) {
    const role = localStorage.getItem('userRole');
    const auth = localStorage.getItem('isAuth');

    if (!auth || (requiredRole && role !== requiredRole)) {
        // If not logged in or wrong role, kick back to login gate
        // The "../" is used if the file is inside the /pages/ folder
        const pathPrefix = window.location.pathname.includes('pages/') ? '../' : '';
        window.location.href = pathPrefix + 'login.html';
    }
}

// 3. LOGOUT LOGIC
function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuth');
    
    const pathPrefix = window.location.pathname.includes('pages/') ? '../' : '';
    window.location.href = pathPrefix + 'login.html';
}
