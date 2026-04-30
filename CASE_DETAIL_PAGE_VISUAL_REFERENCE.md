# 📋 Case Detail Page - Visual Layout Reference

## DESKTOP VIEW (60/40 SPLIT)

```
┌─ CASE DETAIL PAGE ────────────────────────────────────────────────────────┐
│                                                                            │
│ ← Back to Cases                                                           │
│                                                                            │
│ ┌─ LEFT COLUMN (60%) ──────────────────┬─ RIGHT COLUMN (40%) ───────────┐ │
│ │                                      │                                 │ │
│ │ CASE HEADER                          │ CASE TIMELINE                   │ │
│ │ ═══════════════════════════════════  │ ═════════════════════════════   │ │
│ │                                      │                                 │ │
│ │ CASE-001 [Status Badge]              │ 🟦 Last 10 Events (newest)     │ │
│ │ Case Title Here                      │                                 │ │
│ │ [SIM SWAP Badge]                     │ • Action 1  - 2 hours ago       │ │
│ │                                      │ • Action 2  - 5 hours ago       │ │
│ │ Case description paragraph...        │ • Action 3  - 1 day ago         │ │
│ │                                      │ • Action 4  - 2 days ago        │ │
│ │ 📌 Suspect Info                      │ • Action 5  - 3 days ago        │ │
│ │ Suspect details...                   │ ...more...                      │ │
│ │                                      │                                 │ │
│ │ ──────────────────────────────────   │ ──────────────────────────────  │ │
│ │ Opened: Apr 01    Investigator: Joe  │ CASE ACTIONS                    │ │
│ │ Evidence: 5       Priority: HIGH     │ ═════════════════════════════   │ │
│ │                                      │                                 │ │
│ │ EVIDENCE ITEMS TABLE                 │ [➕ Add Evidence] Button        │ │
│ │ ═══════════════════════════════════  │                                 │ │
│ │                                      │ [📄 Change Status] Button       │ │
│ │ Evidence │ Descr. │ Type   │ Status  │                                 │ │
│ │ ─────────┼────────┼────────┼────────  │ [⬇️ Export PDF] Button          │ │
│ │ e1d2c3b4 │ Details│ Device │ ACTIVE  │                                 │ │
│ │ Link2 Chain | ✓ Verify | ➜ Transfer │                                 │ │
│ │ ─────────┼────────┼────────┼────────  │                                 │ │
│ │ f2e3d4c5 │ Details│ File   │ PENDING │                                 │ │
│ │ Link2 Chain | ✓ Verify | ➜ Transfer │                                 │ │
│ │ ─────────┼────────┼────────┼────────  │                                 │ │
│ │ g3f4e5d6 │ Details│ Memory │ ACTIVE  │                                 │ │
│ │ Link2 Chain | ✓ Verify | ➜ Transfer │                                 │ │
│ │                                      │                                 │ │
│ │ [5 more rows...]                    │                                 │ │
│ │                                      │                                 │ │
│ └──────────────────────────────────────┴─────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## CUSTODY DRAWER (SLIDE-IN FROM RIGHT)

```
When "View Chain" is clicked:

┌─────────────────────────────────────────────────────────┐
│                                                DRAWER   │
│ ┌───────────────────────────────────────────────────┐   │
│ │ 🔗 CHAIN OF CUSTODY                            X  │   │
│ │ Evidence: Laptop Hard Drive                       │   │
│ ├───────────────────────────────────────────────────┤   │
│ │                                                   │   │
│ │ 📋 [COLLECTED]        Apr 01, 2024 10:30        │   │
│ │ Det. John Doe                                     │   │
│ │ 📍 123 Main St, City                             │   │
│ │ Collected from suspect residence                 │   │
│ │                                                   │   │
│ │ 🚚 [IN_TRANSIT]       Apr 02, 2024 14:00        │   │
│ │ Det. Jane Smith                                   │   │
│ │ 📍 Forensics Lab, Bldg B                         │   │
│ │ Transported to lab for analysis                  │   │
│ │                                                   │   │
│ │ 🔬 [IN_ANALYSIS]      Apr 03, 2024 09:15        │   │
│ │ Dr. Lisa Chen                                     │   │
│ │ 📍 Lab Room 201                                  │   │
│ │ Examination in progress                          │   │
│ │                                                   │   │
│ │ 🔒 [SECURED]          Apr 05, 2024 16:30        │   │
│ │ Officer Mike Kumar                                │   │
│ │ 📍 Evidence Storage                              │   │
│ │ Evidence secured after analysis                  │   │
│ │                                                   │   │
│ │ [... more records if available]                  │   │
│ │                                                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                         │
│ OVERLAY (50% opacity, clickable to close)              │
└─────────────────────────────────────────────────────────┘
```

---

## STATUS CHANGE MODAL

```
When "Change Status" is clicked:

┌──────────────────────────────────────────────────────────────┐
│ Change Case Status                                         X │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ New Status                                                   │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ▼ REFERRED TO PROSECUTION                              │  │
│ │   _ ACTIVE                                             │  │
│ │   _ PENDING                                            │  │
│ │   _ REFERRED TO PROSECUTION (selected)                 │  │
│ │   _ CLOSED                                             │  │
│ │   _ ARCHIVED                                           │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Reason for Change                                            │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Case evidence analysis complete. Referred to          │  │
│ │ prosecutor for charges determination.                 │  │
│ │                                                        │  │
│ │                                                        │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─────────────────┐  ┌──────────────────────────────────┐  │
│ │ Update Status   │  │         Cancel                   │  │
│ └─────────────────┘  └──────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## EVIDENCE TABLE - COLUMN DETAILS

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Evidence Items                                            [➕ Add Evidence]  │
├──────────┬──────────────────┬────────┬────────┬──────────┬─────────┬─────────┤
│Evidence │      Description  │ Type   │ Status │Collected│ Hash    │ Actions │
│   ID    │                   │        │        │  By     │ Status  │         │
├──────────┼──────────────────┼────────┼────────┼──────────┼─────────┼─────────┤
│e1d2c3b4 │ Suspect laptop   │Device  │ACTIVE  │ John D. │ INTACT  │Chain... │
│         │ hard drive       │        │        │         │  [✓]    │Verify..│
│         │                  │        │        │         │         │Transfer│
├──────────┼──────────────────┼────────┼────────┼──────────┼─────────┼─────────┤
│f2e3d4c5 │ USB flash drive  │File    │PENDING │ Jane S. │TAMPERED │Chain... │
│         │ from scene       │        │        │         │  [⚠️]   │Verify..│
│         │                  │        │        │         │         │Transfer│
├──────────┼──────────────────┼────────┼────────┼──────────┼─────────┼─────────┤
│g3f4e5d6 │ Memory dump file │Memory  │ACTIVE  │ Mike C. │ INTACT  │Chain... │
│         │ (8GB)            │        │        │         │  [✓]    │Verify..│
│         │                  │        │        │         │         │Transfer│
└──────────┴──────────────────┴────────┴────────┴──────────┴─────────┴─────────┘

Column Explanations:
- Evidence ID: UUID (first 8 chars shown in font-mono)
- Description: Evidence name + details (truncated with ellipsis if long)
- Type: Device, File, Memory, Other
- Status: ACTIVE/PENDING/ARCHIVED badge
- Collected By: Officer name
- Hash Status: INTACT (green check) / TAMPERED (red warning)
- Actions: View Chain | Verify Hash | Transfer
```

---

## CASE HEADER SECTION

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│ CASE-001 [ACTIVE Status Badge]                                            │
│ Digital Fraud Investigation - SIM Swap Attack                             │
│ [SIM SWAP Badge - Red]                                                    │
│                                                                            │
│ This case involves a coordinated SIM swap attack targeting cryptocurrency │
│ wallets. Multiple victims reported unauthorized access after SIM swaps.   │
│                                                                            │
│ 📌 SUSPECT INFORMATION (Optional)                                         │
│ John Smith, DOB: 01/15/1992, Address: 456 Oak Ave, Cityville, ST         │
│                                                                            │
│ ─────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│ Opened: Apr 01, 2024    Investigator: Detective John Doe                 │
│ Evidence: 5 items        Priority: HIGH                                   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## CASE TIMELINE (RIGHT PANEL)

```
┌────────────────────────────────────────┐
│ 🕐 CASE TIMELINE                       │
├────────────────────────────────────────┤
│                                        │
│ 🟦 TRANSFERRED      Apr 05, 14:22     │
│ Officer Jane Smith                     │
│                                        │
│ 🟦 IN_ANALYSIS      Apr 03, 09:15     │
│ Dr. Lisa Chen                          │
│                                        │
│ 🟦 IN_TRANSIT       Apr 02, 14:00     │
│ Det. Jane Smith                        │
│                                        │
│ 🟦 COLLECTED        Apr 01, 10:30     │
│ Det. John Doe                          │
│                                        │
│ [... 6 more events if available]      │
│                                        │
└────────────────────────────────────────┘
```

---

## MOBILE VIEW (STACKED)

```
┌─────────────────────────────────
│ ← Back to Cases
│
│ CASE-001 [ACTIVE Badge]
│ Case Title
│ [SIM SWAP Badge]
│
│ Description text...
│
│ [Opened] [Investigator]
│ [Evidence] [Priority]
│
│ EVIDENCE TABLE
│ [Scrollable horizontally]
│ Evidence │ Description
│ e1d2c3b4 │ Device
│          │ [Chain] [Verify] [Transfer]
│
│ CASE TIMELINE
│ [Events list]
│
│ CASE ACTIONS
│ [Full-width buttons]
│ [➕ Add Evidence]
│ [📄 Change Status]
│ [⬇️ Export PDF]
│
└─────────────────────────────────
```

---

## COLOR CODING

### Status Badges
```
[ACTIVE]    - Green background, darker green text
[PENDING]   - Yellow background, darker yellow text
[REFERRED]  - Blue background, darker blue text
[CLOSED]    - Red background, darker red text
[ARCHIVED]  - Gray background, darker gray text
```

### Fraud Type Badges
```
[SIM SWAP]         - Red border, red text
[BEC]              - Orange border, orange text
[INSIDER FRAUD]    - Purple border, purple text
[PHISHING]         - Yellow border, yellow text
[IDENTITY THEFT]   - Pink border, pink text
[MONEY LAUNDERING] - Indigo border, indigo text
[CYBER ATTACK]     - Cyan border, cyan text
```

### Hash Status Badges
```
[✓ INTACT]    - Green background ✓
[⚠️ TAMPERED] - Red background   ⚠️
```

### Custody Status (In Drawer)
```
COLLECTED    - Gray (#e5e7eb) background
IN_TRANSIT   - Blue (#eff6ff) background
IN_ANALYSIS  - Amber (#fffbf0) background
SECURED      - Green (#f0fdf4) background
SUBMITTED    - Purple (#f3f0ff) background
```

---

## ACTION BUTTONS

### Top Right of Evidence Table
```
[➕ Add Evidence] - Accent Blue, navigates to /evidence/new?caseId={id}
```

### Case Actions Panel (Right Column)
```
[➕ Add Evidence]       - Accent Blue (#2563EB)
[📄 Change Status]     - Medium Blue (#2563eb)
[⬇️ Export PDF]        - Green (#16a34a), disabled if no evidence
```

### Evidence Table Actions
```
[🔗 Chain]    - Text link "Chain", accent blue
[✓ Verify]    - Text link "Verify", blue-600
[➜ Transfer]  - Text link "Transfer", green-600
```

---

## INTERACTIVE ELEMENTS

### Hover States
```
Evidence rows:     bg-gray-50 (light gray)
Timeline entries:  none
Buttons:           color darker/opacity-90
Links:             underline, color change
```

### Active States
```
Modal:             Fixed position z-50, overlay z-40
Drawer:            Fixed position z-50, overlay z-40
Open:              Enabled form fields
```

---

## KEYBOARD NAVIGATION

- Tab: Move between form fields and buttons
- Enter: Submit forms, activate buttons
- Escape: Close modals/drawers (future enhancement)

---

**Version:** 1.0
**Last Updated:** 2026-04-11
**Status:** ✅ Complete
