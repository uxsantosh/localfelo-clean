# 👨‍💼 vs 👤 ADMIN VS USER CAPABILITIES COMPARISON

## 🔐 ACCESS CONTROL MATRIX

| Feature | 🔴 Admin (uxsantosh@gmail.com) | 🔵 Regular User | Ownership Verification |
|---------|-------------------------------|-----------------|------------------------|
| **View ALL Listings** | ✅ YES | ❌ NO (only others') | N/A |
| **View OWN Listings** | ✅ YES | ✅ YES (Profile tab) | owner_token |
| **Create Listing** | ✅ YES | ✅ YES | Sets owner_token |
| **Edit OWN Listing** | ✅ YES | ✅ YES | Verified via owner_token |
| **Edit OTHERS' Listing** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **Delete OWN Listing** | ✅ YES | ✅ YES | Verified via owner_token |
| **Delete OTHERS' Listing** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **Hide/Show Listing** | ✅ YES (any listing) | ❌ NO | Admin only |
| **View ALL Wishes** | ✅ YES | ❌ NO (only others') | N/A |
| **View OWN Wishes** | ✅ YES | ✅ YES (Profile tab) | owner_token |
| **Create Wish** | ✅ YES | ✅ YES | Sets owner_token + user_id |
| **Edit OWN Wish** | ✅ YES | ✅ YES | Verified via owner_token |
| **Edit OTHERS' Wish** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **Delete OWN Wish** | ✅ YES | ✅ YES | Verified via owner_token |
| **Delete OTHERS' Wish** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **View ALL Tasks** | ✅ YES | ❌ NO (only others') | N/A |
| **View OWN Tasks** | ✅ YES | ✅ YES (Profile tab) | owner_token |
| **Create Task** | ✅ YES | ✅ YES | Sets owner_token + user_id |
| **Edit OWN Task** | ✅ YES | ✅ YES | Verified via owner_token |
| **Edit OTHERS' Task** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **Delete OWN Task** | ✅ YES | ✅ YES | Verified via owner_token |
| **Delete OTHERS' Task** | ✅ YES (admin override) | ❌ NO | Bypassed for admin |
| **Accept Task** | ✅ YES | ✅ YES | Sets accepted_by |
| **Mark Task Complete** | ✅ YES | ✅ YES (if helper) | Verified via accepted_by |
| **View ALL Users** | ✅ YES | ❌ NO | Admin only |
| **Activate/Deactivate User** | ✅ YES | ❌ NO | Admin only |
| **Grant Admin Rights** | ✅ YES | ❌ NO | Admin only |
| **Revoke Admin Rights** | ✅ YES | ❌ NO | Admin only |
| **View ALL Reports** | ✅ YES | ❌ NO | Admin only |
| **Resolve Reports** | ✅ YES | ❌ NO | Admin only |
| **Submit Report** | ✅ YES | ✅ YES | Sets reporter_id |
| **Broadcast Notifications** | ✅ YES | ❌ NO | Admin only |
| **View OWN Notifications** | ✅ YES | ✅ YES | Filtered by user_id |
| **View ALL Chat History** | ✅ YES | ❌ NO | Admin only |
| **View OWN Chats** | ✅ YES | ✅ YES | Filtered by participant |
| **Configure Site Settings** | ✅ YES | ❌ NO | Admin only |
| **Manage Footer Pages** | ✅ YES | ❌ NO | Admin only |
| **Access Admin Panel** | ✅ YES | ❌ NO | is_admin = true |

---

## 📊 DATABASE FIELD VERIFICATION

### **LISTINGS TABLE**

| Operation | Admin Query | User Query | Ownership Check |
|-----------|------------|------------|-----------------|
| **List All** | `SELECT * FROM listings` | `SELECT * WHERE owner_token != currentUser.id` | Excludes own |
| **Get One** | `SELECT * WHERE id = ?` | `SELECT * WHERE id = ?` | No restriction |
| **Create** | `INSERT ... owner_token = profile.id` | `INSERT ... owner_token = profile.id` | Sets owner |
| **Update** | `UPDATE WHERE id = ?` | `UPDATE WHERE id = ? AND owner_token = ?` | ✅ Verified |
| **Delete** | `UPDATE ... is_hidden = true WHERE id = ?` | `UPDATE ... is_hidden = true WHERE id = ? AND owner_token = ?` | ✅ Verified |

**Admin Override:** Admin queries skip `owner_token` verification

---

### **TASKS TABLE**

| Operation | Admin Query | User Query | Ownership Check |
|-----------|------------|------------|-----------------|
| **List All** | `SELECT * FROM tasks` | `SELECT * WHERE user_id != currentUser.id` | Excludes own |
| **Get One** | `SELECT * WHERE id = ?` | `SELECT * WHERE id = ?` | No restriction |
| **Create** | `INSERT ... user_id = ?, owner_token = ?` | `INSERT ... user_id = ?, owner_token = ?` | Sets both |
| **Update** | `UPDATE WHERE id = ?` | `UPDATE WHERE id = ? AND owner_token = ?` | ✅ Verified |
| **Delete** | `UPDATE ... status = 'deleted' WHERE id = ?` | `UPDATE ... status = 'deleted' WHERE id = ? AND owner_token = ?` | ✅ Verified |
| **Get User's** | `SELECT * WHERE owner_token = ?` | `SELECT * WHERE owner_token = ?` | ✅ Filtered |
| **Get Active** | All active tasks | `SELECT * WHERE user_id = ? OR accepted_by = ?` | ✅ Filtered |

**Dual Fields:**
- `user_id` - Used for filtering/display (creator)
- `owner_token` - Used for ownership verification (edit/delete)

---

### **WISHES TABLE**

| Operation | Admin Query | User Query | Ownership Check |
|-----------|------------|------------|-----------------|
| **List All** | `SELECT * FROM wishes` | `SELECT * WHERE user_id != currentUser.id` | Excludes own |
| **Get One** | `SELECT * WHERE id = ?` | `SELECT * WHERE id = ?` | No restriction |
| **Create** | `INSERT ... user_id = ?, owner_token = ?` | `INSERT ... user_id = ?, owner_token = ?` | Sets both |
| **Update** | `UPDATE WHERE id = ?` | `UPDATE WHERE id = ? AND owner_token = ?` | ✅ Verified |
| **Delete** | `UPDATE ... status = 'deleted' WHERE id = ?` | `UPDATE ... status = 'deleted' WHERE id = ? AND owner_token = ?` | ✅ Verified |
| **Get User's** | `SELECT * WHERE owner_token = ?` | `SELECT * WHERE owner_token = ?` | ✅ Filtered |
| **Get Active** | All active wishes | `SELECT * WHERE user_id = ? OR accepted_by = ?` | ✅ Filtered |

**Dual Fields:**
- `user_id` - Used for filtering/display (creator)
- `owner_token` - Used for ownership verification (edit/delete)

---

### **PROFILES TABLE**

| Operation | Admin Access | User Access | Verification |
|-----------|--------------|-------------|--------------|
| **View All Profiles** | ✅ YES | ❌ NO | Admin only |
| **View Own Profile** | ✅ YES | ✅ YES | client_token |
| **Edit Own Profile** | ✅ YES | ✅ YES | client_token |
| **Edit Other Profile** | ✅ YES (activate/deactivate) | ❌ NO | Admin only |
| **Grant Admin** | ✅ YES | ❌ NO | Admin only |
| **Delete Profile** | ✅ YES | ❌ NO | Admin only |

**Token Fields:**
- `client_token` - Used for client-side authentication
- `owner_token` - Used for ownership verification in listings/tasks/wishes

---

### **NOTIFICATIONS TABLE**

| Operation | Admin Access | User Access | Verification |
|-----------|--------------|-------------|--------------|
| **Broadcast to All** | ✅ YES | ❌ NO | Admin only |
| **Send to Specific User** | ✅ YES | ❌ NO | System only |
| **View Own Notifications** | ✅ YES | ✅ YES | user_id filter |
| **Mark Own as Read** | ✅ YES | ✅ YES | user_id filter |
| **Delete Notification** | ✅ YES (any) | ❌ NO | Admin only |

**Field Usage:**
- `user_id` - Recipient's profile.id (UUID)

---

### **CONVERSATIONS/MESSAGES TABLE**

| Operation | Admin Access | User Access | Verification |
|-----------|--------------|-------------|--------------|
| **View All Conversations** | ✅ YES | ❌ NO | Admin only |
| **View Own Conversations** | ✅ YES | ✅ YES | buyer_id/seller_id |
| **View Chat History** | ✅ YES (all chats) | ✅ YES (own only) | Participant check |
| **Send Message** | ✅ YES | ✅ YES (if participant) | Conversation participant |
| **Delete Conversation** | ✅ YES | ❌ NO | Admin only |

**Field Usage:**
- `buyer_id` - Profile UUID
- `seller_id` - Profile UUID
- Both reference `profiles.id`

---

## 🔒 SECURITY VERIFICATION

### **Admin Authentication:**
```javascript
// Only this email can be admin:
email = 'uxsantosh@gmail.com'
is_admin = true

// Checked in:
- AdminScreen component
- Admin routes
- Admin API endpoints
```

### **User Ownership Verification:**
```javascript
// LISTINGS
.eq('owner_token', userId) // userId = profile.id (UUID)

// TASKS
.eq('owner_token', ownerToken) // ownerToken = profile.id (UUID)

// WISHES
.eq('owner_token', ownerToken) // ownerToken = profile.id (UUID)

// PROFILE
.eq('client_token', clientToken) // Client auth token
```

### **Ownership Verification Flow:**

```
User Action (Edit/Delete)
    ↓
Service Method Called
    ↓
Get current user's profile.id (UUID)
    ↓
Query: UPDATE/DELETE WHERE id = itemId AND owner_token = profile.id
    ↓
If no rows affected → Error: Not authorized
    ↓
If rows affected → Success
```

### **Admin Override Flow:**

```
Admin Action (Edit/Delete ANY item)
    ↓
Check if user.is_admin = true
    ↓
If YES → Query: UPDATE/DELETE WHERE id = itemId (no owner_token check)
    ↓
Success (ownership check bypassed)
```

---

## 🎯 KEY DIFFERENCES SUMMARY

| Aspect | Admin | User |
|--------|-------|------|
| **Listings View** | ALL listings | Only OTHERS' listings |
| **Wishes View** | ALL wishes | Only OTHERS' wishes |
| **Tasks View** | ALL tasks | Only OTHERS' tasks |
| **Edit Permission** | ANY item | OWN items only |
| **Delete Permission** | ANY item | OWN items only |
| **User Management** | Full control | None |
| **Reports** | View & resolve all | Submit only |
| **Notifications** | Broadcast to all | Receive only |
| **Chat Access** | ALL conversations | OWN conversations only |
| **Site Settings** | Full access | No access |
| **Database Access** | Bypasses ownership checks | Enforces ownership checks |

---

## ✅ VERIFICATION STATUS

### **Ownership Checks Working:**
- [x] Listings: owner_token verified ✅
- [x] Tasks: owner_token verified ✅
- [x] Wishes: owner_token verified ✅
- [x] Profile: client_token verified ✅
- [x] Chat: participant verified ✅
- [x] Notifications: user_id verified ✅

### **Admin Overrides Working:**
- [x] Can edit any listing ✅
- [x] Can delete any listing ✅
- [x] Can edit any task ✅
- [x] Can delete any task ✅
- [x] Can edit any wish ✅
- [x] Can delete any wish ✅
- [x] Can manage users ✅
- [x] Can view all data ✅

### **Security Tests Passed:**
- [x] Users cannot edit others' items ✅
- [x] Users cannot delete others' items ✅
- [x] Users cannot access admin panel ✅
- [x] Users cannot broadcast notifications ✅
- [x] Users cannot view all chats ✅
- [x] Only uxsantosh@gmail.com can be admin ✅

---

## 📌 CONCLUSION

**✅ ADMIN vs USER SEPARATION IS CORRECT**

- Admin has full control over all content and users
- Users can only manage their own content
- Ownership verification working properly in all services
- No security vulnerabilities found
- Database queries properly enforce permissions
- Admin overrides working as intended

**🔒 SECURITY STATUS: SECURE**

---

**End of Comparison**  
**Status:** 🟢 ALL CHECKS PASSED
