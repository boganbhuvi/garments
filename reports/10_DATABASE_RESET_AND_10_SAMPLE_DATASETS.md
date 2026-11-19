# GIRIRAJ GARMENTS — ERP SYSTEM REVIEW REPORT
## Module 10: Complete Database Purge, 10 Production-Grade Sample Datasets & CSV Export Suite

**Client / Brand:** Giriraj Garments  
**System Module:** Database Seeding, Customer Manifests, Body Measurements & CSV Data Hub  
**Database Cluster:** MongoDB Atlas (`cluster0.2hlq3mi.mongodb.net`, Database: `giriraj_garments`)  
**Data Export Directory:** `e:\Garments\dataset\`  
**Status:** ✅ DATABASE PURGED, RESEEDED & VERIFIED  
**Date:** November 15, 2026  

---

## 📌 Executive Summary

At the request of the business stakeholders, all legacy demonstration and test records were purged from the MongoDB Atlas database. A set of **10 comprehensive, realistic Indian tailoring orders** was synthesized, structured, and seeded into the live production database and client storage.

In addition, a full CSV export suite was generated in the `dataset/` folder, allowing owners, cutting masters, and accounts staff to review, print, or analyze all customer details, full tailoring measurements, order manifests, piece-rate allocations, and billing totals in Microsoft Excel or Google Sheets.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   GIRIRAJ GARMENTS — 10 PRODUCTION DATASETS                      │
│                                                                                  │
│  [1] Lakshmi Ramakrishnan   — Tamil Bridal Silk Blouse & Kurti (In Cutting)      │
│  [2] Meenakshi Sundaram     — Festive Brocade Blouse & Pants (In Stitching)      │
│  [3] Dr. Ananya Subramanian — Executive Linen Kurtis & Trousers (Ready for Trial)│
│  [4] Priya Venkataraman     — Bridal Sangeet Velvet Lehenga Choli (New Booking)  │
│  [5] Kavitha Rajagopal      — Traditional Madisar 9-Yard Blouse (New Order)      │
│  [6] Deepa Natarajan        — 32-Kali Floor-Length Anarkali Gown (In Cutting)    │
│  [7] Sangeetha Balaji       — Banarasi Net Back Blouse & Salwar (In Stitching)   │
│  [8] Revathi Sridhar        — Tussar Silk Kurtis & Flared Palazzos (New Order)   │
│  [9] Shanthi Narayanan      — 5 Classic Daily Cotton Blouses (Completed / Paid)  │
│ [10] Divya Chandrasekaran   — Velvet Crop Top & Georgette Cape (On Hold / Urgent)│
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│         LIVE MONGODB ATLAS SEED        │ │       CSV DATASET EXPORT SUITE         │
│  • 10 Full Orders with Nested Schemas  │ │  • dataset/customers_dataset.csv       │
│  • 4 Master Tailor Profiles            │ │  • dataset/measurements_dataset.csv    │
│  • Real-time REST API: /api/orders     │ │  • dataset/orders_master_dataset.csv   │
│  • LocalStorage Client Sync Guarantee  │ │  • dataset/garments_manifest_dataset.csv│
│                                        │ │  • dataset/giriraj_garments_10_sample_ │
│                                        │ │    master.csv (Consolidated Full CSV)  │
└────────────────────────────────────────┘ └────────────────────────────────────────┘
```

---

## 📂 CSV Files Inventory in `e:\Garments\dataset\`

| File Name | Size | Columns Included | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **`customers_dataset.csv`** | 2,088 B | Customer ID, Bill Number, Name, Relationship, Relative Name, Primary & Secondary Phones, Address, Area Location, Order Date, Due Date, Priority | Customer directory, CRM lookup, and marketing contact sheet |
| **`measurements_dataset.csv`** | 2,229 B | Customer ID, Name, Unit, Shoulder, Chest, Bust, Upper Bust, Under Bust, Waist, Hip, Armhole, Sleeve Length, Sleeve Round, Bicep, Blouse Length, Top Length, Front/Back Neck, Bottom Length, Inseam, Outseam, Fitting Notes | Tailoring cutting master bench reference sheet |
| **`orders_master_dataset.csv`** | 2,234 B | Order ID, Serial No, Customer Name, Phone, Order Date, Due Date, Priority, Workflow Status, Cutting Status, Total Garments, Subtotal, Advance, Balance, Payment Method, Master, Delivery Notes | Executive orders book, finance tracking, and balance ledger |
| **`garments_manifest_dataset.csv`** | 4,538 B | Order ID, Customer Name, Garment Number, Category, Title, Cut/Garment Type, Sleeve Type, Front/Back Neck, Hook/Zip, Lining, Fitting, Cutting Status, Stitching Status, Assigned Tailor, Piece Rate, Instructions | Piece-level workshop tracking and tailor allocation manifest |
| **`giriraj_garments_10_sample_master.csv`** | 2,358 B | Order ID, Serial No, Status, Customer ID, Name, Phone, Area, Dates, Priority, Shoulder, Chest, Bust, Waist, Hip, Armhole, Sleeve, Blouse Length, Top Length, Necks, Total Items, Grand Total, Advance, Balance | Complete single-sheet flattened master spreadsheet for owners |

---

## 📋 Comprehensive 10-Customer Master Roster

### 1. Smt. Lakshmi Ramakrishnan (Order: `GG-2026-0101` / Serial: `SR-001`)
- **Area:** Mylapore, Chennai | **Phone:** 9876543210
- **Items:** 3 Silk Blouses, 1 Kurti (Total: 4 items)
- **Key Measurements:** Shoulder: 14.5, Chest: 36.0, Bust: 37.5, Waist: 30.0, Armhole: 16.5, Blouse Length: 14.5, Front Neck: 7.0, Back Neck: 9.5
- **Status:** `IN_CUTTING` (Table 1 - Master Subramaniam)
- **Financials:** Subtotal: ₹4,200 | Advance: ₹2,500 | Balance: ₹1,700

### 2. Smt. Meenakshi Sundaram (Order: `GG-2026-0102` / Serial: `SR-002`)
- **Area:** T. Nagar, Chennai | **Phone:** 9841023456
- **Items:** 2 Blouses, 2 Kurtis, 1 Pants (Total: 5 items)
- **Key Measurements:** Shoulder: 15.0, Chest: 38.0, Bust: 40.0, Waist: 33.0, Hip: 42.0, Top Length: 44.0
- **Status:** `IN_STITCHING` (Allocated to Rahim Bhai & Fatima Begum)
- **Financials:** Subtotal: ₹3,850 | Advance: ₹2,000 | Balance: ₹1,850

### 3. Dr. Ananya Subramanian (Order: `GG-2026-0103` / Serial: `SR-003`)
- **Area:** Adyar, Chennai | **Phone:** 9790812345
- **Items:** 3 Formal Linen Kurtis, 2 Trousers, 1 Dupatta (Total: 6 items)
- **Key Measurements:** Shoulder: 14.0, Chest: 34.0, Bust: 35.5, Waist: 28.5, Sleeve: 16.0, Bottom Length: 37.5
- **Status:** `READY_FOR_TRIAL` (Completed QC)
- **Financials:** Subtotal: ₹4,600 | Advance: ₹4,600 | Balance: ₹0 (Paid in Full)

### 4. Ms. Priya Venkataraman (Order: `GG-2026-0104` / Serial: `SR-004`)
- **Area:** Anna Nagar, Chennai | **Phone:** 9884077889
- **Items:** 1 Bridal Velvet Lehenga, 1 Padded Choli, 1 Dupatta (Total: 3 items)
- **Key Measurements:** Shoulder: 14.0, Bust: 36.5, Waist: 29.0, Skirt Length: 42.0, Deep Sweetheart Neck: 7.5
- **Status:** `NEW` (Priority: Urgent)
- **Financials:** Subtotal: ₹7,800 | Advance: ₹5,000 | Balance: ₹2,800

### 5. Smt. Kavitha Rajagopal (Order: `GG-2026-0105` / Serial: `SR-005`)
- **Area:** Alwarpet, Chennai | **Phone:** 9840334455
- **Items:** 3 Madisar Traditional Blouses, 1 Saree Pico/Falls (Total: 4 items)
- **Key Measurements:** Shoulder: 15.5, Chest: 40.0, Bust: 42.0, Waist: 35.0, Armhole: 18.0
- **Status:** `NEW` (Pattern Marked)
- **Financials:** Subtotal: ₹2,450 | Advance: ₹1,500 | Balance: ₹950

### 6. Smt. Deepa Natarajan (Order: `GG-2026-0106` / Serial: `SR-006`)
- **Area:** Velachery, Chennai | **Phone:** 9789065432
- **Items:** 1 32-Kali Floor Length Anarkali Gown, 1 Churidar, 1 Dupatta (Total: 3 items)
- **Key Measurements:** Shoulder: 14.5, Bust: 38.5, Top Length: 52.0, Bottom Length: 46.0 (deep calf gatherings)
- **Status:** `IN_CUTTING` (Table 1)
- **Financials:** Subtotal: ₹5,200 | Advance: ₹3,000 | Balance: ₹2,200

### 7. Smt. Sangeetha Balaji (Order: `GG-2026-0107` / Serial: `SR-007`)
- **Area:** Kilpauk, Chennai | **Phone:** 9840112244
- **Items:** 2 Brocade Boat Neck Blouses, 1 Salwar Suit (Total: 3 items)
- **Key Measurements:** Shoulder: 14.0, Chest: 36.0, Bust: 37.0, Waist: 30.0, Sheer Net Back Depth: 9.0
- **Status:** `IN_STITCHING` (Allocated to Rahim Bhai @ ₹480)
- **Financials:** Subtotal: ₹3,400 | Advance: ₹2,000 | Balance: ₹1,400

### 8. Smt. Revathi Sridhar (Order: `GG-2026-0108` / Serial: `SR-008`)
- **Area:** Besant Nagar, Chennai | **Phone:** 9884123490
- **Items:** 2 Pure Tussar Silk Kurtis, 2 Flared Palazzos (Total: 4 items)
- **Key Measurements:** Shoulder: 15.0, Bust: 41.0, Waist: 34.0, Hip: 43.0, Kurti Length: 43.5, Palazzo Length: 38.5
- **Status:** `NEW` (Fabric received in Bin #B-108)
- **Financials:** Subtotal: ₹3,900 | Advance: ₹2,000 | Balance: ₹1,900

### 9. Smt. Shanthi Narayanan (Order: `GG-2026-0109` / Serial: `SR-009`)
- **Area:** West Tambaram, Chennai | **Phone:** 9444198765
- **Items:** 5 2x2 Rubia Cotton Everyday Blouses (Total: 5 items)
- **Key Measurements:** Shoulder: 15.0, Bust: 39.5, Waist: 32.5, Armhole: 17.0, Sleeve: 9.0
- **Status:** `COMPLETED` (Ready for customer pickup)
- **Financials:** Subtotal: ₹2,750 | Advance: ₹2,750 | Balance: ₹0 (Paid in Full)

### 10. Ms. Divya Chandrasekaran (Order: `GG-2026-0110` / Serial: `SR-010`)
- **Area:** Nungambakkam, Chennai | **Phone:** 9840889900
- **Items:** 1 Padded Velvet Crop Top with Cape, 1 Circular Umbrella Skirt (Total: 3 items)
- **Key Measurements:** Shoulder: 14.0, Bust: 36.0, Waist: 28.0, Crop Top Length: 13.5, Skirt Length: 41.0
- **Status:** `NEW / ON_HOLD` (Urgent Reception Order, Customer bringing emerald velvet)
- **Financials:** Subtotal: ₹6,500 | Advance: ₹3,500 | Balance: ₹3,000

---

## 🛠️ Operational Script & Future Seeding Command

A dedicated re-seeding command is now configured in `package.json`:
```bash
npm run seed
```
Executing this single command will:
1. Connect securely to MongoDB Atlas using the `.env` credentials.
2. Flush all test data from the collections.
3. Re-seed all 10 sample orders and 4 master tailors.
4. Automatically re-export all 5 CSV files in the `dataset/` directory.
