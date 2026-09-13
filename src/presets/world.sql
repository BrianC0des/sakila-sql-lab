-- World Geography SQLite Database Schema & Seed Data
DROP TABLE IF EXISTS country_language;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS country;

CREATE TABLE country (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  continent TEXT NOT NULL,
  region TEXT NOT NULL,
  surface_area DECIMAL(10, 2) NOT NULL,
  indep_year INTEGER,
  population INTEGER NOT NULL,
  life_expectancy DECIMAL(3, 1),
  gnp DECIMAL(10, 2),
  capital INTEGER
);

CREATE TABLE city (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  district TEXT NOT NULL,
  population INTEGER NOT NULL,
  FOREIGN KEY (country_code) REFERENCES country(code)
);

CREATE TABLE country_language (
  country_code TEXT NOT NULL,
  language TEXT NOT NULL,
  is_official INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(4, 1) NOT NULL,
  PRIMARY KEY (country_code, language),
  FOREIGN KEY (country_code) REFERENCES country(code)
);

-- Seed Countries
INSERT INTO country VALUES
('USA', 'United States', 'North America', 'North America', 9363520.00, 1776, 331002651, 78.9, 21433226.00, 1),
('JPN', 'Japan', 'Asia', 'Eastern Asia', 377829.00, -660, 126476461, 84.6, 5081770.00, 2),
('DEU', 'Germany', 'Europe', 'Western Europe', 357022.00, 1871, 83783942, 81.3, 3861124.00, 3),
('GBR', 'United Kingdom', 'Europe', 'British Islands', 242900.00, 1066, 67886011, 81.2, 2827113.00, 4),
('FRA', 'France', 'Europe', 'Western Europe', 551500.00, 843, 65273511, 82.7, 2715518.00, 5),
('CAN', 'Canada', 'North America', 'North America', 9984670.00, 1867, 37742154, 82.4, 1736426.00, 6),
('AUS', 'Australia', 'Oceania', 'Australia and New Zealand', 7741220.00, 1901, 25499884, 83.4, 1392681.00, 7),
('BRA', 'Brazil', 'South America', 'South America', 8515767.00, 1822, 212559417, 75.9, 1839758.00, 8),
('PHL', 'Philippines', 'Asia', 'Southeast Asia', 300000.00, 1898, 109581078, 71.2, 376796.00, 9),
('SGP', 'Singapore', 'Asia', 'Southeast Asia', 728.00, 1965, 5850342, 83.9, 372063.00, 10);

-- Seed Cities
INSERT INTO city VALUES
(1, 'Washington D.C.', 'USA', 'District of Columbia', 689545),
(2, 'Tokyo', 'JPN', 'Tokyo-to', 13960000),
(3, 'Berlin', 'DEU', 'Berlin', 3645000),
(4, 'London', 'GBR', 'Greater London', 8982000),
(5, 'Paris', 'FRA', 'Île-de-France', 2161000),
(6, 'Ottawa', 'CAN', 'Ontario', 994837),
(7, 'Canberra', 'AUS', 'Australian Capital Territory', 456652),
(8, 'Brasília', 'BRA', 'Distrito Federal', 3055149),
(9, 'Manila', 'PHL', 'National Capital Region', 1780148),
(10, 'Singapore', 'SGP', 'Central Region', 5850342),
(11, 'New York', 'USA', 'New York', 8804190),
(12, 'Los Angeles', 'USA', 'California', 3898747),
(13, 'Osaka', 'JPN', 'Osaka-fu', 2691000),
(14, 'Cebu City', 'PHL', 'Central Visayas', 964169),
(15, 'Sydney', 'AUS', 'New South Wales', 5312163);

-- Seed Country Languages
INSERT INTO country_language VALUES
('USA', 'English', 1, 82.1),
('USA', 'Spanish', 0, 10.7),
('JPN', 'Japanese', 1, 99.1),
('DEU', 'German', 1, 95.0),
('GBR', 'English', 1, 97.3),
('FRA', 'French', 1, 96.0),
('CAN', 'English', 1, 58.7),
('CAN', 'French', 1, 22.0),
('AUS', 'English', 1, 76.8),
('BRA', 'Portuguese', 1, 97.5),
('PHL', 'Filipino', 1, 60.0),
('PHL', 'English', 1, 55.0),
('SGP', 'English', 1, 48.3),
('SGP', 'Mandarin', 1, 35.0);
