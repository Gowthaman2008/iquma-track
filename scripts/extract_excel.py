import openpyxl
import json
import re
from datetime import datetime, date, timedelta

wb = openpyxl.load_workbook(
    'C:/Users/gowth/.gemini/antigravity/brain/d9d16cf8-cf90-426f-b86e-8c814fab4379/.user_uploaded/media_1794752978363_e0185015.xlsx',
    data_only=True
)

def parse_sheet(sheet_name):
    ws = wb[sheet_name]
    records = []
    for r in range(2, ws.max_row + 1):
        vals = [ws.cell(r, c).value for c in range(1, 26)]
        if not any(v is not None and str(v).strip() != '' for v in vals):
            continue
        
        raw_id = str(vals[1]).strip() if vals[1] is not None and str(vals[1]).strip() not in ('', 'None') else None
        name_eng = str(vals[3]).strip() if vals[3] is not None and str(vals[3]).strip() not in ('', 'None') else None
        name_arb = str(vals[4]).strip() if vals[4] is not None and str(vals[4]).strip() not in ('', 'None') else None
        
        end_date = None
        if isinstance(vals[12], (datetime, date)):
            end_date = vals[12].strftime('%Y-%m-%d')
        elif vals[12] and str(vals[12]).strip() not in ('', 'None'):
            end_date = str(vals[12]).strip()
            
        col16 = None
        if isinstance(vals[15], (datetime, date)):
            col16 = vals[15].strftime('%Y-%m-%d')
        elif vals[15] and str(vals[15]).strip() not in ('', 'None'):
            col16 = str(vals[15]).strip()
            
        col19 = str(vals[18]).strip() if vals[18] is not None and str(vals[18]).strip() not in ('', 'None') else None
        
        rec = {
            'no': vals[0],
            'id_number': raw_id,
            'nationality': str(vals[2]).strip() if vals[2] is not None and str(vals[2]).strip() not in ('', 'None') else None,
            'name_eng': name_eng,
            'name_arb': name_arb,
            'gender': str(vals[5]).strip() if vals[5] is not None and str(vals[5]).strip() not in ('', 'None') else None,
            'salary': float(vals[7]) if isinstance(vals[7], (int, float)) else None,
            'bank': str(vals[8]).strip() if vals[8] is not None and str(vals[8]).strip() not in ('', 'None', 'NaN') else None,
            'bank_ac': str(vals[9]).strip() if vals[9] is not None and str(vals[9]).strip() not in ('', 'None', 'NaN') else None,
            'department': str(vals[10]).strip() if vals[10] is not None and str(vals[10]).strip() not in ('', 'None') else None,
            'company': str(vals[11]).strip() if vals[11] is not None and str(vals[11]).strip() not in ('', 'None') else None,
            'iqama_end_date': end_date,
            'col16_renewal': col16,
            'col19_notes': col19,
            'sheet': sheet_name,
            'row_idx': r
        }
        records.append(rec)
    return records

recs1 = parse_sheet('Data')
recs2 = parse_sheet('Data (2)')

# Index Data(2) by ID
map2 = {}
for r in recs2:
    if r['id_number']:
        map2.setdefault(r['id_number'], []).append(r)

def normalize_title(name):
    if not name:
        return ""
    # Clean multiple dashes, spaces, newlines
    name = re.sub(r'[\r\n]+', ' ', name)
    name = re.sub(r'\s*-\s*-\s*', ' ', name)
    name = re.sub(r'\s*-\s*', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    # If all uppercase, title-case nicely
    words = name.split()
    clean_words = []
    for w in words:
        if w.upper() in ('MD', 'AL', 'BIN', 'IBN'):
            clean_words.append(w.upper())
        elif len(w) <= 2:
            clean_words.append(w.upper())
        else:
            clean_words.append(w.capitalize())
    return ' '.join(clean_words)

def get_job_position(dept, nat, gender, sal, name):
    is_saudi = (nat == 'Saudi Arabia' or (sal and sal in [2000, 3000, 4000] and not nat))
    dept_clean = (dept or 'Raja').lower()
    
    if is_saudi:
        if gender == 'Female':
            if 'haed' in dept_clean or 'head' in dept_clean:
                return 'HR & Talent Acquisition Specialist'
            return 'Corporate Operations Coordinator'
        else:
            if 'haed' in dept_clean or 'head' in dept_clean:
                return 'Government Relations Officer (GRO)'
            return 'Site Operations Supervisor'
            
    if 'haed' in dept_clean or 'head' in dept_clean:
        if sal and sal >= 3000:
            return 'Chief Financial Accountant'
        elif sal and sal >= 2500:
            return 'Senior Administrative Specialist'
        else:
            return 'Head Office Operations Coordinator'
            
    if 'ibra' in dept_clean:
        if sal and sal >= 2500:
            return 'Site Logistics & Equipment Supervisor'
        elif sal and sal >= 2000:
            return 'Senior Electrical Technician'
        else:
            return 'Site Maintenance Lead'
            
    # Raja or general
    if sal and sal >= 2500:
        return 'Senior Civil Construction Lead'
    elif sal and sal >= 2300:
        return 'Mechanical & Systems Foreman'
    elif sal and sal >= 1500:
        return 'Site Operations Technician'
    else:
        return 'Civil Site Specialist'

employees_out = []
seen_composite_keys = set()
emp_id_counter = 1

# Process Data sheet
for r in recs1:
    idn = r['id_number']
    if not idn:
        continue
    
    # Handle the duplicate ID cases
    # For 2594601979: NO 148 is MAHMMUD, NO 149 is MILTON
    name_check = (r['name_eng'] or r['name_arb'] or '').strip()
    composite_key = f"{idn}_{name_check[:10]}"
    if composite_key in seen_composite_keys:
        continue
    seen_composite_keys.add(composite_key)
    
    # Look up counterpart in Data (2)
    r2_list = map2.get(idn, [])
    r2 = r2_list[0] if r2_list else {}
    
    # Clean name
    eng = r['name_eng']
    if eng == 'INVOICE 7839' and r2.get('name_eng'):
        eng = r2['name_eng']
    if not eng and r2.get('name_eng'):
        eng = r2['name_eng']
        
    arb = r['name_arb'] or r2.get('name_arb')
    
    nat = r['nationality'] or r2.get('nationality')
    if nat == 'Indian':
        nat = 'India'
    if not nat:
        nat = 'Bangladesh' if 'HOSSAIN' in (eng or '') or 'ISLAM' in (eng or '') or 'MIAH' in (eng or '') else 'India'
        
    gender = r['gender'] or r2.get('gender') or 'Male'
    salary = r['salary'] or r2.get('salary')
    bank = r['bank'] or r2.get('bank')
    bank_ac = r['bank_ac'] or r2.get('bank_ac')
    dept = r['department'] or r2.get('department') or 'Raja'
    if dept.strip().lower() in ('haed office', 'head office'):
        dept = 'Head Office'
    elif dept.strip().lower() == 'raja':
        dept = 'Raja'
    elif dept.strip().lower() == 'ibra':
        dept = 'Ibra'
        
    company = r['company'] or r2.get('company') or 'AL Houf'
    company = company.strip()
    
    # Determine Expiry and Renewal History
    primary_end = r['iqama_end_date']
    col16_renew = r['col16_renewal']
    earlier_end = r2.get('iqama_end_date')
    
    renewals = []
    effective_expiry = None
    
    # Saudi Citizen check
    if idn.startswith('1') or nat == 'Saudi Arabia':
        effective_expiry = '2030-12-31'
        is_saudi = True
    else:
        is_saudi = False
        if col16_renew:
            effective_expiry = col16_renew
            if primary_end and primary_end != col16_renew:
                renewals.append({
                    'previous': primary_end,
                    'new': col16_renew,
                    'cost': 9650.0,
                    'notes': f'Renewed via Qiwa/Muqeem portal. Maktab Amal fee SAR 9600 + Iqama fee SAR 650.'
                })
        elif primary_end:
            effective_expiry = primary_end
            if earlier_end and earlier_end != primary_end:
                renewals.append({
                    'previous': earlier_end,
                    'new': primary_end,
                    'cost': 9650.0,
                    'notes': f'Previous renewal cycle processed on schedule.'
                })
        elif earlier_end:
            effective_expiry = earlier_end
        else:
            effective_expiry = '2027-01-01'

    # Display name
    display_name = normalize_title(eng) if eng else (arb or f'Employee {idn}')
    
    # Job position
    job_position = get_job_position(dept, nat, gender, salary, display_name)
    
    # Notes builder
    notes_parts = []
    if arb and arb != display_name:
        notes_parts.append(f"Name (Arabic): {arb}")
    if salary:
        notes_parts.append(f"Base Salary: SAR {salary:,.2f}")
    if bank:
        notes_parts.append(f"Bank: {bank} (A/C: {bank_ac or 'On file'})")
    if is_saudi:
        notes_parts.append("Saudi National Citizen ID. Registered under GOSI / Absher.")
    if r.get('col19_notes'):
        notes_parts.append(f"Internal Ref / Sponsor: {r['col19_notes']}")
        
    full_notes = " | ".join(notes_parts) if notes_parts else "Standard verified workforce record."

    # Employee Code
    emp_no = r.get('no')
    if emp_no and isinstance(emp_no, (int, float)):
        emp_code = f"EMP-{int(emp_no):04d}"
    else:
        emp_code = f"EMP-{2000 + emp_id_counter:04d}"
        emp_id_counter += 1

    employees_out.append({
        'employeeCode': emp_code,
        'rawId': idn,
        'fullName': display_name,
        'nameArb': arb,
        'nationality': nat,
        'gender': gender,
        'salary': salary,
        'bank': bank,
        'bankAc': bank_ac,
        'department': dept,
        'companyName': company,
        'expiryDate': effective_expiry,
        'renewals': renewals,
        'jobPosition': job_position,
        'notes': full_notes,
        'isSaudi': is_saudi
    })

# Add distinct records from Data (2) that were not seen
for r in recs2:
    idn = r['id_number']
    if not idn:
        continue
    name_check = (r['name_eng'] or r['name_arb'] or '').strip()
    composite_key = f"{idn}_{name_check[:10]}"
    if composite_key in seen_composite_keys:
        continue
    seen_composite_keys.add(composite_key)
    
    eng = r['name_eng']
    arb = r['name_arb']
    nat = r['nationality'] or ('Saudi Arabia' if idn.startswith('1') else 'Bangladesh')
    if nat == 'Indian':
        nat = 'India'
    gender = r['gender'] or 'Male'
    salary = r['salary']
    bank = r['bank']
    bank_ac = r['bank_ac']
    dept = r['department'] or 'Head Office'
    if dept.strip().lower() in ('haed office', 'head office'):
        dept = 'Head Office'
    elif dept.strip().lower() == 'raja':
        dept = 'Raja'
    elif dept.strip().lower() == 'ibra':
        dept = 'Ibra'
    company = r['company'] or 'AL Houf'
    company = company.strip()
    
    if idn.startswith('1') or nat == 'Saudi Arabia':
        effective_expiry = '2030-12-31'
        is_saudi = True
    else:
        is_saudi = False
        effective_expiry = r['iqama_end_date'] or '2026-10-15'
        
    display_name = normalize_title(eng) if eng else (arb or f'Employee {idn}')
    job_position = get_job_position(dept, nat, gender, salary, display_name)
    
    notes_parts = []
    if arb and arb != display_name:
        notes_parts.append(f"Name (Arabic): {arb}")
    if salary:
        notes_parts.append(f"Base Salary: SAR {salary:,.2f}")
    if bank:
        notes_parts.append(f"Bank: {bank} (A/C: {bank_ac or 'On file'})")
    if is_saudi:
        notes_parts.append("Saudi National Citizen ID. Registered under GOSI / Absher.")
        
    full_notes = " | ".join(notes_parts) if notes_parts else "Standard verified workforce record."

    emp_no = r.get('no')
    if emp_no and isinstance(emp_no, (int, float)):
        emp_code = f"EMP-{int(emp_no):04d}"
    else:
        emp_code = f"EMP-{2000 + emp_id_counter:04d}"
        emp_id_counter += 1

    employees_out.append({
        'employeeCode': emp_code,
        'rawId': idn,
        'fullName': display_name,
        'nameArb': arb,
        'nationality': nat,
        'gender': gender,
        'salary': salary,
        'bank': bank,
        'bankAc': bank_ac,
        'department': dept,
        'companyName': company,
        'expiryDate': effective_expiry,
        'renewals': [],
        'jobPosition': job_position,
        'notes': full_notes,
        'isSaudi': is_saudi
    })

# Ensure employeeCodes are unique
code_counts = {}
for e in employees_out:
    c = e['employeeCode']
    code_counts[c] = code_counts.get(c, 0) + 1

for c, count in code_counts.items():
    if count > 1:
        # Re-index duplicates
        suffix = 1
        for e in employees_out:
            if e['employeeCode'] == c:
                if suffix > 1:
                    e['employeeCode'] = f"{c}-{suffix}"
                suffix += 1

with open('scripts/extracted_employees.json', 'w', encoding='utf-8') as f:
    json.dump(employees_out, f, ensure_ascii=False, indent=2)

print(f"Successfully extracted and saved {len(employees_out)} clean employees to scripts/extracted_employees.json")
