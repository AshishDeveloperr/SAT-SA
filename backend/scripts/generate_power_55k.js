import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../../samples/CSE-POWER-01');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('[SAT-SA Power Generator] Target Directory:', targetDir);
console.log('[SAT-SA Power Generator] Generating 55,000 authentic, highly professional power grid records for CSE-POWER-01...');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randIp(subnet = '10.240.10') {
  return `${subnet}.${randInt(2, 254)}`;
}

function randHex(len) {
  const chars = '0123456789ABCDEF';
  let res = '';
  for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 1. 24 Authentic Critical Power Grid & Energy Transmission Assets
// (RTU-SUBSTATION-ALPHA-400KV & RTU-SUBSTATION-BETA-220KV have last_seen >40 days ago to trigger NS-01)
const ASSETS = [
  { id: 'RTU-SUBSTATION-ALPHA-400KV', name: 'Northern Grid 400kV Substation Alpha RTU', type: 'SCADA_RTU', criticality: 5, ip: '10.240.10.15', vlan: 'VLAN-101-OT-CONTROL', os: 'ABB RTU560 Rel 13.4.1', lastSeen: '2026-08-20T04:15:00.000Z' },
  { id: 'RTU-SUBSTATION-BETA-220KV', name: 'Northern Grid 220kV Substation Beta RTU', type: 'SCADA_RTU', criticality: 5, ip: '10.240.20.15', vlan: 'VLAN-102-OT-CONTROL', os: 'GE D400 Substation Gateway v7.2', lastSeen: '2026-08-22T11:30:00.000Z' },
  { id: 'PLC-TURBINE-GEN-01', name: 'Turbine Speed Governor PLC Unit 1', type: 'PLC_CONTROLLER', criticality: 5, ip: '10.240.10.22', vlan: 'VLAN-105-SAFETY-SIS', os: 'Siemens S7-1500 v2.9', lastSeen: '2026-08-24T09:12:00.000Z' },
  { id: 'EMS-SCADA-CORE-01', name: 'Northern Regional Energy Management System Gateway 01', type: 'EMS_SERVER', criticality: 5, ip: '10.240.1.10', vlan: 'VLAN-100-EMS-CORE', os: 'Red Hat Enterprise Linux 8.8 (Hardened)', lastSeen: '2026-10-02T22:30:00.000Z' },
  { id: 'EMS-SCADA-CORE-02', name: 'Northern Regional Energy Management System Backup Gateway 02', type: 'EMS_SERVER', criticality: 5, ip: '10.240.1.11', vlan: 'VLAN-100-EMS-CORE', os: 'Red Hat Enterprise Linux 8.8 (Hardened)', lastSeen: '2026-10-02T22:30:00.000Z' },
  { id: 'OT-FW-DMZ-SUB-01', name: 'Substation Alpha Boundary Industrial Firewall', type: 'OT_FIREWALL', criticality: 4, ip: '10.240.1.1', vlan: 'DMZ-PERIMETER', os: 'FortiOS Rugged 7.2.5', lastSeen: '2026-10-02T22:15:00.000Z' },
  { id: 'OT-FW-DMZ-SUB-02', name: 'Substation Beta Boundary Industrial Firewall', type: 'OT_FIREWALL', criticality: 4, ip: '10.240.1.2', vlan: 'DMZ-PERIMETER', os: 'FortiOS Rugged 7.2.5', lastSeen: '2026-10-02T22:15:00.000Z' },
  { id: 'HMI-WORKSTATION-ENG-01', name: 'Control Room Engineering Workstation 01', type: 'ENGINEERING_HMI', criticality: 3, ip: '10.240.10.44', vlan: 'VLAN-110-OPERATOR-HMI', os: 'Windows 10 Enterprise LTSC IoT', lastSeen: '2026-10-02T22:45:00.000Z' },
  { id: 'HMI-WORKSTATION-ENG-02', name: 'Control Room Engineering Workstation 02', type: 'ENGINEERING_HMI', criticality: 3, ip: '10.240.10.45', vlan: 'VLAN-110-OPERATOR-HMI', os: 'Windows 10 Enterprise LTSC IoT', lastSeen: '2026-10-02T22:45:00.000Z' },
  { id: 'SYNC-PHASOR-PMU-01', name: 'Synchrophasor Wide Area Measurement Unit Alpha', type: 'PMU_SENSOR', criticality: 4, ip: '10.240.10.88', vlan: 'VLAN-101-OT-CONTROL', os: 'Schweitzer SEL-2240 Axion', lastSeen: '2026-10-02T22:10:00.000Z' },
  { id: 'SYNC-PHASOR-PMU-02', name: 'Synchrophasor Wide Area Measurement Unit Beta', type: 'PMU_SENSOR', criticality: 4, ip: '10.240.20.88', vlan: 'VLAN-102-OT-CONTROL', os: 'Schweitzer SEL-2240 Axion', lastSeen: '2026-10-02T22:10:00.000Z' },
  { id: 'TRANS-FEEDER-RELAY-01', name: 'Feeder 1 Distance Protection Line Relay', type: 'IED_PROTECTION_RELAY', criticality: 4, ip: '10.240.10.51', vlan: 'VLAN-101-OT-CONTROL', os: 'SEL-411L Firmware Rel 12', lastSeen: '2026-10-02T22:00:00.000Z' },
  { id: 'TRANS-FEEDER-RELAY-02', name: 'Feeder 2 Differential Protection Line Relay', type: 'IED_PROTECTION_RELAY', criticality: 4, ip: '10.240.10.52', vlan: 'VLAN-101-OT-CONTROL', os: 'ABB Relion REF615 v5.1', lastSeen: '2026-10-02T22:00:00.000Z' },
  { id: 'TRANS-FEEDER-RELAY-03', name: 'Feeder 3 Overcurrent Protection Line Relay', type: 'IED_PROTECTION_RELAY', criticality: 4, ip: '10.240.10.53', vlan: 'VLAN-101-OT-CONTROL', os: 'Siemens SIPROTEC 5 7SJ85', lastSeen: '2026-10-02T22:00:00.000Z' },
  { id: 'TRANS-FEEDER-RELAY-04', name: 'Feeder 4 Differential Protection Line Relay', type: 'IED_PROTECTION_RELAY', criticality: 4, ip: '10.240.10.50', vlan: 'VLAN-101-OT-CONTROL', os: 'SEL-411L Firmware Rel 12', lastSeen: '2026-10-02T22:00:00.000Z' },
  { id: 'GENERATOR-EXCITATION-01', name: '500MW Hydro Turbine Static Excitation Controller 01', type: 'EXCITATION_SYSTEM', criticality: 5, ip: '10.240.30.10', vlan: 'VLAN-130-GENERATOR-OT', os: 'ABB UNITROL 6000 Medium', lastSeen: '2026-10-02T21:40:00.000Z' },
  { id: 'GENERATOR-EXCITATION-02', name: '500MW Hydro Turbine Static Excitation Controller 02', type: 'EXCITATION_SYSTEM', criticality: 5, ip: '10.240.30.11', vlan: 'VLAN-130-GENERATOR-OT', os: 'ABB UNITROL 6000 Medium', lastSeen: '2026-10-02T21:40:00.000Z' },
  { id: 'GIS-SWITCHYARD-CONTROLLER-01', name: '765kV Gas Insulated Switchgear Bay Controller Alpha', type: 'BAY_CONTROLLER', criticality: 5, ip: '10.240.15.5', vlan: 'VLAN-115-GIS-BAY', os: 'Siemens SIPROTEC 7SJ85 IEC 61850 Ed 2', lastSeen: '2026-10-02T22:20:00.000Z' },
  { id: 'GIS-SWITCHYARD-CONTROLLER-02', name: '765kV Gas Insulated Switchgear Bay Controller Beta', type: 'BAY_CONTROLLER', criticality: 5, ip: '10.240.15.6', vlan: 'VLAN-115-GIS-BAY', os: 'Siemens SIPROTEC 7SJ85 IEC 61850 Ed 2', lastSeen: '2026-10-02T22:20:00.000Z' },
  { id: 'SUBSTATION-TIME-MASTER-01', name: 'Substation Precision Time Protocol (IEEE 1588 PTP) GPS Grandmaster', type: 'PTP_GRANDMASTER', criticality: 4, ip: '10.240.10.2', vlan: 'VLAN-101-OT-CONTROL', os: 'Meinberg LANTIME M1000 Firmware 7.06', lastSeen: '2026-10-02T22:50:00.000Z' },
  { id: 'INTER-GRID-TELECONTROL-GW-01', name: 'Inter-Regional Wide Area Telecontrol Gateway IEC 60870-5-104', type: 'TELECONTROL_GW', criticality: 5, ip: '10.240.1.50', vlan: 'VLAN-100-EMS-CORE', os: 'Hirschmann MACH4002 HiOS 09.2', lastSeen: '2026-10-02T22:35:00.000Z' },
  { id: 'GRID-BATTERY-BESS-CONTROLLER-01', name: '100MWh Utility Grid Battery Storage Management System', type: 'BESS_CONTROLLER', criticality: 4, ip: '10.240.40.12', vlan: 'VLAN-140-BESS-STORAGE', os: 'Tesla Megapack Powerhub OS v2026.4', lastSeen: '2026-10-02T22:15:00.000Z' },
  { id: 'SUBSTATION-CAMERA-VMS-01', name: 'High-Voltage Switchyard Thermal & Physical Perimeter VMS', type: 'PHYSICAL_VMS', criticality: 3, ip: '10.240.5.20', vlan: 'VLAN-105-PHYSICAL-SEC', os: 'Axis Camera Station Enterprise 10.4', lastSeen: '2026-10-02T22:40:00.000Z' },
  { id: 'POWER-QUALITY-ANALYZER-01', name: '400kV Busbar Harmonic & Transient Power Quality Monitor', type: 'POWER_QUALITY', criticality: 3, ip: '10.240.10.95', vlan: 'VLAN-101-OT-CONTROL', os: 'Janitza UMG 604E Embedded Firmware', lastSeen: '2026-10-02T22:25:00.000Z' }
];

// Grid Operational Security Analysts
const ANALYSTS = [
  'analyst_sharma_01',
  'analyst_verma_02',
  'analyst_gupta_03',
  'ot_engineer_patel_01',
  'scada_admin_singh_02',
  'relay_specialist_kumar_04',
  'grid_ciso_office_01'
];

// 26 Authentic Power & SCADA Cyber Threat Playbooks
const THREAT_CATALOG = [
  // PIPEDREAM / Incontroller & Advanced Industrial Malware
  {
    category: 'PIPEDREAM / Incontroller: Malicious CODESYS Runtime Function Block Execution',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'EMS-SCADA-CORE',
    syslogMsg: (ctx) => `EMS-SCADA Engine: Heuristic signature match PIPEDREAM.CODESYS.RUNTIME.EXPLOIT detected on process codesys_runtime.exe. Attempted arbitrary memory write into PLC address space.`,
    noteGen: (ctx) => `Advanced industrial malware artifact detected on core energy management server ${ctx.assetId}. Attack payload executed memory injection sequence targeting CODESYS communication stack. Process terminated; host isolated to sandbox VLAN.`
  },
  {
    category: 'SCADA Command Injection: Modbus/TCP Unauthorized Function Code 05 (Write Single Coil)',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'RTU-SUBSTATION',
    syslogMsg: (ctx) => `Substation RTU Guard: Modbus/TCP FC=05 (Write Single Coil) to Address 0x0041 (LINE-${ctx.lineId}-CB-TRIP) initiated from non-whitelisted Engineering Workstation ${randIp('192.168.10')}.`,
    noteGen: (ctx) => `Unauthorized circuit breaker trip command intercepted on 400kV transmission line ${ctx.lineId}. Modbus TCP packet originated from unwhitelisted subnet without dual-authorization cryptographic token. Coil write blocked by hardware firewall rule.`
  },
  {
    category: 'DNP3 Protocol: Control Relay Output Block (CROB) Pulse Command Spoofing',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'RTU-SUBSTATION',
    syslogMsg: (ctx) => `DNP3 Protocol Parser: Object 12 Var 1 (CROB) command received with invalid master sequence counter seq=${ctx.seqId}. Function code 0x05 (Direct Operate).`,
    noteGen: (ctx) => `Critical DNP3 telecontrol command spoofing attempt detected. Unauthenticated outstation command attempted direct trip operation on transmission breaker. Outstation rejected command due to sequence mismatch.`
  },
  {
    category: 'IEC 61850 GOOSE: Multicast Injection of Unsolicited Trip State 0x01 on Bay 400kV Bus',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'TRANS-FEEDER-RELAY',
    syslogMsg: (ctx) => `SEL-411L Protection Relay: IEC 61850 GOOSE security alert: stNum jumped from 104 to 9221 with unchanged sqNum. Injected trip message dropped.`,
    noteGen: (ctx) => `High-speed protection network integrity event. Rogue multicast GOOSE message injected onto substation fiber bus attempting to trigger false busbar differential trip. Relay state machine detected status number discontinuity and discarded frame.`
  },
  {
    category: 'Turbine Speed Governor: Safety Instrumented System (SIS) Emergency Shutdown Bypass',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'PLC-TURBINE-GEN',
    syslogMsg: (ctx) => `Siemens S7-1500 Safety Controller: Safety Instrumented System (SIS) trip valve override command received via unauthenticated Profinet telegram.`,
    noteGen: (ctx) => `Kinetic generation safety hazard alert. Unauthorized Profinet packet attempted to force emergency turbine shutdown valve bypass bit. Hardware safety interlock retained control; generator trip bypassed in safe state.`
  },
  {
    category: 'IEC 60870-5-104: Telecontrol Inter-Regional Grid Disconnect ASDU Type 45 Injection',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'INTER-GRID-TELECONTROL',
    syslogMsg: (ctx) => `Telecontrol Gateway: ASDU Type 45 (Single Command C_SC_NA_1) received with invalid Cot (Cause of Transmission) 0x09 on sector address ${ctx.sectorAddr}.`,
    noteGen: (ctx) => `Inter-regional grid interconnect telecontrol attack attempt. Malformed IEC 104 supervisory command attempted to decouple 765kV inter-state tie-line. Gateway cryptographic filter dropped packet.`
  },

  // Synchrophasor Wide Area Monitoring & Protection Relays
  {
    category: 'Synchrophasor PMU: GPS Clock Spoofing Induced Phase Angle Phase Shift Anomaly',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'SYNC-PHASOR-PMU',
    syslogMsg: (ctx) => `SEL-2240 PMU Engine: GPS timestamp jitter exceeded 1,200 nanoseconds. Phasor angle jump of +34.2 degrees detected on Busbar 400kV.`,
    noteGen: (ctx) => `GPS spoofing / time synchronization attack against synchrophasor PMU. Wide-area stability algorithms tripped out-of-bounds warning. Unit dynamically switched from GPS to atomic rubidium secondary time standard.`
  },
  {
    category: 'Protective Relay (SEL-411L): Unauthorized Firmware Configuration File Upload',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'TRANS-FEEDER-RELAY',
    syslogMsg: (ctx) => `SEL Relay Management: Binary settings file upload rejected: RDB checksum mismatch. Source IP: ${randIp('10.240.10')}.`,
    noteGen: (ctx) => `Substation relay tampering attempt. Unauthenticated engineering session attempted to push modified zone-2 distance protection reach settings. Relay bootloader rejected unverified binary file.`
  },
  {
    category: 'Industrial Firewall: Lateral SMBv2 Brute-Force from Compromised Vendor Contractor Laptop',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'OT-FW-DMZ-SUB',
    syslogMsg: (ctx) => `FortiOS Rugged: Attack signature SMB.Login.Brute.Force detected from contractor jump host IP 10.240.50.12 targeting Substation HMI.`,
    noteGen: (ctx) => `Perimeter OT breach indicator. Vendor laptop connected to substation DMZ originated high-frequency NTLM authentication requests against operator workstations. Switch port disabled; vendor VPN revoked.`
  },
  {
    category: 'Substation Precision Time: IEEE 1588 PTP Grandmaster Rogue Announce Message Spoofing',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'SUBSTATION-TIME-MASTER',
    syslogMsg: (ctx) => `Meinberg LANTIME PTP Daemon: Rogue PTP Grandmaster Announce packet received with artificial priority1=64 claiming stratum 0.`,
    noteGen: (ctx) => `Time protocol disruption attempt on substation Ethernet bus. PTP best master clock algorithm (BMCA) rejected unauthenticated rogue announce frame. Boundary clock port forced into master-only mode.`
  },
  {
    category: 'GIS Switchyard: Gas Insulated Switchgear SF6 Density Pressure Low Telemetry Tamper',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'GIS-SWITCHYARD',
    syslogMsg: (ctx) => `Siemens 7SJ85 Bay Controller: Analog telemetry input 4-20mA suddenly dropped to 0.0mA on 765kV Breaker CB-01 SF6 density sensor.`,
    noteGen: (ctx) => `Critical physical switchyard anomaly. Sensor input indicated catastrophic SF6 gas pressure loss or sensor circuit tampering on 765kV breaker. Physical maintenance team dispatched; confirmed wire disconnect on terminal strip.`
  },
  {
    category: 'Static Excitation System: Rotor Field Overfluxing Boundary Setpoint Manipulation',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'GENERATOR-EXCITATION',
    syslogMsg: (ctx) => `UNITROL 6000 Controller: Parameter write event: Overexcitation Limiter (OEL) curve modified to maximum ceiling 160% via engineering serial port.`,
    noteGen: (ctx) => `Generator protection parameter manipulation. Attacker attempted to disable rotor thermal limit protection on 500MW generator. Unit automatically reverted to non-volatile flash configuration.`
  },
  {
    category: 'Grid BESS: Battery Energy Storage Inverter Real-Power Curtailment Spike',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'GRID-BATTERY-BESS',
    syslogMsg: (ctx) => `Tesla Powerhub SCADA: Uncommanded 40MW curtailment step in active power setpoint received from unverified dispatch IP ${randIp('10.240.1')}.`,
    noteGen: (ctx) => `Grid frequency stability threat. External telemetry command attempted to drop 40MW battery discharge during peak evening ramp. Powerhub controller ignored command due to missing AGC cryptographic signature.`
  },

  // EMS SCADA Core & Grid Telemetry
  {
    category: 'EMS SCADA Core: Memory Corruption in Telecontrol Protocol Dissector Service',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'EMS-SCADA-CORE',
    syslogMsg: (ctx) => `EMS Telecontrol Kernel: Process crash: Buffer overflow in dnp3_dissector.so triggered by oversized fragment header (0x7FFF). Core dumped.`,
    noteGen: (ctx) => `Zero-day exploit attempt against central Energy Management System. Crafted DNP3 fragment induced buffer overflow in network protocol dissector. Standby redundant EMS core automatically promoted.`
  },
  {
    category: 'Substation Perimeter: Physical Optical Fiber Enclosure Tamper Switch Trip',
    severity: 'MEDIUM',
    weight: 14,
    assetFilter: 'SUBSTATION-CAMERA-VMS',
    syslogMsg: (ctx) => `Substation Alarm Panel: Micro-switch trip: Optical splice enclosure OPT-BOX-04 opened in switchyard quadrant North-East.`,
    noteGen: (ctx) => `Physical perimeter security event. High-voltage switchyard optical distribution panel door opened without scheduled maintenance ticket. Switchyard PTZ camera focused on location; security guard dispatched.`
  },
  {
    category: 'Engineering Workstation: Unsigned Python Script Executing Batch Register Polling',
    severity: 'MEDIUM',
    weight: 16,
    assetFilter: 'HMI-WORKSTATION-ENG',
    syslogMsg: (ctx) => `Windows Defender ATP: Script control alert: Unsigned python.exe process spawned by operator user executing socket scan across 10.240.10.0/24:502.`,
    noteGen: (ctx) => `Policy violation on engineering workstation. Operator ran unapproved diagnostic script to query substation RTU Modbus coils directly. Script halted; operator briefed on change management protocol.`
  },
  {
    category: 'DNP3 Protocol: Master-Outstation Sequence Number Desynchronization Flood',
    severity: 'MEDIUM',
    weight: 15,
    assetFilter: 'RTU-SUBSTATION',
    syslogMsg: (ctx) => `DNP3 Engine: Sequence mismatch rate reached 45/sec on serial link COM2 from Outstation 14. Link reset initiated.`,
    noteGen: (ctx) => `Telemetry link degradation. Faulty serial modem injected corrupted DNP3 frames inducing sequence desynchronization between master and substation RTU. Channel reset restored clean communication.`
  },
  {
    category: 'Power Quality Monitor: Harmonic Distortion Index THD Spiked Above 8.5% Statutory Limit',
    severity: 'MEDIUM',
    weight: 16,
    assetFilter: 'POWER-QUALITY',
    syslogMsg: (ctx) => `Janitza UMG 604E: Voltage Total Harmonic Distortion (V-THD) on Phase B reached 9.4% (Threshold: 5.0% IEEE 519).`,
    noteGen: (ctx) => `Power quality grid anomaly. Nonlinear industrial arc furnace load on adjacent feeder caused severe voltage waveform distortion. Capacitor bank filtering stage brought online.`
  },
  {
    category: 'Control Room HMI: Multiple Rapid Dual-Operator Trip Confirmations Within 2 Seconds',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'HMI-WORKSTATION-ENG',
    syslogMsg: (ctx) => `SCADA Audit Trail: Dual-authorization bypass attempt: Operator A and Operator B credentials submitted from identical IP 10.240.10.45 within 850 milliseconds.`,
    noteGen: (ctx) => `Dual-custody security control violation. An automated macro attempted to bypass dual-operator signoff on a major substation bus transfer command. Action blocked by SCADA security policy.`
  },
  {
    category: 'IEC 61850 Sampled Values: SV Packet Jitter Exceeded 100 Microsecond Protection Window',
    severity: 'MEDIUM',
    weight: 15,
    assetFilter: 'TRANS-FEEDER-RELAY',
    syslogMsg: (ctx) => `SIPROTEC 5: IEC 61850-9-2LE Sampled Values stream lost synchronization: packet jitter delta 280us exceeded 100us trip threshold.`,
    noteGen: (ctx) => `Digital substation process bus communication issue. High network load on fiber ring caused packet arrival jitter on current/voltage digital samples. Quality of service prioritization reconfigured.`
  },
  {
    category: 'Substation Boundary: Outbound DNS Tunneling Sequence Detected on Port 53',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'OT-FW-DMZ-SUB',
    syslogMsg: (ctx) => `FortiOS DNS Guard: Base64-encoded high-entropy DNS query sequence detected heading to ns1.c2-command-grid.org from DMZ host 10.240.50.18.`,
    noteGen: (ctx) => `Command and control (C2) data exfiltration attempt. Suspicious machine on DMZ attempted DNS tunneling out of air-gapped substation perimeter. Outbound DNS blocked at boundary firewall.`
  },
  {
    category: 'Modbus/TCP: Broadcast Query to Slave Address 0x00 Probing Substation RTU Registers',
    severity: 'LOW',
    weight: 20,
    assetFilter: 'RTU-SUBSTATION',
    syslogMsg: (ctx) => `Modbus Gateway: Broadcast request FC=03 (Read Holding Registers) sent to slave 0x00 address range 40001-40100.`,
    noteGen: (ctx) => `Routine or unauthorized Modbus broadcast scan detected on substation internal bus. Request rejected by compliant slave devices per IEC standards.`
  },
  {
    category: 'Thermal Camera VMS: Thermal Sensor Detected 88°C Hotspot on Phase-A Bushing Connector',
    severity: 'MEDIUM',
    weight: 14,
    assetFilter: 'SUBSTATION-CAMERA-VMS',
    syslogMsg: (ctx) => `Axis Thermal Station: Temperature alarm on ROI [TRANS-4-BUSHING-A]: Current: 88.4°C (Normal: <60°C). Temperature delta +32°C.`,
    noteGen: (ctx) => `Early-stage transformer bushing physical degradation alert. High-voltage thermal imaging detected localized contact resistance heating. Load transferred to standby transformer bank.`
  },
  {
    category: 'SCADA Gateway: TCP Half-Open Connection Starvation on Telemetry Port 2404',
    severity: 'MEDIUM',
    weight: 15,
    assetFilter: 'INTER-GRID-TELECONTROL',
    syslogMsg: (ctx) => `Hirschmann Switch: SYN flood detection: 2,400 half-open TCP connections on IEC 104 port 2404 from IP ${randIp('10.240.80')}.`,
    noteGen: (ctx) => `SYN flood denial-of-service attack on IEC 104 telecontrol port. SYN cookies enabled on gateway; attacker IP added to temporary drop list.`
  },
  {
    category: 'Protective Relay: Trip Circuit Supervision (TCS) Auxiliary Contact Fault Assertion',
    severity: 'LOW',
    weight: 22,
    assetFilter: 'TRANS-FEEDER-RELAY',
    syslogMsg: (ctx) => `SEL-411L Hardware Monitor: TCS contact open: Breaker 400-01 trip coil circuit DC voltage missing or disconnected.`,
    noteGen: (ctx) => `Trip circuit supervision alarm. Auxiliary DC supply to breaker mechanical trip coil interrupted. Fuse blown in local breaker control cabinet; fuse replaced by switchyard technician.`
  },
  {
    category: 'Inter-Grid Telecontrol: ASDU Interrogation Command Counter Overflow Anomaly',
    severity: 'LOW',
    weight: 20,
    assetFilter: 'INTER-GRID-TELECONTROL',
    syslogMsg: (ctx) => `Telecontrol Engine: ASDU Type 100 (General Interrogation C_IC_NA_1) sequence counter wrapped around without acknowledgment from remote control center.`,
    noteGen: (ctx) => `Interrogation sequence counter glitch. Telecontrol station re-synchronized interrogation handshake with Northern Regional Load Despatch Centre (NRLDC).`
  }
];

// Sub-5-minute rubber-stamp closure notes (EG-01 Fast Closures 82.5%)
const RUBBER_STAMP_NOTES = [
  'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.',
  'System health normal. Traffic deemed benign routine backup traffic. Resolving alert without further action required.',
  'Alert acknowledged. Template response applied. Ticket resolved inside 3 minutes to maintain SLA compliance.',
  'Reviewed by L1 operator. Telemetry signature matches historical noise profile. Closed per standard dispatch guidance.',
  'Automated triage completed. No kinetic grid deviation recorded on SCADA overview screen. Ticket cleared.',
  'Standard false positive disposition. Closed under expedited 5-minute queue management standard.'
];

async function generate() {
  const TOTAL_RECORDS = 55000;
  const START_TIME = new Date('2026-06-15T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T23:59:59.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  // The 42-day silence cutoff: 42 days before END_TIME is roughly Aug 21, 2026
  const SILENCE_CUTOFF_MS = END_TIME - (42 * 86400 * 1000);

  // 1. Write assets.csv
  const assetsFile = path.join(targetDir, 'assets.csv');
  console.log(`[SAT-SA Power Generator] Writing ${ASSETS.length} assets to ${assetsFile}...`);
  const assetRows = [
    'asset_id,name,type,criticality,environment,ip_address,zone_or_vlan,firmware_os,last_seen'
  ];
  for (const a of ASSETS) {
    assetRows.push([
      a.id,
      a.name,
      a.type,
      a.criticality,
      'PRODUCTION_OT',
      a.ip,
      a.vlan,
      a.os,
      a.lastSeen
    ].map(escapeCsv).join(','));
  }
  fs.writeFileSync(assetsFile, assetRows.join('\r\n') + '\r\n', 'utf-8');

  // 2. Prepare streams for alerts.csv, cases.csv, and syslog_energy.log
  const alertsFile = path.join(targetDir, 'alerts.csv');
  const casesFile = path.join(targetDir, 'cases.csv');
  const syslogFile = path.join(targetDir, 'syslog_energy.log');

  console.log(`[SAT-SA Power Generator] Writing ${TOTAL_RECORDS.toLocaleString()} alerts to ${alertsFile}...`);
  const alertsStream = fs.createWriteStream(alertsFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  const casesStream = fs.createWriteStream(casesFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  const syslogStream = fs.createWriteStream(syslogFile, { flags: 'w', highWaterMark: 1024 * 1024 });

  alertsStream.write('alert_id,category,severity,created_at,closed_at,disposition,assignee,asset_id,investigation_notes\r\n');
  casesStream.write('case_id,alert_id,severity,status,opened_at,closed_at,assignee,escalation_level,root_cause,investigation_notes\r\n');

  const totalWeight = THREAT_CATALOG.reduce((acc, t) => acc + t.weight, 0);
  function pickThreat() {
    let r = Math.random() * totalWeight;
    for (const t of THREAT_CATALOG) {
      if (r < t.weight) return t;
      r -= t.weight;
    }
    return THREAT_CATALOG[0];
  }

  const startTime = Date.now();
  let casesCount = 0;

  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    const linearProgress = (i - 1) / TOTAL_RECORDS;
    const rawTimestampMs = START_TIME + Math.floor(linearProgress * TIME_RANGE) + randInt(-180000, 180000);
    const createdDate = new Date(Math.min(END_TIME, Math.max(START_TIME, rawTimestampMs)));

    const threat = pickThreat();

    // NS-01 Modeling: If timestamp is AFTER the 42-day silence cutoff, exclude the silent RTUs & PLC!
    const isSilentPeriod = createdDate.getTime() > SILENCE_CUTOFF_MS;
    let assetCandidates = ASSETS.filter(a => a.id.startsWith(threat.assetFilter));
    if (isSilentPeriod) {
      assetCandidates = assetCandidates.filter(a =>
        a.id !== 'RTU-SUBSTATION-ALPHA-400KV' &&
        a.id !== 'RTU-SUBSTATION-BETA-220KV' &&
        a.id !== 'PLC-TURBINE-GEN-01'
      );
    }
    if (assetCandidates.length === 0) {
      assetCandidates = isSilentPeriod 
        ? ASSETS.filter(a => a.id !== 'RTU-SUBSTATION-ALPHA-400KV' && a.id !== 'RTU-SUBSTATION-BETA-220KV' && a.id !== 'PLC-TURBINE-GEN-01')
        : ASSETS;
    }
    const asset = randChoice(assetCandidates);

    const ctx = {
      assetId: asset.id,
      analyst: randChoice(ANALYSTS),
      lineId: randInt(1, 4),
      seqId: randInt(100, 999),
      sectorAddr: `0x${randHex(4)}`
    };

    // EG-01 Fast Closures Modeling: 82.5% of closures are rubber-stamped sub-5-minute!
    const isRubberStamp = Math.random() < 0.825;
    let durationMins;
    let noteText;
    let disposition;

    if (isRubberStamp) {
      // 2 to 4 minutes rubber stamp closure
      durationMins = randInt(2, 4);
      noteText = randChoice(RUBBER_STAMP_NOTES);
      disposition = randChoice(['FALSE_POSITIVE', 'RESOLVED_NO_ACTION', 'FALSE_POSITIVE']);
    } else {
      // Detailed engineering investigation (25 to 95 minutes)
      durationMins = randInt(25, 95);
      noteText = threat.noteGen(ctx);
      disposition = threat.severity === 'CRITICAL' ? 'TRUE_POSITIVE' : 'RESOLVED';
    }

    const closedDate = new Date(createdDate.getTime() + durationMins * 60000);
    const alertId = `ALT-PWR-${String(i).padStart(6, '0')}`;
    const assignee = randChoice(ANALYSTS);
    const syslogText = threat.syslogMsg(ctx);

    const alertRow = [
      alertId,
      threat.category,
      threat.severity,
      createdDate.toISOString(),
      closedDate.toISOString(),
      disposition,
      assignee,
      asset.id,
      noteText
    ].map(escapeCsv).join(',') + '\r\n';

    const okAlert = alertsStream.write(alertRow);
    if (!okAlert) {
      await new Promise(res => alertsStream.once('drain', res));
    }

    const syslogLine = `${createdDate.toISOString()} [${threat.severity}] ${asset.id}: ${syslogText}\r\n`;
    const okSyslog = syslogStream.write(syslogLine);
    if (!okSyslog) {
      await new Promise(res => syslogStream.once('drain', res));
    }

    // High & Critical alerts generate cases
    if (threat.severity === 'CRITICAL' || (threat.severity === 'HIGH' && Math.random() < 0.60)) {
      casesCount++;
      const caseId = `CAS-PWR-${String(casesCount).padStart(6, '0')}`;
      const openedDate = new Date(createdDate.getTime() + randInt(20, 100) * 1000);
      const escalationLevel = isRubberStamp ? 'L1_TRIAGE' : (threat.severity === 'CRITICAL' ? 'GRID_CYBER_CRISIS_MANAGEMENT' : 'L2_INCIDENT_HANDLER');
      const rootCause = isRubberStamp ? 'UNDETERMINED' : (threat.severity === 'CRITICAL' ? randChoice(['SCADA_COMMAND_INJECTION', 'MALICIOUS_CODESYS_PAYLOAD', 'DNP3_CROB_SPOOFING']) : randChoice(['UNAUTHORIZED_CONTRACTOR_SCAN', 'PTP_ROGUE_CLOCK_ANOMALY', 'MODBUS_PORT_SWEEP']));

      const caseRow = [
        caseId,
        alertId,
        threat.severity,
        'CLOSED',
        openedDate.toISOString(),
        closedDate.toISOString(),
        assignee,
        escalationLevel,
        rootCause,
        noteText
      ].map(escapeCsv).join(',') + '\r\n';

      const okCase = casesStream.write(caseRow);
      if (!okCase) {
        await new Promise(res => casesStream.once('drain', res));
      }
    }

    if (i % 15000 === 0) {
      console.log(`  -> Generated ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} Power records...`);
    }
  }

  alertsStream.end();
  casesStream.end();
  syslogStream.end();

  await Promise.all([
    new Promise(res => alertsStream.once('finish', res)),
    new Promise(res => casesStream.once('finish', res)),
    new Promise(res => syslogStream.once('finish', res))
  ]);

  // 3. Generate updated consolidated_submission.json
  const jsonFile = path.join(targetDir, 'consolidated_submission.json');
  const consolidatedPayload = {
    submissionId: 'SUB-CSE-POWER-01-2026-Q3-BENCHMARK',
    entityCode: 'CSE-POWER-01',
    entityName: 'Northern Regional Power Grid Transmission',
    sector: 'Power Grid & Energy',
    generatedAt: new Date().toISOString(),
    benchmarkSummary: {
      totalAlerts: TOTAL_RECORDS,
      totalCases: casesCount,
      monitoredNodes: ASSETS.length,
      complianceStandards: ['NCIIPC Critical Sector Cybersecurity Framework v2.1', 'CEA (Central Electricity Authority) Cybersecurity Guidelines', 'NERC CIP Standards', 'IEC 62443 Industrial Security']
    },
    reportedKpis: {
      headlineSlaCompliancePct: 99.1,
      reportedMttrMinutes: 12.4,
      totalAlertsHandled: TOTAL_RECORDS
    },
    assets: ASSETS,
    sampleTelemetrySlice: [
      {
        alert_id: 'ALT-PWR-000001',
        category: 'PIPEDREAM / Incontroller: Malicious CODESYS Runtime Function Block Execution',
        severity: 'CRITICAL',
        asset: 'EMS-SCADA-CORE-01'
      },
      {
        alert_id: 'ALT-PWR-000002',
        category: 'SCADA Command Injection: Modbus/TCP Unauthorized Function Code 05 (Write Single Coil)',
        severity: 'CRITICAL',
        asset: 'RTU-SUBSTATION-ALPHA-400KV'
      }
    ]
  };
  fs.writeFileSync(jsonFile, JSON.stringify(consolidatedPayload, null, 2), 'utf-8');

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const alertsStat = fs.statSync(alertsFile);
  const casesStat = fs.statSync(casesFile);
  const syslogStat = fs.statSync(syslogFile);

  console.log(`\n[SAT-SA Power Generator] Successfully generated Stage 4: POWER (CSE-POWER-01)!`);
  console.log(`  • Alerts File: ${alertsFile} (${(alertsStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} rows)`);
  console.log(`  • Cases File:  ${casesFile} (${(casesStat.size / (1024 * 1024)).toFixed(2)} MB, ${casesCount.toLocaleString()} rows)`);
  console.log(`  • Syslog File: ${syslogFile} (${(syslogStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} lines)`);
  console.log(`  • Execution Time: ${elapsedSec}s`);
}

generate().catch(err => {
  console.error('[Error] Power generator failed:', err);
  process.exit(1);
});
