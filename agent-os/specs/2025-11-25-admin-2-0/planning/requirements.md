# Admin 2.0 - Requirements

## Decisions from Spec Shaping

### 1. Product Deletion Strategy
**Decision: C - Block deletion if subscribers exist**
- Cannot delete a tier that has active subscribers
- Must show subscriber count and explain why deletion is blocked
- Admin must reassign subscribers manually before deletion is allowed

### 2. Product Creation
**Decision: Yes**
- Admins can create new subscription tiers through the UI
- Form with: name, prices (monthly/yearly), funnel limit, Stripe IDs, features list

### 3. User Edit - Fields
**Decision: All fields editable**
- Email address (with validation)
- Password reset functionality
- Subscription tier reassignment (manual override)

### 4. User Deletion Strategy
**Decision: A - Hard delete**
- Removes user and all their funnels
- Requires confirmation dialog showing what will be deleted
- Cannot delete yourself (prevent admin lockout)

### 5. Logo Upload Storage
**Decision: Both URL + Upload, same bucket**
- Keep URL input option AND add file upload
- Use existing `funnel-logos` bucket for uploads
- Show recommended sizes to user

### 6. Features Icon Picker
**Decision: D - Visual icon gallery with previews**
- Display icons in a visual grid/gallery
- User can browse and click to select
- Show icon preview alongside title/description fields

### 7. Testimonials Avatar
**Decision: URL only**
- Keep as URL input (no file upload needed)
- Simpler implementation, testimonial images often come from external sources

### 8. FAQ Answer Format
**Decision: Markdown support**
- Allow markdown in FAQ answers
- Render markdown in the landing page FAQ section
- Provide basic markdown hints/help in the editor

### Visual Design
**Decision: Keep in tune with current UI**
- Match existing shadcn/ui components and styling
- Consistent with current admin area design patterns
- No new design system needed

---

## Feature Summary

### Products Admin
- [x] View existing tiers (already exists)
- [x] Edit existing tiers (already exists)
- [ ] **NEW: Add Product** - Create new subscription tier
- [ ] **NEW: Delete Product** - Remove tier (blocked if has subscribers)

### Users Admin
- [x] View users list (already exists)
- [x] Add user (already exists)
- [x] Toggle admin status (already exists)
- [ ] **NEW: Edit User** - Edit email, reset password, change tier
- [ ] **NEW: Delete User** - Hard delete with confirmation

### Settings Admin (Whitelabel)
- [x] URL inputs for logos (already exists)
- [x] JSON editors for content (already exists)
- [ ] **NEW: Logo Upload** - File upload alongside URL input
- [ ] **NEW: Recommended Sizes** - Display size guidelines
- [ ] **NEW: Features Form** - Visual icon picker, title, description fields
- [ ] **NEW: Testimonials Form** - Quote, author, role, image URL fields
- [ ] **NEW: FAQ Form** - Question field, markdown answer field

---

## Technical Considerations

### Database
- No schema changes needed for Products/Users
- May need RLS policy updates for delete operations

### Edge Functions
- Extend `admin-create-user` or create new functions for:
  - User deletion (needs service role to delete from auth.users)
  - Password reset for users

### Storage
- Use existing `funnel-logos` bucket
- Add upload handling in WhitelabelEditor

### UI Components Needed
- Icon picker/gallery component
- Markdown editor component (or textarea with preview)
- File upload component with preview
- Form builders for Features/Testimonials/FAQ
