CREATE DATABASE IF NOT EXISTS myshare;
CREATE USER IF NOT EXISTS 'mariadb'@'localhost' IDENTIFIED BY 'MakeASecurePassword999!';
GRANT ALL PRIVILEGES ON myshare.* TO 'mariadb'@'localhost';
FLUSH PRIVILEGES;
