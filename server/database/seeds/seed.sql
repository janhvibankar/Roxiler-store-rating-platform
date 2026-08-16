-- Seed Users (1 ADMIN, 1 USER, 1 STORE_OWNER)
INSERT INTO users (id, name, email, password, address, role) VALUES
(1, 'System Administrator', 'admin@storerating.com', 'AdminPass123!', '100 Admin Plaza, Suite 1', 'ADMIN'),
(2, 'Jane Customer', 'user@storerating.com', 'UserPass123!', '200 Main Street, Apt 4B', 'USER'),
(3, 'John Store Owner', 'owner@storerating.com', 'OwnerPass123!', '300 Commerce Boulevard', 'STORE_OWNER')
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role);

-- Seed Store (belonging to STORE_OWNER id: 3)
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(1, 'Apex Electronics Store', 'apex@stores.com', '400 Tech Park, Building A', 3)
ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), address=VALUES(address), owner_id=VALUES(owner_id);

-- Seed Rating (from USER id: 2 for store id: 1)
INSERT INTO ratings (id, user_id, store_id, rating) VALUES
(1, 2, 1, 5)
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
