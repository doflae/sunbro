-- MariaDB dump 10.18  Distrib 10.5.8-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	10.5.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `board`
--

DROP TABLE IF EXISTS `board`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `board` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `author_num` int(11) DEFAULT NULL,
  `title` varchar(100) NOT NULL DEFAULT '0',
  `content` text NOT NULL DEFAULT '0',
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `thumbnail` tinytext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_board_user` (`author_num`) USING BTREE,
  CONSTRAINT `FK_board_user` FOREIGN KEY (`author_num`) REFERENCES `user` (`usernum`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8 COMMENT='자료';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board`
--

LOCK TABLES `board` WRITE;
/*!40000 ALTER TABLE `board` DISABLE KEYS */;
INSERT INTO `board` VALUES (1,29,'1234','123','0000-00-00 00:00:00',NULL,NULL),(3,30,'hi','test','2021-01-29 00:36:13',NULL,NULL),(4,30,'HEY','MAMA','2021-01-29 00:41:39',NULL,NULL),(10,30,'test','test','0000-00-00 00:00:00',NULL,NULL),(11,30,'test','test','0000-00-00 00:00:00',NULL,NULL),(12,30,'dfvdfv','<p>dfvdfvdvf</p>','0000-00-00 00:00:00',NULL,NULL),(13,30,'dfgdfg','<p>dfgdfg</p>','0000-00-00 00:00:00',NULL,NULL),(14,30,'hiiiiii','<p>h</p>','0000-00-00 00:00:00',NULL,NULL),(15,30,'dfv','<p>dfv</p>','0000-00-00 00:00:00',NULL,NULL),(16,30,'hi','test','0000-00-00 00:00:00',NULL,NULL),(17,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(18,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(19,30,'234','<p>234</p>','0000-00-00 00:00:00',NULL,NULL),(20,30,'234','<p>2323</p>','0000-00-00 00:00:00',NULL,NULL),(21,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(22,30,'454','<p>345345</p>','0000-00-00 00:00:00',NULL,NULL),(23,30,'4234234234','<p>234234</p>','0000-00-00 00:00:00',NULL,NULL),(24,30,'test','<p><img src=\"/images/d7dNVm4afpWJCCvE6wH5rIdnt4.gif\"></p>','0000-00-00 00:00:00',NULL,NULL),(25,30,'jvjk','<p>vj</p><p><img src=\"/images/ou9ydHqLvRoy8vMJ6swxNfafZC.gif\"></p><p><br></p><iframe class=\"ql-video\" frameborder=\"0\" allowfullscreen=\"true\" src=\"/videos/wdb1Bbqy9Ku4jXJS7mARtmd7gm.mp4\"></iframe><p><br></p>','0000-00-00 00:00:00',NULL,NULL),(26,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(27,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(28,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(29,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(30,30,'hihi','test','0000-00-00 00:00:00',NULL,NULL),(31,30,'fgbfgbfgb','<p>fgbfgbfgbfgb</p>','0000-00-00 00:00:00',NULL,NULL),(32,30,'hey','<p>good morning</p>','2021-01-29 01:04:20',NULL,NULL),(33,30,'hey','<p>good morning</p>',NULL,NULL,NULL),(34,30,'hey','<p>good morning</p>',NULL,NULL,NULL),(35,30,'hey','<p>good morning</p>',NULL,NULL,NULL),(36,30,'HEY','MAMA','2021-01-29 01:17:13',NULL,NULL),(37,30,'HEY','MAMA',NULL,NULL,NULL),(38,30,'heyzxczxc','<p>good morning</p>',NULL,NULL,NULL),(39,30,'heyzxczxc','<p>good morning</p>qwe',NULL,'2021-01-29 01:32:21',NULL),(40,30,'heyzxczxc','<p>good morning</p>',NULL,NULL,NULL),(41,30,'heyzxczxc','<p>good morning</p>','2021-01-29 01:42:48',NULL,NULL),(42,30,'heyzxczxc','<p>good morning</p>','2021-01-29 01:43:02',NULL,NULL);
/*!40000 ALTER TABLE `board` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boardlikes`
--

DROP TABLE IF EXISTS `boardlikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boardlikes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_num` int(11) NOT NULL,
  `board_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_likes_board` (`board_id`),
  KEY `FK_likes_user` (`user_num`) USING BTREE,
  CONSTRAINT `FK_boardlikes_user` FOREIGN KEY (`user_num`) REFERENCES `user` (`usernum`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_likes_board` FOREIGN KEY (`board_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boardlikes`
--

LOCK TABLES `boardlikes` WRITE;
/*!40000 ALTER TABLE `boardlikes` DISABLE KEYS */;
INSERT INTO `boardlikes` VALUES (1,30,4);
/*!40000 ALTER TABLE `boardlikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `board_id` bigint(20) NOT NULL,
  `author_num` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_comment_board` (`board_id`),
  KEY `FK_comment_user` (`author_num`),
  CONSTRAINT `FK_comment_board` FOREIGN KEY (`board_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comment_user` FOREIGN KEY (`author_num`) REFERENCES `user` (`usernum`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,1,30,'test','2021-01-29 01:46:59',NULL),(2,1,30,'test2','2021-01-29 01:48:31',NULL),(3,1,30,'test2','2021-01-29 03:27:10',NULL);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commentlikes`
--

DROP TABLE IF EXISTS `commentlikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commentlikes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `comment_id` bigint(20) NOT NULL,
  `user_num` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_commentlikes_comment` (`comment_id`),
  KEY `FK_commentlikes_user` (`user_num`),
  CONSTRAINT `FK_commentlikes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_commentlikes_user` FOREIGN KEY (`user_num`) REFERENCES `user` (`usernum`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commentlikes`
--

LOCK TABLES `commentlikes` WRITE;
/*!40000 ALTER TABLE `commentlikes` DISABLE KEYS */;
/*!40000 ALTER TABLE `commentlikes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `usernum` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(30) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `enabled` tinyint(4) NOT NULL,
  `role` char(50) NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`usernum`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (29,'asf','$2a$10$o.pxHmazNB2O1qTSQHJSbeHrfERtet2ww5vbxtWdzd6Q.dhEpJ4WG','정선호',0,'USER'),(30,'1234','$2a$10$GPA0hZPwIRyFtDVaVBBekOIjOLvxMUcXco77/fj.4NUDTfeLoBxAa','1234',1,'USER');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-02-08 21:57:25
