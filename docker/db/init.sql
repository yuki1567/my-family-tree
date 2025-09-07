-- Database initialization script
-- This script runs automatically when MySQL container is first created
-- Grants necessary permissions to application user for Prisma operations

-- Grant CREATE permission for Prisma shadow database
GRANT CREATE ON *.* TO 'family_tree_user'@'%';

-- Grant DROP permission for migrations
GRANT DROP ON *.* TO 'family_tree_user'@'%';

-- Grant ALTER permission for table structure changes
GRANT ALTER ON *.* TO 'family_tree_user'@'%';

-- Grant INDEX permission for index creation/deletion
GRANT INDEX ON *.* TO 'family_tree_user'@'%';

-- Grant REFERENCES permission for foreign key constraints
GRANT REFERENCES ON *.* TO 'family_tree_user'@'%';

-- Grant CREATE VIEW permission for future view usage
GRANT CREATE VIEW ON *.* TO 'family_tree_user'@'%';

-- Grant CREATE TEMPORARY TABLES permission for Prisma complex queries
GRANT CREATE TEMPORARY TABLES ON *.* TO 'family_tree_user'@'%';

-- Grant EXECUTE permission for stored procedures during migrations
GRANT EXECUTE ON *.* TO 'family_tree_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;