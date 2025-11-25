# Specification: Admin 2.0

## Goal

Enhance the admin area with complete CRUD functionality for Products (subscription tiers), Users, and Settings (whitelabel configuration). Replace JSON-based content editors with user-friendly form interfaces including visual icon pickers, file uploads, and markdown support.

## User Stories

- As an admin, I want to create new subscription tiers through the UI so that I can add new pricing plans without database migrations
- As an admin, I want to delete subscription tiers so that I can remove obsolete plans (only if no subscribers exist)
- As an admin, I want to edit user details (email, subscription tier) so that I can manage user accounts
- As an admin, I want to trigger password resets for users so that I can help users who are locked out
- As an admin, I want to delete users so that I can remove inactive or problematic accounts
- As an admin, I want to upload logo files directly so that I can update branding without needing external hosting
- As an admin, I want to edit landing page features using a form with an icon picker so that I can update content without writing JSON
- As an admin, I want to edit testimonials using a structured form so that I can manage social proof easily
- As an admin, I want to edit FAQ items with markdown support so that I can format answers with rich text

## Core Requirements

### Products Management

- Add new subscription tier with form: name, prices (monthly/yearly), funnel limit, Stripe IDs, features list
- Delete tier button that checks for active subscribers before allowing deletion
- Show subscriber count on tier card
- Display clear error message when deletion is blocked due to existing subscribers

### Users Management

- Edit user dialog: update email address with validation, trigger password reset email, change subscription tier (manual override)
- Delete user with hard delete behavior: removes user from auth.users, profiles, funnels, admin_users, user_subscriptions
- Confirmation dialog showing what will be deleted (user email, funnel count)
- Prevent self-deletion to avoid admin lockout

### Settings Management (Whitelabel)

- Logo upload: file input alongside existing URL input, use `funnel-logos` bucket
- Show recommended sizes: "Recommended: 200x50px for best results"
- Features editor: form-based with visual icon gallery picker, title field, description field
- Testimonials editor: form-based with quote, author, role, image URL fields
- FAQ editor: form-based with question field, markdown textarea with preview for answer

## Visual Design

- Match existing shadcn/ui components and admin area styling
- Use existing Dialog, Card, Button, Input, Textarea, Select components
- Icon picker: grid layout showing available Lucide icons with search/filter
- Markdown preview: side-by-side or toggle view showing rendered output

## Reusable Components

### Existing Code to Leverage

**Components:**
- `TierEditor` (src/components/admin/TierEditor.tsx) - base pattern for tier editing form
- `UserTable` (src/components/admin/UserTable.tsx) - user list with actions column
- `WhitelabelEditor` (src/components/admin/WhitelabelEditor.tsx) - tabbed config editor
- Dialog, AlertDialog, Card, Button, Input, Textarea, Select, Switch from shadcn/ui

**Patterns:**
- Edge function pattern from `admin-create-user` for service-role operations
- File upload to `funnel-logos` bucket (existing bucket, used by funnels)
- Toast notifications via `useToast` hook
- Confirmation dialogs via AlertDialog component

**Data Types:**
- `SubscriptionTier`, `SubscriptionTierInsert`, `SubscriptionTierUpdate` types
- `WhitelabelFeature`, `WhitelabelTestimonial`, `WhitelabelFAQ` types
- Icon mapping from Features.tsx (12 icons currently mapped)

### New Components Required

- `IconPicker` - visual icon gallery for selecting Lucide icons (no existing icon picker in codebase)
- `FeatureFormEditor` - form-based editor replacing JSON textarea for features
- `TestimonialFormEditor` - form-based editor for testimonials
- `FAQFormEditor` - form-based editor with markdown preview for FAQ
- `LogoUploader` - file upload component with preview and URL fallback
- `MarkdownPreview` - renders markdown content for FAQ preview
- `UserEditDialog` - dialog for editing user details
- `UserDeleteDialog` - confirmation dialog with impact summary

## Technical Approach

### Product Creation Flow

1. Add "Add Product" button to AdminProducts page header
2. Create `TierCreator` component (similar to TierEditor but for insert)
3. Use direct Supabase insert with RLS policy (admins already have insert permission)
4. Auto-generate sort_order based on existing tiers count

### Product Deletion Flow

1. Add delete button to tier card (next to edit button)
2. Check subscriber count before showing confirmation
3. If subscribers exist: show alert explaining why deletion is blocked
4. If no subscribers: show confirmation dialog then delete via Supabase

### User Edit Flow

1. Add "Edit" action button to UserTable actions column
2. Open UserEditDialog with current user data
3. Email change: validate format, update profiles table
4. Password reset: call new edge function to trigger reset email
5. Tier change: update user_subscriptions table directly

### User Deletion Flow

1. Add "Delete" action button to UserTable (with destructive styling)
2. Open UserDeleteDialog showing:
   - User email
   - Funnel count that will be deleted
   - Warning about permanent action
3. Call new `admin-delete-user` edge function (requires service role for auth.users deletion)
4. Edge function deletes in order: funnels, user_subscriptions, admin_users, profiles, auth.users

### Logo Upload Flow

1. Add file input with accept="image/*" alongside URL input
2. On file select: upload to `funnel-logos` bucket via Supabase Storage
3. Generate public URL and populate the URL field
4. Show preview of uploaded image
5. Keep URL input functional for external URLs

### Features Form Editor

1. Replace JSON textarea with array of form fields
2. Each feature row: icon picker, title input, description textarea
3. Add/remove feature buttons
4. Icon picker opens as popover/dialog with grid of available icons
5. Available icons: MousePointer2, Calculator, Zap, Cloud, Share2, Layout, Star, Shield, Users, Rocket, Target, Globe

### FAQ Editor with Markdown

1. Replace JSON textarea with array of Q&A form pairs
2. Question: text input
3. Answer: textarea with markdown toggle/preview
4. Use simple markdown renderer for preview (bold, italic, lists, links)
5. Show markdown syntax hints below textarea

## Database Changes

No schema changes required. All tables and RLS policies already support the needed operations:

- `subscription_tiers`: has insert/update/delete policies for admins
- `user_subscriptions`: has update policy for admins
- `profiles`: has update policy for admins
- `admin_users`: has delete policy for admins
- `whitelabel_config`: has update policy for admins

## Edge Functions

### New: `admin-delete-user`

Purpose: Delete user and all associated data (requires service role for auth.users)

Request:
```typescript
{
  user_id: string
}
```

Logic:
1. Verify caller is admin (same pattern as admin-create-user)
2. Prevent self-deletion
3. Delete user's funnels
4. Delete user_subscriptions record
5. Delete admin_users record (if exists)
6. Delete profiles record
7. Delete auth.users record using admin.deleteUser()

Response:
```typescript
{
  success: boolean
  message: string
}
```

### New: `admin-reset-password`

Purpose: Send password reset email to user

Request:
```typescript
{
  user_id: string
  email: string
}
```

Logic:
1. Verify caller is admin
2. Generate reset token (similar to send-password-reset)
3. Send reset email to user

Response:
```typescript
{
  success: boolean
  message: string
}
```

## UI Components Specification

### IconPicker Component

Props:
- `value: string` - currently selected icon name
- `onChange: (icon: string) => void` - callback when icon selected
- `disabled?: boolean`

Features:
- Popover or Dialog trigger showing current icon
- Grid of all available icons (12 currently, expandable)
- Icon name shown on hover
- Search/filter input for large icon sets

### FeatureFormEditor Component

Props:
- `features: WhitelabelFeature[]`
- `onChange: (features: WhitelabelFeature[]) => void`

Features:
- Render array of feature forms
- Each row: IconPicker, title Input, description Textarea
- Add button to append new feature
- Remove button per row
- Drag-to-reorder (optional, nice-to-have)

### TestimonialFormEditor Component

Props:
- `testimonials: WhitelabelTestimonial[]`
- `onChange: (testimonials: WhitelabelTestimonial[]) => void`

Features:
- Render array of testimonial forms
- Each row: quote Textarea, author Input, role Input, image URL Input
- Avatar preview from URL
- Add/remove buttons

### FAQFormEditor Component

Props:
- `faq: WhitelabelFAQ[]`
- `onChange: (faq: WhitelabelFAQ[]) => void`

Features:
- Render array of Q&A forms
- Question: Input field
- Answer: Textarea with markdown support
- Preview toggle to show rendered markdown
- Markdown hints text below answer field

### LogoUploader Component

Props:
- `value: string | null` - current URL
- `onChange: (url: string | null) => void`
- `label: string` - "Light Logo" or "Dark Logo"
- `bucket?: string` - defaults to "funnel-logos"

Features:
- URL input field
- "Upload" button that opens file picker
- File type validation (images only)
- Upload progress indicator
- Preview image from URL
- "Recommended: 200x50px" size hint

### MarkdownPreview Component

Props:
- `content: string` - markdown string

Features:
- Render markdown to HTML safely
- Support: bold, italic, links, lists, paragraphs
- Match landing page text styling

## API/Integration Points

### Supabase Storage

- Bucket: `funnel-logos` (existing, public)
- Upload path: `whitelabel/{timestamp}-{filename}`
- Get public URL after upload

### Supabase Auth Admin API

- Used in edge function for user deletion
- `supabase.auth.admin.deleteUser(userId)`

### Existing Edge Functions

- Extend pattern from `admin-create-user` for new edge functions
- Same auth verification and error handling patterns

## Security Considerations

- All admin actions protected by `is_admin()` check via RLS
- Edge functions verify admin status before proceeding
- User deletion requires confirmation dialog with explicit acknowledgment
- Cannot delete yourself (admin lockout prevention)
- Tier deletion blocked if subscribers exist (data integrity)
- File uploads limited to image types
- File size limits enforced by Supabase Storage settings

## Out of Scope

- Soft delete for users (decided on hard delete)
- File upload for testimonial avatars (URL only)
- Rich text editor beyond markdown for FAQ
- Drag-and-drop reordering for Features/Testimonials/FAQ
- Bulk operations (delete multiple users, etc.)
- User impersonation feature
- Audit logging for admin actions

## Success Criteria

- Admin can create new subscription tier and see it in the Products list
- Admin can delete tier only when subscriber count is 0
- Admin can edit user email and see update reflected in user list
- Admin can trigger password reset for any user
- Admin can delete user and verify user is fully removed
- Admin can upload logo file and see it displayed on landing page
- Admin can edit features using icon picker without writing JSON
- Admin can edit testimonials using form fields
- Admin can edit FAQ with markdown preview showing formatted content
- All actions show appropriate success/error toasts
- Confirmation dialogs display before destructive actions
