# Project Review & Refactoring Plan

## 1. 🛑 Issues Identified

### A. The Dashboard Problem (`/project/page.tsx`)
Currently, `app/(routes)/project/page.tsx` is completely empty (just says `<div>Page</div>`). However, `KINDE` is set to redirect users here after login out of the box. 
**Issue:** Users log in and see a blank page, or they are forced to use the home page (`/`) which mixes marketing content with authenticated app content.

### B. Misplaced "Recent Projects" (Duplication/Confusion)
The "Recent Projects" section is currently placed at the bottom of `landing-section.tsx`.
**Issue:** It clutters the landing page. The landing page should be for marketing and starting a new project. Past projects belong in a dedicated Dashboard (`/project`).

### C. Cluttered Prompt Input UI
The `PromptInput` component has too many features that confuse the user:
- `Creative` vs `Precise` mode toggle
- `En` / `Ar` Language toggle (AI can auto-detect language anyway)
- Redundant buttons and sections.
**Issue:** A generative AI tool should be as simple as a single text box (like Google or v0).

### D. Redundant Components & Pages
- `app/(routes)/gallery/page.tsx`: Contains public projects, which is fine, but might need UI cleanup.
- Other minor unused imports and files.

---

## 2. 🛠️ Action Plan (Refactoring)

### Phase 1: Rebuilding the Dashboard (`/project`)
- **Move** the "Recent Projects" grid from the Landing Page (`landing-section.tsx`) to the Dashboard (`app/(routes)/project/page.tsx`).
- **Create** a clean, dedicated workspace where users can see all their past projects in one place.
- **Update** the Landing page so it focuses ONLY on the hero section, the prompt input, and marketing (testimonials, etc.). Logged-in users will have a clear "Go to Dashboard" button in the header.

### Phase 2: Simplifying the AI Input (UX/UI)
- **Remove** the `Language (En/Ar)` toggle. We will update the prompt system to automatically detect and respond in the user's language.
- **Remove** the `Creative/Precise` mode toggle. It adds cognitive load. We will use one optimized generation mode by default.
- **Enhance** the Prompt Input to be highly minimalist, clean, and mobile-friendly.

### Phase 3: Mobile Experience Enhancements
- Hide complex editing tools on mobile by default.
- Add quick-action template buttons directly above the chat box on mobile so users don't need to type long prompts on small screens.

### Phase 4: Code & Route Cleanup
- Delete unused testing files if any.
- Remove redundant API calls.
- Optimize imports.

---

**Execution:** I will start executing this plan step-by-step, beginning with creating the proper Dashboard and cleaning up the Landing Page.
