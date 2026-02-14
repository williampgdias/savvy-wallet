

# Personal Finance SaaS — Implementation Plan

## Overview
A professional personal finance dashboard with Supabase backend, multi-user auth, CSV import from Revolut, and spending analytics. Apple-inspired minimalist design with dark/light mode.

---

## Phase 1: Authentication & Database Setup

### Supabase Integration
- Connect Supabase (Lovable Cloud) for PostgreSQL database and authentication
- Email/password signup and login pages with clean, minimal design

### Database Schema
- **profiles** table — linked to auth.users, stores display name
- **transactions** table — id, name, amount (numeric), category (text), date (timestamptz), is_income (boolean), user_id (FK to auth.users)
- RLS policies so each user can only access their own transactions

---

## Phase 2: Dashboard

### Summary Cards
- Three key metric cards: **Total Income**, **Total Expenses**, **Net Balance**
- Clean card design with icons, formatted currency values

### Month/Year Filter
- Global month and year selector at the top of the dashboard
- All data (cards, charts, transaction list) responds to the selected period

### Category Spending Chart
- Donut chart (using Recharts) showing expense distribution by category
- Color-coded categories with legend

### Recent Transactions List
- Sortable table of transactions for the selected period
- Category badges, income/expense indicators

---

## Phase 3: Smart Revolut CSV Importer

### Upload Modal
- Modal with drag-and-drop or file picker for CSV files
- Client-side CSV parsing (reading Started Date, Description, Amount columns)

### Auto-Categorization Engine
- Keyword-matching rules applied during import:
  - Groceries: Lidl, Tesco, Aldi, Dunnes
  - Dining Out: Burger King, McDonalds, KFC
  - Lifestyle: Temu, Shein, Amazon, Penneys
  - Entertainment: Dublin Zoo, Netflix, Spotify
  - Transportation: Leap Card, Luas
  - Income: Compass Group, Salary, Caireen Early Years LTD
  - General: Church, I Am Church
- Preview screen showing parsed transactions with assigned categories before saving
- Ability to manually adjust categories before confirming import

### Batch Save
- Save all imported transactions to the database in one action

---

## Phase 4: UI & Layout

### Design System
- Apple-inspired minimalist aesthetic — clean typography, generous whitespace, subtle shadows
- Dark and light mode toggle (using next-themes)

### Navigation
- Responsive sidebar with icons: Dashboard, Transactions, Import
- Collapsible on mobile with hamburger menu

### Mobile Optimization
- Fully responsive layouts for all views
- Touch-friendly controls and appropriately sized tap targets

