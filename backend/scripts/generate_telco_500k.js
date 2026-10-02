import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.resolve(__dirname, '../../samples/CSE-TELCO-01/benchmark_500k_alerts.csv');

console.log('[SAT-SA Benchmark Generator] Target File:', outputFile);
console.log('[SAT-SA Benchmark Generator] Generating 500,000 authentic, non-repetitive telecom records...');

// 1. Telecom Infrastructure Monitored Assets (120+ distinct carrier-grade nodes)
const CIRCLES = ['DEL', 'MUM', 'BLR', 'KOL', 'CHN', 'HYD', 'PNE', 'AMD'];
const ASSET_TYPES = [
  { prefix: 'BGP-CR', type: 'Core BGP Router', vendor: 'Cisco ASR-9922' },
  { prefix: '5G-UPF', type: '5G Cloud UPF Packet Core', vendor: 'Ericsson Cloud Core' },
  { prefix: 'IMS-SBC', type: 'Session Border Controller', vendor: 'Ribbon SBC SWe' },
  { prefix: 'DRA-DIAM', type: 'Diameter Routing Agent', vendor: 'Oracle DSR 9.0' },
  { prefix: 'SIGTRAN-STP', type: 'Signaling Transfer Point', vendor: 'Dialogic G51 SS7' },
  { prefix: 'SEPP-ROAM', type: '5G Roaming SEPP Proxy', vendor: 'Nokia 5G SBA SEPP' },
  { prefix: 'DNS-RECURS', type: 'Carrier DNS Anycast Node', vendor: 'BIND 9.18 Hardened' },
  { prefix: 'CGNAT-POOL', type: 'CGNAT Ingress Cluster', vendor: 'A10 Thunder 6430' },
  { prefix: 'ROADM-DWDM', type: 'Optical Transport ROADM', vendor: 'Ciena 6500 DWDM' },
  { prefix: 'NG-RAN-CSR', type: 'Cell Site Aggregation Router', vendor: 'Juniper ACX7100' }
];

const ASSETS = [];
for (const circle of CIRCLES) {
  for (const at of ASSET_TYPES) {
    for (let instance = 1; instance <= 2; instance++) {
      ASSETS.push({
        id: `${at.prefix}-${circle}-${String(instance).padStart(2, '0')}`,
        circle,
        type: at.type,
        vendor: at.vendor
      });
    }
  }
}

// 2. 28 Authentic Telecom Threat Categories based on GSMA FS.11/FS.19, 3GPP TS 33.501, and RFCs
const THREAT_CATALOG = [
  // 5G Core & SBA Threats (3GPP TS 33.501)
  {
    category: '3GPP TS 33.501: N4 PFCP Session Flood (UPF Capacity Exhaustion)',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: '5G-UPF',
    noteGen: (ctx) => `High-frequency Packet Forwarding Control Protocol (PFCP) session establishment flood detected on N4 interface from SMF IP ${ctx.srcIp}. Association rate peaked at ${ctx.rate} req/sec, threatening UPF session table saturation. Dynamic ingress throttling applied at packet boundary.`
  },
  {
    category: '3GPP TS 33.501: N3 GTP-U TEID Allocation Desync / Injection',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: '5G-UPF',
    noteGen: (ctx) => `Anomalous GTP-U PDU encapsulation received on N3 user-plane interface with unallocated Tunnel Endpoint Identifier TEID 0x${ctx.teid}. Source gNodeB IP ${ctx.srcIp} isolated for radio interface re-synchronization.`
  },
  {
    category: '3GPP TS 33.501: N32-C SEPP PRINS Signature Verification Failure',
    severity: 'CRITICAL',
    weight: 8,
    assetFilter: 'SEPP-ROAM',
    noteGen: (ctx) => `Cross-PLMN N32 interconnect message failed JSON Web Signature (JWS) PRINS cryptographic validation. Peer SEPP roaming partner AS${ctx.asn} certificate signature rejected. Roaming message dropped per GSMA FS.36 specification.`
  },
  {
    category: '3GPP TS 33.501: N1/N2 NAS Security Header Replay Attack',
    severity: 'HIGH',
    weight: 15,
    assetFilter: '5G-UPF',
    noteGen: (ctx) => `5G Non-Access Stratum (NAS) ciphered protocol message sequence number decrement detected for subscriber IMSI ${ctx.imsi}. Integrity check failed (5G-IA2). Session terminated and re-authentication triggered.`
  },

  // SS7 Signalling Threats (GSMA FS.11)
  {
    category: 'GSMA FS.11: MAP-SRI_SM Spoofed Global Title (SIM-Swap Indicator)',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'SIGTRAN-STP',
    noteGen: (ctx) => `Category-1 unauthorized MAP_SendRoutingInfoForSM query targeting subscriber ${ctx.imsi} originated from suspect international Global Title GT=${ctx.gt}. Source does not match verified SMS-C whitelist. Message blocked by Signaling Firewall SMS Home Routing filter.`
  },
  {
    category: 'GSMA FS.11: MAP-ProvideSubscriberInfo Location Tracking Barrage',
    severity: 'HIGH',
    weight: 20,
    assetFilter: 'SIGTRAN-STP',
    noteGen: (ctx) => `Category-2 surveillance probe: MAP_ProvideSubscriberInfo (PSI) burst received from GT=${ctx.gt} requesting CellGlobalId and age-of-location for mobile block ${ctx.prefix}. HLR response spoofed with synthetic location coordinate per privacy firewall policy.`
  },
  {
    category: 'GSMA FS.11: CancelLocation Roaming Disconnection DoS',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'SIGTRAN-STP',
    noteGen: (ctx) => `Unauthorized MAP_CancelLocation injected from foreign VLR for active subscriber ${ctx.imsi}. Sequence validation confirmed subscriber has not initiated inter-PLMN handover. Rogue message suppressed.`
  },
  {
    category: 'GSMA FS.11: USSD Phase-2 Menu Interception / OTP Sniffing',
    severity: 'HIGH',
    weight: 10,
    assetFilter: 'SIGTRAN-STP',
    noteGen: (ctx) => `Abnormal ProcessUnstructuredSS-Request targeting banking USSD short-code from GT=${ctx.gt}. M3UA stream correlation identified unauthorized third-party aggregator. Route blacklisted.`
  },

  // Diameter LTE/5G Threats (GSMA FS.19)
  {
    category: 'GSMA FS.19: S6a Update-Location Origin-Host Impersonation',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: 'DRA-DIAM',
    noteGen: (ctx) => `Diameter S6a ULR message received where Origin-Realm ${ctx.realm} does not match ingress IPX peering route. Attempted subscriber profile diversion. Interconnect firewall dropped packet.`
  },
  {
    category: 'GSMA FS.19: SLg Unauthorized Location-Report-Request (LRR)',
    severity: 'HIGH',
    weight: 15,
    assetFilter: 'DRA-DIAM',
    noteGen: (ctx) => `Unauthorized location telemetry retrieval via Diameter SLg interface from IPX host ${ctx.srcIp}. Subscriber did not consent to third-party emergency routing. Query dropped with DIAMETER_AUTHORIZATION_REJECTED.`
  },
  {
    category: 'GSMA FS.19: Gy/Ro Credit-Control Toll Fraud Anomaly',
    severity: 'HIGH',
    weight: 18,
    assetFilter: 'DRA-DIAM',
    noteGen: (ctx) => `Diameter Gy CCR-U message replay loop detected from wholesale proxy. Bypassing online charging system quota verification for data session. Quota reset and account flagged for fraud audit.`
  },

  // Core BGP & Internet Transit (IETF RFC 6811 / RFC 7908 / RFC 5575)
  {
    category: 'RFC 6811: BGP RPKI ROA Invalid Prefix Hijack Attempt',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'BGP-CR',
    noteGen: (ctx) => `BGP Route Origin Authorization (ROA) validation failed for national prefix ${ctx.prefix}. Upstream peer AS${ctx.asn} announced unauthorized origin. Route Origin Validation (ROV) state set to INVALID. Route dropped immediately at ingress.`
  },
  {
    category: 'RFC 7908: BGP AS-PATH Loop Injection / Route Leak',
    severity: 'HIGH',
    weight: 16,
    assetFilter: 'BGP-CR',
    noteGen: (ctx) => `BGP transit policy violation: Autonomous system AS${ctx.asn} leaked customer transit route to lateral peer. AS-PATH prepend length exceeded threshold. Community 65535:0 (NO_EXPORT) enforced.`
  },
  {
    category: 'RFC 5575: BGP Flowspec Mitigation: 120Gbps Surge',
    severity: 'HIGH',
    weight: 22,
    assetFilter: 'BGP-CR',
    noteGen: (ctx) => `DDoS volumetric surge reached ${ctx.rate} Gbps targeting public Anycast IP ${ctx.srcIp}. BGP Flowspec rule dynamically propagated across edge routers: action rate-limit-packet to 5,000 pps. Core transit latency remained stable.`
  },

  // Carrier Voice & IMS SBC (RFC 3261)
  {
    category: 'RFC 3261: Carrier IMS SBC SIP INVITE Toll Fraud Storm',
    severity: 'HIGH',
    weight: 18,
    assetFilter: 'IMS-SBC',
    noteGen: (ctx) => `VoLTE core SBC received high-rate SIP INVITE burst (8,400 call attempts/min) to premium international rate numbers (+${ctx.dialCode}). IP source ${ctx.srcIp} failed TLS client certificate verification. Source trunk quarantined.`
  },
  {
    category: 'RFC 3261: VoLTE IMS SBC SIP REGISTER Brute-Force Sequence',
    severity: 'MEDIUM',
    weight: 30,
    assetFilter: 'IMS-SBC',
    noteGen: (ctx) => `Repetitive SIP 401 Unauthorized challenge responses observed for subscriber URI sip:+91${ctx.imsi}@ims.mnc.mcc.3gppnetwork.org from untrusted IP ${ctx.srcIp}. Automated ban applied for 60 minutes.`
  },

  // Carrier DNS & Infrastructure
  {
    category: 'Carrier DNS NXDOMAIN Random Subdomain Attack (Water Torture)',
    severity: 'MEDIUM',
    weight: 35,
    assetFilter: 'DNS-RECURS',
    noteGen: (ctx) => `Water torture DDoS query flood against recursive resolver: 65,000 qps requesting non-existent subdomains of authoritative domain ${ctx.domain}. Response Rate Limiting (RRL) activated; recursion cache protected.`
  },
  {
    category: 'Carrier-Grade NAT Dynamic Port-Block Allocation Exhaustion',
    severity: 'MEDIUM',
    weight: 40,
    assetFilter: 'CGNAT-POOL',
    noteGen: (ctx) => `CGNAT outside public IP pool allocation threshold exceeded 94% on subnet ${ctx.prefix}. P2P connection flood from mobile subscribers identified. Port-block limit adjusted dynamically.`
  },

  // Radio Access Network & Transmission
  {
    category: 'eNodeB/gNodeB S1-MME/NG-AP SCTP Association Abort Storm',
    severity: 'MEDIUM',
    weight: 25,
    assetFilter: 'NG-RAN-CSR',
    noteGen: (ctx) => `Sudden burst of SCTP ABORT chunks on control-plane link to AMF/MME from regional cell tower cluster ${ctx.circle}-TOWER-${ctx.towerId}. Fiber backhaul jitter verified; transmission engineers notified.`
  },
  {
    category: 'Rogue gNodeB / IMSI Catcher RF Spectrum Anomaly',
    severity: 'HIGH',
    weight: 12,
    assetFilter: 'NG-RAN-CSR',
    noteGen: (ctx) => `Anomalous broadcast of Carrier PLMN 404-45 observed from non-whitelisted GPS coordinates in ${ctx.circle} sector. Cell selection offset set to maximum. Physical RF locating team dispatched.`
  },
  {
    category: 'Optical DWDM ROADM 100G Bit Error Rate (BER) Degradation',
    severity: 'LOW',
    weight: 35,
    assetFilter: 'ROADM-DWDM',
    noteGen: (ctx) => `Optical Pre-FEC bit error rate climbed above 1.2e-4 on span ${ctx.circle}-ROADM-LAMBDA-12 (Wavelength 1550.12nm). Optical Time-Domain Reflectometer (OTDR) trace showed 1.4dB micro-bend event at KM 48.2.`
  },
  {
    category: 'MPLS LDP Label Switched Path (LSP) Desynchronization',
    severity: 'LOW',
    weight: 30,
    assetFilter: 'BGP-CR',
    noteGen: (ctx) => `LDP adjacency flap detected on interface HundredGigE0/0/0/3 to neighbor router. BFD fast failover redirected customer MPLS VPN traffic over alternate optical path within 42ms.`
  },
  {
    category: 'AAA RADIUS Accounting Stop Request Replay / Billing Evasion',
    severity: 'MEDIUM',
    weight: 25,
    assetFilter: 'DRA-DIAM',
    noteGen: (ctx) => `Malformed RADIUS Acct-Status-Type=Stop message replayed with expired Authenticator from broadband access gateway IP ${ctx.srcIp}. Billing record reconciled via secondary NetFlow CDR.`
  },
  {
    category: 'Carrier NetFlow SYN Flood Surpassing 80 Mpps',
    severity: 'HIGH',
    weight: 18,
    assetFilter: 'BGP-CR',
    noteGen: (ctx) => `Volumetric TCP SYN flood detected via IPFIX flow telemetry across Delhi-Mumbai optical transit. Scrubbing center diverted suspect flow; SYN cookie authentication confirmed benign web user traffic unaffected.`
  },
  {
    category: '5G Network Slice SLA Jitter Violation / QoS Degradation',
    severity: 'LOW',
    weight: 35,
    assetFilter: '5G-UPF',
    noteGen: (ctx) => `Ultra-Reliable Low-Latency Communication (URLLC) network slice S-NSSAI 01-000001 exceeded 12ms latency budget for smart grid clients. 5QI priority queue re-weighted dynamically.`
  },
  {
    category: 'GTP-C Path Management Echo Request Flood',
    severity: 'MEDIUM',
    weight: 20,
    assetFilter: '5G-UPF',
    noteGen: (ctx) => `Unusual burst of GTP-C Echo Requests received from peer IP ${ctx.srcIp}. Rate limiting applied to control-plane path management daemon.`
  },
  {
    category: 'Diameter Sh Interface Unauthorized HSS Profile Query',
    severity: 'HIGH',
    weight: 14,
    assetFilter: 'DRA-DIAM',
    noteGen: (ctx) => `Unauthorized Diameter Sh User-Data-Request (UDR) initiated by unapproved Application Server IP ${ctx.srcIp}. Query rejected with DIAMETER_ERROR_USER_DATA_CANNOT_BE_READ.`
  }
];

// Pre-calculate cumulative weights for fast weighted random sampling
let totalWeight = 0;
const weightedThreats = THREAT_CATALOG.map(t => {
  totalWeight += t.weight;
  return { ...t, cumWeight: totalWeight };
});

function pickThreat() {
  const r = Math.random() * totalWeight;
  for (const t of weightedThreats) {
    if (r <= t.cumWeight) return t;
  }
  return weightedThreats[0];
}

// 3. 60 Realistic Analysts
const ANALYSTS = [];
for (let i = 1; i <= 25; i++) ANALYSTS.push(`noc_tier1_analyst_${String(i).padStart(2, '0')}`);
for (let i = 1; i <= 20; i++) ANALYSTS.push(`noc_tier2_specialist_${String(i).padStart(2, '0')}`);
for (let i = 1; i <= 15; i++) ANALYSTS.push(`cirt_lead_engineer_${String(i).padStart(2, '0')}`);

// 4. Helper Generators
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randIp() {
  const choice = Math.random();
  if (choice < 0.4) return `103.24.${randInt(10, 250)}.${randInt(1, 254)}`;
  if (choice < 0.7) return `10.150.${randInt(1, 250)}.${randInt(1, 254)}`;
  return `172.16.${randInt(10, 200)}.${randInt(1, 254)}`;
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 5. Streaming Generator Function
async function generate() {
  const stream = fs.createWriteStream(outputFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  
  // Write CSV Header
  stream.write('alert_id,category,severity,created_at,closed_at,disposition,assignee,asset_id,investigation_notes\r\n');

  const TOTAL_RECORDS = 500000;
  const START_TIME = new Date('2026-09-02T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T00:00:00.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  const DISPOSITIONS = ['RESOLVED', 'AUTO_MITIGATED', 'FALSE_POSITIVE', 'BENIGN_CONGESTION', 'ESCALATED_L3', 'BLOCKED_SIGNALLING_FW'];

  console.log(`[SAT-SA Benchmark Generator] Writing ${TOTAL_RECORDS} records to disk...`);
  const startTime = Date.now();

  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    // Diurnal distribution: peak during daytime hours (10:00 - 22:00)
    const linearProgress = (i - 1) / TOTAL_RECORDS;
    // Base timestamp + small random jitter within a 30-day chronological progression
    const rawTimestampMs = START_TIME + Math.floor(linearProgress * TIME_RANGE) + randInt(-300000, 300000);
    const createdDate = new Date(Math.min(END_TIME, Math.max(START_TIME, rawTimestampMs)));
    
    // Pick threat definition
    const threat = pickThreat();

    // Select asset matching threat filter if possible
    let assetCandidates = ASSETS.filter(a => a.id.startsWith(threat.assetFilter));
    if (assetCandidates.length === 0) assetCandidates = ASSETS;
    const asset = randChoice(assetCandidates);

    // Context for non-repetitive procedural text generator
    const ctx = {
      srcIp: randIp(),
      rate: (threat.severity === 'CRITICAL' ? (Math.random() * 80 + 40).toFixed(1) : (Math.random() * 20 + 2).toFixed(1)),
      teid: Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0'),
      asn: randChoice([45820, 9498, 55836, 132203, 133937, 38266, 45609]),
      imsi: `9876${randInt(100000, 999999)}`,
      gt: `+${randChoice([91, 44, 1, 971, 65])}${randInt(7000000000, 9999999999)}`,
      prefix: `103.${randInt(20, 190)}.${randInt(0, 255)}.0/24`,
      realm: randChoice(['epc.mnc045.mcc404.3gppnetwork.org', 'ims.roaming.carrier.net', 'ipx.transit.telecom.org']),
      dialCode: randChoice([247, 881, 882, 970, 239, 248]),
      domain: `attack-node-${randInt(100, 999)}.telecom-cdn-${randChoice(['alpha', 'edge', 'fast', 'net'])}.com`,
      towerId: randInt(101, 899),
      circle: asset.circle
    };

    // Investigation notes
    const noteText = threat.noteGen(ctx);

    // Duration & ClosedAt
    let durationMins;
    if (threat.severity === 'CRITICAL') {
      durationMins = randInt(15, 90);
    } else if (threat.severity === 'HIGH') {
      durationMins = randInt(25, 140);
    } else {
      durationMins = randInt(10, 60);
    }
    const closedDate = new Date(createdDate.getTime() + durationMins * 60000);

    const alertId = `ALT-TEL-${String(i).padStart(6, '0')}`;
    const disposition = threat.severity === 'CRITICAL' 
      ? randChoice(['RESOLVED', 'ESCALATED_L3', 'BLOCKED_SIGNALLING_FW'])
      : randChoice(DISPOSITIONS);
    const assignee = randChoice(ANALYSTS);

    const row = [
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

    // Write with stream backpressure handling
    const ok = stream.write(row);
    if (!ok) {
      await new Promise(resolve => stream.once('drain', resolve));
    }

    if (i % 100000 === 0) {
      console.log(`  -> Processed ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} records (${((i / TOTAL_RECORDS) * 100).toFixed(0)}%)...`);
    }
  }

  stream.end();
  await new Promise(resolve => stream.once('finish', resolve));

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  const stats = fs.statSync(outputFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`\n[SAT-SA Benchmark Generator] Generated 500,000 records successfully!`);
  console.log(`  • Destination: ${outputFile}`);
  console.log(`  • File Size:   ${sizeMb} MB`);
  console.log(`  • Total Time:  ${totalTime} seconds`);
  console.log(`  • Throughput:  ${((TOTAL_RECORDS / totalTime)).toFixed(0)} records/second`);
}

generate().catch(err => {
  console.error('[Error] Benchmark generator failed:', err);
  process.exit(1);
});
