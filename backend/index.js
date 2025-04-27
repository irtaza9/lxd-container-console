const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const HOST_URL = 'xyz.com'; // Replace with your LXD/Incus server URL

const cert = fs.readFileSync('certs/client.crt');
const key = fs.readFileSync('certs/client.key');

app.use(cors());
app.use(express.json());


app.get('/fetch-console', async (req, res) => {
    const name = req.query.name;
    const project = req.query.project;

    if (!name || !project) {
        return res.status(400).send('Missing name or project parameter');
    }

    const options = {
        hostname: HOST_URL,
        port: 8443,
        path: `/1.0/instances/${encodeURIComponent(name)}/console?project=${encodeURIComponent(project)}`,
        method: 'GET',
        key: key,
        cert: cert,
        rejectUnauthorized: false,
    };

    const request = https.request(options, (response) => {
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Length', response.headers['content-length'] || 0);
        res.setHeader('Content-Disposition', response.headers['content-disposition'] || 'inline');

        response.pipe(res);
    });

    request.on('error', (error) => {
        console.error(error);
        res.status(500).send('Error connecting to Incus server');
    });

    request.end();
});


app.post('/connect-console', async (req, res) => {
    const { name, project } = req.body;

    if (!name || !project) {
        return res.status(400).send('Missing name or project in body');
    }

    const postData = JSON.stringify({
        "wait-for-websocket": true,
        "type": "console"
    });

    const options = {
        hostname: HOST_URL,
        port: 8443,
        path: `/1.0/instances/${encodeURIComponent(name)}/console?project=${encodeURIComponent(project)}&wait=10`,
        method: 'POST',
        key: key,
        cert: cert,
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.status(response.statusCode).json(jsonData);
            } catch (err) {
                res.status(500).send('Invalid JSON from Incus server');
            }
        });
    });

    request.on('error', (error) => {
        console.error(error);
        res.status(500).send('Error connecting to Incus server');
    });

    request.write(postData);
    request.end();
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
