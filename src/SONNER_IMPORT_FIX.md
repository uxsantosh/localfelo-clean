# Sonner Import Fix - All Files

## Files That Need Updating

All files below need to change:
```typescript
import { toast } from 'sonner';
```

To:
```typescript
import { toast } from 'sonner@2.0.3';
```

### Components (8 files):
- [ ] /components/ShareButton.tsx ✅ FIXED
- [ ] /components/PhoneCollectionModal.tsx ✅ FIXED
- [ ] /components/PasswordSetupModal.tsx
- [ ] /components/EditProfileModal.tsx
- [ ] /components/ChangePasswordModal.tsx
- [ ] /components/BroadcastNotificationForm.tsx
- [ ] /components/ReportModal.tsx

### Screens (11 files):
- [ ] /screens/ListingDetailScreen.tsx
- [ ] /screens/ProfileScreen.tsx
- [ ] /screens/EditListingScreen.tsx
- [ ] /screens/ChatScreen.tsx
- [ ] /screens/CreateWishScreen.tsx
- [ ] /screens/CreateTaskScreen.tsx
- [ ] /screens/WishesScreen.tsx
- [ ] /screens/TasksScreen.tsx
- [ ] /screens/WishDetailScreen.tsx
- [ ] /screens/TaskDetailScreen.tsx
- [ ] /screens/NotificationsScreen.tsx

### Already Fixed:
✅ /screens/CreateListingScreen.tsx
✅ /components/ShareButton.tsx
✅ /components/PhoneCollectionModal.tsx

## Instructions:

For each file, find the line:
```
import { toast } from 'sonner';
```

And replace with:
```
import { toast } from 'sonner@2.0.3';
```

**Reason:**  
According to the library guidance in Figma Make, sonner must be imported with the version number `@2.0.3` to work correctly.
