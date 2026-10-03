import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, '../../samples/CSE-BANK-01');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('[SAT-SA BFSI Generator] Target Directory:', targetDir);
console.log('[SAT-SA BFSI Generator] Generating 55,000 authentic, highly professional banking records for CSE-BANK-01...');

// Helper random functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randIp(subnet = '172.28') {
  return `${subnet}.${randInt(10, 220)}.${randInt(2, 254)}`;
}

function randHex(len) {
  const chars = '0123456789ABCDEF';
  let res = '';
  for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)];
  return res;
}

function randUuid() {
  return `${randHex(8)}-${randHex(4)}-4${randHex(3)}-a${randHex(3)}-${randHex(12)}`.toLowerCase();
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 1. 24 Authentic Banking Monitored Assets across Core Datacenter and DR Sites
const ASSETS = [
  { id: 'SWIFT-ALLIANCE-GW-01', name: 'SWIFT Alliance Access Primary Gateway', type: 'SWIFT_GATEWAY', criticality: 5, ip: '172.28.10.5', vlan: 'VLAN-801-SWIFT-RESTRICTED', os: 'AIX 7.3 Enterprise Hardened' },
  { id: 'SWIFT-ALLIANCE-GW-02', name: 'SWIFT Alliance Access Secondary DR Gateway', type: 'SWIFT_GATEWAY', criticality: 5, ip: '172.28.10.6', vlan: 'VLAN-801-SWIFT-RESTRICTED', os: 'AIX 7.3 Enterprise Hardened' },
  { id: 'CBS-CORE-ORACLE-DB-01', name: 'Finacle Core Banking Production DB Node 1', type: 'DATABASE_CLUSTER', criticality: 5, ip: '172.28.20.10', vlan: 'VLAN-810-DB-SECURE', os: 'Oracle Linux 8.8 / Oracle RAC 19c' },
  { id: 'CBS-CORE-ORACLE-DB-02', name: 'Finacle Core Banking Production DB Node 2', type: 'DATABASE_CLUSTER', criticality: 5, ip: '172.28.20.11', vlan: 'VLAN-810-DB-SECURE', os: 'Oracle Linux 8.8 / Oracle RAC 19c' },
  { id: 'ATM-SWITCH-BASE24-01', name: 'BASE24 ATM/POS Authorization Engine Primary', type: 'ATM_SWITCH', criticality: 5, ip: '172.28.30.21', vlan: 'VLAN-820-SWITCH-AUTH', os: 'HP NonStop OS H06.29' },
  { id: 'ATM-SWITCH-BASE24-02', name: 'BASE24 ATM/POS Authorization Engine DR', type: 'ATM_SWITCH', criticality: 5, ip: '172.28.30.22', vlan: 'VLAN-820-SWITCH-AUTH', os: 'HP NonStop OS H06.29' },
  { id: 'HSM-PAYMENT-THALES-01', name: 'Thales payShield 10K Hardware Security Module 01', type: 'PAYMENT_HSM', criticality: 5, ip: '172.28.30.50', vlan: 'VLAN-825-CRYPTO-HSM', os: 'Thales payShield v1.5a (FIPS 140-2 Level 3)' },
  { id: 'HSM-PAYMENT-THALES-02', name: 'Thales payShield 10K Hardware Security Module 02', type: 'PAYMENT_HSM', criticality: 5, ip: '172.28.30.51', vlan: 'VLAN-825-CRYPTO-HSM', os: 'Thales payShield v1.5a (FIPS 140-2 Level 3)' },
  { id: 'NEFT-RTGS-SETTLE-01', name: 'Central Bank SFMS/RTGS Direct Clearing Node Primary', type: 'SETTLEMENT_NODE', criticality: 5, ip: '172.28.15.12', vlan: 'VLAN-805-SFMS-CLEARING', os: 'Red Hat Enterprise Linux 8.6 Hardened' },
  { id: 'NEFT-RTGS-SETTLE-02', name: 'Central Bank SFMS/RTGS Direct Clearing Node DR', type: 'SETTLEMENT_NODE', criticality: 5, ip: '172.28.15.13', vlan: 'VLAN-805-SFMS-CLEARING', os: 'Red Hat Enterprise Linux 8.6 Hardened' },
  { id: 'AD-DC-FOREST-ROOT-01', name: 'Enterprise Active Directory Tier-0 Root Domain Controller', type: 'IDENTITY_DC', criticality: 5, ip: '172.28.1.10', vlan: 'VLAN-800-TIER0-MGMT', os: 'Windows Server 2022 Datacenter' },
  { id: 'AD-DC-FOREST-ROOT-02', name: 'Enterprise Active Directory Tier-0 Backup Domain Controller', type: 'IDENTITY_DC', criticality: 5, ip: '172.28.1.11', vlan: 'VLAN-800-TIER0-MGMT', os: 'Windows Server 2022 Datacenter' },
  { id: 'WAF-NETBANKING-EDGE-01', name: 'F5 Advanced WAF Internet Banking Ingress Node 1', type: 'EDGE_WAF', criticality: 4, ip: '172.28.5.1', vlan: 'VLAN-802-PUBLIC-WAF', os: 'BIG-IP TMOS 17.1.0' },
  { id: 'WAF-NETBANKING-EDGE-02', name: 'F5 Advanced WAF Internet Banking Ingress Node 2', type: 'EDGE_WAF', criticality: 4, ip: '172.28.5.2', vlan: 'VLAN-802-PUBLIC-WAF', os: 'BIG-IP TMOS 17.1.0' },
  { id: 'UPI-IMPS-SWITCH-01', name: 'NPCI UPI / IMPS Payment Switch Engine Primary', type: 'PAYMENT_SWITCH', criticality: 5, ip: '172.28.40.15', vlan: 'VLAN-830-NPCI-SWITCH', os: 'Debian GNU/Linux 12 Hardened' },
  { id: 'UPI-IMPS-SWITCH-02', name: 'NPCI UPI / IMPS Payment Switch Engine Secondary', type: 'PAYMENT_SWITCH', criticality: 5, ip: '172.28.40.16', vlan: 'VLAN-830-NPCI-SWITCH', os: 'Debian GNU/Linux 12 Hardened' },
  { id: 'TREASURY-FX-DEAL-01', name: 'Murex Treasury Front-to-Back Dealing Terminal 01', type: 'TREASURY_SYSTEM', criticality: 5, ip: '172.28.60.20', vlan: 'VLAN-840-TREASURY-RESTRICTED', os: 'Red Hat Enterprise Linux 8.8' },
  { id: 'TREASURY-FX-DEAL-02', name: 'Murex Treasury Front-to-Back Dealing Terminal 02', type: 'TREASURY_SYSTEM', criticality: 5, ip: '172.28.60.21', vlan: 'VLAN-840-TREASURY-RESTRICTED', os: 'Red Hat Enterprise Linux 8.8' },
  { id: 'AML-OFAC-SCREEN-01', name: 'Fircosoft Real-Time Sanctions & PEP Screening Node', type: 'AML_SCREENING', criticality: 4, ip: '172.28.70.30', vlan: 'VLAN-850-COMPLIANCE-AML', os: 'SUSE Linux Enterprise Server 15' },
  { id: 'AML-OFAC-SCREEN-02', name: 'Fircosoft Batch Compliance Screening Node', type: 'AML_SCREENING', criticality: 4, ip: '172.28.70.31', vlan: 'VLAN-850-COMPLIANCE-AML', os: 'SUSE Linux Enterprise Server 15' },
  { id: 'API-GW-OPENBANK-01', name: 'Apigee Open Banking Account Aggregator Ingress Node 1', type: 'API_GATEWAY', criticality: 4, ip: '172.28.80.10', vlan: 'VLAN-860-OPEN-BANKING', os: 'Apigee Edge Hybrid Gateway 1.10' },
  { id: 'API-GW-OPENBANK-02', name: 'Apigee Open Banking Account Aggregator Ingress Node 2', type: 'API_GATEWAY', criticality: 4, ip: '172.28.80.11', vlan: 'VLAN-860-OPEN-BANKING', os: 'Apigee Edge Hybrid Gateway 1.10' },
  { id: 'VAULT-KEYCLOAK-IAM-01', name: 'HashiCorp Vault Privileged Credential Manager Primary', type: 'KEY_VAULT', criticality: 5, ip: '172.28.90.15', vlan: 'VLAN-870-PAM-VAULT', os: 'Vault Enterprise 1.15.2' },
  { id: 'VAULT-KEYCLOAK-IAM-02', name: 'HashiCorp Vault Privileged Credential Manager Standby', type: 'KEY_VAULT', criticality: 5, ip: '172.28.90.16', vlan: 'VLAN-870-PAM-VAULT', os: 'Vault Enterprise 1.15.2' }
];

// 2. 26 Authentic BFSI Threat Categories & Playbooks
const THREAT_CATALOG = [
  // SWIFT & Payment Messaging
  {
    category: 'SWIFT CSP: Outbound MT103 FIN Cryptographic Signature Hash Mismatch',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'SWIFT-ALLIANCE-GW',
    syslogMsg: (ctx) => `SWIFT Alliance Access daemon: Message digest SHA256 mismatch on outbound queue queue://SWIFT_PAY_LIVE. UETR=${ctx.uetr}. Message revoked before gateway transmission.`,
    noteGen: (ctx) => `High-severity SWIFT CSP compliance event. Outbound MT103 telegraphic transfer for amount ${ctx.amountFormatted} failed HMAC-SHA256 signature verification. Dual-authorization verified for operator ${ctx.analyst}. Outbound message halted in staging queue. Process memory of Alliance Access SAA daemon dumped and archived for forensic audit.`
  },
  {
    category: 'ISO 20022: pacs.008 Credit Transfer XML Schema Tampering / Amount Injection',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'SWIFT-ALLIANCE-GW',
    syslogMsg: (ctx) => `ISO20022 Parser Error: Invalid XML namespace schema or altered <IntrBkSttlmAmt> node detected in pacs.008 message. Ref=${ctx.txnRef}.`,
    noteGen: (ctx) => `Automated XML schema validator flagged anomalous pacs.008 interbank credit transfer payload. Originating settlement account ${ctx.acct} attempted to inject modified settlement currency amounts. Transaction rejected at schema validation layer; originating terminal IP ${ctx.srcIp} isolated.`
  },
  {
    category: 'SWIFT Alliance: Unauthorized Process Injection in SAA Daemon Memory',
    severity: 'CRITICAL',
    weight: 8,
    assetFilter: 'SWIFT-ALLIANCE-GW',
    syslogMsg: (ctx) => `EDR Kernel Sensor: Untrusted memory write (NtWriteVirtualMemory) targeting process saa_daemon.exe from untrusted binary C:\\Temp\\${ctx.dllName}.`,
    noteGen: (ctx) => `Critical process integrity breach detected by CrowdStrike kernel sensor on SWIFT gateway. Target process saa_daemon.exe had an external thread injection attempted. Process terminated, memory core dump acquired, and host severed from SWIFT VLAN per RBI CSITE playbooks.`
  },

  // ATM Switch & ISO-8583
  {
    category: 'ATM Switch ISO-8583: Field 48 Private Data Binary Shellcode / Replay Attack',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'ATM-SWITCH-BASE24',
    syslogMsg: (ctx) => `BASE24 Engine: Malformed ISO-8583 0200 request received from Terminal ${ctx.atmId}. Field 48 contains non-ASCII opcode shellcode pattern.`,
    noteGen: (ctx) => `ATM switch protocol interceptor caught malicious Field 48 payload from terminal ${ctx.atmId}. Binary pattern matched known FASTPOS buffer overflow exploitation signature. Terminal remote communication immediately killed; regional physical vigilance team dispatched.`
  },
  {
    category: 'ATM Network: Cash-Out Dispense Trigger via Malformed ISO-8583 0200 Echo Injection',
    severity: 'HIGH',
    weight: 16,
    assetFilter: 'ATM-SWITCH-BASE24',
    syslogMsg: (ctx) => `BASE24 Switch: Abnormal burst of 0200 cash withdrawal authorization requests without corresponding 0100 verification sequence. Terminal=${ctx.atmId}.`,
    noteGen: (ctx) => `Jackpotting / Cash-out attempt detected. 18 consecutive dispense authorization requests received in 45 seconds from ATM terminal ${ctx.atmId}. PIN-block verification failed. Switch blacklisted terminal session keys and blocked currency cassette motors.`
  },

  // Core Banking Database & Application Layer
  {
    category: 'Core Banking: Direct SQL*Plus Schema Modification on FIN_BALANCE_MASTER Table',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'CBS-CORE-ORACLE-DB',
    syslogMsg: (ctx) => `Oracle Audit Vault: Direct DDL/DML update on FIN_BALANCE_MASTER from non-whitelisted SQL*Plus client IP ${ctx.srcIp} by user dba_temp.`,
    noteGen: (ctx) => `Critical database bypass alert. Direct SQL*Plus connection initiated from staging jump host to production RAC cluster. Attempted manual balance reconciliation on ledger account ${ctx.acct}. Oracle Database Vault blocked query execution; privileged DBA credentials revoked immediately.`
  },
  {
    category: 'Finacle CBS: Dormant Account Reactivation with Immediate High-Value IMPS Outflow',
    severity: 'HIGH',
    weight: 18,
    assetFilter: 'CBS-CORE-ORACLE-DB',
    syslogMsg: (ctx) => `Finacle Core Alert: Dormant customer account ${ctx.acct} reactivated after 730 days of inactivity. Immediate beneficiary addition requested.`,
    noteGen: (ctx) => `Fraud risk analytics engine flagged sudden reactivation of dormant high-net-worth account ${ctx.acct}. Within 4 minutes of reactivation, maximum-limit IMPS transfer of ₹4,99,999 was scheduled. Account placed on debit freeze pending physical branch KYC re-verification.`
  },
  {
    category: 'Database Vault: Sensitive Column Decryption Burst on Customer PII & PAN Fields',
    severity: 'MEDIUM',
    weight: 20,
    assetFilter: 'CBS-CORE-ORACLE-DB',
    syslogMsg: (ctx) => `Oracle TDE Key Vault: High-frequency bulk decryption requests on credit card PAN column exceeding baseline threshold (5,000 req/min).`,
    noteGen: (ctx) => `Data loss prevention monitor tripped on batch query decryption of cardholder Primary Account Numbers (PAN). Correlated with scheduled nightly reporting job; authenticated by authorized service principal. Verified benign and logged for monthly audit.`
  },

  // Hardware Security Module (HSM) Cryptography
  {
    category: 'HSM Cryptographic Key: PIN Verification Key (PVK) Extraction Attempt via Desync',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'HSM-PAYMENT-THALES',
    syslogMsg: (ctx) => `Thales payShield: Cryptographic API command 'EE' (Export Encrypted Key) invoked with invalid LMK authorization token from IP ${ctx.srcIp}.`,
    noteGen: (ctx) => `Hardware Security Module logged an unauthorized key management command. Client application attempted to invoke PIN Verification Key (PVK) export under invalid Local Master Key (LMK) variant. Cryptographic engine rejected command and alerted key custodians.`
  },
  {
    category: 'HSM Cluster: Chassis Cover Vibration Sensor Alert (Potential Physical Tamper)',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'HSM-PAYMENT-THALES',
    syslogMsg: (ctx) => `HSM Hardware Watchdog: Enclosure vibration sensor threshold exceeded on chassis bay 3 (Sensor: ACCEL_Z).`,
    noteGen: (ctx) => `Physical enclosure tamper alert triggered on production Thales payShield HSM. Dual key custodians escorted to datacenter high-security cage. Inspection revealed heavy vibration from adjacent HVAC compressor replacement. Physical seals verified intact; no zeroization occurred.`
  },

  // Central Clearing & RTGS / NEFT / SFMS
  {
    category: 'SFMS/RTGS: High-Value Clearing Surge Exceeding Daily Credit Exposure Cap',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: 'NEFT-RTGS-SETTLE',
    syslogMsg: (ctx) => `RTGS Gateway: Outbound gross settlement queue exceeded bilateral intraday liquidity limit by ₹${ctx.amountCrores} Crores. Node=${ctx.assetId}.`,
    noteGen: (ctx) => `Automated settlement safety interlock triggered on SFMS clearing node. A batch of 14 corporate wires exceeded the intraday liquidity cap. Transaction held in pending queue until treasury department pledged additional collateral with the Reserve Bank of India.`
  },
  {
    category: 'SFMS Gateway: Public Key Infrastructure (PKI) Certificate Expiry Warning within 48h',
    severity: 'LOW',
    weight: 15,
    assetFilter: 'NEFT-RTGS-SETTLE',
    syslogMsg: (ctx) => `SFMS PKI Monitor: X.509 signing certificate for SFMS Node ${ctx.assetId} will expire in 42 hours (Serial: 0x${ctx.certSerial}).`,
    noteGen: (ctx) => `Routine PKI lifecycle notification. Digital signature certificate scheduled for automatic rollover using central token authority. Ticket assigned to PKI administration team for scheduled change window.`
  },

  // Identity & Active Directory Tier-0
  {
    category: 'Active Directory Tier-0: Kerberoasting Attack on Core Banking Service Account',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'AD-DC-FOREST-ROOT',
    syslogMsg: (ctx) => `Security Event 4769: A Kerberos service ticket was requested with Ticket Encryption Type 0x17 (RC4-HMAC) for service account svc_finacle_cbs from workstation ${ctx.workstation}.`,
    noteGen: (ctx) => `Active Directory event log monitoring detected anomalous TGS ticket requests requesting weak RC4 cipher for privileged service principal svc_finacle_cbs. Source workstation ${ctx.workstation} immediately isolated via 802.1x dynamic VLAN quarantine. Service account password reset to 32-character random string.`
  },
  {
    category: 'Active Directory Tier-0: DCSync Replication Request from Non-Domain Controller IP',
    severity: 'CRITICAL',
    weight: 8,
    assetFilter: 'AD-DC-FOREST-ROOT',
    syslogMsg: (ctx) => `Directory Service Event 4662: DS-Replication-Get-Changes-All invoked by user ${ctx.analyst} from unauthorized endpoint ${ctx.srcIp}.`,
    noteGen: (ctx) => `High-confidence DCSync credential harvesting attempt detected. Client IP ${ctx.srcIp} requested directory replication rights without possessing Domain Controller machine credentials. User account locked out, IP blocked at internal microsegmentation gateway, and full CIRT escalation executed.`
  },

  // Edge WAF & Internet Banking
  {
    category: 'NetBanking WAF: Distributed Credential Stuffing Campaign on Retail Login Endpoint',
    severity: 'HIGH',
    weight: 22,
    assetFilter: 'WAF-NETBANKING-EDGE',
    syslogMsg: (ctx) => `BIG-IP ASM: Credential stuffing signature matched on URI /netbanking/auth/login. Originating from 1,420 distinct residential proxy IPs.`,
    noteGen: (ctx) => `F5 Advanced WAF detected distributed botnet conducting credential stuffing attacks against consumer online banking portal. Behavioral analysis identified automated Puppeteer headless browser signatures. Cloudflare bot mitigation enforced CAPTCHA challenge; zero successful logins achieved.`
  },
  {
    category: 'Corporate Banking Portal: Concurrent Session Hijack from Foreign Geolocation ASN',
    severity: 'MEDIUM',
    weight: 18,
    assetFilter: 'WAF-NETBANKING-EDGE',
    syslogMsg: (ctx) => `IAM Web Gateway: Concurrent active session detected for Corporate User corp_${ctx.analyst}. Simultaneous requests from AS45820 (India) and AS16509 (US).`,
    noteGen: (ctx) => `Impossible travel heuristic alert. Corporate treasury user corporate token accessed simultaneously from Mumbai and Virginia cloud IP addresses within 3 minutes. Active session invalidated, OTP challenge re-issued, and user contacted to verify credentials.`
  },

  // UPI & Retail Payment Switches
  {
    category: 'UPI Switch: Transaction Volume Spike Correlated with NPCI Error Code U16 / U30',
    severity: 'MEDIUM',
    weight: 20,
    assetFilter: 'UPI-IMPS-SWITCH',
    syslogMsg: (ctx) => `UPI Core Daemon: Inward transaction decline rate exceeded 12.5% for VPA handles ending in @apexbank. Error code U30 (Risk Threshold Exceeded).`,
    noteGen: (ctx) => `UPI switch telemetry observed elevated decline rates on merchant settlement endpoints. Root cause traced to third-party payment aggregator rate-limiting rules. Aggregator contacted and connection pool expanded; transaction success rate restored to 99.4%.`
  },
  {
    category: 'Credit Card Processor: Luhn Algorithm Anomaly / Card-Not-Present BIN Attack Velocity',
    severity: 'MEDIUM',
    weight: 16,
    assetFilter: 'UPI-IMPS-SWITCH',
    syslogMsg: (ctx) => `Card Fraud Engine: Sequential card enumeration velocity pattern detected on BIN 411122 targeting e-commerce merchant gateway.`,
    noteGen: (ctx) => `BIN attack detection rule triggered. Over 350 transactions with sequential card numbers attempted on international payment gateway. Gateway velocity rule activated, blocking originating IP block and declining authorization requests.`
  },

  // Treasury, FX & Trading
  {
    category: 'Treasury & FX: Off-Market Exchange Rate Dealing Anomaly in Nostro Reconciliation',
    severity: 'HIGH',
    weight: 10,
    assetFilter: 'TREASURY-FX-DEAL',
    syslogMsg: (ctx) => `Murex Surveillance: USD/INR deal entered at 81.20 against Reuters composite market benchmark of 83.95. Deal ID=${ctx.dealId}.`,
    noteGen: (ctx) => `Treasury surveillance algorithm flagged off-market foreign exchange trade ticket ${ctx.dealId} executed on corporate dealing desk. Trade price diverged by 3.2% from real-time Reuters interbank mid-rate. Trade halted in pre-settlement status pending compliance review.`
  },

  // AML, CFT & Sanctions Screening
  {
    category: 'AML/CFT: Rapid Smurfing Velocity Burst below 50K Regulatory Reporting Threshold',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'AML-OFAC-SCREEN',
    syslogMsg: (ctx) => `Actimize AML Engine: Structuring / Smurfing pattern detected: 12 cash deposits of ₹49,500 deposited into beneficiary account ${ctx.acct} within 2 hours across multiple branches.`,
    noteGen: (ctx) => `Anti-Money Laundering engine generated structuring alert for account ${ctx.acct}. Account received 12 consecutive cash deposits just beneath the mandatory PAN verification threshold of ₹50,000. Form STR (Suspicious Transaction Report) dossier drafted for submission to the Financial Intelligence Unit (FIU-IND).`
  },
  {
    category: 'OFAC/Sanctions: Fircosoft Watchlist Screening Bypass via Unicode String Homoglyph',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'AML-OFAC-SCREEN',
    syslogMsg: (ctx) => `Fircosoft Engine: Unicode homoglyph character detected in SWIFT Field 50K (Ordering Customer) name string. Ref=${ctx.uetr}.`,
    noteGen: (ctx) => `Sanctions screening filter identified Cyrillic homoglyph substitution designed to evade exact-match string matching for designated entity. Fuzzy matching algorithm correctly identified alias; funds frozen in escrow pending legal counsel review.`
  },

  // Open Banking API & Privileged Access
  {
    category: 'Open Banking API: mTLS Client Certificate Spoofing on Retail Account Aggregator',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'API-GW-OPENBANK',
    syslogMsg: (ctx) => `Apigee Gateway: Mutual TLS handshake rejected. Client certificate CN=ThirdPartyFintech signed by untrusted intermediate CA (Thumbprint: ${ctx.thumbprint}).`,
    noteGen: (ctx) => `API gateway security policy enforced strict mTLS certificate pinning for open banking account aggregators. Incoming TLS connection presented valid certificate structure but failed RBI-approved root authority trust validation. Connection severed.`
  },
  {
    category: 'Privileged Access: HashiCorp Vault Root Token Generation Outside Maintenance Window',
    severity: 'HIGH',
    weight: 8,
    assetFilter: 'VAULT-KEYCLOAK-IAM',
    syslogMsg: (ctx) => `Vault Audit Log: Root token generation quorum initiated by operator ${ctx.analyst} outside approved CR-WINDOW-2026.`,
    noteGen: (ctx) => `High-privilege security alert. Emergency master root token regeneration sequence initiated on HashiCorp Vault cluster at an unapproved hour. Dual-custody unseal keys were entered without an active Change Request ticket. Token revoked and security operations manager alerted.`
  },
  {
    category: 'ATM Surveillance: Optical Cam Sensor Occlusion on Cash Dispenser Shutter Slot',
    severity: 'LOW',
    weight: 12,
    assetFilter: 'ATM-SWITCH-BASE24',
    syslogMsg: (ctx) => `ATM IoT Sensor: Camera occlusion detected for >180 seconds on terminal ${ctx.atmId} fascia (Camera ID: CAM_FASCIA_01).`,
    noteGen: (ctx) => `Physical skimming detection alert. ATM terminal ${ctx.atmId} fascia camera reported complete optical occlusion. Regional field engineer dispatched to inspect card reader for overlay skimmers.`
  }
];

// Analyst identities
const ANALYSTS = [
  'cirt_sen_01', 'cirt_sen_02', 'switch_mukherjee_02', 'dba_bose_03',
  'secops_rao_04', 'fraud_patel_05', 'aml_sharma_06', 'soc_verma_07',
  'net_nair_08', 'pki_deshmukh_09', 'crypto_iyer_10'
];

async function generate() {
  const TOTAL_RECORDS = 55000;
  const START_TIME = new Date('2026-09-02T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T00:00:00.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  // 1. Generate assets.csv
  const assetsFile = path.join(targetDir, 'assets.csv');
  console.log(`[SAT-SA BFSI Generator] Writing ${ASSETS.length} assets to ${assetsFile}...`);
  const assetRows = [
    'asset_id,name,type,criticality,environment,ip_address,zone_or_vlan,firmware_os,last_seen'
  ];
  for (const a of ASSETS) {
    assetRows.push([
      a.id,
      a.name,
      a.type,
      a.criticality,
      'PRODUCTION_BANKING',
      a.ip,
      a.vlan,
      a.os,
      new Date(END_TIME - randInt(60000, 3600000)).toISOString()
    ].map(escapeCsv).join(','));
  }
  fs.writeFileSync(assetsFile, assetRows.join('\r\n') + '\r\n', 'utf-8');

  // 2. Prepare streams for alerts.csv, cases.csv, and syslog_bfsi.log
  const alertsFile = path.join(targetDir, 'alerts.csv');
  const casesFile = path.join(targetDir, 'cases.csv');
  const syslogFile = path.join(targetDir, 'syslog_bfsi.log');

  console.log(`[SAT-SA BFSI Generator] Writing ${TOTAL_RECORDS.toLocaleString()} alerts to ${alertsFile}...`);
  const alertsStream = fs.createWriteStream(alertsFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  const casesStream = fs.createWriteStream(casesFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  const syslogStream = fs.createWriteStream(syslogFile, { flags: 'w', highWaterMark: 1024 * 1024 });

  // CSV Headers
  alertsStream.write('alert_id,category,severity,created_at,closed_at,disposition,assignee,asset_id,investigation_notes\r\n');
  casesStream.write('case_id,alert_id,severity,status,opened_at,closed_at,assignee,escalation_level,root_cause,investigation_notes\r\n');

  // Cumulative threat selector
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

    // Matching asset
    let assetCandidates = ASSETS.filter(a => a.id.startsWith(threat.assetFilter));
    if (assetCandidates.length === 0) assetCandidates = ASSETS;
    const asset = randChoice(assetCandidates);

    const ctx = {
      assetId: asset.id,
      analyst: randChoice(ANALYSTS),
      srcIp: randIp(),
      uetr: randUuid(),
      txnRef: `REF-${randInt(100000, 999999)}`,
      amountFormatted: `₹${(Math.random() * 5000000 + 50000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      amountCrores: (Math.random() * 85 + 15).toFixed(2),
      acct: `AC-9018${randInt(100000, 999999)}`,
      atmId: `ATM-NCR-${randInt(1000, 9999)}`,
      workstation: `WS-FIN-${randInt(100, 899)}`,
      dealId: `DL-${randInt(10000, 99999)}`,
      certSerial: randHex(8),
      thumbprint: randHex(12),
      dllName: `sys_ext_${randHex(4)}.dll`
    };

    const noteText = threat.noteGen(ctx);
    const syslogText = threat.syslogMsg(ctx);

    // Duration & ClosedAt
    let durationMins;
    if (threat.severity === 'CRITICAL') {
      durationMins = randInt(20, 110);
    } else if (threat.severity === 'HIGH') {
      durationMins = randInt(30, 150);
    } else {
      durationMins = randInt(15, 60);
    }
    const closedDate = new Date(createdDate.getTime() + durationMins * 60000);

    const alertId = `ALT-BNK-${String(i).padStart(6, '0')}`;
    const disposition = threat.severity === 'CRITICAL'
      ? randChoice(['TRUE_POSITIVE', 'RESOLVED', 'ESCALATED_L2_CIRT'])
      : randChoice(['RESOLVED', 'TRUE_POSITIVE', 'FALSE_POSITIVE', 'AUTO_BLOCKED_FIREWALL']);
    const assignee = randChoice(ANALYSTS);

    // Write alert row
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

    // Write Syslog row
    const syslogLine = `${createdDate.toISOString()} [${threat.severity}] ${asset.id}: ${syslogText}\r\n`;
    const okSyslog = syslogStream.write(syslogLine);
    if (!okSyslog) {
      await new Promise(res => syslogStream.once('drain', res));
    }

    // High & Critical alerts generate linked formal forensic cases (approx 45% of total volume)
    if (threat.severity === 'CRITICAL' || (threat.severity === 'HIGH' && Math.random() < 0.6)) {
      casesCount++;
      const caseId = `CAS-BNK-${String(casesCount).padStart(6, '0')}`;
      const openedDate = new Date(createdDate.getTime() + randInt(30, 180) * 1000);
      const escalationLevel = threat.severity === 'CRITICAL'
        ? randChoice(['L3_EXECUTIVE_CIRT', 'REGULATORY_RBI_CSITE_FILING'])
        : randChoice(['L2_INCIDENT_FORENSICS', 'L1_TRIAGE']);
      const rootCause = threat.severity === 'CRITICAL'
        ? randChoice(['MALICIOUS_DLL_INJECTION_ATTEMPT', 'UNAUTHORIZED_SWIFT_MODIFICATION', 'ATM_FIELD48_SHELLCODE_PATTERN', 'ACTIVE_DIRECTORY_KERBEROASTING'])
        : randChoice(['PHISHED_EMPLOYEE_WORKSTATION', 'BOTNET_CREDENTIAL_STUFFING', 'UNAPPROVED_SCHEMA_ACCESS', 'PHYSICAL_TAMPER_FALSE_ALARM']);

      const caseNotes = `Formal CSITE Incident Case for ${threat.category}. Root cause identified as ${rootCause}. Full telemetry captured on node ${asset.id} with Section 65B forensic hash compliance.`;

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
      console.log(`  -> Generated ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} BFSI records...`);
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
    submissionId: 'SUB-CSE-BANK-01-2026-Q3-BENCHMARK',
    entityCode: 'CSE-BANK-01',
    entityName: 'Apex National Commercial & Settlement Bank',
    sector: 'Banking, Financial Services & Insurance',
    generatedAt: new Date().toISOString(),
    benchmarkSummary: {
      totalAlerts: TOTAL_RECORDS,
      totalCases: casesCount,
      monitoredNodes: ASSETS.length,
      complianceStandards: ['RBI Cyber Security Framework', 'SWIFT CSP v2026', 'PCI-DSS v4.0', 'ISO 20022']
    },
    assets: ASSETS,
    sampleTelemetrySlice: [
      {
        alert_id: 'ALT-BNK-000001',
        category: 'SWIFT CSP: Outbound MT103 FIN Cryptographic Signature Hash Mismatch',
        severity: 'CRITICAL',
        asset: 'SWIFT-ALLIANCE-GW-01'
      },
      {
        alert_id: 'ALT-BNK-000002',
        category: 'ATM Switch ISO-8583: Field 48 Private Data Binary Shellcode / Replay Attack',
        severity: 'CRITICAL',
        asset: 'ATM-SWITCH-BASE24-01'
      }
    ]
  };
  fs.writeFileSync(jsonFile, JSON.stringify(consolidatedPayload, null, 2), 'utf-8');

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const alertsStat = fs.statSync(alertsFile);
  const casesStat = fs.statSync(casesFile);
  const syslogStat = fs.statSync(syslogFile);

  console.log(`\n[SAT-SA BFSI Generator] Successfully generated Stage 1: BANK (CSE-BANK-01)!`);
  console.log(`  • Alerts File: ${alertsFile} (${(alertsStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} rows)`);
  console.log(`  • Cases File:  ${casesFile} (${(casesStat.size / (1024 * 1024)).toFixed(2)} MB, ${casesCount.toLocaleString()} rows)`);
  console.log(`  • Syslog File: ${syslogFile} (${(syslogStat.size / (1024 * 1024)).toFixed(2)} MB, ${TOTAL_RECORDS.toLocaleString()} lines)`);
  console.log(`  • Execution Time: ${elapsedSec}s`);
}

generate().catch(err => {
  console.error('[Error] BFSI generator failed:', err);
  process.exit(1);
});
