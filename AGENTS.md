# Bucks2Bar - Agent Development Guide

## Overview

Bucks2Bar is a client-side income vs expense visualization web application built as a demonstration of GitHub Copilot capabilities. This document provides guidance for AI agents working on this codebase.

## Project Architecture

### Core Technologies

- **HTML5** - Single page application (index.html)
- **Vanilla JavaScript** - No frameworks, pure DOM manipulation
- **Chart.js 4.4.0** - Data visualization
- **Bootstrap 5.3.2** - UI framework and responsive design
- **Font Awesome 6.5.0** - Icons
- **Jest 27.0.0** - Testing framework

### Design Patterns

1. **IIFE (Immediately Invoked Function Expression)**: Main application logic wrapped to avoid global scope pollution
2. **Module Pattern**: Utility functions defined at top of script.js
3. **Event-Driven Architecture**: User interactions trigger validation and chart updates
4. **Progressive Enhancement**: Works without JavaScript for basic form (though chart won't render)

## File Structure

```
Bartobug_big/
├── index.html              # Single page application entry point
├── script.js               # All application logic (439 lines)
├── script.test.js          # Jest test suite (96 lines, 24 tests)
├── package.json            # Node.js dependencies
├── jest.config.js          # Jest configuration
├── README.md               # User-facing documentation
├── .github/
│   └── copilot-instructions.md  # Copilot configuration
└── keep/                   # Project screenshots (not runtime)
```

## Key Features

### 1. Username Validation Form

- **Location**: Top of page, above data tabs
- **Requirements**:
  - Minimum 5 characters
  - At least 1 uppercase letter
  - At least 1 special character (!@#$%^&\*()\_+-=[]{}:;"\\|,.<>/?)
- **Validation**: Real-time with Bootstrap `.is-valid`/`.is-invalid` classes
- **Testing**: Comprehensive Jest test suite with 24 test cases

### 2. Monthly Income/Expense Data Entry

- **12 months** (Jan-Dec) dynamically rendered
- **Random default values**:
  - Income: $2,000 - $8,000
  - Expense: $1,500 - $6,000
- **Live validation**: Non-negative numbers only
- **Debounced updates**: 300ms delay prevents excessive re-renders

### 3. Chart Visualization

- **Type**: Grouped bar chart (not stacked)
- **Datasets**:
  - Income (green: rgba(40,167,69,0.8))
  - Expense (red: rgba(220,53,69,0.85))
- **Responsive**: Maintains aspect ratio, 320px canvas height
- **Auto-update**: Refreshes on data change or tab switch

### 4. Download Functionality

- **Format**: PNG image
- **Filename**: `income-expense-chart-YYYY-MM-DD.png`
- **Method**: Chart.js `toBase64Image()` with programmatic download link

### 5. Tab Navigation

- **Tabs**: Data (form) and Chart (visualization)
- **Accessibility**: Full ARIA attributes and keyboard navigation (arrow keys)
- **State management**: Shows/hides panels, updates button styles

## Code Conventions for Agents

### JavaScript Patterns

```javascript
// Utility functions (use these consistently)
qs(selector); // querySelector shorthand
qsa(selector); // querySelectorAll as array
el(tag, attrs, children); // DOM element creation
debounce(fn, wait); // Debounce function calls
randomAmount(min, max); // Generate random currency values
validateUsername(str); // Username validation (exported for testing)
```

### Naming Conventions

- **IDs**: kebab-case (`username-input`, `monthly-inputs`)
- **Functions**: camelCase (`renderDataInputs`, `validateInputs`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEBOUNCE_MS`)
- **DOM references**: Descriptive (`usernameInput`, `submitBtn`)

### Validation Strategy

1. Prevent invalid input via `keydown` events (block `-`, `e`, `E`)
2. Validate on `input` events (real-time feedback)
3. Validate on `blur` events (when user leaves field)
4. Apply Bootstrap classes: `.is-invalid` or `.is-valid`
5. Show/hide `.invalid-feedback` elements

### Testing Strategy

- **Framework**: Jest with @jest/globals
- **Pattern**: Describe blocks for organization
- **Coverage**: Valid inputs, invalid inputs, edge cases
- **Exports**: Functions extracted from IIFE for testability
- **Environment**: Node.js with conditional module.exports

## Agent Guidelines

### When Adding Features

1. **Maintain IIFE pattern**: New functions go inside `(() => { ... })()`
2. **Use utility functions**: Don't reinvent `qs`, `qsa`, `el`
3. **Follow validation pattern**: Input → Validate → Update UI → Update Chart
4. **Add tests**: Extract function if needed, write describe blocks
5. **Update documentation**: Modify this file and copilot-instructions.md

### When Modifying Validation

```javascript
// Pattern to follow:
element.addEventListener("input", () => {
  if (isValid(element.value)) {
    element.classList.remove("is-invalid");
    element.classList.add("is-valid");
  } else {
    element.classList.remove("is-valid");
    element.classList.add("is-invalid");
  }
});
```

### When Adding New Tabs

1. Add button to `#tabs` with ARIA attributes:

   ```html
   <button
     id="tab-btn-NAME"
     class="btn btn-outline-primary tab-btn"
     role="tab"
     aria-controls="tab-NAME"
     aria-selected="false"
   ></button>
   ```

2. Add panel section:

   ```html
   <section
     id="tab-NAME"
     role="tabpanel"
     aria-labelledby="tab-btn-NAME"
     hidden
   ></section>
   ```

3. Extend `initTabs()` function with show/hide logic

### When Writing Tests

```javascript
describe("Feature Name", () => {
  describe("Valid cases", () => {
    test("should accept valid input", () => {
      expect(functionName(validInput)).toBe(expected);
    });
  });

  describe("Invalid cases", () => {
    test("should reject invalid input", () => {
      expect(functionName(invalidInput)).toBe(expected);
    });
  });

  describe("Edge cases", () => {
    test("should handle undefined", () => {
      expect(functionName(undefined)).toBe(expected);
    });
  });
});
```

## Common Tasks

### Run Tests

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
```

### Start Development Server

```bash
# Using VS Code Five Server extension (recommended)
# Or any static server:
python -m http.server 8000
```

### Debug Issues

1. Open browser DevTools (F12)
2. Check Console for JavaScript errors
3. Use Network tab to verify CDN resources load
4. Inspect Elements to verify DOM structure
5. Check Application/Local Storage (none used currently)

## Data Flow Diagram

```
User Input → Validation → DOM Update → Chart Update
     ↓           ↓            ↓            ↓
  keydown    is-invalid    feedback    chart.update()
   input     is-valid      messages    destroyChart()
   blur      alert()       classes     createChart()
  submit
```

## Technical Constraints

### No Backend

- All data ephemeral (lives in DOM only)
- No localStorage, no cookies
- No API calls
- Page refresh = data reset

### No Build Process

- No webpack, no bundlers
- CDN-loaded dependencies only
- Direct browser execution
- No transpilation

### Browser Compatibility

- Modern browsers only (ES6+ features used)
- No polyfills
- Chart.js handles canvas fallbacks

## Future Enhancement Ideas

- [ ] Export data as CSV/JSON
- [ ] Import data from file
- [ ] LocalStorage persistence toggle
- [ ] Multiple chart types (line, pie)
- [ ] Date range filtering
- [ ] Dark mode toggle
- [ ] Annotation/notes per month
- [ ] Budget target lines
- [ ] Year-over-year comparison

## Troubleshooting

### Tests Not Running

- Check Jest installation: `npm install`
- Verify package.json has test script
- Try: `node node_modules/.bin/jest`

### Chart Not Rendering

- Check Chart.js CDN loaded
- Verify canvas element exists
- Check browser console for errors
- Ensure `createChart()` called after data

### Validation Not Working

- Verify event listeners attached
- Check Bootstrap CSS loaded
- Inspect element classes in DevTools
- Test regex patterns in console

## Contact & Resources

- **GitHub**: [Project Repository URL]
- **Documentation**: See README.md for user guide
- **Copilot Config**: .github/copilot-instructions.md
- **Chart.js Docs**: https://www.chartjs.org/docs/latest/
- **Bootstrap Docs**: https://getbootstrap.com/docs/5.3/
