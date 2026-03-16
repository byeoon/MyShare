CREATE DATABASE IF NOT EXISTS myshare;
ALTER USER 'mariadb'@'localhost' IDENTIFIED BY 'MakeASecurePassword999!';
GRANT ALL PRIVILEGES ON myshare.* TO 'mariadb'@'localhost';
FLUSH PRIVILEGES;
