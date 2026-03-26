// =====================================================
// Password Hash Testing Utility
// Use this to test if password hashing is working correctly
// =====================================================

import { hashPassword, verifyPassword } from './passwordHash';

/**
 * Test password hashing with detailed logging
 */
export async function testPasswordHashing(password: string): Promise<void> {
  console.log('\n🧪 ===== PASSWORD HASH TEST =====');
  console.log('📝 Testing password:', password);
  
  // Hash the password
  const hash1 = await hashPassword(password);
  console.log('🔐 Hash 1:', hash1);
  console.log('📏 Hash 1 length:', hash1.length);
  
  // Hash the same password again (should be identical for SHA-256)
  const hash2 = await hashPassword(password);
  console.log('🔐 Hash 2:', hash2);
  console.log('📏 Hash 2 length:', hash2.length);
  
  // Check if hashes are identical
  const hashesMatch = hash1 === hash2;
  console.log('✅ Hashes identical?', hashesMatch ? 'YES ✅' : 'NO ❌');
  
  if (!hashesMatch) {
    console.error('❌ PROBLEM: Same password produces different hashes!');
    console.error('   This means password verification will ALWAYS fail');
  }
  
  // Test verification with correct password
  const verifyCorrect = await verifyPassword(password, hash1);
  console.log('🔍 Verify correct password:', verifyCorrect ? 'PASS ✅' : 'FAIL ❌');
  
  // Test verification with wrong password
  const verifyWrong = await verifyPassword(password + 'x', hash1);
  console.log('🔍 Verify wrong password:', verifyWrong ? 'FAIL ❌ (should be false)' : 'PASS ✅ (correctly rejected)');
  
  console.log('🧪 ===== TEST COMPLETE =====\n');
  
  return;
}

/**
 * Compare two password hashes
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  console.log('\n🔍 ===== HASH COMPARISON =====');
  console.log('Hash 1:', hash1.substring(0, 20) + '...');
  console.log('Hash 1 length:', hash1.length);
  console.log('Hash 2:', hash2.substring(0, 20) + '...');
  console.log('Hash 2 length:', hash2.length);
  
  const match = hash1 === hash2;
  console.log('Match?', match ? 'YES ✅' : 'NO ❌');
  
  if (!match) {
    // Show first difference
    for (let i = 0; i < Math.max(hash1.length, hash2.length); i++) {
      if (hash1[i] !== hash2[i]) {
        console.log(`First difference at position ${i}:`);
        console.log(`  Hash 1: "${hash1.substring(i, i + 10)}"`);
        console.log(`  Hash 2: "${hash2.substring(i, i + 10)}"`);
        break;
      }
    }
  }
  
  console.log('🔍 ===== COMPARISON COMPLETE =====\n');
  
  return match;
}

/**
 * Test password with whitespace (common bug)
 */
export async function testPasswordWithWhitespace(): Promise<void> {
  console.log('\n🧪 ===== WHITESPACE TEST =====');
  
  const password = 'test123';
  const passwordWithSpace = 'test123 '; // trailing space
  const passwordWithLeading = ' test123'; // leading space
  
  const hash1 = await hashPassword(password);
  const hash2 = await hashPassword(passwordWithSpace);
  const hash3 = await hashPassword(passwordWithLeading);
  
  console.log('Password 1 (no spaces):', `"${password}"`);
  console.log('Hash 1:', hash1.substring(0, 20) + '...');
  
  console.log('\nPassword 2 (trailing space):', `"${passwordWithSpace}"`);
  console.log('Hash 2:', hash2.substring(0, 20) + '...');
  console.log('Same as Hash 1?', hash1 === hash2 ? 'YES' : 'NO ❌');
  
  console.log('\nPassword 3 (leading space):', `"${passwordWithLeading}"`);
  console.log('Hash 3:', hash3.substring(0, 20) + '...');
  console.log('Same as Hash 1?', hash1 === hash3 ? 'YES' : 'NO ❌');
  
  console.log('\n⚠️ If hashes are different, check for whitespace in password input!');
  console.log('🧪 ===== WHITESPACE TEST COMPLETE =====\n');
}
