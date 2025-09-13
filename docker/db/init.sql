-- Database initialization script
-- This script runs automatically when MySQL container is first created
-- Grants minimal necessary permissions to application user for Prisma operations

-- Basic CRUD operations on family_tree database
GRANT SELECT, INSERT, UPDATE, DELETE ON family_tree.* TO 'family_tree_user'@'%';

-- Table structure modification permissions for migrations
GRANT CREATE, DROP, ALTER ON family_tree.* TO 'family_tree_user'@'%';

-- Index management for performance optimization
GRANT INDEX ON family_tree.* TO 'family_tree_user'@'%';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;