"""
Convert customer-register.xlsx to customers_from_excel.json
Customer ID format: first letter of name + 3-digit index (A001, A002 ...)
"""
import openpyxl
import json
from datetime import datetime

wb = openpyxl.load_workbook(r'E:\Garments\customer-register.xlsx')
ws = wb.active

rows = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if any(v for v in row):
        rows.append(list(row))

today = datetime.now().strftime('%Y-%m-%d')
orders = []

for idx, row in enumerate(rows, start=1):
    name   = str(row[2]).strip() if row[2] else 'Unknown'
    phone1 = str(int(row[3])) if isinstance(row[3], (int, float)) else (str(row[3]).strip() if row[3] else '')
    phone2 = str(int(row[4])) if isinstance(row[4], (int, float)) else (str(row[4]).strip() if row[4] else '')
    notes  = str(row[7]).strip() if row[7] else ''

    # Additional phones stored in secondaryPhone as comma-separated
    extra_phones = []
    for col in [row[5], row[6]]:
        if col:
            v = str(int(col)) if isinstance(col, (int, float)) else str(col).strip()
            if v:
                extra_phones.append(v)
    if phone2 and extra_phones:
        phone2 = phone2 + ', ' + ', '.join(extra_phones)
    elif extra_phones:
        phone2 = ', '.join(extra_phones)

    # Customer ID: first letter of customer name + 3-digit sequential number
    first_letter = name[0].upper() if name else 'A'
    customer_id  = f'{first_letter}{str(idx).zfill(3)}'

    order = {
        'id': customer_id,
        'serialNumber': f'SR-{str(idx).zfill(3)}',
        'status': 'DELIVERED',
        'currentStep': 1,
        'createdAt': f'{today}T00:00:00.000Z',
        'updatedAt': f'{today}T00:00:00.000Z',
        'customer': {
            'customerId': customer_id,
            'billNumber': customer_id,
            'date': today,
            'customerName': name,
            'relationshipType': 'D/O',
            'fatherName': '',
            'husbandName': '',
            'primaryPhone': phone1,
            'secondaryPhone': phone2,
            'fullAddress': notes,
            'areaLocation': notes,
        },
        'garmentQuantities': [],
        'measurements': {
            'id': f'meas-{customer_id}',
            'name': '',
            'unit': 'in',
            'date': today,
            'shoulder': '', 'chest': '', 'bust': '', 'upperBust': '', 'underBust': '',
            'waist': '', 'hip': '', 'armhole': '', 'sleeveLength': '', 'sleeveRound': '',
            'bicep': '', 'elbow': '', 'wrist': '', 'blouseLength': '', 'topLength': '',
            'frontLength': '', 'backLength': '', 'frontNeckDepth': '', 'backNeckDepth': '',
            'frontNeckWidth': '', 'backNeckWidth': '', 'lowerWaist': '', 'lowerHip': '',
            'thigh': '', 'knee': '', 'calf': '', 'ankle': '', 'bottomLength': '',
            'inseam': '', 'outseam': '', 'crotch': '',
            'customFields': [], 'notes': notes
        },
        'garmentSpecs': [],
        'cuttingDetails': {
            'status': 'NEW',
            'actualQuantityCut': 0,
            'cuttingRemarks': '',
            'assignedMaster': '',
            'materialsCheck': {
                'customerMaterial': 'Not Required',
                'shopMaterial': 'Not Required',
                'liningMaterial': 'Not Required',
                'twoByTwoMaterial': 'Not Required',
                'otherMaterials': 'Not Required',
                'remarks': ''
            }
        },
        'billing': {
            'items': [],
            'additionalCharges': {
                'stitchingCharges': 0, 'materialCharges': 0,
                'designCharges': 0, 'otherCharges': 0, 'discount': 0
            },
            'subtotal': 0, 'grandTotal': 0,
            'advanceAmount': 0, 'amountPaid': 0, 'balanceAmount': 0,
            'paymentMethod': 'Cash', 'paymentStatus': 'PENDING',
            'orderDate': today, 'dueDate': today,
            'priority': 'Normal', 'deliveryNotes': '',
            'referralId': '', 'referredBy': '', 'referralNotes': ''
        }
    }
    orders.append(order)

out_path = r'E:\Garments\dataset\customers_from_excel.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(orders, f, ensure_ascii=False, indent=2)

print(f'Written {len(orders)} customer records to {out_path}')
sample_ids = [o['id'] for o in orders[:5]]
last_ids   = [o['id'] for o in orders[-3:]]
print('First 5 IDs:', sample_ids)
print('Last  3 IDs:', last_ids)
