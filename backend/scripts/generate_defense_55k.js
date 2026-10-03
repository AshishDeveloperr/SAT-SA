import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../../samples/CSE-DEFENSE-01');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('[SAT-SA Defense Generator] Target Directory:', targetDir);
console.log('[SAT-SA Defense Generator] Generating 55,000 authentic, highly professional defense records for CSE-DEFENSE-01...');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randIp(subnet = '192.168.100') {
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

// 1. 24 Authentic Defense & Strategic Infrastructure Assets
const ASSETS = [
  { id: 'AIRGAP-CROSS-DOMAIN-DIODE-01', name: 'Hardware Unidirectional Cross-Domain Data Diode Primary', type: 'DATA_DIODE', criticality: 5, ip: '192.168.100.1', vlan: 'AIRGAP-ISOLATED-OPTICAL', os: 'Owl Cyber Defense DualDiode Hardware OS' },
  { id: 'AIRGAP-CROSS-DOMAIN-DIODE-02', name: 'Hardware Unidirectional Cross-Domain Data Diode Secondary', type: 'DATA_DIODE', criticality: 5, ip: '192.168.100.2', vlan: 'AIRGAP-ISOLATED-OPTICAL', os: 'Owl Cyber Defense DualDiode Hardware OS' },
  { id: 'CAD-CAM-AVIONICS-SRV-01', name: 'Classified Supersonic Airframe CAD/CAM Repository 01', type: 'DEFENSE_CAD_SERVER', criticality: 5, ip: '192.168.100.15', vlan: 'ENCLAVE-TOPSECRET-CAD', os: 'Debian Hardened / SELinux Strict MLS' },
  { id: 'CAD-CAM-AVIONICS-SRV-02', name: 'Classified Supersonic Airframe CAD/CAM Repository 02', type: 'DEFENSE_CAD_SERVER', criticality: 5, ip: '192.168.100.16', vlan: 'ENCLAVE-TOPSECRET-CAD', os: 'Debian Hardened / SELinux Strict MLS' },
  { id: 'CNC-TITANIUM-MILLING-01', name: '5-Axis Sub-Micron Titanium Wing Spar Mill 01', type: 'CNC_MACHINE', criticality: 5, ip: '192.168.20.4', vlan: 'VLAN-20-MILLING-OT', os: 'Heidenhain TNC 640 v08.4' },
  { id: 'CNC-TITANIUM-MILLING-02', name: '5-Axis Sub-Micron Titanium Wing Spar Mill 02', type: 'CNC_MACHINE', criticality: 5, ip: '192.168.20.5', vlan: 'VLAN-20-MILLING-OT', os: 'Heidenhain TNC 640 v08.4' },
  { id: 'FIRMWARE-SIGNING-HSM-01', name: 'Flight Control Firmware Cryptographic Signing HSM 01', type: 'SIGNING_HSM', criticality: 5, ip: '192.168.100.50', vlan: 'AIRGAP-SIGNING-VAULT', os: 'Utimaco CryptoServer v4.4 (EAL4+ FIPS 140-3)' },
  { id: 'FIRMWARE-SIGNING-HSM-02', name: 'Flight Control Firmware Cryptographic Signing HSM 02', type: 'SIGNING_HSM', criticality: 5, ip: '192.168.100.51', vlan: 'AIRGAP-SIGNING-VAULT', os: 'Utimaco CryptoServer v4.4 (EAL4+ FIPS 140-3)' },
  { id: 'C2-RESTRICTED-ENCLAVE-GW-01', name: 'Strategic Command & Control Boundary Cryptographic Gateway 01', type: 'CRYPTO_GATEWAY', criticality: 5, ip: '192.168.10.1', vlan: 'RESTRICTED-BOUNDARY-VLAN', os: 'IPKO Cryptographic Appliance v4.2' },
  { id: 'C2-RESTRICTED-ENCLAVE-GW-02', name: 'Strategic Command & Control Boundary Cryptographic Gateway 02', type: 'CRYPTO_GATEWAY', criticality: 5, ip: '192.168.10.2', vlan: 'RESTRICTED-BOUNDARY-VLAN', os: 'IPKO Cryptographic Appliance v4.2' },
  { id: 'RADAR-DSP-TELEMETRY-01', name: 'AESA Airborne Radar Digital Signal Processing Node 01', type: 'RADAR_PROCESSOR', criticality: 5, ip: '192.168.30.12', vlan: 'VLAN-30-AVIONICS-RADAR', os: 'Wind River VxWorks 7.0 RTOS' },
  { id: 'RADAR-DSP-TELEMETRY-02', name: 'AESA Airborne Radar Digital Signal Processing Node 02', type: 'RADAR_PROCESSOR', criticality: 5, ip: '192.168.30.13', vlan: 'VLAN-30-AVIONICS-RADAR', os: 'Wind River VxWorks 7.0 RTOS' },
  { id: 'MIL-STD-1553-BUS-ANALYZER-01', name: 'Avionics MIL-STD-1553 Multiplex Bus Protocol Analyzer 01', type: 'AVIONICS_BUS_MONITOR', criticality: 5, ip: '192.168.40.8', vlan: 'VLAN-40-HIL-SIMULATION', os: 'DDC MIL-STD-1553 Hardware Engine' },
  { id: 'MIL-STD-1553-BUS-ANALYZER-02', name: 'Avionics MIL-STD-1553 Multiplex Bus Protocol Analyzer 02', type: 'AVIONICS_BUS_MONITOR', criticality: 5, ip: '192.168.40.9', vlan: 'VLAN-40-HIL-SIMULATION', os: 'DDC MIL-STD-1553 Hardware Engine' },
  { id: 'TEMPEST-SECURE-CONSOLE-01', name: 'TEMPEST SDIP-27 Level A Shielded Operator Console 01', type: 'TEMPEST_CONSOLE', criticality: 4, ip: '192.168.100.80', vlan: 'ENCLAVE-TOPSECRET-CAD', os: 'Hardened Red Hat Enterprise Linux 9' },
  { id: 'TEMPEST-SECURE-CONSOLE-02', name: 'TEMPEST SDIP-27 Level A Shielded Operator Console 02', type: 'TEMPEST_CONSOLE', criticality: 4, ip: '192.168.100.81', vlan: 'ENCLAVE-TOPSECRET-CAD', os: 'Hardened Red Hat Enterprise Linux 9' },
  { id: 'EKMS-KEY-DISTRIB-PROC-01', name: 'Electronic Key Management System (EKMS) Tier-1 Key Processor', type: 'KEY_PROCESSOR', criticality: 5, ip: '192.168.100.60', vlan: 'AIRGAP-SIGNING-VAULT', os: 'KMI Management Appliance OS' },
  { id: 'EKMS-KEY-DISTRIB-PROC-02', name: 'Electronic Key Management System (EKMS) Fill Device Station', type: 'KEY_PROCESSOR', criticality: 5, ip: '192.168.100.61', vlan: 'AIRGAP-SIGNING-VAULT', os: 'KMI Management Appliance OS' },
  { id: 'SCIF-ACCESS-CONTROLLER-01', name: 'SCIF Cleanroom Biometric Interlock Access Controller 01', type: 'FACILITY_ACCESS', criticality: 4, ip: '192.168.50.1', vlan: 'VLAN-50-PHYSICAL-SECURITY', os: 'Software House C•CURE 9000 Industrial' },
  { id: 'SCIF-ACCESS-CONTROLLER-02', name: 'SCIF Vault Door Interlock Access Controller 02', type: 'FACILITY_ACCESS', criticality: 4, ip: '192.168.50.2', vlan: 'VLAN-50-PHYSICAL-SECURITY', os: 'Software House C•CURE 9000 Industrial' },
  { id: 'SIEM-COLLECTOR-AIRGAP-01', name: 'Air-Gapped Telemetry Collector & Forwarder Primary', type: 'SIEM_COLLECTOR', criticality: 4, ip: '192.168.100.200', vlan: 'AIRGAP-MONITORING', os: 'RHEL 9.2 DISA STIG Compliant' },
  { id: 'SIEM-COLLECTOR-AIRGAP-02', name: 'Air-Gapped Telemetry Collector & Forwarder Backup', type: 'SIEM_COLLECTOR', criticality: 4, ip: '192.168.100.201', vlan: 'AIRGAP-MONITORING', os: 'RHEL 9.2 DISA STIG Compliant' },
  { id: 'OPTICAL-FIBER-TAP-SENSOR-01', name: 'Perimeter Optical Time Domain Reflectometer Tap Detector 01', type: 'OPTICAL_SENSOR', criticality: 4, ip: '192.168.60.10', vlan: 'VLAN-60-INFRA-TELEMETRY', os: 'AP Sensing OTDR Fiber Guardian' },
  { id: 'OPTICAL-FIBER-TAP-SENSOR-02', name: 'Perimeter Optical Time Domain Reflectometer Tap Detector 02', type: 'OPTICAL_SENSOR', criticality: 4, ip: '192.168.60.11', vlan: 'VLAN-60-INFRA-TELEMETRY', os: 'AP Sensing OTDR Fiber Guardian' }
];

// 2. 26 Authentic Defense Threat Categories
const THREAT_CATALOG = [
  // Cross-Domain & Air-Gap Integrity
  {
    category: 'Data Diode: Photodiode Reverse Optical Pulse / Back-Channel Modulation Detection',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'AIRGAP-CROSS-DOMAIN-DIODE',
    syslogMsg: (ctx) => `Owl DualDiode Hardware Sensor: Photodiode receiver reported back-channel optical emission on fiber rx-pair 1 (Power: -18.4 dBm). Physical transmission severed.`,
    noteGen: (ctx) => `Physical air-gap security violation alert. Unidirectional data diode optical sensor detected reverse modulated pulses on rx fiber pair. Return channel physically severed within 400 microseconds. Hardware enclosure tamper seals verified intact. Transmit card pulled for cleanroom laboratory forensic inspection.`
  },
  {
    category: 'Air-Gapped Enclave: Unknown Mass Storage Device Insertion on Top Secret Workstation',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'CAD-CAM-AVIONICS-SRV',
    syslogMsg: (ctx) => `Kernel USB Guard: Unauthorized USB device VID:PID 0781:5583 (SanDisk Extreme Pro) inserted on bus 001 device 004 by user ${ctx.analyst}. Blocked by udev policy.`,
    noteGen: (ctx) => `Strict air-gap boundary policy violation. An unregistered USB mass storage device was plugged into CAD/CAM production server ${ctx.assetId}. Kernel USB-Guard immediately rejected interface binding and powered down USB root controller. User security clearance badge suspended pending military counter-intelligence debrief.`
  },
  {
    category: 'Classified CAD/CAM: Staging of Encrypted STEP Aerodynamic Models to Unauthorized Storage',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'CAD-CAM-AVIONICS-SRV',
    syslogMsg: (ctx) => `DLP File Integrity Watch: Process 7z.exe compressed 14 restricted STEP assemblies in C:\\Workspace\\${ctx.projectCode}\\Stage to hidden directory.`,
    noteGen: (ctx) => `Classified defense intellectual property exfiltration alert. Operator attempted to archive confidential fifth-generation supersonic aircraft airframe finite-element models into password-protected 7z archive. DLP sensor quarantined file; memory dump of workstation preserved for tribunal evidence.`
  },

  // Avionics & Flight Control Systems
  {
    category: 'MIL-STD-1553: Flight Control Bus Sync Word Corrupt Injection / Command Override',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'MIL-STD-1553-BUS-ANALYZER',
    syslogMsg: (ctx) => `DDC 1553 Protocol Engine: Subaddress 12 invalid sync word (Command/Status bit inversion) on Bus A from Remote Terminal RT=${ctx.rtId}.`,
    noteGen: (ctx) => `Avionics multiplex bus monitoring system detected corrupt sync word injection targeting Flight Control Computer Subaddress 12. Protocol analyzer engaged dual-redundant Bus B failover. Electrical signal oscilloscope trace confirmed non-standard voltage transients on RT=${ctx.rtId} transceiver.`
  },
  {
    category: 'Avionics Firmware: Unsigned Bootloader Flashing Attempt on Flight Control Computer',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'FIRMWARE-SIGNING-HSM',
    syslogMsg: (ctx) => `Secure Boot Validator: Cryptographic signature validation failed on FCC boot binary image 'fcc_stage1_${ctx.buildId}.bin'. Digest mismatch.`,
    noteGen: (ctx) => `Hardware secure boot interlock halted flight control computer flashing sequence. Firmware binary lacked valid Utimaco EAL4+ digital signature. Target FCC board preserved in quarantined static bag; automated flashing rig disabled.`
  },
  {
    category: 'Firmware Signing HSM: Secondary M-of-N Cryptographic Smartcard Token Auth Failure',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'FIRMWARE-SIGNING-HSM',
    syslogMsg: (ctx) => `Utimaco CryptoServer: M-of-N quorum failed for signing operation. Required: 3 tokens, Presented: 2 valid, 1 expired token (Slot 2).`,
    noteGen: (ctx) => `Avionics firmware release signing procedure aborted. Three-party authorization quorum failed when custodian presented an expired cryptographic smartcard token. Key release aborted; incident reported to Defense Security Assurance Officer.`
  },

  // Defense Production & 5-Axis CNC Milling
  {
    category: '5-Axis CNC: G-Code Toolpath Deviation Outside 0.005mm Tolerance (Kinetic Sabotage)',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'CNC-TITANIUM-MILLING',
    syslogMsg: (ctx) => `Heidenhain TNC Watchdog: Spindle Z-axis feed rate override +35% during finishing pass on titanium spar component PART-${ctx.partId}.`,
    noteGen: (ctx) => `Kinetic manufacturing sabotage detection rule tripped on 5-axis titanium milling center ${ctx.assetId}. Controller detected uncommanded spindle feed rate acceleration during critical root spar cut. Feed hold engaged within 20 milliseconds; titanium workpiece undamaged. G-code file checksum audited against golden engineering repository.`
  },
  {
    category: 'CNC Milling Controller: Unauthorized PLC Logic Reload via Serial Diagnostic Port COM1',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'CNC-TITANIUM-MILLING',
    syslogMsg: (ctx) => `TNC Diagnostic Log: PLC machine logic flash memory write sequence initiated via physical RS-232 serial maintenance port COM1.`,
    noteGen: (ctx) => `Industrial control security alert. Physical RS-232 serial diagnostic port on CNC controller received unauthenticated PLC firmware rewrite instruction. Physical port isolator tripped switch; machine locked in safe estop status.`
  },

  // Cryptographic Key Management (EKMS / KMI)
  {
    category: 'Electronic Key Management (EKMS): Cryptographic Fill-Device Zeroization Switch Trip',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'EKMS-KEY-DISTRIB-PROC',
    syslogMsg: (ctx) => `EKMS Fill Processor: Emergency zeroization circuit opened on key transfer slot ${ctx.slotId}. Redundant key memory overwritten.`,
    noteGen: (ctx) => `Emergency zeroization sensor activated on cryptographic key distribution device. Battery backup and volatile key storage purged with alternating bit patterns per NSA/DISA cryptographic doctrine. Dual key control officers conducted physical inventory of all paper key tapes.`
  },

  // C2 Gateway & Perimeter Enclave
  {
    category: 'Defense C2 Gateway: Covert High-Entropy DNS Beaconing to Nation-State APT Sinkhole',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'C2-RESTRICTED-ENCLAVE-GW',
    syslogMsg: (ctx) => `IPKO Firewall IDS: Base32 encoded DNS tunnel queries detected targeting domain *.c2-telemetry-${ctx.aptCode}.org. Destination IP sinkholed.`,
    noteGen: (ctx) => `Advanced Persistent Threat (APT) communication signature identified by boundary cryptographic gateway. An internal engineering terminal attempted to establish periodic high-entropy DNS query beacons. Upstream boundary firewall dropped traffic and redirected domain queries to internal forensic sandbox sinkhole.`
  },
  {
    category: 'Defense Jump Host: Mimikatz LSASS Memory Dumping Heuristic on STIG-Hardened Bastion',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'C2-RESTRICTED-ENCLAVE-GW',
    syslogMsg: (ctx) => `Windows Defender ATP: Behavioral heuristic 'Win32/CredentialTheft.LSASS' matched on process dump_lsass_${ctx.analyst}.exe.`,
    noteGen: (ctx) => `Endpoint detection sensor terminated malicious memory scraping process targeting Local Security Authority Subsystem Service (LSASS). The contractor jump host was immediately quarantined from the defense management network.`
  },

  // Physical Security, SCIF & Optics
  {
    category: 'SCIF Perimeter: Biometric Anti-Passback Tamper / Tailgating Breach on Secure Cleanroom',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'SCIF-ACCESS-CONTROLLER',
    syslogMsg: (ctx) => `C•CURE 9000 Event: Anti-passback violation on Door SCIF-VAULT-01. User ID ${ctx.analyst} attempted badge-in without preceding egress log.`,
    noteGen: (ctx) => `Physical SCIF boundary protocol failure. Optical beam sensors detected two individuals entering secure cleanroom airlock on single biometric badge cycle. Interlock doors automatically locked in capture position; security response team dispatched within 45 seconds.`
  },
  {
    category: 'Optical Security: OTDR Acoustic Reflection Surge on Classified Fiber Run (Physical Tap)',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'OPTICAL-FIBER-TAP-SENSOR',
    syslogMsg: (ctx) => `AP Sensing OTDR: Optical backscatter event detected at distance marker 412.5 meters on classified trunk line CAB-RED-04. Splice loss +0.8 dB.`,
    noteGen: (ctx) => `Physical fiber optic wiretapping detection alert. Precision Optical Time Domain Reflectometer detected anomalous Rayleigh backscatter reflection and localized attenuation jump at meter 412.5. Encrypted communications rerouted to microwave secondary line; physical patrol sent to inspect conduit.`
  },
  {
    category: 'TEMPEST Shielding: RF Emission Attenuation Degradation on Faraday Cage Enclosure',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'TEMPEST-SECURE-CONSOLE',
    syslogMsg: (ctx) => `TEMPEST Sensor: RF leakage monitor detected signal baseline degradation (-62 dBm at 433 MHz) on shielded console chassis ${ctx.assetId}.`,
    noteGen: (ctx) => `TEMPEST electromagnetic shielding audit alert. Radio frequency attenuation monitor reported gasket degradation on operator console shielded door. Classified operations halted; beryllium copper fingerstock gasket replaced and verified by TEMPEST testing officer.`
  },

  // Radar, Electronic Warfare & Avionics Telemetry
  {
    category: 'AESA Radar Telemetry: Electronic Warfare Waveform Code Decompilation Heuristic',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'RADAR-DSP-TELEMETRY',
    syslogMsg: (ctx) => `DSP Kernel Watch: Disassembly probe detected on memory region 0x80000000 (AESA Chirp Table) from process gdb_agent.exe.`,
    noteGen: (ctx) => `Radar telemetry processor flagged unauthorized debugging activity on classified frequency-hopping waveform tables. DSP processor triggered firmware lock and cleared volatile waveform cache.`
  },
  {
    category: 'Red/Black Enclave: Plaintext Red-Line Crosstalk Leakage Detected on Black-Side Patch Panel',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'C2-RESTRICTED-ENCLAVE-GW',
    syslogMsg: (ctx) => `TEMPEST Line Monitor: Red/Black crosstalk voltage threshold exceeded (+4.2mV) between unclassified patch bay and crypto trunk.`,
    noteGen: (ctx) => `Signal separation violation detected by line impedance sensor. Galvanic isolator on Black-side unclassified network cable identified capacitive crosstalk from adjacent Red-side secure channel. Cable physically separated into dedicated conduit.`
  },
  {
    category: 'Avionics Testing Rig: ARINC-429 Discrete Word Parity Error Injection during HIL Simulation',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'MIL-STD-1553-BUS-ANALYZER',
    syslogMsg: (ctx) => `Hardware-in-the-Loop Sensor: Repeated odd-parity bit violations on ARINC-429 differential pair Label 270 (Discrete Flight Status).`,
    noteGen: (ctx) => `Simulation rig protocol validator identified anomalous discrete word parity failures on ARINC-429 test bus. Transceiver IC on interface board replaced; bench test restarted.`
  },
  {
    category: 'Tactical Data Link: Link-16 Message Authentication Code (MAC) Desynchronization Surge',
    severity: 'MEDIUM',
    weight: 18,
    assetFilter: 'C2-RESTRICTED-ENCLAVE-GW',
    syslogMsg: (ctx) => `Link-16 Terminal: Time Slot Allocation Desync on Net 42. Cryptographic Time-of-Day (TOD) jitter exceeded ±2 microseconds.`,
    noteGen: (ctx) => `Tactical communications terminal logged time-slot synchronization errors. Atomic rubidium clock reference adjusted; Link-16 network terminal re-established cryptographic synchronization.`
  },
  {
    category: 'Air-Gapped CAD Server: Unapproved Steganographic PNG Payload Injection in Blueprint Archive',
    severity: 'HIGH',
    weight: 10,
    assetFilter: 'CAD-CAM-AVIONICS-SRV',
    syslogMsg: (ctx) => `DLP Image Inspector: High chi-square statistical entropy in Least Significant Bit (LSB) planes of blueprint drawing DRW-${ctx.partId}.png.`,
    noteGen: (ctx) => `Steganography detection engine identified hidden payload embedded in engineering schematic image. File quarantined; source user workstation isolated for counter-intelligence forensic imaging.`
  },
  {
    category: 'Classified Print Spooler: Watermarked Blueprint Print Job Routing Outside Controlled Vault',
    severity: 'MEDIUM',
    weight: 16,
    assetFilter: 'TEMPEST-SECURE-CONSOLE',
    syslogMsg: (ctx) => `Classified Spooler: Print job 'Wing_Spar_RevD.pdf' routed to non-vault networked printer PRN-FLOOR-02 (Requires PRN-SCIF-VAULT).`,
    noteGen: (ctx) => `Secure print spooler intercepted classified drawing queued to an unapproved printer location. Job canceled and audit alert dispatched to security officer.`
  },
  {
    category: 'Air-Gap Maintenance: Diagnostic Laptop Connected with Wi-Fi Hardware Switch Enabled',
    severity: 'MEDIUM',
    weight: 14,
    assetFilter: 'SIEM-COLLECTOR-AIRGAP',
    syslogMsg: (ctx) => `Physical Port Sentinel: Maintenance laptop MAC 00:1E:67:${ctx.macTail} reported active 802.11ax radio while connected to cleanroom LAN.`,
    noteGen: (ctx) => `Air-gap hygiene violation. Contractor laptop connected to isolated cleanroom maintenance port was detected with physical Wi-Fi adapter energized. Port shut down and contractor escorted from facility.`
  },
  {
    category: 'Microcontroller Supply Chain: JTAG Boundary Scan Chip ID Discrepancy on Guidance Sensor PCB',
    severity: 'MEDIUM',
    weight: 12,
    assetFilter: 'RADAR-DSP-TELEMETRY',
    syslogMsg: (ctx) => `JTAG Hardware Probe: IEEE 1149.1 Device ID 0x${ctx.chipId} does not match defense qualified vendor Bill of Materials (Expected: 0x4BA00477).`,
    noteGen: (ctx) => `Counterfeit hardware component alert. Automated automated boundary scan during avionics PCB assembly identified mismatched silicon stepping on DSP microcontroller. Lot quarantined for destructive laboratory analysis.`
  },
  {
    category: 'SCIF Environmental: Temperature Sensor Spike Exceeding Safe Operating Envelope in Cryptovault',
    severity: 'MEDIUM',
    weight: 12,
    assetFilter: 'SCIF-ACCESS-CONTROLLER',
    syslogMsg: (ctx) => `BMS Environmental Sensor: Cryptovault Room 102 temperature reached 31.8°C (Threshold: 24.0°C). Primary CRAC unit fan failure.`,
    noteGen: (ctx) => `Environmental safety alert. High-density cryptographic equipment room experienced cooling compressor fault. Redundant CRAC activated and HVAC technicians escorted under armed watch.`
  },
  {
    category: 'GPS Anti-Spoofing: Selective Availability Anti-Spoofing Module Lock Lost on Testbed',
    severity: 'LOW',
    weight: 14,
    assetFilter: 'MIL-STD-1553-BUS-ANALYZER',
    syslogMsg: (ctx) => `SAASM Receiver: P(Y) code tracking lost. Reverted to C/A civilian signal mode on Avionics Testbed 04.`,
    noteGen: (ctx) => `Avionics navigation testbed logged loss of military GPS P(Y) code lock. Satellite constellation geometry verified; cryptographic key crypto-period verified valid.`
  },
  {
    category: 'RF Spectrum Monitor: Rogue Wireless Emission Detected Inside Anechoic Chamber',
    severity: 'MEDIUM',
    weight: 10,
    assetFilter: 'TEMPEST-SECURE-CONSOLE',
    syslogMsg: (ctx) => `RF Spectral Sentinel: Unregistered burst transmission at 915 MHz (+12 dBm) detected in Anechoic Chamber 02.`,
    noteGen: (ctx) => `Spectrum surveillance system in electromagnetic compatibility test chamber detected unauthorized RF beacon. Physical search located an unapproved wireless digital caliper left by technicians.`
  },
  {
    category: 'Physical Enclave: Tamper-Evident Fiber Optic Seal Micro-Fracture Alert on Distribution Rack',
    severity: 'LOW',
    weight: 14,
    assetFilter: 'OPTICAL-FIBER-TAP-SENSOR',
    syslogMsg: (ctx) => `Physical Security Seal Sensor: Fiber seal continuity interrupted on Distribution Cabinet RACK-SEC-08.`,
    noteGen: (ctx) => `Continuous optical loop seal alert on classified distribution cabinet. Security officer confirmed seal was brushed during routine cabling maintenance. New serialized numbered seal applied.`
  }
];

const ANALYSTS = [
  'cirt_singh_01', 'cirt_singh_02', 'forensics_bhardwaj_02', 'ot_defense_eng_03',
  'crypto_officer_04', 'tempest_analyst_05', 'scif_officer_06', 'avionics_nair_07',
  'q_clearance_rao_08', 'radar_iyer_09', 'diode_deshmukh_10'
];

async function generate() {
  const TOTAL_RECORDS = 55000;
  const START_TIME = new Date('2026-09-02T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T00:00:00.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  // 1. Generate assets.csv
  const assetsFile = path.join(targetDir, 'assets.csv');
  console.log(`[SAT-SA Defense Generator] Writing ${ASSETS.length} assets to ${assetsFile}...`);
  const assetRows = [
    'asset_id,name,type,criticality,environment,ip_address,zone_or_vlan,firmware_os,last_seen'
  ];
  for (const a of ASSETS) {
    assetRows.push([
      a.id,
      a.name,
      a.type,
      a.criticality,
      'CLASSIFIED_AIRGAP',
      a.ip,
      a.vlan,
      a.os,
      new Date(END_TIME - randInt(60000, 3600000)).toISOString()
    ].map(escapeCsv).join(','));
  }
  fs.writeFileSync(assetsFile, assetRows.join('\r\n') + '\r\n', 'utf-8');

  // 2. Prepare streams for alerts.csv, cases.csv, and syslog_defense.log
  const alertsFile = path.join(targetDir, 'alerts.csv');
  const casesFile = path.join(targetDir, 'cases.csv');
  const syslogFile = path.join(targetDir, 'syslog_defense.log');

  console.log(`[SAT-SA Defense Generator] Writing ${TOTAL_RECORDS.toLocaleString()} alerts to ${alertsFile}...`);
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

    let assetCandidates = ASSETS.filter(a => a.id.startsWith(threat.assetFilter));
    if (assetCandidates.length === 0) assetCandidates = ASSETS;
    const asset = randChoice(assetCandidates);

    const ctx = {
      assetId: asset.id,
      analyst: randChoice(ANALYSTS),
      projectCode: randChoice(['TEJAS-MK2', 'AMCA-STEALTH', 'PRALAY-GUIDANCE', 'NETRA-AEWC', 'BRAHMOS-NG']),
      rtId: randInt(1, 31),
      partId: randInt(4001, 8999),
      slotId: randInt(1, 4),
      aptCode: randChoice(['STORM-0558', 'VOLT-TYPHOON', 'LAZARUS', 'APT29', 'APT41']),
      macTail: `${randHex(2)}:${randHex(2)}:${randHex(2)}`,
      chipId: randHex(8),
      buildId: `v4.${randInt(10, 99)}`
    };

    const noteText = threat.noteGen(ctx);
    const syslogText = threat.syslogMsg(ctx);

    let durationMins;
    if (threat.severity === 'CRITICAL') {
      durationMins = randInt(15, 60);
    } else if (threat.severity === 'HIGH') {
      durationMins = randInt(25, 90);
    } else {
      durationMins = randInt(10, 45);
    }
    const closedDate = new Date(createdDate.getTime() + durationMins * 60000);

    const alertId = `ALT-DEF-${String(i).padStart(6, '0')}`;
    const disposition = threat.severity === 'CRITICAL'
      ? randChoice(['TRUE_POSITIVE', 'RESOLVED', 'ESCALATED_L3_MILITARY_TRIBUNAL'])
      : randChoice(['RESOLVED', 'TRUE_POSITIVE', 'FALSE_POSITIVE', 'AUTO_CONTAINED_AIRGAP']);
    const assignee = randChoice(ANALYSTS);

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

    // High & Critical alerts generate rigorous defense case dossiers (High discipline maturity)
    if (threat.severity === 'CRITICAL' || (threat.severity === 'HIGH' && Math.random() < 0.65)) {
      casesCount++;
      const caseId = `CAS-DEF-${String(casesCount).padStart(6, '0')}`;
      const openedDate = new Date(createdDate.getTime() + randInt(20, 120) * 1000);
      const escalationLevel = threat.severity === 'CRITICAL'
        ? randChoice(['L3_MILITARY_COUNTER_INTELLIGENCE', 'DEFENSE_CYBER_COMMAND_CSITE'])
        : randChoice(['L2_AIRGAP_FORENSICS', 'L1_SECURITY_OFFICER']);
      const rootCause = threat.severity === 'CRITICAL'
        ? randChoice(['REVERSE_DIODE_PULSE_ANOMALY', 'UNAUTHORIZED_USB_INSERTION_ATTEMPT', 'MIL_1553_SYNC_CORRUPTION', 'GCODE_TOOLPATH_SUB_MICRON_DEVIATION', 'FIRMWARE_SIGNATURE_TAMPER'])
        : randChoice(['SCIF_TAILGATING_BREACH', 'TEMPEST_GASKET_DEGRADATION', 'C2_DNS_TUNNEL_BLOCKED', 'RED_BLACK_CROSSTALK_ATTENUATION']);

      const caseNotes = `Official Defense Enclave Incident Dossier for ${threat.category}. Classified root cause recorded as ${rootCause}. Full bitstream image acquired on ${asset.id} in strict custody chain per Section 65B Indian Evidence Act.`;

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
        caseNotes
      ].map(escapeCsv).join(',') + '\r\n';

      const okCase = casesStream.write(caseRow);
      if (!okCase) {
        await new Promise(res => casesStream.once('drain', res));
      }
    }

    if (i % 15000 === 0) {
      console.log(`  -> Generated ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} Defense records...`);
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
    submissionId: 'SUB-CSE-DEFENSE-01-2026-Q3-BENCHMARK',
    entityCode: 'CSE-DEFENSE-01',
    entityName: 'Strategic Avionics & Defense Manufacturing Hub',
    sector: 'Defense & Strategic Enclaves',
    generatedAt: new Date().toISOString(),
    benchmarkSummary: {
      totalAlerts: TOTAL_RECORDS,
      totalCases: casesCount,
      monitoredNodes: ASSETS.length,
      complianceStandards: ['Defense Cyber Agency (DCyA) Standards', 'Common Criteria EAL4+', 'DISA STIG Hardening', 'TEMPEST SDIP-27']
    },
    assets: ASSETS,
    sampleTelemetrySlice: [
      {
        alert_id: 'ALT-DEF-000001',
        category: 'Data Diode: Photodiode Reverse Optical Pulse / Back-Channel Modulation Detection',
        severity: 'CRITICAL',
        asset: 'AIRGAP-CROSS-DOMAIN-DIODE-01'
      },
      {
        alert_id: 'ALT-DEF-000002',
        category: '5-Axis CNC: G-Code Toolpath Deviation Outside 0.005mm Tolerance (Kinetic Sabotage)',
        severity: 'CRITICAL',
        asset: 'CNC-TITANIUM-MILLING-01'
      }
    ]
  };
  fs.writeFileSync(jsonFile, JSON.stringify(consolidatedPayload, null, 2), 'utf-8');

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const alertsStat = fs.statSync(alertsFile);
  const casesStat = fs.statSync(casesFile);
  const syslogStat = fs.statSync(syslogFile);

  console.log(`\n[SAT-SA Defense Generator] Successfully generated Stage 2: DEFENCE (CSE-DEFENSE-01)!`);
  console.log(`  • Alerts File: ${alertsFile} (${(alertsStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} rows)`);
  console.log(`  • Cases File:  ${casesFile} (${(casesStat.size / (1024 * 1024)).toFixed(2)} MB, ${casesCount.toLocaleString()} rows)`);
  console.log(`  • Syslog File: ${syslogFile} (${(syslogStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} lines)`);
  console.log(`  • Execution Time: ${elapsedSec}s`);
}

generate().catch(err => {
  console.error('[Error] Defense generator failed:', err);
  process.exit(1);
});
