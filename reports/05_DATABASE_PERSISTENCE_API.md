# 05 — DATABASE PERSISTENCE & BACKEND API
## MongoDB Atlas Integration, Express REST Services, & Offline Resilience

---

## 1. Persistence Architecture

The Giriraj Garments ERP employs a resilient **Dual-Layer Persistence Architecture**:

```
                       ┌──────────────────────────────────────────────┐
                       │             BROWSER APPLICATION              │
                       │           (React 18 + TypeScript)            │
                       └──────────────────────┬───────────────────────┘
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │                                                 │
                     ▼                                                 ▼
      ┌─────────────────────────────┐                   ┌─────────────────────────────┐
      │   LAYER 1: LOCALSTORAGE     │                   │   LAYER 2: MONGODB ATLAS    │
      │  • Synchronous Read/Write   │                   │  • Distributed Cloud Doc DB │
      │  • Offline Resilience       │                   │  • Multi-device Sync        │
      │  • Zero Network Latency     │                   │  • Production Scalability   │
      └─────────────────────────────┘                   └─────────────────────────────┘
```

1. **Local State Speed:** Every modification writes instantly to HTML5 LocalStorage, ensuring zero UI lag or stutter.
2. **Cloud Synchronization:** An asynchronous API client pushes modifications to the Express backend (`http://localhost:5000/api/orders`), which updates MongoDB Atlas in real time.
3. **Graceful Fallback:** If the network is interrupted, operations continue unhindered on LocalStorage.

---

## 2. MongoDB Atlas Configuration

- **Database Name:** `giriraj_garments`
- **Collection Name:** `orders`
- **Connection Engine:** Official `mongodb` npm driver (`MongoClient`) with connection pooling and unified topology.
- **Connection URI Format:**
  ```env
  MONGODB_URI=mongodb+srv://boganbhuvanesh2213_db_user:<password>@cluster0.2hlq3mi.mongodb.net/?retryWrites=true&w=majority
  ```

---

## 3. Express REST API Endpoints

The server entrypoint is implemented in [`server/index.ts`](file:///e:/Garments/server/index.ts):

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Diagnostic ping for backend & MongoDB connectivity | None |
| `GET` | `/api/orders` | Retrieves all saved orders sorted by update time | Optional query filters |
| `GET` | `/api/orders/:id` | Fetches a single order document by Order ID | URL parameter `:id` |
| `POST` | `/api/orders` | Creates or updates an entire order document | JSON Order Payload |
| `PATCH` | `/api/orders/:id/cutting-status` | Updates cutting department status, dates, & remarks | `{ status, remarks, holdReason, actualQuantity }` |
| `PATCH` | `/api/orders/:id/garment-cutting-status` | Updates individual piece status (e.g. Blouse 01) | `{ garmentIndex, status }` |
| `PATCH` | `/api/orders/:id/material-check` | Updates fabric inspection checklist status | `{ materialsCheck }` |

---

## 4. Document Schema Structure

Each order document stored in MongoDB contains:
```json
{
  "_id": "67362a7b8f9e0123456789ab",
  "id": "GG-2026-1042",
  "serialNumber": "TK-042",
  "status": "IN_CUTTING",
  "createdAt": "2026-11-15T03:00:00.000Z",
  "updatedAt": "2026-11-15T03:15:20.000Z",
  "customer": {
    "customerName": "Smt. Priya Sundaram",
    "relationshipType": "W/O",
    "relativeName": "Sundaram R",
    "primaryPhone": "9840123456",
    "secondaryPhone": "9444123456",
    "fullAddress": "No. 14, Kamaraj Avenue, 2nd Cross Street",
    "area": "Adyar, Chennai",
    "city": "Chennai",
    "pincode": "600020"
  },
  "measurements": {
    "unit": "in",
    "blouseLength": "14.5",
    "shoulder": "14.0",
    "bust": "36.5",
    "chest": "36.0",
    "waist": "30.0",
    "hip": "39.0",
    "armhole": "16.5",
    "sleeveLength": "10.5",
    "sleeveRound": "12.0",
    "frontNeckDepth": "6.5",
    "backNeckDepth": "8.5"
  },
  "garmentSpecs": [
    {
      "id": "spec-1",
      "category": "Blouse",
      "quantity": 1,
      "frontNeck": "Sweetheart Neck",
      "backNeck": "Deep U with Potli Buttons",
      "sleeve": "Elbow Length (10-11 in)",
      "lining": "Full Cotton",
      "fastener": "Back Hooks",
      "regionalStyle": "Tamil Nadu Standard",
      "tailorInstructions": "Attach gold piping along neckline and sleeve hem",
      "cuttingStatus": "In Progress"
    }
  ],
  "billing": {
    "items": [
      { "description": "Custom Designer Silk Blouse", "quantity": 1, "rate": 1200, "amount": 1200 },
      { "description": "Aari Hand Embroidery (Neck + Sleeves)", "quantity": 1, "rate": 2500, "amount": 2500 }
    ],
    "subTotal": 3700,
    "grandTotal": 3700,
    "advanceAmount": 2000,
    "balanceAmount": 1700,
    "dueDate": "2026-11-20",
    "paymentMethod": "UPI",
    "priority": "Normal"
  },
  "cuttingDetails": {
    "status": "IN_CUTTING",
    "startedAt": "2026-11-15T03:10:00.000Z",
    "cuttingRemarks": "Cloth chalked on grain. Cutting on bias for sleeve.",
    "materialsCheck": {
      "customerMaterial": "Received",
      "shopMaterial": "Received",
      "liningMaterial": "Received",
      "twoByTwoMaterial": "Not Required",
      "otherMaterials": "Not Required"
    }
  }
}
```

---

## 5. Live Connection Monitoring in Header

The global application header displays a live database indicator pill:
- **🟢 Cloud DB Live:** Connected to MongoDB Atlas cluster (`giriraj_garments`).
- **🟠 Local Cache Mode:** Express/MongoDB offline; operations run on LocalStorage cache with automatic reconnect polling.
