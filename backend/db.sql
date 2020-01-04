CREATE DATABASE webweek;
use webweek;
CREATE TABLE users(
    userID int NOT NULL AUTO_INCREMENT,
    name varchar(255),
    city varchar(255),
    email varchar(255),
    phone varchar(20),
    pwdHash CHAR(60),
	PRIMARY KEY (userID)
);

CREATE TABLE contacts(
	contactID int NOT NULL auto_increment,
    userID int,
    name varchar(255),
    phone1 varchar(20),
    phone2 varchar(20),
    email varchar(255),
    PRIMARY KEY (contactID),
    FOREIGN KEY (userID) REFERENCES users(userID)
);

select * from users;

