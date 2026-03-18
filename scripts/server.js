require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files (CSS, images, JS)
app.use('/css', express.static('css'));
app.use('/assets', express.static('assets'));
app.use('/js', express.static('js'));
app.use('/pages', express.static('pages'));

// Inject config into login.html
app.get('/login.html', (req, res) => {
    // Read your HTML file
    let html = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
    
    // Create config script
    const configScript = `
        <script>
            window.MOG_CONFIG = {
                url: '${process.env.SUPABASE_URL}',
                key: '${process.env.SUPABASE_ANON_KEY}'
            };
        </script>
    `;
    
    // Inject before </head> tag
    html = html.replace('</head>', configScript + '</head>');
    
    // Send modified HTML
    res.send(html);
});

// Serve other HTML files normally
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Not found');
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
