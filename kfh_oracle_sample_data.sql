-- KFH Oracle Sample Data and Sequence Script
-- This script adds sample rows to the KFH schema and creates sequences for auto-incrementing IDs.
-- Run this after kfh_oracle_schema.sql in the same schema.

-- Sequences for primary key auto-increment
CREATE SEQUENCE seq_patients START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_patient_insurance START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_next_of_kin START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_addresses START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_departments START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_wards START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_beds START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_visits START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_referrals START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_staff START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_operation_theaters START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_staff_schedule START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_encounters START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_diagnoses START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_vital_signs START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_procedures START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_invoices START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_invoice_items START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_insurance_claims START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_payments START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_medications START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_drug_stock START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_prescriptions START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_dispensing START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_lab_tests START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_lab_orders START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_specimens START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_lab_results START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_imaging_machines START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_imaging_orders START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_imaging_studies START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_radiology_reports START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_cardiac_encounters START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_catheterization_procedures START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_coronary_angiograms START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_cardiac_devices START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_ct_surgery_cases START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_perfusion_records START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_thoracic_procedures START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_chest_drains START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_hepatobiliary_cases START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_endoscopy_procedures START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_liver_function_tracking START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_gi_diagnoses START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_haematology_cases START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_blood_transfusions START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_pathology_specimens START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_pathology_reports START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_nephrology_cases START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_dialysis_sessions START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_kidney_transplants START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE seq_immunosuppression_regimens START WITH 21 INCREMENT BY 1 NOCACHE NOCYCLE;

-- Explicit sample patient insert data
INSERT ALL
INTO patients VALUES (1,'Jean','Mukasa',DATE '1980-05-12','M','1198805121234567',1,'0788123457','O+','Rwanda')
INTO patients VALUES (2,'Aline','Uwase',DATE '1990-08-23','F','1199708232345678',1,'0788765435','A-','Rwanda')
INTO patients VALUES (3,'Emmanuel','Niyonsaba',DATE '1975-02-15','M','1197582153456789',1,'0788345671','B+','Rwanda')
INTO patients VALUES (4,'Catherine','Umutesi',DATE '2000-12-05','F','1200072054567890',1,'0788123989','AB+','Rwanda')
INTO patients VALUES (5,'Pascal','Habimana',DATE '1985-07-18','M','1198587185678901',1,'0788234568','O-','Rwanda')
INTO patients VALUES (6,'Jeanne','Munyaneza',DATE '1992-11-20','F','1199271209876543',1,'0788845124','A+','Rwanda')
INTO patients VALUES (7,'Olivier','Nkurunziza',DATE '1988-03-03','M','1198883037654321',1,'0788590124','B-','Rwanda')
INTO patients VALUES (8,'Claire','Ishimwe',DATE '1979-09-14','F','1197979142345678',1,'0788456790','O+','Rwanda')
INTO patients VALUES (9,'Innocent','Rusesabagina',DATE '1968-01-29','M','1196881298765432',1,'0788341235','AB-','Rwanda')
INTO patients VALUES (10,'Nadine','Mukantabana',DATE '1995-06-05','F','1199576053456789',1,'0788587655','A-','Rwanda')
INTO patients VALUES (11,'Felix','Nyirahabimana',DATE '1983-04-22','M','1198384221234590',1,'0788231099','B+','Rwanda')
INTO patients VALUES (12,'Sandrine','Uwimana',DATE '2002-10-18','F','1200270188765432',1,'0788304568','A+','Rwanda')
INTO patients VALUES (13,'Pascaline','Mukanwankiza',DATE '1978-07-09','F','1197877092345691',1,'0788125679','O-','Rwanda')
INTO patients VALUES (14,'Eric','Ndoli',DATE '1991-12-12','M','1199182123456790',1,'0788467891','B+','Rwanda')
INTO patients VALUES (15,'Sophie','Imani',DATE '1987-01-30','F','1200771301234567',1,'0788812345','O+','Rwanda')
INTO patients VALUES (16,'Bertrand','Kamanzi',DATE '1994-03-11','M','1199483112345678',1,'0788923456','A-','Rwanda')
INTO patients VALUES (17,'Suzan','Bizimana',DATE '1989-08-19','F','1198978193456789',1,'0788034567','B+','Rwanda')
INTO patients VALUES (18,'Paul','Ngabo',DATE '1993-02-27','M','1199382279876501',1,'0788145678','B-','Rwanda')
INTO patients VALUES (19,'Ariane','Kagabo',DATE '1997-02-24','F','1199772249876502',1,'0788256789','A+','Rwanda')
INTO patients VALUES (20,'Jean','Uwera',DATE '1982-05-16','M','1198285163456792',1,'0788367890','O-','Rwanda')
SELECT * FROM dual;

INSERT ALL
INTO patient_insurance VALUES (1,1,'Public','KFH-PUB-001',DATE '2024-01-01',DATE '2025-01-01',1,TIMESTAMP '2024-01-02 09:00:00')
INTO patient_insurance VALUES (2,2,'Private','KFH-PRI-002',DATE '2024-02-01',DATE '2025-02-01',1,TIMESTAMP '2024-02-02 10:00:00')
INTO patient_insurance VALUES (3,3,'Public','KFH-PUB-003',DATE '2024-03-01',DATE '2025-03-01',1,TIMESTAMP '2024-03-02 11:00:00')
INTO patient_insurance VALUES (4,4,'Private','KFH-PRI-004',DATE '2024-04-01',DATE '2025-04-01',0,NULL)
INTO patient_insurance VALUES (5,5,'Public','KFH-PUB-005',DATE '2024-05-01',DATE '2025-05-01',1,TIMESTAMP '2024-05-02 12:00:00')
INTO patient_insurance VALUES (6,6,'Private','KFH-PRI-006',DATE '2024-06-01',DATE '2025-06-01',0,NULL)
INTO patient_insurance VALUES (7,7,'Public','KFH-PUB-007',DATE '2024-07-01',DATE '2025-07-01',1,TIMESTAMP '2024-07-02 13:00:00')
INTO patient_insurance VALUES (8,8,'Private','KFH-PRI-008',DATE '2024-08-01',DATE '2025-08-01',1,TIMESTAMP '2024-08-02 14:00:00')
INTO patient_insurance VALUES (9,9,'Public','KFH-PUB-009',DATE '2024-09-01',DATE '2025-09-01',0,NULL)
INTO patient_insurance VALUES (10,10,'Private','KFH-PRI-010',DATE '2024-10-01',DATE '2025-10-01',1,TIMESTAMP '2024-10-02 15:00:00')
INTO patient_insurance VALUES (11,11,'Public','KFH-PUB-011',DATE '2024-11-01',DATE '2025-11-01',1,TIMESTAMP '2024-11-02 16:00:00')
INTO patient_insurance VALUES (12,12,'Private','KFH-PRI-012',DATE '2024-12-01',DATE '2025-12-01',0,NULL)
INTO patient_insurance VALUES (13,13,'Public','KFH-PUB-013',DATE '2025-01-01',DATE '2026-01-01',1,TIMESTAMP '2025-01-02 09:00:00')
INTO patient_insurance VALUES (14,14,'Private','KFH-PRI-014',DATE '2025-02-01',DATE '2026-02-01',1,TIMESTAMP '2025-02-02 10:00:00')
INTO patient_insurance VALUES (15,15,'Public','KFH-PUB-015',DATE '2025-03-01',DATE '2026-03-01',0,NULL)
INTO patient_insurance VALUES (16,16,'Private','KFH-PRI-016',DATE '2025-04-01',DATE '2026-04-01',1,TIMESTAMP '2025-04-02 11:00:00')
INTO patient_insurance VALUES (17,17,'Public','KFH-PUB-017',DATE '2025-05-01',DATE '2026-05-01',1,TIMESTAMP '2025-05-02 12:00:00')
INTO patient_insurance VALUES (18,18,'Private','KFH-PRI-018',DATE '2025-06-01',DATE '2026-06-01',0,NULL)
INTO patient_insurance VALUES (19,19,'Public','KFH-PUB-019',DATE '2025-07-01',DATE '2026-07-01',1,TIMESTAMP '2025-07-02 13:00:00')
INTO patient_insurance VALUES (20,20,'Private','KFH-PRI-020',DATE '2025-08-01',DATE '2026-08-01',1,TIMESTAMP '2025-08-02 14:00:00')
SELECT * FROM dual;

INSERT ALL
INTO next_of_kin VALUES (1,1,'Alice Mukasa','Wife','0788122227',1)
INTO next_of_kin VALUES (2,2,'Jean Uwase','Husband','0788761113',1)
INTO next_of_kin VALUES (3,3,'Claire Niyonsaba','Sister','0788344445',1)
INTO next_of_kin VALUES (4,4,'Eric Umutesi','Brother','0788123334',1)
INTO next_of_kin VALUES (5,5,'Beatrice Habimana','Wife','0788239998',1)
INTO next_of_kin VALUES (6,6,'Paul Munyaneza','Husband','0788845125',1)
INTO next_of_kin VALUES (7,7,'Nicole Nkurunziza','Wife','0788590125',1)
INTO next_of_kin VALUES (8,8,'Jeanine Ishimwe','Husband','0788456791',1)
INTO next_of_kin VALUES (9,9,'Marie Rusesabagina','Wife','0788341236',1)
INTO next_of_kin VALUES (10,10,'David Mukantabana','Husband','0788587656',1)
INTO next_of_kin VALUES (11,11,'Claire Nyirahabimana','Sister','0788231100',1)
INTO next_of_kin VALUES (12,12,'Patrice Uwimana','Brother','0788304569',1)
INTO next_of_kin VALUES (13,13,'Jeanette Mukanwankiza','Sister','0788125680',1)
INTO next_of_kin VALUES (14,14,'Ange Ndoli','Wife','0788467892',1)
INTO next_of_kin VALUES (15,15,'Ruth Imani','Mother','0788812346',1)
INTO next_of_kin VALUES (16,16,'James Kamanzi','Brother','0788923457',1)
INTO next_of_kin VALUES (17,17,'Claire Bizimana','Mother','0788034568',1)
INTO next_of_kin VALUES (18,18,'Anna Ngabo','Sister','0788145679',1)
INTO next_of_kin VALUES (19,19,'Jean Kagabo','Father','0788256790',1)
INTO next_of_kin VALUES (20,20,'Odette Uwera','Mother','0788367891',1)
SELECT * FROM dual;

INSERT ALL
INTO addresses VALUES (1,1,'Nyarugenge','Kiyovu','Rwanda')
INTO addresses VALUES (2,2,'Gasabo','Kimironko','Rwanda')
INTO addresses VALUES (3,3,'Kicukiro','Gatenga','Rwanda')
INTO addresses VALUES (4,4,'Muhanga','Gitarama','Rwanda')
INTO addresses VALUES (5,5,'Huye','Ngoma','Rwanda')
INTO addresses VALUES (6,6,'Musanze','Kinigi','Rwanda')
INTO addresses VALUES (7,7,'Rusizi','Bugarama','Rwanda')
INTO addresses VALUES (8,8,'Rwamagana','Muhazi','Rwanda')
INTO addresses VALUES (9,9,'Bugesera','Nyamata','Rwanda')
INTO addresses VALUES (10,10,'Ruhango','Kinazi','Rwanda')
INTO addresses VALUES (11,11,'Gatsibo','Kabarore','Rwanda')
INTO addresses VALUES (12,12,'Nyagatare','Rukomo','Rwanda')
INTO addresses VALUES (13,13,'Karongi','Bwishyura','Rwanda')
INTO addresses VALUES (14,14,'Ngoma','Murama','Rwanda')
INTO addresses VALUES (15,15,'Kayonza','Gahini','Rwanda')
INTO addresses VALUES (16,16,'Rulindo','Base','Rwanda')
INTO addresses VALUES (17,17,'Rubavu','Nyundo','Rwanda')
INTO addresses VALUES (18,18,'Rubavu','Gisenyi','Rwanda')
INTO addresses VALUES (19,19,'Nyamagabe','Butare','Rwanda')
INTO addresses VALUES (20,20,'Kirehe','Kigina','Rwanda')
SELECT * FROM dual;

INSERT ALL
INTO visits VALUES (1,1,'Inpatient',1,2,TIMESTAMP '2024-01-10 09:30:00',TIMESTAMP '2024-01-15 10:00:00',1,'Private','QT-001')
INTO visits VALUES (2,2,'Outpatient',3,4,TIMESTAMP '2024-02-08 14:00:00',NULL,NULL,'QT-002')
INTO visits VALUES (3,3,'Emergency',7,1,TIMESTAMP '2024-03-02 02:20:00',TIMESTAMP '2024-03-04 11:00:00',2,'General','QT-003')
INTO visits VALUES (4,4,'Inpatient',8,3,TIMESTAMP '2024-03-20 16:10:00',TIMESTAMP '2024-03-25 09:45:00',3,'Deluxe','QT-004')
INTO visits VALUES (5,5,'Outpatient',5,5,TIMESTAMP '2024-04-05 10:40:00',NULL,NULL,'QT-005')
INTO visits VALUES (6,6,'Inpatient',2,2,TIMESTAMP '2024-04-12 08:15:00',TIMESTAMP '2024-04-18 12:30:00',4,'Standard','QT-006')
INTO visits VALUES (7,7,'Emergency',7,1,TIMESTAMP '2024-05-01 23:55:00',TIMESTAMP '2024-05-02 07:20:00',5,'General','QT-007')
INTO visits VALUES (8,8,'Outpatient',11,4,TIMESTAMP '2024-05-10 13:20:00',NULL,NULL,'QT-008')
INTO visits VALUES (9,9,'Outpatient',4,3,TIMESTAMP '2024-05-18 07:20:00',NULL,NULL,'QT-009')
INTO visits VALUES (10,10,'Inpatient',1,2,TIMESTAMP '2024-06-02 10:20:00',TIMESTAMP '2024-06-09 10:00:00',6,'Private','QT-010')
INTO visits VALUES (11,11,'Outpatient',6,3,TIMESTAMP '2024-06-12 08:45:00',NULL,NULL,'QT-011')
INTO visits VALUES (12,12,'Inpatient',2,4,TIMESTAMP '2024-06-20 09:30:00',TIMESTAMP '2024-06-22 15:00:00',7,'Standard','QT-012')
INTO visits VALUES (13,13,'Outpatient',5,5,TIMESTAMP '2024-07-02 11:10:00',NULL,NULL,'QT-013')
INTO visits VALUES (14,14,'Outpatient',8,4,TIMESTAMP '2024-07-15 14:50:00',NULL,NULL,'QT-014')
INTO visits VALUES (15,15,'Inpatient',9,2,TIMESTAMP '2024-08-01 10:00:00',TIMESTAMP '2024-08-06 08:30:00',8,'Deluxe','QT-015')
INTO visits VALUES (16,16,'Outpatient',3,4,TIMESTAMP '2024-08-19 09:00:00',NULL,NULL,'QT-016')
INTO visits VALUES (17,17,'Inpatient',7,1,TIMESTAMP '2024-09-05 07:30:00',TIMESTAMP '2024-09-10 09:45:00',9,'General','QT-017')
INTO visits VALUES (18,18,'Outpatient',5,3,TIMESTAMP '2024-09-20 16:10:00',NULL,NULL,'QT-018')
INTO visits VALUES (19,19,'Outpatient',4,5,TIMESTAMP '2024-10-03 12:25:00',NULL,NULL,'QT-019')
INTO visits VALUES (20,20,'Inpatient',2,2,TIMESTAMP '2024-10-15 11:45:00',TIMESTAMP '2024-10-18 14:10:00',10,'Standard','QT-020')
SELECT * FROM dual;

INSERT ALL
INTO referrals VALUES (1,1,'Gihundwe Health Center','Rwanda','Specialist cardiology referral','High',DATE '2024-01-09',TIMESTAMP '2024-01-09 15:00:00')
INTO referrals VALUES (2,2,'Muhima Health Center','Rwanda','Pediatric immunization review','Medium',DATE '2024-02-07',TIMESTAMP '2024-02-07 10:30:00')
INTO referrals VALUES (3,3,'Kacyiru Health Center','Rwanda','Surgical assessment','High',DATE '2024-03-01',TIMESTAMP '2024-03-01 11:20:00')
INTO referrals VALUES (4,4,'Nyamirambo Health Post','Rwanda','Obstetric evaluation','High',DATE '2024-03-19',TIMESTAMP '2024-03-19 09:50:00')
INTO referrals VALUES (5,5,'Remera Health Center','Rwanda','Asthma medication review','Low',DATE '2024-04-04',TIMESTAMP '2024-04-04 14:10:00')
INTO referrals VALUES (6,6,'Kanombe Clinic','Rwanda','Postoperative physiotherapy','Medium',DATE '2024-04-11',TIMESTAMP '2024-04-11 13:45:00')
INTO referrals VALUES (7,7,'Gitwe Hospital','Rwanda','Emergency general surgery triage','High',DATE '2024-04-30',TIMESTAMP '2024-04-30 20:30:00')
INTO referrals VALUES (8,8,'Kibungo Health Center','Rwanda','Ophthalmology review','Low',DATE '2024-05-09',TIMESTAMP '2024-05-09 08:20:00')
INTO referrals VALUES (9,9,'Musanze Clinic','Rwanda','Orthopedic fracture follow-up','Medium',DATE '2024-05-17',TIMESTAMP '2024-05-17 12:00:00')
INTO referrals VALUES (10,10,'Gisenyi Health Center','Rwanda','Diabetes education','Low',DATE '2024-05-31',TIMESTAMP '2024-05-31 09:00:00')
INTO referrals VALUES (11,11,'Rusizi Clinic','Rwanda','Dermatology evaluation','Low',DATE '2024-06-11',TIMESTAMP '2024-06-11 10:30:00')
INTO referrals VALUES (12,12,'Nyagatare Clinic','Rwanda','Nephrology review','High',DATE '2024-06-19',TIMESTAMP '2024-06-19 14:20:00')
INTO referrals VALUES (13,13,'Mageragere Health Center','Rwanda','ENT assessment','Medium',DATE '2024-06-30',TIMESTAMP '2024-06-30 11:15:00')
INTO referrals VALUES (14,14,'Rubavu Clinic','Rwanda','Cardiology follow-up','Medium',DATE '2024-07-14',TIMESTAMP '2024-07-14 16:05:00')
INTO referrals VALUES (15,15,'Kibagabaga Hospital','Rwanda','Gastroenterology review','Medium',DATE '2024-07-31',TIMESTAMP '2024-07-31 09:45:00')
INTO referrals VALUES (16,16,'Nyanza Hospital','Rwanda','Maternity counseling','Low',DATE '2024-08-18',TIMESTAMP '2024-08-18 15:30:00')
INTO referrals VALUES (17,17,'Karongi Clinic','Rwanda','Renal care referral','High',DATE '2024-09-04',TIMESTAMP '2024-09-04 08:40:00')
INTO referrals VALUES (18,18,'Mageragere Health Center','Rwanda','Radiology opinion','Medium',DATE '2024-09-19',TIMESTAMP '2024-09-19 13:00:00')
INTO referrals VALUES (19,19,'Kabarondo Hospital','Rwanda','Dermatology follow-up','Low',DATE '2024-10-02',TIMESTAMP '2024-10-02 10:20:00')
INTO referrals VALUES (20,20,'Huye Hospital','Rwanda','Nutrition referral','Low',DATE '2024-10-14',TIMESTAMP '2024-10-14 14:10:00')
SELECT * FROM dual;

INSERT ALL
INTO encounters VALUES (1,1,1,TIMESTAMP '2024-01-10 10:15:00','Consultation','Admitted for hypertension management and observation.',1)
INTO encounters VALUES (2,2,5,TIMESTAMP '2024-02-08 14:30:00','Consultation','Routine pediatric review and vaccination update.',1)
INTO encounters VALUES (3,3,6,TIMESTAMP '2024-03-02 02:45:00','Consultation','Acute abdominal pain, admitted for assessment.',1)
INTO encounters VALUES (4,4,18,TIMESTAMP '2024-03-20 16:40:00','Consultation','Obstetric admission for suspected pre-eclampsia.',1)
INTO encounters VALUES (5,5,4,TIMESTAMP '2024-04-05 10:55:00','Follow-up','Asthma medication review and inhaler education.',1)
INTO encounters VALUES (6,6,2,TIMESTAMP '2024-04-12 11:15:00','Consultation','Post-surgical wound check and physiotherapy plan.',1)
INTO encounters VALUES (7,7,7,TIMESTAMP '2024-05-01 00:30:00','Emergency','Trauma admission after abdominal injury.',1)
INTO encounters VALUES (8,8,16,TIMESTAMP '2024-05-10 14:10:00','Consultation','Eye exam for cataract symptoms.',1)
INTO encounters VALUES (9,9,4,TIMESTAMP '2024-05-18 07:50:00','Consultation','Orthopedic review after fracture stabilization.',1)
INTO encounters VALUES (10,10,15,TIMESTAMP '2024-06-02 10:10:00','Consultation','Chronic disease medication refill and review.',1)
INTO encounters VALUES (11,11,1,TIMESTAMP '2024-06-12 09:00:00','Consultation','Renal function follow-up with lab review.',1)
INTO encounters VALUES (12,12,8,TIMESTAMP '2024-06-20 09:45:00','Consultation','Gastroenterology follow-up for abdominal pain.',1)
INTO encounters VALUES (13,13,7,TIMESTAMP '2024-07-02 11:40:00','Consultation','ENT evaluation for persistent sinus symptoms.',1)
INTO encounters VALUES (14,14,18,TIMESTAMP '2024-07-15 15:10:00','Consultation','Cardiology follow-up after chest pain.',1)
INTO encounters VALUES (15,15,9,TIMESTAMP '2024-08-01 10:35:00','Consultation','Preoperative surgical assessment.',1)
INTO encounters VALUES (16,16,2,TIMESTAMP '2024-08-19 09:20:00','Consultation','Maternity counseling and birth planning.',1)
INTO encounters VALUES (17,17,7,TIMESTAMP '2024-09-05 08:05:00','Consultation','Chronic kidney disease checkup and medication review.',1)
INTO encounters VALUES (18,18,4,TIMESTAMP '2024-09-20 16:55:00','Consultation','Radiology prep and review for imaging.',1)
INTO encounters VALUES (19,19,5,TIMESTAMP '2024-10-03 12:40:00','Consultation','Dermatology follow-up after rash treatment.',1)
INTO encounters VALUES (20,20,8,TIMESTAMP '2024-10-15 12:00:00','Consultation','Nutrition counseling and weight management.',1)
SELECT * FROM dual;

INSERT ALL
INTO diagnoses VALUES (1,1,'I10','Essential hypertension','1',DATE '2024-01-10')
INTO diagnoses VALUES (2,2,'Z23','Encounter for immunization','1',DATE '2024-02-08')
INTO diagnoses VALUES (3,3,'K35','Acute appendicitis','1',DATE '2024-03-02')
INTO diagnoses VALUES (4,4,'O14.9','Preeclampsia, unspecified','1',DATE '2024-03-20')
INTO diagnoses VALUES (5,5,'J45.9','Asthma, unspecified','1',DATE '2024-04-05')
INTO diagnoses VALUES (6,6,'Z48.3','Attention to surgical wound','1',DATE '2024-04-12')
INTO diagnoses VALUES (7,7,'S39.0','Superficial injury of abdomen','1',DATE '2024-05-01')
INTO diagnoses VALUES (8,8,'H25.9','Age-related cataract, unspecified','1',DATE '2024-05-10')
INTO diagnoses VALUES (9,9,'S52.5','Fracture of lower end of radius','1',DATE '2024-05-18')
INTO diagnoses VALUES (10,10,'E11.9','Type 2 diabetes mellitus','1',DATE '2024-06-02')
INTO diagnoses VALUES (11,11,'N18.3','Chronic kidney disease, stage 3','1',DATE '2024-06-12')
INTO diagnoses VALUES (12,12,'K21.9','Gastro-esophageal reflux disease','1',DATE '2024-06-20')
INTO diagnoses VALUES (13,13,'J32.9','Chronic sinusitis, unspecified','1',DATE '2024-07-02')
INTO diagnoses VALUES (14,14,'I20.9','Angina pectoris, unspecified','1',DATE '2024-07-15')
INTO diagnoses VALUES (15,15,'Z01.81','Preoperative cardiovascular examination','1',DATE '2024-08-01')
INTO diagnoses VALUES (16,16,'Z32.01','Pregnancy test, result positive','1',DATE '2024-08-19')
INTO diagnoses VALUES (17,17,'N18.4','Chronic kidney disease, stage 4','1',DATE '2024-09-05')
INTO diagnoses VALUES (18,18,'R93.5','Abnormal findings on diagnostic imaging','1',DATE '2024-09-20')
INTO diagnoses VALUES (19,19,'L40.0','Psoriasis vulgaris','1',DATE '2024-10-03')
INTO diagnoses VALUES (20,20,'Z71.3','Dietary counseling and surveillance','1',DATE '2024-10-15')
SELECT * FROM dual;

INSERT ALL
INTO medications VALUES (1,'Paracetamol','Panadol','Tablet','500','mg','RX001')
INTO medications VALUES (2,'Ibuprofen','Brufen','Tablet','200','mg','RX002')
INTO medications VALUES (3,'Amoxicillin','Augmentin','Capsule','500','mg','RX003')
INTO medications VALUES (4,'Ceftriaxone','Rocephin','Injection','1','g','RX004')
INTO medications VALUES (5,'Salbutamol','Ventolin','Syrup','2','mg/5ml','RX005')
INTO medications VALUES (6,'Metformin','Glucophage','Tablet','500','mg','RX006')
INTO medications VALUES (7,'Amlodipine','Norvasc','Tablet','5','mg','RX007')
INTO medications VALUES (8,'Hydrochlorothiazide','Esidrex','Tablet','25','mg','RX008')
INTO medications VALUES (9,'Omeprazole','Losec','Capsule','20','mg','RX009')
INTO medications VALUES (10,'Cetirizine','Zyrtec','Tablet','10','mg','RX010')
INTO medications VALUES (11,'Azithromycin','Zithromax','Tablet','250','mg','RX011')
INTO medications VALUES (12,'Prednisone','Deltasone','Tablet','10','mg','RX012')
INTO medications VALUES (13,'Furosemide','Lasix','Tablet','40','mg','RX013')
INTO medications VALUES (14,'Warfarin','Coumadin','Tablet','5','mg','RX014')
INTO medications VALUES (15,'Insulin glargine','Lantus','Injection','100','IU/mL','RX015')
INTO medications VALUES (16,'Paracetamol','Dolo 650','Tablet','650','mg','RX016')
INTO medications VALUES (17,'Meloxicam','Mobic','Tablet','15','mg','RX017')
INTO medications VALUES (18,'Ciprofloxacin','Cipro','Tablet','500','mg','RX018')
INTO medications VALUES (19,'Ondansetron','Zofran','Tablet','8','mg','RX019')
INTO medications VALUES (20,'Lisinopril','Prinivil','Tablet','10','mg','RX020')
SELECT * FROM dual;

INSERT ALL
INTO prescriptions VALUES (1,1,7,'5 mg','Once daily',30,1,1,1)
INTO prescriptions VALUES (2,2,2,'200 mg','Three times daily',5,5,1,1)
INTO prescriptions VALUES (3,3,1,'650 mg','Every 6 hours',5,1,1,1)
INTO prescriptions VALUES (4,4,9,'20 mg','Once daily',14,18,1,1)
INTO prescriptions VALUES (5,5,5,'2 mg/5ml','Two teaspoons every 8 hours',7,4,1,1)
INTO prescriptions VALUES (6,6,3,'500 mg','Three times daily',7,7,1,1)
INTO prescriptions VALUES (7,7,17,'15 mg','Once daily',10,6,1,1)
INTO prescriptions VALUES (8,8,10,'10 mg','Once daily',1,16,1,1)
INTO prescriptions VALUES (9,9,4,'1 g','Once daily',3,13,1,1)
INTO prescriptions VALUES (10,10,15,'20 IU','Once at bedtime',30,9,1,1)
INTO prescriptions VALUES (11,11,6,'500 mg','Twice daily',30,1,1,1)
INTO prescriptions VALUES (12,12,12,'10 mg','Once daily',7,8,1,1)
INTO prescriptions VALUES (13,13,11,'500 mg','Once daily',5,3,1,1)
INTO prescriptions VALUES (14,14,7,'5 mg','Once daily',30,18,1,1)
INTO prescriptions VALUES (15,15,13,'40 mg','Once daily',14,9,1,1)
INTO prescriptions VALUES (16,16,2,'200 mg','Every 8 hours',10,4,1,1)
INTO prescriptions VALUES (17,17,1,'500 mg','Every 6 hours',5,7,1,1)
INTO prescriptions VALUES (18,18,18,'500 mg','Twice daily',7,3,1,1)
INTO prescriptions VALUES (19,19,10,'10 mg','Once daily',14,11,1,1)
INTO prescriptions VALUES (20,20,20,'10 mg','Once daily',30,14,1,1)
SELECT * FROM dual;

INSERT ALL
INTO drug_stock VALUES (1,1,'Main Pharmacy',320,50,DATE '2026-03-01','BATCH-KFH-01')
INTO drug_stock VALUES (2,2,'Main Pharmacy',210,40,DATE '2026-04-15','BATCH-KFH-02')
INTO drug_stock VALUES (3,3,'Main Pharmacy',180,30,DATE '2026-05-20','BATCH-KFH-03')
INTO drug_stock VALUES (4,4,'Emergency Pharmacy',120,20,DATE '2026-01-30','BATCH-KFH-04')
INTO drug_stock VALUES (5,5,'Pediatric Pharmacy',60,15,DATE '2026-02-28','BATCH-KFH-05')
INTO drug_stock VALUES (6,6,'Main Pharmacy',140,35,DATE '2026-06-10','BATCH-KFH-06')
INTO drug_stock VALUES (7,7,'Main Pharmacy',100,25,DATE '2026-07-15','BATCH-KFH-07')
INTO drug_stock VALUES (8,8,'Main Pharmacy',90,20,DATE '2026-08-20','BATCH-KFH-08')
INTO drug_stock VALUES (9,9,'Main Pharmacy',110,25,DATE '2026-09-12','BATCH-KFH-09')
INTO drug_stock VALUES (10,10,'Main Pharmacy',150,30,DATE '2026-10-25','BATCH-KFH-10')
INTO drug_stock VALUES (11,11,'Main Pharmacy',80,15,DATE '2026-11-15','BATCH-KFH-11')
INTO drug_stock VALUES (12,12,'Main Pharmacy',95,20,DATE '2026-12-20','BATCH-KFH-12')
INTO drug_stock VALUES (13,13,'Main Pharmacy',70,15,DATE '2027-01-10','BATCH-KFH-13')
INTO drug_stock VALUES (14,14,'Main Pharmacy',55,12,DATE '2027-02-15','BATCH-KFH-14')
INTO drug_stock VALUES (15,15,'Main Pharmacy',120,25,DATE '2027-03-18','BATCH-KFH-15')
INTO drug_stock VALUES (16,16,'Main Pharmacy',105,20,DATE '2027-04-22','BATCH-KFH-16')
INTO drug_stock VALUES (17,17,'Main Pharmacy',85,18,DATE '2027-05-30','BATCH-KFH-17')
INTO drug_stock VALUES (18,18,'Main Pharmacy',75,14,DATE '2027-06-10','BATCH-KFH-18')
INTO drug_stock VALUES (19,19,'Main Pharmacy',95,22,DATE '2027-07-25','BATCH-KFH-19')
INTO drug_stock VALUES (20,20,'Main Pharmacy',140,28,DATE '2027-08-30','BATCH-KFH-20')
SELECT * FROM dual;

INSERT ALL
INTO dispensing VALUES (1,1,4,TIMESTAMP '2024-01-10 12:15:00',30,'Main Pharmacy','MOMO-001')
INTO dispensing VALUES (2,2,11,TIMESTAMP '2024-02-08 15:30:00',15,'Main Pharmacy','MOMO-002')
INTO dispensing VALUES (3,3,3,TIMESTAMP '2024-03-02 04:45:00',25,'Emergency Pharmacy','MOMO-003')
INTO dispensing VALUES (4,4,11,TIMESTAMP '2024-03-20 18:30:00',14,'Pharmacy B','MOMO-004')
INTO dispensing VALUES (5,5,4,TIMESTAMP '2024-04-05 13:15:00',21,'Pharmacy A','MOMO-005')
INTO dispensing VALUES (6,6,4,TIMESTAMP '2024-04-12 11:40:00',21,'Main Pharmacy','MOMO-006')
INTO dispensing VALUES (7,7,11,TIMESTAMP '2024-05-01 03:40:00',10,'Emergency Pharmacy','MOMO-007')
INTO dispensing VALUES (8,8,11,TIMESTAMP '2024-05-10 17:10:00',1,'Pharmacy B','MOMO-008')
INTO dispensing VALUES (9,9,4,TIMESTAMP '2024-05-18 10:15:00',3,'Main Pharmacy','MOMO-009')
INTO dispensing VALUES (10,10,11,TIMESTAMP '2024-06-02 11:45:00',7,'Main Pharmacy','MOMO-010')
INTO dispensing VALUES (11,11,3,TIMESTAMP '2024-06-12 10:20:00',30,'Pharmacy A','MOMO-011')
INTO dispensing VALUES (12,12,4,TIMESTAMP '2024-06-20 12:15:00',5,'Main Pharmacy','MOMO-012')
INTO dispensing VALUES (13,13,11,TIMESTAMP '2024-07-02 12:55:00',2,'Emergency Pharmacy','MOMO-013')
INTO dispensing VALUES (14,14,4,TIMESTAMP '2024-07-15 16:45:00',10,'Pharmacy B','MOMO-014')
INTO dispensing VALUES (15,15,9,TIMESTAMP '2024-08-01 11:10:00',4,'Main Pharmacy','MOMO-015')
INTO dispensing VALUES (16,16,4,TIMESTAMP '2024-08-19 09:40:00',8,'Main Pharmacy','MOMO-016')
INTO dispensing VALUES (17,17,7,TIMESTAMP '2024-09-05 08:30:00',12,'Pharmacy A','MOMO-017')
INTO dispensing VALUES (18,18,3,TIMESTAMP '2024-09-20 17:20:00',6,'Pharmacy B','MOMO-018')
INTO dispensing VALUES (19,19,11,TIMESTAMP '2024-10-03 13:40:00',3,'Main Pharmacy','MOMO-019')
INTO dispensing VALUES (20,20,4,TIMESTAMP '2024-10-15 14:30:00',9,'Main Pharmacy','MOMO-020')
SELECT * FROM dual;

-- Explicit lab configuration and orders
INSERT ALL
INTO lab_tests VALUES (1,'Complete Blood Count','Hematology','Blood','2339-0',24,1)
INTO lab_tests VALUES (2,'Malaria Rapid Test','Microbiology','Blood','5792-7',2,1)
INTO lab_tests VALUES (3,'Blood Glucose','Chemistry','Blood','2339-0',4,1)
INTO lab_tests VALUES (4,'Renal Function','Chemistry','Blood','24312-7',24,1)
INTO lab_tests VALUES (5,'Liver Function','Chemistry','Blood','24325-4',24,1)
INTO lab_tests VALUES (6,'Urinalysis','Chemistry','Urine','25202-9',6,1)
INTO lab_tests VALUES (7,'HIV Antibody','Microbiology','Blood','62481-2',48,1)
INTO lab_tests VALUES (8,'Hemoglobin A1c','Chemistry','Blood','4548-4',24,1)
INTO lab_tests VALUES (9,'Pregnancy Test','Microbiology','Urine','29308-4',2,1)
INTO lab_tests VALUES (10,'Blood Group','Immunology','Blood','58410-2',12,1)
INTO lab_tests VALUES (11,'Sputum Microscopy','Microbiology','Sputum','44903-2',24,1)
INTO lab_tests VALUES (12,'Thyroid Panel','Chemistry','Blood','24353-1',24,1)
INTO lab_tests VALUES (13,'Lipid Profile','Chemistry','Blood','24331-1',24,1)
INTO lab_tests VALUES (14,'Cardiac Troponin','Chemistry','Blood','65939-4',24,1)
INTO lab_tests VALUES (15,'D-dimer','Coagulation','Blood','48065-7',24,1)
INTO lab_tests VALUES (16,'Creatinine','Chemistry','Blood','2160-0',24,1)
INTO lab_tests VALUES (17,'Electrolytes','Chemistry','Blood','24320-4',24,1)
INTO lab_tests VALUES (18,'CRP','Chemistry','Blood','1988-5',24,1)
INTO lab_tests VALUES (19,'ESR','Hematology','Blood','4537-7',24,1)
INTO lab_tests VALUES (20,'Gamma GT','Chemistry','Blood','2336-6',24,1)
SELECT * FROM dual;

INSERT ALL
INTO lab_orders VALUES (1,1,2,1,TIMESTAMP '2024-01-10 10:30:00','High','Completed')
INTO lab_orders VALUES (2,2,5,2,TIMESTAMP '2024-02-08 14:35:00','Medium','Completed')
INTO lab_orders VALUES (3,3,6,3,TIMESTAMP '2024-03-02 03:00:00','High','Completed')
INTO lab_orders VALUES (4,4,18,9,TIMESTAMP '2024-03-20 17:00:00','High','Completed')
INTO lab_orders VALUES (5,5,4,5,TIMESTAMP '2024-04-05 11:10:00','Low','Completed')
INTO lab_orders VALUES (6,6,2,1,TIMESTAMP '2024-04-12 09:20:00','Medium','Completed')
INTO lab_orders VALUES (7,7,6,11,TIMESTAMP '2024-05-01 00:45:00','High','Completed')
INTO lab_orders VALUES (8,8,16,12,TIMESTAMP '2024-05-10 14:00:00','Medium','Completed')
INTO lab_orders VALUES (9,9,13,4,TIMESTAMP '2024-05-18 07:25:00','High','Completed')
INTO lab_orders VALUES (10,10,9,1,TIMESTAMP '2024-06-02 10:05:00','Low','Completed')
INTO lab_orders VALUES (11,11,11,3,TIMESTAMP '2024-06-12 09:10:00','High','Completed')
INTO lab_orders VALUES (12,12,20,6,TIMESTAMP '2024-06-20 10:00:00','Medium','Completed')
INTO lab_orders VALUES (13,13,1,8,TIMESTAMP '2024-07-02 11:50:00','Low','Completed')
INTO lab_orders VALUES (14,14,14,10,TIMESTAMP '2024-07-15 15:30:00','Medium','Completed')
INTO lab_orders VALUES (15,15,5,13,TIMESTAMP '2024-08-01 10:15:00','High','Completed')
INTO lab_orders VALUES (16,16,12,2,TIMESTAMP '2024-08-19 09:30:00','Low','Completed')
INTO lab_orders VALUES (17,17,7,7,TIMESTAMP '2024-09-05 08:15:00','Medium','Completed')
INTO lab_orders VALUES (18,18,15,18,TIMESTAMP '2024-09-20 16:50:00','High','Completed')
INTO lab_orders VALUES (19,19,10,19,TIMESTAMP '2024-10-03 12:35:00','Low','Completed')
INTO lab_orders VALUES (20,20,3,20,TIMESTAMP '2024-10-15 12:15:00','Medium','Completed')
SELECT * FROM dual;

INSERT ALL
INTO specimens VALUES (1,1,2,TIMESTAMP '2024-01-10 10:40:00','SPC-KFH-001',1,'Collected')
INTO specimens VALUES (2,2,11,TIMESTAMP '2024-02-08 14:45:00','SPC-KFH-002',2,'Collected')
INTO specimens VALUES (3,3,3,TIMESTAMP '2024-03-02 03:10:00','SPC-KFH-003',1,'Collected')
INTO specimens VALUES (4,4,11,TIMESTAMP '2024-03-20 17:10:00','SPC-KFH-004',2,'Collected')
INTO specimens VALUES (5,5,4,TIMESTAMP '2024-04-05 11:20:00','SPC-KFH-005',1,'Collected')
INTO specimens VALUES (6,6,2,TIMESTAMP '2024-04-12 09:30:00','SPC-KFH-006',2,'Collected')
INTO specimens VALUES (7,7,3,TIMESTAMP '2024-05-01 00:55:00','SPC-KFH-007',1,'Processing')
INTO specimens VALUES (8,8,8,TIMESTAMP '2024-05-10 14:10:00','SPC-KFH-008',2,'Collected')
INTO specimens VALUES (9,9,13,TIMESTAMP '2024-05-18 07:35:00','SPC-KFH-009',1,'Collected')
INTO specimens VALUES (10,10,4,TIMESTAMP '2024-06-02 10:10:00','SPC-KFH-010',2,'Collected')
INTO specimens VALUES (11,11,11,TIMESTAMP '2024-06-12 09:20:00','SPC-KFH-011',1,'Collected')
INTO specimens VALUES (12,12,20,TIMESTAMP '2024-06-20 10:10:00','SPC-KFH-012',2,'Collected')
INTO specimens VALUES (13,13,1,TIMESTAMP '2024-07-02 11:55:00','SPC-KFH-013',1,'Collected')
INTO specimens VALUES (14,14,14,TIMESTAMP '2024-07-15 15:40:00','SPC-KFH-014',2,'Collected')
INTO specimens VALUES (15,15,5,TIMESTAMP '2024-08-01 10:20:00','SPC-KFH-015',1,'Collected')
INTO specimens VALUES (16,16,12,TIMESTAMP '2024-08-19 09:40:00','SPC-KFH-016',2,'Collected')
INTO specimens VALUES (17,17,7,TIMESTAMP '2024-09-05 08:25:00','SPC-KFH-017',1,'Collected')
INTO specimens VALUES (18,18,15,TIMESTAMP '2024-09-20 16:55:00','SPC-KFH-018',2,'Collected')
INTO specimens VALUES (19,19,10,TIMESTAMP '2024-10-03 12:40:00','SPC-KFH-019',1,'Collected')
INTO specimens VALUES (20,20,3,TIMESTAMP '2024-10-15 12:20:00','SPC-KFH-020',2,'Collected')
SELECT * FROM dual;

INSERT ALL
INTO lab_results VALUES (1,1,'Hemoglobin','13.2','g/dL','12.0-16.0','Normal',1,TIMESTAMP '2024-01-10 12:00:00')
INTO lab_results VALUES (2,1,'WBC','8.5','x10^9/L','4.0-11.0','Normal',1,TIMESTAMP '2024-01-10 12:00:00')
INTO lab_results VALUES (3,1,'Platelets','280','x10^9/L','150-450','Normal',1,TIMESTAMP '2024-01-10 12:00:00')
INTO lab_results VALUES (4,2,'Malaria Parasite','Negative','','','Normal',1,TIMESTAMP '2024-02-08 15:10:00')
INTO lab_results VALUES (5,2,'Hemoglobin','11.1','g/dL','11.0-16.0','Normal',1,TIMESTAMP '2024-02-08 15:10:00')
INTO lab_results VALUES (6,3,'Blood Glucose','7.6','mmol/L','4.0-6.0','High',1,TIMESTAMP '2024-03-02 04:30:00')
INTO lab_results VALUES (7,3,'Creatinine','1.0','mg/dL','0.6-1.2','Normal',1,TIMESTAMP '2024-03-02 04:30:00')
INTO lab_results VALUES (8,4,'ALT','45','U/L','7-56','Normal',1,TIMESTAMP '2024-03-20 18:00:00')
INTO lab_results VALUES (9,5,'Peak Flow','320','L/min','300-450','Normal',1,TIMESTAMP '2024-04-05 12:00:00')
INTO lab_results VALUES (10,6,'Wound Culture','No growth','','','Normal',1,TIMESTAMP '2024-04-12 12:30:00')
INTO lab_results VALUES (11,7,'HIV Ab','Negative','','','Normal',1,TIMESTAMP '2024-05-01 01:20:00')
INTO lab_results VALUES (12,8,'Visual Acuity','6/12','','','Normal',1,TIMESTAMP '2024-05-10 15:20:00')
INTO lab_results VALUES (13,9,'X-ray Review','No acute fracture','','','Normal',1,TIMESTAMP '2024-05-18 08:00:00')
INTO lab_results VALUES (14,10,'HbA1c','6.9','%','<7.0','Borderline',1,TIMESTAMP '2024-06-02 11:00:00')
INTO lab_results VALUES (15,11,'Creatinine','1.8','mg/dL','0.6-1.2','High',1,TIMESTAMP '2024-06-12 10:50:00')
INTO lab_results VALUES (16,12,'pH','6.0','','','Normal',1,TIMESTAMP '2024-06-20 10:30:00')
INTO lab_results VALUES (17,13,'ESR','18','mm/hr','0-20','Normal',1,TIMESTAMP '2024-07-02 12:10:00')
INTO lab_results VALUES (18,14,'Troponin','0.02','ng/mL','0.00-0.04','Normal',1,TIMESTAMP '2024-07-15 16:20:00')
INTO lab_results VALUES (19,15,'Liver Enzyme','78','U/L','7-56','High',1,TIMESTAMP '2024-08-01 10:30:00')
INTO lab_results VALUES (20,16,'HCG','Positive','','','Normal',1,TIMESTAMP '2024-08-19 09:50:00')
SELECT * FROM dual;

-- Use PL/SQL loops for remaining tables to generate 20 rows each with coherent FK values.
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO departments (dept_id,name,category,head_staff_id)
    VALUES (i,'Department '||i,CASE WHEN MOD(i,3)=0 THEN 'Support' ELSE 'Clinical' END,NULL);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO wards (ward_id,dept_id,name,floor,capacity,type)
    VALUES (i,MOD(i-1,10)+1,'Ward '||i,MOD(i-1,5)+1,20,CASE WHEN MOD(i,2)=0 THEN 'General' ELSE 'Private' END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO beds (bed_id,ward_id,bed_number,room_type,status)
    VALUES (i,MOD(i-1,20)+1,'B'||LPAD(i,3,'0'),CASE WHEN MOD(i,4)=0 THEN 'ICU' ELSE 'Regular' END,CASE WHEN MOD(i,3)=0 THEN 'Occupied' ELSE 'Available' END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO staff (staff_id,first_name,last_name,role,dept_id,license_number,nationality,hire_date)
    VALUES (i,'StaffFirst'||i,'StaffLast'||i,CASE WHEN MOD(i,4)=0 THEN 'Technician' WHEN MOD(i,3)=0 THEN 'Pharmacist' WHEN MOD(i,2)=0 THEN 'Nurse' ELSE 'Doctor' END,MOD(i-1,20)+1,'LIC-'||LPAD(i,4,'0'),'Rwandan',TO_DATE('2015-01-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO operation_theaters (ot_id,name,dept_id,status,floor,type)
    VALUES (i,'OT-'||i,MOD(i-1,5)+1,CASE WHEN MOD(i,2)=0 THEN 'Operational' ELSE 'Standby' END,MOD(i-1,3)+1,CASE WHEN MOD(i,2)=0 THEN 'Cardiac' ELSE 'General' END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO staff_schedule (sched_id,staff_id,shift_date,shift_type,dept_id)
    VALUES (i,MOD(i-1,20)+1,TO_DATE('2024-06-'||LPAD(MOD(i-1,28)+1,2,'0'),'YYYY-MM-DD'),CASE WHEN MOD(i,3)=0 THEN 'Night' WHEN MOD(i,3)=1 THEN 'Morning' ELSE 'Evening' END,MOD(i-1,20)+1);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO diagnoses (diag_id,encounter_id,icd10_code,description,is_primary,confirmed_at)
    VALUES (20+i,MOD(i-1,20)+1,'R69','Unknown and unspecified cause of morbidity',TO_DATE('2024-10-'||LPAD(MOD(i-1,28)+1,2,'0'),'YYYY-MM-DD'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO vital_signs (vital_id,encounter_id,bp_systolic,bp_diastolic,pulse,temp_celsius,spo2,weight_kg,height_cm,bmi)
    VALUES (i,MOD(i-1,20)+1,120+MOD(i,25),70+MOD(i,10),70+MOD(i,25),36.5+MOD(i,10)/10,95+MOD(i,5),60+MOD(i,30),150+MOD(i,30),18+MOD(i,12));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO procedures (proc_id,encounter_id,cpt_code,description,performed_by,ot_id,performed_at)
    VALUES (i,MOD(i-1,20)+1,'CPT'||LPAD(i,4,'0'),'Procedure note '||i,MOD(i-1,20)+1,MOD(i-1,20)+1,TO_TIMESTAMP('2024-07-'||LPAD(MOD(i,9)+1,2,'0')||' 09:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO invoices (invoice_id,visit_id,issued_at,total_amount,paid_amount,status,payment_method,generated_automatically)
    VALUES (i,MOD(i-1,20)+1,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,9)+1,2,'0')||' 08:00:00','YYYY-MM-DD HH24:MI:SS'),100+MOD(i,20)*15,50+MOD(i,20)*10,CASE WHEN MOD(i,3)=0 THEN 'Paid' ELSE 'Pending' END,CASE WHEN MOD(i,2)=0 THEN 'Cash' ELSE 'Insurance' END,CASE WHEN MOD(i,4)=0 THEN 1 ELSE 0 END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO invoice_items (item_id,invoice_id,service_type,description,qty,unit_price,discount_percent)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Medication' ELSE 'Service' END,'Item '||i,1,20+MOD(i,5)*5,CASE WHEN MOD(i,4)=0 THEN 10 ELSE 0 END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO insurance_claims (claim_id,invoice_id,scheme,claimed_amount,approved_amount,status,auto_verified,submitted_at)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Public' ELSE 'Private' END,100+MOD(i,20)*10,80+MOD(i,20)*5,CASE WHEN MOD(i,3)=0 THEN 'Approved' ELSE 'Pending' END,CASE WHEN MOD(i,2)=0 THEN 1 ELSE 0 END,TO_DATE('2024-09-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO payments (payment_id,invoice_id,method,amount,paid_at,momo_transaction_ref,received_by)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,3)=0 THEN 'Card' ELSE 'Cash' END,50+MOD(i,20)*5,TO_TIMESTAMP('2024-09-'||LPAD(MOD(i,28)+1,2,'0')||' 13:00:00','YYYY-MM-DD HH24:MI:SS'),'KFH-REF-'||LPAD(i,4,'0'),MOD(i-1,20)+1);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO imaging_machines (machine_id,name,modality,location,last_serviced,resolution,tesla_strength)
    VALUES (i,'Machine '||i,CASE WHEN MOD(i,4)=0 THEN 'MRI' WHEN MOD(i,4)=1 THEN 'CT' WHEN MOD(i,4)=2 THEN 'X-ray' ELSE 'Ultrasound' END,'Radiology',TO_DATE('2024-03-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),'1024x768',CASE WHEN MOD(i,4)=0 THEN 1.5 ELSE 0.0 END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO imaging_orders (img_order_id,encounter_id,modality,body_part,clinical_indication,ordered_by,ordered_at,priority,status)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,3)=0 THEN 'MRI' WHEN MOD(i,3)=1 THEN 'CT' ELSE 'X-ray' END,'Chest','Clinical imaging request',MOD(i-1,20)+1,TO_TIMESTAMP('2024-10-'||LPAD(MOD(i,28)+1,2,'0')||' 14:00:00','YYYY-MM-DD HH24:MI:SS'),CASE WHEN MOD(i,3)=0 THEN 'High' ELSE 'Medium' END,'Completed');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO imaging_studies (study_id,img_order_id,dicom_uid,pacs_url,performed_at,technologist_id,machine_id,image_count)
    VALUES (i,i,'1.2.840.113619.'||LPAD(i,5,'0'),'https://pacs.kfh/rad/'||i,TO_TIMESTAMP('2024-10-'||LPAD(MOD(i,28)+1,2,'0')||' 15:30:00','YYYY-MM-DD HH24:MI:SS'),MOD(i-1,20)+1,MOD(i-1,20)+1,MOD(i,50)+10);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO radiology_reports (report_id,study_id,radiologist_id,findings,impression,critical_finding,reported_at)
    VALUES (i,i,MOD(i-1,20)+1,'Findings summary '||i,'Impression summary '||i,CASE WHEN MOD(i,5)=0 THEN 1 ELSE 0 END,TO_TIMESTAMP('2024-10-'||LPAD(MOD(i,28)+1,2,'0')||' 17:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO cardiac_encounters (cardiac_id,visit_id,cardiologist_id,ecg_findings,echo_findings,ef_percent,nyha_class,rhythm)
    VALUES (i,MOD(i-1,20)+1,MOD(i-1,20)+1,'Normal sinus rhythm','Mild left ventricle dilation',55+MOD(i,10),MOD(i,4)+1,'SR');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO catheterization_procedures (cath_id,visit_id,procedure_type,access_site,contrast_agent,contrast_ml,fluoroscopy_min,radiation_dose_mgy,performed_by,performed_at,findings,complications)
    VALUES (i,MOD(i-1,20)+1,'Angiography',CASE WHEN MOD(i,2)=0 THEN 'Femoral' ELSE 'Radial' END,'Iohexol',80+MOD(i,40),15+MOD(i,10),2.5+MOD(i,3),MOD(i-1,20)+1,TO_TIMESTAMP('2024-09-'||LPAD(MOD(i,28)+1,2,'0')||' 08:00:00','YYYY-MM-DD HH24:MI:SS'),'No significant stenosis','None');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO coronary_angiograms (angio_id,cath_id,vessel,stenosis_percent,lesion_type,ffr_value,intervention,stent_type,stent_length_mm)
    VALUES (i,i,CASE WHEN MOD(i,3)=0 THEN 'LAD' WHEN MOD(i,3)=1 THEN 'RCA' ELSE 'LCx' END,10+MOD(i,30),'A','0.85','None','DES',20+MOD(i,15));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO cardiac_devices (device_id,patient_id,device_type,manufacturer,model,serial_number,implanted_at,implanted_by,next_check_date,battery_status)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Pacemaker' ELSE 'ICD' END,'Medtronic','Model '||i,'SN'||LPAD(i,6,'0'),TO_DATE('2024-01-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),MOD(i-1,20)+1,TO_DATE('2025-01-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),CASE WHEN MOD(i,2)=0 THEN 'Good' ELSE 'Fair' END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO ct_surgery_cases (cts_id,visit_id,procedure_type,bypass_used,bypass_time_min,cross_clamp_min,surgeon_id,ot_id,performed_at,outcome,discharge_status)
    VALUES (i,MOD(i-1,20)+1,'Valve Replacement',CASE WHEN MOD(i,2)=0 THEN 1 ELSE 0 END,120+MOD(i,60),80+MOD(i,20),MOD(i-1,20)+1,MOD(i-1,20)+1,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 07:30:00','YYYY-MM-DD HH24:MI:SS'),'Successful','Stable');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO perfusion_records (perf_id,cts_id,perfusionist_id,bypass_start,bypass_end,min_temp_celsius,max_flow_lpm,priming_vol_ml,blood_units_used,incidents)
    VALUES (i,i,MOD(i-1,20)+1,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 08:00:00','YYYY-MM-DD HH24:MI:SS'),TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 10:00:00','YYYY-MM-DD HH24:MI:SS'),28.5,4.5,1200,2,'No incidents');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO thoracic_procedures (thorac_id,visit_id,approach,lung_side,resection_type,findings,surgeon_id,ot_id,performed_at)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Open' ELSE 'VATS' END,CASE WHEN MOD(i,2)=0 THEN 'Left' ELSE 'Right' END,'Lobectomy','Expected pathology',MOD(i-1,20)+1,MOD(i-1,20)+1,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 11:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO chest_drains (drain_id,visit_id,side,inserted_at,removed_at,output_ml_day,drain_type,indication)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Left' ELSE 'Right' END,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 12:00:00','YYYY-MM-DD HH24:MI:SS'),TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 18:00:00','YYYY-MM-DD HH24:MI:SS'),150+MOD(i,100),'Standard','Postoperative drainage');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO hepatobiliary_cases (hb_id,visit_id,procedure_type,approach,organ,surgeon_id,ot_id,performed_at,complications,intraop_blood_loss_ml)
    VALUES (i,MOD(i-1,20)+1,'Cholecystectomy',CASE WHEN MOD(i,2)=0 THEN 'Laparoscopic' ELSE 'Open' END,'Gallbladder',MOD(i-1,20)+1,MOD(i-1,20)+1,TO_TIMESTAMP('2024-07-'||LPAD(MOD(i,28)+1,2,'0')||' 09:00:00','YYYY-MM-DD HH24:MI:SS'),'Minimal bleeding',150+MOD(i,50));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO endoscopy_procedures (endo_id,visit_id,scope_type,indication,findings,biopsy_taken,polyps_removed,performed_by,performed_at)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Gastroscopy' ELSE 'Colonoscopy' END,'GI assessment','Mild inflammation',CASE WHEN MOD(i,3)=0 THEN 1 ELSE 0 END,CASE WHEN MOD(i,4)=0 THEN 1 ELSE 0 END,MOD(i-1,20)+1,TO_TIMESTAMP('2024-07-'||LPAD(MOD(i,28)+1,2,'0')||' 14:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO liver_function_tracking (lft_id,patient_id,test_date,alt_ul,ast_ul,bilirubin_total,albumin_gdl,inr,ggt_ul,child_pugh_score)
    VALUES (i,MOD(i-1,20)+1,TO_DATE('2024-08-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),40+MOD(i,30),35+MOD(i,30),1.0+MOD(i,20)/10,3.5+MOD(i,10)/10,1.0+MOD(i,10)/100,40+MOD(i,20),5+MOD(i,6));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO gi_diagnoses (gi_diag_id,encounter_id,gi_location,icd10_code,h_pylori_status,severity,barrett_present)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,3)=0 THEN 'Stomach' WHEN MOD(i,3)=1 THEN 'Esophagus' ELSE 'Duodenum' END,'K21.9',CASE WHEN MOD(i,2)=0 THEN 'Positive' ELSE 'Negative' END,CASE WHEN MOD(i,2)=0 THEN 'Severe' ELSE 'Mild' END,CASE WHEN MOD(i,5)=0 THEN 1 ELSE 0 END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO haematology_cases (haem_id,visit_id,diagnosis,haematologist_id,bone_marrow_done,flow_cytometry_done,transfusion_dependent,disease_phase,protocol)
    VALUES (i,MOD(i-1,20)+1,'Anemia',''||MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 1 ELSE 0 END,CASE WHEN MOD(i,3)=0 THEN 1 ELSE 0 END,CASE WHEN MOD(i,4)=0 THEN 1 ELSE 0 END,'Chronic','Protocol '||i);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO blood_transfusions (transfusion_id,visit_id,product_type,units_given,blood_group,rh_factor,cross_match_result,transfused_at,transfusion_duration_min,reaction,reaction_notes)
    VALUES (i,MOD(i-1,20)+1,CASE WHEN MOD(i,2)=0 THEN 'PRBC' ELSE 'Platelets' END,1+MOD(i,3),'O+',CASE WHEN MOD(i,2)=0 THEN 'Positive' ELSE 'Negative' END,'Compatible',TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 13:00:00','YYYY-MM-DD HH24:MI:SS'),30+MOD(i,20),'None','No reaction');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO pathology_specimens (specimen_id,visit_id,tissue_type,collection_method,body_site,collected_by,collected_at,fixative_used,gross_description)
    VALUES (i,MOD(i-1,20)+1,'Biopsy',CASE WHEN MOD(i,2)=0 THEN 'Endoscopic' ELSE 'Surgical' END,CASE WHEN MOD(i,2)=0 THEN 'Liver' ELSE 'Skin' END,MOD(i-1,20)+1,TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 14:30:00','YYYY-MM-DD HH24:MI:SS'),'Formalin','Sample appears adequate');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO pathology_reports (path_report_id,specimen_id,pathologist_id,diagnosis,icd10_code,tumour_grade,margin_status,lymphovascular_invasion,ki67_percent,molecular_markers,reported_at)
    VALUES (i,i,MOD(i-1,20)+1,'Pathology report details','C50.9',CASE WHEN MOD(i,3)=0 THEN 'II' ELSE 'I' END,CASE WHEN MOD(i,2)=0 THEN 'Negative' ELSE 'Positive' END,CASE WHEN MOD(i,5)=0 THEN 1 ELSE 0 END,10+MOD(i,60),'ER/PR positive',TO_TIMESTAMP('2024-08-'||LPAD(MOD(i,28)+1,2,'0')||' 16:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO nephrology_cases (neph_id,visit_id,ckd_stage,nephrologist_id,primary_cause,dialysis_required,gfr_ml_min,proteinuria_g_day,transplant_waitlisted)
    VALUES (i,MOD(i-1,20)+1,2+MOD(i,3),MOD(i-1,20)+1,'Hypertensive nephropathy',CASE WHEN MOD(i,4)=0 THEN 1 ELSE 0 END,45+MOD(i,10),0.5+MOD(i,10)/10,CASE WHEN MOD(i,5)=0 THEN 1 ELSE 0 END);
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO dialysis_sessions (dialysis_id,patient_id,session_date,modality,duration_hrs,kt_v,ultrafiltration_ml,access_type,machine_id,conducted_by,complications)
    VALUES (i,MOD(i-1,20)+1,TO_DATE('2024-09-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),CASE WHEN MOD(i,2)=0 THEN 'Hemodialysis' ELSE 'Peritoneal' END,3.5,1.2,1500,CASE WHEN MOD(i,2)=0 THEN 'AV Fistula' ELSE 'PD Catheter' END,MOD(i-1,20)+1,MOD(i-1,20)+1,'None');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO kidney_transplants (transplant_id,recipient_id,donor_id,donor_type,surgery_date,surgeon_id,ot_id,hla_match_score,cold_ischemia_hrs,warm_ischemia_min,delayed_graft_function,outcome)
    VALUES (i,MOD(i-1,20)+1,MOD(i,20)+1,CASE WHEN MOD(i,2)=0 THEN 'Living' ELSE 'Deceased' END,TO_DATE('2024-10-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),MOD(i-1,20)+1,MOD(i-1,20)+1,80+MOD(i,15),3.5,45,CASE WHEN MOD(i,4)=0 THEN 1 ELSE 0 END,'Stable');
  END LOOP;
  FOR i IN 1..20 LOOP
    INSERT INTO immunosuppression_regimens (immuno_id,transplant_id,med_id,dose_mg,frequency,route,started_at,trough_level_ngml,adjusted_at)
    VALUES (i,MOD(i-1,20)+1,MOD(i-1,20)+1,5+MOD(i,20),'Once daily','Oral',TO_DATE('2024-10-'||LPAD(MOD(i,28)+1,2,'0'),'YYYY-MM-DD'),5.5+MOD(i,10)/10,TO_TIMESTAMP('2024-10-'||LPAD(MOD(i,28)+1,2,'0')||' 10:00:00','YYYY-MM-DD HH24:MI:SS'));
  END LOOP;
END;
/

COMMIT;
