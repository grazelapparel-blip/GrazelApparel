# Navigation Menu Items - Complete Data for Firestore

Add these 5 documents to the `navigation_menu_items` collection in Firebase Console.

---

## **Document 1: men**

**Document ID:** `men`

**Fields:**
```
label: string → Men
path: string → /men
is_active: boolean → true
menu_order: number → 1
icon_name: string → Men
description: string → Men's clothing collection
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "label": "Men",
  "path": "/men",
  "is_active": true,
  "menu_order": 1,
  "icon_name": "Men",
  "description": "Men's clothing collection",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 2: women**

**Document ID:** `women`

**Fields:**
```
label: string → Women
path: string → /women
is_active: boolean → true
menu_order: number → 2
icon_name: string → Women
description: string → Women's clothing collection
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "label": "Women",
  "path": "/women",
  "is_active": true,
  "menu_order": 2,
  "icon_name": "Women",
  "description": "Women's clothing collection",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 3: essentials**

**Document ID:** `essentials`

**Fields:**
```
label: string → Essentials
path: string → /essentials
is_active: boolean → true
menu_order: number → 3
icon_name: string → Essentials
description: string → Essential clothing items
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "label": "Essentials",
  "path": "/essentials",
  "is_active": true,
  "menu_order": 3,
  "icon_name": "Essentials",
  "description": "Essential clothing items",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 4: new-in**

**Document ID:** `new-in`

**Fields:**
```
label: string → New In
path: string → /new-in
is_active: boolean → true
menu_order: number → 4
icon_name: string → New In
description: string → Latest arrivals
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "label": "New In",
  "path": "/new-in",
  "is_active": true,
  "menu_order": 4,
  "icon_name": "New In",
  "description": "Latest arrivals",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Document 5: collections**

**Document ID:** `collections`

**Fields:**
```
label: string → Collections
path: string → /collections
is_active: boolean → true
menu_order: number → 5
icon_name: string → Collections
description: string → Special collections
created_at: timestamp → (auto or set to current time)
updated_at: timestamp → (auto or set to current time)
```

**Full JSON:**
```json
{
  "label": "Collections",
  "path": "/collections",
  "is_active": true,
  "menu_order": 5,
  "icon_name": "Collections",
  "description": "Special collections",
  "created_at": "2024-05-01T10:00:00Z",
  "updated_at": "2024-05-01T10:00:00Z"
}
```

---

## **Firebase Console Steps**

### **Step 1: Create First Document (men)**
1. Go to Firestore → `navigation_menu_items` collection
2. Click **Add document**
3. Enter Document ID: `men`
4. Add these fields one by one:
   - Click **Add field**
   - Type field name: `label`
   - Type value: `Men`
   - Click **Save**
   
   Repeat for all fields above

### **Step 2: Create Remaining Documents**
1. Click **Add document** (for each)
2. Enter Document ID: `women` / `essentials` / `new-in` / `collections`
3. Add all fields with their respective values
4. Click **Save** after each

---

## **Quick Copy-Paste Format**

If Firebase Console supports bulk import, use this format:

```json
{
  "label": "Men",
  "path": "/men",
  "is_active": true,
  "menu_order": 1,
  "icon_name": "Men",
  "description": "Men's clothing collection"
}
```

```json
{
  "label": "Women",
  "path": "/women",
  "is_active": true,
  "menu_order": 2,
  "icon_name": "Women",
  "description": "Women's clothing collection"
}
```

```json
{
  "label": "Essentials",
  "path": "/essentials",
  "is_active": true,
  "menu_order": 3,
  "icon_name": "Essentials",
  "description": "Essential clothing items"
}
```

```json
{
  "label": "New In",
  "path": "/new-in",
  "is_active": true,
  "menu_order": 4,
  "icon_name": "New In",
  "description": "Latest arrivals"
}
```

```json
{
  "label": "Collections",
  "path": "/collections",
  "is_active": true,
  "menu_order": 5,
  "icon_name": "Collections",
  "description": "Special collections"
}
```

---

## **Summary**

| Document ID | Label | Path | Order |
|-------------|-------|------|-------|
| men | Men | /men | 1 |
| women | Women | /women | 2 |
| essentials | Essentials | /essentials | 3 |
| new-in | New In | /new-in | 4 |
| collections | Collections | /collections | 5 |

All 5 documents ready to add to Firestore! ✅
