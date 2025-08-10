# Test Files for Bundle Size Analyzer

## How to Test

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Test with different file types:**

   **Webpack Bundle (JSON):**

   - Upload `webpack-bundle.json`
   - Should show 8 modules with treemap visualization
   - Check insights panel for optimization recommendations

   **Source Map:**

   - Upload `source-map.js.map`
   - Should extract 4 source files

   **JavaScript Bundle:**

   - Upload `sample-bundle.js`
   - Should show as single JS module

   **CSS File:**

   - Upload `styles.css`
   - Should show as CSS module

3. **Test Features:**

   - ✅ Tab switching (treemap/insights/files)
   - ✅ Module selection and details
   - ✅ File explorer filtering/sorting
   - ✅ Treemap visualization
   - ✅ Optimization insights
   - ✅ Responsive design

4. **Expected Results:**
   - Total size: ~256KB
   - Gzipped size: ~85KB
   - 8 modules total
   - 2 chunks
   - Multiple optimization insights

## Test Scenarios

- **Single file upload** - Test individual file processing
- **Multiple files** - Test batch processing
- **Large files** - Test performance with bigger bundles
- **Different formats** - Test all supported file types
