
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id_administrador` int NOT NULL AUTO_INCREMENT,
  `id_persona` int NOT NULL,
  `nivel_acceso` enum('superadmin','admin') COLLATE utf8mb4_general_ci DEFAULT 'admin',
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_administrador`),
  KEY `id_persona` (`id_persona`),
  CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `administradores` WRITE;
INSERT INTO `administradores` VALUES (1,1,'superadmin','activo','2025-11-06 06:14:26'),(2,26,'admin','activo','2025-11-06 07:57:09'),(3,27,'admin','activo','2025-11-06 07:57:09'),(4,28,'admin','activo','2025-11-06 07:57:09');
UNLOCK TABLES;


DROP TABLE IF EXISTS `administrativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrativos` (
  `id_administrativo` int NOT NULL,
  `cargo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_persona` int NOT NULL,
  PRIMARY KEY (`id_administrativo`),
  KEY `fk_administrativo_persona` (`id_persona`),
  CONSTRAINT `administrativos_ibfk_1` FOREIGN KEY (`id_administrativo`) REFERENCES `personas` (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `administrativos` WRITE;
INSERT INTO `administrativos` VALUES (1,'Secretario',1),(7,'Cajero',7);
UNLOCK TABLES;


DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id_alumno` int NOT NULL,
  `legajo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_persona` int DEFAULT NULL,
  `domicilio` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `fecha_registro` date DEFAULT NULL,
  PRIMARY KEY (`id_alumno`),
  UNIQUE KEY `legajo` (`legajo`),
  KEY `fk_alumno_persona` (`id_persona`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_registro` (`fecha_registro`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `fk_alumno_persona` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `alumnos` WRITE;
INSERT INTO `alumnos` VALUES (4,'A001',4,'Av. Corrientes 12345, CABA','1998-05-15','activo','2025-10-13'),(5,'A002',5,'Av. Santa Fe 4567, CABA','1995-08-22','activo','2025-08-06'),(6,'A003',6,'Av. Rivadavia 890, CABA','2000-03-10','activo','2025-02-16'),(15,'A004',15,NULL,NULL,'activo','2025-11-01'),(16,'A005',16,NULL,NULL,'activo','2025-11-01'),(21,'A006',21,'Sarmiento 200',NULL,'activo','2025-11-02'),(29,'A007',29,NULL,NULL,'activo','2025-11-06'),(30,'A008',30,NULL,NULL,'activo','2025-11-06'),(31,'A009',31,NULL,NULL,'activo','2025-11-06'),(32,'A010',32,NULL,NULL,'activo','2025-11-06'),(33,'A011',33,NULL,NULL,'activo','2025-11-06'),(34,'A012',34,NULL,NULL,'activo','2025-11-07'),(35,'A013',35,NULL,NULL,'activo','2025-11-07'),(36,'014',36,NULL,NULL,'activo','2025-11-07'),(41,'A015',41,NULL,NULL,'activo','2025-11-14'),(43,'A016',43,NULL,NULL,'activo','2025-11-14'),(45,'A017',45,NULL,NULL,'activo','2025-11-18'),(46,'A018',46,NULL,NULL,'activo','2025-11-18'),(47,'A019',47,NULL,NULL,'activo','2025-11-19');
UNLOCK TABLES;


DROP TABLE IF EXISTS `anuncios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anuncios` (
  `id_anuncio` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_profesor` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `link_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `importante` tinyint(1) DEFAULT '0',
  `notificar` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_anuncio`),
  KEY `id_curso` (`id_curso`),
  KEY `id_profesor` (`id_profesor`),
  CONSTRAINT `anuncios_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `anuncios_ibfk_2` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `anuncios` WRITE;
INSERT INTO `anuncios` VALUES (1,1,2,'Anuncio de prueba Ingles Base','Prueba','2025-11-02 14:50:15',NULL,0,1),(2,1,2,'Anuncio de prueba Ingles Base con Enlace','Prueba con enlace','2025-11-02 14:50:34','https://www.youtube.com/watch?v=eiMvHLWOUSo',0,1),(3,1,2,'Anuncio de prueba Ingles Base con Poll','Prueba con poll','2025-11-02 14:51:03',NULL,0,1),(4,5,2,'Anuncio de prueba ingles intermedio','Prueba','2025-11-02 14:51:29',NULL,1,1),(5,5,2,'Anuncio de prueba ingles intermedio con enlace','Prueba','2025-11-02 14:51:50','https://www.youtube.com/watch?v=eiMvHLWOUSo',0,1),(6,5,2,'Anuncio de prueba Ingles Intermedio con poll','Prueba','2025-11-02 14:52:16',NULL,0,1),(7,1,2,'prueba notificacion','prueba','2025-11-02 17:11:13',NULL,0,1),(8,1,2,'anuncio para los alumnos de ingles base','ingles base 1','2025-11-02 17:15:07',NULL,0,1),(9,1,2,'nueva prueba de notificacion anuncio','anuncio','2025-11-02 17:17:35',NULL,0,1),(11,4,24,'anuncio japones !','anuncio !','2025-11-06 02:21:45',NULL,1,1),(12,5,2,'titulo','contenido','2025-11-07 00:43:07',NULL,1,1),(13,1,2,'titulo','base','2025-11-07 00:46:05',NULL,1,1);
UNLOCK TABLES;


DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id_asistencia` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_alumno` int NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','tardanza','justificado') COLLATE utf8mb4_general_ci DEFAULT 'ausente',
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asistencia`),
  UNIQUE KEY `unique_asistencia` (`id_curso`,`id_alumno`,`fecha`),
  KEY `idx_curso_fecha` (`id_curso`,`fecha`),
  KEY `idx_alumno` (`id_alumno`),
  KEY `idx_fecha` (`fecha`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `asistencias` WRITE;
INSERT INTO `asistencias` VALUES (7,7,4,'2025-11-04','ausente',NULL,'2025-11-04 01:30:56'),(8,7,16,'2025-11-04','tardanza',NULL,'2025-11-04 01:30:56'),(9,7,6,'2025-11-04','tardanza',NULL,'2025-11-04 01:30:56'),(10,7,21,'2025-11-04','ausente',NULL,'2025-11-04 01:30:56'),(11,7,5,'2025-11-04','justificado',NULL,'2025-11-04 01:30:56'),(12,7,15,'2025-11-04','presente',NULL,'2025-11-04 01:30:56'),(13,7,4,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(14,7,16,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(15,7,6,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(16,7,21,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(17,7,5,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(18,7,15,'2025-11-05','presente',NULL,'2025-11-04 01:31:06'),(19,7,4,'2025-11-06','presente',NULL,'2025-11-04 01:31:11'),(20,7,16,'2025-11-06','presente',NULL,'2025-11-04 01:31:11'),(21,7,6,'2025-11-06','presente',NULL,'2025-11-04 01:31:11'),(22,7,21,'2025-11-06','presente',NULL,'2025-11-04 01:31:11'),(23,7,5,'2025-11-06','presente',NULL,'2025-11-04 01:31:11'),(24,7,15,'2025-11-06','presente',NULL,'2025-11-04 01:31:11');
UNLOCK TABLES;


DROP TABLE IF EXISTS `aulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas` (
  `id_aula` int NOT NULL AUTO_INCREMENT,
  `nombre_aula` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacidad` int DEFAULT NULL,
  PRIMARY KEY (`id_aula`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `aulas` WRITE;
INSERT INTO `aulas` VALUES (1,'Aula 101',25),(2,'Aula 102',20),(4,'Aula 103',20),(5,'Aula 206',60),(6,'Aula 160',80);
UNLOCK TABLES;


DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id_calificacion` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int NOT NULL,
  `id_curso` int NOT NULL,
  `parcial1` decimal(4,2) DEFAULT NULL,
  `parcial2` decimal(4,2) DEFAULT NULL,
  `final` decimal(4,2) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE KEY `unique_alumno_curso` (`id_alumno`,`id_curso`),
  KEY `id_curso` (`id_curso`),
  KEY `idx_curso` (`id_curso`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`),
  CONSTRAINT `chk_final` CHECK (((`final` is null) or ((`final` >= 0) and (`final` <= 10)))),
  CONSTRAINT `chk_parcial1` CHECK (((`parcial1` is null) or ((`parcial1` >= 0) and (`parcial1` <= 10)))),
  CONSTRAINT `chk_parcial2` CHECK (((`parcial2` is null) or ((`parcial2` >= 0) and (`parcial2` <= 10))))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `calificaciones` WRITE;
INSERT INTO `calificaciones` VALUES (1,4,3,9.00,5.00,3.50,'2025-11-01 02:01:27','2025-11-01 06:27:00'),(2,5,3,6.00,4.00,7.00,'2025-11-01 02:13:06','2025-11-01 06:27:00'),(3,5,1,0.00,0.00,0.00,'2025-11-01 03:58:26','2025-11-02 00:55:14'),(4,6,1,0.00,0.00,0.00,'2025-11-01 03:58:55','2025-11-02 00:55:05'),(5,4,2,4.00,NULL,NULL,'2025-11-01 03:59:29','2025-11-01 03:59:29'),(6,6,2,2.00,NULL,NULL,'2025-11-01 03:59:29','2025-11-01 03:59:29'),(7,6,7,8.00,9.00,0.00,'2025-11-04 01:28:31','2025-11-04 01:28:31'),(8,4,7,8.00,8.00,6.00,'2025-11-04 01:28:43','2025-11-04 01:29:13'),(9,16,7,9.00,9.00,9.00,'2025-11-04 01:29:25','2025-11-04 01:29:25'),(10,4,1,4.00,4.00,NULL,'2025-11-06 13:04:48','2025-11-06 13:04:48'),(11,47,1,8.00,2.00,1.00,'2025-11-19 17:27:38','2025-11-19 17:28:44');
UNLOCK TABLES;


DROP TABLE IF EXISTS `chat_conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_conversaciones` (
  `id_conversacion` int NOT NULL AUTO_INCREMENT,
  `tipo_usuario` enum('invitado','alumno','profesor') COLLATE utf8mb4_general_ci NOT NULL,
  `id_usuario` int DEFAULT NULL COMMENT 'NULL para invitados, id_alumno o id_profesor para usuarios loggeados',
  `nombre_invitado` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Solo para usuarios invitados sin login',
  `estado` enum('pendiente','activa','cerrada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `fecha_inicio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `atendido_por` int DEFAULT NULL COMMENT 'id_usuario del admin que atiende',
  `mensajes_no_leidos_admin` int DEFAULT '0' COMMENT 'Contador de mensajes no leÃ­dos por el admin',
  `mensajes_no_leidos_usuario` int DEFAULT '0' COMMENT 'Contador de mensajes no leÃ­dos por el usuario',
  `ultima_actividad` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_conversacion`),
  KEY `idx_estado` (`estado`),
  KEY `idx_atendido_por` (`atendido_por`),
  KEY `idx_tipo_usuario` (`tipo_usuario`),
  KEY `idx_ultima_actividad` (`ultima_actividad`),
  CONSTRAINT `chat_conversaciones_ibfk_1` FOREIGN KEY (`atendido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Conversaciones de chat de soporte';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `chat_conversaciones` WRITE;
INSERT INTO `chat_conversaciones` VALUES (34,'profesor',2,NULL,'activa','2025-11-06 12:04:03',NULL,NULL,0,0,'2025-11-06 13:04:17'),(35,'alumno',20,NULL,'activa','2025-11-06 13:29:35',NULL,NULL,0,0,'2025-11-06 13:37:16'),(40,'alumno',29,NULL,'pendiente','2025-11-14 02:27:14',NULL,NULL,0,0,'2025-11-15 04:45:57'),(41,'alumno',33,NULL,'activa','2025-11-18 03:56:02',NULL,NULL,0,0,'2025-11-18 03:56:51'),(43,'alumno',35,NULL,'activa','2025-11-19 17:16:34',NULL,NULL,0,1,'2025-11-20 06:10:12');
UNLOCK TABLES;


DROP TABLE IF EXISTS `chat_estadisticas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_estadisticas` (
  `id_estadistica` int NOT NULL AUTO_INCREMENT,
  `id_conversacion` int NOT NULL,
  `tiempo_primera_respuesta` int DEFAULT NULL COMMENT 'Tiempo en segundos hasta primera respuesta del admin',
  `tiempo_total_conversacion` int DEFAULT NULL COMMENT 'DuraciÃ³n total en segundos',
  `total_mensajes` int DEFAULT '0',
  `mensajes_usuario` int DEFAULT '0',
  `mensajes_admin` int DEFAULT '0',
  `calificacion` tinyint(1) DEFAULT NULL COMMENT 'CalificaciÃ³n de 1-5 estrellas',
  `comentario_calificacion` text COLLATE utf8mb4_general_ci,
  `fecha_calificacion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_estadistica`),
  KEY `id_conversacion` (`id_conversacion`),
  KEY `idx_calificacion` (`calificacion`),
  CONSTRAINT `chat_estadisticas_ibfk_1` FOREIGN KEY (`id_conversacion`) REFERENCES `chat_conversaciones` (`id_conversacion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='EstadÃ­sticas y mÃ©tricas del chat';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `chat_estadisticas` WRITE;
INSERT INTO `chat_estadisticas` VALUES (34,34,NULL,NULL,0,0,0,NULL,NULL,NULL),(35,35,NULL,NULL,0,0,0,NULL,NULL,NULL),(40,40,NULL,NULL,0,0,0,NULL,NULL,NULL),(41,41,NULL,NULL,0,0,0,NULL,NULL,NULL),(43,43,NULL,NULL,0,0,0,NULL,NULL,NULL);
UNLOCK TABLES;


DROP TABLE IF EXISTS `chat_mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_mensajes` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `id_conversacion` int NOT NULL,
  `tipo_remitente` enum('invitado','alumno','profesor','admin') COLLATE utf8mb4_general_ci NOT NULL,
  `id_remitente` int DEFAULT NULL COMMENT 'NULL para invitados, id del usuario para loggeados',
  `nombre_remitente` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `leido` tinyint(1) DEFAULT '0',
  `leido_por_admin` tinyint(1) DEFAULT '0',
  `leido_por_usuario` tinyint(1) DEFAULT '0',
  `archivo_adjunto` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ruta del archivo adjunto (imagen o PDF)',
  `tipo_archivo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Tipo de archivo: image, pdf',
  PRIMARY KEY (`id_mensaje`),
  KEY `idx_conversacion` (`id_conversacion`),
  KEY `idx_leido` (`leido`),
  KEY `idx_fecha_envio` (`fecha_envio`),
  KEY `idx_tipo_remitente` (`tipo_remitente`),
  CONSTRAINT `chat_mensajes_ibfk_1` FOREIGN KEY (`id_conversacion`) REFERENCES `chat_conversaciones` (`id_conversacion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=319 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Mensajes del chat de soporte';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `chat_mensajes` WRITE;
INSERT INTO `chat_mensajes` VALUES (268,34,'profesor',2,'Bautista Bareiro','hola','2025-11-06 12:04:03',1,1,0,NULL,NULL),(269,34,'profesor',2,'Bautista Bareiro','hola','2025-11-06 12:29:49',1,1,0,NULL,NULL),(270,34,'profesor',2,'Bautista Bareiro','hola','2025-11-06 13:03:23',1,1,0,NULL,NULL),(271,34,'admin',NULL,'Eduardo Mendez','hola bareiro','2025-11-06 13:04:04',1,0,1,NULL,NULL),(272,34,'admin',NULL,'Eduardo Mendez','bareiro','2025-11-06 13:04:12',1,0,1,NULL,NULL),(273,35,'alumno',20,'Ernesto Suarez','hola soporte','2025-11-06 13:29:35',1,1,0,NULL,NULL),(274,35,'alumno',20,'Ernesto Suarez','hola soporte','2025-11-06 13:35:55',1,1,0,NULL,NULL),(283,40,'alumno',29,'Felipe Juarez','Hola soporte','2025-11-14 02:27:14',1,1,0,NULL,NULL),(284,41,'alumno',33,'Ale Bogado','Hola, me quiero inscribir en chino mandarin base','2025-11-18 03:56:02',1,1,0,NULL,NULL),(285,41,'admin',NULL,'Admin','hola alumno, inscrito','2025-11-18 03:56:51',1,0,1,NULL,NULL),(300,43,'alumno',35,'Ignacio Varga','quiero inscribirme en los cursos de ingles base, y frances.','2025-11-19 17:16:34',1,1,0,NULL,NULL),(301,43,'admin',NULL,'Admin','realizado.','2025-11-19 17:17:51',1,0,1,NULL,NULL),(302,43,'admin',NULL,'Admin','debe pagar la matricula y el mes de marzo.','2025-11-19 17:18:30',1,0,1,NULL,NULL),(303,43,'alumno',35,'Ignacio Varga','pague mediante transferencia.','2025-11-19 17:18:47',1,1,0,NULL,NULL),(304,43,'alumno',35,'Ignacio Varga','bien alumno, puede descargar sus comprobantes de pago haciendo click sobre el mes en la seccion \"mis pagos\".','2025-11-19 17:22:39',1,1,0,NULL,NULL),(305,43,'admin',NULL,'Admin','bien alumno, puede descargar sus comprobantes de pago haciendo click sobre el mes en la seccion \"mis pagos\".','2025-11-19 17:22:50',1,0,1,NULL,NULL),(313,43,'alumno',47,'Ignacio Varga','[Archivo adjunto: Comprobante-de-pago-IGJ.jpg]','2025-11-19 21:05:01',1,1,0,'/uploads/chat-files/Comprobante-de-pago-IGJ-1763586301401-156598786.jpg','image'),(316,43,'admin',NULL,'Eduardo Mendez','[Archivo adjunto: 32137943_DA9Ggae0h2act5cJbrLg8qQPAsSoNYftebOHnn-90nc.jpg]','2025-11-20 06:10:12',0,0,0,'/uploads/chat-files/32137943_DA9Ggae0h2act5cJbrLg8qQPAsSoNYftebOHnn-90nc-1763619011774-953303568.jpg','image');
UNLOCK TABLES;


DROP TABLE IF EXISTS `classroom_conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classroom_conversaciones` (
  `id_conversacion` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_alumno_usuario` int NOT NULL COMMENT 'id_usuario del alumno (desde tabla Usuarios)',
  `id_alumno_usuario2` int DEFAULT NULL,
  `id_profesor_usuario` int DEFAULT NULL COMMENT 'id_usuario del profesor (NULL si es chat entre alumnos)',
  `ultimo_mensaje` text COLLATE utf8mb4_unicode_ci,
  `fecha_ultimo_mensaje` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `mensajes_no_leidos_alumno` int DEFAULT '0' COMMENT 'Mensajes sin leer por el alumno',
  `mensajes_no_leidos_profesor` int DEFAULT '0' COMMENT 'Mensajes sin leer por el profesor',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_conversacion`),
  UNIQUE KEY `unique_conversacion` (`id_alumno_usuario`,`id_alumno_usuario2`,`id_curso`,`id_profesor_usuario`),
  KEY `idx_curso` (`id_curso`),
  KEY `idx_alumno` (`id_alumno_usuario`),
  KEY `idx_profesor` (`id_profesor_usuario`),
  KEY `idx_fecha` (`fecha_ultimo_mensaje`),
  KEY `id_alumno_usuario2` (`id_alumno_usuario2`),
  CONSTRAINT `classroom_conversaciones_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `classroom_conversaciones_ibfk_2` FOREIGN KEY (`id_alumno_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `classroom_conversaciones_ibfk_3` FOREIGN KEY (`id_profesor_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `classroom_conversaciones_ibfk_4` FOREIGN KEY (`id_alumno_usuario2`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Conversaciones entre alumnos y profesores por curso en Classroom';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `classroom_conversaciones` WRITE;
INSERT INTO `classroom_conversaciones` VALUES (1,1,4,NULL,2,'hola profesor','2025-11-04 14:29:42',0,0,'2025-11-04 13:53:04'),(2,1,9,NULL,2,NULL,'2025-11-04 13:54:33',0,0,'2025-11-04 13:54:33'),(3,1,6,NULL,2,NULL,'2025-11-04 13:54:33',0,0,'2025-11-04 13:54:33'),(4,1,5,NULL,2,NULL,'2025-11-04 13:54:34',0,0,'2025-11-04 13:54:34'),(5,1,8,NULL,2,'hola profesor','2025-11-04 14:28:48',0,1,'2025-11-04 13:54:34'),(6,4,4,NULL,12,NULL,'2025-11-04 14:03:59',0,0,'2025-11-04 14:03:59'),(9,1,4,8,NULL,'hola mica','2025-11-04 14:50:10',0,6,'2025-11-04 14:16:54'),(10,2,8,8,NULL,NULL,'2025-11-04 14:36:38',0,0,'2025-11-04 14:23:15'),(11,1,8,8,NULL,'hola','2025-11-04 14:36:38',0,1,'2025-11-04 14:23:22'),(12,2,8,NULL,3,'hola','2025-11-04 14:50:55',0,1,'2025-11-04 14:23:25'),(13,2,8,9,NULL,'hola','2025-11-04 14:42:29',0,1,'2025-11-04 14:42:14'),(14,1,8,5,NULL,'hola','2025-11-04 14:42:25',0,1,'2025-11-04 14:42:24');
UNLOCK TABLES;


DROP TABLE IF EXISTS `classroom_estadisticas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classroom_estadisticas` (
  `id_estadistica` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `total_conversaciones` int DEFAULT '0',
  `total_mensajes` int DEFAULT '0',
  `mensajes_hoy` int DEFAULT '0',
  `promedio_tiempo_respuesta_profesor` int DEFAULT '0' COMMENT 'En minutos',
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estadistica`),
  UNIQUE KEY `unique_curso` (`id_curso`),
  CONSTRAINT `classroom_estadisticas_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='EstadÃ­sticas del sistema de chat de Classroom por curso';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `classroom_estadisticas` WRITE;
INSERT INTO `classroom_estadisticas` VALUES (1,1,8,17,17,0,'2025-11-04 14:50:10'),(2,5,0,0,0,0,'2025-11-04 12:08:57'),(3,2,3,2,2,0,'2025-11-04 14:50:55'),(4,3,0,0,0,0,'2025-11-04 12:08:57'),(5,4,1,0,0,0,'2025-11-04 14:03:59'),(6,7,0,0,0,0,'2025-11-04 12:08:57'),(7,6,0,0,0,0,'2025-11-04 12:08:57');
UNLOCK TABLES;


DROP TABLE IF EXISTS `classroom_mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classroom_mensajes` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `id_conversacion` int NOT NULL,
  `id_usuario_remitente` int NOT NULL COMMENT 'id_usuario del que envÃ­a (alumno o profesor)',
  `tipo_remitente` enum('alumno','profesor') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de usuario que envÃ­a',
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tiene_archivo` tinyint(1) DEFAULT '0',
  `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_mensaje`),
  KEY `idx_conversacion` (`id_conversacion`),
  KEY `idx_remitente` (`id_usuario_remitente`),
  KEY `idx_fecha` (`fecha_envio`),
  KEY `idx_leido` (`leido`),
  CONSTRAINT `classroom_mensajes_ibfk_1` FOREIGN KEY (`id_conversacion`) REFERENCES `classroom_conversaciones` (`id_conversacion`) ON DELETE CASCADE,
  CONSTRAINT `classroom_mensajes_ibfk_2` FOREIGN KEY (`id_usuario_remitente`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mensajes del chat de Classroom entre alumnos y profesores';
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `classroom_mensajes` WRITE;
INSERT INTO `classroom_mensajes` VALUES (1,1,2,'profesor','prueba para micaela gomez',0,NULL,NULL,1,'2025-11-04 13:54:40','2025-11-04 13:59:05'),(2,1,4,'alumno','hola profesor',0,NULL,NULL,1,'2025-11-04 14:09:05','2025-11-04 14:09:29'),(3,1,2,'profesor','hola gomez',0,NULL,NULL,1,'2025-11-04 14:10:20','2025-11-04 14:10:39'),(4,1,2,'profesor','hola gomez',0,NULL,NULL,1,'2025-11-04 14:14:35','2025-11-04 14:14:46'),(5,1,2,'profesor','hola',0,NULL,NULL,1,'2025-11-04 14:14:41','2025-11-04 14:14:46'),(6,1,2,'profesor','gomez',0,NULL,NULL,1,'2025-11-04 14:14:42','2025-11-04 14:14:46'),(7,1,4,'alumno','hola profesor',0,NULL,NULL,1,'2025-11-04 14:14:56','2025-11-04 14:29:42'),(8,1,4,'alumno','hola profesor',0,NULL,NULL,1,'2025-11-04 14:14:59','2025-11-04 14:29:42'),(9,9,4,'alumno','hola hernan',0,NULL,NULL,0,'2025-11-04 14:17:20',NULL),(10,11,8,'alumno','hola',0,NULL,NULL,0,'2025-11-04 14:28:38',NULL),(11,5,8,'alumno','hola profesor',0,NULL,NULL,0,'2025-11-04 14:28:48',NULL),(12,14,8,'alumno','hola',0,NULL,NULL,0,'2025-11-04 14:42:25',NULL),(13,13,8,'alumno','hola',0,NULL,NULL,0,'2025-11-04 14:42:29',NULL),(14,9,8,'alumno','hola micaela',0,NULL,NULL,0,'2025-11-04 14:49:12',NULL),(15,9,8,'alumno','hola',0,NULL,NULL,0,'2025-11-04 14:49:53',NULL),(16,9,4,'alumno','hola hernan',0,NULL,NULL,0,'2025-11-04 14:49:58',NULL),(17,9,4,'alumno','hola hernan',0,NULL,NULL,0,'2025-11-04 14:50:03',NULL),(18,9,8,'alumno','hola mica',0,NULL,NULL,0,'2025-11-04 14:50:10',NULL),(19,12,8,'alumno','hola',0,NULL,NULL,0,'2025-11-04 14:50:55',NULL);
UNLOCK TABLES;


DROP TABLE IF EXISTS `comentarios_anuncios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_anuncios` (
  `id_comentario` int NOT NULL AUTO_INCREMENT,
  `id_anuncio` int NOT NULL,
  `id_usuario` int NOT NULL,
  `tipo_usuario` enum('profesor','alumno') COLLATE utf8mb4_general_ci NOT NULL,
  `contenido` text COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comentario`),
  KEY `idx_anuncio` (`id_anuncio`),
  KEY `idx_fecha` (`fecha_creacion`),
  CONSTRAINT `comentarios_anuncios_ibfk_1` FOREIGN KEY (`id_anuncio`) REFERENCES `anuncios` (`id_anuncio`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `comentarios_anuncios` WRITE;
INSERT INTO `comentarios_anuncios` VALUES (1,2,4,'alumno','buena prueba','2025-11-02 16:45:54'),(2,2,4,'alumno','probando otra vez notificaciones','2025-11-02 16:56:51'),(3,8,4,'alumno','hola profe','2025-11-02 17:16:13'),(5,9,4,'alumno','prueba.','2025-11-06 01:25:48'),(6,11,15,'alumno','bien profesora !','2025-11-06 02:22:17'),(7,11,4,'alumno','comentario','2025-11-06 09:43:16'),(8,13,4,'alumno','hola profe','2025-11-07 00:46:42'),(9,13,47,'alumno','profesor no entregue una tarea a tiempo puedo enviarla de todas formas?','2025-11-19 17:31:37'),(10,13,2,'profesor','Si Ignacio.','2025-11-19 17:31:58');
UNLOCK TABLES;


DROP TABLE IF EXISTS `conceptos_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conceptos_pago` (
  `id_concepto` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `monto_sugerido` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_concepto`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `conceptos_pago` WRITE;
INSERT INTO `conceptos_pago` VALUES (1,'Matricula',5000.00),(2,'Cuota Mensual',10000.00);
UNLOCK TABLES;


DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cursos` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nombre_curso` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_idioma` int DEFAULT NULL,
  `id_nivel` int DEFAULT NULL,
  `id_profesor` int DEFAULT NULL,
  `horario` varchar(100) COLLATE utf8mb4_general_ci DEFAULT 'Horario por definir',
  `cupo_maximo` int DEFAULT '30',
  `id_aula` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cuotas_habilitadas` json DEFAULT NULL COMMENT 'Cuotas disponibles para pago: null = todas habilitadas, JSON array = solo las especificadas. Ej: ["Matricula","Marzo","Abril"]',
  PRIMARY KEY (`id_curso`),
  KEY `id_idioma` (`id_idioma`),
  KEY `id_nivel` (`id_nivel`),
  KEY `id_profesor` (`id_profesor`),
  KEY `id_aula` (`id_aula`),
  KEY `idx_idioma_nivel` (`id_idioma`,`id_nivel`),
  CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`id_idioma`) REFERENCES `idiomas` (`id_idioma`),
  CONSTRAINT `cursos_ibfk_2` FOREIGN KEY (`id_nivel`) REFERENCES `niveles` (`id_nivel`),
  CONSTRAINT `cursos_ibfk_3` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`),
  CONSTRAINT `cursos_ibfk_4` FOREIGN KEY (`id_aula`) REFERENCES `aulas` (`id_aula`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `cursos` WRITE;
INSERT INTO `cursos` VALUES (1,'Ingles Base',1,1,2,'19:40',50,2,'2025-11-01 21:31:38','2025-11-19 17:24:04','[\"Matricula\", \"Marzo\", \"Abril\"]'),(2,'Frances Base',2,3,3,'20:00',40,1,'2025-11-01 21:31:38','2025-11-19 17:19:45','[\"Matricula\", \"Marzo\"]'),(3,'Aleman Base',3,4,10,'21:30',30,6,'2025-11-01 21:31:38','2025-11-19 17:20:04','[\"Matricula\", \"Marzo\"]'),(4,'Japones Basico',5,1,24,'20:30',30,4,'2025-11-02 05:36:25','2025-11-18 20:33:49','[\"Matricula\"]'),(5,'Ingles Intermedio',1,4,2,'18:30',15,4,'2025-11-02 17:48:21','2025-11-19 17:20:17','[\"Matricula\", \"Marzo\"]'),(6,'Italiano Base',6,3,2,'20:30',20,1,'2025-11-03 05:20:52','2025-11-19 17:20:39','[\"Matricula\", \"Marzo\"]'),(7,'Japones Intermedio',5,4,25,'17:40',20,1,'2025-11-04 01:27:23','2025-11-19 17:20:29','[\"Matricula\", \"Marzo\"]'),(8,'Chino Mandarin Base',7,1,39,'Lunes a Miercoles 18:00',50,5,'2025-11-13 04:01:30','2025-11-18 19:33:02','[\"Matricula\", \"Marzo\", \"Abril\"]'),(9,'Latin Base',8,1,40,'Jueves a Viernes 8:00 ',60,6,'2025-11-14 02:24:55','2025-11-18 23:35:57','[\"Matricula\", \"Marzo\", \"Abril\"]');
UNLOCK TABLES;


DROP TABLE IF EXISTS `encuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encuestas` (
  `id_encuesta` int NOT NULL AUTO_INCREMENT,
  `id_anuncio` int NOT NULL,
  `pregunta` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_encuesta`),
  KEY `id_anuncio` (`id_anuncio`),
  CONSTRAINT `encuestas_ibfk_1` FOREIGN KEY (`id_anuncio`) REFERENCES `anuncios` (`id_anuncio`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `encuestas` WRITE;
INSERT INTO `encuestas` VALUES (1,3,'Clases maÃ±ana','2025-11-02 14:51:03'),(2,6,'Clases maÃ±ana','2025-11-02 14:52:16'),(3,7,'Clases maÃ±ana si o si','2025-11-02 17:11:13'),(4,8,'si','2025-11-02 17:15:07'),(6,12,'titulo','2025-11-07 00:43:07'),(7,13,'si','2025-11-07 00:46:05');
UNLOCK TABLES;


DROP TABLE IF EXISTS `entregas_tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas_tareas` (
  `id_entrega` int NOT NULL AUTO_INCREMENT,
  `id_tarea` int NOT NULL,
  `id_alumno` int NOT NULL,
  `contenido` text COLLATE utf8mb4_general_ci,
  `archivo_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT CURRENT_TIMESTAMP,
  `calificacion` decimal(5,2) DEFAULT NULL,
  `comentario_profesor` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id_entrega`),
  KEY `id_tarea` (`id_tarea`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `entregas_tareas_ibfk_1` FOREIGN KEY (`id_tarea`) REFERENCES `tareas` (`id_tarea`) ON DELETE CASCADE,
  CONSTRAINT `entregas_tareas_ibfk_2` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `entregas_tareas` WRITE;
INSERT INTO `entregas_tareas` VALUES (1,4,4,'entrego tarea','uploads/sdas.jpg','2025-11-02 17:27:19',8.00,'buena tarea'),(2,4,15,'tarea entregada ',NULL,'2025-11-03 22:54:02',8.00,'bien'),(3,3,4,'entrego tarea',NULL,'2025-11-06 09:43:46',NULL,NULL),(4,6,47,'tarea entregada.','uploads/Tareas_Ignacio_Varga_19-11-2025.pdf','2025-11-19 17:36:33',6.00,'hay que mejorar la gramatica ignacio. '),(5,6,4,'entrego tarea','/uploads/tareas/Comprobante_000028_Ignacio_Varga-1763585355102-284921736.pdf','2025-11-19 20:49:18',NULL,NULL);
UNLOCK TABLES;


DROP TABLE IF EXISTS `eventos_calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_calendario` (
  `id_evento` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_profesor` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `tipo` enum('examen','clase_especial','feriado','reunion','otro') COLLATE utf8mb4_general_ci DEFAULT 'otro',
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `color` varchar(7) COLLATE utf8mb4_general_ci DEFAULT '#667eea',
  `notificar` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evento`),
  KEY `id_profesor` (`id_profesor`),
  KEY `idx_fecha` (`fecha_inicio`),
  KEY `idx_curso` (`id_curso`),
  CONSTRAINT `eventos_calendario_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `eventos_calendario_ibfk_2` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `eventos_calendario` WRITE;
UNLOCK TABLES;


DROP TABLE IF EXISTS `idiomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `idiomas` (
  `id_idioma` int NOT NULL AUTO_INCREMENT,
  `nombre_idioma` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_idioma`),
  UNIQUE KEY `nombre_idioma` (`nombre_idioma`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `idiomas` WRITE;
INSERT INTO `idiomas` VALUES (3,'Aleman'),(7,'Chino Mandarin'),(2,'Frances'),(1,'Ingles'),(6,'Italiano'),(5,'Japones'),(8,'Latin'),(4,'Portugues');
UNLOCK TABLES;


DROP TABLE IF EXISTS `inscripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones` (
  `id_inscripcion` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int DEFAULT NULL,
  `id_curso` int DEFAULT NULL,
  `fecha_inscripcion` date DEFAULT NULL,
  `estado` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `observaciones` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `unique_inscripcion_activa` (`id_alumno`,`id_curso`,`estado`),
  KEY `id_alumno` (`id_alumno`),
  KEY `id_curso` (`id_curso`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_inscripcion` (`fecha_inscripcion`),
  KEY `idx_alumno_estado` (`id_alumno`,`estado`),
  CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `inscripciones` WRITE;
INSERT INTO `inscripciones` VALUES (20,16,1,'2025-11-01','activo',NULL),(21,15,1,'2025-11-01','activo',NULL),(22,6,1,'2025-11-01','activo',NULL),(23,5,1,'2025-11-01','activo',NULL),(24,4,1,'2025-11-01','activo',NULL),(25,16,2,'2025-11-01','activo',NULL),(26,15,2,'2025-11-01','activo',NULL),(27,16,4,'2025-11-02','activo',NULL),(28,15,4,'2025-11-02','activo',NULL),(29,6,4,'2025-11-02','activo',NULL),(30,5,4,'2025-11-02','activo',NULL),(31,4,4,'2025-11-02','activo',NULL),(32,21,7,'2025-11-03','activo',NULL),(33,16,7,'2025-11-03','activo',NULL),(34,15,7,'2025-11-03','activo',NULL),(35,6,7,'2025-11-03','activo',NULL),(36,5,7,'2025-11-03','activo',NULL),(37,4,7,'2025-11-03','activo',NULL),(38,35,7,'2025-11-07','activo',NULL),(39,31,7,'2025-11-07','activo',NULL),(40,30,7,'2025-11-07','activo',NULL),(41,29,7,'2025-11-07','activo',NULL),(42,34,7,'2025-11-07','activo',NULL),(43,33,7,'2025-11-07','activo',NULL),(44,32,7,'2025-11-07','activo',NULL),(45,36,8,'2025-11-13','activo',NULL),(46,35,8,'2025-11-13','activo',NULL),(47,34,8,'2025-11-13','activo',NULL),(48,33,8,'2025-11-13','activo',NULL),(49,32,8,'2025-11-13','activo',NULL),(50,31,8,'2025-11-13','activo',NULL),(51,30,8,'2025-11-13','activo',NULL),(52,29,8,'2025-11-13','activo',NULL),(53,21,8,'2025-11-13','activo',NULL),(54,16,8,'2025-11-13','activo',NULL),(55,15,8,'2025-11-13','activo',NULL),(56,6,8,'2025-11-13','activo',NULL),(57,5,8,'2025-11-13','activo',NULL),(58,4,8,'2025-11-13','activo',NULL),(59,45,8,'2025-11-18','activo',NULL),(60,46,8,'2025-11-18','activo',NULL),(61,45,3,'2025-11-19','activo',NULL),(62,41,3,'2025-11-19','activo',NULL),(63,47,1,'2025-11-19','activo',NULL),(64,47,2,'2025-11-19','activo',NULL);
UNLOCK TABLES;


DROP TABLE IF EXISTS `medios_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medios_pago` (
  `id_medio_pago` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_medio_pago`),
  UNIQUE KEY `descripcion` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `medios_pago` WRITE;
INSERT INTO `medios_pago` VALUES (1,'Efectivo'),(3,'Tarjeta de CrÃ©dito'),(2,'Transferencia');
UNLOCK TABLES;


DROP TABLE IF EXISTS `niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles` (
  `id_nivel` int NOT NULL AUTO_INCREMENT,
  `id_idioma` int DEFAULT NULL,
  `descripcion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_nivel`),
  KEY `id_idioma` (`id_idioma`),
  CONSTRAINT `niveles_ibfk_1` FOREIGN KEY (`id_idioma`) REFERENCES `idiomas` (`id_idioma`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `niveles` WRITE;
INSERT INTO `niveles` VALUES (1,1,'A1'),(2,1,'B1'),(3,2,'A1'),(4,3,'A2');
UNLOCK TABLES;


DROP TABLE IF EXISTS `notas_calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas_calendario` (
  `id_nota` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_usuario` enum('alumno','profesor') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `titulo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contenido` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#FFD700',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_nota`),
  KEY `idx_usuario_fecha` (`id_usuario`,`fecha`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `notas_calendario` WRITE;
INSERT INTO `notas_calendario` VALUES (7,2,'profesor','2025-11-08','parcial','importante','#4ECDC4','2025-11-07 00:40:59');
UNLOCK TABLES;


DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_usuario` enum('profesor','alumno') COLLATE utf8mb4_general_ci NOT NULL,
  `tipo_notificacion` enum('entrega_tarea','nueva_inscripcion','comentario','calificacion','anuncio_importante','nueva_tarea','anuncio') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `id_referencia` int DEFAULT NULL COMMENT 'ID de la tarea, inscripciÃ³n, etc.',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_usuario` (`id_usuario`,`tipo_usuario`),
  KEY `idx_leida` (`leida`),
  KEY `idx_fecha` (`fecha_creacion`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `notificaciones` WRITE;
INSERT INTO `notificaciones` VALUES (1,2,'profesor','entrega_tarea','Nueva entrega recibida','Juan PÃ©rez ha entregado la tarea Prueba de tarea',NULL,1,1,'2025-11-02 16:22:29'),(2,2,'profesor','nueva_inscripcion','Nueva inscripcion','MarÃ­a GarcÃ­a se inscribio en Ingles Base 1',NULL,1,1,'2025-11-02 16:22:29'),(3,2,'profesor','anuncio_importante','Anuncio importante publicado','Se publico el anuncio: Cambio de horario en InglÃ©s Intermedio',NULL,1,1,'2025-11-02 16:30:18'),(4,2,'profesor','comentario','Nuevo comentario','Micaela Gomez comento en \"Anuncio de prueba Ingles Base con Enlace\"',NULL,1,2,'2025-11-02 16:56:51'),(5,16,'alumno','nueva_tarea','Nueva tarea asignada','tarea para ingles base - Ingles Base ','/tareas/4',0,4,'2025-11-02 17:15:29'),(6,15,'alumno','nueva_tarea','Nueva tarea asignada','tarea para ingles base - Ingles Base ','/tareas/4',1,4,'2025-11-02 17:15:29'),(7,6,'alumno','nueva_tarea','Nueva tarea asignada','tarea para ingles base - Ingles Base ','/tareas/4',0,4,'2025-11-02 17:15:29'),(8,5,'alumno','nueva_tarea','Nueva tarea asignada','tarea para ingles base - Ingles Base ','/tareas/4',0,4,'2025-11-02 17:15:29'),(9,4,'alumno','nueva_tarea','Nueva tarea asignada','tarea para ingles base - Ingles Base ','/tareas/4',1,4,'2025-11-02 17:15:29'),(10,2,'profesor','comentario','Nuevo comentario','Micaela Gomez comento en \"anuncio para los alumnos de ingles base\"',NULL,1,8,'2025-11-02 17:16:13'),(11,16,'alumno','anuncio','Nuevo anuncio','nueva prueba de notificacion anuncio - Ingles Base ','/anuncios/9',0,9,'2025-11-02 17:17:35'),(12,15,'alumno','anuncio','Nuevo anuncio','nueva prueba de notificacion anuncio - Ingles Base ','/anuncios/9',1,9,'2025-11-02 17:17:35'),(13,6,'alumno','anuncio','Nuevo anuncio','nueva prueba de notificacion anuncio - Ingles Base ','/anuncios/9',0,9,'2025-11-02 17:17:35'),(14,5,'alumno','anuncio','Nuevo anuncio','nueva prueba de notificacion anuncio - Ingles Base ','/anuncios/9',0,9,'2025-11-02 17:17:35'),(15,4,'alumno','anuncio','Nuevo anuncio','nueva prueba de notificacion anuncio - Ingles Base ','/anuncios/9',1,9,'2025-11-02 17:17:35'),(16,2,'profesor','entrega_tarea','Nueva entrega recibida','Micaela Gomez ha entregado la tarea \"tarea para ingles base\" del curso Ingles Base ','/entregas/4',1,4,'2025-11-02 17:27:19'),(17,4,'alumno','calificacion','Nueva calificacion','Tu entrega de \"tarea para ingles base\" ha sido calificada: 8','/tareas/4',1,4,'2025-11-02 17:49:24'),(18,25,'profesor','nueva_inscripcion','Nueva inscripcion','Matias Rodriguez se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(19,25,'profesor','nueva_inscripcion','Nueva inscripcion','Gabriela Jimenez se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(20,25,'profesor','nueva_inscripcion','Nueva inscripcion','Hernan Toledo se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(21,25,'profesor','nueva_inscripcion','Nueva inscripcion','Paula Martinez se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(22,25,'profesor','nueva_inscripcion','Nueva inscripcion','Jorge Sanchez se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(23,25,'profesor','nueva_inscripcion','Nueva inscripcion','Micaela Gomez se inscribio en Japones Intermedio','/cursos/7',1,7,'2025-11-03 22:27:47'),(24,21,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',1,10,'2025-11-03 22:52:39'),(25,16,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',1,10,'2025-11-03 22:52:39'),(26,15,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',1,10,'2025-11-03 22:52:39'),(27,6,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',0,10,'2025-11-03 22:52:39'),(28,5,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',0,10,'2025-11-03 22:52:39'),(29,4,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio nipon intermedio - Japones Intermedio','/anuncios/10',1,10,'2025-11-03 22:52:39'),(30,25,'profesor','comentario','Nuevo comentario','Hernan Toledo comento en \"anuncio nipon intermedio\"',NULL,1,10,'2025-11-03 22:53:45'),(31,2,'profesor','entrega_tarea','Nueva entrega recibida','Hernan Toledo ha entregado la tarea \"tarea para ingles base\" del curso Ingles Base ','/entregas/4',1,4,'2025-11-03 22:54:02'),(32,2,'profesor','comentario','Nuevo comentario','Micaela Gomez comento en \"nueva prueba de notificacion anuncio\"',NULL,1,9,'2025-11-06 01:25:48'),(33,16,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio japones ! - Japones Basico','/anuncios/11',0,11,'2025-11-06 02:21:45'),(34,15,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio japones ! - Japones Basico','/anuncios/11',0,11,'2025-11-06 02:21:45'),(35,6,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio japones ! - Japones Basico','/anuncios/11',0,11,'2025-11-06 02:21:45'),(36,5,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio japones ! - Japones Basico','/anuncios/11',0,11,'2025-11-06 02:21:45'),(37,4,'alumno','anuncio_importante','âš ï¸ Anuncio Importante','anuncio japones ! - Japones Basico','/anuncios/11',1,11,'2025-11-06 02:21:45'),(38,24,'profesor','comentario','Nuevo comentario','Hernan Toledo comento en \"anuncio japones !\"',NULL,0,11,'2025-11-06 02:22:17'),(39,24,'profesor','comentario','Nuevo comentario','Micaela Gomez comentó en \"anuncio japones !\"',NULL,0,11,'2025-11-06 09:43:16'),(40,2,'profesor','entrega_tarea','Nueva entrega recibida','Micaela Gomez ha entregado la tarea \"Prueba de tarea para ingles base\" del curso Ingles Base ','/entregas/3',1,3,'2025-11-06 09:43:46'),(41,25,'profesor','nueva_inscripcion','Nueva inscripción','Hernan Jimenez se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 00:34:34'),(42,25,'profesor','nueva_inscripcion','Nueva inscripción','Gerardo Kustin se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 00:34:34'),(43,25,'profesor','nueva_inscripcion','Nueva inscripción','Roberto Basualdo se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 00:34:34'),(44,25,'profesor','nueva_inscripcion','Nueva inscripción','Jose Salles se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 00:34:34'),(45,15,'alumno','calificacion','Nueva calificación','Tu entrega de \"tarea para ingles base\" ha sido calificada: 8','/tareas/4',0,4,'2025-11-07 00:40:37'),(46,16,'alumno','anuncio_importante','️ Anuncio Importante','titulo - Ingles Base','/anuncios/13',0,13,'2025-11-07 00:46:05'),(47,15,'alumno','anuncio_importante','️ Anuncio Importante','titulo - Ingles Base','/anuncios/13',0,13,'2025-11-07 00:46:05'),(48,6,'alumno','anuncio_importante','️ Anuncio Importante','titulo - Ingles Base','/anuncios/13',0,13,'2025-11-07 00:46:05'),(49,5,'alumno','anuncio_importante','️ Anuncio Importante','titulo - Ingles Base','/anuncios/13',0,13,'2025-11-07 00:46:05'),(50,4,'alumno','anuncio_importante','️ Anuncio Importante','titulo - Ingles Base','/anuncios/13',1,13,'2025-11-07 00:46:05'),(51,2,'profesor','comentario','Nuevo comentario','Micaela Gomez comentó en \"titulo\"',NULL,1,13,'2025-11-07 00:46:42'),(52,25,'profesor','nueva_inscripcion','Nueva inscripción','Gabriel Lopez se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 21:07:51'),(53,25,'profesor','nueva_inscripcion','Nueva inscripción','Ramiro Salvatore se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 21:07:51'),(54,25,'profesor','nueva_inscripcion','Nueva inscripción','Ernesto Suarez se inscribió en Japones Intermedio','/cursos/7',0,7,'2025-11-07 21:07:51'),(55,38,'profesor','nueva_inscripcion','Nueva inscripción','Josefina Sauce se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(56,38,'profesor','nueva_inscripcion','Nueva inscripción','Hernan Jimenez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(57,38,'profesor','nueva_inscripcion','Nueva inscripción','Gabriel Lopez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(58,38,'profesor','nueva_inscripcion','Nueva inscripción','Ramiro Salvatore se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(59,38,'profesor','nueva_inscripcion','Nueva inscripción','Ernesto Suarez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(60,38,'profesor','nueva_inscripcion','Nueva inscripción','Gerardo Kustin se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(61,38,'profesor','nueva_inscripcion','Nueva inscripción','Roberto Basualdo se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(62,38,'profesor','nueva_inscripcion','Nueva inscripción','Jose Salles se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(63,38,'profesor','nueva_inscripcion','Nueva inscripción','Matias Rodriguez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(64,38,'profesor','nueva_inscripcion','Nueva inscripción','Gabriela Jimenez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(65,38,'profesor','nueva_inscripcion','Nueva inscripción','Hernan Toledo se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(66,38,'profesor','nueva_inscripcion','Nueva inscripción','Paula Martinez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(67,38,'profesor','nueva_inscripcion','Nueva inscripción','Jorge Sanchez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(68,38,'profesor','nueva_inscripcion','Nueva inscripción','Micaela Gomez se inscribió en Chino Mandarin Base','/cursos/8',1,8,'2025-11-13 04:02:10'),(69,39,'profesor','nueva_inscripcion','Nueva inscripción','Ale Bogado se inscribió en Chino Mandarin Base','/cursos/8',0,8,'2025-11-18 03:57:08'),(70,16,'alumno','nueva_tarea','Nueva tarea asignada','Tarea prueba - Ingles Base','/tareas/5',0,5,'2025-11-18 04:00:43'),(71,15,'alumno','nueva_tarea','Nueva tarea asignada','Tarea prueba - Ingles Base','/tareas/5',0,5,'2025-11-18 04:00:43'),(72,6,'alumno','nueva_tarea','Nueva tarea asignada','Tarea prueba - Ingles Base','/tareas/5',0,5,'2025-11-18 04:00:43'),(73,5,'alumno','nueva_tarea','Nueva tarea asignada','Tarea prueba - Ingles Base','/tareas/5',0,5,'2025-11-18 04:00:43'),(74,4,'alumno','nueva_tarea','Nueva tarea asignada','Tarea prueba - Ingles Base','/tareas/5',1,5,'2025-11-18 04:00:43'),(75,39,'profesor','nueva_inscripcion','Nueva inscripción','Cami Sankara4President se inscribió en Chino Mandarin Base','/cursos/8',0,8,'2025-11-18 14:29:53'),(76,10,'profesor','nueva_inscripcion','Nueva inscripción','Ale Bogado se inscribió en Aleman Base','/cursos/3',0,3,'2025-11-19 06:21:59'),(77,10,'profesor','nueva_inscripcion','Nueva inscripción','Felipe Juarez se inscribió en Aleman Base','/cursos/3',0,3,'2025-11-19 06:21:59'),(78,2,'profesor','nueva_inscripcion','Nueva inscripción','Ignacio Varga se inscribió en Ingles Base','/cursos/1',1,1,'2025-11-19 17:17:29'),(79,3,'profesor','nueva_inscripcion','Nueva inscripción','Ignacio Varga se inscribió en Frances Base','/cursos/2',0,2,'2025-11-19 17:17:40'),(80,2,'profesor','comentario','Nuevo comentario','Ignacio Varga comentó en \"titulo\"',NULL,1,13,'2025-11-19 17:31:37'),(81,4,'alumno','comentario','Respuesta del profesor','El profesor comentó en \"titulo\"',NULL,1,13,'2025-11-19 17:31:58'),(82,47,'alumno','comentario','Respuesta del profesor','El profesor comentó en \"titulo\"',NULL,1,13,'2025-11-19 17:31:58'),(83,16,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',0,6,'2025-11-19 17:35:13'),(84,15,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',0,6,'2025-11-19 17:35:13'),(85,6,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',0,6,'2025-11-19 17:35:13'),(86,5,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',0,6,'2025-11-19 17:35:13'),(87,4,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',1,6,'2025-11-19 17:35:13'),(88,47,'alumno','nueva_tarea','Nueva tarea asignada','tarea para los alumnos de ingles base - Ingles Base','/tareas/6',1,6,'2025-11-19 17:35:13'),(89,2,'profesor','entrega_tarea','Nueva entrega recibida','Ignacio Varga ha entregado la tarea \"tarea para los alumnos de ingles base\" del curso Ingles Base','/entregas/6',1,6,'2025-11-19 17:36:33'),(90,47,'alumno','calificacion','Nueva calificación','Tu entrega de \"tarea para los alumnos de ingles base\" ha sido calificada: 6','/tareas/6',1,6,'2025-11-19 17:37:28'),(91,2,'profesor','entrega_tarea','Nueva entrega recibida','Micaela Gomez ha entregado la tarea \"tarea para los alumnos de ingles base\" del curso Ingles Base','/entregas/6',1,6,'2025-11-19 20:49:18');
UNLOCK TABLES;


DROP TABLE IF EXISTS `opciones_encuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `opciones_encuesta` (
  `id_opcion` int NOT NULL AUTO_INCREMENT,
  `id_encuesta` int NOT NULL,
  `texto` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `votos` int DEFAULT '0',
  PRIMARY KEY (`id_opcion`),
  KEY `id_encuesta` (`id_encuesta`),
  CONSTRAINT `opciones_encuesta_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuestas` (`id_encuesta`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `opciones_encuesta` WRITE;
INSERT INTO `opciones_encuesta` VALUES (1,1,'si',1),(2,1,'no',0),(3,2,'si',0),(4,2,'no',0),(5,2,'tal vez',0),(6,3,'no',0),(7,3,'ok',0),(8,4,'no',0),(9,4,'no se',1),(12,6,'si',0),(13,6,'no',0),(14,6,'tal vez',0),(15,7,'no',0),(16,7,'si',1);
UNLOCK TABLES;


DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_alumno` int DEFAULT NULL,
  `id_curso` int DEFAULT NULL,
  `id_concepto` int DEFAULT NULL,
  `id_medio_pago` int DEFAULT NULL,
  `id_administrativo` int DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `periodo` varchar(7) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Formato: YYYY-MM para identificar mes de la cuota',
  `detalle_pago` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mes_cuota` enum('Matricula','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado_pago` enum('en_proceso','pagado','anulado') COLLATE utf8mb4_general_ci DEFAULT 'en_proceso',
  `archivado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id_pago`),
  KEY `id_alumno` (`id_alumno`),
  KEY `id_concepto` (`id_concepto`),
  KEY `id_medio_pago` (`id_medio_pago`),
  KEY `id_administrativo` (`id_administrativo`),
  KEY `idx_pagos_periodo` (`periodo`),
  KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  KEY `idx_alumno_periodo` (`id_alumno`,`periodo`),
  KEY `id_curso` (`id_curso`),
  KEY `idx_archivado` (`archivado`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`),
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`id_concepto`) REFERENCES `conceptos_pago` (`id_concepto`),
  CONSTRAINT `pagos_ibfk_3` FOREIGN KEY (`id_medio_pago`) REFERENCES `medios_pago` (`id_medio_pago`),
  CONSTRAINT `pagos_ibfk_4` FOREIGN KEY (`id_administrativo`) REFERENCES `administrativos` (`id_administrativo`),
  CONSTRAINT `pagos_ibfk_5` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `pagos` WRITE;
INSERT INTO `pagos` VALUES (1,4,4,1,1,NULL,15000.00,'2025-11-08','2025-02','Matrícula - Japones A1','Matricula',NULL,'anulado',1),(2,31,7,1,1,NULL,15000.00,'2025-11-08','2025-02','Matrícula - Japones A2','Matricula',NULL,'anulado',1),(3,4,7,1,1,NULL,15000.00,'2025-11-11','2025-02','Matrícula - Japones A2','Matricula',NULL,'anulado',1),(4,4,7,2,1,NULL,15000.00,'2025-11-14','2025-03','Cuota Marzo - Japones A2','Marzo',NULL,'anulado',1),(5,29,8,1,1,NULL,15000.00,'2025-11-14','2025-02','Matrícula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(6,29,7,2,2,NULL,15000.00,NULL,'2025-03','Cuota Marzo - Japones A2','Marzo',NULL,'anulado',1),(7,4,8,1,1,NULL,15000.00,'2025-11-14','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(8,15,1,2,1,NULL,15000.00,'2025-11-15','2025-03','Cuota Marzo - Ingles A1','Marzo',NULL,'anulado',1),(9,30,8,1,1,NULL,15000.00,'2025-11-15','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(12,46,8,2,2,NULL,50000.00,'2025-11-18','2025-03','Cuota Marzo - Chino Mandarin A1','Marzo',NULL,'anulado',1),(13,46,8,2,1,NULL,40000.00,'2025-11-18','2025-04','Cuota Abril - Chino Mandarin A1','Abril',NULL,'anulado',1),(14,4,8,1,1,NULL,15000.00,NULL,'2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(15,4,8,1,1,NULL,15000.00,'2025-11-18','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(16,46,8,1,1,NULL,15000.00,'2025-11-18','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(17,46,8,2,1,NULL,20000.00,'2025-11-18','2025-03','Cuota Marzo - Chino Mandarin A1','Marzo',NULL,'anulado',1),(18,46,8,2,2,NULL,300000.00,'2025-11-18','2025-04','Cuota Abril - Chino Mandarin A1','Abril',NULL,'anulado',1),(19,4,8,1,1,NULL,15000.00,'2025-11-18','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'anulado',1),(20,4,8,2,1,NULL,15000.00,'2025-11-18','2025-03','Cuota Marzo - Chino Mandarin A1','Marzo',NULL,'anulado',1),(22,46,8,1,1,NULL,15000.00,'2025-11-19','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'pagado',0),(24,4,8,1,1,NULL,15000.00,'2025-11-19','2025-02','Matricula - Chino Mandarin A1','Matricula',NULL,'pagado',0),(25,4,8,2,2,NULL,30000.00,'2025-11-19','2025-03','Cuota Marzo - Chino Mandarin A1','Marzo',NULL,'pagado',0),(26,47,1,1,2,NULL,30000.00,'2025-11-19','2025-02','Matricula - Ingles A1','Matricula',NULL,'pagado',0),(27,47,1,2,2,NULL,50000.00,'2025-11-19','2025-03','Cuota Marzo - Ingles A1','Marzo',NULL,'pagado',0),(28,47,2,1,2,NULL,30000.00,'2025-11-19','2025-02','Matricula - Frances A1','Matricula',NULL,'pagado',0),(29,47,2,2,2,NULL,50000.00,'2025-11-19','2025-03','Cuota Marzo - Frances A1','Marzo',NULL,'pagado',0);
UNLOCK TABLES;


DROP TABLE IF EXISTS `perfiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perfiles` (
  `id_perfil` int NOT NULL AUTO_INCREMENT,
  `nombre_perfil` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_perfil`),
  UNIQUE KEY `nombre_perfil` (`nombre_perfil`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `perfiles` WRITE;
INSERT INTO `perfiles` VALUES (1,'admin'),(3,'alumno'),(2,'profesor');
UNLOCK TABLES;


DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mail` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `biografia` text COLLATE utf8mb4_general_ci,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `mail` (`mail`),
  KEY `idx_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `personas` WRITE;
INSERT INTO `personas` VALUES (1,'Eduardo','Mendoza','eduardo.mendoza@cemi.com','+543814463243','42445058','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(2,'Bautista','Bareiro','bautista.bareiro@cemi.com','11-4567-8902','35123789','2025-11-01 21:40:39','1955-01-25','Monteros','Hola alumnos. :)','/uploads/avatars/avatar-2-1762402329670-519210788.png'),(3,'Carlos','Lucena','carlos.lucena@cemi.com','11-4567-8902','33987456','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(4,'Micaela','Gomez','micaela.gomez@cemi.com','11-1439-3159','40123456','2025-11-01 21:40:39','1995-05-10','Lolamonte','Hola soy micaela estudiante de idiomas :)','/uploads/avatars/avatar-4-1762403115086-984387695.jpg'),(5,'Jorge','Sanchez','jorge.sanchez@cemi.com','11-5925-6186','38987654','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(6,'Paula','Martinez','paula.martinez@cemi.com','11-5212-6600','42555777','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(7,'Sofia','LÃ³pez','sofia.lopez@cemi.com',NULL,NULL,'2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(8,'Mario','Gonzalez','mario.gonzalez@cemi.com','11-4567-8903','37555888','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(9,'Fernanda','Cruz','fernanda.cruz@cemi.com','11-4567-8904','36444777','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(10,'Pablo','Garcia','pablo.garcia@cemi.com','11-4567-8905','34222333','2025-11-01 21:40:39',NULL,NULL,NULL,NULL),(15,'Hernan','Toledo','hernantoledo@gmail.com','+54 381 4463243','42444059','2025-11-01 21:45:50',NULL,NULL,NULL,NULL),(16,'Gabriela','Jimenez','gabrielajimenez@hotmail.com','+54 381 8865633','41010583','2025-11-01 21:50:34',NULL,NULL,NULL,NULL),(21,'Matias','Rodriguez','matiasrodriguez@yahoo.com.ar','+54 381 555444888','40889654','2025-11-02 10:54:10',NULL,NULL,NULL,NULL),(24,'Irina','Lopez','irinalopezcemi@cemi.com',NULL,'32889456','2025-11-02 11:45:48',NULL,NULL,NULL,'/uploads/avatars/avatar-12-1762406487943-430033344.webp'),(25,'Javier','Monteros','javiermonteros@educacion.com',NULL,NULL,'2025-11-03 22:21:19',NULL,NULL,NULL,NULL),(26,'Administrador','Cero','admincero@prueba.com','+543814463243','42445059','2025-11-04 00:30:22',NULL,NULL,'Hola alumnos.','/uploads/avatars/avatar-26-1763014885137-434432510.jpg'),(27,'Juan','Perez','juanperezadmin@cemi.com','+543816658975','501232321','2025-11-04 13:01:23',NULL,NULL,NULL,NULL),(28,'Eduardo','Mendez','administracioncemi@cemi.com','-','45668998','2025-11-06 04:47:37',NULL,NULL,NULL,NULL),(29,'Jose','Salles','josesalles@alumnocemi.com','38144687235','50669335','2025-11-06 10:27:56',NULL,NULL,NULL,NULL),(30,'Roberto','Basualdo','robertobasualdo@yandex.ru','381225698635','46888999','2025-11-06 11:47:00',NULL,NULL,NULL,NULL),(31,'Gerardo','Kustin','gerardokustin@yahoo.com.ar','381456789','56444888','2025-11-06 11:51:38',NULL,NULL,NULL,NULL),(32,'Ernesto','Suarez','ernestosuarez@yahoo.com.ar','3814567813','45888968','2025-11-06 13:29:03',NULL,NULL,NULL,'/uploads/avatars/avatar-20-1762435803556-853829783.jpg'),(33,'Ramiro','Salvatore','ramirosalvatore@gmail.com','38154841358','23569746','2025-11-06 14:13:13',NULL,NULL,NULL,NULL),(34,'Gabriel','Lopez','gabriellopezcemi@gmail.com','-','41569754','2025-11-07 00:26:39',NULL,NULL,NULL,NULL),(35,'Hernan','Jimenez','hernanjimenez@gmail.com','+543819779612','42578464','2025-11-07 00:28:17',NULL,NULL,NULL,NULL),(36,'Josefina','Sauce','josefinasauce@us.to','gato','45455456','2025-11-07 22:14:57',NULL,NULL,NULL,NULL),(37,'Ricardo','Paredes','ricardoparedes@us.to','-','123456987','2025-11-07 22:16:32',NULL,NULL,NULL,NULL),(39,'Xhuan','Pheng','xhuanpheng@gmail.com','3456469798','87543621','2025-11-13 06:48:40','1964-05-25','Beijing',NULL,'/uploads/avatars/avatar-27-1763016872944-809379683.jpg'),(40,'Giovanni','Molto','giovanniomoltio@italy.com','+65489478921','654987456','2025-11-13 06:55:53','1995-12-04','Italia',NULL,'/uploads/avatars/avatar-28-1763017029378-121116737.jpg'),(41,'Felipe','Juarez','felipejuarez@gmail.com','3814457898',NULL,'2025-11-14 00:46:40',NULL,NULL,NULL,NULL),(43,'Javier','Quinteros','javierquinteros@hotmail.com','3814568742','89654878','2025-11-14 04:39:09',NULL,NULL,NULL,NULL),(44,'Eduardo ','Mendoza','eduardo@cemi.co','7987564321','79874651','2025-11-15 07:07:10',NULL,NULL,NULL,NULL),(45,'Ale','Bogado','alebogado@gmail.com','27455649876','65787445','2025-11-18 03:53:00','1999-02-22','Buenos Aires','Hola',NULL),(46,'Cami','Sankara4President','anarkidiota@gmail.com','3814477718','11111111','2025-11-18 14:19:10',NULL,NULL,NULL,NULL),(47,'Ignacio','Varga','ignaciovarga@gmail.com','3816659874','46898785','2025-11-19 17:13:37',NULL,'Monteros','Hola','/uploads/avatars/avatar-35-1763574803045-67063939.jpg');
UNLOCK TABLES;


DROP TABLE IF EXISTS `profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores` (
  `id_profesor` int NOT NULL,
  `especialidad` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_persona` int DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `estado` enum('activo','inactivo','licencia') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  PRIMARY KEY (`id_profesor`),
  KEY `id_persona` (`id_persona`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_ingreso` (`fecha_ingreso`),
  CONSTRAINT `profesores_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `profesores_ibfk_2` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `profesores` WRITE;
INSERT INTO `profesores` VALUES (2,'Ingles',2,'2022-07-01','activo'),(3,'FrancÃ©s',3,'2024-09-26','activo'),(10,'Aleman',10,'2025-05-12','activo'),(24,'Japones',24,'2025-11-02','activo'),(25,'Japones Intermedio',25,'2025-11-03','activo'),(37,'Portugues Intermedio',37,'2025-11-07','activo'),(39,'Chino Mandarin',39,'2025-11-13','activo'),(40,'Italiano Avanzado',40,'2025-11-13','activo'),(44,'Ingles',44,'2025-11-15','activo');
UNLOCK TABLES;


DROP TABLE IF EXISTS `profesores_idiomas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores_idiomas` (
  `id_profesor` int NOT NULL,
  `id_idioma` int NOT NULL,
  PRIMARY KEY (`id_profesor`,`id_idioma`),
  KEY `id_idioma` (`id_idioma`),
  CONSTRAINT `profesores_idiomas_ibfk_1` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`),
  CONSTRAINT `profesores_idiomas_ibfk_2` FOREIGN KEY (`id_idioma`) REFERENCES `idiomas` (`id_idioma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `profesores_idiomas` WRITE;
INSERT INTO `profesores_idiomas` VALUES (2,1),(39,1),(3,2),(40,2),(10,3),(40,3),(44,3),(44,5),(44,6),(39,7),(40,7),(44,7);
UNLOCK TABLES;


DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id_tarea` int NOT NULL AUTO_INCREMENT,
  `id_curso` int NOT NULL,
  `id_profesor` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `requerimientos` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_limite` datetime NOT NULL,
  `link_url` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `archivo_adjunto` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `puntos` int DEFAULT '100',
  `notificar` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_tarea`),
  KEY `id_curso` (`id_curso`),
  KEY `id_profesor` (`id_profesor`),
  CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `cursos` (`id_curso`) ON DELETE CASCADE,
  CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`id_profesor`) REFERENCES `profesores` (`id_profesor`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `tareas` WRITE;
INSERT INTO `tareas` VALUES (3,1,2,'Prueba de tarea para ingles base','Tarea','que se haga la tarea','2025-11-02 17:08:55','2025-11-14 23:59:00',NULL,'http://localhost:3000/uploads/tareas/IMG_20220523_231821007_HDR-1762114135604-63483456.jpg',100,1),(4,1,2,'tarea para ingles base','ingles base','tarea','2025-11-02 17:15:29','2025-11-27 23:59:00',NULL,NULL,100,1),(5,1,2,'Tarea prueba','tarea','123','2025-11-18 04:00:43','2028-06-14 23:59:00',NULL,NULL,100,1),(6,1,2,'tarea para los alumnos de ingles base','deberan realizar un writing de 2000 palabras, adjuntar PDF.','enviar en pdf, evitar negrita y cursiva. ','2025-11-19 17:35:13','2025-12-10 23:59:00','https://www.youtube.com/watch?v=lXoOQbRQDKI',NULL,100,1);
UNLOCK TABLES;


DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_persona` int DEFAULT NULL,
  `id_perfil` int DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `password_plain` text COLLATE utf8mb4_general_ci COMMENT 'Contraseña en texto plano para que admins puedan visualizarla',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  KEY `id_persona` (`id_persona`),
  KEY `id_perfil` (`id_perfil`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_persona`) REFERENCES `personas` (`id_persona`),
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_perfil`) REFERENCES `perfiles` (`id_perfil`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES (1,'administracion','$2b$10$TkKMPUwwFjX1bVtjBrKjGeHuqoXdxJj4gK9VEUiAFqmnxwLw07nWy',1,1,'2025-11-01 21:44:52',NULL),(2,'profbareiro','$2b$10$TuW4fuKuM7O.GYFUtt2C..YFkfg1fSdOTpd.6y0rPwX.KMPMDAPJu',2,2,'2025-11-01 21:44:52',NULL),(3,'proflucena','$2b$10$ZQLdEWn88.TbU.0xPhZxS.n15hwC2IeBG/ib96rrlBwhonue0MnDG',3,2,'2025-11-01 21:44:52',NULL),(4,'micaelagomez','$2b$10$WCCQMtko.Skx93jm5F/kyO8pQJhNcAsMdvb5JaGD3OxgL5PHXnPiW',4,3,'2025-11-01 21:44:52',NULL),(5,'alumnojorge','alumnojorgecemi',5,3,'2025-11-01 21:44:52',NULL),(6,'alumnapaula','alumnapaulacemi',6,3,'2025-11-01 21:44:52',NULL),(7,'profgarcia','$2b$10$H8DXA.GeC.qmmqa8pR1bVeCa1zUFgAE2kw9G4sZKKenpSFkTqkSSi',10,2,'2025-11-01 21:44:52',NULL),(8,'alumnohernan','$2b$10$QtUxpXATLCPc9Po42lN5oevMtU6IYBW6PfcBS63IbWxh6oOjC1bVm',15,3,'2025-11-01 21:45:50',NULL),(9,'alumnagabriela','$2b$10$o6mewQLiLP0LirRVsfF3aOYayelpWL1BL1q/QqtX4zQn0GNXUf2zO',16,3,'2025-11-01 21:50:34',NULL),(10,'alumnomatias','$2b$10$.zKHS8o5VBT9SgGOZ3SZBOaSdbwCRafVvn/6YL4OgRpAuh/Rfa01u',21,3,'2025-11-02 10:54:10',NULL),(12,'profirina','$2b$10$SPyLwuPFlrUjgfYWLXZRUeDyDGXB6ZKwkooVyzH9mzKPnUpJ6dPNC',24,2,'2025-11-02 11:46:05',NULL),(13,'profesorjavier','$2b$10$EVbWNBQ8ttwDMpLKoM5WqOds8691hDxztGkAr6KXOJ1GY/2m/0W3a',25,2,'2025-11-03 22:21:37',NULL),(14,'admincero','$2b$10$UgKaUuD7ZUUNQErMo/nXbe9vP678Vqze.W43jo9LQqDr0H9bc6riy',26,1,'2025-11-04 00:30:22',NULL),(15,'adminjuan','$2b$10$.mlQpOdxPJN57GL.Q4gdYuijSdlBghU/YX8jsepGv0B/MHpTzaRuO',27,1,'2025-11-04 13:01:23',NULL),(16,'administrador','$2b$10$Qey5quvJe.XbSfVIUmyM7.2hIFe/SrSdPjQCZD2c27zqcdbRFjzJO',28,1,'2025-11-06 04:47:37',NULL),(17,'alumnojosecemi','$2b$10$kgOJV7dgBssf6JcGBAsuJ.NcFbYWOYBjs4Uqd1jPwmDuCez71SXi2',29,3,'2025-11-06 10:27:56',NULL),(18,'alumnoroberto','$2b$10$FxNbEbH3.qQu6SHLuWYuGuzPeW4xaHjizqe7OrD3bVKNfu19LZ2Py',30,3,'2025-11-06 11:47:00',NULL),(19,'alumnogerardo','$2b$10$JJT9vJF/a/ni3a.zkdHgcO0lMkmr9kKk8ZDkDDUdbJo/bX2ae.yY.',31,3,'2025-11-06 11:51:38',NULL),(20,'alumnoernesto','$2b$10$uX4/3CU5OSUr6YCKBUBtQOA9l.Ax3KbNc139dcDDLQGAcusKDb/Ne',32,3,'2025-11-06 13:29:03',NULL),(21,'ramirosalvatore','$2b$10$DPWt0PoVcT0OhITDDjI5cuy6ZZZvSMs7ocy6CgzLMkOtzNPE.9s2m',33,3,'2025-11-06 14:13:13',NULL),(22,'gabriellopez','$2b$10$fe31ClUq61zxuQ.b6P97Ou6h5r2P2zWinMfU5SptY/cGH13ABoE.W',34,3,'2025-11-07 00:26:39',NULL),(23,'hernanjimenez','$2b$10$GY4RXv7B7.SXzrRT4HyPtumnHWvaEaeQC8mECh5KqO/m7Rhv4QUvK',35,3,'2025-11-07 00:28:17',NULL),(24,'josefinasauce','$2b$10$BgKftDJbdCIKOtXbSUqHXu7jvKG/8A.tkxleE3IMBxe6sXy7zRs2u',36,3,'2025-11-07 22:15:25',NULL),(25,'ricardoparedesprofesor','$2b$10$lQOnM4wVYBlYwGdveV/kZummVEvAQbG9oO3DoKnokTSk6Kgd1tvO2',37,2,'2025-11-07 22:16:48',NULL),(27,'profxhuan','$2b$10$BxSRoADazNN4/QU6rLuCM.MXElxi/XSxTVZM4SY8pBxG68HATFwHq',39,2,'2025-11-13 06:49:01','xhuanphengcemi'),(28,'profgiovanni','$2b$10$BNE5h8Pkc6J5tdniM9I89uy9cLF4OZ0UCZ3bjmRR/YrcYnNddu/I.',40,2,'2025-11-13 06:56:12','giovannicemi'),(29,'felipecemi','$2b$10$rTZQNnVMbNhDSjZh6ZHxiuamtRPOWRFgJgijyODNF6Q9P4xa71406',41,3,'2025-11-14 00:46:59','12341234'),(31,'javierquinterosprueba','$2b$10$Pqrk2wsspY5imrfn1gGxyuu7dVoEWIfTTfNXIrlyMA4i.UifqeXCG',43,3,'2025-11-14 04:39:21','javouno'),(32,'eduardomend','$2b$10$1.3SsvQc5CktYCNaZ7RT2.W/Dn6UZ/moTmC4.AHHYy6Lw7ob7a25u',44,2,'2025-11-15 07:07:25','12341234'),(33,'alebogado','$2b$10$cnXJ5ieO0FuxvAtBtIQ/8e.GCSIppxuCuO.o8xDJgHkBrvPDXeufC',45,3,'2025-11-18 03:53:16','aleale'),(34,'gazekore','$2b$10$TenLLDOEjwHeT.XT/myheujtlyuiOUD1fdx7fTdt40GWooenEkn9u',46,3,'2025-11-18 14:19:10','Doritos2025'),(35,'ignaciovarga','$2b$10$UNlGENJh9klCcE.X8OS3K..SvQKKE8Bi43bhEWbd35pksfTROP7RC',47,3,'2025-11-19 17:13:37','ignacio23');
UNLOCK TABLES;


DROP TABLE IF EXISTS `vista_classroom_conversaciones`;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
 1 AS `id_conversacion`,
 1 AS `id_curso`,
 1 AS `nombre_curso`,
 1 AS `id_alumno_usuario`,
 1 AS `alumno_username`,
 1 AS `alumno_nombre_completo`,
 1 AS `id_profesor_usuario`,
 1 AS `profesor_username`,
 1 AS `profesor_nombre_completo`,
 1 AS `ultimo_mensaje`,
 1 AS `fecha_ultimo_mensaje`,
 1 AS `mensajes_no_leidos_alumno`,
 1 AS `mensajes_no_leidos_profesor`,
 1 AS `fecha_creacion`*/;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `vista_classroom_mensajes_recientes`;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
 1 AS `id_mensaje`,
 1 AS `id_conversacion`,
 1 AS `id_curso`,
 1 AS `nombre_curso`,
 1 AS `id_usuario_remitente`,
 1 AS `remitente_username`,
 1 AS `remitente_nombre`,
 1 AS `tipo_remitente`,
 1 AS `mensaje`,
 1 AS `leido`,
 1 AS `fecha_envio`*/;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `vista_inscripciones`;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
 1 AS `id_inscripcion`,
 1 AS `id_alumno`,
 1 AS `alumno`,
 1 AS `legajo`,
 1 AS `id_curso`,
 1 AS `nombre_curso`,
 1 AS `idioma`,
 1 AS `nivel`,
 1 AS `fecha_inscripcion`,
 1 AS `estado`,
 1 AS `profesor`*/;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `vista_pagos`;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
 1 AS `id_pago`,
 1 AS `id_alumno`,
 1 AS `alumno`,
 1 AS `legajo`,
 1 AS `concepto`,
 1 AS `monto`,
 1 AS `fecha_pago`,
 1 AS `periodo`,
 1 AS `fecha_vencimiento`,
 1 AS `estado_pago`,
 1 AS `medio_pago`,
 1 AS `administrativo`,
 1 AS `estado_visual`*/;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `vista_profesores`;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
 1 AS `id_profesor`,
 1 AS `nombre_completo`,
 1 AS `especialidad`,
 1 AS `idiomas`*/;
SET character_set_client = @saved_cs_client;


DROP TABLE IF EXISTS `votos_encuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votos_encuesta` (
  `id_voto` int NOT NULL AUTO_INCREMENT,
  `id_encuesta` int NOT NULL,
  `id_opcion` int NOT NULL,
  `id_alumno` int NOT NULL,
  `fecha_voto` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_voto`),
  UNIQUE KEY `unique_vote` (`id_encuesta`,`id_alumno`),
  KEY `id_opcion` (`id_opcion`),
  KEY `id_alumno` (`id_alumno`),
  CONSTRAINT `votos_encuesta_ibfk_1` FOREIGN KEY (`id_encuesta`) REFERENCES `encuestas` (`id_encuesta`) ON DELETE CASCADE,
  CONSTRAINT `votos_encuesta_ibfk_2` FOREIGN KEY (`id_opcion`) REFERENCES `opciones_encuesta` (`id_opcion`) ON DELETE CASCADE,
  CONSTRAINT `votos_encuesta_ibfk_3` FOREIGN KEY (`id_alumno`) REFERENCES `alumnos` (`id_alumno`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


LOCK TABLES `votos_encuesta` WRITE;
INSERT INTO `votos_encuesta` VALUES (1,1,1,4,'2025-11-02 16:41:20'),(2,4,9,4,'2025-11-06 09:46:44'),(4,7,16,4,'2025-11-07 00:46:36');
UNLOCK TABLES;


/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 VIEW `vista_classroom_conversaciones` AS select `cc`.`id_conversacion` AS `id_conversacion`,`cc`.`id_curso` AS `id_curso`,`c`.`nombre_curso` AS `nombre_curso`,`cc`.`id_alumno_usuario` AS `id_alumno_usuario`,`ua`.`username` AS `alumno_username`,concat(`pa`.`nombre`,' ',`pa`.`apellido`) AS `alumno_nombre_completo`,`cc`.`id_profesor_usuario` AS `id_profesor_usuario`,`up`.`username` AS `profesor_username`,concat(`pp`.`nombre`,' ',`pp`.`apellido`) AS `profesor_nombre_completo`,`cc`.`ultimo_mensaje` AS `ultimo_mensaje`,`cc`.`fecha_ultimo_mensaje` AS `fecha_ultimo_mensaje`,`cc`.`mensajes_no_leidos_alumno` AS `mensajes_no_leidos_alumno`,`cc`.`mensajes_no_leidos_profesor` AS `mensajes_no_leidos_profesor`,`cc`.`fecha_creacion` AS `fecha_creacion` from (((((`classroom_conversaciones` `cc` join `cursos` `c` on((`cc`.`id_curso` = `c`.`id_curso`))) join `usuarios` `ua` on((`cc`.`id_alumno_usuario` = `ua`.`id_usuario`))) join `personas` `pa` on((`ua`.`id_persona` = `pa`.`id_persona`))) join `usuarios` `up` on((`cc`.`id_profesor_usuario` = `up`.`id_usuario`))) join `personas` `pp` on((`up`.`id_persona` = `pp`.`id_persona`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;


/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 VIEW `vista_classroom_mensajes_recientes` AS select `cm`.`id_mensaje` AS `id_mensaje`,`cm`.`id_conversacion` AS `id_conversacion`,`cc`.`id_curso` AS `id_curso`,`c`.`nombre_curso` AS `nombre_curso`,`cm`.`id_usuario_remitente` AS `id_usuario_remitente`,`u`.`username` AS `remitente_username`,concat(`p`.`nombre`,' ',`p`.`apellido`) AS `remitente_nombre`,`cm`.`tipo_remitente` AS `tipo_remitente`,`cm`.`mensaje` AS `mensaje`,`cm`.`leido` AS `leido`,`cm`.`fecha_envio` AS `fecha_envio` from ((((`classroom_mensajes` `cm` join `classroom_conversaciones` `cc` on((`cm`.`id_conversacion` = `cc`.`id_conversacion`))) join `cursos` `c` on((`cc`.`id_curso` = `c`.`id_curso`))) join `usuarios` `u` on((`cm`.`id_usuario_remitente` = `u`.`id_usuario`))) join `personas` `p` on((`u`.`id_persona` = `p`.`id_persona`))) order by `cm`.`fecha_envio` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;


/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 VIEW `vista_inscripciones` AS select `i`.`id_inscripcion` AS `id_inscripcion`,`i`.`id_alumno` AS `id_alumno`,concat(`p`.`nombre`,' ',`p`.`apellido`) AS `alumno`,`a`.`legajo` AS `legajo`,`i`.`id_curso` AS `id_curso`,`c`.`nombre_curso` AS `nombre_curso`,`id`.`nombre_idioma` AS `idioma`,`n`.`descripcion` AS `nivel`,`i`.`fecha_inscripcion` AS `fecha_inscripcion`,`i`.`estado` AS `estado`,concat(`pp`.`nombre`,' ',`pp`.`apellido`) AS `profesor` from (((((((`inscripciones` `i` join `alumnos` `a` on((`a`.`id_alumno` = `i`.`id_alumno`))) join `personas` `p` on((`p`.`id_persona` = `a`.`id_persona`))) join `cursos` `c` on((`c`.`id_curso` = `i`.`id_curso`))) left join `idiomas` `id` on((`id`.`id_idioma` = `c`.`id_idioma`))) left join `niveles` `n` on((`n`.`id_nivel` = `c`.`id_nivel`))) left join `profesores` `prof` on((`prof`.`id_profesor` = `c`.`id_profesor`))) left join `personas` `pp` on((`pp`.`id_persona` = `prof`.`id_persona`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;


/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 VIEW `vista_pagos` AS select `p`.`id_pago` AS `id_pago`,`p`.`id_alumno` AS `id_alumno`,concat(`per`.`nombre`,' ',`per`.`apellido`) AS `alumno`,`a`.`legajo` AS `legajo`,`c`.`descripcion` AS `concepto`,`p`.`monto` AS `monto`,`p`.`fecha_pago` AS `fecha_pago`,`p`.`periodo` AS `periodo`,`p`.`fecha_vencimiento` AS `fecha_vencimiento`,`p`.`estado_pago` AS `estado_pago`,`m`.`descripcion` AS `medio_pago`,`ad`.`cargo` AS `administrativo`,(case when ((`p`.`fecha_pago` is null) and (`p`.`fecha_vencimiento` < curdate())) then 'mora' when ((`p`.`fecha_pago` is null) and ((to_days(`p`.`fecha_vencimiento`) - to_days(curdate())) <= 5)) then 'proximo_vencimiento' when (`p`.`fecha_pago` is not null) then 'pagado' else 'al_dia' end) AS `estado_visual` from (((((`pagos` `p` join `alumnos` `a` on((`a`.`id_alumno` = `p`.`id_alumno`))) join `personas` `per` on((`per`.`id_persona` = `a`.`id_persona`))) join `conceptos_pago` `c` on((`c`.`id_concepto` = `p`.`id_concepto`))) join `medios_pago` `m` on((`m`.`id_medio_pago` = `p`.`id_medio_pago`))) left join `administrativos` `ad` on((`ad`.`id_administrativo` = `p`.`id_administrativo`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;


/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 VIEW `vista_profesores` AS select `p`.`id_profesor` AS `id_profesor`,concat(`per`.`nombre`,' ',`per`.`apellido`) AS `nombre_completo`,`p`.`especialidad` AS `especialidad`,group_concat(`i`.`nombre_idioma` separator ', ') AS `idiomas` from (((`profesores` `p` join `personas` `per` on((`per`.`id_persona` = `p`.`id_profesor`))) left join `profesores_idiomas` `pi` on((`p`.`id_profesor` = `pi`.`id_profesor`))) left join `idiomas` `i` on((`pi`.`id_idioma` = `i`.`id_idioma`))) group by `p`.`id_profesor` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

