# Packaging Options - Complete Data for Firestore

Add these 4 documents to the `packaging_options` collection in Firebase Console.

---

## **Document 1: simple**

**Document ID:** `simple`

**Fields:**
```
name: string → simple
label: string → Simple Package
description: string → Basic packaging
price: number → 0
currency_code: string → INR
is_active: boolean → true
display_order: number → 1
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "name": "simple",
  "label": "Simple Package",
  "description": "Basic packaging",
  "price": 0,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 1,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 2: elegant**

**Document ID:** `elegant`

**Fields:**
```
name: string → elegant
label: string → Elegant Package
description: string → Premium wrapping with tissue
price: number → 50
currency_code: string → INR
is_active: boolean → true
display_order: number → 2
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "name": "elegant",
  "label": "Elegant Package",
  "description": "Premium wrapping with tissue",
  "price": 50,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 2,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 3: premium**

**Document ID:** `premium`

**Fields:**
```
name: string → premium
label: string → Premium Package
description: string → Luxury packaging with ribbons
price: number → 100
currency_code: string → INR
is_active: boolean → true
display_order: number → 3
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "name": "premium",
  "label": "Premium Package",
  "description": "Luxury packaging with ribbons",
  "price": 100,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 3,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 4: gift**

**Document ID:** `gift`

**Fields:**
```
name: string → gift
label: string → Gift Package
description: string → Special gift wrapping with card
price: number → 150
currency_code: string → INR
is_active: boolean → true
display_order: number → 4
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "name": "gift",
  "label": "Gift Package",
  "description": "Special gift wrapping with card",
  "price": 150,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 4,
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Firebase Console Steps**

### **Step 1: Create First Document (simple)**
1. Go to Firestore → `packaging_options` collection
2. Click **Add document**
3. Enter Document ID: `simple`
4. Add these fields one by one:
   - Click **Add field**
   - Type field name: `name`
   - Type value: `simple`
   - Click **Save**
   
   Repeat for all fields above

### **Step 2: Create Remaining Documents**
1. Click **Add document** (for each)
2. Enter Document ID: `elegant` / `premium` / `gift`
3. Add all fields with their respective values
4. Click **Save** after each

---

## **Quick Copy-Paste Format**

If Firebase Console supports bulk import, use this format:

```json
{
  "name": "simple",
  "label": "Simple Package",
  "description": "Basic packaging",
  "price": 0,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 1
}
```

```json
{
  "name": "elegant",
  "label": "Elegant Package",
  "description": "Premium wrapping with tissue",
  "price": 50,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 2
}
```

```json
{
  "name": "premium",
  "label": "Premium Package",
  "description": "Luxury packaging with ribbons",
  "price": 100,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 3
}
```

```json
{
  "name": "gift",
  "label": "Gift Package",
  "description": "Special gift wrapping with card",
  "price": 150,
  "currency_code": "INR",
  "is_active": true,
  "display_order": 4
}
```

---

## **Summary**

| Document ID | Label | Price | Order |
|-------------|-------|-------|-------|
| simple | Simple Package | ₹0 | 1 |
| elegant | Elegant Package | ₹50 | 2 |
| premium | Premium Package | ₹100 | 3 |
| gift | Gift Package | ₹150 | 4 |

All 4 documents ready to add to Firestore! ✅
