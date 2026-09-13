-- Northwind Mini SQLite Database Schema & Seed Data
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;

CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY,
  category_name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE customers (
  customer_id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  city TEXT,
  country TEXT
);

CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  reports_to INTEGER,
  FOREIGN KEY (reports_to) REFERENCES employees(employee_id)
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category_id INTEGER,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  units_in_stock INTEGER NOT NULL DEFAULT 0,
  discontinued INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id TEXT,
  employee_id INTEGER,
  order_date DATE NOT NULL,
  freight DECIMAL(10, 2) DEFAULT 0.00,
  ship_country TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE order_details (
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  discount DECIMAL(4, 2) NOT NULL DEFAULT 0.0,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Seed Categories
INSERT INTO categories VALUES
(1, 'Beverages', 'Soft drinks, coffees, teas, beers, and ales'),
(2, 'Condiments', 'Sweet and savory sauces, relishes, spreads, and seasonings'),
(3, 'Confections', 'Desserts, candies, and sweet breads'),
(4, 'Dairy Products', 'Cheeses'),
(5, 'Grains/Cereals', 'Breads, crackers, pasta, and cereal'),
(6, 'Meat/Poultry', 'Prepared meats'),
(7, 'Produce', 'Dried fruit and bean curd'),
(8, 'Seafood', 'Seaweed and fish');

-- Seed Customers
INSERT INTO customers VALUES
('ALFKI', 'Alfreds Futterkiste', 'Maria Anders', 'Berlin', 'Germany'),
('ANATR', 'Ana Trujillo Emparedados', 'Ana Trujillo', 'México D.F.', 'Mexico'),
('ANTON', 'Antonio Moreno Taquería', 'Antonio Moreno', 'México D.F.', 'Mexico'),
('AROUT', 'Around the Horn', 'Thomas Hardy', 'London', 'UK'),
('BERGS', 'Berglunds snabbköp', 'Christina Berglund', 'Luleå', 'Sweden'),
('BLAUS', 'Blauer See Delikatessen', 'Hanna Moos', 'Mannheim', 'Germany'),
('BLONP', 'Blondel père et fils', 'Frédérique Citeaux', 'Strasbourg', 'France'),
('BOLID', 'Bólido Comidas preparadas', 'Martín Sommer', 'Madrid', 'Spain'),
('BONAP', 'Bon app''', 'Laurence Lebihan', 'Marseille', 'France'),
('BOTTM', 'Bottom-Dollar Markets', 'Elizabeth Lincoln', 'Tsawwassen', 'Canada'),
('BSBEV', 'B''s Beverages', 'Victoria Ashworth', 'London', 'UK'),
('CACTU', 'Cactus Comidas para llevar', 'Patricio Simpson', 'Buenos Aires', 'Argentina');

-- Seed Employees
INSERT INTO employees VALUES
(1, 'Nancy', 'Davolio', 'Sales Representative', 2),
(2, 'Andrew', 'Fuller', 'Vice President, Sales', NULL),
(3, 'Janet', 'Leverling', 'Sales Representative', 2),
(4, 'Margaret', 'Peacock', 'Sales Representative', 2),
(5, 'Steven', 'Buchanan', 'Sales Manager', 2),
(6, 'Michael', 'Suyama', 'Sales Representative', 5),
(7, 'Robert', 'King', 'Sales Representative', 5),
(8, 'Laura', 'Callahan', 'Inside Sales Coordinator', 2);

-- Seed Products
INSERT INTO products VALUES
(1, 'Chai', 1, 18.00, 39, 0),
(2, 'Chang', 1, 19.00, 17, 0),
(3, 'Aniseed Syrup', 2, 10.00, 13, 0),
(4, 'Chef Anton''s Cajun Seasoning', 2, 22.00, 53, 0),
(5, 'Chef Anton''s Gumbo Mix', 2, 21.35, 0, 1),
(6, 'Grandma''s Boysenberry Spread', 2, 25.00, 120, 0),
(7, 'Uncle Bob''s Organic Dried Pears', 7, 30.00, 15, 0),
(8, 'Northwoods Cranberry Sauce', 2, 40.00, 6, 0),
(9, 'Mishi Kobe Niku', 6, 97.00, 29, 1),
(10, 'Ikura', 8, 31.00, 31, 0),
(11, 'Queso Cabrales', 4, 21.00, 22, 0),
(12, 'Queso Manchego La Pastora', 4, 38.00, 86, 0),
(13, 'Konbu', 8, 6.00, 24, 0),
(14, 'Tofu', 7, 23.25, 35, 0),
(15, 'Genen Shouyu', 2, 15.50, 39, 0),
(16, 'Pavlova', 3, 17.45, 29, 0),
(17, 'Alice Mutton', 6, 39.00, 0, 1),
(18, 'Carnarvon Tigers', 8, 62.50, 42, 0),
(19, 'Teatime Chocolate Biscuits', 3, 9.20, 25, 0),
(20, 'Sir Rodney''s Marmalade', 3, 81.00, 40, 0);

-- Seed Orders
INSERT INTO orders VALUES
(10248, 'BERGS', 5, '2023-07-04', 32.38, 'Sweden'),
(10249, 'ANATR', 6, '2023-07-05', 11.61, 'Mexico'),
(10250, 'BONAP', 4, '2023-07-08', 65.83, 'France'),
(10251, 'BONAP', 3, '2023-07-08', 41.34, 'France'),
(10252, 'ALFKI', 4, '2023-07-09', 51.30, 'Germany'),
(10253, 'AROUT', 3, '2023-07-10', 58.17, 'UK'),
(10254, 'BERGS', 5, '2023-07-11', 22.98, 'Sweden'),
(10255, 'BLONP', 1, '2023-07-12', 148.33, 'France'),
(10256, 'BOLID', 3, '2023-07-15', 13.97, 'Spain'),
(10257, 'BSBEV', 4, '2023-07-16', 81.91, 'UK');

-- Seed Order Details
INSERT INTO order_details VALUES
(10248, 11, 14.00, 12, 0.0),
(10248, 14, 9.80, 10, 0.0),
(10249, 1, 18.00, 5, 0.0),
(10249, 14, 18.60, 9, 0.0),
(10250, 10, 31.00, 35, 0.15),
(10250, 11, 21.00, 15, 0.15),
(10251, 2, 19.00, 6, 0.05),
(10251, 6, 25.00, 15, 0.05),
(10252, 1, 18.00, 40, 0.05),
(10252, 19, 9.20, 25, 0.0),
(10253, 3, 10.00, 20, 0.0),
(10253, 4, 22.00, 40, 0.0),
(10254, 7, 30.00, 15, 0.15),
(10255, 16, 17.45, 35, 0.1),
(10256, 11, 21.00, 15, 0.0),
(10257, 10, 31.00, 25, 0.0);
