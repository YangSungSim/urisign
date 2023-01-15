INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES ('donguriID', 'donguri', 'test@gmail.com', '12345678');

INSERT INTO `documents` (`id`,`user_id`,`title`,`content`,`status`,`created_at`,`updated_at`) VALUES ('05a05180-c6bb-11eb-b8bc-0242ac130003','donguriID','test title','test content','CREATED','2022-07-06T00:00:00.0000','2022-07-06T00:00:00.0000');
INSERT INTO `documents` (`id`,`user_id`,`title`,`content`,`status`,`created_at`,`updated_at`) VALUES ('05a05180-c6bb-11eb-b8bc-0242ac130004','donguriID','test title2','test content2','CREATED','2022-07-11T00:00:00.0000','2022-07-11T00:00:00.0000');

INSERT INTO `document_histories` (`document_id`,`type`,`data`,`created_at`) VALUES ('05a05180-c6bb-11eb-b8bc-0242ac130003','CREATED','test data','2022-07-06T00:00:00.0000');
INSERT INTO `document_histories` (`document_id`,`type`,`data`,`created_at`) VALUES ('05a05180-c6bb-11eb-b8bc-0242ac130004','CREATED','test data2','2022-07-11T00:00:00.0000');

INSERT INTO `participants` (`id`,`document_id`,`name`,`email`,`status`,`signature`,`created_at`,`updated_at`) VALUES 
('8egacdfd-8cdg-11eb-b8bc-0242ac130003', '05a05180-c6bb-11eb-b8bc-0242ac130003','donguri','test@gmail.com','SIGNED','signature','2022-07-06T00:00:00.0000','2022-07-06T00:00:00.0000');

INSERT INTO `participants` (`id`,`document_id`,`name`,`email`,`status`,`signature`,`created_at`,`updated_at`) VALUES 
('8egacdfd-8cdg-11eb-b8bc-0242ac130004', '05a05180-c6bb-11eb-b8bc-0242ac130003','donguri2','participants2@gmail.com','CREATED','signature','2022-07-07T00:00:00.0000','2022-07-07T00:00:00.0000');

INSERT INTO `participants` (`id`,`document_id`,`name`,`email`,`status`,`signature`,`created_at`,`updated_at`) VALUES 
('8egacdfd-8cdg-11eb-b8bc-0242ac130005', '05a05180-c6bb-11eb-b8bc-0242ac130004','donguri','test@gmail.com','CREATED','signature','2022-07-11T00:00:00.0000','2022-07-11T00:00:00.0000');

INSERT INTO `participants` (`id`,`document_id`,`name`,`email`,`status`,`signature`,`created_at`,`updated_at`) VALUES 
('8egacdfd-8cdg-11eb-b8bc-0242ac130006', '05a05180-c6bb-11eb-b8bc-0242ac130004','donguri2','participants2@gmail.com','CREATED','signature','2022-07-11T00:00:00.0000','2022-07-11T00:00:00.0000');


INSERT INTO `participant_histories` (`participant_id`,`type`,`data`,`created_at`) VALUES ('8egacdfd-8cdg-11eb-b8bc-0242ac130003' ,'CREATED','TEST DATA','2022-07-06T00:00:00.0000');
INSERT INTO `participant_histories` (`participant_id`,`type`,`data`,`created_at`) VALUES ('8egacdfd-8cdg-11eb-b8bc-0242ac130004' ,'CREATED','TEST DATA','2022-07-07T00:00:00.0000');
INSERT INTO `participant_histories` (`participant_id`,`type`,`data`,`created_at`) VALUES ('8egacdfd-8cdg-11eb-b8bc-0242ac130005' ,'CREATED','TEST DATA','2022-07-11T00:00:00.0000');
INSERT INTO `participant_histories` (`participant_id`,`type`,`data`,`created_at`) VALUES ('8egacdfd-8cdg-11eb-b8bc-0242ac130006' ,'CREATED','TEST DATA','2022-07-11T00:00:00.0000');
