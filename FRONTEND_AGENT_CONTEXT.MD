========================
FRONTEND AGENT CONTEXT
========================

Repo: website (React + TypeScript)

ROLE:
You are modifying the frontend UI only.
Do NOT implement business logic in the frontend.
Always rely on backend responses for correctness.

Backend status:
- `dress_code` is now supported by backend event create/edit/read flows.
- backend network/member responses may now include `display_email`
- backend e-board responses may now include `display_email`
- backend still preserves `user_email`
- frontend should prefer `display_email` when present, and fall back to `user_email`

--------------------------------
FEATURE 1: NETWORK DROPDOWN
--------------------------------

GOAL:
Replace top-level nav items:
- Members
- Alumni

WITH:
Network ▼
  - Members (/network)
  - Alumni (/alumni)
  - Eboard (/eboard-network)

FILES:
- src/components/nav/NavLink.ts
- src/components/layout/Navbar.tsx

CHANGES:

1. Update nav type:

type NavItem = {
  name: string;
  href?: string;
  children?: { name: string; href: string }[];
};

2. Update getNavLinks() to use:

{
  name: "Network",
  children: [
    { name: "Members", href: "/network" },
    { name: "Alumni", href: "/alumni" },
    { name: "Eboard", href: "/eboard-network" }
  ]
}

3. Navbar behavior:
- If `item.children` exists, render a dropdown
- Desktop: support hover and/or click
- Mobile: render as a collapsible section
- Preserve existing logged-out behavior unless current app logic already gates these links by auth

--------------------------------
FEATURE 2: EBOARD PAGE
--------------------------------

CREATE:
- src/pages/network/EboardPage.tsx

ROUTE:
- Add route for `/eboard-network`

FETCH:
- GET `/eboard`

IMPORTANT:
- Use backend response as the source of truth
- Do not hardcode role-email substitution logic in frontend

DATA MAPPING:
Map backend e-board entries into the same shape expected by the existing network list UI.

Minimum mapping target:

{
  type: "member",
  name: entry.name,
  email: entry.display_email || entry.role_email || entry.email,
  major: entry.major
}

If the existing shared list component expects additional fields, adapt the mapping to match that existing contract.

REUSE:
- Reuse existing network UI where possible
- Prefer reusing `NetworkList.tsx`

--------------------------------
FEATURE 3: DRESS CODE FIELD
--------------------------------

FILES:
- CreateEventModal.tsx
- EditEventModal.tsx

ADD STATE:
const [dressCode, setDressCode] = useState("");

ADD INPUT:
<input
  type="text"
  placeholder="e.g., Business Professional"
  value={dressCode}
  onChange={(e) => setDressCode(e.target.value)}
/>

ADD TO PAYLOAD:
dress_code: dressCode.trim()

EDIT MODE:
- Ensure existing event `dress_code` populates edit form state if available
- Preserve current modal structure and styling patterns

--------------------------------
FEATURE 4: DISPLAY DRESS CODE
--------------------------------

IN EVENT UI:
Render dress code only when present.

Example:

{event.dress_code && (
  <p>Dress Code: {event.dress_code}</p>
)}

APPLY TO:
- event cards
- event detail views
- any event modal/preview that already shows event metadata

Keep placement visually consistent with existing event metadata.

--------------------------------
FEATURE 5: EMAIL SUBSTITUTION
--------------------------------

BACKEND WILL PROVIDE:
- `display_email`

USE:
- `email: item.display_email || item.user_email`

FILES:
- NetworkPage.tsx
- AlumniPage.tsx
- NetworkList.tsx

IMPORTANT:
- Do NOT compute substitution logic in frontend
- Do NOT infer e-board membership in frontend
- Only display backend-provided data

RULE:
Whenever rendering an email for network/alumni/member directory style UIs, prefer:
- `display_email`
- then fallback to `user_email`

--------------------------------
IMPLEMENTATION NOTES
--------------------------------

Auth/visibility intent:
- Logged in users should have access to:
  - Members
  - Alumni
  - Eboard
- Logged out behavior should remain consistent with the current app unless routing/nav auth logic explicitly requires adjustment to expose the new dropdown structure

Component strategy:
- Reuse existing list and page patterns where possible
- Avoid duplicating network rendering logic
- Keep routing and UI changes minimal and consistent with the current codebase

Data contract reminders:
- Backend owns correctness
- Frontend only displays:
  - `dress_code`
  - `display_email`
  - `/eboard` results
- Do not add frontend-only transformations beyond adapting backend payloads into existing component props

--------------------------------
RULES
--------------------------------

- DO NOT hardcode eboard business logic
- DO NOT compute email substitution
- DO NOT replace `user_email`
- ONLY display backend-provided data
- Keep logic in frontend limited to presentation, routing, and local UI state
- Reuse existing components whenever possible

--------------------------------
CHECKLIST
--------------------------------

[ ] Network dropdown works
[ ] Members/Alumni moved under Network
[ ] Eboard page created
[ ] `/eboard-network` route added
[ ] Eboard page reuses existing list UI
[ ] Dress code input added to create event
[ ] Dress code input added to edit event
[ ] Dress code included in create payload
[ ] Dress code included in edit payload
[ ] Dress code displayed in event UI
[ ] Email uses `display_email` when provided
[ ] No frontend hardcoded eboard/email substitution logic added

========================
END FRONTEND CONTEXT
========================
