// =====================================================
// OldCycle Chat Diagnostic Script
// =====================================================
// Run this in your browser console (F12) while on OldCycle
// to diagnose why conversations aren't showing up
// =====================================================

console.log('🔍 Starting Chat Diagnostic...\n');

// Step 1: Check current user
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 STEP 1: Check Current User');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const userJson = localStorage.getItem('oldcycle_user');
const tokenJson = localStorage.getItem('oldcycle_token');

if (!userJson) {
  console.error('❌ No user found in localStorage!');
  console.log('→ Please login first');
} else {
  const user = JSON.parse(userJson);
  console.log('✅ User found:');
  console.log('   ID:', user.id);
  console.log('   Name:', user.name);
  console.log('   Email:', user.email);
  console.log('   Phone:', user.phone);
  console.log('   Client Token:', user.clientToken);
  console.log('   Auth User ID:', user.authUserId);
  
  if (!user.id) {
    console.error('❌ PROBLEM: user.id is missing!');
    console.log('→ This is why conversations don\'t show up');
    console.log('→ Please logout and login again to fix this');
  } else {
    console.log('✅ user.id exists - good!');
  }
}

console.log('\nToken:', tokenJson);

// Step 2: Import supabase and check database
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 STEP 2: Check Database (requires Supabase)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('To check the database, run these queries in Supabase SQL Editor:\n');

if (userJson) {
  const user = JSON.parse(userJson);
  
  console.log('-- Query 1: Check your profile');
  console.log(`SELECT * FROM profiles WHERE id = '${user.id}';\n`);
  
  console.log('-- Query 2: Check conversations where you are buyer');
  console.log(`SELECT * FROM conversations WHERE buyer_id = '${user.id}';\n`);
  
  console.log('-- Query 3: Check conversations where you are seller');
  console.log(`SELECT * FROM conversations WHERE seller_id = '${user.id}';\n`);
  
  console.log('-- Query 4: Check ALL conversations (to see what IDs are actually stored)');
  console.log(`SELECT id, listing_title, buyer_id, buyer_name, seller_id, seller_name FROM conversations;\n`);
  
  console.log('-- Query 5: Check ALL messages');
  console.log(`SELECT id, conversation_id, sender_id, sender_name, content FROM messages;\n`);
}

// Step 3: Test the getUserId function
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 STEP 3: Test getUserId() Logic');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (userJson) {
  const user = JSON.parse(userJson);
  const userId = user?.id ? String(user.id) : null;
  
  console.log('getUserId() would return:', userId);
  
  if (!userId) {
    console.error('❌ PROBLEM: getUserId() returns null!');
    console.log('→ This means user.id is missing or undefined');
  } else {
    console.log('✅ getUserId() works correctly');
  }
}

// Step 4: Common issues and solutions
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 STEP 4: Common Issues & Solutions');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n❓ Issue 1: user.id is missing');
console.log('   Solution: Logout and login again');
console.log('   → The auth system should set user.id during registration/login');
console.log('   → If it\'s still missing after re-login, check auth.ts completeGoogleRegistration()');

console.log('\n❓ Issue 2: Conversations exist but don\'t show up');
console.log('   Solution: Check if buyer_id/seller_id match your user.id');
console.log('   → Run Query 2 & 3 above in Supabase');
console.log('   → If no results, the IDs don\'t match');

console.log('\n❓ Issue 3: Type mismatch (UUID vs TEXT)');
console.log('   Solution: Already fixed! buyer_id and seller_id are TEXT columns');
console.log('   → user.id is converted to String in getUserId()');
console.log('   → Should work fine now');

console.log('\n❓ Issue 4: RLS blocking queries');
console.log('   Solution: Already disabled! Run SUPABASE_CHAT_FIX_RLS.sql if not done yet');
console.log('   → RLS is disabled on conversations and messages tables');

// Step 5: Next actions
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 STEP 5: What to Do Next');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!userJson) {
  console.log('→ Login to OldCycle first');
} else {
  const user = JSON.parse(userJson);
  
  if (!user.id) {
    console.log('→ Logout and login again to fix missing user.id');
    console.log('→ Run this script again after re-login');
  } else {
    console.log('→ Run the SQL queries (Step 2) in Supabase SQL Editor');
    console.log('→ Check if your user.id matches buyer_id or seller_id in conversations');
    console.log('→ Copy the results and share them for further diagnosis');
  }
}

console.log('\n✅ Diagnostic complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
