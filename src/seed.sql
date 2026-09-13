-- Sakila SQLite Database Schema & Seed Data (Sample Subset for Labs)

DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS rental;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS film_category;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS film_actor;
DROP TABLE IF EXISTS actor;
DROP TABLE IF EXISTS film;

-- Actors
CREATE TABLE actor (
  actor_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL
);

-- Categories
CREATE TABLE category (
  category_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

-- Films
CREATE TABLE film (
  film_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  release_year INTEGER DEFAULT 2006,
  rental_rate DECIMAL(4, 2) NOT NULL DEFAULT 4.99,
  length INTEGER NOT NULL, -- duration in minutes
  rating TEXT CHECK(rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17')) DEFAULT 'G'
);

-- Film-Actor junction
CREATE TABLE film_actor (
  actor_id INTEGER NOT NULL,
  film_id INTEGER NOT NULL,
  PRIMARY KEY (actor_id, film_id),
  FOREIGN KEY (actor_id) REFERENCES actor(actor_id),
  FOREIGN KEY (film_id) REFERENCES film(film_id)
);

-- Film-Category junction
CREATE TABLE film_category (
  film_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (film_id, category_id),
  FOREIGN KEY (film_id) REFERENCES film(film_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Customers
CREATE TABLE customer (
  customer_id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  active INTEGER NOT NULL DEFAULT 1
);

-- Rentals
CREATE TABLE rental (
  rental_id INTEGER PRIMARY KEY,
  rental_date DATETIME NOT NULL,
  film_id INTEGER NOT NULL,
  customer_id INTEGER NOT NULL,
  return_date DATETIME,
  FOREIGN KEY (film_id) REFERENCES film(film_id),
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Payments
CREATE TABLE payment (
  payment_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  rental_id INTEGER,
  amount DECIMAL(5, 2) NOT NULL,
  payment_date DATETIME NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (rental_id) REFERENCES rental(rental_id)
);

-- Seed Categories
INSERT INTO category (category_id, name) VALUES
  (1, 'Action'),
  (2, 'Animation'),
  (3, 'Children'),
  (4, 'Classics'),
  (5, 'Comedy'),
  (6, 'Documentary'),
  (7, 'Drama'),
  (8, 'Family'),
  (9, 'Foreign'),
  (10, 'Games'),
  (11, 'Horror'),
  (12, 'Music'),
  (13, 'New'),
  (14, 'Sci-Fi'),
  (15, 'Sports'),
  (16, 'Travel');

-- Seed Actors
INSERT INTO actor (actor_id, first_name, last_name) VALUES
  (1, 'PENELOPE', 'GUINESS'),
  (2, 'NICK', 'WAHLBERG'),
  (3, 'ED', 'CHASE'),
  (4, 'JENNIFER', 'DAVIS'),
  (5, 'JOHNNY', 'LOLLOBRIGIDA'),
  (6, 'BETTE', 'NICHOLSON'),
  (7, 'GRACE', 'MOSTEL'),
  (8, 'MATTHEW', 'JOHANSSON'),
  (9, 'JOE', 'SWANK'),
  (10, 'CHRISTIAN', 'GABLE');

-- Seed Films
INSERT INTO film (film_id, title, description, release_year, rental_rate, length, rating) VALUES
  (1, 'ACADEMY DINOSAUR', 'A Epic Drama of a Feminist And a Mad Scientist who must Battle a Teacher in The Canadian Rockies', 2006, 0.99, 86, 'PG'),
  (2, 'ACE GOLDFINGER', 'A Astounding Epistle of a Database Administrator And a Explorer who must Find a Car in Ancient China', 2006, 4.99, 48, 'G'),
  (3, 'ADAPTATION HOLES', 'A Astounding Reflection of a Lumberjack And a Car who must Sink a Lumberjack in A Baloon Factory', 2006, 2.99, 50, 'NC-17'),
  (4, 'AFFAIR PREJUDICE', 'A Fanciful Documentary of a Frisbee And a Lumberjack who must Chase a Monkey in A Shark Tank', 2006, 2.99, 117, 'G'),
  (5, 'AFRICAN EGG', 'A Fast-Paced Documentary of a Pastry Chef And a Dentist who must Pursue a Forensic Psychologist in The Gulf of Mexico', 2006, 2.99, 130, 'G'),
  (6, 'AGENT TRUMAN', 'A Intrepid Panorama of a Robot And a Boy who must Escape a Sun in The Outback', 2006, 4.99, 169, 'PG'),
  (7, 'AIRPLANE SIERRA', 'A Touching Saga of a Hunter And a Butler who must Discover a Butler in A Jet Boat', 2006, 4.99, 62, 'PG-13'),
  (8, 'AIRPORT POLLOCK', 'A Epic Tale of a Moose And a Girl who must Confront a Monkey in Ancient India', 2006, 4.99, 54, 'R'),
  (9, 'ALABAMA DEVIL', 'A Thoughtful Panorama of a Database Administrator And a Mad Scientist who must Outgun a Mad Scientist in A Jet Boat', 2006, 2.99, 114, 'PG-13'),
  (10, 'ALADDIN CALENDAR', 'A Action-Packed Tale of a Man And a Lumberjack who must Reach a Astronaut in An Abandoned Amusement Park', 2006, 4.99, 63, 'NC-17'),
  (11, 'ALAMO VIDEOTAPE', 'A Boring Drama of a Butler And a Cat who must Fight a Pastry Chef in A MySQL Convention', 2006, 0.99, 126, 'G'),
  (12, 'ALASKA PHANTOM', 'A Fanciful Saga of a Hunter And a Pastry Chef who must Vanquish a Boy in A Baloon Factory', 2006, 0.99, 136, 'PG');

-- Seed Film-Category
INSERT INTO film_category (film_id, category_id) VALUES
  (1, 6),  -- ACADEMY DINOSAUR -> Documentary
  (2, 11), -- ACE GOLDFINGER -> Horror
  (3, 6),  -- ADAPTATION HOLES -> Documentary
  (4, 5),  -- AFFAIR PREJUDICE -> Comedy
  (5, 8),  -- AFRICAN EGG -> Family
  (6, 1),  -- AGENT TRUMAN -> Action
  (7, 5),  -- AIRPLANE SIERRA -> Comedy
  (8, 11), -- AIRPORT POLLOCK -> Horror
  (9, 11), -- ALABAMA DEVIL -> Horror
  (10, 15),-- ALADDIN CALENDAR -> Sports
  (11, 9), -- ALAMO VIDEOTAPE -> Foreign
  (12, 2); -- ALASKA PHANTOM -> Animation

-- Seed Film-Actor
INSERT INTO film_actor (actor_id, film_id) VALUES
  (1, 1), (1, 10), (1, 11),
  (2, 2), (2, 3), (2, 8),
  (3, 4), (3, 7), (3, 12),
  (4, 1), (4, 6), (4, 9),
  (5, 5), (5, 6), (5, 11),
  (6, 2), (6, 7), (6, 10),
  (7, 3), (7, 8), (7, 12),
  (8, 4), (8, 5), (8, 9),
  (9, 1), (9, 7), (9, 10),
  (10, 2), (10, 6), (10, 11);

-- Seed Customers
INSERT INTO customer (customer_id, first_name, last_name, email, active) VALUES
  (1, 'MARY', 'SMITH', 'MARY.SMITH@sakilacustomer.org', 1),
  (2, 'PATRICIA', 'JOHNSON', 'PATRICIA.JOHNSON@sakilacustomer.org', 1),
  (3, 'LINDA', 'WILLIAMS', 'LINDA.WILLIAMS@sakilacustomer.org', 1),
  (4, 'BARBARA', 'JONES', 'BARBARA.JONES@sakilacustomer.org', 1),
  (5, 'ELIZABETH', 'BROWN', 'ELIZABETH.BROWN@sakilacustomer.org', 1),
  (6, 'JENNIFER', 'DAVIS', 'JENNIFER.DAVIS@sakilacustomer.org', 1),
  (7, 'MARIA', 'MILLER', 'MARIA.MILLER@sakilacustomer.org', 0),
  (8, 'SUSAN', 'WILSON', 'SUSAN.WILSON@sakilacustomer.org', 1);

-- Seed Rentals
INSERT INTO rental (rental_id, rental_date, film_id, customer_id, return_date) VALUES
  (1, '2005-05-24 22:53:30', 1, 1, '2005-05-26 22:04:30'),
  (2, '2005-05-24 22:54:33', 2, 1, '2005-05-28 19:40:33'),
  (3, '2005-05-24 23:03:39', 6, 2, '2005-06-01 22:12:39'),
  (4, '2005-05-24 23:04:41', 7, 3, '2005-06-03 01:43:41'),
  (5, '2005-05-24 23:05:21', 1, 4, '2005-06-02 04:33:21'),
  (6, '2005-05-24 23:08:07', 3, 1, '2005-05-27 01:32:07'),
  (7, '2005-05-24 23:11:53', 4, 5, '2005-05-29 03:34:53'),
  (8, '2005-05-24 23:31:46', 5, 2, '2005-05-27 19:59:46'),
  (9, '2005-05-25 00:00:40', 8, 3, '2005-05-28 00:22:40'),
  (10, '2005-05-25 00:02:21', 9, 4, '2005-05-31 22:44:21'),
  (11, '2005-05-25 00:09:02', 10, 1, '2005-06-02 20:56:02'),
  (12, '2005-05-25 00:19:27', 11, 6, NULL),
  (13, '2005-05-25 00:22:55', 12, 2, '2005-05-30 04:28:55'),
  (14, '2005-05-25 01:10:17', 6, 1, '2005-05-26 18:20:17');

-- Seed Payments
INSERT INTO payment (payment_id, customer_id, rental_id, amount, payment_date) VALUES
  (1, 1, 1, 0.99, '2005-05-25 11:30:37'),
  (2, 1, 2, 4.99, '2005-05-28 10:35:23'),
  (3, 1, 6, 2.99, '2005-06-15 11:29:28'),
  (4, 1, 11, 4.99, '2005-06-16 11:51:36'),
  (5, 1, 14, 4.99, '2005-06-18 08:41:48'),
  (6, 2, 3, 4.99, '2005-05-27 07:11:43'),
  (7, 2, 8, 2.99, '2005-05-28 00:08:47'),
  (8, 2, 13, 0.99, '2005-06-16 00:13:06'),
  (9, 3, 4, 4.99, '2005-05-29 03:58:44'),
  (10, 3, 9, 4.99, '2005-06-15 21:08:46'),
  (11, 4, 5, 0.99, '2005-05-30 03:21:20'),
  (12, 4, 10, 2.99, '2005-06-17 23:14:19'),
  (13, 5, 7, 2.99, '2005-05-29 07:25:16'),
  (14, 6, 12, 0.99, '2005-06-16 15:18:57');
