# Product Card Variant Selection - Troubleshooting & Debug Guide

## 🔍 Debug Features Added

I've added comprehensive debugging and fixes for the price and image update issues.

---

## 🛠️ Changes Made

### **1. Enhanced Attribute Matching Logic**

**Problem:** WooCommerce uses different attribute key formats in variations.

**Examples of WooCommerce Attribute Keys:**
```
Product Attribute: "Color"
Variation Keys could be:
  - "Color"           (direct match)
  - "color"           (lowercase)
  - "attribute_color" (with prefix)
  - "attribute_pa_color" (with taxonomy prefix)
  - "pa_color"        (taxonomy only)
```

**Solution:** Try multiple possible key formats:

```typescript
const possibleKeys = [
  attr.name,                                          // "Color"
  attr.name.toLowerCase(),                            // "color"
  `attribute_${attr.name.toLowerCase()}`,            // "attribute_color"
  `attribute_pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`, // "attribute_pa_color"
  `pa_${attr.name.toLowerCase().replace(/\s+/g, '-')}`  // "pa_color"
];
```

---

### **2. Better Event Handling**

**Changed From:**
```html
<!-- Used ngModelChange which fires BEFORE value updates -->
<select 
  [(ngModel)]="selectedAttributes[attribute.name]"
  (ngModelChange)="onAttributeChange(attribute.name, selectedAttributes[attribute.name])"
>
```

**Changed To:**
```html
<!-- Use (change) which fires AFTER value updates -->
<select 
  [(ngModel)]="selectedAttributes[attribute.name]"
  (change)="onAttributeChange(attribute.name)"
>
```

**Why This Matters:**
- `ngModelChange` fires before the model updates
- `change` fires after the model updates
- We need the updated value before running `findMatchingVariation()`

---

### **3. Proper Initialization**

**Added initialization when selector opens:**

```typescript
toggleVariantSelector(event: Event): void {
  this.showVariantSelector = !this.showVariantSelector;
  
  if (this.showVariantSelector) {
    // Initialize empty attributes when opening
    const attributes = this.getVariationAttributes();
    attributes.forEach(attr => {
      if (!this.selectedAttributes[attr.name]) {
        this.selectedAttributes[attr.name] = '';
      }
    });
  } else {
    // Reset when closing
    this.selectedAttributes = {};
    this.selectedVariation = null;
  }
}
```

---

### **4. Console Debug Logging**

**Added extensive logging throughout:**

```typescript
onAttributeChange(attributeName: string): void {
  console.log('Attribute changed:', attributeName, 'Value:', this.selectedAttributes[attributeName]);
  console.log('All selected attributes:', this.selectedAttributes);
  this.findMatchingVariation();
  console.log('Found variation:', this.selectedVariation);
}
```

**What to Look For in Console:**

```
// Good flow:
Attribute changed: Color Value: Red
All selected attributes: {Color: "Red"}
Required attributes: ["Color", "Size"]
All selected? false
Selected variation result: null

// After selecting size:
Attribute changed: Size Value: Large
All selected attributes: {Color: "Red", Size: "Large"}
Required attributes: ["Color", "Size"]
All selected? true
Checking variation: 123 {attribute_pa_color: "red", attribute_pa_size: "large"}
  Attribute: Color
  Selected: "Red"
  Variation value: "red"
  Match: true
  Attribute: Size
  Selected: "Large"
  Variation value: "large"
  Match: true
Variation matches: true
Selected variation result: {id: 123, price: "24.99", ...}
```

---

### **5. Visual Debug Panel**

**Added to HTML template:**

```html
<!-- Debug info (remove in production) -->
<div class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
  <div><strong>Selected:</strong> {{selectedAttributes | json}}</div>
  <div><strong>Variation:</strong> {{selectedVariation?.id || 'None'}}</div>
  <div *ngIf="selectedVariation"><strong>Price:</strong> {{selectedVariation.price}}</div>
  <div *ngIf="selectedVariation"><strong>Image:</strong> {{selectedVariation.image?.src ? 'Yes' : 'No'}}</div>
</div>
```

**Example Output:**
```
Selected: {"Color":"Red","Size":"Large"}
Variation: 123
Price: 24.99
Image: Yes
```

---

## 🧪 Testing Steps

### **Step 1: Open Console**

```
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Clear console (Ctrl+L or Cmd+K)
```

### **Step 2: Test Variable Product**

```
1. Find a variable product on the page
2. Click "Quick Add"
3. Watch console output
```

**Expected Console Output:**
```
// When Quick Add is clicked:
(No output yet)

// When you select first attribute:
Attribute changed: Color Value: Red
All selected attributes: {Color: "Red"}
Required attributes: (2) ["Color", "Size"]
All selected? false
Selected variation result: null

// When you select second attribute:
Attribute changed: Size Value: Large
All selected attributes: {Color: "Red", Size: "Large"}
Required attributes: (2) ["Color", "Size"]
All selected? true
Checking variation: 456 {attribute_pa_color: "red", attribute_pa_size: "large"}
  Attribute: Color
  Selected: "Red"
  Variation value: "red"
  Match: true
  Attribute: Size
  Selected: "Large"
  Variation value: "large"
  Match: true
Variation matches: true
Selected variation result: {id: 456, price: "24.99", ...}
```

### **Step 3: Check Visual Debug Panel**

Look at the debug panel below the dropdowns:

**Before Selection:**
```
Selected: {}
Variation: None
```

**After Selecting Color:**
```
Selected: {"Color":"Red"}
Variation: None
```

**After Selecting Size:**
```
Selected: {"Color":"Red","Size":"Large"}
Variation: 456
Price: 24.99
Image: Yes
```

### **Step 4: Verify Price Updates**

1. Note the price before selection
2. Select attributes
3. Price should change to match selected variation
4. If not, check:
   - Debug panel shows variation ID?
   - Console shows "Found variation"?
   - `getDisplayPrice()` returning correct value?

### **Step 5: Verify Image Updates**

1. Note the product image before selection
2. Select attributes that have different images
3. Image should change
4. If not, check:
   - Debug panel shows "Image: Yes"?
   - `selectedVariation.image.src` has value?
   - `getMainImage()` being called?

---

## 🐛 Common Issues & Solutions

### **Issue 1: Variation Not Found**

**Symptoms:**
```
Console shows:
All selected? true
Checking variation: 123 {...}
Variation matches: false
Selected variation result: null
```

**Diagnosis:**
The attribute keys don't match between selection and variation.

**Solution:**
Look at the console output for attribute comparison:

```
Checking variation: 123 {pa_color: "red", pa_size: "large"}
  Attribute: Color
  Selected: "Red"
  Variation value: undefined  ← Problem!
  Match: false
```

**Fix:**
The variation uses `pa_color` but we're looking for `Color`. The code tries multiple formats, but if still not working:

```typescript
// Add more possible key formats in findMatchingVariation()
const possibleKeys = [
  attr.name,
  attr.name.toLowerCase(),
  `attribute_${attr.name.toLowerCase()}`,
  `attribute_pa_${attr.name.toLowerCase()}`,
  `pa_${attr.name.toLowerCase()}`,
  // Add custom format if needed:
  `custom_format_${attr.name}`
];
```

---

### **Issue 2: Case Sensitivity**

**Symptoms:**
```
  Selected: "Red"
  Variation value: "red"
  Match: false  ← Should be true!
```

**Solution:**
Already implemented - we use `.toLowerCase()` comparison:

```typescript
const match = variationValue.toLowerCase() === selectedValue.toLowerCase();
```

If still failing, check if there are extra spaces:

```typescript
// Add trim()
const match = variationValue.toLowerCase().trim() === selectedValue.toLowerCase().trim();
```

---

### **Issue 3: Price Not Updating in UI**

**Symptoms:**
- Console shows correct variation
- Debug panel shows correct price
- But displayed price doesn't change

**Diagnosis:**
Angular change detection issue.

**Solution:**
The code already uses two-way binding with ngModel, which should trigger change detection. If still failing:

```typescript
// In onAttributeChange(), add:
onAttributeChange(attributeName: string): void {
  console.log('Attribute changed:', attributeName);
  this.findMatchingVariation();
  
  // Force change detection
  this.cdr.markForCheck();
  // Or
  this.cdr.detectChanges();
}
```

---

### **Issue 4: Image Not Updating**

**Symptoms:**
- Variation found correctly
- Debug panel shows "Image: Yes"
- But image doesn't change on screen

**Diagnosis:**
Check if `getMainImage()` is being called.

**Solution:**

1. **Add console log to getMainImage():**

```typescript
getMainImage(): string {
  console.log('getMainImage called, selectedVariation:', this.selectedVariation);
  
  if (this.selectedVariation?.image?.src) {
    console.log('Returning variation image:', this.selectedVariation.image.src);
    return this.selectedVariation.image.src;
  }
  
  console.log('Returning default image');
  return this.product.images[0]?.src || 'placeholder';
}
```

2. **Check if image src is actually different:**

If the variation image is the same URL as the main image, it won't visibly change.

3. **Check browser caching:**

Images might be cached. Try:
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Add cache-busting parameter:

```typescript
return `${this.selectedVariation.image.src}?t=${Date.now()}`;
```

---

### **Issue 5: ngModel Not Working**

**Symptoms:**
```
Error: Can't bind to 'ngModel' since it isn't a known property of 'select'
```

**Solution:**
FormsModule not imported. Already added, but if error persists:

```typescript
// In component decorator:
@Component({
  imports: [CommonModule, RouterModule, FormsModule],  // ← Ensure FormsModule is here
  // ...
})
```

---

## 📋 Debugging Checklist

When price/image not updating, check in order:

- [ ] **Console has no errors**
  - No red errors in console
  - No "Can't bind to ngModel" errors

- [ ] **Attributes are selected**
  - Debug panel shows: `Selected: {"Color":"Red","Size":"Large"}`
  - Console shows: `All selected attributes: {Color: "Red", Size: "Large"}`

- [ ] **Variation is found**
  - Debug panel shows: `Variation: 123` (not "None")
  - Console shows: `Selected variation result: {id: 123, ...}`

- [ ] **Variation has price**
  - Debug panel shows: `Price: 24.99`
  - Console shows variation object has `price` property

- [ ] **Variation has image**
  - Debug panel shows: `Image: Yes`
  - Console shows variation object has `image.src` property

- [ ] **getDisplayPrice() is called**
  - Add console.log in `getDisplayPrice()`
  - Should be called when variation changes

- [ ] **getMainImage() is called**
  - Add console.log in `getMainImage()`
  - Should be called when variation changes

- [ ] **Price displays in template**
  - Check `{{getDisplayPrice()}}` in HTML
  - Should show dynamic value

- [ ] **Image src changes**
  - Check `[src]="getMainImage()"` in HTML
  - Should update when variation changes

---

## 🔧 Quick Fixes

### **Fix 1: Force UI Update**

```typescript
onAttributeChange(attributeName: string): void {
  console.log('Attribute changed:', attributeName);
  this.findMatchingVariation();
  
  // Force Angular to update the view
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 0);
}
```

### **Fix 2: Reset Everything**

```typescript
resetVariantSelector(): void {
  this.selectedAttributes = {};
  this.selectedVariation = null;
  this.showVariantSelector = false;
  this.cdr.detectChanges();
}
```

### **Fix 3: Manual Price/Image Getters**

If methods don't update, use properties:

```typescript
// In component
get currentPrice(): string {
  if (this.selectedVariation) {
    return this.selectedVariation.price;
  }
  return this.getPriceDisplay();
}

get currentImage(): string {
  if (this.selectedVariation?.image?.src) {
    return this.selectedVariation.image.src;
  }
  return this.product.images[0]?.src || 'placeholder';
}
```

```html
<!-- In template -->
<img [src]="currentImage" />
<span>{{currentPrice}}</span>
```

---

## 🎯 Verification Tests

### **Test 1: Console Logging**

```
1. Click "Quick Add"
2. Select Color → Check console for "Attribute changed: Color"
3. Select Size → Check console for "Attribute changed: Size"
4. Verify console shows "Selected variation result: {...}"
```

**Pass:** All console logs appear in correct order  
**Fail:** Missing logs or error messages

---

### **Test 2: Debug Panel**

```
1. Click "Quick Add"
2. Check debug panel shows: Selected: {}
3. Select attributes one by one
4. Check debug panel updates after each selection
5. Final state should show variation ID and price
```

**Pass:** Debug panel updates after each selection  
**Fail:** Debug panel doesn't update or shows wrong values

---

### **Test 3: Visual Updates**

```
1. Note initial price: $19.99 - $29.99
2. Select attributes
3. Price should change to: $24.99
4. Note initial image (e.g., blue shirt)
5. Select different color
6. Image should change (e.g., to red shirt)
```

**Pass:** Both price and image update visually  
**Fail:** Either price or image doesn't change

---

### **Test 4: Add to Cart**

```
1. Select all attributes
2. "Add to Cart" button should enable
3. Click "Add to Cart"
4. Check cart has correct variation
5. Cart item should show selected attributes
```

**Pass:** Correct variation added to cart  
**Fail:** Wrong variation or error adding

---

## 📝 Remove Debug Code for Production

Before deploying, remove debug code:

### **1. Remove Console Logs**

```typescript
// Remove all console.log() statements:
console.log('Attribute changed:', ...);  // ← Remove
console.log('Found variation:', ...);     // ← Remove
// etc.
```

### **2. Remove Debug Panel**

```html
<!-- Remove this entire section: -->
<div class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
  <div><strong>Selected:</strong> {{selectedAttributes | json}}</div>
  <div><strong>Variation:</strong> {{selectedVariation?.id || 'None'}}</div>
  <div *ngIf="selectedVariation"><strong>Price:</strong> {{selectedVariation.price}}</div>
  <div *ngIf="selectedVariation"><strong>Image:</strong> {{selectedVariation.image?.src ? 'Yes' : 'No'}}</div>
</div>
```

---

## 🚀 Expected Behavior After Fix

### **Correct Flow:**

```
1. User clicks "Quick Add"
   → Dropdowns appear
   → selectedAttributes initialized: {}

2. User selects Color: "Red"
   → onChange fires
   → selectedAttributes updated: {Color: "Red"}
   → findMatchingVariation() runs
   → No match yet (size not selected)
   → selectedVariation = null
   → Price shows range for red items

3. User selects Size: "Large"
   → onChange fires
   → selectedAttributes updated: {Color: "Red", Size: "Large"}
   → findMatchingVariation() runs
   → Match found!
   → selectedVariation = {id: 456, price: "24.99", image: {...}}
   → getDisplayPrice() returns "24.99"
   → Price updates in UI to $24.99
   → getMainImage() returns variation image
   → Image updates to red/large variant

4. User clicks "Add to Cart"
   → Variation added to cart
   → Success message
   → Selector resets
```

---

## 📊 Success Criteria

✅ **Console logs show:**
- Attribute changes detected
- All attributes tracked correctly
- Variation found when all selected
- Correct variation object returned

✅ **Debug panel shows:**
- Selected attributes object updates
- Variation ID appears when found
- Price displays correctly
- Image status shows "Yes" when available

✅ **UI updates:**
- Price changes immediately after selection
- Image changes to variation image
- SALE badge appears/disappears correctly
- Stock status reflects variation

✅ **Functionality works:**
- Add to Cart enables when variation selected
- Correct variation added to cart
- Selector resets after adding

---

## 🆘 Still Not Working?

If after all these steps it's still not working:

1. **Check WooCommerce product data structure:**
   ```typescript
   // Add temporary button in template:
   <button (click)="debugProduct()">Debug Product</button>
   
   // In component:
   debugProduct(): void {
     console.log('Full product:', this.product);
     console.log('Attributes:', this.product.attributes);
     console.log('Variations:', this.product.variations);
     this.product.variations?.forEach(v => {
       console.log(`Variation ${v.id}:`, v.attributes);
     });
   }
   ```

2. **Share the console output** of a complete selection flow

3. **Check if WooCommerce returns variations** in the API response

4. **Verify FormsModule** is properly imported in the app

---

Ready to debug! Open the console, click "Quick Add", and let's see what's happening! 🔍
