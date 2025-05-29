# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Realms & Reaches, please report it responsibly:

### How to Report

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Email security details to: rayners@gmail.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Updates**: Every 5 business days
- **Resolution Timeline**: Varies by severity
  - Critical: 1-7 days
  - High: 1-4 weeks
  - Medium/Low: 1-3 months

### Security Considerations

This module handles:

- Scene data and realm properties
- User-generated content in realm tags and names
- Module settings and configurations
- File upload/download for realm import/export

Common security concerns:

- Cross-site scripting (XSS) in user inputs
- Permission bypasses for scene editing
- Data exposure between users
- Malicious file uploads through import functionality

Thank you for helping keep Realms & Reaches secure!
