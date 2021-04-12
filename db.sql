/*
SQLyog Community v13.1.5  (64 bit)
MySQL - 8.0.19 : Database - lroi
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`lroi` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lroi`;

/*Table structure for table `accesstoken` */

DROP TABLE IF EXISTS `accesstoken`;

CREATE TABLE `accesstoken` (
  `id` varchar(500) NOT NULL,
  `userId` int DEFAULT NULL,
  `ttl` int DEFAULT NULL,
  `scopes` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `userTokenUserMap` (`userId`),
  KEY `AccessTokenCreatedBy` (`createdBy`),
  KEY `AccessTokenUpdatedBy` (`updatedBy`),
  CONSTRAINT `AccessTokenCreatedBy` FOREIGN KEY (`createdBy`) REFERENCES `userdata` (`id`),
  CONSTRAINT `AccessTokenUpdatedBy` FOREIGN KEY (`updatedBy`) REFERENCES `userdata` (`id`),
  CONSTRAINT `AccessTokenUser` FOREIGN KEY (`userId`) REFERENCES `userdata` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `accesstoken` */

/*Table structure for table `address` */

DROP TABLE IF EXISTS `address`;

CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `zipcode` varchar(10) DEFAULT NULL,
  `cityId` int DEFAULT NULL,
  `stateId` int DEFAULT NULL,
  `addressLine1` varchar(500) DEFAULT NULL,
  `addressLine2` varchar(500) DEFAULT NULL,
  `suitNumber` varchar(500) DEFAULT NULL,
  `phoneNumber` varchar(10) DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `AddressCity` (`cityId`),
  KEY `AddressState` (`stateId`),
  CONSTRAINT `AddressCity` FOREIGN KEY (`cityId`) REFERENCES `city` (`id`),
  CONSTRAINT `AddressState` FOREIGN KEY (`stateId`) REFERENCES `state` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `address` */

/*Table structure for table `auditinfo` */

DROP TABLE IF EXISTS `auditinfo`;

CREATE TABLE `auditinfo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ipaddress` varchar(100) DEFAULT NULL,
  `query` longtext,
  `requestModel` varchar(1000) DEFAULT NULL,
  `userId` int DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=567 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `auditinfo` */

/*Table structure for table `billingcontact` */

DROP TABLE IF EXISTS `billingcontact`;

CREATE TABLE `billingcontact` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `BillingContactCustomer` (`customerId`),
  CONSTRAINT `BillingContactCustomer` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `billingcontact` */

/*Table structure for table `city` */

DROP TABLE IF EXISTS `city`;

CREATE TABLE `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `stateId` int DEFAULT NULL,
  `zipCode` varchar(10) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CityState` (`stateId`),
  CONSTRAINT `CityState` FOREIGN KEY (`stateId`) REFERENCES `state` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `city` */

/*Table structure for table `contactdetails` */

DROP TABLE IF EXISTS `contactdetails`;

CREATE TABLE `contactdetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `billingContactId` int DEFAULT NULL,
  `contactType` enum('EMAIL','PHONE') DEFAULT NULL,
  `type` enum('WORK','HOME','PERSONAL') DEFAULT NULL,
  `contact` varchar(200) DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `ContactBillingContact` (`billingContactId`),
  CONSTRAINT `ContactBillingContact` FOREIGN KEY (`billingContactId`) REFERENCES `billingcontact` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `contactdetails` */

/*Table structure for table `country` */

DROP TABLE IF EXISTS `country`;

CREATE TABLE `country` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `shortName` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `country` */

/*Table structure for table `customer` */

DROP TABLE IF EXISTS `customer`;

CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `companyAddressId` int DEFAULT NULL,
  `billingAddressId` int DEFAULT NULL,
  `multiFactorAuthentication` tinyint(1) DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `CustomerCompanyAddress` (`companyAddressId`),
  KEY `CustomerBillingAddress` (`billingAddressId`),
  KEY `CustomerCreatedBy` (`createdBy`),
  KEY `CustomerUpdatedBy` (`updatedBy`),
  CONSTRAINT `CustomerBillingAddress` FOREIGN KEY (`billingAddressId`) REFERENCES `address` (`id`),
  CONSTRAINT `CustomerCompanyAddress` FOREIGN KEY (`companyAddressId`) REFERENCES `address` (`id`),
  CONSTRAINT `CustomerCreatedBy` FOREIGN KEY (`createdBy`) REFERENCES `userdata` (`id`),
  CONSTRAINT `CustomerUpdatedBy` FOREIGN KEY (`updatedBy`) REFERENCES `userdata` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `customer` */

/*Table structure for table `customerindustries` */

DROP TABLE IF EXISTS `customerindustries`;

CREATE TABLE `customerindustries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customerId` int DEFAULT NULL,
  `industryId` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `CustomerIndustriesCustomer` (`customerId`),
  KEY `CustomerIndustriesIndustry` (`industryId`),
  CONSTRAINT `CustomerIndustriesCustomer` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`),
  CONSTRAINT `CustomerIndustriesIndustry` FOREIGN KEY (`industryId`) REFERENCES `industry` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `customerindustries` */

/*Table structure for table `emailtemplate` */

DROP TABLE IF EXISTS `emailtemplate`;

CREATE TABLE `emailtemplate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `type` enum('WELCOME','LOGIN','FORGOTPASSWORD') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `kind` enum('SMS','EMAIL') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `subject` varchar(1000) DEFAULT NULL,
  `message` longtext,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `emailtemplate` */

/*Table structure for table `industry` */

DROP TABLE IF EXISTS `industry`;

CREATE TABLE `industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `industry` */

/*Table structure for table `notificationhistory` */

DROP TABLE IF EXISTS `notificationhistory`;

CREATE TABLE `notificationhistory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notificationType` enum('SMS','EMAIL') DEFAULT NULL,
  `subject` varchar(1000) DEFAULT NULL,
  `message` longtext,
  `phoneNo` varchar(20) DEFAULT NULL,
  `sentOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `apiresponse` longtext,
  `emailId` varchar(1000) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=875 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `notificationhistory` */

/*Table structure for table `otprefreshtoken` */

DROP TABLE IF EXISTS `otprefreshtoken`;

CREATE TABLE `otprefreshtoken` (
  `id` varchar(500) NOT NULL,
  `userId` int DEFAULT NULL,
  `ttl` int DEFAULT NULL,
  `otpVerified` tinyint(1) DEFAULT NULL,
  `updatedOn` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `userRefreshTokenUserMap` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `otprefreshtoken` */

/*Table structure for table `role` */

DROP TABLE IF EXISTS `role`;

CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `role` */

/*Table structure for table `settings` */

DROP TABLE IF EXISTS `settings`;

CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ifuPath` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `settings` */

/*Table structure for table `state` */

DROP TABLE IF EXISTS `state`;

CREATE TABLE `state` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) DEFAULT NULL,
  `shortName` varchar(10) DEFAULT NULL,
  `countryId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `StateCountry` (`countryId`),
  CONSTRAINT `StateCountry` FOREIGN KEY (`countryId`) REFERENCES `country` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `state` */

/*Table structure for table `userdata` */

DROP TABLE IF EXISTS `userdata`;

CREATE TABLE `userdata` (
  `id` int NOT NULL AUTO_INCREMENT,
  `initials` varchar(5) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `profileImage` varchar(2000) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` text,
  `role` int DEFAULT NULL,
  `isSuperAdmin` tinyint(1) DEFAULT '0',
  `username` varchar(100) DEFAULT NULL,
  `customerId` int DEFAULT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(500) DEFAULT NULL,
  `emailUnsubscribed` tinyint(1) DEFAULT NULL,
  `realm` varchar(100) DEFAULT NULL,
  `isTrained` tinyint(1) DEFAULT NULL,
  `twoFactorAuthEnabled` tinyint(1) DEFAULT '1',
  `refreshOtpToken` varchar(500) DEFAULT NULL,
  `refreshTokenCreatedOn` timestamp NULL DEFAULT NULL,
  `otp` char(4) DEFAULT NULL,
  `optCreatedOn` timestamp NULL DEFAULT NULL,
  `failedOTPAttempts` int DEFAULT '0',
  `phoneNumber` varchar(20) DEFAULT NULL,
  `passwordFailureAttempts` int DEFAULT '0',
  `failedLoginAt` timestamp NULL DEFAULT NULL,
  `lastLoggedInAt` timestamp NULL DEFAULT NULL,
  `changePasswordToken` varchar(500) DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `updatedBy` int DEFAULT NULL,
  `createdOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `userCreatedByMap` (`createdBy`),
  KEY `userUpdatedByMap` (`updatedBy`),
  KEY `UserdataCustomer` (`customerId`),
  CONSTRAINT `userCreatedByMap` FOREIGN KEY (`createdBy`) REFERENCES `userdata` (`id`),
  CONSTRAINT `UserdataCustomer` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`),
  CONSTRAINT `userUpdatedByMap` FOREIGN KEY (`updatedBy`) REFERENCES `userdata` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

/*Data for the table `userdata` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
