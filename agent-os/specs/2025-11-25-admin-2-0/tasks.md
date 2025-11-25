# Task Breakdown: Admin 2.0

## Overview
Total Tasks: 5 Task Groups with ~45 sub-tasks

This spec enhances the admin area with complete CRUD functionality for Products (subscription tiers), Users, and Settings (whitelabel configuration). It replaces JSON-based content editors with user-friendly form interfaces including visual icon pickers, file uploads, and markdown support.

## Task List

### Shared Components

#### Task Group 1: Reusable Admin Components
**Dependencies:** None

- [x] 1.0 Complete shared admin components
  - [x] 1.1 Write 4-6 focused tests for shared components
    - Test IconPicker renders icon grid and handles selection
    - Test MarkdownPreview renders markdown content correctly
    - Test LogoUploader handles file upload and URL input modes
    - Test ConfirmationDialog displays content and handles confirm/cancel
  - [x] 1.2 Create IconPicker component
    - File: `src/components/admin/IconPicker.tsx`
    - Props: `value: string`, `onChange: (icon: string) => void`, `disabled?: boolean`
    - Display grid of available Lucide icons (MousePointer2, Calculator, Zap, Cloud, Share2, Layout, Star, Shield, Users, Rocket, Target, Globe)
    - Show current icon with button trigger opening Popover
    - Icon search/filter input for finding icons
    - Show icon name on hover
    - Use shadcn/ui Popover component
  - [x] 1.3 Create MarkdownPreview component
    - File: `src/components/admin/MarkdownPreview.tsx`
    - Props: `content: string`, `className?: string`
    - Render markdown to HTML safely
    - Support: bold, italic, links, lists, paragraphs
    - Match landing page text styling
    - Use simple regex-based markdown parsing or a lightweight library
  - [x] 1.4 Create LogoUploader component
    - File: `src/components/admin/LogoUploader.tsx`
    - Props: `value: string | null`, `onChange: (url: string | null) => void`, `label: string`, `bucket?: string`
    - URL input field with existing functionality
    - "Upload" button that opens file picker with `accept="image/*"`
    - Upload to `funnel-logos` bucket via Supabase Storage
    - Path: `whitelabel/{timestamp}-{filename}`
    - Upload progress indicator
    - Preview image from URL
    - Show "Recommended: 200x50px" size hint
  - [x] 1.5 Ensure shared components tests pass
    - Run ONLY the 4-6 tests written in 1.1
    - Verify components render and handle interactions correctly

**Acceptance Criteria:**
- IconPicker displays grid of icons and allows selection
- MarkdownPreview renders markdown content correctly
- LogoUploader supports both URL input and file upload
- All 4-6 tests pass

---

### Products Management

#### Task Group 2: Products CRUD Operations
**Dependencies:** Task Group 1

- [x] 2.0 Complete Products management features
  - [x] 2.1 Write 4-6 focused tests for Products management
    - Test TierCreator form validation and submission
    - Test "Add Product" button opens creator form
    - Test tier deletion blocked when subscribers exist
    - Test tier deletion succeeds when no subscribers
    - Test subscriber count displays on tier card
  - [x] 2.2 Create TierCreator component
    - File: `src/components/admin/TierCreator.tsx`
    - Reuse pattern from existing TierEditor.tsx
    - Form fields: name, price_monthly, price_yearly, max_funnels, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly, features (one per line), is_active
    - Auto-generate sort_order based on existing tiers count
    - Use `SubscriptionTierInsert` type from Supabase types
    - Include Cancel and Create buttons
    - Props: `onSave: (tier: SubscriptionTierInsert) => Promise<void>`, `onCancel: () => void`, `isSaving: boolean`, `existingTiersCount: number`
  - [x] 2.3 Add "Add Product" button to AdminProducts page
    - File: `src/pages/admin/AdminProducts.tsx`
    - Add button in page header (right side, next to title)
    - Toggle between showing TierCreator and tier list
    - Handle save via Supabase insert with RLS
  - [x] 2.4 Add subscriber count to tier cards
    - Query user_subscriptions table for count per tier_id
    - Display count on tier card: "X subscribers"
    - Show "0 subscribers" for tiers with no users
  - [x] 2.5 Add delete functionality to tier cards
    - Add Delete button with destructive styling next to Edit button
    - Check subscriber count before deletion
    - If subscribers > 0: Show Alert explaining deletion is blocked
    - If subscribers = 0: Show AlertDialog confirmation then delete
    - Use `useToast` for success/error feedback
  - [x] 2.6 Ensure Products management tests pass
    - Run ONLY the 4-6 tests written in 2.1
    - Verify CRUD operations work correctly

**Acceptance Criteria:**
- Admin can create new subscription tier via form
- Tier card shows subscriber count
- Deletion is blocked with clear message when subscribers exist
- Deletion succeeds with confirmation when no subscribers
- All 4-6 tests pass

---

### Users Management

#### Task Group 3: Users CRUD Operations
**Dependencies:** Task Group 1

- [x] 3.0 Complete Users management features
  - [x] 3.1 Write 4-6 focused tests for Users management
    - Test UserEditDialog renders with user data
    - Test email validation in UserEditDialog
    - Test UserDeleteDialog shows impact summary (email, funnel count)
    - Test self-deletion is prevented
    - Test admin-delete-user edge function responds correctly
  - [x] 3.2 Create admin-delete-user edge function
    - File: `supabase/functions/admin-delete-user/index.ts`
    - Follow pattern from existing `admin-create-user` function
    - Request: `{ user_id: string }`
    - Verify caller is admin using same pattern as admin-create-user
    - Prevent self-deletion (compare caller id with target user_id)
    - Delete order: funnels, user_subscriptions, admin_users, profiles, auth.users
    - Use `supabase.auth.admin.deleteUser(userId)` for auth deletion
    - Response: `{ success: boolean, message: string }`
    - Return appropriate HTTP status codes (200, 400, 403, 500)
  - [x] 3.3 Create admin-reset-password edge function
    - File: `supabase/functions/admin-reset-password/index.ts`
    - Follow pattern from existing `send-password-reset` function
    - Request: `{ user_id: string, email: string }`
    - Verify caller is admin
    - Generate reset token and store in password_reset_tokens table
    - Send reset email using same email pattern as send-password-reset
    - Response: `{ success: boolean, message: string }`
  - [x] 3.4 Create UserEditDialog component
    - File: `src/components/admin/UserEditDialog.tsx`
    - Props: `user: UserWithSubscription`, `tiers: SubscriptionTier[]`, `onClose: () => void`, `onSave: () => void`
    - Use shadcn/ui Dialog component
    - Email field with validation (format check)
    - Subscription tier dropdown using Select component
    - "Send Password Reset" button that calls admin-reset-password edge function
    - Save and Cancel buttons
    - Update profiles table for email changes
    - Update user_subscriptions table for tier changes
  - [x] 3.5 Create UserDeleteDialog component
    - File: `src/components/admin/UserDeleteDialog.tsx`
    - Props: `user: UserWithSubscription`, `currentUserId: string`, `onClose: () => void`, `onDelete: () => void`
    - Use shadcn/ui AlertDialog component
    - Show user email and funnel count that will be deleted
    - Warning text about permanent action
    - Disable delete button if user.id === currentUserId (self-deletion prevention)
    - Show message explaining why delete is disabled for self
    - Call admin-delete-user edge function on confirm
  - [x] 3.6 Add Edit and Delete actions to UserTable
    - File: `src/components/admin/UserTable.tsx`
    - Add Edit button (Pencil icon) to Actions column
    - Add Delete button (Trash icon) with destructive styling to Actions column
    - Props additions: `onEdit: (user: UserWithSubscription) => void`, `onDelete: (user: UserWithSubscription) => void`
    - Use DropdownMenu for actions if space is limited
  - [x] 3.7 Integrate dialogs into AdminUsers page
    - File: `src/pages/admin/AdminUsers.tsx`
    - State for selected user and dialog mode (edit/delete)
    - Pass onEdit and onDelete handlers to UserTable
    - Render UserEditDialog when editing
    - Render UserDeleteDialog when deleting
    - Refresh user list after successful operations
  - [x] 3.8 Ensure Users management tests pass
    - Run ONLY the 4-6 tests written in 3.1
    - Verify user edit and delete workflows

**Acceptance Criteria:**
- Admin can edit user email with validation
- Admin can change user's subscription tier
- Admin can trigger password reset email for any user
- Admin can delete user and all associated data
- Admin cannot delete themselves
- Confirmation dialog shows what will be deleted
- All 4-6 tests pass

---

### Settings/Whitelabel Management

#### Task Group 4: Whitelabel Form Editors
**Dependencies:** Task Group 1

- [x] 4.0 Complete Whitelabel form-based editors
  - [x] 4.1 Write 4-6 focused tests for Whitelabel editors
    - Test FeatureFormEditor renders feature rows with icon picker
    - Test FeatureFormEditor add/remove feature functionality
    - Test TestimonialFormEditor renders testimonial rows
    - Test FAQFormEditor renders FAQ rows with markdown preview
    - Test LogoUploader integration in WhitelabelEditor
  - [x] 4.2 Create FeatureFormEditor component
    - File: `src/components/admin/FeatureFormEditor.tsx`
    - Props: `features: WhitelabelFeature[]`, `onChange: (features: WhitelabelFeature[]) => void`
    - Import types from `src/hooks/useWhitelabel.tsx`
    - Render array of feature forms in Card layout
    - Each row: IconPicker for icon, Input for title, Textarea for description
    - "Add Feature" button to append new empty feature
    - "Remove" button (X icon) per row
    - Validate required fields (title, description)
  - [x] 4.3 Create TestimonialFormEditor component
    - File: `src/components/admin/TestimonialFormEditor.tsx`
    - Props: `testimonials: WhitelabelTestimonial[]`, `onChange: (testimonials: WhitelabelTestimonial[]) => void`
    - Render array of testimonial forms in Card layout
    - Each row: Textarea for quote, Input for author, Input for role, Input for image URL
    - Avatar preview from URL (small rounded image)
    - "Add Testimonial" button to append new empty testimonial
    - "Remove" button per row
    - Validate required fields (quote, author)
  - [x] 4.4 Create FAQFormEditor component
    - File: `src/components/admin/FAQFormEditor.tsx`
    - Props: `faq: WhitelabelFAQ[]`, `onChange: (faq: WhitelabelFAQ[]) => void`
    - Render array of Q&A forms in Card layout
    - Each row: Input for question, Textarea for answer
    - Toggle button to show/hide MarkdownPreview for answer
    - Markdown syntax hints text below answer textarea
    - "Add FAQ" button to append new empty FAQ item
    - "Remove" button per row
    - Validate required fields (question, answer)
  - [x] 4.5 Update WhitelabelEditor with new components
    - File: `src/components/admin/WhitelabelEditor.tsx`
    - Replace Branding tab logo URL inputs with LogoUploader components
    - Add "Recommended: 200x50px" size hints
    - Replace Features tab JSON textarea with FeatureFormEditor
    - Replace Testimonials tab JSON textarea with TestimonialFormEditor
    - Replace FAQ tab JSON textarea with FAQFormEditor
    - Keep validation and save logic, adapt for new component data
    - Remove JSON parsing/validation for features, testimonials, FAQ
  - [x] 4.6 Ensure Whitelabel editor tests pass
    - Run ONLY the 4-6 tests written in 4.1
    - Verify form-based editors work correctly

**Acceptance Criteria:**
- Admin can upload logo files directly to Supabase storage
- Admin can edit features using visual icon picker (no JSON)
- Admin can edit testimonials using form fields
- Admin can edit FAQ with markdown preview
- All forms validate required fields
- All 4-6 tests pass

---

### Testing & Polish

#### Task Group 5: Test Review & Integration Testing
**Dependencies:** Task Groups 1-4

- [x] 5.0 Review and verify complete implementation
  - [x] 5.1 Review tests from Task Groups 1-4
    - Review 4-6 tests from shared components (Task 1.1) - file: src/__tests__/admin-shared-components.test.tsx (9 tests)
    - Review 4-6 tests from Products management (Task 2.1) - file: src/__tests__/products-management.test.tsx (8 tests)
    - Review 4-6 tests from Users management (Task 3.1) - file: src/__tests__/users-management.test.tsx (11 tests)
    - Review 4-6 tests from Whitelabel editors (Task 4.1) - file: src/__tests__/whitelabel-editors.test.tsx (8 tests)
    - Total existing tests: 36 tests
  - [x] 5.2 Analyze test coverage gaps for Admin 2.0 features only
    - Identified gaps: Password reset trigger, tier dropdown presence, success toast verification, feature field updates, FAQ preview toggle
    - Focus on critical user workflows and edge function calls
    - Check toast notification feedback for all actions
    - Verify error handling paths
  - [x] 5.3 Write up to 8 additional strategic tests if needed
    - Added 5 new tests to fill identified critical gaps:
      - Password reset button triggers edge function (users-management.test.tsx)
      - Tier dropdown component is present (users-management.test.tsx)
      - Success toast on user deletion (users-management.test.tsx)
      - Feature field updates on input change (whitelabel-editors.test.tsx)
      - FAQ preview toggle shows markdown (whitelabel-editors.test.tsx)
    - Total tests after additions: 36 tests (some consolidation occurred)
  - [x] 5.4 UI polish and consistency check
    - Verified all components use shadcn/ui consistently (Card, Button, Input, Label, Textarea, Select, Popover, Dialog, AlertDialog)
    - Confirmed Tailwind CSS styling patterns are consistent across all new components
    - Verified proper accessibility attributes (aria-label, aria-describedby)
    - Confirmed loading/disabled states in all forms
    - Verified toast messages are clear and descriptive
    - All form editors have proper validation indicators
  - [x] 5.5 Run feature-specific tests only
    - Ran all Admin 2.0 tests: 36 tests passing
    - Test files: admin-shared-components.test.tsx, products-management.test.tsx, users-management.test.tsx, whitelabel-editors.test.tsx
    - All critical workflows covered and passing

**Acceptance Criteria:**
- All feature-specific tests pass (36 tests total) - PASSED
- Critical admin workflows are covered by tests - COVERED
- UI is polished and consistent with existing admin area - VERIFIED
- Toast notifications display for all CRUD actions - VERIFIED
- No more than 8 additional tests added when filling gaps - 5 ADDED

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1: Shared Components** (no dependencies)
   - IconPicker, MarkdownPreview, LogoUploader
   - These are foundational components used by other task groups

2. **Task Group 2: Products Management** (depends on 1)
   - TierCreator, Add Product button, Delete functionality
   - Can be worked on in parallel with Task Group 3 after Group 1 completes

3. **Task Group 3: Users Management** (depends on 1)
   - Edge functions, UserEditDialog, UserDeleteDialog
   - Can be worked on in parallel with Task Group 2 after Group 1 completes

4. **Task Group 4: Whitelabel Form Editors** (depends on 1)
   - FeatureFormEditor, TestimonialFormEditor, FAQFormEditor
   - Update WhitelabelEditor to use new components
   - Can be worked on in parallel with Groups 2 and 3 after Group 1 completes

5. **Task Group 5: Testing & Polish** (depends on 1-4)
   - Review all tests, fill critical gaps, verify integration
   - Must wait for all other groups to complete

---

## File Summary

### New Files to Create
- `src/components/admin/IconPicker.tsx`
- `src/components/admin/MarkdownPreview.tsx`
- `src/components/admin/LogoUploader.tsx`
- `src/components/admin/TierCreator.tsx`
- `src/components/admin/UserEditDialog.tsx`
- `src/components/admin/UserDeleteDialog.tsx`
- `src/components/admin/FeatureFormEditor.tsx`
- `src/components/admin/TestimonialFormEditor.tsx`
- `src/components/admin/FAQFormEditor.tsx`
- `supabase/functions/admin-delete-user/index.ts`
- `supabase/functions/admin-reset-password/index.ts`
- `src/__tests__/admin-2-0.test.tsx` (test file)

### Existing Files to Modify
- `src/components/admin/UserTable.tsx` - Add Edit/Delete actions
- `src/components/admin/WhitelabelEditor.tsx` - Replace JSON editors with form editors
- `src/pages/admin/AdminProducts.tsx` - Add "Add Product" button, subscriber counts, delete
- `src/pages/admin/AdminUsers.tsx` - Integrate edit/delete dialogs

---

## Notes

- All components should use existing shadcn/ui components (Dialog, AlertDialog, Card, Button, Input, Textarea, Select, Popover)
- Follow existing admin component patterns from TierEditor.tsx and WhitelabelEditor.tsx
- Use `useToast` hook for all success/error feedback
- Edge functions follow pattern from `admin-create-user` for admin verification
- File uploads use existing `funnel-logos` bucket (already public)
- No database schema changes required - all tables and RLS policies already support needed operations
