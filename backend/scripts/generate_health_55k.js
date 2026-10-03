import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../../samples/CSE-HEALTH-01');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('[SAT-SA Health Generator] Target Directory:', targetDir);
console.log('[SAT-SA Health Generator] Generating 55,000 authentic, highly professional health records for CSE-HEALTH-01...');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randIp(subnet = '10.180.10') {
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

// 1. 24 Authentic Critical Healthcare & National Telehealth Infrastructure Assets
const ASSETS = [
  { id: 'EHR-FHIR-API-GATEWAY-01', name: 'National Electronic Health Records FHIR RESTful API Gateway Primary', type: 'FHIR_GATEWAY', criticality: 5, ip: '10.180.10.1', vlan: 'VLAN-301-PUBLIC-HEALTH-API', os: 'Ubuntu 22.04 LTS Hardened / Kong Enterprise 3.4' },
  { id: 'EHR-FHIR-API-GATEWAY-02', name: 'National Electronic Health Records FHIR RESTful API Gateway Secondary', type: 'FHIR_GATEWAY', criticality: 5, ip: '10.180.10.2', vlan: 'VLAN-301-PUBLIC-HEALTH-API', os: 'Ubuntu 22.04 LTS Hardened / Kong Enterprise 3.4' },
  { id: 'DICOM-PACS-IMAGING-ARCHIVE-01', name: 'Radiology DICOM Image Storage PACS Cluster Alpha', type: 'DICOM_PACS', criticality: 5, ip: '10.180.20.11', vlan: 'VLAN-310-IMAGING-PACS', os: 'Windows Server 2022 / Orthanc DICOM Server 1.12' },
  { id: 'DICOM-PACS-IMAGING-ARCHIVE-02', name: 'Radiology DICOM Image Storage PACS Cluster Beta', type: 'DICOM_PACS', criticality: 5, ip: '10.180.20.12', vlan: 'VLAN-310-IMAGING-PACS', os: 'RHEL 9.2 Enterprise / dcm4chee Arc Light 5.29' },
  { id: 'HL7-INTERFACE-ENGINE-01', name: 'Mirth Connect Hospital Interoperability Integration Broker Alpha', type: 'HL7_ENGINE', criticality: 4, ip: '10.180.30.8', vlan: 'VLAN-315-HL7-INTERCONNECT', os: 'Debian 12 / NextGen Mirth Connect 4.4' },
  { id: 'HL7-INTERFACE-ENGINE-02', name: 'Mirth Connect Hospital Interoperability Integration Broker Beta', type: 'HL7_ENGINE', criticality: 4, ip: '10.180.30.9', vlan: 'VLAN-315-HL7-INTERCONNECT', os: 'Debian 12 / NextGen Mirth Connect 4.4' },
  { id: 'PATIENT-REGISTRY-POSTGRES-01', name: 'National ABHA Patient Master Demographics Database Primary', type: 'HEALTH_DATABASE', criticality: 5, ip: '10.180.25.10', vlan: 'VLAN-320-DB-SECURE', os: 'PostgreSQL 15.4 / RHEL 8.8 Enterprise' },
  { id: 'PATIENT-REGISTRY-POSTGRES-02', name: 'National ABHA Patient Master Demographics Database Warm Standby', type: 'HEALTH_DATABASE', criticality: 5, ip: '10.180.25.11', vlan: 'VLAN-320-DB-SECURE', os: 'PostgreSQL 15.4 / RHEL 8.8 Enterprise' },
  { id: 'TELEHEALTH-WEBRTC-GW-01', name: 'National Teleconsultation Video WebRTC Media Bridge 01', type: 'WEBRTC_GATEWAY', criticality: 4, ip: '10.180.15.5', vlan: 'VLAN-305-MEDIA-STREAM', os: 'Ubuntu 22.04 LTS / Jitsi Videobridge 2.3' },
  { id: 'TELEHEALTH-WEBRTC-GW-02', name: 'National Teleconsultation Video WebRTC Media Bridge 02', type: 'WEBRTC_GATEWAY', criticality: 4, ip: '10.180.15.6', vlan: 'VLAN-305-MEDIA-STREAM', os: 'Ubuntu 22.04 LTS / Jitsi Videobridge 2.3' },
  { id: 'ICU-VENTILATOR-OT-NET-01', name: 'Intensive Care Unit Medical Device IoT Gateway 01', type: 'MEDICAL_IOT_GW', criticality: 5, ip: '10.180.50.2', vlan: 'VLAN-350-ICU-ISOLATED', os: 'Philips IntelliBridge Enterprise Rel B.02' },
  { id: 'ICU-VENTILATOR-OT-NET-02', name: 'Intensive Care Unit Medical Device IoT Gateway 02', type: 'MEDICAL_IOT_GW', criticality: 5, ip: '10.180.50.3', vlan: 'VLAN-350-ICU-ISOLATED', os: 'Mindray BeneView BeneLink Gateway v3.1' },
  { id: 'SMART-INFUSION-IOMT-GW-01', name: 'Smart Infusion Pump Wireless IoMT Management Server', type: 'IOMT_GATEWAY', criticality: 5, ip: '10.180.50.15', vlan: 'VLAN-350-ICU-ISOLATED', os: 'Baxter Spectrum IQ Dose Error Reduction Server v9' },
  { id: 'PHARMACY-PYXIS-DISPENSE-01', name: 'Automated Pharmacy Dispensing & Narcotic Vault Controller', type: 'PHARMACY_VAULT', criticality: 5, ip: '10.180.40.4', vlan: 'VLAN-340-PHARMACY-OT', os: 'BD Pyxis MedStation ES v1.6 Hardened' },
  { id: 'GENOMIC-SEQUENCING-VAULT-01', name: 'High-Throughput Clinical Genomic Sequencing SAN Archive', type: 'GENOMIC_VAULT', criticality: 4, ip: '10.180.60.20', vlan: 'VLAN-360-LAB-GENOMICS', os: 'TrueNAS Enterprise / ZFS Encrypted Storage Pool' },
  { id: 'BLOOD-BANK-COLD-CHAIN-01', name: 'National Blood Bank Cryogenic Cold Chain IoT Monitor', type: 'IOT_COLD_CHAIN', criticality: 4, ip: '10.180.45.8', vlan: 'VLAN-345-COLD-CHAIN-OT', os: 'TempTale Ultra Industrial Firmware v2.8' },
  { id: 'LAB-LIS-ANALYZER-GW-01', name: 'Automated Clinical Chemistry Analyzer ASTM Gateway', type: 'LIS_GATEWAY', criticality: 4, ip: '10.180.60.10', vlan: 'VLAN-360-LAB-GENOMICS', os: 'Roche cobas 8000 Core Lab Middleware v4.2' },
  { id: 'CARDIAC-TELEMETRY-SRV-01', name: 'Continuous Cardiac Holter & Bedside ECG Telemetry Server', type: 'CARDIAC_MONITOR', criticality: 5, ip: '10.180.50.30', vlan: 'VLAN-350-ICU-ISOLATED', os: 'GE Healthcare MUSE Cardiology Information System 9.0' },
  { id: 'SMART-FHIR-AUTH-SERVER-01', name: 'OAuth 2.0 / SMART-on-FHIR Clinical Authorization Server', type: 'AUTH_SERVER', criticality: 5, ip: '10.180.10.20', vlan: 'VLAN-301-PUBLIC-HEALTH-API', os: 'Keycloak 24.0.2 / OpenID Connect Health Profile' },
  { id: 'EMERGENCY-TRIAGE-DISPATCH-01', name: 'National Ambulance Computer-Aided Dispatch & Triage Gateway', type: 'TRIAGE_GATEWAY', criticality: 4, ip: '10.180.12.8', vlan: 'VLAN-302-EMERGENCY-EMS', os: 'Intergraph CAD 9.4 / Windows Server 2022' },
  { id: 'SURGICAL-ROBOT-OR-NET-01', name: 'Operating Room Robotic Surgery Optical Video & Telemetry Bridge', type: 'ROBOTIC_SURGERY_GW', criticality: 5, ip: '10.180.55.5', vlan: 'VLAN-355-OR-ISOLATED', os: 'Intuitive Surgical da Vinci Xi Telemetry Bridge v5.1' },
  { id: 'HOSPITAL-CORE-FIREWALL-01', name: 'Healthcare Edge Perimeter Threat Inspection Gateway', type: 'PERIMETER_FIREWALL', criticality: 5, ip: '10.180.1.1', vlan: 'VLAN-1-CORE-TRANSIT', os: 'Palo Alto PAN-OS 11.1 / Medical IoT App-ID' },
  { id: 'HIE-NATIONAL-INTEROP-01', name: 'Health Information Exchange National Document Sharing (XDS.b) Broker', type: 'HIE_BROKER', criticality: 5, ip: '10.180.10.50', vlan: 'VLAN-301-PUBLIC-HEALTH-API', os: 'OpenHIE Core / Apache Camel 4.1 Enterprise' },
  { id: 'PATHOLOGY-WHOLE-SLIDE-01', name: 'Digital Pathology Whole Slide Imaging Archive', type: 'PATHOLOGY_ARCHIVE', criticality: 4, ip: '10.180.60.40', vlan: 'VLAN-360-LAB-GENOMICS', os: 'Philips IntelliSite Pathology Ultra Fast Scanner Archiver' }
];

// Healthcare Clinical Cyber Defense Analysts
const ANALYSTS = [
  'soc_analyst_das_01',
  'soc_analyst_iyer_02',
  'hl7_eng_roy_02',
  'biomed_shukla_03',
  'fhir_architect_mehta_01',
  'pacs_admin_chatterjee_04',
  'hipaa_privacy_off_verma_01',
  'clinical_ciso_sharma_01'
];

// 26 Authentic Critical Healthcare Cyber Threat Playbooks
const THREAT_CATALOG = [
  // DICOM & Radiology Imaging
  {
    category: 'DICOM: Unauthorized C-MOVE / C-STORE Bulk Mammography & MRI Series Exfiltration',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'DICOM-PACS',
    syslogMsg: (ctx) => `Orthanc DICOM Server: Unauthenticated DIMSE C-MOVE request received from AETITLE ${ctx.aeTitle} querying PatientID range 2026-00000 to 2026-99999. Transferred 4,820 DCM series.`,
    noteGen: (ctx) => `Critical PHI exfiltration attempt detected on PACS archive ${ctx.assetId}. Unauthorized DICOM Application Entity ${ctx.aeTitle} initiated bulk C-MOVE operations targeting high-resolution MRI and mammography studies. DIMSE port 104 restricted via host firewall; affected patient records flagged for supervisory notification.`
  },
  {
    category: 'DICOM PACS: Storage Cluster Ransomware Staging Loop (.dcm File Extension Rename)',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'DICOM-PACS',
    syslogMsg: (ctx) => `dcm4chee Storage Watcher: High-velocity mass file rename event: 5,120 DICOM files renamed to .dcm.lockbit_v3 within 45 seconds on volume /mnt/pacs_data.`,
    noteGen: (ctx) => `Active clinical ransomware staging detected on PACS storage volume. Automated containment triggered: SAN mount set to read-only; compromised workstation isolated from imaging VLAN. ZFS snapshot rollback scheduled; zero patient image data compromised.`
  },
  {
    category: 'DICOM Archive: Unindexed Query Flood Inducing DICOM DIMSE Connection Timeout',
    severity: 'MEDIUM',
    weight: 18,
    assetFilter: 'DICOM-PACS',
    syslogMsg: (ctx) => `Orthanc DIMSE Listener: Connection pool saturation: 64 active C-FIND associations from external teleradiology IP ${randIp('172.16.40')}.`,
    noteGen: (ctx) => `Denial-of-service condition observed on DICOM archive. Third-party teleradiology client spawned uncontrolled concurrent C-FIND study searches without modality filtering. Thread throttling enabled at reverse proxy.`
  },

  // FHIR & EHR Interoperability
  {
    category: 'SMART-on-FHIR: Stolen OAuth Refresh Token Scraped 15,000 Patient FHIR Resources',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'EHR-FHIR-API-GATEWAY',
    syslogMsg: (ctx) => `Kong FHIR Gateway: OAuth2 token tkn_${ctx.hexTkn} exceeded burst velocity: 15,400 GET /fhir/r4/Patient queries across 18 distinct IPs.`,
    noteGen: (ctx) => `Large-scale patient record harvesting incident. Mobile tele-consult third-party OAuth2 refresh token compromised and abused via automated botnet. Token immediately revoked in Keycloak; IP ranges blacklisted; audit log exported for regulatory submission.`
  },
  {
    category: 'SMART-on-FHIR: Token Privilege Escalation from patient/*.read to system/*.write',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'SMART-FHIR-AUTH',
    syslogMsg: (ctx) => `Keycloak Health Profile: Invalid scope request: Client ${ctx.clientId} requested system/*.write without signed clinical authorization assertion.`,
    noteGen: (ctx) => `Authorization bypass and privilege escalation attempt on SMART-on-FHIR clinical server. External application attempted to forge administrative scopes. Authorization grant blocked; client application credentials suspended.`
  },
  {
    category: 'EHR Gateway: GraphQL Deeply Nested Recursive Query Exploitation against Clinical DB',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'EHR-FHIR-API-GATEWAY',
    syslogMsg: (ctx) => `Kong API WAF: Blocked malicious GraphQL query: query depth 14 exceeded policy limit (max depth: 5) targeting Encounter -> Observation -> Condition -> Patient.`,
    noteGen: (ctx) => `Resource exhaustion attack against national EHR database. Recursive nested GraphQL query attempted to traverse clinical graph trees. WAF rule tripped and source IP throttled.`
  },
  {
    category: 'Healthcare API: Rapid Bursts of Invalid Medical Record Number (MRN) Probing',
    severity: 'LOW',
    weight: 22,
    assetFilter: 'EHR-FHIR-API-GATEWAY',
    syslogMsg: (ctx) => `EHR API Guard: 404 Not Found error rate spiked to 94% on /api/v1/patient/mrn/{id} endpoint from IP ${randIp('192.168.10')}.`,
    noteGen: (ctx) => `Automated MRN identifier enumeration detected. Sequential integer queries returned non-existent patient IDs. Adaptive rate limiter engaged; CAPTCHA challenged.`
  },

  // HL7 MLLP Integration Engines
  {
    category: 'HL7 MLLP: ADT^A08 Patient Demographic Modification Injection (Identity Spoofing)',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'HL7-INTERFACE-ENGINE',
    syslogMsg: (ctx) => `Mirth Connect Channel [ADT-Inbound]: Validation error on message MSH|^~\\&|EMR_APP|HOSPITAL_A|MIRTH|REGISTRY: PID segment contains illegal UTF-8 character sequence.`,
    noteGen: (ctx) => `HL7 protocol tampering detected. Inbound ADT^A08 patient update message contained crafted payload in patient name field attempting SQL injection into backend master index. Mirth transformer rejected packet; hospital interface quarantined.`
  },
  {
    category: 'HL7 Interface: Malformed ORU^R01 Lab Observation Result Message with SQL Injection',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'HL7-INTERFACE-ENGINE',
    syslogMsg: (ctx) => `Mirth Channel [LAB-RESULTS]: Inbound MLLP packet rejected: OBX-5 observation payload contained SQL meta-characters: "1'; DROP TABLE lab_specimens;--".`,
    noteGen: (ctx) => `Hospital laboratory interface security incident. Rogue lab result injection intercepted on MLLP port 2575. Payload attempted SQL injection against clinical pathology data store. Interface filter updated.`
  },
  {
    category: 'HL7 Engine: MLLP Protocol Framing Error - Missing <VT> and <FS> Delimiters',
    severity: 'LOW',
    weight: 20,
    assetFilter: 'HL7-INTERFACE-ENGINE',
    syslogMsg: (ctx) => `NextGen Mirth TCP Listener: MLLP frame error: Expected 0x0B Start-Block byte, received raw ASCII text stream from legacy clinic bridge.`,
    noteGen: (ctx) => `Transport framing anomaly. Outdated clinic gateway transmitted unencapsulated HL7 text without standard MLLP envelope. Session reset; clinic systems engineer contacted.`
  },

  // ICU Bedside & IoMT Medical Device Security
  {
    category: 'IoMT: Smart Infusion Pump Wireless Firmware Tamper & Rate-Limit Override Attempt',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'SMART-INFUSION-IOMT',
    syslogMsg: (ctx) => `Baxter Spectrum IQ Server: Firmware signature validation failure on pump UUID ${ctx.pumpUuid}: SHA-256 hash mismatch. Drug library override rejected.`,
    noteGen: (ctx) => `Critical patient safety IoMT cyber incident. Unsigned firmware update push intercepted heading towards bedside infusion pump ${ctx.assetId}. Wireless MAC quarantined; manual physical inspection performed by clinical engineering.`
  },
  {
    category: 'ICU Ventilator Telemetry: Multicast Storm & Medical VLAN Denial of Service (DDoS)',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'ICU-VENTILATOR-OT',
    syslogMsg: (ctx) => `Philips IntelliBridge: Medical VLAN 350 broadcast storm detected: 85,000 UDP packets/sec on port 4001 saturating ICU central station bus.`,
    noteGen: (ctx) => `High-severity medical network incident. Rogue or misconfigured telemetry aggregator broadcast excessive multicast packets across ICU clinical VLAN. Dynamic storm control throttled port; zero interruption to bedside ventilator patient alarms.`
  },
  {
    category: 'Cardiac Telemetry: Rogue Packet Injection on Bedside Arrhythmia Warning Multicast',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'CARDIAC-TELEMETRY',
    syslogMsg: (ctx) => `GE MUSE Cardiology Engine: Cryptographic heartbeat failure: Spoofed ECG waveform packet detected from unwhitelisted source MAC ${ctx.macTail}.`,
    noteGen: (ctx) => `Clinical telemetry integrity breach attempt. Unauthorized Ethernet device attempted to inject forged tachycardia warning packets into nursing station console. 802.1X port security disabled physical wall jack in Ward 4C.`
  },

  // Operating Room & Surgical Robotics
  {
    category: 'Operating Room Robot: OR-Net Latency Spike >80ms During Active Tele-Surgical Feed',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'SURGICAL-ROBOT-OR',
    syslogMsg: (ctx) => `da Vinci Xi Telemetry Bridge: Real-time video latency rose to 112ms (Threshold: 45ms). High packet drop rate on fiber channel B.`,
    noteGen: (ctx) => `Surgical enclave network anomaly. Optical fiber channel buffer overflow caused transient latency spike during tele-robotic surgical session. Quality of Service (QoS) DSCP EF tag re-prioritized on core switches.`
  },

  // Automated Pharmacy & Narcotic Dispensing
  {
    category: 'Pharmacy Dispenser (Pyxis): Schedule II Narcotic Compartment Override Without Rx Order',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'PHARMACY-PYXIS',
    syslogMsg: (ctx) => `BD Pyxis Vault Watcher: Emergency hardware drawer override activated on Compartment 3B (Fentanyl 100mcg) without associated clinician electronic prescription.`,
    noteGen: (ctx) => `Regulatory narcotic diversion security alert. Physical drawer override engaged on Pyxis MedStation without verified physician order in EHR. Security team dispatched to pharmacy floor; video surveillance footage archived.`
  },

  // National Patient Demographics & ABHA Database
  {
    category: 'ABHA Registry: High-Frequency Paginated Scraping via Compromised Aggregator API Key',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'PATIENT-REGISTRY-POSTGRES',
    syslogMsg: (ctx) => `PostgreSQL Enterprise Audit: SELECT queries on table patient_master_demographics exceeded 120,000 rows in 3 minutes by user app_telehealth_sync.`,
    noteGen: (ctx) => `Bulk patient record extraction alert. Third-party tele-consult aggregator API key used to execute high-frequency paginated queries harvesting patient identities. Database user locked; national data privacy officer notified.`
  },
  {
    category: 'EHR Database Slowloris Query Flood Inducing Connection Pool Starvation',
    severity: 'MEDIUM',
    weight: 18,
    assetFilter: 'PATIENT-REGISTRY-POSTGRES',
    syslogMsg: (ctx) => `PostgreSQL Engine: Connection pool saturation warning: active clients 485/500. Average query duration 14.8s.`,
    noteGen: (ctx) => `Database performance degradation. Unindexed diagnostic searches from mobile registration camp flooded connection pool. Max connections elevated temporarily; query optimizer cache refreshed.`
  },

  // Blood Bank & Clinical Cold Chain
  {
    category: 'Blood Bank Cold Chain: Sensor Telemetry Calibration Drift >4.0°C Alert',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'BLOOD-BANK-COLD-CHAIN',
    syslogMsg: (ctx) => `TempTale Industrial IoT: Cryo-Freezer Unit 04 reported temperature spike to -14.2°C (Permissible range: -25.0°C to -18.0°C).`,
    noteGen: (ctx) => `Cold chain integrity incident. Sensor reported temperature rise in plasma preservation unit. Facilities team verified backup compressor engagement; secondary sensor confirmed calibration glitch on primary probe.`
  },

  // Genomic Sequencing & Research Vaults
  {
    category: 'Genomic Archive: Unauthorized S3 Slicing & Unencrypted Export of Whole Genome BAM Files',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'GENOMIC-SEQUENCING',
    syslogMsg: (ctx) => `TrueNAS ZFS Audit: Outbound transfer of 480 GB (sample_wgs_cohort_2026.bam) to external IP ${randIp('198.51.100')} via unencrypted SFTP session.`,
    noteGen: (ctx) => `High-risk sensitive research data leakage attempt. Massive unencrypted genomic sequence files queued for outbound transmission from laboratory enclave. Firewall egress rule blocked session; principal investigator notified.`
  },

  // Pathology Whole Slide Imaging
  {
    category: 'Pathology WSI: Bulk Download of High-Resolution Histopathology Biopsy Tiles',
    severity: 'MEDIUM',
    weight: 15,
    assetFilter: 'PATHOLOGY-WHOLE-SLIDE',
    syslogMsg: (ctx) => `Philips Pathology Archiver: User dr_sharma_extern downloaded 1,400 whole-slide .svs files in 20 minutes from external IP.`,
    noteGen: (ctx) => `Unusual clinical research file transfer. External visiting pathologist account initiated batch download of multi-gigabyte oncology biopsy slides. Multi-factor authentication confirmed legitimate research grant collaboration.`
  },

  // Telehealth Video & Audio Communications
  {
    category: 'WebRTC Telehealth: Unauthenticated Room ID Enumeration & SIP Signaling Interception',
    severity: 'MEDIUM',
    weight: 16,
    assetFilter: 'TELEHEALTH-WEBRTC',
    syslogMsg: (ctx) => `Jitsi Videobridge: 401 Unauthorized spike: 820 room join attempts on /room/{id} with brute-force sequential numeric room tokens.`,
    noteGen: (ctx) => `Telehealth video conference privacy incident. Attacker attempted to enumerate active clinical consultation rooms. Room ID generation upgraded to 128-bit cryptographically secure UUIDs.`
  },

  // Emergency Triage & Computer-Aided Dispatch
  {
    category: 'Ambulance Dispatch: CAD GPS Spoofing & Route Deviation Telemetry Anomaly',
    severity: 'MEDIUM',
    weight: 14,
    assetFilter: 'EMERGENCY-TRIAGE',
    syslogMsg: (ctx) => `Intergraph CAD Dispatcher: Telemetry anomaly: Ambulance ALS-104 reported instantaneous GPS displacement of 42km within 5 seconds.`,
    noteGen: (ctx) => `Emergency response telemetry irregularity. Mobile cellular GPS repeater malfunctioned on ambulance emergency unit. Dispatcher verified unit location via radio voice backup.`
  },

  // Laboratory Information Systems (LIS)
  {
    category: 'Lab Analyzer (LIS): ASTM 1394 Serial-over-IP Buffer Overflow on Reagent Reporting',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'LAB-LIS-ANALYZER',
    syslogMsg: (ctx) => `Roche cobas 8000 Middleware: Crash dump: Segmentation fault in ASTM-1394 packet decoder caused by 2,048-byte null-padded frame.`,
    noteGen: (ctx) => `Laboratory instrument gateway anomaly. Serial-over-IP converter sent malformed buffer payload to clinical LIS broker. Instrument driver restarted in isolated memory sandbox.`
  },

  // Healthcare Perimeter & Cross-Enterprise Document Sharing (XDS.b)
  {
    category: 'Hospital Perimeter: DICOM Protocol Traffic Detected on Non-Standard Port 8443',
    severity: 'MEDIUM',
    weight: 15,
    assetFilter: 'HOSPITAL-CORE-FIREWALL',
    syslogMsg: (ctx) => `Palo Alto PAN-OS: Security rule match: Inbound DICOM DIMSE traffic detected on HTTPS port 8443 destined for internal imaging workstation.`,
    noteGen: (ctx) => `Perimeter protocol evasion detection. External imaging vendor attempted to bypass DICOM port 104 restriction by tunneling traffic through port 8443. Traffic dropped; vendor notified of standard TLS VPN procedure.`
  },
  {
    category: 'Emergency Triage: Outbound HL7 MDM^T02 Medical Document Message to Non-Whitelisted HIE',
    severity: 'MEDIUM',
    weight: 14,
    assetFilter: 'HIE-NATIONAL-INTEROP',
    syslogMsg: (ctx) => `OpenHIE Camel Broker: Egress policy violation: Clinical discharge summary MDM^T02 directed to unverified endpoint https://external-clinic-api.org.`,
    noteGen: (ctx) => `Health Information Exchange compliance alert. Outbound document transfer routed to non-accredited health registry endpoint. Egress halted until digital certificate validation completed.`
  },
  {
    category: 'EHR Audit: Medical Record Access Without Active Doctor-Patient Clinical Encounter',
    severity: 'MEDIUM',
    weight: 18,
    assetFilter: 'EHR-FHIR-API-GATEWAY',
    syslogMsg: (ctx) => `Health Data Audit Logger: VIP patient record MRN-99410 accessed by nurse_singh_ward2 without assigned treatment relationship in admission registry.`,
    noteGen: (ctx) => `HIPAA / DISHA privacy audit violation. Medical staff member accessed high-profile patient electronic health record without active clinical encounter order. Incident escalated to hospital privacy ethics board.`
  }
];

async function generate() {
  const TOTAL_RECORDS = 55000;
  const START_TIME = new Date('2026-06-15T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T23:59:59.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  // 1. Write assets.csv
  const assetsFile = path.join(targetDir, 'assets.csv');
  console.log(`[SAT-SA Health Generator] Writing ${ASSETS.length} assets to ${assetsFile}...`);
  const assetRows = [
    'asset_id,name,type,criticality,environment,ip_address,zone_or_vlan,firmware_os,last_seen'
  ];
  for (const a of ASSETS) {
    assetRows.push([
      a.id,
      a.name,
      a.type,
      a.criticality,
      'PRODUCTION_HEALTHCARE',
      a.ip,
      a.vlan,
      a.os,
      new Date(END_TIME - randInt(60000, 3600000)).toISOString()
    ].map(escapeCsv).join(','));
  }
  fs.writeFileSync(assetsFile, assetRows.join('\r\n') + '\r\n', 'utf-8');

  // 2. Prepare streams for alerts.csv, cases.csv, and syslog_health.log
  const alertsFile = path.join(targetDir, 'alerts.csv');
  const casesFile = path.join(targetDir, 'cases.csv');
  const syslogFile = path.join(targetDir, 'syslog_health.log');

  console.log(`[SAT-SA Health Generator] Writing ${TOTAL_RECORDS.toLocaleString()} alerts to ${alertsFile}...`);
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
      aeTitle: randChoice(['PACS_ARCHIVE_A', 'MAMMO_STUDY_GW', 'CT_SCANNER_02', 'MRI_NEURO_GW']),
      hexTkn: randHex(8),
      clientId: `app_${randHex(6)}`,
      pumpUuid: `PUMP-${randHex(4)}-${randHex(4)}`,
      macTail: `00:1E:C2:${randHex(2)}:${randHex(2)}:${randHex(2)}`
    };

    const noteText = threat.noteGen(ctx);
    const syslogText = threat.syslogMsg(ctx);

    // Realistic Healthcare SLA Behavior (including EG-06 SLA Gaming: 75% bunched right before 60 mins)
    let durationMins;
    if (Math.random() < 0.68) {
      // Bunched between 54m and 59m (SLA gaming pattern)
      durationMins = randInt(54, 59);
    } else if (threat.severity === 'CRITICAL') {
      durationMins = randInt(20, 85);
    } else {
      durationMins = randInt(30, 110);
    }
    const closedDate = new Date(createdDate.getTime() + durationMins * 60000);

    const alertId = `ALT-HLT-${String(i).padStart(6, '0')}`;
    const disposition = threat.severity === 'CRITICAL'
      ? randChoice(['TRUE_POSITIVE', 'RESOLVED', 'CONTAINED_NETWORK_ISOLATION'])
      : randChoice(['RESOLVED', 'TRUE_POSITIVE', 'FALSE_POSITIVE', 'POLICY_EXCEPTION']);
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

    // High & Critical alerts generate hospital cyber incident cases
    if (threat.severity === 'CRITICAL' || (threat.severity === 'HIGH' && Math.random() < 0.60)) {
      casesCount++;
      const caseId = `CAS-HLT-${String(casesCount).padStart(6, '0')}`;
      const openedDate = new Date(createdDate.getTime() + randInt(30, 180) * 1000);
      const escalationLevel = threat.severity === 'CRITICAL'
        ? randChoice(['HEALTH_CISO_OFFICE', 'HOSPITAL_EMERGENCY_CIRT', 'MINISTRY_OF_HEALTH_CERT'])
        : randChoice(['L2_BIOMEDICAL_FORENSICS', 'L1_CLINICAL_SOC']);
      const rootCause = threat.severity === 'CRITICAL'
        ? randChoice(['PARTNER_API_TOKEN_COMPROMISE', 'UNAUTHENTICATED_DIMSE_C_MOVE', 'IOMT_FIRMWARE_INTEGRITY_TAMPER', 'RANSOMWARE_LATERAL_MOVEMENT'])
        : randChoice(['MALFORMED_HL7_MLLP_INJECTION', 'GRAPHQL_QUERY_DEPTH_VIOLATION', 'SENSITIVE_PHI_BULK_DOWNLOAD', 'UNINDEXED_DATABASE_QUERY_FLOOD']);

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
      console.log(`  -> Generated ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} Health records...`);
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
    submissionId: 'SUB-CSE-HEALTH-01-2026-Q3-BENCHMARK',
    entityCode: 'CSE-HEALTH-01',
    entityName: 'National Telehealth & Health Registry Exchange',
    sector: 'Critical Healthcare Infrastructure',
    generatedAt: new Date().toISOString(),
    benchmarkSummary: {
      totalAlerts: TOTAL_RECORDS,
      totalCases: casesCount,
      monitoredNodes: ASSETS.length,
      complianceStandards: ['NCIIPC Critical Sector Cybersecurity Framework v2.1', 'HIPAA Security & Privacy Rule', 'DISHA (Digital Information Security in Healthcare Act)', 'ISO 27799 Health Informatics']
    },
    reportedKpis: {
      headlineSlaCompliancePct: 88.5,
      reportedMttrMinutes: 58.2,
      totalAlertsHandled: TOTAL_RECORDS
    },
    assets: ASSETS,
    sampleTelemetrySlice: [
      {
        alert_id: 'ALT-HLT-000001',
        category: 'DICOM: Unauthorized C-MOVE / C-STORE Bulk Mammography & MRI Series Exfiltration',
        severity: 'CRITICAL',
        asset: 'DICOM-PACS-IMAGING-ARCHIVE-01'
      },
      {
        alert_id: 'ALT-HLT-000002',
        category: 'SMART-on-FHIR: Stolen OAuth Refresh Token Scraped 15,000 Patient FHIR Resources',
        severity: 'CRITICAL',
        asset: 'EHR-FHIR-API-GATEWAY-01'
      }
    ]
  };
  fs.writeFileSync(jsonFile, JSON.stringify(consolidatedPayload, null, 2), 'utf-8');

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const alertsStat = fs.statSync(alertsFile);
  const casesStat = fs.statSync(casesFile);
  const syslogStat = fs.statSync(syslogFile);

  console.log(`\n[SAT-SA Health Generator] Successfully generated Stage 3: HEALTH (CSE-HEALTH-01)!`);
  console.log(`  • Alerts File: ${alertsFile} (${(alertsStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} rows)`);
  console.log(`  • Cases File:  ${casesFile} (${(casesStat.size / (1024 * 1024)).toFixed(2)} MB, ${casesCount.toLocaleString()} rows)`);
  console.log(`  • Syslog File: ${syslogFile} (${(syslogStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} lines)`);
  console.log(`  • Execution Time: ${elapsedSec}s`);
}

generate().catch(err => {
  console.error('[Error] Health generator failed:', err);
  process.exit(1);
});
