# LXD Container Console Web Interface
A React-based web interface for connecting to LXD container consoles via WebSocket.

## Prerequisites
Before using this application, ensure you have:

- Proper SSL/TLS Configuration:

- Your host must have a valid SSL certificate signed by a Certificate Authority (CA)

- Self-signed certificates will not work due to browser security restrictions

- Recommended solution: Use Let's Encrypt certificates with HAProxy in TCP mode

## LXD Server Access:

The LXD server must be properly configured to allow remote console connections

Appropriate firewall rules must be set up to permit WebSocket connections

## Installation & Setup
Clone the repository:

```bash
git clone https://github.com/yourusername/lxd-container-console.git
cd lxd-container-console
Install dependencies:
```

```bash
npm install
```

## Configure your environment:

- Update the INCUS_HOST in the code to point to your LXD server

- Configure any necessary API endpoints in the application

## Run the development server:

```bash
npm run dev
```

## Important Notes
SSL Certificate Requirements:

- The application requires properly signed certificates to establish WebSocket connections

- We spent significant time (1.5 months) solving connection issues related to certificate validation

- The most reliable solution we found was using Let's Encrypt certificates with HAProxy configured in TCP mode

## Connection Flow:

- The application first fetches the console buffer

- Then establishes a WebSocket connection to the container console

- Data socket connects before the control socket for proper initialization

## Troubleshooting
If you encounter connection issues:

- Verify your SSL certificate is valid and trusted

- Check that HAProxy (if used) is properly configured in TCP mode

- Ensure the LXD server allows console connections from your IP

- Verify firewall rules permit WebSocket traffic (typically on port 8443)

## Development
The interface uses xterm.js for terminal emulation

- WebSocket connections are managed with proper error handling

- The component automatically handles resizing and connection state

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

This version:

- Uses more professional language

- Clearly separates different sections

- Explains the SSL requirement more clearly

- Provides better troubleshooting guidance

- Maintains all the important technical details while being more readable
