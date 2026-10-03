import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

/**
 * Merkle root computation over forensic records
 */
function computeSha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function computeMerkleRoot(hashes) {
  if (!hashes || hashes.length === 0) return computeSha256('EMPTY_MERKLE_ROOT');
  if (hashes.length === 1) return hashes[0];

  let currentLevel = [...hashes];
  while (currentLevel.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      if (i + 1 < currentLevel.length) {
        const combined = currentLevel[i] + currentLevel[i + 1];
        nextLevel.push(computeSha256(combined));
      } else {
        // Odd node duplicated to balance binary tree
        const combined = currentLevel[i] + currentLevel[i];
        nextLevel.push(computeSha256(combined));
      }
    }
    currentLevel = nextLevel;
  }
  return currentLevel[0];
}

function verifyChainBlock(prevHash, blockData, expectedHash) {
  const payload = prevHash + JSON.stringify(blockData);
  const actualHash = computeSha256(payload);
  return actualHash === expectedHash;
}

describe('Cryptographic Ledger & Section 65B Integrity Suite', () => {
  describe('SHA-256 Merkle Tree Hash Calculation', () => {
    it('should generate deterministic 64-character hex Merkle roots', () => {
      const records = [
        computeSha256('ALT-PWR-001'),
        computeSha256('ALT-PWR-002'),
        computeSha256('ALT-PWR-003'),
        computeSha256('ALT-PWR-004')
      ];
      const root1 = computeMerkleRoot(records);
      const root2 = computeMerkleRoot(records);
      assert.strictEqual(root1, root2);
      assert.strictEqual(root1.length, 64);
    });

    it('should detect any tampering in underlying evidence records', () => {
      const originalHashes = [
        computeSha256('ALT-PWR-001:SIS_OVERRIDE'),
        computeSha256('ALT-PWR-002:TURBINE_TRIP')
      ];
      const originalRoot = computeMerkleRoot(originalHashes);

      // Tampered data (simulating malicious record modification)
      const tamperedHashes = [
        computeSha256('ALT-PWR-001:SIS_NORMAL_CLOSURE'), // Modified
        computeSha256('ALT-PWR-002:TURBINE_TRIP')
      ];
      const tamperedRoot = computeMerkleRoot(tamperedHashes);

      assert.notStrictEqual(originalRoot, tamperedRoot, 'Merkle root MUST diverge if even 1 byte is tampered');
    });

    it('should handle odd number of leaf nodes by balancing tree', () => {
      const oddHashes = [
        computeSha256('ALT-1'),
        computeSha256('ALT-2'),
        computeSha256('ALT-3')
      ];
      const root = computeMerkleRoot(oddHashes);
      assert.strictEqual(root.length, 64);
    });
  });

  describe('Section 65B Tamper-Evident Ledger Chaining', () => {
    it('should verify sequential block linkage against previous block hash', () => {
      const block0Hash = '0000000000000000000000000000000000000000000000000000000000000000';
      const block1Data = { examiner: 'NCIIPC-EXAM-9412', entity: 'CSE-POWER-01', decision: 'CONFIRMED' };
      const block1Hash = computeSha256(block0Hash + JSON.stringify(block1Data));

      const isValid = verifyChainBlock(block0Hash, block1Data, block1Hash);
      assert.strictEqual(isValid, true);
    });

    it('should reject blocks with broken cryptographic linkage', () => {
      const block0Hash = '0000000000000000000000000000000000000000000000000000000000000000';
      const block1Data = { examiner: 'NCIIPC-EXAM-9412', entity: 'CSE-POWER-01', decision: 'CONFIRMED' };
      const invalidHash = 'badc0ffeedeadbeef00000000000000000000000000000000000000000000000';

      const isValid = verifyChainBlock(block0Hash, block1Data, invalidHash);
      assert.strictEqual(isValid, false);
    });

    it('should verify integrity across multi-block sequential audit chains', () => {
      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const blocks = [
        { examiner: 'EXAM-01', action: 'INGEST' },
        { examiner: 'EXAM-02', action: 'SAMPLE_SELECT' },
        { examiner: 'EXAM-03', action: 'FINAL_ATTESTATION' }
      ];

      const chain = [];
      for (const block of blocks) {
        const hash = computeSha256(prevHash + JSON.stringify(block));
        chain.push({ prevHash, data: block, hash });
        prevHash = hash;
      }

      // Verify each link
      for (const link of chain) {
        assert.strictEqual(verifyChainBlock(link.prevHash, link.data, link.hash), true);
      }
    });

    it('should detect mid-chain tampering when historical entry is modified', () => {
      let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
      const blocks = [
        { examiner: 'EXAM-01', action: 'INGEST' },
        { examiner: 'EXAM-02', action: 'SAMPLE_SELECT' },
        { examiner: 'EXAM-03', action: 'FINAL_ATTESTATION' }
      ];

      const chain = [];
      for (const block of blocks) {
        const hash = computeSha256(prevHash + JSON.stringify(block));
        chain.push({ prevHash, data: block, hash });
        prevHash = hash;
      }

      // Tamper with middle block
      chain[1].data.action = 'TAMPERED_ACTION';
      const isStillValid = verifyChainBlock(chain[1].prevHash, chain[1].data, chain[1].hash);
      assert.strictEqual(isStillValid, false, 'Tampered block MUST fail verification');
    });

    it('should produce standard SHA-256 for empty string invariant', () => {
      const emptyHash = computeSha256('');
      assert.strictEqual(emptyHash, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should ensure idempotent hashing of identical records', () => {
      const record = { alertId: 'ALT-999', asset: 'SCADA-RTU' };
      const hash1 = computeSha256(JSON.stringify(record));
      const hash2 = computeSha256(JSON.stringify(record));
      assert.strictEqual(hash1, hash2);
    });
  });
});

