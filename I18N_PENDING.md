# 🌍 i18n Implementation Status

## ✅ Completed
- [x] **Landing Page** - Fully translated (EN/ES)
- [x] **Guest Project Page** - Header and main sections (EN/ES)
- [x] **Language Switcher** - Component created and functional
- [x] **i18n Configuration** - Setup complete with localStorage
- [x] **Translation files structure** - en.json / es.json created

## ⚠️ Partially Completed
- [ ] **GuestProjectPage** - Needs completion of:
  - [ ] Line Items section texts
  - [ ] Preview section texts  
  - [ ] Download modal texts

## 🔴 Pending - Need Full i18n Implementation

### Auth Pages
- [ ] **LoginPage** (`/features/auth/pages/LoginPage.tsx`)
  - Extract: form labels, buttons, error messages, links
  - Add translations for: "Sign In", "Email", "Password", "Remember me", "Forgot password?", "Don't have an account?"

- [ ] **RegisterPage** (`/features/auth/pages/RegisterPage.tsx`)
  - Extract: form labels, buttons, validation messages
  - Add translations for: "Create Account", "Full Name", "Company", "Already have an account?"

### App Pages  
- [ ] **DashboardPage** (`/features/dashboard/pages/DashboardPage.tsx`)
  - Extract: KPIs labels, welcome message, action buttons
  - Add translations for: "Welcome back", "Total Projects", "Active Estimates", "Revenue", "Quick Actions"

- [ ] **ProjectsPage** (`/features/projects/pages/ProjectsPage.tsx`)
  - Extract: page title, filters, table headers, action buttons
  - Add translations for: "My Projects", "New Project", "Status", "Client", "Created", "Actions"

- [ ] **ProjectDetailPage** (`/features/projects/pages/ProjectDetailPage.tsx`)
  - Extract: section titles, tabs, buttons
  - Add translations for: "Project Details", "Areas", "Estimates", "Timeline", "Edit", "Delete"

- [ ] **NewEstimatePage** (`/features/estimates/pages/NewEstimatePage.tsx`)
  - Extract: wizard steps, form labels, calculation results
  - Add translations for: "New Estimate", "Select Templates", "Review & Adjust", "Summary"

- [ ] **MaterialsPage** (`/features/materials/pages/MaterialsPage.tsx`)
  - Extract: table headers, filters, CRUD actions
  - Add translations for: "Materials Catalog", "Add Material", "Category", "Unit", "Price", "Yield"

- [ ] **BillingPage** (`/features/billing/pages/BillingPage.tsx`)
  - Extract: plan details, payment info, subscription status
  - Add translations for: "Billing", "Current Plan", "Payment Method", "Invoices", "Upgrade to Pro"

### Layout Components
- [ ] **Sidebar** (`/components/layout/Sidebar.tsx`)
  - Extract: navigation menu items
  - Add translations for: "Dashboard", "Projects", "Estimates", "Materials", "Clients", "Billing", "Settings"

- [ ] **Header** (`/components/layout/Header.tsx`)
  - Extract: user menu, notifications
  - Add translations for: "Profile", "Settings", "Sign Out"

- [ ] **AuthLayout** (`/components/layout/AuthLayout.tsx`)
  - Extract: taglines, marketing copy
  - Already uses "Brikio" - verify and translate any hardcoded text

## 📋 Implementation Pattern

For each page, follow this pattern:

### 1. Add translations to `en.json`:
```json
{
  "pageName": {
    "title": "Page Title",
    "subtitle": "Subtitle text",
    "buttons": {
      "save": "Save",
      "cancel": "Cancel"
    },
    "labels": {
      "field1": "Field Label"
    }
  }
}
```

### 2. Add translations to `es.json`:
```json
{
  "pageName": {
    "title": "Título de Página",
    "subtitle": "Texto del subtítulo",
    "buttons": {
      "save": "Guardar",
      "cancel": "Cancelar"
    },
    "labels": {
      "field1": "Etiqueta del Campo"
    }
  }
}
```

### 3. Update Component:
```typescript
import { useTranslation } from 'react-i18next';

export function PageName() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('pageName.title')}</h1>
      <p>{t('pageName.subtitle')}</p>
      <button>{t('pageName.buttons.save')}</button>
    </div>
  );
}
```

## 🎯 Priority Order

1. **HIGH Priority** (User-facing, frequently used):
   - LoginPage
   - RegisterPage
   - DashboardPage
   - Sidebar (navigation)

2. **MEDIUM Priority**:
   - ProjectsPage
   - NewEstimatePage
   - MaterialsPage

3. **LOW Priority**:
   - BillingPage
   - ProjectDetailPage
   - Settings pages

## 📝 Notes

- All pages MUST support both English and Spanish
- Use `useTranslation()` hook from `react-i18next`
- Brand name "Brikio" doesn't need translation (use `t('brand.name')`)
- Price is $7/month (use `t('pricing.pro.price')`)
- Keep consistent translation keys structure
- Test language switcher on each page after implementation

## 🔍 How to Find Hardcoded Text

Run this command to find pages with hardcoded English text:
```bash
grep -r "Sign in\|Log in\|Dashboard\|Projects" frontend/src/features --include="*.tsx"
```

## ✅ Completion Checklist

Before marking a page as complete:
- [ ] All visible text uses `t()` function
- [ ] Both EN and ES translations added to JSON files
- [ ] Language switcher tested on the page
- [ ] No console errors
- [ ] Brand name uses `t('brand.name')`
- [ ] Pricing uses translation keys

