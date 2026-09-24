# Security Policy

## Supported Versions

We provide security updates for the following versions of **Choicecraft**:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Reporting a Vulnerability

The Choicecraft team takes security seriously. If you discover a security vulnerability or sensitive information exposure, please report it privately rather than opening a public issue.

### How to Report
Please send an email to **supanroy2021@gmail.com** with:
1. **Description**: Clear description of the vulnerability and its potential impact.
2. **Steps to Reproduce**: Minimal reproduction steps, proof of concept, or network payload.
3. **Affected Components**: Specify whether the vulnerability affects the TV client, backend synchronization, or mobile input surface.
4. **Environment**: Operating system, Vega SDK version, and device type.

### What to Expect
- **Acknowledgment**: You will receive an acknowledgment of your report within **48 hours**.
- **Assessment**: We will evaluate the report and confirm the next steps within **5 business days**.
- **Resolution**: Once patched, a public acknowledgment and release will be coordinated.

---

## Key Security Tenets in Choicecraft

1. **No Hardcoded Credentials**: Never commit AWS credentials, API keys, or sensitive environment tokens to the repository.
2. **Private Preference Protection**: Participant constraints and private votes must not be exposed to unauthorized participants or leaked on public screens prior to final consensus.
3. **Safe Vega OS Practices**: Ensure all native modules and IPC boundaries conform to Amazon Devices Builder security specifications.
