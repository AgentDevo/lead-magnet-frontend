# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## LAN Devices (192.168.1.x)

| IP | Device | Notes |
|---|---|---|
| .1 | Router | |
| .193 | SaaS-TST | Lead Magnet Generator SaaS - Test/Staging Server |
| .50 | Rioja — Linux Server | |
| .59 | Win7-Sandbox | Windows 7 test/sandbox environment |
| .81 | ACC-WbServer | Accounting web server |
| .82 | ACC-AppServer | Accounting app server |
| .83 | TST-docker | Test/Docker environment |
| .84 | ACC-DataServer | Accounting data server |
| .98 | Rueda — Windows 10 Desktop PC | |
| .99 | Pomerol — Windows 10 | |
| .101 | Synology NAS | |
| .102 | Synology NAS | |
| .113 | Raspberry Pi | |
| .114 | Zyxel GS1900-8HP Switch | Managed PoE switch, web UI on port 80 |
| .124 | External Hikvision Camera (North) | |
| .137 | Ubiquiti Network Server | |
| .138 | VM (KVM) | |
| .141 | ErpServer | ERP system server |
| .142 | Barbara's iMac | Wired |
| .175 | Barbara's iMac | WiFi |
| .144 | Zyxel Switch | May not respond to ping |
| .151 | llm-vm | VM for LLM |
| .154 | Tado Server | Smart heating |
| .155 | iPhone Max Pro | |
| .173 | iPhone | |
| .174 | VM (KVM) | |
| .177 | Philips Hue Bridge | |
| .182 | Athena — Linux Server | |
| .183 | Raspberry Pi | WiFi |
| .184 | Athena — BMC (IPMI/iLO) | Out-of-band management for Athena (.182) |
| .185 | Ubiquiti AC Access Point | |
| .186 | Apple Time Capsule | |
| .209 | Huawei Solar Converter | |
| .212 | VM (KVM) | |
| .72 | Windows Server 2012 | |
| .216 | Elcoto — OSMC Media Center | Kodi on Raspberry Pi |
| .219 | Canon G4510 Printer | |
| .231 | VM (KVM) | |
| .226 | Barbara's iPhone | |
| .233 | Epernay — Notebook | |
| .240 | HP Work Notebook | |
| .244 | Raspberry Pi IoT | WiFi |
| .236 | WiZ Smart Light | Espressif chip, UDP port 38899, no TCP ports |
| .238 | osmc-Museum — OSMC Media Center | Kodi on Raspberry Pi |
| .241 | This server (ubu-server-vm3) | OpenClaw host |
| .253 | iPhone 2 | |
| .220 | Home Wizard | Smart home hub |
| .180 | kitten bak | New device |

## Active Agents

| Agent | Host | Type | Role | Status |
|-------|------|------|------|--------|
| **Tony** | 192.168.1.174 (Agent Zero) | Sub-agent (Hacker) | Reconnaissance Specialist, Penetration Testing | 🟢 Active |
| **Keanu** | Local Skill | Specialist Skill | OpenClaw Expert Developer | 🟢 Available |

## Active Projects

| Project | Server | Status | Phase |
|---------|--------|--------|-------|
| Lead Magnet Generator SaaS | 192.168.1.193 (SaaS-TST) | 🟢 In Development | Phase 1 MVP Complete |

## SSH Credentials

| Host | IP | User | Password | Notes |
|------|----|----|----------|-------|
| Agent Zero | 192.168.1.174 | svalbuena | password | VM (KVM) |
| **Tony (Agent Zero sub-agent)** | 192.168.1.174 | A2A API | token: YWdlbnQwOmFnZW50MA== | Hacker profile |

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
