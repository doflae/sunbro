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
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `updated` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `thumbnail` varchar(500) NOT NULL DEFAULT '',
  `more` tinyint(1) NOT NULL,
  `media_dir` varchar(30) NOT NULL DEFAULT '',
  `enabled` tinyint(4) NOT NULL DEFAULT 1,
  `author_name` varchar(30) NOT NULL DEFAULT '',
  `author_img` varchar(200) NOT NULL DEFAULT '',
  `likes` int(11) NOT NULL DEFAULT 0,
  `comments_cnt` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_board_user` (`author_num`) USING BTREE,
  CONSTRAINT `FK_board_user` FOREIGN KEY (`author_num`) REFERENCES `user` (`user_num`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=277 DEFAULT CHARSET=utf8 COMMENT='자료';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board`
--

LOCK TABLES `board` WRITE;
/*!40000 ALTER TABLE `board` DISABLE KEYS */;
INSERT INTO `board` VALUES (276,91,'asvasv','<div data-small=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwb27.jpeg\" data-lg=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwb.jpeg\" class=\"ng-img-div\" style=\"max-width:1920px;aspect-ratio:1.7778;\"><img src=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwb27.jpeg\" class=\"ng-img-small\"></div><p>asdas</p><div class=\"ng-video\" frameborder=\"0\" allowfullscreen=\"true\" data-url=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/gwAWRieqS2/gwAWRieqS2.m3u8\" style=\"max-width:320px;aspect-ratio:1.3334\"><img class=\"ng-thumb\" src=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/gwAWRieqS2/thumb.jpg\"><div class=\"playBtn-2\"></div></div><div class=\"boardIframeZone\"><iframe class=\"boardIframe\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowtransparency=\"true\" allowfullscreen=\"true\" scrolling=\"0\" src=\"https://www.youtube.com/embed/2b7_iq8rAVY?showinfo=0\"></iframe></div><p><br></p>','2021-06-01 20:12:32','2021-06-03 20:56:55','<div data-small=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwb27.jpeg\" data-lg=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwbthumb.jpg\" class=\"ng-img-div\" style=\"max-width:1920px;aspect-ratio:1.7778;\"><img src=\"/api/file/get?name=/2021/06/01/SOkLxE2DG9/VKYMujlRwb27.jpeg\" class=\"ng-img-small\"></div>',1,'/2021/06/01/SOkLxE2DG9',1,'savdfvdfbfd','/profileImg/cMQ4gdaqk3T1GketQythV.jpeg',0,0);
/*!40000 ALTER TABLE `board` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boardlikes`
--

DROP TABLE IF EXISTS `boardlikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `boardlikes` (
  `board_id` bigint(20) NOT NULL,
  `user_num` int(11) NOT NULL,
  PRIMARY KEY (`user_num`,`board_id`) USING BTREE,
  KEY `user_num` (`user_num`),
  KEY `FK_boardlikes_board` (`board_id`),
  CONSTRAINT `FK_boardlikes_board` FOREIGN KEY (`board_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_boardlikes_user` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boardlikes`
--

LOCK TABLES `boardlikes` WRITE;
/*!40000 ALTER TABLE `boardlikes` DISABLE KEYS */;
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
  `parent_id` bigint(20) DEFAULT NULL,
  `author_name` varchar(30) NOT NULL DEFAULT '',
  `author_img` varchar(200) NOT NULL DEFAULT '',
  `media` varchar(500) NOT NULL DEFAULT '',
  `likes` int(11) NOT NULL DEFAULT 0,
  `children_cnt` int(11) NOT NULL DEFAULT 0,
  `media_dir` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `FK_comment_board` (`board_id`),
  KEY `FK_comment_user` (`author_num`),
  KEY `FK_comment_comment` (`parent_id`),
  CONSTRAINT `FK_comment_board` FOREIGN KEY (`board_id`) REFERENCES `board` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comment_comment` FOREIGN KEY (`parent_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_comment_user` FOREIGN KEY (`author_num`) REFERENCES `user` (`user_num`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=272 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commentlikes`
--

DROP TABLE IF EXISTS `commentlikes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commentlikes` (
  `comment_id` bigint(20) NOT NULL,
  `user_num` int(11) NOT NULL,
  PRIMARY KEY (`comment_id`,`user_num`) USING BTREE,
  KEY `FK_commentlikes_user` (`user_num`),
  CONSTRAINT `FK_commentlikes_comment` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_commentlikes_user` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE ON UPDATE CASCADE
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
  `user_num` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(30) NOT NULL DEFAULT '',
  `password` varchar(100) NOT NULL DEFAULT '',
  `name` varchar(30) NOT NULL DEFAULT '',
  `enabled` tinyint(4) NOT NULL DEFAULT 0,
  `role` char(50) NOT NULL DEFAULT 'USER',
  `gender` tinyint(1) NOT NULL,
  `age` tinyint(4) NOT NULL,
  `profile_img` varchar(200) NOT NULL DEFAULT '',
  `joined` date DEFAULT NULL,
  PRIMARY KEY (`user_num`) USING BTREE,
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (77,'KAKAO1649742587','$2a$10$J1sPiSXupsDpYbXm5LM9U.PFiubyvohDp2yZKPwZzct0IhNlGBTVe','seono',0,'USER',0,20,'/profileImg/SCJII3n6MSFODWdOCnYJ0.jpeg','2021-03-30'),(78,'tjsh0111@daum.net','$2a$10$ut6AtQrhR8HgmIa1mZfJkOwq1DzOsPmEe5DZf6Xu4mMxEpfTIaxLe','seonnn',0,'USER',0,0,'','2021-03-30'),(91,'tjsh0111@gmail.com','$2a$10$nWkXILQE2HgX/E6y3M35Ye0hP5FbStC.djJFK84ykzxImaewn36FO','savdfvdfbfd',0,'USER',0,20,'/profileImg/cMQ4gdaqk3T1GketQythV.jpeg','2021-03-30'),(109,'testUser','test','testUser',1,'USER',0,0,'',NULL);
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

-- Dump completed on 2021-06-07 17:06:47
