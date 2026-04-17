CREATE DATABASE  IF NOT EXISTS `chuk_demo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `chuk_demo`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: chuk_demo
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'c61c28cb-3277-11f1-a4f9-005056c00001:1-111';

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'Kicukiro','Masaka','Gikomero','Kigali'),(2,'Gasabo','Kimironko','Rebero','Kigali'),(3,'Nyarugenge','Nyamirambo','Gikondo','Kigali'),(4,'Huye','Ngoma','Tumba','Southern'),(5,'Musanze','Kinigi','Ruhengeri','Northern'),(6,'Rusizi','Bugarama','Nyakarenzo','Western'),(7,'Nyamasheke','Mukamira','Gisovu','Western'),(8,'Rwamagana','Muhazi','Ngeruka','Eastern'),(9,'Bugesera','Nyamata','Mayange','Eastern'),(10,'Ruhango','Kinazi','Mwendo','Southern'),(11,'Gatsibo','Kabarore','Kiramuruzi','Eastern'),(12,'Ngororero','Cyarubare','Kabaya','Western'),(13,'Karongi','Bwishyura','Rubengera','Western'),(14,'Nyagatare','Matimba','Rwempasha','Eastern'),(15,'Rulindo','Shyorongi','Byimana','Northern'),(16,'Gicumbi','Rushashi','Cyumba','Northern'),(17,'Nyanza','Busasamana','Mata','Southern'),(18,'Kirehe','Nyamirama','Gatore','Eastern'),(19,'Burera','Cyanika','Butaro','Northern'),(20,'Kamonyi','Gihari','Muko','Southern');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beds`
--

DROP TABLE IF EXISTS `beds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beds` (
  `bed_id` int NOT NULL AUTO_INCREMENT,
  `ward_id` int DEFAULT NULL,
  `bed_number` varchar(10) DEFAULT NULL,
  `status` enum('Available','Occupied','Maintenance') DEFAULT NULL,
  PRIMARY KEY (`bed_id`),
  KEY `ward_id` (`ward_id`),
  CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`ward_id`) REFERENCES `wards` (`ward_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beds`
--

LOCK TABLES `beds` WRITE;
/*!40000 ALTER TABLE `beds` DISABLE KEYS */;
INSERT INTO `beds` VALUES (1,NULL,'A101','Available'),(2,NULL,'A102','Occupied'),(3,NULL,'A103','Available'),(4,NULL,'A104','Occupied'),(5,NULL,'B201','Available'),(6,NULL,'B202','Occupied'),(7,NULL,'B203','Available'),(8,NULL,'B204','Maintenance'),(9,NULL,'C301','Occupied'),(10,NULL,'C302','Available'),(11,NULL,'C303','Available'),(12,NULL,'D401','Occupied'),(13,NULL,'D402','Available'),(14,NULL,'D403','Maintenance'),(15,NULL,'E501','Occupied'),(16,NULL,'E502','Available'),(17,NULL,'F601','Available'),(18,NULL,'F602','Occupied'),(19,NULL,'G701','Available'),(20,NULL,'G702','Available');
/*!40000 ALTER TABLE `beds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `crisis_events`
--

DROP TABLE IF EXISTS `crisis_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `crisis_events` (
  `crisis_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `event_date` datetime DEFAULT NULL,
  `type` enum('Suicidal','Violent','Self-harm','Other') DEFAULT NULL,
  `intervention` text,
  `outcome` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`crisis_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `crisis_events_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `crisis_events`
--

LOCK TABLES `crisis_events` WRITE;
/*!40000 ALTER TABLE `crisis_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `crisis_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `category` enum('Clinical','Administrative','Support') DEFAULT NULL,
  `head_staff_id` int DEFAULT NULL,
  PRIMARY KEY (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Internal Medicine','Clinical',NULL),(2,'Surgery','Clinical',NULL),(3,'Pediatrics','Clinical',NULL),(4,'Radiology','Support',NULL),(5,'Pharmacy','Support',NULL),(6,'Laboratory','Support',NULL),(7,'Emergency','Clinical',NULL),(8,'Obstetrics','Clinical',NULL),(9,'Gynecology','Clinical',NULL),(10,'Dental','Clinical',NULL),(11,'Ophthalmology','Clinical',NULL),(12,'ENT','Clinical',NULL),(13,'Psychiatry','Clinical',NULL),(14,'Orthopedics','Clinical',NULL),(15,'Nutrition','Support',NULL),(16,'Rehabilitation','Support',NULL),(17,'Anaesthesia','Clinical',NULL),(18,'Neonatal','Clinical',NULL),(19,'Infection Control','Support',NULL),(20,'Administration','Administrative',NULL);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnoses`
--

DROP TABLE IF EXISTS `diagnoses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnoses` (
  `diag_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `icd10_code` varchar(10) DEFAULT NULL,
  `description` text,
  `is_primary` char(1) DEFAULT NULL,
  `confirmed_at` date DEFAULT NULL,
  PRIMARY KEY (`diag_id`),
  KEY `encounter_id` (`encounter_id`),
  CONSTRAINT `diagnoses_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnoses`
--

LOCK TABLES `diagnoses` WRITE;
/*!40000 ALTER TABLE `diagnoses` DISABLE KEYS */;
INSERT INTO `diagnoses` VALUES (1,1,'I10','Essential (primary) hypertension','1','2024-01-10'),(2,2,'Z23','Encounter for immunization','1','2024-02-08'),(3,3,'K35','Acute appendicitis','1','2024-03-02'),(4,4,'O14.9','Preeclampsia, unspecified','1','2024-03-20'),(5,5,'J45.9','Asthma, unspecified','1','2024-04-05'),(6,6,'K35','Postoperative appendectomy status','1','2024-04-12'),(7,7,'S39.0','Superficial injury of abdomen','1','2024-05-01'),(8,8,'H25.9','Age-related cataract, unspecified','1','2024-05-10'),(9,9,'S72.0','Fracture of femur','1','2024-05-18'),(10,10,'N92.6','Irregular menstruation','1','2024-06-02'),(11,11,'E11.9','Type 2 diabetes mellitus without complications','1','2024-06-08'),(12,12,'P07.3','Preterm newborn','1','2024-06-14'),(13,13,'R06.02','Shortness of breath','1','2024-07-01'),(14,14,'H66.9','Otitis media, unspecified','1','2024-07-08'),(15,15,'S72.0','Fracture of femur, postoperative follow-up','1','2024-07-16'),(16,16,'D50.9','Iron deficiency anemia','1','2024-07-24'),(17,17,'O80','Single spontaneous delivery','1','2024-08-02'),(18,18,'D63.8','Anemia in other chronic diseases','1','2024-08-10'),(19,19,'I20.9','Angina pectoris, unspecified','1','2024-08-17'),(20,20,'R93.5','Abnormal findings on diagnostic imaging of other body structures','1','2024-08-23');
/*!40000 ALTER TABLE `diagnoses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dispensing`
--

DROP TABLE IF EXISTS `dispensing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dispensing` (
  `disp_id` int NOT NULL AUTO_INCREMENT,
  `rx_id` int DEFAULT NULL,
  `dispensed_by` int DEFAULT NULL,
  `dispensed_at` datetime DEFAULT NULL,
  `qty_dispensed` int DEFAULT NULL,
  `pharmacy_location` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`disp_id`),
  KEY `rx_id` (`rx_id`),
  KEY `dispensed_by` (`dispensed_by`),
  CONSTRAINT `dispensing_ibfk_1` FOREIGN KEY (`rx_id`) REFERENCES `prescriptions` (`rx_id`),
  CONSTRAINT `dispensing_ibfk_2` FOREIGN KEY (`dispensed_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dispensing`
--

LOCK TABLES `dispensing` WRITE;
/*!40000 ALTER TABLE `dispensing` DISABLE KEYS */;
INSERT INTO `dispensing` VALUES (1,1,4,'2024-01-10 12:15:00',30,'Main Pharmacy'),(2,2,11,'2024-02-08 15:30:00',15,'Main Pharmacy'),(3,3,3,'2024-03-02 04:45:00',25,'Emergency Pharmacy'),(4,4,11,'2024-03-20 18:30:00',14,'Pharmacy B'),(5,5,4,'2024-04-05 13:15:00',21,'Pharmacy A'),(6,6,4,'2024-04-12 11:40:00',21,'Main Pharmacy'),(7,7,11,'2024-05-01 03:40:00',10,'Emergency Pharmacy'),(8,8,11,'2024-05-10 17:10:00',1,'Pharmacy B'),(9,9,4,'2024-05-18 10:15:00',3,'Main Pharmacy'),(10,10,11,'2024-06-02 11:45:00',7,'Pharmacy A'),(11,11,4,'2024-06-08 13:30:00',60,'Main Pharmacy'),(12,12,11,'2024-06-14 20:45:00',5,'Pharmacy B'),(13,13,4,'2024-07-01 05:15:00',7,'Emergency Pharmacy'),(14,14,11,'2024-07-08 12:10:00',15,'Pharmacy A'),(15,15,4,'2024-07-16 18:15:00',7,'Main Pharmacy'),(16,16,11,'2024-07-24 11:55:00',30,'Pharmacy A'),(17,17,4,'2024-08-02 14:00:00',14,'Pharmacy B'),(18,18,11,'2024-08-10 15:40:00',21,'Main Pharmacy'),(19,19,4,'2024-08-17 06:55:00',10,'Emergency Pharmacy'),(20,20,11,'2024-08-23 18:45:00',9,'Main Pharmacy');
/*!40000 ALTER TABLE `dispensing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drug_stock`
--

DROP TABLE IF EXISTS `drug_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drug_stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `med_id` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `qty_on_hand` int DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `batch_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`stock_id`),
  KEY `med_id` (`med_id`),
  CONSTRAINT `drug_stock_ibfk_1` FOREIGN KEY (`med_id`) REFERENCES `medications` (`med_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drug_stock`
--

LOCK TABLES `drug_stock` WRITE;
/*!40000 ALTER TABLE `drug_stock` DISABLE KEYS */;
INSERT INTO `drug_stock` VALUES (1,1,'Main Pharmacy',320,'2025-03-01','BATCH-PA001'),(2,2,'Main Pharmacy',210,'2025-04-15','BATCH-IB002'),(3,3,'Main Pharmacy',180,'2025-05-20','BATCH-AM003'),(4,4,'Emergency Pharmacy',120,'2025-01-30','BATCH-CE004'),(5,5,'Pediatric Pharmacy',60,'2025-02-28','BATCH-SA005'),(6,6,'Main Pharmacy',140,'2025-06-10','BATCH-ME006'),(7,7,'Main Pharmacy',100,'2025-07-15','BATCH-AM007'),(8,8,'Main Pharmacy',90,'2025-08-20','BATCH-HC008'),(9,9,'Main Pharmacy',110,'2025-09-12','BATCH-OM009'),(10,10,'Main Pharmacy',55,'2025-10-05','BATCH-CE010'),(11,11,'Main Pharmacy',45,'2025-11-22','BATCH-DI011'),(12,12,'Main Pharmacy',85,'2025-12-31','BATCH-FU012'),(13,13,'Main Pharmacy',75,'2025-12-15','BATCH-WA013'),(14,14,'Main Pharmacy',95,'2025-05-30','BATCH-IN014'),(15,15,'Main Pharmacy',50,'2025-04-10','BATCH-RA015'),(16,16,'Main Pharmacy',120,'2025-08-18','BATCH-LI016'),(17,17,'Main Pharmacy',130,'2025-06-28','BATCH-CO017'),(18,18,'Main Pharmacy',80,'2025-07-25','BATCH-PR018'),(19,19,'Main Pharmacy',75,'2025-03-05','BATCH-CH019'),(20,20,'Main Pharmacy',95,'2025-09-19','BATCH-CE020'),(21,1,'Main Pharmacy',300,'2025-03-01','BATCH-PA021'),(22,2,'Main Pharmacy',180,'2025-04-15','BATCH-IB022'),(23,3,'Main Pharmacy',160,'2025-05-20','BATCH-AM023'),(24,4,'Emergency Pharmacy',100,'2025-01-30','BATCH-CE024'),(25,5,'Pediatric Pharmacy',55,'2025-02-28','BATCH-SA025');
/*!40000 ALTER TABLE `drug_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encounters`
--

DROP TABLE IF EXISTS `encounters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encounters` (
  `encounter_id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `encounter_time` datetime DEFAULT NULL,
  `notes` text,
  `type` enum('Consultation','Procedure','Follow-up') DEFAULT NULL,
  PRIMARY KEY (`encounter_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `encounters_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`visit_id`),
  CONSTRAINT `encounters_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encounters`
--

LOCK TABLES `encounters` WRITE;
/*!40000 ALTER TABLE `encounters` DISABLE KEYS */;
INSERT INTO `encounters` VALUES (1,1,1,'2024-01-10 10:15:00','Admitted for hypertension management and observation.','Consultation'),(2,2,5,'2024-02-08 14:30:00','Routine pediatric review and vaccination update.','Consultation'),(3,3,6,'2024-03-02 02:45:00','Acute abdominal pain, admitted for assessment.','Consultation'),(4,4,18,'2024-03-20 16:40:00','Obstetric admission for suspected pre-eclampsia.','Consultation'),(5,5,4,'2024-04-05 10:55:00','Pharmacy review for chronic asthma medications.','Follow-up'),(6,6,2,'2024-04-12 09:00:00','Postoperative monitoring after appendectomy.','Follow-up'),(7,7,6,'2024-05-01 00:20:00','Emergency triage following road traffic injury.','Consultation'),(8,8,16,'2024-05-10 13:50:00','Eye examination and cataract screening.','Consultation'),(9,9,13,'2024-05-18 07:10:00','Orthopedic admission for hip fracture surgery.','Procedure'),(10,10,9,'2024-06-02 09:45:00','Gynecology consultation for menstrual irregularities.','Consultation'),(11,11,1,'2024-06-08 11:25:00','Internal medicine check for diabetes review.','Consultation'),(12,12,8,'2024-06-14 18:30:00','Neonatal admission observation after delivery complications.','Consultation'),(13,13,6,'2024-07-01 02:15:00','Emergency respiratory distress evaluation.','Consultation'),(14,14,12,'2024-07-08 10:45:00','ENT outpatient review for ear infection.','Consultation'),(15,15,13,'2024-07-16 16:10:00','Orthopedic ward round post-fracture fixation.','Follow-up'),(16,16,11,'2024-07-24 09:25:00','Pharmacy counseling on medication adherence.','Follow-up'),(17,17,18,'2024-08-02 12:35:00','Obstetric follow-up after normal delivery.','Follow-up'),(18,18,8,'2024-08-10 15:10:00','Laboratory consultation for anemia workup.','Consultation'),(19,19,6,'2024-08-17 03:50:00','Emergency evaluation for acute chest pain.','Consultation'),(20,20,3,'2024-08-23 16:45:00','Radiology outpatient for abdominal ultrasound.','Consultation');
/*!40000 ALTER TABLE `encounters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `icu_admissions`
--

DROP TABLE IF EXISTS `icu_admissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icu_admissions` (
  `icu_id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int DEFAULT NULL,
  `unit_type` enum('ICU','High Dependency','CCU','Other') DEFAULT NULL,
  `admitted_at` datetime DEFAULT NULL,
  `discharged_at` datetime DEFAULT NULL,
  `reason` text,
  PRIMARY KEY (`icu_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `icu_admissions_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`visit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `icu_admissions`
--

LOCK TABLES `icu_admissions` WRITE;
/*!40000 ALTER TABLE `icu_admissions` DISABLE KEYS */;
INSERT INTO `icu_admissions` VALUES (1,1,'ICU','2024-01-10 11:00:00','2024-01-15 10:30:00','Hypertensive emergency observation'),(2,3,'High Dependency','2024-03-02 03:30:00','2024-03-04 10:45:00','Acute abdominal pain monitoring'),(3,4,'ICU','2024-03-20 17:20:00','2024-03-25 09:55:00','Severe pre-eclampsia care'),(4,6,'ICU','2024-04-12 09:40:00','2024-04-18 12:50:00','Postoperative observation'),(5,9,'CCU','2024-05-18 07:45:00','2024-05-23 15:30:00','Orthopedic postoperative care'),(6,12,'ICU','2024-06-14 18:55:00','2024-06-19 09:05:00','Neonatal observation after delivery'),(7,13,'High Dependency','2024-07-01 02:55:00','2024-07-02 09:45:00','Respiratory distress support'),(8,15,'CCU','2024-07-16 16:40:00','2024-07-21 13:20:00','Post-surgical orthopedic recovery'),(9,17,'ICU','2024-08-02 13:00:00','2024-08-09 10:25:00','Post-delivery maternal care'),(10,19,'ICU','2024-08-17 04:20:00','2024-08-18 08:10:00','Acute chest pain monitoring'),(11,1,'High Dependency','2024-01-12 08:00:00','2024-01-14 16:00:00','Hypertension stabilization'),(12,4,'ICU','2024-03-22 11:30:00','2024-03-24 18:00:00','Obstetric blood pressure control'),(13,6,'High Dependency','2024-04-14 10:00:00','2024-04-17 15:50:00','Surgical wound monitoring'),(14,9,'ICU','2024-05-19 09:00:00','2024-05-22 14:40:00','Fracture recovery observation'),(15,12,'CCU','2024-06-15 07:30:00','2024-06-18 13:20:00','Neonatal respiratory support'),(16,13,'ICU','2024-07-01 03:30:00','2024-07-02 08:30:00','Acute respiratory support'),(17,15,'High Dependency','2024-07-17 08:00:00','2024-07-20 12:45:00','Post-fixation monitoring'),(18,17,'ICU','2024-08-03 10:45:00','2024-08-08 17:00:00','Maternal postoperative care'),(19,19,'ICU','2024-08-17 05:00:00','2024-08-18 07:50:00','Cardiac observation'),(20,6,'ICU','2024-04-13 14:20:00','2024-04-16 12:10:00','Complication monitoring');
/*!40000 ALTER TABLE `icu_admissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `icu_monitoring`
--

DROP TABLE IF EXISTS `icu_monitoring`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icu_monitoring` (
  `mon_id` int NOT NULL AUTO_INCREMENT,
  `icu_id` int DEFAULT NULL,
  `recorded_at` datetime DEFAULT NULL,
  `bp` varchar(20) DEFAULT NULL,
  `hr` int DEFAULT NULL,
  `rr` int DEFAULT NULL,
  `spo2` decimal(5,2) DEFAULT NULL,
  `gcs` int DEFAULT NULL,
  PRIMARY KEY (`mon_id`),
  KEY `icu_id` (`icu_id`),
  CONSTRAINT `icu_monitoring_ibfk_1` FOREIGN KEY (`icu_id`) REFERENCES `icu_admissions` (`icu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `icu_monitoring`
--

LOCK TABLES `icu_monitoring` WRITE;
/*!40000 ALTER TABLE `icu_monitoring` DISABLE KEYS */;
/*!40000 ALTER TABLE `icu_monitoring` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imaging_machines`
--

DROP TABLE IF EXISTS `imaging_machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imaging_machines` (
  `machine_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `modality` enum('X-ray','CT','MRI','Ultrasound','Other') DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `last_serviced` date DEFAULT NULL,
  PRIMARY KEY (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imaging_machines`
--

LOCK TABLES `imaging_machines` WRITE;
/*!40000 ALTER TABLE `imaging_machines` DISABLE KEYS */;
/*!40000 ALTER TABLE `imaging_machines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imaging_orders`
--

DROP TABLE IF EXISTS `imaging_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imaging_orders` (
  `img_order_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `modality` enum('X-ray','CT','MRI','Ultrasound','Other') DEFAULT NULL,
  `body_part` varchar(100) DEFAULT NULL,
  `ordered_by` int DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `status` enum('Pending','Completed','Cancelled') DEFAULT NULL,
  PRIMARY KEY (`img_order_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `ordered_by` (`ordered_by`),
  CONSTRAINT `imaging_orders_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `imaging_orders_ibfk_2` FOREIGN KEY (`ordered_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imaging_orders`
--

LOCK TABLES `imaging_orders` WRITE;
/*!40000 ALTER TABLE `imaging_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `imaging_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imaging_studies`
--

DROP TABLE IF EXISTS `imaging_studies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imaging_studies` (
  `study_id` int NOT NULL AUTO_INCREMENT,
  `img_order_id` int DEFAULT NULL,
  `dicom_uid` varchar(100) DEFAULT NULL,
  `performed_at` datetime DEFAULT NULL,
  `technologist_id` int DEFAULT NULL,
  `machine_id` int DEFAULT NULL,
  PRIMARY KEY (`study_id`),
  KEY `img_order_id` (`img_order_id`),
  KEY `technologist_id` (`technologist_id`),
  KEY `machine_id` (`machine_id`),
  CONSTRAINT `imaging_studies_ibfk_1` FOREIGN KEY (`img_order_id`) REFERENCES `imaging_orders` (`img_order_id`),
  CONSTRAINT `imaging_studies_ibfk_2` FOREIGN KEY (`technologist_id`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `imaging_studies_ibfk_3` FOREIGN KEY (`machine_id`) REFERENCES `imaging_machines` (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imaging_studies`
--

LOCK TABLES `imaging_studies` WRITE;
/*!40000 ALTER TABLE `imaging_studies` DISABLE KEYS */;
/*!40000 ALTER TABLE `imaging_studies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurance_claims`
--

DROP TABLE IF EXISTS `insurance_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurance_claims` (
  `claim_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int DEFAULT NULL,
  `scheme` varchar(100) DEFAULT NULL,
  `claimed_amount` decimal(10,2) DEFAULT NULL,
  `approved_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('Submitted','Approved','Rejected') DEFAULT NULL,
  `submitted_at` date DEFAULT NULL,
  PRIMARY KEY (`claim_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `insurance_claims_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurance_claims`
--

LOCK TABLES `insurance_claims` WRITE;
/*!40000 ALTER TABLE `insurance_claims` DISABLE KEYS */;
/*!40000 ALTER TABLE `insurance_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int DEFAULT NULL,
  `service_type` enum('Lab','Radiology','Medication','Consultation','Other') DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int DEFAULT NULL,
  `issued_at` datetime DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `paid_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('Pending','Paid','Cancelled') DEFAULT NULL,
  PRIMARY KEY (`invoice_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_orders`
--

DROP TABLE IF EXISTS `lab_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `ordered_by` int DEFAULT NULL,
  `test_id` int DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `priority` enum('High','Medium','Low') DEFAULT NULL,
  `status` enum('Pending','Completed','Cancelled') DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `ordered_by` (`ordered_by`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `lab_orders_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `lab_orders_ibfk_2` FOREIGN KEY (`ordered_by`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `lab_orders_ibfk_3` FOREIGN KEY (`test_id`) REFERENCES `lab_tests` (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_orders`
--

LOCK TABLES `lab_orders` WRITE;
/*!40000 ALTER TABLE `lab_orders` DISABLE KEYS */;
INSERT INTO `lab_orders` VALUES (1,1,1,1,'2024-01-10 10:30:00','High','Completed'),(2,2,5,2,'2024-02-08 14:35:00','Medium','Completed'),(3,3,6,3,'2024-03-02 03:00:00','High','Completed'),(4,4,18,9,'2024-03-20 17:00:00','High','Completed'),(5,5,4,5,'2024-04-05 11:10:00','Low','Completed'),(6,6,2,1,'2024-04-12 09:20:00','Medium','Completed'),(7,7,6,11,'2024-05-01 00:45:00','High','Completed'),(8,8,16,12,'2024-05-10 14:00:00','Medium','Completed'),(9,9,13,4,'2024-05-18 07:25:00','High','Completed'),(10,10,9,10,'2024-06-02 09:55:00','Medium','Completed'),(11,11,1,8,'2024-06-08 11:35:00','Medium','Completed'),(12,12,8,15,'2024-06-14 18:40:00','High','Completed'),(13,13,6,14,'2024-07-01 02:30:00','High','Completed'),(14,14,12,17,'2024-07-08 10:55:00','Low','Completed'),(15,15,13,1,'2024-07-16 16:25:00','Medium','Completed'),(16,16,11,16,'2024-07-24 09:35:00','Low','Pending'),(17,17,18,19,'2024-08-02 12:45:00','Medium','Completed'),(18,18,8,6,'2024-08-10 15:20:00','Medium','Completed'),(19,19,6,1,'2024-08-17 04:05:00','High','Completed'),(20,20,3,20,'2024-08-23 16:55:00','Low','Completed');
/*!40000 ALTER TABLE `lab_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_results`
--

DROP TABLE IF EXISTS `lab_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_results` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `parameter` varchar(100) DEFAULT NULL,
  `value` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `ref_range` varchar(50) DEFAULT NULL,
  `flag` enum('Normal','High','Low','Abnormal','Pending') DEFAULT NULL,
  `resulted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `lab_results_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `lab_orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_results`
--

LOCK TABLES `lab_results` WRITE;
/*!40000 ALTER TABLE `lab_results` DISABLE KEYS */;
INSERT INTO `lab_results` VALUES (1,1,'Hemoglobin','13.2','g/dL','12.0-16.0','Normal','2024-01-10 12:00:00'),(2,1,'WBC','8.5','x10^9/L','4.0-11.0','Normal','2024-01-10 12:00:00'),(3,1,'Platelets','280','x10^9/L','150-450','Normal','2024-01-10 12:00:00'),(4,2,'Malaria Parasite','Negative','','','Normal','2024-02-08 15:10:00'),(5,2,'Hemoglobin','11.1','g/dL','11.0-16.0','Normal','2024-02-08 15:10:00'),(6,3,'Blood Glucose','7.6','mmol/L','4.0-6.0','High','2024-03-02 04:30:00'),(7,3,'Creatinine','1.0','mg/dL','0.6-1.3','Normal','2024-03-02 04:35:00'),(8,4,'hCG','Positive','','','Normal','2024-03-20 18:15:00'),(9,4,'Urinalysis','No ketones','','','Normal','2024-03-20 18:18:00'),(10,5,'ALT','32','U/L','7-56','Normal','2024-04-05 13:00:00'),(11,5,'AST','28','U/L','8-48','Normal','2024-04-05 13:00:00'),(12,6,'Hemoglobin','11.8','g/dL','12.0-16.0','Low','2024-04-12 11:20:00'),(13,6,'WBC','9.1','x10^9/L','4.0-11.0','Normal','2024-04-12 11:20:00'),(14,7,'Sputum Microscopy','No AFB seen','','','Normal','2024-05-01 03:30:00'),(15,7,'Culture','Pending','','','Pending','2024-05-01 03:30:00'),(16,8,'X-ray Impression','Small opacity in left lung','','','Normal','2024-05-10 16:55:00'),(17,8,'Radiologist Note','Recommend follow-up in 7 days','','','Normal','2024-05-10 16:55:00'),(18,9,'Creatinine','1.1','mg/dL','0.6-1.3','Normal','2024-05-18 10:00:00'),(19,9,'Hemoglobin','12.7','g/dL','12.0-16.0','Normal','2024-05-18 10:00:00'),(20,10,'Blood Group','A+','','','Normal','2024-06-02 11:30:00'),(21,10,'Rh Factor','Positive','','','Normal','2024-06-02 11:30:00'),(22,11,'HbA1c','7.8','%','<6.5','High','2024-06-08 13:20:00'),(23,11,'Fasting Glucose','9.2','mmol/L','4.0-6.0','High','2024-06-08 13:20:00'),(24,12,'ESR','45','mm/hr','0-20','High','2024-06-14 20:30:00'),(25,12,'CRP','18','mg/L','<10','High','2024-06-14 20:35:00'),(26,13,'Malaria Parasite','Negative','','','Normal','2024-07-01 05:00:00'),(27,13,'Pulse Oximetry','93','%','95-100','Low','2024-07-01 05:05:00'),(28,14,'Stool RBC','None','','','Normal','2024-07-08 12:00:00'),(29,14,'Parasite Exam','Negative','','','Normal','2024-07-08 12:00:00'),(30,15,'Hemoglobin','13.5','g/dL','12.0-16.0','Normal','2024-07-16 18:00:00'),(31,15,'WBC','7.9','x10^9/L','4.0-11.0','Normal','2024-07-16 18:00:00'),(32,16,'Urine Culture','No growth','','','Normal','2024-07-24 11:20:00'),(33,16,'Urinalysis','Mild protein','mg/dL','0-15','Normal','2024-07-24 11:25:00'),(34,17,'Creatinine','0.9','mg/dL','0.6-1.3','Normal','2024-08-02 13:50:00'),(35,17,'Electrolytes','Normal','','','Normal','2024-08-02 13:55:00'),(36,18,'WBC','9.2','x10^9/L','4.0-11.0','Normal','2024-08-10 16:10:00'),(37,18,'Hemoglobin','12.4','g/dL','12.0-16.0','Normal','2024-08-10 16:15:00'),(38,19,'Troponin I','0.02','ng/mL','<0.04','Normal','2024-08-17 06:40:00'),(39,19,'ECG Result','Non-specific changes','','','Normal','2024-08-17 06:40:00'),(40,20,'Ultrasound Report','No abnormality detected','','','Normal','2024-08-23 18:30:00'),(41,3,'Blood Culture','No growth','','','Normal','2024-03-02 05:15:00'),(42,3,'Culture Sensitivity','Not applicable','','','Normal','2024-03-02 05:15:00'),(43,3,'CRP','24','mg/L','<10','High','2024-03-02 05:20:00'),(44,7,'Sputum Culture','No growth','','','Normal','2024-05-01 04:00:00'),(45,7,'Gram Stain','No organisms seen','','','Normal','2024-05-01 04:05:00'),(46,7,'Culture Panel','Negative','','','Normal','2024-05-01 04:10:00'),(47,13,'Blood Culture','No growth','','','Normal','2024-07-01 05:30:00'),(48,13,'Respiratory Culture','No growth','','','Normal','2024-07-01 05:35:00'),(49,13,'Sensitivity Panel','N/A','','','Normal','2024-07-01 05:40:00'),(50,19,'Blood Culture','No growth','','','Normal','2024-08-17 07:10:00'),(51,19,'Chest Culture','No growth','','','Normal','2024-08-17 07:15:00'),(52,19,'Microbiology Panel','Negative','','','Normal','2024-08-17 07:20:00');
/*!40000 ALTER TABLE `lab_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `sample_type` varchar(50) DEFAULT NULL,
  `turnaround_hrs` int DEFAULT NULL,
  PRIMARY KEY (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
INSERT INTO `lab_tests` VALUES (1,'Complete Blood Count','Hematology','Blood',24),(2,'Malaria Rapid Test','Microbiology','Blood',2),(3,'Blood Glucose','Chemistry','Blood',4),(4,'Renal Function','Chemistry','Blood',24),(5,'Liver Function','Chemistry','Blood',24),(6,'Urinalysis','Chemistry','Urine',6),(7,'HIV Antibody','Microbiology','Blood',48),(8,'Hemoglobin A1c','Chemistry','Blood',24),(9,'Pregnancy Test','Microbiology','Urine',2),(10,'Blood Group','Immunology','Blood',12),(11,'Sputum Microscopy','Microbiology','Sputum',24),(12,'Chest X-ray Report','Radiology','Image',48),(13,'Electrolytes Panel','Chemistry','Blood',24),(14,'Malaria Microscopy','Microbiology','Blood',24),(15,'ESR','Hematology','Blood',24),(16,'Urine Culture','Microbiology','Urine',72),(17,'Stool Examination','Microbiology','Stool',48),(18,'Serum Electrolytes','Chemistry','Blood',24),(19,'Creatinine','Chemistry','Blood',24),(20,'Blood Film','Hematology','Blood',24);
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication_order_items`
--

DROP TABLE IF EXISTS `medication_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_order_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `med_id` int DEFAULT NULL,
  `qty` int DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `order_id` (`order_id`),
  KEY `med_id` (`med_id`),
  CONSTRAINT `medication_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `medication_orders` (`order_id`),
  CONSTRAINT `medication_order_items_ibfk_2` FOREIGN KEY (`med_id`) REFERENCES `medications` (`med_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication_order_items`
--

LOCK TABLES `medication_order_items` WRITE;
/*!40000 ALTER TABLE `medication_order_items` DISABLE KEYS */;
INSERT INTO `medication_order_items` VALUES (1,1,7,30,'tablet','Take one tablet daily after breakfast'),(2,1,2,20,'tablet','Take one tablet every 8 hours with food'),(3,2,5,10,'syrup','Take 5ml orally every 8 hours'),(4,3,1,25,'tablet','Take one tablet every 6 hours for 5 days'),(5,3,17,10,'tablet','Take one tablet twice daily with water'),(6,4,9,14,'capsule','Take one capsule once daily before food'),(7,5,5,21,'syrup','Take 5ml every 8 hours as needed'),(8,6,3,21,'capsule','Take one capsule three times a day after meals'),(9,7,17,10,'tablet','Take one tablet twice daily'),(10,7,15,5,'tablet','Take one tablet once daily at bedtime'),(11,8,10,1,'tablet','Single dose; take immediately'),(12,9,4,3,'injection','Inject one dose intramuscularly once daily'),(13,10,15,7,'tablet','Take one tablet once daily before meals'),(14,11,6,60,'tablet','Take one tablet twice daily with food'),(15,12,15,5,'tablet','Take one tablet once daily before bed'),(16,13,11,7,'tablet','Take one tablet at bedtime'),(17,14,20,15,'capsule','Take one capsule three times daily after food'),(18,15,12,7,'tablet','Take one tablet once daily in the morning'),(19,16,16,30,'tablet','Take one tablet once daily for 30 days'),(20,17,14,14,'injection','Inject 10 IU before meals twice daily'),(21,18,18,21,'tablet','Take one tablet once daily for 21 days'),(22,19,13,10,'tablet','Take one tablet once daily for 10 days'),(23,20,1,9,'tablet','Take one tablet every 8 hours for 3 days');
/*!40000 ALTER TABLE `medication_order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medication_orders`
--

DROP TABLE IF EXISTS `medication_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medication_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `rx_id` int DEFAULT NULL,
  `ordered_by` int DEFAULT NULL,
  `ordered_at` datetime DEFAULT NULL,
  `qty_requested` int DEFAULT NULL,
  `status` enum('Pending','Prepared','Ready','Dispensed','Cancelled') DEFAULT NULL,
  `pharmacy_location` varchar(100) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`order_id`),
  KEY `rx_id` (`rx_id`),
  KEY `ordered_by` (`ordered_by`),
  CONSTRAINT `medication_orders_ibfk_1` FOREIGN KEY (`rx_id`) REFERENCES `prescriptions` (`rx_id`),
  CONSTRAINT `medication_orders_ibfk_2` FOREIGN KEY (`ordered_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medication_orders`
--

LOCK TABLES `medication_orders` WRITE;
/*!40000 ALTER TABLE `medication_orders` DISABLE KEYS */;
INSERT INTO `medication_orders` VALUES (1,1,4,'2024-01-10 12:05:00',30,'Dispensed','Main Pharmacy','Priority refill for hypertension'),(2,2,11,'2024-02-08 15:20:00',15,'Dispensed','Main Pharmacy','Pediatric dose approved'),(3,3,3,'2024-03-02 04:20:00',25,'Ready','Emergency Pharmacy','Urgent postoperative order'),(4,4,11,'2024-03-20 18:25:00',14,'Dispensed','Pharmacy B','Obstetric medication'),(5,5,4,'2024-04-05 13:05:00',21,'Dispensed','Pharmacy A','Asthma syrup for child'),(6,6,4,'2024-04-12 11:35:00',21,'Dispensed','Main Pharmacy','Post-op antibiotics'),(7,7,11,'2024-05-01 03:35:00',10,'Dispensed','Emergency Pharmacy','Trauma infection prophylaxis'),(8,8,11,'2024-05-10 16:55:00',1,'Dispensed','Pharmacy B','Single test medication'),(9,9,4,'2024-05-18 10:10:00',3,'Dispensed','Main Pharmacy','Short course antibiotic'),(10,10,11,'2024-06-02 11:50:00',7,'Dispensed','Pharmacy A','Gynecology tablet'),(11,11,4,'2024-06-08 13:25:00',60,'Ready','Main Pharmacy','Chronic diabetes medication'),(12,12,11,'2024-06-14 20:40:00',5,'Dispensed','Pharmacy B','Postpartum acid reducer'),(13,13,4,'2024-07-01 05:10:00',7,'Dispensed','Emergency Pharmacy','Anxiety medication'),(14,14,11,'2024-07-08 12:05:00',15,'Dispensed','Pharmacy A','Ear infection antibiotic'),(15,15,4,'2024-07-16 18:10:00',7,'Dispensed','Main Pharmacy','Diuretic order'),(16,16,11,'2024-07-24 11:50:00',30,'Prepared','Pharmacy A','Anemia supplement waiting pick-up'),(17,17,4,'2024-08-02 12:50:00',14,'Dispensed','Pharmacy B','Insulin for obstetrics'),(18,18,11,'2024-08-10 15:25:00',21,'Ready','Main Pharmacy','Chronic steroid order'),(19,19,4,'2024-08-17 06:50:00',10,'Prepared','Emergency Pharmacy','Cardiac medication before discharge'),(20,20,11,'2024-08-23 18:40:00',9,'Dispensed','Pharmacy A','Pain relief after imaging');
/*!40000 ALTER TABLE `medication_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medications`
--

DROP TABLE IF EXISTS `medications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medications` (
  `med_id` int NOT NULL AUTO_INCREMENT,
  `generic_name` varchar(100) DEFAULT NULL,
  `brand_name` varchar(100) DEFAULT NULL,
  `form` enum('Tablet','Capsule','Injection','Syrup','Other') DEFAULT NULL,
  `strength` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`med_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medications`
--

LOCK TABLES `medications` WRITE;
/*!40000 ALTER TABLE `medications` DISABLE KEYS */;
INSERT INTO `medications` VALUES (1,'Paracetamol','Dolo 650','Tablet','650','mg'),(2,'Ibuprofen','Brufen','Tablet','200','mg'),(3,'Amoxicillin','Amoxil','Capsule','500','mg'),(4,'Ceftriaxone','Rocephin','Injection','1','g'),(5,'Salbutamol','Ventolin','Syrup','2','mg/5ml'),(6,'Metformin','Glucophage','Tablet','500','mg'),(7,'Amlodipine','Norvasc','Tablet','5','mg'),(8,'Hydrochlorothiazide','Esidrex','Tablet','25','mg'),(9,'Omeprazole','Losec','Capsule','20','mg'),(10,'Cetirizine','Zyrtec','Tablet','10','mg'),(11,'Diazepam','Valium','Tablet','5','mg'),(12,'Furosemide','Lasix','Tablet','40','mg'),(13,'Warfarin','Coumadin','Tablet','5','mg'),(14,'Insulin','Actrapid','Injection','100','IU/ml'),(15,'Ranitidine','Zantac','Tablet','150','mg'),(16,'Lisinopril','Prinivil','Tablet','10','mg'),(17,'Co-trimoxazole','Septrin','Tablet','960','mg'),(18,'Prednisone','Deltasone','Tablet','20','mg'),(19,'Chlorpheniramine','Piriton','Tablet','4','mg'),(20,'Cefalexin','Keflex','Capsule','500','mg');
/*!40000 ALTER TABLE `medications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `next_of_kin`
--

DROP TABLE IF EXISTS `next_of_kin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `next_of_kin` (
  `kin_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`kin_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `next_of_kin_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `next_of_kin`
--

LOCK TABLES `next_of_kin` WRITE;
/*!40000 ALTER TABLE `next_of_kin` DISABLE KEYS */;
INSERT INTO `next_of_kin` VALUES (1,1,'Alice Mukasa','Wife','0788122222'),(2,2,'Jean Uwase','Husband','0788761111'),(3,3,'Claire Niyonsaba','Sister','0788344444'),(4,4,'Eric Umutesi','Brother','0788123333'),(5,5,'Beatrice Habimana','Wife','0788239999');
/*!40000 ALTER TABLE `next_of_kin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nicu_infants`
--

DROP TABLE IF EXISTS `nicu_infants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nicu_infants` (
  `nicu_id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int DEFAULT NULL,
  `birth_weight_g` int DEFAULT NULL,
  `gestational_age` int DEFAULT NULL,
  `apgar_1` int DEFAULT NULL,
  `apgar_5` int DEFAULT NULL,
  PRIMARY KEY (`nicu_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `nicu_infants_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nicu_infants`
--

LOCK TABLES `nicu_infants` WRITE;
/*!40000 ALTER TABLE `nicu_infants` DISABLE KEYS */;
/*!40000 ALTER TABLE `nicu_infants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operating_theaters`
--

DROP TABLE IF EXISTS `operating_theaters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operating_theaters` (
  `ot_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  `status` enum('Available','Occupied','Maintenance') DEFAULT NULL,
  `floor` int DEFAULT NULL,
  PRIMARY KEY (`ot_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `operating_theaters_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operating_theaters`
--

LOCK TABLES `operating_theaters` WRITE;
/*!40000 ALTER TABLE `operating_theaters` DISABLE KEYS */;
/*!40000 ALTER TABLE `operating_theaters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` datetime DEFAULT NULL,
  `from_status` varchar(50) DEFAULT NULL,
  `to_status` varchar(50) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`history_id`),
  KEY `order_id` (`order_id`),
  KEY `changed_by` (`changed_by`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `medication_orders` (`order_id`),
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,4,'2024-01-10 12:06:00','Pending','Prepared','Order prepared for dispensing'),(2,1,11,'2024-01-10 12:12:00','Prepared','Dispensed','Order dispensed to patient'),(3,2,11,'2024-02-08 15:21:00','Pending','Prepared','Order prepared in pharmacy'),(4,2,11,'2024-02-08 15:28:00','Prepared','Dispensed','Dispatched to parent'),(5,3,3,'2024-03-02 04:22:00','Pending','Prepared','Emergency order prepared'),(6,3,11,'2024-03-02 04:44:00','Prepared','Ready','Awaiting pickup'),(7,4,11,'2024-03-20 18:27:00','Pending','Prepared','Obstetric order prepared'),(8,4,11,'2024-03-20 18:32:00','Prepared','Dispensed','Handed to patient'),(9,5,4,'2024-04-05 13:07:00','Pending','Prepared','Asthma syrup prepared'),(10,5,4,'2024-04-05 13:22:00','Prepared','Dispensed','Dispensed at counter'),(11,6,4,'2024-04-12 11:33:00','Pending','Prepared','Antibiotics prepared'),(12,6,11,'2024-04-12 11:37:00','Prepared','Dispensed','Given to patient'),(13,7,11,'2024-05-01 03:37:00','Pending','Prepared','Emergency trauma order prepared'),(14,7,11,'2024-05-01 03:42:00','Prepared','Dispensed','Given to emergency team'),(15,8,11,'2024-05-10 16:57:00','Pending','Prepared','Single test med prepared'),(16,8,11,'2024-05-10 16:58:00','Prepared','Dispensed','Picked up by patient'),(17,9,4,'2024-05-18 10:12:00','Pending','Prepared','Short course antibiotic prepared'),(18,9,4,'2024-05-18 10:16:00','Prepared','Dispensed','Dispensed to patient'),(19,10,11,'2024-06-02 11:51:00','Pending','Prepared','Gynecology order prepared'),(20,10,11,'2024-06-02 11:55:00','Prepared','Dispensed','Released to patient');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_insurance`
--

DROP TABLE IF EXISTS `patient_insurance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_insurance` (
  `pi_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `scheme` enum('Public','Private','Other') DEFAULT NULL,
  `member_number` varchar(50) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  PRIMARY KEY (`pi_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `patient_insurance_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_insurance`
--

LOCK TABLES `patient_insurance` WRITE;
/*!40000 ALTER TABLE `patient_insurance` DISABLE KEYS */;
INSERT INTO `patient_insurance` VALUES (1,1,'Public','PUB001','2023-01-01','2024-01-01'),(2,2,'Private','PRI002','2023-02-01','2024-02-01'),(3,3,'Public','PUB003','2023-03-01','2024-03-01'),(4,4,'Other','OTH004','2023-04-01','2024-04-01'),(5,5,'Private','PRI005','2023-05-01','2024-05-01'),(6,6,'Public','PUB006','2024-01-01','2025-01-01'),(7,7,'Private','PRI007','2024-02-01','2025-02-01'),(8,8,'Public','PUB008','2024-03-01','2025-03-01'),(9,9,'Private','PRI009','2024-04-01','2025-04-01'),(10,10,'Public','PUB010','2024-05-01','2025-05-01'),(11,11,'Public','PUB011','2023-06-01','2024-06-01'),(12,12,'Private','PRI012','2023-07-01','2024-07-01'),(13,13,'Other','OTH013','2023-08-01','2024-08-01'),(14,14,'Public','PUB014','2023-09-01','2024-09-01'),(15,15,'Private','PRI015','2023-10-01','2024-10-01'),(16,16,'Public','PUB016','2024-06-01','2025-06-01'),(17,17,'Private','PRI017','2024-07-01','2025-07-01'),(18,18,'Other','OTH018','2024-08-01','2025-08-01'),(19,19,'Public','PUB019','2024-09-01','2025-09-01'),(20,20,'Private','PRI020','2024-10-01','2025-10-01');
/*!40000 ALTER TABLE `patient_insurance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('M','F','Other') DEFAULT NULL,
  `national_id` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `blood_type` varchar(3) DEFAULT NULL,
  `insurance_id` int DEFAULT NULL,
  PRIMARY KEY (`patient_id`),
  KEY `address_id` (`address_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,'Jean','Mukasa','1980-05-12','M','1198005121234567','0788123456',1,'O+',1),(2,'Aline','Uwase','1990-08-23','F','1199008232345678','0788765432',2,'A-',2),(3,'Emmanuel','Niyonsaba','1975-02-15','M','1197502153456789','0788345678',3,'B+',3),(4,'Catherine','Umutesi','2000-12-05','F','1200012054567890','0788123987',4,'AB+',4),(5,'Pascal','Habimana','1985-07-18','M','1198507185678901','0788234567',5,'O-',5),(6,'Jeanne','Munyaneza','1992-11-20','F','1199211209876543','0788845123',6,'A+',6),(7,'Olivier','Nkurunziza','1988-03-03','M','1198803037654321','0788590123',7,'B-',7),(8,'Claire','Ishimwe','1979-09-14','F','1197909142345678','0788456789',8,'O+',8),(9,'Innocent','Rusesabagina','1968-01-29','M','1196801298765432','0788341234',9,'AB-',9),(10,'Nadine','Mukantabana','1995-06-05','F','1199506053456789','0788587654',10,'A-',10),(11,'Felix','Nyirahabimana','1983-04-22','M','1198304221234590','0788231098',11,'B+',11),(12,'Sandrine','Uwimana','2002-10-18','F','1200210188765432','0788304567',12,'A+',12),(13,'Pascaline','Mukanwankiza','1978-07-09','F','1197807092345690','0788125678',13,'O-',13),(14,'Eric','Ndoli','1991-12-12','M','1199112123456790','0788467890',14,'B+',14),(15,'Lea','Mukabatsi','1987-03-25','F','1198703257654320','0788332123',15,'AB+',15),(16,'Moses','Rwakazina','1965-08-30','M','1196508301234598','0788001234',16,'A+',16),(17,'Aline','Niyonzima','2001-01-11','F','1200101112345690','0788445566',17,'O+',17),(18,'Patrice','Hakizimana','1993-02-27','M','1199302279876501','0788337788',18,'B-',18),(19,'Nelly','Uwera','1982-05-16','F','1198205163456791','0788212345',19,'AB-',19),(20,'Damien','Kagabo','1999-11-30','M','1199911309876542','0788123421',20,'O-',20);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int DEFAULT NULL,
  `method` enum('Cash','Card','Insurance','Other') DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `ref_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `invoice_id` (`invoice_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pharmacy_returns`
--

DROP TABLE IF EXISTS `pharmacy_returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacy_returns` (
  `return_id` int NOT NULL AUTO_INCREMENT,
  `disp_id` int DEFAULT NULL,
  `returned_by` int DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `qty_returned` int DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `pharmacy_location` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`return_id`),
  KEY `disp_id` (`disp_id`),
  KEY `returned_by` (`returned_by`),
  CONSTRAINT `pharmacy_returns_ibfk_1` FOREIGN KEY (`disp_id`) REFERENCES `dispensing` (`disp_id`),
  CONSTRAINT `pharmacy_returns_ibfk_2` FOREIGN KEY (`returned_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacy_returns`
--

LOCK TABLES `pharmacy_returns` WRITE;
/*!40000 ALTER TABLE `pharmacy_returns` DISABLE KEYS */;
INSERT INTO `pharmacy_returns` VALUES (1,1,4,'2024-01-10 13:00:00',2,'Patient declined dose','Main Pharmacy'),(2,2,11,'2024-06-08 14:00:00',5,'Medication expired in drawer','Main Pharmacy'),(3,3,3,'2024-03-02 05:00:00',1,'Wrong strength dispensed','Emergency Pharmacy'),(4,4,11,'2024-03-20 19:00:00',2,'Patient switched to alternative drug','Pharmacy B'),(5,5,4,'2024-04-05 14:00:00',1,'Excess quantity returned','Pharmacy A'),(6,6,4,'2024-04-12 12:00:00',3,'Refill order changed','Main Pharmacy'),(7,7,11,'2024-05-01 04:30:00',1,'Patient refused medication','Emergency Pharmacy'),(8,8,11,'2024-05-10 17:30:00',0,'Sample order only','Pharmacy B'),(9,9,4,'2024-05-18 10:45:00',1,'Short course adjustment','Main Pharmacy'),(10,10,11,'2024-06-02 12:15:00',2,'Prescriber amended dose','Pharmacy A');
/*!40000 ALTER TABLE `pharmacy_returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prescriptions`
--

DROP TABLE IF EXISTS `prescriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prescriptions` (
  `rx_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `med_id` int DEFAULT NULL,
  `dose` varchar(50) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `prescribed_by` int DEFAULT NULL,
  PRIMARY KEY (`rx_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `med_id` (`med_id`),
  KEY `prescribed_by` (`prescribed_by`),
  CONSTRAINT `prescriptions_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `prescriptions_ibfk_2` FOREIGN KEY (`med_id`) REFERENCES `medications` (`med_id`),
  CONSTRAINT `prescriptions_ibfk_3` FOREIGN KEY (`prescribed_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prescriptions`
--

LOCK TABLES `prescriptions` WRITE;
/*!40000 ALTER TABLE `prescriptions` DISABLE KEYS */;
INSERT INTO `prescriptions` VALUES (1,1,7,'5 mg','Once daily',30,1),(2,2,2,'200 mg','Three times daily',5,5),(3,3,1,'650 mg','Every 6 hours',5,1),(4,4,9,'20 mg','Once daily',14,18),(5,5,5,'2 mg/5ml','Two teaspoons every 8 hours',7,4),(6,6,3,'500 mg','Three times daily',7,2),(7,7,17,'960 mg','Twice daily',5,6),(8,8,10,'1 tab','Once',1,16),(9,9,4,'1 g','Once daily',3,13),(10,10,15,'150 mg','Once daily',7,9),(11,11,6,'500 mg','Twice daily',30,1),(12,12,15,'150 mg','Once daily',5,8),(13,13,11,'5 mg','At bedtime',7,6),(14,14,20,'500 mg','Three times daily',5,12),(15,15,12,'40 mg','Once daily',7,13),(16,16,16,'10 mg','Once daily',30,11),(17,17,14,'10 IU','Before meals',14,18),(18,18,18,'20 mg','Once daily',21,8),(19,19,13,'5 mg','Once daily',10,6),(20,20,1,'650 mg','Every 8 hours',3,3);
/*!40000 ALTER TABLE `prescriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `procedures`
--

DROP TABLE IF EXISTS `procedures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedures` (
  `proc_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `cpt_code` varchar(20) DEFAULT NULL,
  `description` text,
  `performed_by` int DEFAULT NULL,
  `ot_id` int DEFAULT NULL,
  `performed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`proc_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `performed_by` (`performed_by`),
  KEY `ot_id` (`ot_id`),
  CONSTRAINT `procedures_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `procedures_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `procedures_ibfk_3` FOREIGN KEY (`ot_id`) REFERENCES `operating_theaters` (`ot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `procedures`
--

LOCK TABLES `procedures` WRITE;
/*!40000 ALTER TABLE `procedures` DISABLE KEYS */;
/*!40000 ALTER TABLE `procedures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `psych_assessments`
--

DROP TABLE IF EXISTS `psych_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `psych_assessments` (
  `assess_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `tool` varchar(100) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `risk_level` enum('Low','Moderate','High') DEFAULT NULL,
  `assessed_by` int DEFAULT NULL,
  PRIMARY KEY (`assess_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `assessed_by` (`assessed_by`),
  CONSTRAINT `psych_assessments_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `psych_assessments_ibfk_2` FOREIGN KEY (`assessed_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `psych_assessments`
--

LOCK TABLES `psych_assessments` WRITE;
/*!40000 ALTER TABLE `psych_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `psych_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `psychiatric_meds`
--

DROP TABLE IF EXISTS `psychiatric_meds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `psychiatric_meds` (
  `psych_rx_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `med_id` int DEFAULT NULL,
  `dose` varchar(50) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `monitoring_required` bit(1) DEFAULT NULL,
  PRIMARY KEY (`psych_rx_id`),
  KEY `encounter_id` (`encounter_id`),
  KEY `med_id` (`med_id`),
  CONSTRAINT `psychiatric_meds_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`),
  CONSTRAINT `psychiatric_meds_ibfk_2` FOREIGN KEY (`med_id`) REFERENCES `medications` (`med_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `psychiatric_meds`
--

LOCK TABLES `psychiatric_meds` WRITE;
/*!40000 ALTER TABLE `psychiatric_meds` DISABLE KEYS */;
/*!40000 ALTER TABLE `psychiatric_meds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `radiology_reports`
--

DROP TABLE IF EXISTS `radiology_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `radiology_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `study_id` int DEFAULT NULL,
  `radiologist_id` int DEFAULT NULL,
  `findings` text,
  `impression` text,
  `reported_at` datetime DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `study_id` (`study_id`),
  KEY `radiologist_id` (`radiologist_id`),
  CONSTRAINT `radiology_reports_ibfk_1` FOREIGN KEY (`study_id`) REFERENCES `imaging_studies` (`study_id`),
  CONSTRAINT `radiology_reports_ibfk_2` FOREIGN KEY (`radiologist_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `radiology_reports`
--

LOCK TABLES `radiology_reports` WRITE;
/*!40000 ALTER TABLE `radiology_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `radiology_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `referrals`
--

DROP TABLE IF EXISTS `referrals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `referrals` (
  `referral_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `from_facility` varchar(100) DEFAULT NULL,
  `reason` text,
  `referral_date` date DEFAULT NULL,
  `priority` enum('High','Medium','Low') DEFAULT NULL,
  PRIMARY KEY (`referral_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `referrals_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `referrals`
--

LOCK TABLES `referrals` WRITE;
/*!40000 ALTER TABLE `referrals` DISABLE KEYS */;
INSERT INTO `referrals` VALUES (1,1,'Kacyiru Health Center','Referral for hypertension specialist care.','2024-01-09','High'),(2,2,'Muhima Health Center','Referral for pediatric immunization review.','2024-02-07','Medium'),(3,3,'Kanombe Clinic','Referral for surgical assessment.','2024-03-01','High'),(4,4,'Nyamirambo Health Post','Referral for obstetrics evaluation.','2024-03-19','High'),(5,5,'Remera Health Center','Referral for asthma medication review.','2024-04-04','Low'),(6,6,'Kigali City Hospital','Referral for postoperative care.','2024-04-11','Medium'),(7,7,'Gikondo Health Center','Referral for trauma emergency care.','2024-04-30','High'),(8,8,'Kanombe Health Center','Referral for eye specialist consult.','2024-05-09','Medium'),(9,9,'Huye Hospital','Referral for orthopedic surgery.','2024-05-17','High'),(10,10,'Ruhango Health Center','Referral for gynecology evaluation.','2024-06-01','Medium'),(11,11,'Kicukiro Health Center','Referral for diabetes specialist review.','2024-06-07','Medium'),(12,12,'Nyabugogo Health Center','Referral for neonatal observation.','2024-06-13','High'),(13,13,'Musanze Hospital','Referral for respiratory emergency care.','2024-06-30','High'),(14,14,'Kibagabaga Health Center','Referral for ENT consult.','2024-07-07','Low'),(15,15,'Nyanza Hospital','Referral for orthopedic follow-up care.','2024-07-15','Medium'),(16,16,'Muhanga Health Center','Referral for pharmacy medication counselling.','2024-07-23','Low'),(17,17,'Kirehe Health Center','Referral for post-delivery follow-up.','2024-08-01','Medium'),(18,18,'Karongi Health Center','Referral for anemia workup.','2024-08-09','Medium'),(19,19,'Kigali Emergency Center','Referral for cardiac evaluation.','2024-08-16','High'),(20,20,'Musanze Health Center','Referral for radiology ultrasound.','2024-08-22','Low');
/*!40000 ALTER TABLE `referrals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specimens`
--

DROP TABLE IF EXISTS `specimens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specimens` (
  `specimen_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `collected_by` int DEFAULT NULL,
  `collected_at` datetime DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `status` enum('Collected','Processing','Rejected') DEFAULT NULL,
  PRIMARY KEY (`specimen_id`),
  KEY `order_id` (`order_id`),
  KEY `collected_by` (`collected_by`),
  CONSTRAINT `specimens_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `lab_orders` (`order_id`),
  CONSTRAINT `specimens_ibfk_2` FOREIGN KEY (`collected_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specimens`
--

LOCK TABLES `specimens` WRITE;
/*!40000 ALTER TABLE `specimens` DISABLE KEYS */;
INSERT INTO `specimens` VALUES (1,1,2,'2024-01-10 10:40:00','SPC0001','Collected'),(2,2,11,'2024-02-08 14:45:00','SPC0002','Collected'),(3,3,3,'2024-03-02 03:10:00','SPC0003','Collected'),(4,4,11,'2024-03-20 17:10:00','SPC0004','Collected'),(5,5,4,'2024-04-05 11:20:00','SPC0005','Collected'),(6,6,2,'2024-04-12 09:30:00','SPC0006','Collected'),(7,7,3,'2024-05-01 00:55:00','SPC0007','Processing'),(8,8,8,'2024-05-10 14:10:00','SPC0008','Collected'),(9,9,13,'2024-05-18 07:35:00','SPC0009','Collected'),(10,10,4,'2024-06-02 10:05:00','SPC0010','Processing'),(11,11,2,'2024-06-08 11:45:00','SPC0011','Collected'),(12,12,8,'2024-06-14 18:50:00','SPC0012','Processing'),(13,13,3,'2024-07-01 02:40:00','SPC0013','Collected'),(14,14,12,'2024-07-08 11:05:00','SPC0014','Collected'),(15,15,13,'2024-07-16 16:35:00','SPC0015','Collected'),(16,16,11,'2024-07-24 09:45:00','SPC0016','Collected'),(17,17,18,'2024-08-02 12:55:00','SPC0017','Processing'),(18,18,8,'2024-08-10 15:30:00','SPC0018','Collected'),(19,19,6,'2024-08-17 04:15:00','SPC0019','Collected'),(20,20,3,'2024-08-23 17:05:00','SPC0020','Collected');
/*!40000 ALTER TABLE `specimens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `role` enum('Doctor','Nurse','Technician','Admin','Other','Pharmacist') DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Claude','Nshimiyimana','Doctor',1,'DOC001','2010-01-15'),(2,'Alice','Uwimana','Nurse',2,'NUR001','2015-05-10'),(3,'Eric','Habumuremyi','Technician',4,'TECH001','2018-03-12'),(4,'Marie','Mukantabana','Pharmacist',5,'PHARM001','2012-07-20'),(5,'Jean','Niyonzima','Doctor',3,'DOC002','2011-11-05'),(6,'Nadine','Ingabire','Doctor',7,'DOC003','2013-09-18'),(7,'Patrick','Munyakeri','Nurse',8,'NUR002','2016-12-02'),(8,'Christine','Mukase','Technician',6,'TECH002','2019-06-21'),(9,'Fabrice','Rusagara','Doctor',9,'DOC004','2014-04-14'),(10,'Sandrine','Uwase','Nurse',13,'NUR003','2017-02-28'),(11,'Jeanette','Munyaneza','Pharmacist',5,'PHARM002','2018-10-11'),(12,'Eric','Ndayisaba','Technician',4,'TECH003','2020-01-30'),(13,'Pascal','Munyandamutsa','Doctor',14,'DOC005','2012-08-06'),(14,'Aline','Niyonzima','Nurse',18,'NUR004','2019-05-03'),(15,'Franck','Uwitonze','Admin',20,'ADM001','2013-03-25'),(16,'Jeannette','Muneza','Doctor',11,'DOC006','2015-11-19'),(17,'Samuel','Bizimana','Technician',6,'TECH004','2021-07-09'),(18,'Alice','Mukamana','Doctor',8,'DOC007','2016-01-22'),(19,'Eugene','Ntawukuriryayo','Nurse',1,'NUR005','2014-09-14'),(20,'Catherine','Uwizeye','Pharmacist',5,'PHARM003','2018-12-17'),(21,'Alice','Mukandayisenga','Other',13,'THER001','2017-09-01'),(22,'Daniel','Bikorimana','Other',13,'THER002','2018-11-10'),(23,'Sylvie','Uwase','Other',13,'THER003','2019-07-18'),(24,'Eric','Minani','Other',13,'THER004','2020-03-05'),(25,'Beatrice','Nkurunziza','Other',13,'THER005','2021-05-22');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_schedule`
--

DROP TABLE IF EXISTS `staff_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_schedule` (
  `sched_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int DEFAULT NULL,
  `shift_date` date DEFAULT NULL,
  `shift_type` enum('Morning','Evening','Night') DEFAULT NULL,
  `dept_id` int DEFAULT NULL,
  PRIMARY KEY (`sched_id`),
  KEY `staff_id` (`staff_id`),
  KEY `dept_id` (`dept_id`),
  CONSTRAINT `staff_schedule_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`),
  CONSTRAINT `staff_schedule_ibfk_2` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_schedule`
--

LOCK TABLES `staff_schedule` WRITE;
/*!40000 ALTER TABLE `staff_schedule` DISABLE KEYS */;
INSERT INTO `staff_schedule` VALUES (1,1,'2024-06-01','Morning',1),(2,2,'2024-06-01','Evening',2),(3,3,'2024-06-01','Night',4),(4,4,'2024-06-01','Morning',5),(5,5,'2024-06-01','Evening',3),(6,6,'2024-06-02','Morning',7),(7,7,'2024-06-02','Evening',8),(8,8,'2024-06-02','Night',6),(9,9,'2024-06-02','Morning',9),(10,10,'2024-06-02','Evening',13),(11,11,'2024-06-03','Morning',5),(12,12,'2024-06-03','Evening',4),(13,13,'2024-06-03','Night',14),(14,14,'2024-06-03','Morning',18),(15,15,'2024-06-03','Evening',20),(16,16,'2024-06-04','Morning',11),(17,17,'2024-06-04','Evening',6),(18,18,'2024-06-04','Night',8),(19,19,'2024-06-04','Morning',1),(20,20,'2024-06-04','Evening',5),(21,1,'2024-07-01','Morning',1),(22,2,'2024-07-01','Evening',2),(23,3,'2024-07-01','Night',4),(24,4,'2024-07-01','Morning',5),(25,5,'2024-07-01','Evening',3),(26,6,'2024-07-02','Morning',7),(27,7,'2024-07-02','Evening',8),(28,8,'2024-07-02','Night',6),(29,9,'2024-07-02','Morning',9),(30,10,'2024-07-02','Evening',13),(31,11,'2024-08-01','Morning',5),(32,12,'2024-08-01','Evening',4),(33,13,'2024-08-01','Night',14),(34,14,'2024-08-01','Morning',18),(35,15,'2024-08-01','Evening',20),(36,16,'2024-08-02','Morning',11),(37,17,'2024-08-02','Evening',6),(38,18,'2024-08-02','Night',8),(39,19,'2024-08-02','Morning',1),(40,20,'2024-08-02','Evening',5),(41,21,'2024-09-01','Morning',13),(42,22,'2024-09-01','Evening',13),(43,23,'2024-09-01','Night',13),(44,24,'2024-09-02','Morning',13),(45,25,'2024-09-02','Evening',13),(46,1,'2024-09-03','Morning',1),(47,2,'2024-09-03','Evening',2),(48,3,'2024-09-03','Night',4),(49,4,'2024-09-03','Morning',5),(50,5,'2024-09-03','Evening',3),(51,1,'2024-10-01','Morning',1),(52,2,'2024-10-01','Evening',2),(53,3,'2024-10-01','Night',4),(54,4,'2024-10-01','Morning',5),(55,5,'2024-10-01','Evening',3),(56,21,'2024-10-02','Morning',13),(57,22,'2024-10-02','Evening',13),(58,23,'2024-10-02','Night',13),(59,24,'2024-10-03','Morning',13),(60,25,'2024-10-03','Evening',13),(61,6,'2024-11-01','Morning',7),(62,7,'2024-11-01','Evening',8),(63,8,'2024-11-01','Night',6),(64,9,'2024-11-01','Morning',9),(65,10,'2024-11-01','Evening',13),(66,11,'2024-11-02','Morning',5),(67,12,'2024-11-02','Evening',4),(68,13,'2024-11-02','Night',14),(69,14,'2024-11-02','Morning',18),(70,15,'2024-11-02','Evening',20);
/*!40000 ALTER TABLE `staff_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_adjustments`
--

DROP TABLE IF EXISTS `stock_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_adjustments` (
  `adjustment_id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int DEFAULT NULL,
  `adjusted_by` int DEFAULT NULL,
  `adjusted_at` datetime DEFAULT NULL,
  `qty_change` int DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`adjustment_id`),
  KEY `stock_id` (`stock_id`),
  KEY `adjusted_by` (`adjusted_by`),
  CONSTRAINT `stock_adjustments_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `drug_stock` (`stock_id`),
  CONSTRAINT `stock_adjustments_ibfk_2` FOREIGN KEY (`adjusted_by`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_adjustments`
--

LOCK TABLES `stock_adjustments` WRITE;
/*!40000 ALTER TABLE `stock_adjustments` DISABLE KEYS */;
INSERT INTO `stock_adjustments` VALUES (1,1,4,'2024-01-10 13:30:00',-20,'Dispensed','Reduced stock after dispensing'),(2,2,11,'2024-02-08 16:00:00',-15,'Dispensed','Pediatric order dispensed'),(3,3,3,'2024-03-02 05:10:00',-25,'Dispensed','Emergency post-op order'),(4,4,4,'2024-03-20 19:10:00',-14,'Dispensed','Obstetric medication dispensed'),(5,5,11,'2024-04-05 14:30:00',-21,'Dispensed','Asthma syrup dispensed'),(6,6,4,'2024-04-12 12:10:00',-21,'Dispensed','Post-op antibiotics dispensed'),(7,7,11,'2024-05-01 04:40:00',-10,'Dispensed','Trauma prophylaxis dispensed'),(8,8,11,'2024-05-10 17:20:00',-1,'Dispensed','Single test med dispensed'),(9,9,4,'2024-05-18 10:35:00',-3,'Dispensed','Antibiotic short course dispensed'),(10,10,11,'2024-06-02 12:00:00',-7,'Dispensed','Gynecology medication dispensed'),(11,11,4,'2024-06-08 14:10:00',-60,'Dispensed','Chronic diabetes medication dispensed'),(12,12,11,'2024-06-14 20:50:00',-5,'Dispensed','Postpartum medication dispensed'),(13,13,4,'2024-07-01 05:20:00',-7,'Dispensed','Anxiety medication dispensed'),(14,14,11,'2024-07-08 12:20:00',-15,'Dispensed','ENT antibiotic dispensed'),(15,15,4,'2024-07-16 18:20:00',-7,'Dispensed','Diuretic dispensed'),(16,16,11,'2024-07-24 12:00:00',-30,'Dispensed','Anemia supplement dispensed'),(17,17,4,'2024-08-02 13:00:00',-14,'Dispensed','Insulin dispensed'),(18,18,11,'2024-08-10 15:50:00',-21,'Dispensed','Steroid dispensed'),(19,19,4,'2024-08-17 07:10:00',-10,'Dispensed','Cardiac medication dispensed'),(20,20,11,'2024-08-23 18:55:00',-9,'Dispensed','Pain relief dispensed');
/*!40000 ALTER TABLE `stock_adjustments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `therapy_sessions`
--

DROP TABLE IF EXISTS `therapy_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `therapy_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `therapist_id` int DEFAULT NULL,
  `session_date` date DEFAULT NULL,
  `type` enum('Individual','Group','Family','Other') DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`session_id`),
  KEY `patient_id` (`patient_id`),
  KEY `therapist_id` (`therapist_id`),
  CONSTRAINT `therapy_sessions_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `therapy_sessions_ibfk_2` FOREIGN KEY (`therapist_id`) REFERENCES `staff` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `therapy_sessions`
--

LOCK TABLES `therapy_sessions` WRITE;
/*!40000 ALTER TABLE `therapy_sessions` DISABLE KEYS */;
INSERT INTO `therapy_sessions` VALUES (1,1,10,'2024-01-11','Individual','Diet and lifestyle advice for hypertension.'),(2,2,7,'2024-02-09','Individual','Vaccination counselling and growth monitoring.'),(3,3,10,'2024-03-03','Individual','Postoperative physical mobility support.'),(4,4,18,'2024-03-21','Individual','Pregnancy health education.'),(5,5,11,'2024-04-06','Individual','Asthma inhaler technique training.'),(6,6,14,'2024-04-13','Individual','Postoperative wound care counseling.'),(7,7,7,'2024-05-02','Individual','Trauma recovery psychological support.'),(8,8,16,'2024-05-11','Individual','Vision health counseling.'),(9,9,13,'2024-05-19','Individual','Pain management education after fracture.'),(10,10,11,'2024-06-03','Individual','Menstrual health counseling.'),(11,11,10,'2024-06-09','Individual','Diabetes self-care education.'),(12,12,18,'2024-06-15','Group','Newborn feeding and postpartum support.'),(13,13,7,'2024-07-02','Individual','Breathing exercises for respiratory distress.'),(14,14,12,'2024-07-09','Individual','Ear hygiene and infection prevention advice.'),(15,15,13,'2024-07-17','Group','Postoperative rehabilitation exercises.'),(16,16,11,'2024-07-25','Individual','Nutrition advice for anemia.'),(17,17,18,'2024-08-03','Individual','Postnatal mother support.'),(18,18,8,'2024-08-11','Individual','Anemia diet and supplement counselling.'),(19,19,7,'2024-08-18','Individual','Cardiac lifestyle modification advice.'),(20,20,3,'2024-08-24','Individual','Ultrasound prep and follow-up education.'),(21,1,21,'2024-09-05','Individual','Hypertension behaviour change coaching.'),(22,2,22,'2024-09-06','Individual','Child wellness and anxiety support.'),(23,3,23,'2024-09-07','Individual','Rehabilitation planning after surgery.'),(24,4,24,'2024-09-08','Individual','Antenatal stress reduction counsel.'),(25,5,25,'2024-09-09','Individual','Asthma symptom self-management education.'),(26,6,21,'2024-09-10','Group','Post-surgical recovery group therapy.'),(27,7,22,'2024-09-11','Individual','Trauma coping skills and counseling.'),(28,8,23,'2024-09-12','Individual','Vision care lifestyle guidance.'),(29,9,24,'2024-09-13','Group','Pain management for orthopedic patients.'),(30,10,25,'2024-09-14','Individual','Reproductive health education.');
/*!40000 ALTER TABLE `therapy_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventilator_sessions`
--

DROP TABLE IF EXISTS `ventilator_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventilator_sessions` (
  `vent_id` int NOT NULL AUTO_INCREMENT,
  `icu_id` int DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `mode` varchar(50) DEFAULT NULL,
  `fio2` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`vent_id`),
  KEY `icu_id` (`icu_id`),
  CONSTRAINT `ventilator_sessions_ibfk_1` FOREIGN KEY (`icu_id`) REFERENCES `icu_admissions` (`icu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventilator_sessions`
--

LOCK TABLES `ventilator_sessions` WRITE;
/*!40000 ALTER TABLE `ventilator_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventilator_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visits`
--

DROP TABLE IF EXISTS `visits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visits` (
  `visit_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `visit_type` enum('Outpatient','Inpatient','Emergency') DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `triage_level` int DEFAULT NULL,
  `admitted_at` datetime DEFAULT NULL,
  `discharged_at` datetime DEFAULT NULL,
  `bed_id` int DEFAULT NULL,
  PRIMARY KEY (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `bed_id` (`bed_id`),
  CONSTRAINT `visits_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`),
  CONSTRAINT `visits_ibfk_2` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`bed_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visits`
--

LOCK TABLES `visits` WRITE;
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` VALUES (1,1,'Inpatient',1,2,'2024-01-10 09:30:00','2024-01-15 10:00:00',1),(2,2,'Outpatient',3,4,'2024-02-08 14:00:00',NULL,NULL),(3,3,'Emergency',7,1,'2024-03-02 02:20:00','2024-03-04 11:00:00',2),(4,4,'Inpatient',8,3,'2024-03-20 16:10:00','2024-03-25 09:45:00',3),(5,5,'Outpatient',5,5,'2024-04-05 10:40:00',NULL,NULL),(6,6,'Inpatient',2,2,'2024-04-12 08:15:00','2024-04-18 12:30:00',4),(7,7,'Emergency',7,1,'2024-05-01 23:55:00','2024-05-02 07:20:00',NULL),(8,8,'Outpatient',11,4,'2024-05-10 13:30:00',NULL,NULL),(9,9,'Inpatient',14,3,'2024-05-18 06:50:00','2024-05-23 15:10:00',5),(10,10,'Outpatient',9,5,'2024-06-02 09:20:00',NULL,NULL),(11,11,'Outpatient',1,4,'2024-06-08 11:00:00',NULL,NULL),(12,12,'Inpatient',18,2,'2024-06-14 18:00:00','2024-06-19 08:45:00',6),(13,13,'Emergency',7,1,'2024-07-01 01:40:00','2024-07-02 09:30:00',NULL),(14,14,'Outpatient',12,5,'2024-07-08 10:15:00',NULL,NULL),(15,15,'Inpatient',13,3,'2024-07-16 15:50:00','2024-07-21 13:10:00',7),(16,16,'Outpatient',10,4,'2024-07-24 09:05:00',NULL,NULL),(17,17,'Inpatient',8,2,'2024-08-02 12:10:00','2024-08-09 10:15:00',8),(18,18,'Outpatient',6,5,'2024-08-10 14:50:00',NULL,NULL),(19,19,'Emergency',7,1,'2024-08-17 03:30:00','2024-08-18 08:00:00',NULL),(20,20,'Outpatient',4,4,'2024-08-23 16:20:00',NULL,NULL);
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vital_signs`
--

DROP TABLE IF EXISTS `vital_signs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vital_signs` (
  `vital_id` int NOT NULL AUTO_INCREMENT,
  `encounter_id` int DEFAULT NULL,
  `bp_systolic` int DEFAULT NULL,
  `bp_diastolic` int DEFAULT NULL,
  `pulse` int DEFAULT NULL,
  `temp_c` decimal(5,2) DEFAULT NULL,
  `spo2` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`vital_id`),
  KEY `encounter_id` (`encounter_id`),
  CONSTRAINT `vital_signs_ibfk_1` FOREIGN KEY (`encounter_id`) REFERENCES `encounters` (`encounter_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vital_signs`
--

LOCK TABLES `vital_signs` WRITE;
/*!40000 ALTER TABLE `vital_signs` DISABLE KEYS */;
INSERT INTO `vital_signs` VALUES (1,1,150,95,88,36.70,96.00,82.50),(2,2,110,70,98,36.50,98.00,12.30),(3,3,120,80,102,37.10,96.50,74.00),(4,4,144,90,92,37.00,97.20,70.00),(5,5,115,75,88,36.80,97.80,62.00),(6,6,128,82,90,36.90,97.60,73.50),(7,7,130,88,110,37.30,95.80,68.00),(8,8,118,72,84,36.60,98.10,64.50),(9,9,135,88,96,36.90,96.90,68.20),(10,10,122,78,90,36.70,97.50,58.00),(11,11,140,85,100,36.80,97.00,80.00),(12,12,112,70,110,36.50,98.00,3.20),(13,13,145,92,112,37.50,95.40,72.00),(14,14,116,74,86,36.60,97.90,62.30),(15,15,132,86,94,36.80,96.70,75.10),(16,16,118,76,82,36.70,98.00,60.80),(17,17,130,84,98,36.60,97.40,65.50),(18,18,120,78,88,36.90,97.60,68.70),(19,19,150,96,108,37.40,95.20,79.80),(20,20,117,73,88,36.60,97.90,55.40);
/*!40000 ALTER TABLE `vital_signs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `ward_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `floor` int DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`ward_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14 19:37:05
