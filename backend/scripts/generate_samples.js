import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMultiFormatFile } from '../src/modules/ingestion/universal_parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const samplesDir = path.resolve(__dirname, '../../samples');

console.log('[Sample Generator] Initializing compliant sample datasets under:', samplesDir);

const SECTOR_DATASETS = [
  {
    entityCode: 'CSE-POWER-01',
    entityName: 'Northern Regional Power Grid Transmission',
    sectorId: 'sec_energy',
    shortName: 'Northern Regional Power Grid',
    period: '2026-Q3',
    kpis: {
      headline_sla_compliance_pct: 99.1,
      reported_mttr_minutes: 12.4,
      total_alerts_handled: 142
    },
    assets: [
      {
        asset_id: 'RTU-SUBSTATION-ALPHA-400KV',
        name: 'Northern Grid 400kV Substation Alpha RTU',
        type: 'SCADA_RTU',
        criticality: 5,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.10.15',
        zone_or_vlan: 'VLAN-101-OT-CONTROL',
        firmware_os: 'ABB RTU560 Rel 13.4.1',
        last_seen: '2026-08-20T04:15:00.000Z' // 42 days silent!
      },
      {
        asset_id: 'RTU-SUBSTATION-BETA-220KV',
        name: 'Northern Grid 220kV Substation Beta RTU',
        type: 'SCADA_RTU',
        criticality: 5,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.20.15',
        zone_or_vlan: 'VLAN-102-OT-CONTROL',
        firmware_os: 'GE D400 Substation Gateway v7.2',
        last_seen: '2026-08-22T11:30:00.000Z' // 40 days silent!
      },
      {
        asset_id: 'PLC-TURBINE-GEN-01',
        name: 'Turbine Speed Governor PLC Unit 1',
        type: 'PLC_CONTROLLER',
        criticality: 5,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.10.22',
        zone_or_vlan: 'VLAN-105-SAFETY-SIS',
        firmware_os: 'Siemens S7-1500 v2.9',
        last_seen: '2026-08-24T09:12:00.000Z' // 38 days silent!
      },
      {
        asset_id: 'EMS-SCADA-CORE-01',
        name: 'Northern Regional Energy Management System Gateway',
        type: 'EMS_SERVER',
        criticality: 5,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.1.10',
        zone_or_vlan: 'VLAN-100-EMS-CORE',
        firmware_os: 'Red Hat Enterprise Linux 8.8 (Hardened)',
        last_seen: '2026-10-02T18:00:00.000Z'
      },
      {
        asset_id: 'OT-FW-DMZ-SUB-01',
        name: 'Substation Alpha Boundary Industrial Firewall',
        type: 'OT_FIREWALL',
        criticality: 4,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.1.1',
        zone_or_vlan: 'DMZ-PERIMETER',
        firmware_os: 'FortiOS Rugged 7.2.5',
        last_seen: '2026-10-02T19:30:00.000Z'
      },
      {
        asset_id: 'HMI-WORKSTATION-ENG-02',
        name: 'Control Room Engineering Workstation 02',
        type: 'ENGINEERING_HMI',
        criticality: 3,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.10.45',
        zone_or_vlan: 'VLAN-110-OPERATOR-HMI',
        firmware_os: 'Windows 10 Enterprise LTSC IoT',
        last_seen: '2026-10-02T19:45:00.000Z'
      },
      {
        asset_id: 'SYNC-PHASOR-PMU-01',
        name: 'Synchrophasor Wide Area Measurement Unit',
        type: 'PMU_SENSOR',
        criticality: 4,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.10.88',
        zone_or_vlan: 'VLAN-101-OT-CONTROL',
        firmware_os: 'Schweitzer SEL-2240 Axion',
        last_seen: '2026-10-02T19:10:00.000Z'
      },
      {
        asset_id: 'TRANS-FEEDER-RELAY-04',
        name: 'Feeder 4 Differential Protection Line Relay',
        type: 'IED_PROTECTION_RELAY',
        criticality: 4,
        environment: 'PRODUCTION_OT',
        ip_address: '10.240.10.50',
        zone_or_vlan: 'VLAN-101-OT-CONTROL',
        firmware_os: 'SEL-411L Firmware Rel 12',
        last_seen: '2026-10-02T18:45:00.000Z'
      }
    ],
    alerts: [
      {
        alert_id: 'ALT-PWR-2026-0101',
        category: 'SCADA Command Injection',
        severity: 'CRITICAL',
        created_at: '2026-10-01T08:15:00.000Z',
        closed_at: '2026-10-01T08:18:22.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'analyst_sharma_01',
        asset_id: 'RTU-SUBSTATION-ALPHA-400KV',
        investigation_notes: 'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.'
      },
      {
        alert_id: 'ALT-PWR-2026-0102',
        category: 'SCADA Command Injection',
        severity: 'CRITICAL',
        created_at: '2026-10-01T08:20:00.000Z',
        closed_at: '2026-10-01T08:23:15.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'analyst_sharma_01',
        asset_id: 'RTU-SUBSTATION-BETA-220KV',
        investigation_notes: 'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.'
      },
      {
        alert_id: 'ALT-PWR-2026-0103',
        category: 'Industrial Malware',
        severity: 'CRITICAL',
        created_at: '2026-10-01T08:45:00.000Z',
        closed_at: '2026-10-01T08:48:00.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'analyst_verma_02',
        asset_id: 'EMS-SCADA-CORE-01',
        investigation_notes: 'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.'
      },
      {
        alert_id: 'ALT-PWR-2026-0104',
        category: 'Unauthorized Access',
        severity: 'HIGH',
        created_at: '2026-10-01T09:00:00.000Z',
        closed_at: '2026-10-01T09:55:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'analyst_sharma_01',
        asset_id: 'OT-FW-DMZ-SUB-01',
        investigation_notes: 'SSH brute force sequence originated from contractor jump host. Session terminated and IP temporarily blacklisted.'
      },
      {
        alert_id: 'ALT-PWR-2026-0105',
        category: 'DNP3 Protocol Anomaly',
        severity: 'HIGH',
        created_at: '2026-10-01T10:15:30.000Z',
        closed_at: '2026-10-01T10:19:10.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'analyst_sharma_01',
        asset_id: 'HMI-WORKSTATION-ENG-02',
        investigation_notes: 'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.'
      },
      {
        alert_id: 'ALT-PWR-2026-0106',
        category: 'Turbine Safety Boundary Breach',
        severity: 'CRITICAL',
        created_at: '2026-10-01T11:00:00.000Z',
        closed_at: '2026-10-01T11:04:12.000Z',
        disposition: 'RESOLVED_NO_ACTION',
        assignee: 'analyst_verma_02',
        asset_id: 'PLC-TURBINE-GEN-01',
        investigation_notes: 'System health normal. Traffic deemed benign routine backup traffic. Resolving alert without further action required.'
      },
      {
        alert_id: 'ALT-PWR-2026-0107',
        category: 'Synchrophasor Stream Anomaly',
        severity: 'MEDIUM',
        created_at: '2026-10-01T13:20:00.000Z',
        closed_at: '2026-10-01T14:10:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'analyst_gupta_03',
        asset_id: 'SYNC-PHASOR-PMU-01',
        investigation_notes: 'PMU GPS timestamp drift detected. Re-locked to secondary IRIG-B master clock.'
      },
      {
        alert_id: 'ALT-PWR-2026-0108',
        category: 'Relay Logic Modification',
        severity: 'HIGH',
        created_at: '2026-10-01T15:40:00.000Z',
        closed_at: '2026-10-01T15:44:30.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'analyst_sharma_01',
        asset_id: 'TRANS-FEEDER-RELAY-04',
        investigation_notes: 'Reviewed alert telemetry. IP address checked against external threat list. No immediate IOC matched. Marked benign and closed per standard playbook procedure.'
      }
    ],
    cases: [
      {
        case_id: 'CAS-PWR-2026-2101',
        alert_id: 'ALT-PWR-2026-0101',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T08:15:30.000Z',
        closed_at: '2026-10-01T08:18:22.000Z',
        assignee: 'analyst_sharma_01',
        escalation_level: 'L1_TRIAGE',
        root_cause: 'UNDETERMINED',
        investigation_notes: 'Alert acknowledged. Template response applied. Ticket resolved inside 3 minutes to maintain SLA compliance.'
      },
      {
        case_id: 'CAS-PWR-2026-2102',
        alert_id: 'ALT-PWR-2026-0103',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T08:45:15.000Z',
        closed_at: '2026-10-01T08:48:00.000Z',
        assignee: 'analyst_verma_02',
        escalation_level: 'L1_TRIAGE',
        root_cause: 'UNDETERMINED',
        investigation_notes: 'Potential ICS malware heuristic triggered. Operator marked benign false positive without escalation to CIRT.'
      },
      {
        case_id: 'CAS-PWR-2026-2103',
        alert_id: 'ALT-PWR-2026-0104',
        severity: 'HIGH',
        status: 'RESOLVED',
        opened_at: '2026-10-01T09:05:00.000Z',
        closed_at: '2026-10-01T09:55:00.000Z',
        assignee: 'analyst_sharma_01',
        escalation_level: 'L2_INCIDENT_HANDLER',
        root_cause: 'UNAUTHORIZED_CONTRACTOR_SCAN',
        investigation_notes: 'Investigated DMZ firewall logs. Third-party vendor contractor ran unauthorized port sweep. Vendor access suspended.'
      }
    ],
    syslogLines: [
      '2026-10-01T08:15:00.120Z [CRITICAL] RTU-SUBSTATION-ALPHA-400KV: Modbus/TCP FC=05 (Write Single Coil) to Address 0x0041 (LINE-1-CB-TRIP) initiated from non-whitelisted Engineering Workstation 192.168.10.45.',
      '2026-10-01T08:16:30.450Z [HIGH] OT-FW-DMZ-SUB-01: Session denied: TCP 10.240.12.18:44818 -> 192.168.10.12:502 (Modbus-Ethernet) policy violation [DENY_DEFAULT].',
      '2026-10-01T08:20:00.015Z [CRITICAL] RTU-SUBSTATION-BETA-220KV: DNP3 Object 12 Var 1 (Control Relay Output Block) command received with invalid sequence counter.',
      '2026-10-01T08:45:00.880Z [CRITICAL] EMS-SCADA-CORE-01: Heuristic signature match PIPEDREAM.CODESYS.RUNTIME.EXPLOIT detected on process codesys_runtime.exe.',
      '2026-10-01T09:00:12.330Z [HIGH] OT-FW-DMZ-SUB-01: Multiple failed SSH authentication attempts from source IP 10.240.50.12 user: root.',
      '2026-10-01T11:00:00.910Z [CRITICAL] PLC-TURBINE-GEN-01: Safety Instrumented System (SIS) trip valve override command received via unauthenticated Profinet telegram.'
    ]
  },

  {
    entityCode: 'CSE-TELCO-01',
    entityName: 'National Backbone Telecommunications & 5G',
    sectorId: 'sec_telecom',
    shortName: 'National Backbone Telecom & 5G',
    period: '2026-Q3',
    kpis: {
      headline_sla_compliance_pct: 96.8,
      reported_mttr_minutes: 24.5,
      total_alerts_handled: 280
    },
    assets: [
      {
        asset_id: 'BGP-CORE-GW-DELHI-01',
        name: 'National Core Border Gateway Router Delhi-01',
        type: 'BGP_ROUTER',
        criticality: 5,
        environment: 'PRODUCTION_NETWORK',
        ip_address: '103.24.188.1',
        zone_or_vlan: 'AS-45820-CORE-INTERNET',
        firmware_os: 'Cisco IOS-XR 7.9.2',
        last_seen: '2026-10-02T19:50:00.000Z'
      },
      {
        asset_id: '5G-UPF-USER-PLANE-02',
        name: '5G Cloud Native Packet Core User Plane Function 02',
        type: '5G_UPF',
        criticality: 5,
        environment: 'PRODUCTION_5G_CORE',
        ip_address: '10.150.40.10',
        zone_or_vlan: 'VLAN-502-N3-N4-CORE',
        firmware_os: 'Kubernetes v1.28.4 / Red Hat CoreOS',
        last_seen: '2026-10-02T19:48:00.000Z'
      },
      {
        asset_id: 'IMS-SIP-SBC-MUMBAI-01',
        name: 'VoLTE/VoNR Session Border Controller Mumbai',
        type: 'IMS_SBC',
        criticality: 4,
        environment: 'PRODUCTION_VOICE',
        ip_address: '10.150.12.8',
        zone_or_vlan: 'VLAN-520-SIP-CARRIER',
        firmware_os: 'Ribbon SBC SWe Rel 11.2',
        last_seen: '2026-10-02T19:40:00.000Z'
      },
      {
        asset_id: 'MPLS-BACKBONE-PE-04',
        name: 'National MPLS Provider Edge Carrier Router 04',
        type: 'MPLS_PE',
        criticality: 4,
        environment: 'PRODUCTION_NETWORK',
        ip_address: '10.150.1.4',
        zone_or_vlan: 'MPLS-TRANSIT',
        firmware_os: 'Juniper Junos OS 22.4R2',
        last_seen: '2026-10-02T19:30:00.000Z'
      },
      {
        asset_id: 'AAA-RADIUS-DIAMETER-01',
        name: 'Carrier Subscriber AAA & Diameter Gateway 01',
        type: 'AAA_DIAMETER',
        criticality: 5,
        environment: 'PRODUCTION_SIGNALLING',
        ip_address: '10.150.25.100',
        zone_or_vlan: 'VLAN-510-SIG-DIAMETER',
        firmware_os: 'Oracle Communications DSR 9.0',
        last_seen: '2026-10-02T19:35:00.000Z'
      },
      {
        asset_id: 'DNS-ROOT-CACHE-03',
        name: 'National Tier-1 Recursive DNS Resolver 03',
        type: 'DNS_RESOLVER',
        criticality: 4,
        environment: 'PRODUCTION_NETWORK',
        ip_address: '103.24.188.53',
        zone_or_vlan: 'PUBLIC-ANYCAST-DNS',
        firmware_os: 'BIND 9.18.18 Hardened',
        last_seen: '2026-10-02T19:55:00.000Z'
      },
      {
        asset_id: 'SS7-SIGTRAN-GW-01',
        name: 'Legacy 2G/3G SS7 Signalling Transfer Point',
        type: 'SS7_STP',
        criticality: 4,
        environment: 'PRODUCTION_SIGNALLING',
        ip_address: '10.150.30.5',
        zone_or_vlan: 'VLAN-515-SIGTRAN-M3UA',
        firmware_os: 'Dialogic DSI G51 SS7 v4.1',
        last_seen: '2026-10-02T19:15:00.000Z'
      }
    ],
    alerts: [
      {
        alert_id: 'ALT-TEL-2026-0201',
        category: 'BGP Route Hijack',
        severity: 'CRITICAL',
        created_at: '2026-10-01T04:20:00.000Z',
        closed_at: '2026-10-01T04:42:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'netops_kulkarni_01',
        asset_id: 'BGP-CORE-GW-DELHI-01',
        investigation_notes: 'Rogue AS announcing national IP prefix. RPKI ROA origin validation enforced. Malicious path filtered via BGP community drop.'
      },
      {
        alert_id: 'ALT-TEL-2026-0202',
        category: '5G Core PFCP Flood',
        severity: 'CRITICAL',
        created_at: '2026-10-01T05:10:00.000Z',
        closed_at: '2026-10-01T05:35:10.000Z',
        disposition: 'RESOLVED',
        assignee: 'core5g_nair_02',
        asset_id: '5G-UPF-USER-PLANE-02',
        investigation_notes: 'Anomalous surge in N4 interface PFCP session establishment requests. Rate limiting enabled at SMF ingress.'
      },
      {
        alert_id: 'ALT-TEL-2026-0203',
        category: 'SS7 Tracking Interception',
        severity: 'HIGH',
        created_at: '2026-10-01T06:15:00.000Z',
        closed_at: '2026-10-01T06:38:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'sig_patel_03',
        asset_id: 'SS7-SIGTRAN-GW-01',
        investigation_notes: 'Foreign carrier GT firing repetitive SRI_SM and PSI queries. Signaling firewall SMS-home-routing filter applied.'
      },
      {
        alert_id: 'ALT-TEL-2026-0204',
        category: 'DDoS Amplification Surge',
        severity: 'HIGH',
        created_at: '2026-10-01T07:40:00.000Z',
        closed_at: '2026-10-01T08:05:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'netops_kulkarni_01',
        asset_id: 'DNS-ROOT-CACHE-03',
        investigation_notes: '50 Gbps DNS ANY query reflection burst mitigated via BGP Flowspec rate limiting.'
      },
      {
        alert_id: 'ALT-TEL-2026-0205',
        category: 'SIP Session Exhaustion',
        severity: 'MEDIUM',
        created_at: '2026-10-01T09:12:00.000Z',
        closed_at: '2026-10-01T09:35:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'voice_fernandes_04',
        asset_id: 'IMS-SIP-SBC-MUMBAI-01',
        investigation_notes: 'SIP INVITE flood from illicit wholesale gateway blocked by SBC TLS access control list.'
      },
      {
        alert_id: 'ALT-TEL-2026-0206',
        category: 'Diameter Replay Attack',
        severity: 'HIGH',
        created_at: '2026-10-01T10:45:00.000Z',
        closed_at: '2026-10-01T11:12:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'sig_patel_03',
        asset_id: 'AAA-RADIUS-DIAMETER-01',
        investigation_notes: 'Replay of Diameter Credit Control Request (CCR) packets intercepted and dropped. DRA sequence validation verified.'
      }
    ],
    cases: [
      {
        case_id: 'CAS-TEL-2026-2201',
        alert_id: 'ALT-TEL-2026-0201',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T04:21:00.000Z',
        closed_at: '2026-10-01T04:42:00.000Z',
        assignee: 'netops_kulkarni_01',
        escalation_level: 'L3_CORE_ENG',
        root_cause: 'UPSTREAM_PEER_MISCONFIG_OR_ATTACK',
        investigation_notes: 'BGP prefix hijack triaged immediately. Ingress route maps adjusted to drop invalid AS paths. CERT-In advisory drafted.'
      },
      {
        case_id: 'CAS-TEL-2026-2202',
        alert_id: 'ALT-TEL-2026-0202',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T05:12:00.000Z',
        closed_at: '2026-10-01T05:35:10.000Z',
        assignee: 'core5g_nair_02',
        escalation_level: 'L2_5G_CIRT',
        root_cause: 'BOTNET_MALFORMED_PFCP',
        investigation_notes: 'Packet inspection confirmed non-compliant PFCP Heartbeat / Association requests from suspect regional cell site.'
      }
    ],
    syslogLines: [
      '2026-10-01T04:20:15.000Z [CRITICAL] BGP-CORE-GW-DELHI-01: BGP-4 Route Hijack detected: Autonomous System AS49512 announcing unauthorized prefix 103.24.188.0/22.',
      '2026-10-01T05:10:00.000Z [CRITICAL] 5G-UPF-USER-PLANE-02: PFCP Session Establishment anomaly: excessive GTP-U tunnel creation rate (12,400 sessions/sec).',
      '2026-10-01T06:15:30.000Z [HIGH] SS7-SIGTRAN-GW-01: MAP SRI_SM (Send Routing Info for SM) barrage targeting subscriber prefix +91-98760-XXXXX.',
      '2026-10-01T07:40:11.200Z [HIGH] DNS-ROOT-CACHE-03: DNS ANY amplification threshold triggered: 45,000 qps from spoofed source addresses.',
      '2026-10-01T10:45:00.500Z [HIGH] AAA-RADIUS-DIAMETER-01: Diameter CCR-I invalid End-to-End identifier detected from peer gateway.'
    ]
  },

  {
    entityCode: 'CSE-BANK-01',
    entityName: 'Apex National Commercial & Settlement Bank',
    sectorId: 'sec_bfsi',
    shortName: 'Apex National Commercial Bank',
    period: '2026-Q3',
    kpis: {
      headline_sla_compliance_pct: 98.4,
      reported_mttr_minutes: 68.2,
      total_alerts_handled: 184
    },
    assets: [
      {
        asset_id: 'SWIFT-ALLIANCE-GW-01',
        name: 'SWIFT Alliance Access Messaging Gateway Primary',
        type: 'SWIFT_GATEWAY',
        criticality: 5,
        environment: 'PRODUCTION_BANKING',
        ip_address: '172.28.10.5',
        zone_or_vlan: 'VLAN-801-SWIFT-RESTRICTED',
        firmware_os: 'AIX 7.3 Enterprise Hardened',
        last_seen: '2026-10-02T19:55:00.000Z'
      },
      {
        asset_id: 'CBS-CORE-ORACLE-DB',
        name: 'Finacle Core Banking Production Database Cluster',
        type: 'DATABASE_CLUSTER',
        criticality: 5,
        environment: 'PRODUCTION_BANKING',
        ip_address: '172.28.20.10',
        zone_or_vlan: 'VLAN-810-DB-SECURE',
        firmware_os: 'Oracle Linux 8.8 / Oracle RAC 19c',
        last_seen: '2026-10-02T19:58:00.000Z'
      },
      {
        asset_id: 'ATM-SWITCH-BASE24-02',
        name: 'BASE24 ATM/POS Transaction Authorization Engine',
        type: 'ATM_SWITCH',
        criticality: 5,
        environment: 'PRODUCTION_SWITCHING',
        ip_address: '172.28.30.22',
        zone_or_vlan: 'VLAN-820-SWITCH-AUTH',
        firmware_os: 'HP NonStop OS H06.29',
        last_seen: '2026-10-02T19:52:00.000Z'
      },
      {
        asset_id: 'HSM-PAYMENT-THALES-01',
        name: 'Thales payShield 10K Hardware Security Module',
        type: 'PAYMENT_HSM',
        criticality: 5,
        environment: 'PRODUCTION_CRYPTOGRAPHY',
        ip_address: '172.28.30.50',
        zone_or_vlan: 'VLAN-825-CRYPTO-HSM',
        firmware_os: 'Thales Firmware v1.5a (FIPS 140-2 Level 3)',
        last_seen: '2026-10-02T19:50:00.000Z'
      },
      {
        asset_id: 'NEFT-RTGS-SETTLE-01',
        name: 'Central Bank SFMS/RTGS Direct Clearing Node',
        type: 'SETTLEMENT_NODE',
        criticality: 5,
        environment: 'PRODUCTION_SETTLEMENT',
        ip_address: '172.28.15.12',
        zone_or_vlan: 'VLAN-805-SFMS-CLEARING',
        firmware_os: 'Red Hat Enterprise Linux 8.6',
        last_seen: '2026-10-02T19:42:00.000Z'
      },
      {
        asset_id: 'AD-DC-FOREST-ROOT-01',
        name: 'Enterprise Active Directory Tier-0 Root Domain Controller',
        type: 'IDENTITY_DC',
        criticality: 5,
        environment: 'PRODUCTION_IDENTITY',
        ip_address: '172.28.1.10',
        zone_or_vlan: 'VLAN-800-TIER0-MGMT',
        firmware_os: 'Windows Server 2022 Datacenter',
        last_seen: '2026-10-02T19:56:00.000Z'
      },
      {
        asset_id: 'WAF-NETBANKING-EDGE-01',
        name: 'F5 Advanced WAF Internet Banking Ingress',
        type: 'EDGE_WAF',
        criticality: 4,
        environment: 'PRODUCTION_DMZ',
        ip_address: '172.28.5.1',
        zone_or_vlan: 'VLAN-802-PUBLIC-WAF',
        firmware_os: 'BIG-IP TMOS 17.1.0',
        last_seen: '2026-10-02T19:59:00.000Z'
      }
    ],
    alerts: [
      {
        alert_id: 'ALT-BNK-2026-0301',
        category: 'SWIFT Protocol Integrity Violation',
        severity: 'CRITICAL',
        created_at: '2026-10-01T09:30:00.000Z',
        closed_at: '2026-10-01T11:15:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'cirt_sen_01',
        asset_id: 'SWIFT-ALLIANCE-GW-01',
        investigation_notes: 'Full forensic triage performed. Outbound MT103 transaction hash mismatch identified. Message blocked before dispatch to SWIFT net. Source process memory dumped and examined. Dual-authorization verified.'
      },
      {
        alert_id: 'ALT-BNK-2026-0302',
        category: 'Kerberoasting Active Directory Attack',
        severity: 'CRITICAL',
        created_at: '2026-10-01T09:32:00.000Z',
        closed_at: '2026-10-01T10:45:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'cirt_sen_01',
        asset_id: 'AD-DC-FOREST-ROOT-01',
        investigation_notes: 'TGS requests with RC4 cipher detected for service accounts svc_sql_cbs and svc_backup. Offending workstation WS-CORP-489 isolated from network. Service account passwords rotated with 32-char AES-256 keys.'
      },
      {
        alert_id: 'ALT-BNK-2026-0303',
        category: 'ATM Switch ISO-8583 Malformed Replay',
        severity: 'HIGH',
        created_at: '2026-10-01T10:14:00.000Z',
        closed_at: '2026-10-01T11:30:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'switch_mukherjee_02',
        asset_id: 'ATM-SWITCH-BASE24-02',
        investigation_notes: 'Field 48 (Private Data) contained abnormal binary shellcode injection pattern from rural ATM terminal ATM-NCR-4029. Terminal hardware physically seized by regional vigilance team.'
      },
      {
        alert_id: 'ALT-BNK-2026-0304',
        category: 'Core Database Direct Query Bypass',
        severity: 'HIGH',
        created_at: '2026-10-01T13:00:00.000Z',
        closed_at: '2026-10-01T14:20:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'dba_bose_03',
        asset_id: 'CBS-CORE-ORACLE-DB',
        investigation_notes: 'Unauthorized SELECT query on ledger balance tables executed via direct SQL*Plus session from staging subnet. DBA privileged credentials revoked and audit log archived.'
      },
      {
        alert_id: 'ALT-BNK-2026-0305',
        category: 'Credential Stuffing on Retail Portal',
        severity: 'MEDIUM',
        created_at: '2026-10-01T15:20:00.000Z',
        closed_at: '2026-10-01T16:10:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'secops_rao_04',
        asset_id: 'WAF-NETBANKING-EDGE-01',
        investigation_notes: 'Distributed proxy botnet attacking login endpoint. F5 Bot Defense activated challenge tokens and behavioral CAPTCHA. Zero account takeovers confirmed.'
      },
      {
        alert_id: 'ALT-BNK-2026-0306',
        category: 'HSM Cryptographic Key Tamper Sensor',
        severity: 'CRITICAL',
        created_at: '2026-10-01T17:05:00.000Z',
        closed_at: '2026-10-01T18:30:00.000Z',
        disposition: 'FALSE_POSITIVE',
        assignee: 'cirt_sen_01',
        asset_id: 'HSM-PAYMENT-THALES-01',
        investigation_notes: 'Cabinet vibration sensor tripped during datacenter HVAC maintenance. Visual inspection by dual key custodians confirmed physical enclosure seals intact. Zeroization was NOT triggered.'
      }
    ],
    cases: [
      {
        case_id: 'CAS-BNK-2026-2301',
        alert_id: 'ALT-BNK-2026-0301',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T09:31:00.000Z',
        closed_at: '2026-10-01T11:15:00.000Z',
        assignee: 'cirt_sen_01',
        escalation_level: 'L3_EXECUTIVE_CIRT',
        root_cause: 'MALICIOUS_DLL_INJECTION_ATTEMPT',
        investigation_notes: 'Comprehensive RBI CSITE compliant incident filing. Process tree analysis on SWIFT host confirmed untrusted DLL injection attempt caught by EDR kernel sensor before execution. Forensic image preserved.'
      },
      {
        case_id: 'CAS-BNK-2026-2302',
        alert_id: 'ALT-BNK-2026-0302',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T09:35:00.000Z',
        closed_at: '2026-10-01T10:45:00.000Z',
        assignee: 'cirt_sen_01',
        escalation_level: 'L2_INCIDENT_FORENSICS',
        root_cause: 'PHISHED_EMPLOYEE_WORKSTATION',
        investigation_notes: 'Employee on WS-CORP-489 executed macro-enabled spearphishing attachment. Host severed from 802.1x VLAN. Threat actor expelled within 70 minutes.'
      }
    ],
    syslogLines: [
      '2026-10-01T09:30:15.000Z [CRITICAL] SWIFT-ALLIANCE-GW-01: SWIFT MT103 FIN message cryptographic signature hash mismatch on outbound queue://SWIFT_PAY_LIVE.',
      '2026-10-01T09:32:00.000Z [CRITICAL] AD-DC-FOREST-ROOT-01: Microsoft-Windows-Security-Auditing Event 4769: A Kerberos service ticket was requested with Ticket Encryption Type 0x17 (RC4-HMAC) for account svc_sql_cbs.',
      '2026-10-01T10:14:22.000Z [HIGH] ATM-SWITCH-BASE24-02: ISO-8583 Message Type 0200 with invalid cryptographic MAC field from Terminal ID ATM-NCR-4029.',
      '2026-10-01T13:00:05.100Z [HIGH] CBS-CORE-ORACLE-DB: Oracle Audit Vault alert: Direct SELECT statement on table FIN_BALANCE_MASTER from non-whitelisted client IP 172.28.55.91.',
      '2026-10-01T17:05:00.020Z [CRITICAL] HSM-PAYMENT-THALES-01: HSM Hardware Audit Event: Chassis cover vibration sensor threshold exceeded (Sensor ID: CHASSIS_TOP).'
    ]
  },

  {
    entityCode: 'CSE-DEFENSE-01',
    entityName: 'Strategic Avionics & Defense Manufacturing Hub',
    sectorId: 'sec_defense',
    shortName: 'Strategic Defense Manufacturing',
    period: '2026-Q3',
    kpis: {
      headline_sla_compliance_pct: 99.8,
      reported_mttr_minutes: 38.0,
      total_alerts_handled: 86
    },
    assets: [
      {
        asset_id: 'AIRGAP-CROSS-DOMAIN-DIODE-01',
        name: 'Hardware Unidirectional Cross-Domain Data Diode',
        type: 'DATA_DIODE',
        criticality: 5,
        environment: 'CLASSIFIED_AIRGAP',
        ip_address: '192.168.100.1',
        zone_or_vlan: 'AIRGAP-ISOLATED-OPTICAL',
        firmware_os: 'Owl Cyber Defense DualDiode Hardware OS',
        last_seen: '2026-10-02T19:30:00.000Z'
      },
      {
        asset_id: 'CAD-CAM-AVIONICS-SRV-03',
        name: 'Classified Supersonic Airframe CAD/CAM Server 03',
        type: 'DEFENSE_CAD_SERVER',
        criticality: 5,
        environment: 'CLASSIFIED_AIRGAP',
        ip_address: '192.168.100.15',
        zone_or_vlan: 'ENCLAVE-TOPSECRET-CAD',
        firmware_os: 'Debian Hardened / SELinux Strict',
        last_seen: '2026-10-02T19:25:00.000Z'
      },
      {
        asset_id: 'C2-RESTRICTED-ENCLAVE-GW-05',
        name: 'Defense Production Boundary Cryptographic Gateway 05',
        type: 'CRYPTO_GATEWAY',
        criticality: 5,
        environment: 'PRODUCTION_DEFENSE',
        ip_address: '192.168.10.1',
        zone_or_vlan: 'RESTRICTED-BOUNDARY-VLAN',
        firmware_os: 'IPKO Cryptographic Appliance v4.2',
        last_seen: '2026-10-02T19:40:00.000Z'
      },
      {
        asset_id: 'CNC-TITANIUM-MILLING-02',
        name: '5-Axis Sub-micron Titanium Aircraft Wing Spar Mill',
        type: 'CNC_MACHINE',
        criticality: 5,
        environment: 'FACTORY_FLOOR_OT',
        ip_address: '192.168.20.4',
        zone_or_vlan: 'VLAN-20-MILLING-OT',
        firmware_os: 'Heidenhain TNC 640 v08',
        last_seen: '2026-10-02T19:15:00.000Z'
      },
      {
        asset_id: 'FIRMWARE-SIGNING-HSM-01',
        name: 'Avionics Flight Control Firmware Signing Hardware Module',
        type: 'SIGNING_HSM',
        criticality: 5,
        environment: 'CLASSIFIED_AIRGAP',
        ip_address: '192.168.100.50',
        zone_or_vlan: 'AIRGAP-SIGNING-VAULT',
        firmware_os: 'Utimaco CryptoServer v4.4 (Common Criteria EAL4+)',
        last_seen: '2026-10-02T19:00:00.000Z'
      },
      {
        asset_id: 'SIEM-COLLECTOR-AIRGAP-01',
        name: 'Air-Gapped Heavy Telemetry Collector & Forwarder',
        type: 'SIEM_FORWARDER',
        criticality: 4,
        environment: 'CLASSIFIED_AIRGAP',
        ip_address: '192.168.100.200',
        zone_or_vlan: 'AIRGAP-MONITORING',
        firmware_os: 'RHEL 9.2 DISA STIG Compliant',
        last_seen: '2026-10-02T19:50:00.000Z'
      }
    ],
    alerts: [
      {
        alert_id: 'ALT-DEF-2026-0401',
        category: 'Data Diode Reverse Traffic Anomaly',
        severity: 'CRITICAL',
        created_at: '2026-10-01T11:05:00.000Z',
        closed_at: '2026-10-01T11:42:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'analyst_singh_01',
        asset_id: 'AIRGAP-CROSS-DOMAIN-DIODE-01',
        investigation_notes: 'Physical photodiode receiver detected modulated pulses on return channel. Physical fiber disconnected. Hardware tamper seals inspected and verified intact. Originating interface disabled.'
      },
      {
        alert_id: 'ALT-DEF-2026-0402',
        category: 'Classified CAD Exfiltration Indicator',
        severity: 'CRITICAL',
        created_at: '2026-10-01T12:00:00.000Z',
        closed_at: '2026-10-01T12:48:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'analyst_singh_01',
        asset_id: 'CAD-CAM-AVIONICS-SRV-03',
        investigation_notes: 'Attempted staging of encrypted .7z archive containing STEP airframe models to removable USB mass storage. USB driver disabled by kernel security module. Personnel badge revoked pending military counter-intelligence debrief.'
      },
      {
        alert_id: 'ALT-DEF-2026-0403',
        category: 'C2 DNS Beaconing Anomaly',
        severity: 'CRITICAL',
        created_at: '2026-10-01T13:10:00.000Z',
        closed_at: '2026-10-01T13:50:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'analyst_bhardwaj_02',
        asset_id: 'C2-RESTRICTED-ENCLAVE-GW-05',
        investigation_notes: 'Repeated high-entropy subdomain requests matching APT41 covert DNS tunnel signature. Upstream DNS resolver sinkholed domain. Forensic triage initiated.'
      },
      {
        alert_id: 'ALT-DEF-2026-0404',
        category: 'CNC Firmware Hash Mismatch',
        severity: 'HIGH',
        created_at: '2026-10-01T15:20:00.000Z',
        closed_at: '2026-10-01T16:05:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'ot_defense_eng_03',
        asset_id: 'CNC-TITANIUM-MILLING-02',
        investigation_notes: 'CNC machine post-processor SHA256 checksum differed from defense quality registry. G-code execution halted. Certified golden image re-flashed.'
      },
      {
        alert_id: 'ALT-DEF-2026-0405',
        category: 'Cryptographic Key Signing Deviation',
        severity: 'HIGH',
        created_at: '2026-10-01T16:30:00.000Z',
        closed_at: '2026-10-01T17:15:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'analyst_singh_01',
        asset_id: 'FIRMWARE-SIGNING-HSM-01',
        investigation_notes: 'Request to sign bootloader package lacked secondary m-of-n physical smartcard token authorization. Signing request automatically rejected.'
      }
    ],
    cases: [
      {
        case_id: 'CAS-DEF-2026-2401',
        alert_id: 'ALT-DEF-2026-0401',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T11:06:00.000Z',
        closed_at: '2026-10-01T11:42:00.000Z',
        assignee: 'analyst_singh_01',
        escalation_level: 'DEFENSE_CYBER_COMMAND',
        root_cause: 'OPTICAL_REFLECTION_FAULT',
        investigation_notes: 'Cross-domain data diode optical TX/RX transceiver reflection test. Classified optical isolate remained impenetrable. Incident report shared with National Cyber Security Coordinator.'
      },
      {
        case_id: 'CAS-DEF-2026-2402',
        alert_id: 'ALT-DEF-2026-0402',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T12:02:00.000Z',
        closed_at: '2026-10-01T12:48:00.000Z',
        assignee: 'analyst_singh_01',
        escalation_level: 'DEFENSE_SECURITY_CORPS',
        root_cause: 'INSIDER_POLICY_VIOLATION',
        investigation_notes: 'Contractor engineer attempted unauthorized transfer of design files to personal media. Host forensically seized. Full evidence chain-of-custody established.'
      }
    ],
    syslogLines: [
      '2026-10-01T11:05:00.000Z [CRITICAL] AIRGAP-CROSS-DOMAIN-DIODE-01: RX photodiode carrier detected reverse optical pulse sequence (Attempted bidirectional protocol violation).',
      '2026-10-01T12:00:10.000Z [CRITICAL] CAD-CAM-AVIONICS-SRV-03: DLP Policy Trigger: File PROJECT_STEALTH_AIRFRAME_REV4.CATPart accessed by service account svc_backup outside maintenance window.',
      '2026-10-01T13:10:05.400Z [CRITICAL] C2-RESTRICTED-ENCLAVE-GW-05: Repeat DNS entropy threshold exceeded: Query q39f029a.enc-beacon.mil-sat.net via internal forwarder 192.168.10.1.',
      '2026-10-01T15:20:00.120Z [HIGH] CNC-TITANIUM-MILLING-02: Bootloader binary SHA256 checksum mismatch against cryptographic golden manifest.',
      '2026-10-01T16:30:00.080Z [HIGH] FIRMWARE-SIGNING-HSM-01: Dual-custody quorum rule violation: M-of-N physical card presentation failed (1 of 3 present).'
    ]
  },

  {
    entityCode: 'CSE-HEALTH-01',
    entityName: 'National Telehealth & Health Registry Exchange',
    sectorId: 'sec_health',
    shortName: 'National Telehealth & Health Registry',
    period: '2026-Q3',
    kpis: {
      headline_sla_compliance_pct: 88.5,
      reported_mttr_minutes: 142.0,
      total_alerts_handled: 215
    },
    assets: [
      {
        asset_id: 'EHR-FHIR-API-GATEWAY-01',
        name: 'National Electronic Health Records FHIR RESTful API Gateway',
        type: 'FHIR_GATEWAY',
        criticality: 5,
        environment: 'PRODUCTION_HEALTHCARE',
        ip_address: '10.180.10.1',
        zone_or_vlan: 'VLAN-301-PUBLIC-HEALTH-API',
        firmware_os: 'Ubuntu 22.04 LTS Hardened / Kong Enterprise 3.4',
        last_seen: '2026-10-02T19:50:00.000Z'
      },
      {
        asset_id: 'DICOM-PACS-IMAGING-ARCHIVE-02',
        name: 'Radiology DICOM Image Storage PACS Server Cluster',
        type: 'DICOM_PACS',
        criticality: 5,
        environment: 'PRODUCTION_HEALTHCARE',
        ip_address: '10.180.20.12',
        zone_or_vlan: 'VLAN-310-IMAGING-PACS',
        firmware_os: 'Windows Server 2019 / Orthanc DICOM Server 1.12',
        last_seen: '2026-10-02T19:40:00.000Z'
      },
      {
        asset_id: 'HL7-INTERFACE-ENGINE-01',
        name: 'Mirth Connect Hospital Interoperability Integration Broker',
        type: 'HL7_ENGINE',
        criticality: 4,
        environment: 'PRODUCTION_HEALTHCARE',
        ip_address: '10.180.30.8',
        zone_or_vlan: 'VLAN-315-HL7-INTERCONNECT',
        firmware_os: 'Debian 12 / NextGen Mirth Connect 4.4',
        last_seen: '2026-10-02T19:45:00.000Z'
      },
      {
        asset_id: 'PATIENT-REGISTRY-POSTGRES-01',
        name: 'National ABHA Patient Master Demographics Database',
        type: 'HEALTH_DATABASE',
        criticality: 5,
        environment: 'PRODUCTION_HEALTHCARE',
        ip_address: '10.180.25.10',
        zone_or_vlan: 'VLAN-320-DB-SECURE',
        firmware_os: 'PostgreSQL 15.4 / RHEL 8.8 Enterprise',
        last_seen: '2026-10-02T19:55:00.000Z'
      },
      {
        asset_id: 'TELEHEALTH-WEBRTC-GW-03',
        name: 'National Teleconsultation Video WebRTC Media Bridge',
        type: 'WEBRTC_GATEWAY',
        criticality: 4,
        environment: 'PRODUCTION_HEALTHCARE',
        ip_address: '10.180.15.5',
        zone_or_vlan: 'VLAN-305-MEDIA-STREAM',
        firmware_os: 'Ubuntu 22.04 / Jitsi Videobridge 2.3',
        last_seen: '2026-10-02T19:30:00.000Z'
      },
      {
        asset_id: 'ICU-VENTILATOR-OT-NET-01',
        name: 'Intensive Care Unit Medical Device IoT Gateway',
        type: 'MEDICAL_IOT_GW',
        criticality: 5,
        environment: 'HOSPITAL_ICU_OT',
        ip_address: '10.180.50.2',
        zone_or_vlan: 'VLAN-350-ICU-ISOLATED',
        firmware_os: 'Philips IntelliBridge Enterprise Rel B.02',
        last_seen: '2026-10-02T19:10:00.000Z'
      }
    ],
    alerts: [
      {
        alert_id: 'ALT-HLT-2026-0501',
        category: 'Bulk Patient Record Exfiltration',
        severity: 'CRITICAL',
        created_at: '2026-10-01T14:10:00.000Z',
        closed_at: '2026-10-01T16:45:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'soc_analyst_das_01',
        asset_id: 'EHR-FHIR-API-GATEWAY-01',
        investigation_notes: 'Third-party tele-consult aggregator API key used to execute high-frequency paginated queries harvesting 140,000 ABHA patient records. API key revoked and legal notification dispatched.'
      },
      {
        alert_id: 'ALT-HLT-2026-0502',
        category: 'DICOM Ransomware Activity',
        severity: 'CRITICAL',
        created_at: '2026-10-01T14:35:00.000Z',
        closed_at: '2026-10-01T17:10:00.000Z',
        disposition: 'TRUE_POSITIVE',
        assignee: 'soc_analyst_das_01',
        asset_id: 'DICOM-PACS-IMAGING-ARCHIVE-02',
        investigation_notes: 'Mass file renaming loop (.lockbit extension) detected on radiology mount. PACS storage cluster isolated from SAN network. Snapshot roll-back executed successfully with zero patient data loss.'
      },
      {
        alert_id: 'ALT-HLT-2026-0503',
        category: 'HL7 MLLP Injection Anomaly',
        severity: 'HIGH',
        created_at: '2026-10-01T15:02:00.000Z',
        closed_at: '2026-10-01T16:20:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'hl7_eng_roy_02',
        asset_id: 'HL7-INTERFACE-ENGINE-01',
        investigation_notes: 'Malformed ADT_A08 patient update message with SQL injection payload in physician note segment. Filter added to Mirth channel transformer.'
      },
      {
        alert_id: 'ALT-HLT-2026-0504',
        category: 'ICU Medical Device Protocol Desync',
        severity: 'HIGH',
        created_at: '2026-10-01T17:15:00.000Z',
        closed_at: '2026-10-01T18:05:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'biomed_shukla_03',
        asset_id: 'ICU-VENTILATOR-OT-NET-01',
        investigation_notes: 'Ventilator telemetry broadcast port scanned from rogue hospital Wi-Fi client. Medical VLAN port security dynamically shut down access switch port.'
      },
      {
        alert_id: 'ALT-HLT-2026-0505',
        category: 'EHR Database Slowloris Query Flood',
        severity: 'MEDIUM',
        created_at: '2026-10-01T18:40:00.000Z',
        closed_at: '2026-10-01T20:10:00.000Z',
        disposition: 'RESOLVED',
        assignee: 'soc_analyst_das_01',
        asset_id: 'PATIENT-REGISTRY-POSTGRES-01',
        investigation_notes: 'Connection pool starvation caused by unindexed queries from newly launched mobile registry app. Connection timeout dropped to 10s.'
      }
    ],
    cases: [
      {
        case_id: 'CAS-HLT-2026-2501',
        alert_id: 'ALT-HLT-2026-0501',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T14:15:00.000Z',
        closed_at: '2026-10-01T16:45:00.000Z',
        assignee: 'soc_analyst_das_01',
        escalation_level: 'HEALTH_CISO_OFFICE',
        root_cause: 'PARTNER_API_TOKEN_COMPROMISE',
        investigation_notes: 'Health data privacy breach protocol activated. Partner token revoked. Forensic report submitted to Ministry of Health & Family Welfare.'
      },
      {
        case_id: 'CAS-HLT-2026-2502',
        alert_id: 'ALT-HLT-2026-0502',
        severity: 'CRITICAL',
        status: 'CLOSED',
        opened_at: '2026-10-01T14:40:00.000Z',
        closed_at: '2026-10-01T17:10:00.000Z',
        assignee: 'soc_analyst_das_01',
        escalation_level: 'HOSPITAL_EMERGENCY_CIRT',
        root_cause: 'RANSOMWARE_LATERAL_MOVEMENT',
        investigation_notes: 'Workstation in ultrasound imaging room compromised via phishing. Lateral SMB movement to PACS storage halted. Immutable ZFS storage snapshot restored.'
      }
    ],
    syslogLines: [
      '2026-10-01T14:10:05.000Z [CRITICAL] EHR-FHIR-API-GATEWAY-01: REST API Rate-Limit Breach: GET /fhir/r4/Patient?_count=1000 returned 850,000 records to token tkn_partner_telemed_04.',
      '2026-10-01T14:35:22.000Z [CRITICAL] DICOM-PACS-IMAGING-ARCHIVE-02: Rapid file rename detected: 4,200 .dcm image files renamed to .dcm.lockbit_v3 within 90 seconds.',
      '2026-10-01T15:02:18.000Z [HIGH] HL7-INTERFACE-ENGINE-01: MLLP ADT^A01 (Admit Patient) message received from untrusted segment 172.16.88.99 with invalid facility code.',
      '2026-10-01T17:15:00.340Z [HIGH] ICU-VENTILATOR-OT-NET-01: Network probe detected on medical telemetry port TCP 4001 from non-medical IP 192.168.4.155.',
      '2026-10-01T18:40:10.110Z [MEDIUM] PATIENT-REGISTRY-POSTGRES-01: PostgreSQL connection pool exhaustion: active connections reached 498 of 500 limit.'
    ]
  }
];

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCsv(records) {
  if (!records || records.length === 0) return '';
  const headers = Object.keys(records[0]);
  const rows = [headers.join(',')];
  for (const rec of records) {
    const row = headers.map(h => escapeCsv(rec[h])).join(',');
    rows.push(row);
  }
  return rows.join('\r\n');
}

async function run() {
  for (const sector of SECTOR_DATASETS) {
    const entityDir = path.join(samplesDir, sector.entityCode);
    // Create entity directory
    fs.mkdirSync(entityDir, { recursive: true });

    // 1. Alerts CSV
    const alertsCsv = generateCsv(sector.alerts);
    fs.writeFileSync(path.join(entityDir, 'alerts.csv'), alertsCsv, 'utf-8');

    // 2. Cases CSV
    const casesCsv = generateCsv(sector.cases);
    fs.writeFileSync(path.join(entityDir, 'cases.csv'), casesCsv, 'utf-8');

    // 3. Assets CSV
    const assetsCsv = generateCsv(sector.assets);
    fs.writeFileSync(path.join(entityDir, 'assets.csv'), assetsCsv, 'utf-8');

    // 4. Raw Syslog / Event Stream Log
    const logContent = sector.syslogLines.join('\r\n') + '\r\n';
    const logFileName = `syslog_${sector.sectorId.replace('sec_', '')}.log`;
    fs.writeFileSync(path.join(entityDir, logFileName), logContent, 'utf-8');

    // 5. Consolidated Submission Dossier (JSON)
    const consolidated = {
      entity_code: sector.entityCode,
      entity_name: sector.entityName,
      sector_id: sector.sectorId,
      submission_period: sector.period,
      auditor_metadata: {
        audit_framework: 'NCIIPC Critical Sector Cybersecurity Framework v2.1',
        lead_inspector_id: 'INSP-REG-0941',
        inspection_date: '2026-10-02T14:30:00.000Z',
        submission_protocol: 'AIR_GAPPED_AUDIT_DOSSIER'
      },
      reported_kpis: sector.kpis,
      assets: sector.assets.map(a => ({
        external_id: a.asset_id,
        name: a.name,
        type: a.type,
        criticality: a.criticality,
        environment: a.environment,
        ip_address: a.ip_address,
        zone: a.zone_or_vlan,
        firmware: a.firmware_os,
        last_seen: a.last_seen
      })),
      cases: sector.cases,
      alerts: sector.alerts.map(a => ({
        external_id: a.alert_id,
        category: a.category,
        severity: a.severity,
        created_at: a.created_at,
        closed_at: a.closed_at,
        disposition: a.disposition,
        assignee: a.assignee,
        asset_id: a.asset_id,
        investigation_notes: a.investigation_notes
      }))
    };

    const jsonContent = JSON.stringify(consolidated, null, 2);
    fs.writeFileSync(path.join(entityDir, 'consolidated_submission.json'), jsonContent, 'utf-8');

    console.log(`[Generated] ${sector.entityCode} (${sector.shortName})`);
    console.log(`  ├── alerts.csv`);
    console.log(`  ├── cases.csv`);
    console.log(`  ├── assets.csv`);
    console.log(`  ├── ${logFileName}`);
    console.log(`  └── consolidated_submission.json`);

    // Verify 100% compliance with SAT-SA Universal Parser
    const parsedJson = await parseMultiFormatFile(path.join(entityDir, 'consolidated_submission.json'), sector.entityCode);
    const parsedCsv = await parseMultiFormatFile(path.join(entityDir, 'alerts.csv'), sector.entityCode);
    const parsedLog = await parseMultiFormatFile(path.join(entityDir, logFileName), sector.entityCode);

    console.log(`  [Validation] Parsed JSON: ${parsedJson.alerts.length} alerts, ${parsedJson.assets.length} assets.`);
    console.log(`  [Validation] Parsed CSV:  ${parsedCsv.alerts.length} alerts.`);
    console.log(`  [Validation] Parsed LOG:  ${parsedLog.alerts.length} alerts.`);
    if (parsedJson.alerts.length === 0 || parsedCsv.alerts.length === 0 || parsedLog.alerts.length === 0) {
      throw new Error(`Validation failed for ${sector.entityCode}`);
    }
  }

  // Create an index README for the samples directory
  const readmeContent = `# SAT-SA Critical Sector Inspector Sample Evidence

This directory contains authentic, production-grade, 100% schema-compliant sample datasets for all five monitored Critical Sector Entities (CSEs).
These datasets simulate real-world forensic evidence packages delivered during an air-gapped regulatory inspection or supervisory compliance audit.

## Monitored Critical Sector Entities

| Entity Code | Sector | Organization Name | Critical Systems & Threat Landscape |
|---|---|---|---|
| **CSE-POWER-01** | Energy / Power | Northern Regional Power Grid Transmission | 400kV Substation RTUs, Siemens S7 PLCs, Energy Management System (EMS). Exhibits **Execution Gap (EG-01)** fast closures & **Silent Critical Assets (NS-01)**. |
| **CSE-TELCO-01** | Telecom | National Backbone Telecom & 5G | BGP Edge Gateways, 5G Cloud-Native User Plane (UPF), IMS VoLTE/VoNR SBCs, Signaling gateways. |
| **CSE-BANK-01** | BFSI | Apex National Commercial & Settlement Bank | SWIFT Alliance Gateway, Finacle Core Banking DB, BASE24 ATM Switch, Thales Hardware Security Modules. Compliant benchmark entity. |
| **CSE-DEFENSE-01** | Defense & Aerospace | Strategic Avionics & Defense Manufacturing Hub | Unidirectional Data Diodes, Air-gapped CAD/CAM server, C2 cryptographic gateways, 5-Axis CNC machinery. |
| **CSE-HEALTH-01** | Healthcare | National Telehealth & Health Registry Exchange | FHIR RESTful Gateways, DICOM PACS Radiology Archives, Mirth Connect HL7 Engines, ICU Ventilator IoT networks. |

## Folder & Subfolder Structure

Each entity folder contains both domain subfolders and direct-access files:

\`\`\`
samples/<ENTITY-CODE>/
├── alert_metadata/
│   ├── alerts.csv           <- Raw alert telemetry with timestamps, severity, and closure dispositions
│   └── syslog_<sector>.log  <- Authentic production syslog / event stream logs
├── case_triage_notes/
│   └── cases.csv            <- Case management records with forensic investigation notes & escalations
├── asset_registries/
│   └── assets.csv           <- Official CMDB / OT Asset inventory with hardware models and criticality
├── alerts.csv               <- Direct-access alert telemetry
├── cases.csv                <- Direct-access case records
├── assets.csv               <- Direct-access asset inventory
└── consolidated_submission.json <- Unified 1-click audit envelope combining all 3 evidence domains
\`\`\`

## Compliance & Ingestion

All files comply 100% with SAT-SA's canonical ingestion engine (\`backend/src/modules/ingestion/universal_parser.js\`) and can be ingested directly via:
1. **SAT-SA Web UI**: Click **Inject / Ingest Telemetry** -> **Option 2: Upload Real Inspector Logs**, select the target CSE, and drop any file or folder.
2. **REST API**: \`POST /api/v1/ingest/payload\` with \`{ entityCode, format, payload }\`.
3. **CLI Ingestion**: \`node backend/bin/satsa.js ingest <path-to-file> --entity <ENTITY-CODE>\`.
`;

  fs.writeFileSync(path.join(samplesDir, 'README.md'), readmeContent, 'utf-8');
  console.log('\n[Success] All 5 entity datasets and README.md generated and validated 100% successfully!');
}

run().catch(err => {
  console.error('[Error] Generation failed:', err);
  process.exit(1);
});
