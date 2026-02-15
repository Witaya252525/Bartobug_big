# Bucks2Bar Project Instructions

## Project Overview

Static front-end web app for visualizing monthly income vs expense data using Chart.js. No backend, no persistence, purely client-side. Built as a GitHub Copilot demonstration project. Includes username validation form and chart download functionality.

## Architecture

### File Structure

- `index.html` - Single-page entry point with inline styles and CDN dependencies
- `script.js` - All application logic with IIFE pattern + exported validation function
- `script.test.js` - Jest test suite for username validation (24 test cases)
- `package.json` - Dependencies and test scripts
- `jest.config.js` - Jest configuration
- `keep/` - Contains project screenshots (not part of runtime)

### Core Dependencies (CDN-loaded)

- Bootstrap 5.3.2 - UI framework and styling
- Shards UI 1.2.0 - Additional component styling
- Font Awesome 6.5.0 - Icons
- Chart.js 4.4.0 - Bar chart visualization

### Development Dependencies

- Jest 27.0.0 - Testing framework (@jest/globals)

## Code Conventions

### JavaScript Patterns

1. **IIFE Encapsulation**: Entire codebase wrapped in `(() => { ... })()` to avoid global scope pollution
2. **Exported Functions**: `validateUsername()` extracted outside IIFE for testing, conditionally exported for Node.js
3. **Utility Functions** (top of script.js IIFE):
   - `qs(selector)` - shorthand for `querySelector`
   - `qsa(selector)` - shorthand for `querySelectorAll` (returns array)
   - `el(tag, attrs, children)` - programmatic DOM element creation
   - `debounce(fn, wait)` - debounce utility (300ms standard)
   - `randomAmount(min, max)` - generates random decimal values for default inputs
4. **DOM Pattern**: Direct element references via ID selectors, no component framework

### Data Flow

1. 12 months of inputs rendered dynamically in `renderDataInputs()`
2. Inputs pre-filled with **random amounts** (2000-8000 income, 1500-6000 expense)
3. Live validation on input/blur events (must be non-negative numbers)
4. Debounced updates (300ms) automatically refresh chart
5. Chart.js instance stored in module-scoped `chart` variable

### Username Validation

- **Location**: Form at top of page (before data tabs)
- **Requirements**:
  - Minimum 5 characters
  - At least 1 uppercase letter (A-Z)
  - At least 1 special character (!@#$%^&\*()\_+-=[]{}:;"\\|,.<>/?)
- **Validation Function**: `validateUsername(username)` - uses three regex checks
- **Real-time Feedback**: Shows `.is-valid` or `.is-invalid` Bootstrap classes
- **Form Structure**: Proper `<form>` with submit handler (prevents default)
- **Testing**: Comprehensive Jest test suite with 24 tests covering valid, invalid, and edge cases

### Validation Strategy

#### Numeric Inputs (Income/Expense)

- Non-negative numbers only (min="0" in HTML + validation logic)
- Block `-`, `e`, `E` keys on keydown to prevent exponential/negative entry
- Invalid inputs get Bootstrap `.is-invalid` class
- Validation runs on blur and debounced input events
- Chart updates even with invalid data (clamped to 0) for visibility

#### Username Input

- Real-time validation on `input` event
- Bootstrap validation classes applied
- Form submit with `preventDefault()`
- Success/error alerts on submission

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

### Testing

Automated testing with Jest:

```bash
npm install           # Install dependencies
npm test             # Run all tests
npm test -- --watch  # Watch mode
npm test -- --coverage  # With coverage report
```

Manual testing:

- Open in browser and verify interactions
- Test validation: try entering negative numbers, letters, empty fields
- Test username: try invalid combinations (no uppercase, no special char, too short)
- Test responsive behavior: resize window to check Bootstrap breakpoints
- Test accessibility: keyboard navigation through tabs and form inputs

### Making Changes

1. **Adding New Features**: Extend the IIFE in script.js, following existing utility patterns
2. **Modifying Styles**: Add CSS to `<style>` block in index.html (Bootstrap classes preferred)
3. **New Dependencies**: Add CDN links to index.html `<head>` (script tags before closing `</body>`)
4. **Writing Tests**: Extract testable functions outside IIFE, add to script.test.js with describe blocks

## Key Implementation Details

### Username Validation Function

```javascript
// Located outside IIFE for testing
function validateUsername(username) {
  const hasUppercase = /[A-Z]/.test(username);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(username);
  const isLongEnough = username.length >= 5;
  return hasUppercase && hasSpecialChar && isLongEnough;
}
```

- Returns boolean (true if valid)
- Exported via `module.exports` for Node.js testing environment only
- Used in both browser (form validation) and Node.js (Jest tests)

### Chart Configuration

- Type: Grouped bar chart (not stacked)
- Two datasets: Income (green rgba(40,167,69,0.8)), Expense (red rgba(220,53,69,0.85))
- Y-axis starts at 0, no stacking
- Responsive but with fixed height (320px canvas)
- Chart instance destroyed/recreated when needed to avoid memory leaks

### Download Functionality

- Chart downloads as PNG using `chart.toBase64Image()`
- Filename format: `income-expense-chart-YYYY-MM-DD.png`
- Triggered by "Download Chart as PNG" button in Chart tab (green button)
- Creates temporary `<a>` element, triggers click, removes from DOM

### Random Default Values

- Income: Random value between $2000.00 and $8000.00
- Expense: Random value between $1500.00 and $6000.00
- Generated via `randomAmount(min, max)` helper function
- Applied to all 12 months on page load
- Can be edited by user (all validations still apply)

### No Data Persistence

- All data lives in DOM input values
- Page refresh resets to new random data
- No localStorage, no backend API
- This is intentional - ephemeral demo app

### UI Elements & Styling

- Bootstrap 5.3.2 (not 5.3.3 as mentioned before)
- Font Awesome 6.5.0 (not 6.5.2)
- Chart.js 4.4.0 (not 4.4.2)
- **Button colors**:
  - Username submit: Red/Danger (`.btn-danger`)
  - Update Chart: Primary blue (`.btn-primary`)
  - Download Chart: Green/Success (`.btn-success`)
  - Download Data: Secondary gray (`.btn-outline-secondary`)

## Testing Architecture

### Test Structure

```javascript
describe("Username Validation", () => {
  describe("Valid usernames", () => {
    test("accepts username with uppercase, special char, and min length", () => {
      expect(validateUsername("Test!")).toBe(true);
    });
    // ... more valid cases
  });

  describe("Invalid usernames", () => {
    test("rejects username shorter than 5 characters", () => {
      expect(validateUsername("Ab#")).toBe(false);
    });
    // ... more invalid cases
  });

  describe("Edge cases", () => {
    test("handles undefined", () => {
      expect(validateUsername(undefined)).toBe(false);
    });
    // ... more edge cases
  });
});
```

### Test Coverage

- **24 test cases** total
- **8 valid username tests**: Various combinations of requirements
- **11 invalid username tests**: Missing requirements, too short, etc.
- **5 edge case tests**: null, undefined, spaces, numbers, mixed case

### Module Exports for Testing

```javascript
// At end of script.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validateUsername };
}
```

- Conditional export prevents errors in browser
- Allows Jest to import and test the function
- Pattern can be extended for other testable functions

## Common Tasks

### Adding a New Month

Not implemented - hardcoded to 12 months (Jan-Dec). Would require updating `months` array and adjusting form rendering.

### Changing Validation Rules

Edit `validateInputs()` function for numeric inputs. Current rule: `Number.isFinite(val) && val >= 0`

Edit `validateUsername()` function for username. Current rules: >=5 chars, 1 uppercase, 1 special char.

### Modifying Chart Appearance

Edit `createChart()` options object. Colors defined in `datasets[].backgroundColor/borderColor`.

### Adding New Tab

1. Add button to `#tabs` in index.html with proper ARIA attributes
2. Add corresponding panel section with `role="tabpanel"`
3. Extend `initTabs()` to handle new tab's show/hide logic

### Writing New Tests

1. Extract function outside IIFE if needed (like `validateUsername`)
2. Add conditional export at end of script.js
3. Import in script.test.js: `const { functionName } = require('./script.js')`
4. Write describe blocks with organized test cases
5. Run `npm test` to verify

### Debugging Test Failures

1. Check that function is properly exported
2. Verify import statement in test file
3. Run individual test: `npm test -- --testNamePattern="test name"`
4. Check for syntax errors in test file
5. Ensure Jest dependencies installed: `npm install`

## Code Quality Guidelines

### When to Extract Functions from IIFE

- Function needs testing with Jest
- Function has no DOM dependencies
- Function is pure/deterministic (same input → same output)
- Example: `validateUsername()` - pure function, no DOM access

### When to Keep Functions Inside IIFE

- Function uses DOM elements (qs, qsa calls)
- Function modifies chart instance
- Function has closure over module variables
- Example: `renderDataInputs()`, `updateChart()`, `wireUsernameSubmit()`

### Event Listener Patterns

```javascript
// Real-time validation
input.addEventListener("input", () => {
  if (isValid(input.value)) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  } else {
    input.classList.remove("is-valid");
    if (input.value.length > 0) {
      input.classList.add("is-invalid");
    } else {
      input.classList.remove("is-invalid");
    }
  }
});

// Form submission
form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  // validation and processing
});
```

## Future Enhancement Ideas

- [ ] Export income/expense data as CSV
- [ ] Import data from JSON file
- [ ] LocalStorage persistence option
- [ ] Additional chart types (line, pie)
- [ ] Date range selector
- [ ] Dark mode toggle
- [ ] Budget goals/targets
- [ ] Category breakdown for expenses
- [ ] Multi-year comparison view
- [ ] Print-friendly view
- [ ] More comprehensive test coverage (DOM interactions, chart rendering)

## Troubleshooting

### Jest Tests Won't Run

- PowerShell execution policy issue: Use `node node_modules/.bin/jest` instead of `npx`
- Missing dependencies: Run `npm install`
- Check package.json has test script: `"test": "jest"`

### Chart Not Updating

- Check browser console for errors
- Verify Chart.js CDN loaded (Network tab)
- Ensure `chart` variable not null
- Check `getMonthlyData()` returns valid structure

### Validation Not Working

- Check Bootstrap CSS loaded
- Verify event listeners attached
- Inspect element classes in DevTools
- Test regex patterns in browser console

### Random Values Not Showing

- Check `randomAmount()` function defined
- Verify values set in `renderDataInputs()`
- Check value attribute in `el()` call
- Inspect input elements for `value` attribute
