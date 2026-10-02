import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const telcoDir = path.resolve(__dirname, '../../samples/CSE-TELCO-01');

const alertsFile = path.join(telcoDir, 'benchmark_500k_alerts.csv');
const casesFile = path.join(telcoDir, 'benchmark_500k_cases.csv');
const assetsFile = path.join(telcoDir, 'benchmark_500k_assets.csv');

console.log('[SAT-SA Benchmark Suite] Initializing 3-File Benchmark Dataset for CSE-TELCO-01...');

// 1. Comprehensive Telecom Monitored Assets (160 carrier-grade nodes across 8 circles)
const CIRCLES = [
  { code: 'DEL', name: 'Delhi NCR' },
  { code: 'MUM', name: 'Mumbai Metro' },
  { code: 'BLR', name: 'Bengaluru Tech Corridor' },
  { code: 'KOL', name: 'Kolkata Eastern Hub' },
  { code: 'CHN', name: 'Chennai Southern Hub' },
  { code: 'HYD', name: 'Hyderabad Cyberabad' },
  { code: 'PNE', name: 'Pune Western Circle' },
  { code: 'AMD', name: 'Ahmedabad Gujarat Circle' }
];

const ASSET_SPECS = [
  { prefix: 'BGP-CR', name: 'Core Border Gateway Router', type: 'BGP_ROUTER', crit: 5, vlan: 'AS-45820-CORE-INTERNET', os: 'Cisco IOS-XR 7.9.2' },
  { prefix: '5G-UPF', name: '5G Cloud Native User Plane Function', type: '5G_UPF', crit: 5, vlan: 'VLAN-502-N3-N4-CORE', os: 'Ericsson Cloud Core / K8s 1.28' },
  { prefix: 'IMS-SBC', name: 'VoLTE/VoNR Session Border Controller', type: 'IMS_SBC', crit: 4, vlan: 'VLAN-520-SIP-CARRIER', os: 'Ribbon SBC SWe Rel 11.2' },
  { prefix: 'DRA-DIAM', name: 'Diameter Routing Agent & Roaming Gateway', type: 'AAA_DIAMETER', crit: 5, vlan: 'VLAN-510-SIG-DIAMETER', os: 'Oracle Communications DSR 9.0' },
  { prefix: 'SIGTRAN-STP', name: 'SS7 Signalling Transfer Point', type: 'SS7_STP', crit: 4, vlan: 'VLAN-515-SIGTRAN-M3UA', os: 'Dialogic DSI G51 SS7' },
  { prefix: 'SEPP-ROAM', name: '5G Security Edge Protection Proxy', type: '5G_SEPP', crit: 5, vlan: '5G-SBA-SEPP-ROAMING', os: 'Nokia 5G SBA SEPP v23.4' },
  { prefix: 'DNS-RECURS', name: 'Tier-1 Carrier DNS Anycast Resolver', type: 'DNS_RESOLVER', crit: 4, vlan: 'PUBLIC-ANYCAST-DNS', os: 'BIND 9.18.18 Hardened' },
  { prefix: 'CGNAT-POOL', name: 'Carrier-Grade NAT Large Scale Farm', type: 'CGNAT_GW', crit: 4, vlan: 'CGNAT-NAT444-FARM', os: 'A10 ACOS 5.2.1-P4' },
  { prefix: 'ROADM-DWDM', name: 'Dense Wavelength Division Optical Switch', type: 'OPTICAL_ROADM', crit: 4, vlan: 'DWDM-OPTICAL-SPAN', os: 'Ciena SAOS 10.8.2' },
  { prefix: 'NG-RAN-CSR', name: '5G Next-Gen Cell Site Aggregation Router', type: 'CELL_SITE_ROUTER', crit: 3, vlan: 'NG-RAN-S1-SCTP', os: 'Juniper ACX7100 Junos 22.4' }
];

const ASSETS = [];
let ipCounter = 1;
for (const circle of CIRCLES) {
  for (const spec of ASSET_SPECS) {
    for (let instance = 1; instance <= 2; instance++) {
      const assetId = `${spec.prefix}-${circle.code}-${String(instance).padStart(2, '0')}`;
      const ip = `10.150.${circle.code === 'DEL' ? 10 : (circle.code === 'MUM' ? 20 : 30)}.${ipCounter % 250 + 1}`;
      ipCounter++;

      ASSETS.push({
        asset_id: assetId,
        name: `${circle.name} ${spec.name} ${instance}`,
        type: spec.type,
        criticality: spec.crit,
        environment: 'PRODUCTION_CARRIER',
        ip_address: ip,
        zone_or_vlan: spec.vlan,
        firmware_os: spec.os,
        last_seen: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
      });
    }
  }
}

// Write benchmark_500k_assets.csv
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const assetHeaders = Object.keys(ASSETS[0]);
const assetCsvContent = [
  assetHeaders.join(','),
  ...ASSETS.map(a => assetHeaders.map(h => escapeCsv(a[h])).join(','))
].join('\r\n') + '\r\n';

fs.writeFileSync(assetsFile, assetCsvContent, 'utf-8');
console.log(`[1/3 Assets Complete] Written ${ASSETS.length} assets to: ${assetsFile}`);

// 2. Threat Catalog with Root Causes & Case Notes
const ROOT_CAUSES = [
  'UPSTREAM_PEER_BGP_ROUTE_LEAK',
  'UNAUTHORIZED_INTERNATIONAL_ROAMING_QUERY',
  'DISTRIBUTED_IOT_BOTNET_VOLUMETRIC_SURGE',
  'SIGNALLING_GATEWAY_SPOOFED_GLOBAL_TITLE',
  '5G_SMF_PFCP_SOFTWARE_HEURISTIC_OVERLOAD',
  'RADIO_CELL_SITE_SCTP_NETWORK_DESYNC',
  'OPTICAL_FIBER_ATTENUATION_MICRO_BEND',
  'WHOLESALE_SIP_TRUNK_AUTHENTICATION_BREACH',
  'MALICIOUS_DNS_RANDOM_SUBDOMAIN_WATER_TORTURE',
  'CGNAT_DYNAMIC_PORT_BLOCK_EXHAUSTION'
];

const ESCALATION_LEVELS = [
  'L2_CORE_NETWORK_CIRT',
  'L3_TRANSPORT_ENGINEERING',
  'CARRIER_CISO_CRISIS_DESK',
  'NATIONAL_CERT_IN_REPORTING',
  'GSMA_FRAUD_PREVENTION_GROUP'
];

const THREAT_CATALOG = [
  {
    category: '3GPP TS 33.501: N4 PFCP Session Flood (UPF Capacity Exhaustion)',
    severity: 'CRITICAL',
    weight: 12,
    assetFilter: '5G-UPF',
    rootCause: '5G_SMF_PFCP_SOFTWARE_HEURISTIC_OVERLOAD',
    noteGen: (ctx) => `High-frequency Packet Forwarding Control Protocol (PFCP) session establishment flood detected on N4 interface from SMF IP ${ctx.srcIp}. Association rate peaked at ${ctx.rate} req/sec, threatening UPF session table saturation. Dynamic ingress throttling applied at packet boundary.`,
    caseNoteGen: (ctx) => `Critical 5G UPF control plane congestion triaged by CIRT. Analyzed PFCP session request patterns. Offending SMF communication throttled at ingress interface. Core slice capacity restored within SLA window.`
  },
  {
    category: '3GPP TS 33.501: N3 GTP-U TEID Allocation Desync / Injection',
    severity: 'CRITICAL',
    weight: 10,
    assetFilter: '5G-UPF',
    rootCause: 'RADIO_CELL_SITE_SCTP_NETWORK_DESYNC',
    noteGen: (ctx) => `Anomalous GTP-U PDU encapsulation received on N3 user-plane interface with unallocated Tunnel Endpoint Identifier TEID 0x${ctx.teid}. Source gNodeB IP ${ctx.srcIp} isolated for radio interface re-synchronization.`,
    caseNoteGen: (ctx) => `GTP-U user plane TEID desynchronization investigated. Identified firmware timing anomaly on regional gNodeB base station. Node re-synchronized and tunnel tables cleared.`
  },
  {
    category: '3GPP TS 33.501: N32-C SEPP PRINS Signature Verification Failure',
    severity: 'CRITICAL',
    weight: 8,
    assetFilter: 'SEPP-ROAM',
    rootCause: 'UNAUTHORIZED_INTERNATIONAL_ROAMING_QUERY',
    noteGen: (ctx) => `Cross-PLMN N32 interconnect message failed JSON Web Signature (JWS) PRINS cryptographic validation. Peer SEPP roaming partner AS${ctx.asn} certificate signature rejected. Roaming message dropped per GSMA FS.36 specification.`,
    caseNoteGen: (ctx) => `Security Edge Protection Proxy cryptographic failure escalated to International Roaming NOC. Foreign carrier contacted regarding expired intermediate CA certificate. Interconnect link quarantined.`
  },
  {
    category: 'GSMA FS.11: MAP-SRI_SM Spoofed Global Title (SIM-Swap Indicator)',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'SIGTRAN-STP',
    rootCause: 'SIGNALLING_GATEWAY_SPOOFED_GLOBAL_TITLE',
    noteGen: (ctx) => `Category-1 unauthorized MAP_SendRoutingInfoForSM query targeting subscriber ${ctx.imsi} originated from suspect international Global Title GT=${ctx.gt}. Source does not match verified SMS-C whitelist. Message blocked by Signaling Firewall SMS Home Routing filter.`,
    caseNoteGen: (ctx) => `Prohibited Category-1 SS7 MAP message intercepted. Suspected targeted SIM-swap attack against VIP subscriber. Originating international GT blocked permanently across all STP pairs. National CERT notified.`
  },
  {
    category: 'RFC 6811: BGP RPKI ROA Invalid Prefix Hijack Attempt',
    severity: 'CRITICAL',
    weight: 14,
    assetFilter: 'BGP-CR',
    rootCause: 'UPSTREAM_PEER_BGP_ROUTE_LEAK',
    noteGen: (ctx) => `BGP Route Origin Authorization (ROA) validation failed for national prefix ${ctx.prefix}. Upstream peer AS${ctx.asn} announced unauthorized origin. Route Origin Validation (ROV) state set to INVALID. Route dropped immediately at ingress.`,
    caseNoteGen: (ctx) => `BGP route hijack attempt triaged within 12 minutes. Route Origin Validation dropped unauthorized AS path. Peer carrier issued formal notice regarding RPKI compliance failure.`
  },
  {
    category: 'RFC 5575: BGP Flowspec Mitigation: 120Gbps Surge',
    severity: 'HIGH',
    weight: 22,
    assetFilter: 'BGP-CR',
    rootCause: 'DISTRIBUTED_IOT_BOTNET_VOLUMETRIC_SURGE',
    noteGen: (ctx) => `DDoS volumetric surge reached ${ctx.rate} Gbps targeting public Anycast IP ${ctx.srcIp}. BGP Flowspec rule dynamically propagated across edge routers: action rate-limit-packet to 5,000 pps. Core transit latency remained stable.`,
    caseNoteGen: (ctx) => `Volumetric carrier flood mitigated via BGP Flowspec policy rule. Attack traffic filtered across border gateways. Scrubbing center confirmed 99.8% malicious packet mitigation.`
  },
  {
    category: 'GSMA FS.11: MAP-ProvideSubscriberInfo Location Tracking Barrage',
    severity: 'HIGH',
    weight: 20,
    assetFilter: 'SIGTRAN-STP',
    rootCause: 'UNAUTHORIZED_INTERNATIONAL_ROAMING_QUERY',
    noteGen: (ctx) => `Category-2 surveillance probe: MAP_ProvideSubscriberInfo (PSI) burst received from GT=${ctx.gt} requesting CellGlobalId and age-of-location for mobile block ${ctx.prefix}. HLR response spoofed with synthetic location coordinate per privacy firewall policy.`,
    caseNoteGen: (ctx) => `Location tracking barrage detected by SS7 Firewall. Synthetic responses returned to deceive surveillance tool. Source SCCP calling party address submitted to GSMA T-ISAC intelligence exchange.`
  },
  {
    category: 'RFC 3261: Carrier IMS SBC SIP INVITE Toll Fraud Storm',
    severity: 'HIGH',
    weight: 18,
    assetFilter: 'IMS-SBC',
    rootCause: 'WHOLESALE_SIP_TRUNK_AUTHENTICATION_BREACH',
    noteGen: (ctx) => `VoLTE core SBC received high-rate SIP INVITE burst (8,400 call attempts/min) to premium international rate numbers (+${ctx.dialCode}). IP source ${ctx.srcIp} failed TLS client certificate verification. Source trunk quarantined.`,
    caseNoteGen: (ctx) => `Toll fraud attack on VoLTE interconnect trunk suppressed. Rogue SIP trunk session terminated. Financial loss prevented; IP address added to carrier-wide edge blacklist.`
  },
  {
    category: 'Carrier DNS NXDOMAIN Random Subdomain Attack (Water Torture)',
    severity: 'MEDIUM',
    weight: 35,
    assetFilter: 'DNS-RECURS',
    rootCause: 'MALICIOUS_DNS_RANDOM_SUBDOMAIN_WATER_TORTURE',
    noteGen: (ctx) => `Water torture DDoS query flood against recursive resolver: 65,000 qps requesting non-existent subdomains of authoritative domain ${ctx.domain}. Response Rate Limiting (RRL) activated; recursion cache protected.`,
    caseNoteGen: (ctx) => `DNS resolver rate limiting prevented upstream authoritative cache poisoning. Resolver latency stayed under 18ms.`
  },
  {
    category: 'Carrier-Grade NAT Dynamic Port-Block Allocation Exhaustion',
    severity: 'MEDIUM',
    weight: 40,
    assetFilter: 'CGNAT-POOL',
    rootCause: 'CGNAT_DYNAMIC_PORT_BLOCK_EXHAUSTION',
    noteGen: (ctx) => `CGNAT outside public IP pool allocation threshold exceeded 94% on subnet ${ctx.prefix}. P2P connection flood from mobile subscribers identified. Port-block limit adjusted dynamically.`,
    caseNoteGen: (ctx) => `CGNAT port exhaustion mitigated by shifting 25,000 mobile subscribers to secondary overflow pool. Zero connection drops.`
  },
  {
    category: 'Optical DWDM ROADM 100G Bit Error Rate (BER) Degradation',
    severity: 'LOW',
    weight: 35,
    assetFilter: 'ROADM-DWDM',
    rootCause: 'OPTICAL_FIBER_ATTENUATION_MICRO_BEND',
    noteGen: (ctx) => `Optical Pre-FEC bit error rate climbed above 1.2e-4 on span ${ctx.circle}-ROADM-LAMBDA-12 (Wavelength 1550.12nm). Optical Time-Domain Reflectometer (OTDR) trace showed 1.4dB micro-bend event at KM 48.2.`,
    caseNoteGen: (ctx) => `Field optical transmission team inspected fiber junction box at KM 48.2. Re-spliced bent fiber core. BER restored to nominal 1e-12.`
  }
];

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

const ANALYSTS = [];
for (let i = 1; i <= 25; i++) ANALYSTS.push(`noc_tier1_analyst_${String(i).padStart(2, '0')}`);
for (let i = 1; i <= 20; i++) ANALYSTS.push(`noc_tier2_specialist_${String(i).padStart(2, '0')}`);
for (let i = 1; i <= 15; i++) ANALYSTS.push(`cirt_lead_engineer_${String(i).padStart(2, '0')}`);

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

// 3. Streaming Benchmark Ingest Generator
async function run() {
  const alertsStream = fs.createWriteStream(alertsFile, { flags: 'w', highWaterMark: 1024 * 1024 });
  const casesStream = fs.createWriteStream(casesFile, { flags: 'w', highWaterMark: 1024 * 1024 });

  alertsStream.write('alert_id,category,severity,created_at,closed_at,disposition,assignee,asset_id,investigation_notes\r\n');
  casesStream.write('case_id,alert_id,severity,status,opened_at,closed_at,assignee,escalation_level,root_cause,investigation_notes\r\n');

  const TOTAL_RECORDS = 500000;
  const START_TIME = new Date('2026-09-02T00:00:00.000Z').getTime();
  const END_TIME = new Date('2026-10-02T00:00:00.000Z').getTime();
  const TIME_RANGE = END_TIME - START_TIME;

  const DISPOSITIONS = ['RESOLVED', 'AUTO_MITIGATED', 'FALSE_POSITIVE', 'BENIGN_CONGESTION', 'ESCALATED_L3', 'BLOCKED_SIGNALLING_FW'];

  console.log(`[SAT-SA Benchmark Suite] Streaming 500,000 alerts & matching cases...`);
  const t0 = Date.now();
  let totalCasesCreated = 0;

  for (let i = 1; i <= TOTAL_RECORDS; i++) {
    const linearProgress = (i - 1) / TOTAL_RECORDS;
    const rawTimestampMs = START_TIME + Math.floor(linearProgress * TIME_RANGE) + randInt(-300000, 300000);
    const createdDate = new Date(Math.min(END_TIME, Math.max(START_TIME, rawTimestampMs)));

    const threat = pickThreat();
    let assetCandidates = ASSETS.filter(a => a.asset_id.startsWith(threat.assetFilter));
    if (assetCandidates.length === 0) assetCandidates = ASSETS;
    const asset = randChoice(assetCandidates);

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
      circle: asset.asset_id.split('-')[1] || 'DEL'
    };

    const noteText = threat.noteGen(ctx);
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

    // 1. Write Alert Row
    const alertRow = [
      alertId,
      threat.category,
      threat.severity,
      createdDate.toISOString(),
      closedDate.toISOString(),
      disposition,
      assignee,
      asset.asset_id,
      noteText
    ].map(escapeCsv).join(',') + '\r\n';

    const okAlert = alertsStream.write(alertRow);
    if (!okAlert) {
      await new Promise(res => alertsStream.once('drain', res));
    }

    // 2. Write Matching Case Row for Critical & High Severity Alerts (Standard Incident Triage Policy)
    if (threat.severity === 'CRITICAL' || threat.severity === 'HIGH') {
      totalCasesCreated++;
      const caseId = `CAS-TEL-${String(totalCasesCreated).padStart(6, '0')}`;
      const openedDate = new Date(createdDate.getTime() + 60000 * randInt(1, 3));
      const caseNotes = threat.caseNoteGen(ctx);

      const caseRow = [
        caseId,
        alertId,
        threat.severity,
        'CLOSED',
        openedDate.toISOString(),
        closedDate.toISOString(),
        assignee,
        randChoice(ESCALATION_LEVELS),
        threat.rootCause,
        caseNotes
      ].map(escapeCsv).join(',') + '\r\n';

      const okCase = casesStream.write(caseRow);
      if (!okCase) {
        await new Promise(res => casesStream.once('drain', res));
      }
    }

    if (i % 100000 === 0) {
      console.log(`  -> Processed ${i.toLocaleString()} / ${TOTAL_RECORDS.toLocaleString()} alerts (${totalCasesCreated.toLocaleString()} cases created)...`);
    }
  }

  alertsStream.end();
  casesStream.end();

  await Promise.all([
    new Promise(res => alertsStream.once('finish', res)),
    new Promise(res => casesStream.once('finish', res))
  ]);

  const dt = ((Date.now() - t0) / 1000).toFixed(2);
  const alertStats = fs.statSync(alertsFile);
  const caseStats = fs.statSync(casesFile);
  const assetStats = fs.statSync(assetsFile);

  console.log(`\n[SAT-SA Benchmark Suite] Complete 3-File Dataset Generated Successfully!`);
  console.log(`  1. Alerts File: ${alertsFile} (${(alertStats.size / (1024 * 1024)).toFixed(2)} MB, 500,000 alerts)`);
  console.log(`  2. Cases File:  ${casesFile} (${(caseStats.size / (1024 * 1024)).toFixed(2)} MB, ${totalCasesCreated.toLocaleString()} cases)`);
  console.log(`  3. Assets File: ${assetsFile} (${(assetStats.size / 1024).toFixed(2)} KB, ${ASSETS.length} assets)`);
  console.log(`  • Execution Time: ${dt} seconds (${(TOTAL_RECORDS / dt).toFixed(0)} alerts/sec)`);
}

run().catch(err => {
  console.error('[Error] Generation failed:', err);
  process.exit(1);
});
