-- KFH Hospital Database Schema for Oracle 21c Express Edition
-- Generated from kfh_database_schema.html
-- Note: Adjust VARCHAR2 lengths as needed. Enums are represented as VARCHAR2(50).
-- Foreign keys are added where indicated. Run tables in dependency order.

-- Domain: Patient registry
CREATE TABLE patients (
    patient_id NUMBER PRIMARY KEY,
    first_name VARCHAR2(100),
    last_name VARCHAR2(100),
    dob DATE,
    gender VARCHAR2(10),
    national_id VARCHAR2(20),
    nida_verified NUMBER(1),
    phone VARCHAR2(20),
    blood_type VARCHAR2(5),
    country_of_origin VARCHAR2(50)
);

CREATE TABLE patient_insurance (
    pi_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    scheme VARCHAR2(50),
    member_number VARCHAR2(50),
    valid_from DATE,
    valid_to DATE,
    auto_verified NUMBER(1),
    verified_at TIMESTAMP
);

CREATE TABLE next_of_kin (
    kin_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    name VARCHAR2(100),
    relationship VARCHAR2(50),
    phone VARCHAR2(20),
    is_emergency_contact NUMBER(1)
);

CREATE TABLE addresses (
    address_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    district VARCHAR2(50),
    province VARCHAR2(50),
    country VARCHAR2(50)
);

-- Domain: Admissions & visits
CREATE TABLE departments (
    dept_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    category VARCHAR2(50),
    head_staff_id NUMBER -- FK to staff, added later
);

CREATE TABLE beds (
    bed_id NUMBER PRIMARY KEY,
    ward_id NUMBER, -- FK to wards
    bed_number VARCHAR2(10),
    room_type VARCHAR2(50),
    status VARCHAR2(20)
);

CREATE TABLE wards (
    ward_id NUMBER PRIMARY KEY,
    dept_id NUMBER REFERENCES departments(dept_id),
    name VARCHAR2(100),
    floor NUMBER,
    capacity NUMBER,
    type VARCHAR2(50)
);

-- Update beds FK
ALTER TABLE beds ADD CONSTRAINT fk_beds_ward FOREIGN KEY (ward_id) REFERENCES wards(ward_id);

CREATE TABLE visits (
    visit_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    visit_type VARCHAR2(50),
    dept_id NUMBER REFERENCES departments(dept_id),
    triage_level NUMBER,
    admitted_at TIMESTAMP,
    discharged_at TIMESTAMP,
    bed_id NUMBER REFERENCES beds(bed_id),
    room_type VARCHAR2(50),
    queue_token VARCHAR2(20)
);

CREATE TABLE referrals (
    referral_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    from_facility VARCHAR2(100),
    from_country VARCHAR2(50),
    reason CLOB,
    priority VARCHAR2(20),
    referral_date DATE,
    accepted_at TIMESTAMP
);

-- Domain: Departments & staff
CREATE TABLE staff (
    staff_id NUMBER PRIMARY KEY,
    first_name VARCHAR2(100),
    last_name VARCHAR2(100),
    role VARCHAR2(50),
    gender VARCHAR2(10),
    dob DATE,
    dept_id NUMBER REFERENCES departments(dept_id),
    license_number VARCHAR2(50),
    email VARCHAR2(100),
    phone VARCHAR2(20),
    nationality VARCHAR2(50),
    hire_date DATE
);

-- Update departments FK
ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_staff_id) REFERENCES staff(staff_id);

CREATE TABLE operation_theaters (
    ot_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    dept_id NUMBER REFERENCES departments(dept_id),
    status VARCHAR2(20),
    floor NUMBER,
    type VARCHAR2(50)
);

CREATE TABLE staff_schedule (
    sched_id NUMBER PRIMARY KEY,
    staff_id NUMBER REFERENCES staff(staff_id),
    shift_date DATE,
    shift_type VARCHAR2(20),
    dept_id NUMBER REFERENCES departments(dept_id)
);

-- Domain: Cardiology & cath lab (KFH-unique)
CREATE TABLE cardiac_encounters (
    cardiac_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    cardiologist_id NUMBER REFERENCES staff(staff_id),
    ecg_findings CLOB,
    echo_findings CLOB,
    ef_percent NUMBER(5,2),
    nyha_class NUMBER,
    rhythm VARCHAR2(50)
);

CREATE TABLE catheterization_procedures (
    cath_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    procedure_type VARCHAR2(50),
    access_site VARCHAR2(50),
    contrast_agent VARCHAR2(100),
    contrast_ml NUMBER,
    fluoroscopy_min NUMBER(5,2),
    radiation_dose_mgy NUMBER(10,2),
    performed_by NUMBER REFERENCES staff(staff_id),
    performed_at TIMESTAMP,
    findings CLOB,
    complications CLOB
);

CREATE TABLE coronary_angiograms (
    angio_id NUMBER PRIMARY KEY,
    cath_id NUMBER REFERENCES catheterization_procedures(cath_id),
    vessel VARCHAR2(50),
    stenosis_percent NUMBER,
    lesion_type VARCHAR2(50),
    ffr_value NUMBER(5,2),
    intervention VARCHAR2(50),
    stent_type VARCHAR2(50),
    stent_length_mm NUMBER(5,2)
);

CREATE TABLE cardiac_devices (
    device_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    device_type VARCHAR2(50),
    manufacturer VARCHAR2(100),
    model VARCHAR2(100),
    serial_number VARCHAR2(50),
    implanted_at DATE,
    implanted_by NUMBER REFERENCES staff(staff_id),
    next_check_date DATE,
    battery_status VARCHAR2(20)
);

-- Domain: Cardio-thoracic surgery (KFH-unique)
CREATE TABLE ct_surgery_cases (
    cts_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    procedure_type VARCHAR2(50),
    bypass_used NUMBER(1),
    bypass_time_min NUMBER,
    cross_clamp_min NUMBER,
    surgeon_id NUMBER REFERENCES staff(staff_id),
    ot_id NUMBER REFERENCES operation_theaters(ot_id),
    performed_at TIMESTAMP,
    outcome VARCHAR2(50),
    discharge_status VARCHAR2(50)
);

CREATE TABLE perfusion_records (
    perf_id NUMBER PRIMARY KEY,
    cts_id NUMBER REFERENCES ct_surgery_cases(cts_id),
    perfusionist_id NUMBER REFERENCES staff(staff_id),
    bypass_start TIMESTAMP,
    bypass_end TIMESTAMP,
    min_temp_celsius NUMBER(5,2),
    max_flow_lpm NUMBER(5,2),
    priming_vol_ml NUMBER,
    blood_units_used NUMBER,
    incidents CLOB
);

CREATE TABLE thoracic_procedures (
    thorac_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    approach VARCHAR2(50),
    lung_side VARCHAR2(10),
    resection_type VARCHAR2(50),
    findings CLOB,
    surgeon_id NUMBER REFERENCES staff(staff_id),
    ot_id NUMBER REFERENCES operation_theaters(ot_id),
    performed_at TIMESTAMP
);

CREATE TABLE chest_drains (
    drain_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    side VARCHAR2(10),
    inserted_at TIMESTAMP,
    removed_at TIMESTAMP,
    output_ml_day NUMBER(7,2),
    drain_type VARCHAR2(50),
    indication VARCHAR2(100)
);

-- Domain: Hepatobiliary & GI (KFH-unique)
CREATE TABLE hepatobiliary_cases (
    hb_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    procedure_type VARCHAR2(50),
    approach VARCHAR2(50),
    organ VARCHAR2(50),
    surgeon_id NUMBER REFERENCES staff(staff_id),
    ot_id NUMBER REFERENCES operation_theaters(ot_id),
    performed_at TIMESTAMP,
    complications CLOB,
    intraop_blood_loss_ml NUMBER
);

CREATE TABLE endoscopy_procedures (
    endo_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    scope_type VARCHAR2(50),
    indication CLOB,
    findings CLOB,
    biopsy_taken NUMBER(1),
    polyps_removed NUMBER(1),
    performed_by NUMBER REFERENCES staff(staff_id),
    performed_at TIMESTAMP
);

CREATE TABLE liver_function_tracking (
    lft_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    test_date DATE,
    alt_ul NUMBER(7,2),
    ast_ul NUMBER(7,2),
    bilirubin_total NUMBER(5,2),
    albumin_gdl NUMBER(5,2),
    inr NUMBER(5,2),
    ggt_ul NUMBER(7,2),
    child_pugh_score NUMBER
);

CREATE TABLE gi_diagnoses (
    gi_diag_id NUMBER PRIMARY KEY,
    encounter_id NUMBER, -- FK to encounters, added later
    gi_location VARCHAR2(50),
    icd10_code VARCHAR2(10),
    h_pylori_status VARCHAR2(20),
    severity VARCHAR2(20),
    barrett_present NUMBER(1)
);

-- Domain: Haematology & pathology (KFH-unique)
CREATE TABLE haematology_cases (
    haem_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    diagnosis VARCHAR2(100),
    haematologist_id NUMBER REFERENCES staff(staff_id),
    bone_marrow_done NUMBER(1),
    flow_cytometry_done NUMBER(1),
    transfusion_dependent NUMBER(1),
    disease_phase VARCHAR2(50),
    protocol VARCHAR2(100)
);

CREATE TABLE blood_transfusions (
    transfusion_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    product_type VARCHAR2(50),
    units_given NUMBER,
    blood_group VARCHAR2(5),
    rh_factor VARCHAR2(5),
    cross_match_result VARCHAR2(20),
    transfused_at TIMESTAMP,
    transfusion_duration_min NUMBER,
    reaction VARCHAR2(50),
    reaction_notes CLOB
);

CREATE TABLE pathology_specimens (
    specimen_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    tissue_type VARCHAR2(50),
    collection_method VARCHAR2(50),
    body_site VARCHAR2(50),
    collected_by NUMBER REFERENCES staff(staff_id),
    collected_at TIMESTAMP,
    fixative_used VARCHAR2(50),
    gross_description CLOB
);

CREATE TABLE pathology_reports (
    path_report_id NUMBER PRIMARY KEY,
    specimen_id NUMBER REFERENCES pathology_specimens(specimen_id),
    pathologist_id NUMBER REFERENCES staff(staff_id),
    diagnosis CLOB,
    icd10_code VARCHAR2(10),
    tumour_grade VARCHAR2(20),
    margin_status VARCHAR2(20),
    lymphovascular_invasion NUMBER(1),
    ki67_percent NUMBER(5,2),
    molecular_markers CLOB,
    reported_at TIMESTAMP
);

-- Domain: Nephrology & transplant (KFH-unique)
CREATE TABLE nephrology_cases (
    neph_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    ckd_stage NUMBER,
    nephrologist_id NUMBER REFERENCES staff(staff_id),
    primary_cause VARCHAR2(100),
    dialysis_required NUMBER(1),
    gfr_ml_min NUMBER(5,2),
    proteinuria_g_day NUMBER(5,2),
    transplant_waitlisted NUMBER(1)
);

CREATE TABLE dialysis_sessions (
    dialysis_id NUMBER PRIMARY KEY,
    patient_id NUMBER REFERENCES patients(patient_id),
    session_date DATE,
    modality VARCHAR2(50),
    duration_hrs NUMBER(5,2),
    kt_v NUMBER(5,2),
    ultrafiltration_ml NUMBER,
    access_type VARCHAR2(50),
    machine_id NUMBER, -- Assuming machine table exists or add later
    conducted_by NUMBER REFERENCES staff(staff_id),
    complications CLOB
);

CREATE TABLE kidney_transplants (
    transplant_id NUMBER PRIMARY KEY,
    recipient_id NUMBER REFERENCES patients(patient_id),
    donor_id NUMBER REFERENCES patients(patient_id),
    donor_type VARCHAR2(20),
    surgery_date DATE,
    surgeon_id NUMBER REFERENCES staff(staff_id),
    ot_id NUMBER REFERENCES operation_theaters(ot_id),
    hla_match_score NUMBER(5,2),
    cold_ischemia_hrs NUMBER(5,2),
    warm_ischemia_min NUMBER,
    delayed_graft_function NUMBER(1),
    outcome VARCHAR2(50)
);

CREATE TABLE immunosuppression_regimens (
    immuno_id NUMBER PRIMARY KEY,
    transplant_id NUMBER REFERENCES kidney_transplants(transplant_id),
    med_id NUMBER, -- FK to medications, added later
    dose_mg NUMBER(7,2),
    frequency VARCHAR2(50),
    route VARCHAR2(20),
    started_at DATE,
    trough_level_ngml NUMBER(7,2),
    adjusted_at TIMESTAMP
);

-- Domain: Clinical records
CREATE TABLE encounters (
    encounter_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    staff_id NUMBER REFERENCES staff(staff_id),
    encounter_time TIMESTAMP,
    type VARCHAR2(50),
    notes CLOB,
    is_paperless NUMBER(1)
);

-- Update gi_diagnoses FK
ALTER TABLE gi_diagnoses ADD CONSTRAINT fk_gi_encounter FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id);

CREATE TABLE diagnoses (
    diag_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    icd10_code VARCHAR2(10),
    description CLOB,
    is_primary NUMBER(1),
    confirmed_at DATE
);

CREATE TABLE vital_signs (
    vital_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    bp_systolic NUMBER,
    bp_diastolic NUMBER,
    pulse NUMBER,
    temp_celsius NUMBER(5,2),
    spo2 NUMBER(5,2),
    weight_kg NUMBER(5,2),
    height_cm NUMBER(5,2),
    bmi NUMBER(5,2)
);

CREATE TABLE procedures (
    proc_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    cpt_code VARCHAR2(10),
    description CLOB,
    performed_by NUMBER REFERENCES staff(staff_id),
    ot_id NUMBER REFERENCES operation_theaters(ot_id),
    performed_at TIMESTAMP
);

-- Domain: Radiology & PACS
CREATE TABLE imaging_machines (
    machine_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    modality VARCHAR2(50),
    location VARCHAR2(100),
    last_serviced DATE,
    resolution VARCHAR2(50),
    tesla_strength NUMBER(5,2)
);

CREATE TABLE imaging_orders (
    img_order_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    modality VARCHAR2(50),
    body_part VARCHAR2(50),
    clinical_indication CLOB,
    ordered_by NUMBER REFERENCES staff(staff_id),
    ordered_at TIMESTAMP,
    priority VARCHAR2(20),
    status VARCHAR2(20)
);

CREATE TABLE imaging_studies (
    study_id NUMBER PRIMARY KEY,
    img_order_id NUMBER REFERENCES imaging_orders(img_order_id),
    dicom_uid VARCHAR2(100),
    pacs_url VARCHAR2(200),
    performed_at TIMESTAMP,
    technologist_id NUMBER REFERENCES staff(staff_id),
    machine_id NUMBER REFERENCES imaging_machines(machine_id),
    image_count NUMBER
);

CREATE TABLE radiology_reports (
    report_id NUMBER PRIMARY KEY,
    study_id NUMBER REFERENCES imaging_studies(study_id),
    radiologist_id NUMBER REFERENCES staff(staff_id),
    findings CLOB,
    impression CLOB,
    critical_finding NUMBER(1),
    reported_at TIMESTAMP
);

-- Domain: Pharmacy & medications
CREATE TABLE medications (
    med_id NUMBER PRIMARY KEY,
    generic_name VARCHAR2(100),
    brand_name VARCHAR2(100),
    form VARCHAR2(50),
    strength VARCHAR2(50),
    unit VARCHAR2(20),
    rxnorm_code VARCHAR2(20)
);

-- Update immunosuppression_regimens FK
ALTER TABLE immunosuppression_regimens ADD CONSTRAINT fk_immuno_med FOREIGN KEY (med_id) REFERENCES medications(med_id);

CREATE TABLE prescriptions (
    rx_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    med_id NUMBER REFERENCES medications(med_id),
    dose VARCHAR2(50),
    frequency VARCHAR2(50),
    duration_days NUMBER,
    prescribed_by NUMBER REFERENCES staff(staff_id),
    e_prescription NUMBER(1),
    ddi_checked NUMBER(1)
);

CREATE TABLE drug_stock (
    stock_id NUMBER PRIMARY KEY,
    med_id NUMBER REFERENCES medications(med_id),
    location VARCHAR2(100),
    qty_on_hand NUMBER,
    reorder_level NUMBER,
    expiry_date DATE,
    batch_number VARCHAR2(50)
);

CREATE TABLE dispensing (
    disp_id NUMBER PRIMARY KEY,
    rx_id NUMBER REFERENCES prescriptions(rx_id),
    dispensed_by NUMBER REFERENCES staff(staff_id),
    dispensed_at TIMESTAMP,
    qty_dispensed NUMBER,
    location VARCHAR2(100),
    payment_ref VARCHAR2(50)
);

-- Domain: Billing & insurance
CREATE TABLE invoices (
    invoice_id NUMBER PRIMARY KEY,
    visit_id NUMBER REFERENCES visits(visit_id),
    issued_at TIMESTAMP,
    total_amount NUMBER(10,2),
    paid_amount NUMBER(10,2),
    status VARCHAR2(20),
    payment_method VARCHAR2(50),
    generated_automatically NUMBER(1)
);

CREATE TABLE invoice_items (
    item_id NUMBER PRIMARY KEY,
    invoice_id NUMBER REFERENCES invoices(invoice_id),
    service_type VARCHAR2(50),
    description VARCHAR2(200),
    qty NUMBER,
    unit_price NUMBER(10,2),
    discount_percent NUMBER(5,2)
);

CREATE TABLE insurance_claims (
    claim_id NUMBER PRIMARY KEY,
    invoice_id NUMBER REFERENCES invoices(invoice_id),
    scheme VARCHAR2(50),
    claimed_amount NUMBER(10,2),
    approved_amount NUMBER(10,2),
    status VARCHAR2(20),
    auto_verified NUMBER(1),
    submitted_at DATE
);

CREATE TABLE payments (
    payment_id NUMBER PRIMARY KEY,
    invoice_id NUMBER REFERENCES invoices(invoice_id),
    method VARCHAR2(50),
    amount NUMBER(10,2),
    paid_at TIMESTAMP,
    momo_transaction_ref VARCHAR2(50),
    received_by NUMBER REFERENCES staff(staff_id)
);

-- Domain: Laboratory (LIS)
CREATE TABLE lab_tests (
    test_id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    category VARCHAR2(50),
    sample_type VARCHAR2(50),
    loinc_code VARCHAR2(20),
    turnaround_hrs NUMBER,
    analyser_interface NUMBER(1)
);

CREATE TABLE lab_orders (
    order_id NUMBER PRIMARY KEY,
    encounter_id NUMBER REFERENCES encounters(encounter_id),
    ordered_by NUMBER REFERENCES staff(staff_id),
    test_id NUMBER REFERENCES lab_tests(test_id),
    ordered_at TIMESTAMP,
    priority VARCHAR2(20),
    status VARCHAR2(20)
);

CREATE TABLE specimens (
    specimen_id NUMBER PRIMARY KEY,
    order_id NUMBER REFERENCES lab_orders(order_id),
    collected_by NUMBER REFERENCES staff(staff_id),
    collected_at TIMESTAMP,
    barcode VARCHAR2(50),
    analyser_id NUMBER, -- Assuming analyser table or add later
    status VARCHAR2(20)
);

CREATE TABLE lab_results (
    result_id NUMBER PRIMARY KEY,
    order_id NUMBER REFERENCES lab_orders(order_id),
    parameter VARCHAR2(100),
    value VARCHAR2(100),
    unit VARCHAR2(20),
    ref_range VARCHAR2(50),
    flag VARCHAR2(20),
    sms_sent NUMBER(1),
    resulted_at TIMESTAMP
);