# Bucks2Bar Project Instructions

## Project Overview
Static front-end web app for visualizing monthly income vs expense data using Chart.js. No backend, no persistence, purely client-side. Built as a GitHub Copilot demonstration project.

## Architecture

### File Structure
- `index.html` - Single-page entry point with inline styles and CDN dependencies
- `script.js` - All application logic in a single IIFE (Immediately Invoked Function Expression)
- `keep/` - Contains project screenshots (not part of runtime)

### Core Dependencies (CDN-loaded)
- Bootstrap 5.3.2 - UI framework and styling
- Shards UI 1.2.0 - Additional component styling
- Font Awesome 6.5.0 - Icons
- Chart.js 4.4.0 - Bar chart visualization

## Code Conventions

### JavaScript Patterns
1. **IIFE Encapsulation**: Entire codebase wrapped in `(() => { ... })()` to avoid global scope pollution
2. **Utility Functions** (top of script.js):
   - `qs(selector)` - shorthand for `querySelector`
   - `qsa(selector)` - shorthand for `querySelectorAll` (returns array)
   - `el(tag, attrs, children)` - programmatic DOM element creation
   - `debounce(fn, wait)` - debounce utility (300ms standard)
   
3. **DOM Pattern**: Direct element references via ID selectors, no component framework

### Data Flow
1. 12 months of inputs rendered dynamically in `renderDataInputs()`
2. Inputs pre-filled with random amounts (2000-8000 income, 1500-6000 expense)
3. Live validation on input/blur events (must be non-negative numbers)
4. Debounced updates (300ms) automatically refresh chart
5. Chart.js instance stored in module-scoped `chart` variable

### Validation Strategy
- Non-negative numbers only (min="0" in HTML + validation logic)
- Block `-`, `e`, `E` keys on keydown to prevent exponential/negative entry
- Invalid inputs get Bootstrap `.is-invalid` class
- Validation runs on blur and debounced input events
- Chart updates even with invalid data (clamped to 0) for visibility

### Tab System
- Two tabs: "Data" (form) and "Chart" (visualization)
- Accessible with ARIA attributes (`role="tab"`, `aria-selected`, `aria-controls`)
- Keyboard navigation: Arrow keys switch focus between tabs
- Chart auto-updates when switching to Chart tab

## Development Workflow

### Running Locally
No build step required. Use Live Server extension (Five Server) or any static HTTP server:
```powershell
# From project root
python -m http.server 8000
# or just open index.html in browser
```

### Making Changes
1. **Adding New Features**: Extend the IIFE in script.js, following existing utility patterns
2. **Modifying Styles**: Add CSS to `<style>` block in index.html (Bootstrap classes preferred)
3. **New Dependencies**: Add CDN links to index.html `<head>` (script tags before closing `</body>`)

### Testing
- Manual testing only - open in browser and verify interactions
- Test validation: try entering negative numbers, letters, empty fields
- Test responsive behavior: resize window to check Bootstrap breakpoints
- Test accessibility: keyboard navigation through tabs and form inputs

## Key Implementation Details

### Chart Configuration
- Type: Grouped bar chart (not stacked)
- Two datasets: Income (green), Expense (red)
- Y-axis starts at 0, no stacking
- Responsive but with fixed height (320px canvas)
- Chart instance destroyed/recreated when needed to avoid memory leaks

### Download Functionality
- Chart downloads as PNG using `chart.toBase64Image()`
- Filename format: `income-expense-chart-YYYY-MM-DD.png`
- Triggered by "Download Chart as PNG" button in Chart tab

### No Data Persistence
- All data lives in DOM input values
- Page refresh resets to random data
- No localStorage, no backend API
- This is intentional - ephemeral demo app

## Common Tasks

### Adding a New Month
Not implemented - hardcoded to 12 months (Jan-Dec). Would require updating `months` array and adjusting form rendering.

### Changing Validation Rules
Edit `validateInputs()` function. Current rule: `Number.isFinite(val) && val >= 0`

### Modifying Chart Appearance
Edit `createChart()` options object. Colors defined in `datasets[].backgroundColor/borderColor`.

### Adding New Tab
1. Add button to `#tabs` in index.html with proper ARIA attributes
2. Add corresponding panel section with `role="tabpanel"`
3. Extend `initTabs()` to handle new tab's show/hide logic
