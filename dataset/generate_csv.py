import openpyxl

wb = openpyxl.load_workbook(r'E:\Garments\customer-register.xlsx')
ws = wb.active
rows = []
for r in ws.iter_rows(min_row=2, values_only=True):
    if any(v for v in r):
        rows.append(list(r))

csv_lines = ['S.No,Register Page,Customer ID,Customer Name,Phone 1,Phone 2,Phone 3,Phone 4,Notes']
for idx, r in enumerate(rows, start=1):
    sno = str(idx)
    reg_page = str(r[1]) if r[1] else ''
    name = str(r[2]).strip() if r[2] else 'Unknown'
    p1 = str(int(r[3])) if isinstance(r[3], (int, float)) else (str(r[3]).strip() if r[3] else '')
    p2 = str(int(r[4])) if isinstance(r[4], (int, float)) else (str(r[4]).strip() if r[4] else '')
    p3 = str(int(r[5])) if isinstance(r[5], (int, float)) else (str(r[5]).strip() if r[5] else '')
    p4 = str(int(r[6])) if isinstance(r[6], (int, float)) else (str(r[6]).strip() if r[6] else '')
    notes = str(r[7]).strip() if r[7] else ''
    cid = f'{name[0].upper()}{str(idx).zfill(3)}'
    
    row_str = f'{sno},"{reg_page}","{cid}","{name}","{p1}","{p2}","{p3}","{p4}","{notes}"'
    csv_lines.append(row_str)

csv_path = r'E:\Garments\dataset\customers_dataset.csv'
with open(csv_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(csv_lines))

print(f'Wrote {len(rows)} customers to {csv_path}')
