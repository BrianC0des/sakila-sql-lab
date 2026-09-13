// Sakila SQL Learning Curriculum: 36 Milestones (Beginner → Advanced)

export interface SqlChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  hints: string[];
  starterQuery: string;
  referenceSolution: string;
  requireOrder?: boolean;
  isCustom?: boolean;
}

export const sqlChallenges: SqlChallenge[] = [
  {
    "id": "sakila-01-select-where",
    "title": "Milestone 1: Filtering & Sorting (SELECT, WHERE, ORDER BY)",
    "description": "Select the `title`, `rental_rate`, and `length` of all films with a 'G' or 'PG' rating that rent for less than 3.00. Order the results by length DESC.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "Select the three requested columns from the `film` table.",
      "Filter using `WHERE rating IN ('G', 'PG') AND rental_rate < 3.00`.",
      "Add `ORDER BY length DESC` to place the longest films first."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rental_rate, length FROM film WHERE rating IN ('G', 'PG') AND rental_rate < 3.00 ORDER BY length DESC;",
    "tags": [
      "select",
      "where",
      "order-by"
    ]
  },
  {
    "id": "sakila-27-limit-offset",
    "title": "Milestone 2: Pagination (LIMIT + OFFSET)",
    "description": "Paginate the film catalog: show page 2 of results where each page has 3 films. Sort films alphabetically by `title ASC`, skip the first 3, and return the next 3 titles only.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "`LIMIT 3` returns 3 rows. `OFFSET 3` skips the first 3 rows.",
      "Think of it as: page 1 = LIMIT 3 OFFSET 0, page 2 = LIMIT 3 OFFSET 3, page 3 = LIMIT 3 OFFSET 6.",
      "Sort `ORDER BY title ASC` first so the pages are consistent."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title FROM film ORDER BY title ASC LIMIT 3 OFFSET 3;",
    "tags": [
      "limit",
      "offset",
      "pagination"
    ]
  },
  {
    "id": "sakila-11-distinct",
    "title": "Milestone 3: Unique Values (DISTINCT)",
    "description": "List every unique film rating available in the catalog — no duplicates. Return just the `rating` column and sort alphabetically `ASC`.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "`SELECT DISTINCT` removes duplicate values from the result set.",
      "You only need one column: `rating`.",
      "Sort with `ORDER BY rating ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT DISTINCT rating FROM film ORDER BY rating ASC;",
    "tags": [
      "distinct",
      "filtering"
    ]
  },
  {
    "id": "sakila-10-like-wildcards",
    "title": "Milestone 4: Pattern Matching (LIKE & Wildcards)",
    "description": "Use `LIKE` to find films whose title starts with the letter 'A'. Return `title`, `rating`, and `rental_rate`. Order by `rental_rate DESC, title ASC`, and limit the results to the top 5.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "The `%` wildcard matches any number of characters. `'A%'` means starts with A.",
      "Use `WHERE title LIKE 'A%'` to filter films beginning with A.",
      "Add `ORDER BY rental_rate DESC, title ASC LIMIT 5` to get the top 5 most expensive."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rating, rental_rate FROM film WHERE title LIKE 'A%' ORDER BY rental_rate DESC, title ASC LIMIT 5;",
    "tags": [
      "like",
      "wildcards",
      "filtering"
    ]
  },
  {
    "id": "sakila-12-between-in",
    "title": "Milestone 5: Range & List Filtering (BETWEEN + IN)",
    "description": "Find budget-friendly family films: select `title`, `rental_rate`, and `length` for films whose `rental_rate` is `BETWEEN 0.99 AND 2.99` AND whose `rating` is `IN ('G', 'PG')`. Order by `length DESC`.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "`BETWEEN 0.99 AND 2.99` is inclusive — it includes both 0.99 and 2.99.",
      "`IN ('G', 'PG')` is a shorthand for `rating = 'G' OR rating = 'PG'`.",
      "Combine both conditions with `AND`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rental_rate, length FROM film WHERE rental_rate BETWEEN 0.99 AND 2.99 AND rating IN ('G', 'PG') ORDER BY length DESC;",
    "tags": [
      "between",
      "in",
      "filtering"
    ]
  },
  {
    "id": "sakila-25-not-in-filter",
    "title": "Milestone 6: Exclusion Filter (NOT IN)",
    "description": "Find films rated neither 'G' nor 'PG' — i.e., exclude family-friendly ratings. Return `title` and `rating`. Order by `rating ASC, title ASC`.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "`NOT IN ('G', 'PG')` excludes any row whose rating matches those values.",
      "Equivalent to `WHERE rating != 'G' AND rating != 'PG'` but shorter.",
      "Order by `rating ASC, title ASC` for a clean grouped result."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rating FROM film WHERE rating NOT IN ('G', 'PG') ORDER BY rating ASC, title ASC;",
    "tags": [
      "not-in",
      "filtering"
    ]
  },
  {
    "id": "sakila-13-null-check",
    "title": "Milestone 7: Handling NULL (IS NULL — Unreturned Rentals)",
    "description": "Find which customer still has a film checked out (i.e., the rental's `return_date IS NULL`). Join `customer`, `rental`, and `film`. Return `first_name`, `last_name`, and the film `title`. Order by `last_name ASC`.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "NULL means 'no value' — a missing `return_date` means the film hasn't been returned.",
      "Use `WHERE r.return_date IS NULL` — never `= NULL`.",
      "Join `customer c` → `rental r ON c.customer_id = r.customer_id` → `film f ON r.film_id = f.film_id`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, f.title FROM customer c JOIN rental r ON c.customer_id = r.customer_id JOIN film f ON r.film_id = f.film_id WHERE r.return_date IS NULL ORDER BY c.last_name ASC;",
    "tags": [
      "null",
      "is-null",
      "filtering"
    ]
  },
  {
    "id": "sakila-26-is-not-null",
    "title": "Milestone 8: IS NOT NULL (Returned Rentals)",
    "description": "Find all rentals that have been **returned** (i.e., `return_date IS NOT NULL`). Join `customer`, `rental`, and `film`. Return the customer's `first_name`, `last_name`, the film `title`, and `return_date`. Order by `return_date ASC`, limit to the **first 5**.",
    "difficulty": "beginner",
    "requireOrder": true,
    "hints": [
      "`IS NOT NULL` checks that a value IS present — the opposite of `IS NULL`.",
      "Join chain: `customer c → rental r → film f`.",
      "Add `LIMIT 5` after `ORDER BY return_date ASC` to get the 5 earliest returns."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, f.title, r.return_date FROM customer c JOIN rental r ON c.customer_id = r.customer_id JOIN film f ON r.film_id = f.film_id WHERE r.return_date IS NOT NULL ORDER BY r.return_date ASC LIMIT 5;",
    "tags": [
      "null",
      "is-not-null",
      "filtering"
    ]
  },
  {
    "id": "sakila-14-aggregate-summary",
    "title": "Milestone 9: Aggregate Functions (COUNT, MIN, MAX, AVG)",
    "description": "Produce a single-row catalog summary: count all films as `total_films`, find the lowest rental rate as `cheapest`, the highest as `most_expensive`, and the average (rounded to 2 decimal places) as `avg_rate`.",
    "difficulty": "beginner",
    "requireOrder": false,
    "hints": [
      "Use `COUNT(*)`, `MIN(rental_rate)`, `MAX(rental_rate)`, and `ROUND(AVG(rental_rate), 2)`.",
      "All four aggregates can go in a single `SELECT` from `film` — no `GROUP BY` needed.",
      "Alias each column: `AS total_films`, `AS cheapest`, `AS most_expensive`, `AS avg_rate`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT COUNT(*) AS total_films, MIN(rental_rate) AS cheapest, MAX(rental_rate) AS most_expensive, ROUND(AVG(rental_rate), 2) AS avg_rate FROM film;",
    "tags": [
      "aggregates",
      "count",
      "avg",
      "min",
      "max"
    ]
  },
  {
    "id": "sakila-24-and-or-parentheses",
    "title": "Milestone 10: Compound Logic (AND + OR with Parentheses)",
    "description": "Find films that are either `(G or PG rated AND longer than 100 minutes)` OR are `NC-17` rated. Return `title`, `rating`, and `length`. Use parentheses to group your conditions correctly. Order by `rating ASC, length DESC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Parentheses control AND/OR precedence — without them, AND binds tighter than OR by default.",
      "Structure: `WHERE (rating IN ('G','PG') AND length > 100) OR rating = 'NC-17'`.",
      "Order by `rating ASC` first, then `length DESC` for ties."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rating, length FROM film WHERE (rating IN ('G','PG') AND length > 100) OR rating = 'NC-17' ORDER BY rating ASC, length DESC;",
    "tags": [
      "boolean-logic",
      "and",
      "or",
      "filtering"
    ]
  },
  {
    "id": "sakila-15-group-by-rating",
    "title": "Milestone 11: Grouping Rows (GROUP BY)",
    "description": "Count how many films exist for each `rating`. Return `rating` and `COUNT(*) AS total_films`. Order by `total_films DESC, rating ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "`GROUP BY rating` collapses all films with the same rating into one group.",
      "Then `COUNT(*)` counts how many rows are in each group.",
      "Sort by `total_films DESC` first, then `rating ASC` to break ties alphabetically."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT rating, COUNT(*) AS total_films FROM film GROUP BY rating ORDER BY total_films DESC, rating ASC;",
    "tags": [
      "group-by",
      "aggregates"
    ]
  },
  {
    "id": "sakila-03-group-by-count",
    "title": "Milestone 12: Data Aggregation (GROUP BY & COUNT)",
    "description": "Count how many films belong to each category. Return the category `name` and the number of films as `total_films`. Order by `total_films DESC, name ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Start with `category c` and join `film_category fc ON c.category_id = fc.category_id`.",
      "Use `COUNT(fc.film_id)` as `total_films`.",
      "Group by `c.category_id, c.name` and sort by `total_films DESC, c.name ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.name, COUNT(fc.film_id) AS total_films FROM category c JOIN film_category fc ON c.category_id = fc.category_id GROUP BY c.category_id, c.name ORDER BY total_films DESC, c.name ASC;",
    "tags": [
      "group-by",
      "count",
      "aggregates"
    ]
  },
  {
    "id": "sakila-16-having-filter",
    "title": "Milestone 13: Filtering Groups (HAVING)",
    "description": "Find ratings that have **more than 1 film** in the catalog. Return `rating` and `COUNT(*) AS total_films`. Use `HAVING` to filter the groups, and order by `total_films DESC, rating ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "`WHERE` filters individual rows before grouping. `HAVING` filters groups after grouping.",
      "Use `HAVING COUNT(*) > 1` after the `GROUP BY rating` clause.",
      "You can also write `HAVING total_films > 1` in SQLite — both work."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT rating, COUNT(*) AS total_films FROM film GROUP BY rating HAVING COUNT(*) > 1 ORDER BY total_films DESC, rating ASC;",
    "tags": [
      "having",
      "group-by",
      "filtering"
    ]
  },
  {
    "id": "sakila-04-having-filter",
    "title": "Milestone 14: Filtering Aggregates (HAVING)",
    "description": "Find high-volume movie categories that have 2 or more films in our sample catalog. Return `c.name` and `COUNT(fc.film_id) AS total_films`. Filter groups using HAVING.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Remember: `WHERE` filters rows before grouping; `HAVING` filters aggregate results after grouping.",
      "Add `HAVING total_films >= 2` (or `HAVING COUNT(fc.film_id) >= 2`).",
      "Order by `total_films DESC, c.name ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.name, COUNT(fc.film_id) AS total_films FROM category c JOIN film_category fc ON c.category_id = fc.category_id GROUP BY c.category_id, c.name HAVING COUNT(fc.film_id) >= 2 ORDER BY total_films DESC, c.name ASC;",
    "tags": [
      "having",
      "aggregates",
      "filtering"
    ]
  },
  {
    "id": "sakila-17-case-length-category",
    "title": "Milestone 15: Conditional Logic (CASE WHEN — Film Length)",
    "description": "Categorize every film by its runtime. Return `title`, `length`, and a computed column `length_category`: `'Short'` if length < 60, `'Medium'` if length ≤ 120, `'Long'` otherwise. Order by `length ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "`CASE WHEN ... THEN ... WHEN ... THEN ... ELSE ... END` is SQL's if/else.",
      "Place the CASE expression in the SELECT list and alias it `AS length_category`.",
      "Check the shortest condition first: `WHEN length < 60 THEN 'Short'`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, length, CASE WHEN length < 60 THEN 'Short' WHEN length <= 120 THEN 'Medium' ELSE 'Long' END AS length_category FROM film ORDER BY length ASC;",
    "tags": [
      "case-when",
      "conditional-logic"
    ]
  },
  {
    "id": "sakila-18-case-price-tier",
    "title": "Milestone 16: Price Tiers (CASE WHEN — Rental Rate)",
    "description": "Label each film with a pricing tier using `CASE WHEN`: `'Budget'` if `rental_rate < 1.00`, `'Standard'` if `rental_rate < 3.00`, and `'Premium'` otherwise. Return `title`, `rental_rate`, and `price_tier`. Order by `rental_rate ASC, title ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Chain multiple `WHEN` conditions — the first one that is `TRUE` wins.",
      "Budget < 1.00  |  Standard < 3.00  |  Premium is everything else (ELSE).",
      "Alias the CASE expression as `AS price_tier`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rental_rate, CASE WHEN rental_rate < 1.00 THEN 'Budget' WHEN rental_rate < 3.00 THEN 'Standard' ELSE 'Premium' END AS price_tier FROM film ORDER BY rental_rate ASC, title ASC;",
    "tags": [
      "case-when",
      "conditional-logic"
    ]
  },
  {
    "id": "sakila-02-inner-join",
    "title": "Milestone 17: Relational Matching (INNER JOIN)",
    "description": "Match each film to its genre name by joining `film`, `film_category`, and `category`. Select `film.title`, `category.name AS category_name`, and `film.rental_rate`. Order by `title ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Join `film` to `film_category` ON `film.film_id = film_category.film_id`.",
      "Join `category` ON `film_category.category_id = category.category_id`.",
      "Alias `category.name` as `category_name` and sort by `title ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT f.title, c.name AS category_name, f.rental_rate FROM film f JOIN film_category fc ON f.film_id = fc.film_id JOIN category c ON fc.category_id = c.category_id ORDER BY f.title ASC;",
    "tags": [
      "inner-join",
      "joins"
    ]
  },
  {
    "id": "sakila-06-many-to-many-inner-join",
    "title": "Milestone 18: Many-to-Many INNER JOIN (Actor ↔ Film)",
    "description": "Connect actors to their movies across the `film_actor` junction table. Find all films starring the actress with last name 'GUINESS'. Return `first_name`, `last_name`, and `title`. Order alphabetically by film `title ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Join `actor a` to `film_actor fa ON a.actor_id = fa.actor_id`.",
      "Join `film_actor fa` to `film f ON fa.film_id = f.film_id`.",
      "Filter with `WHERE a.last_name = 'GUINESS'` and sort with `ORDER BY f.title ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT a.first_name, a.last_name, f.title FROM actor a JOIN film_actor fa ON a.actor_id = fa.actor_id JOIN film f ON fa.film_id = f.film_id WHERE a.last_name = 'GUINESS' ORDER BY f.title ASC;",
    "tags": [
      "inner-join",
      "joins",
      "many-to-many"
    ]
  },
  {
    "id": "sakila-07-left-outer-join",
    "title": "Milestone 19: LEFT OUTER JOIN (Detecting Inactive Customers)",
    "description": "In an INNER JOIN, customers with zero rentals vanish from results. Use a `LEFT JOIN` on `rental` to retain all customers, and calculate how many rentals each has made as `rental_count`. Order by `rental_count ASC, customer_id ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Use `customer c LEFT JOIN rental r ON c.customer_id = r.customer_id`.",
      "Use `COUNT(r.rental_id) AS rental_count` (do NOT count `*` or non-null counts will be wrong for zero rentals).",
      "Group by `c.customer_id, c.first_name, c.last_name`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.customer_id, c.first_name, c.last_name, COUNT(r.rental_id) AS rental_count FROM customer c LEFT JOIN rental r ON c.customer_id = r.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY rental_count ASC, c.customer_id ASC;",
    "tags": [
      "left-join",
      "joins",
      "null"
    ]
  },
  {
    "id": "sakila-21-join-group-spend",
    "title": "Milestone 20: JOIN + GROUP BY (Customer Spend Summary)",
    "description": "How much has each customer spent in total? Join `customer` and `payment`, then group by customer. Return `first_name`, `last_name`, and `SUM(p.amount) AS total_spent`. Order by `total_spent DESC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Join: `customer c JOIN payment p ON c.customer_id = p.customer_id`.",
      "Aggregate: `SUM(p.amount) AS total_spent`.",
      "Group by the customer's full identity: `GROUP BY c.customer_id, c.first_name, c.last_name`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON c.customer_id = p.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY total_spent DESC;",
    "tags": [
      "joins",
      "group-by",
      "aggregates"
    ]
  },
  {
    "id": "sakila-29-having-popular-films",
    "title": "Milestone 21: Films Rented More Than Once (JOIN + GROUP BY + HAVING)",
    "description": "Find films in the rental catalog that were rented **more than once**. Join `film` and `rental`. Return `title` and `COUNT(r.rental_id) AS times_rented`. Filter with HAVING, and order by `times_rented DESC, title ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "Join `film f JOIN rental r ON f.film_id = r.film_id`.",
      "Group by `f.film_id, f.title` and use `COUNT(r.rental_id) AS times_rented`.",
      "`HAVING COUNT(r.rental_id) > 1` keeps only films rented more than once."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT f.title, COUNT(r.rental_id) AS times_rented FROM film f JOIN rental r ON f.film_id = r.film_id GROUP BY f.film_id, f.title HAVING COUNT(r.rental_id) > 1 ORDER BY times_rented DESC, f.title ASC;",
    "tags": [
      "joins",
      "group-by",
      "having"
    ]
  },
  {
    "id": "sakila-19-subquery-scalar",
    "title": "Milestone 22: Scalar Subquery (Films Above Average Price)",
    "description": "A subquery is a query inside another query. Find all films whose `rental_rate` is **above the average** rental rate of all films. Return `title` and `rental_rate`. Order by `rental_rate DESC, title ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "A scalar subquery returns a single value. Wrap it in parentheses: `(SELECT AVG(rental_rate) FROM film)`.",
      "Use `WHERE rental_rate > ( SELECT AVG(rental_rate) FROM film )`.",
      "The average rental rate in this dataset is ~$3.32 — so 'Premium' films will qualify."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT title, rental_rate FROM film WHERE rental_rate > (SELECT AVG(rental_rate) FROM film) ORDER BY rental_rate DESC, title ASC;",
    "tags": [
      "subquery",
      "scalar-subquery"
    ]
  },
  {
    "id": "sakila-20-subquery-in",
    "title": "Milestone 23: Subquery with IN (Customers Who Paid ≥ $4.99)",
    "description": "Use a subquery with `IN` to find customers who made at least one payment of $4.99 or more. Return `first_name` and `last_name`. Order by `last_name ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "The subquery `(SELECT customer_id FROM payment WHERE amount >= 4.99)` returns a list of IDs.",
      "Use `WHERE customer_id IN (...)` to match customers in that list.",
      "Each customer only appears once in the result — `IN` handles the deduplication automatically."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT first_name, last_name FROM customer WHERE customer_id IN (SELECT customer_id FROM payment WHERE amount >= 4.99) ORDER BY last_name ASC;",
    "tags": [
      "subquery",
      "in"
    ]
  },
  {
    "id": "sakila-28-not-in-subquery",
    "title": "Milestone 24: NOT IN Subquery (Customers With No Payments)",
    "description": "Use a `NOT IN` subquery to find customers who have **never made any payment**. Return `first_name` and `last_name`. Order by `last_name ASC`.",
    "difficulty": "intermediate",
    "requireOrder": true,
    "hints": [
      "The subquery `(SELECT customer_id FROM payment)` returns all customers who have paid.",
      "`WHERE customer_id NOT IN (...)` finds customers whose ID is absent from that list.",
      "Alternative approach: LEFT JOIN payment WHERE payment_id IS NULL — both are valid."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT first_name, last_name FROM customer WHERE customer_id NOT IN (SELECT customer_id FROM payment) ORDER BY last_name ASC;",
    "tags": [
      "subquery",
      "not-in",
      "null"
    ]
  },
  {
    "id": "sakila-05-multi-table-revenue",
    "title": "Milestone 25: Multi-Table Revenue Aggregation (JOIN + GROUP BY)",
    "description": "Generate a customer spending report. For each customer who has made payments, return their `first_name`, `last_name`, the number of rentals made as `total_rentals`, and the total amount spent as `total_spent`. Order by `total_spent DESC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Join `customer c` with `payment p ON c.customer_id = p.customer_id`.",
      "Use `COUNT(p.payment_id) AS total_rentals` and `SUM(p.amount) AS total_spent`.",
      "Group by `c.customer_id, c.first_name, c.last_name` and order by `total_spent DESC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, COUNT(p.payment_id) AS total_rentals, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON c.customer_id = p.customer_id GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY total_spent DESC;",
    "tags": [
      "joins",
      "multi-table",
      "group-by"
    ]
  },
  {
    "id": "sakila-23-join-group-having",
    "title": "Milestone 26: JOIN + GROUP BY + HAVING (High-Value Customers)",
    "description": "Find customers whose **total spending exceeds $5.00**. Join `customer` and `payment`, group by customer, then filter with `HAVING`. Return `first_name`, `last_name`, and `SUM(p.amount) AS total_spent`. Order by `total_spent DESC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Build on Milestone 21 — add a `HAVING` clause after `GROUP BY`.",
      "`HAVING SUM(p.amount) > 5.00` filters groups after the aggregation is done.",
      "WHERE filters individual rows; HAVING filters aggregated groups."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON c.customer_id = p.customer_id GROUP BY c.customer_id, c.first_name, c.last_name HAVING SUM(p.amount) > 5.00 ORDER BY total_spent DESC;",
    "tags": [
      "joins",
      "group-by",
      "having"
    ]
  },
  {
    "id": "sakila-22-left-join-null-pattern",
    "title": "Milestone 27: LEFT JOIN + NULL Pattern (Customers With No Rentals)",
    "description": "Use a `LEFT JOIN` to find customers who have **never rented** a film. Because there's no match on the right side, their `rental_id` will be `NULL`. Return `first_name` and `last_name`, ordered by `last_name ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "LEFT JOIN keeps all rows from the left table even when there's no match on the right.",
      "Join: `customer c LEFT JOIN rental r ON c.customer_id = r.customer_id`.",
      "Filter: `WHERE r.rental_id IS NULL` — these are the customers with no rentals."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name FROM customer c LEFT JOIN rental r ON c.customer_id = r.customer_id WHERE r.rental_id IS NULL ORDER BY c.last_name ASC;",
    "tags": [
      "left-join",
      "null",
      "anti-join"
    ]
  },
  {
    "id": "sakila-36-left-join-on-filter",
    "title": "Milestone 28: LEFT JOIN Filter in ON vs WHERE — Premium Payment Trap",
    "description": "Classic exam trap: filtering in `ON` vs `WHERE` with LEFT JOIN produces **different results**. Join `customer` to `payment` but only match payments where `p.amount >= 4.99` — put this condition **in the ON clause**, not WHERE. This keeps all customers in the result even if they have no qualifying payments. Return `c.customer_id`, `c.first_name`, `c.last_name`, and `COUNT(p.payment_id) AS premium_payments`. Order by `premium_payments DESC`, then `c.customer_id ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "The filter goes in the `ON` clause: `LEFT JOIN payment p ON c.customer_id = p.customer_id AND p.amount >= 4.99`.",
      "If you move `p.amount >= 4.99` to `WHERE`, customers with no premium payments disappear — the LEFT JOIN behaves like INNER JOIN.",
      "`COUNT(p.payment_id)` returns 0 for customers with no matching payments since their `payment_id` will be NULL."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.customer_id, c.first_name, c.last_name, COUNT(p.payment_id) AS premium_payments FROM customer c LEFT JOIN payment p ON c.customer_id = p.customer_id AND p.amount >= 4.99 GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY premium_payments DESC, c.customer_id ASC;",
    "tags": [
      "left-join",
      "on-vs-where",
      "traps"
    ]
  },
  {
    "id": "sakila-09-four-table-audit-join",
    "title": "Milestone 29: Multi-Table Audit (Customer ↔ Rental ↔ Film ↔ Payment)",
    "description": "Audit transactions where premium pricing applies (`p.amount >= 4.99`). Join `customer`, `rental`, `film`, and `payment`. Return concatenated `customer_name` (`c.first_name || ' ' || c.last_name`), `film_title` (`f.title`), `p.amount`, and `p.payment_date`. Order by `p.payment_date ASC, f.title ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Join chain: `customer c` -> `rental r ON c.customer_id = r.customer_id` -> `film f ON r.film_id = f.film_id` -> `payment p ON r.rental_id = p.rental_id`.",
      "Filter with `WHERE p.amount >= 4.99`.",
      "Order by `p.payment_date ASC, f.title ASC`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name || ' ' || c.last_name AS customer_name, f.title AS film_title, p.amount, p.payment_date FROM customer c JOIN rental r ON c.customer_id = r.customer_id JOIN film f ON r.film_id = f.film_id JOIN payment p ON r.rental_id = p.rental_id WHERE p.amount >= 4.99 ORDER BY p.payment_date ASC, f.title ASC;",
    "tags": [
      "joins",
      "multi-table",
      "audit"
    ]
  },
  {
    "id": "sakila-32-five-table-genre-revenue",
    "title": "Milestone 30: 5-Table Revenue by Genre (Ultimate JOIN Challenge)",
    "description": "Discover which film genres generate the most rental revenue. Chain 4 JOINs across `payment → rental → film_category → category` to connect each payment to its film's genre. Return `category` (as `category.name`) and `SUM(p.amount) AS revenue`. Order by `revenue DESC`, limit to the **top 5 genres**.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Join chain: `payment p → rental r ON p.rental_id = r.rental_id → film_category fc ON r.film_id = fc.film_id → category cat ON fc.category_id = cat.category_id`.",
      "Group by `cat.category_id, cat.name` and aggregate `SUM(p.amount) AS revenue`.",
      "Add `ORDER BY revenue DESC LIMIT 5` to see the most profitable genres."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT cat.name AS category, SUM(p.amount) AS revenue FROM payment p JOIN rental r ON p.rental_id = r.rental_id JOIN film_category fc ON r.film_id = fc.film_id JOIN category cat ON fc.category_id = cat.category_id GROUP BY cat.category_id, cat.name ORDER BY revenue DESC LIMIT 5;",
    "tags": [
      "joins",
      "multi-table",
      "aggregates"
    ]
  },
  {
    "id": "sakila-08-self-join",
    "title": "Milestone 31: SELF JOIN (Pairing Rows from the Same Table)",
    "description": "Join the `film` table to itself to identify pairs of different movies that share the exact same `rental_rate` and `rating`. Return `f1.title AS film_1`, `f2.title AS film_2`, `f1.rating`, and `f1.rental_rate`. Prevent duplicate symmetric pairs by enforcing `f1.film_id < f2.film_id`. Order by `f1.rental_rate DESC, f1.title ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Alias the same table twice: `film f1 JOIN film f2`.",
      "Match on `f1.rating = f2.rating AND f1.rental_rate = f2.rental_rate`.",
      "Add `f1.film_id < f2.film_id` in the ON/WHERE clause to eliminate identical pairs (A, A) and reverse mirrors (B, A)."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT f1.title AS film_1, f2.title AS film_2, f1.rating, f1.rental_rate FROM film f1 JOIN film f2 ON f1.rating = f2.rating AND f1.rental_rate = f2.rental_rate AND f1.film_id < f2.film_id ORDER BY f1.rental_rate DESC, f1.title ASC;",
    "tags": [
      "self-join",
      "joins"
    ]
  },
  {
    "id": "sakila-33-self-join",
    "title": "Milestone 32: Self-Join — Films with the Same Rental Rate & Rating",
    "description": "A **self-join** joins a table to itself. Use it to find pairs of films that share the same `rental_rate` AND the same `rating`. Alias `film` twice as `f1` and `f2`. Use `f1.film_id < f2.film_id` in the ON clause to avoid duplicate pairs. Return `f1.title AS film_1`, `f2.title AS film_2`, `f1.rental_rate`, and `f1.rating`. Order by `f1.rental_rate DESC`, then `f1.title ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Alias the same table twice: `FROM film f1 JOIN film f2`.",
      "ON clause needs 3 conditions: `f1.rental_rate = f2.rental_rate AND f1.rating = f2.rating AND f1.film_id < f2.film_id`.",
      "The `f1.film_id < f2.film_id` guard prevents showing (A,B) and (B,A) as two separate rows — each pair appears only once."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT f1.title AS film_1, f2.title AS film_2, f1.rental_rate, f1.rating FROM film f1 JOIN film f2 ON f1.rental_rate = f2.rental_rate AND f1.rating = f2.rating AND f1.film_id < f2.film_id ORDER BY f1.rental_rate DESC, f1.title ASC;",
    "tags": [
      "self-join",
      "joins"
    ]
  },
  {
    "id": "sakila-30-case-group-by",
    "title": "Milestone 33: CASE WHEN + GROUP BY (Films Per Price Tier)",
    "description": "Use `CASE WHEN` inside `GROUP BY` to count how many films fall into each price tier: `'Budget'` (< $1.00), `'Standard'` (< $3.00), `'Premium'` ($3.00+). Return `price_tier` and `COUNT(*) AS total_films`. Order by `total_films DESC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Put the CASE WHEN expression in both SELECT and GROUP BY (or alias it in a subquery).",
      "In SQLite, you can GROUP BY a column alias defined in SELECT.",
      "Three tiers: Budget (rental_rate < 1.00), Standard (rental_rate < 3.00), Premium (everything else)."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT CASE WHEN rental_rate < 1.00 THEN 'Budget' WHEN rental_rate < 3.00 THEN 'Standard' ELSE 'Premium' END AS price_tier, COUNT(*) AS total_films FROM film GROUP BY price_tier ORDER BY total_films DESC;",
    "tags": [
      "case-when",
      "group-by",
      "aggregates"
    ]
  },
  {
    "id": "sakila-31-where-group-having",
    "title": "Milestone 34: WHERE + GROUP BY + HAVING Together (Active Customer Spend)",
    "description": "Combine all three filter levels: Use `WHERE` to restrict to **active** customers (`active = 1`), `GROUP BY` to aggregate per customer, and `HAVING` to keep only those who spent more than `$5.00` total. Return `first_name`, `last_name`, the number of payments as `num_payments`, and `SUM(p.amount) AS total_spent`. Order by `total_spent DESC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "WHERE runs on individual rows before grouping — use it for `c.active = 1`.",
      "HAVING runs after GROUP BY on aggregated totals — use it for `SUM(p.amount) > 5.00`.",
      "Group by `c.customer_id, c.first_name, c.last_name`; count payments with `COUNT(p.payment_id) AS num_payments`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name, c.last_name, COUNT(p.payment_id) AS num_payments, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON c.customer_id = p.customer_id WHERE c.active = 1 GROUP BY c.customer_id, c.first_name, c.last_name HAVING SUM(p.amount) > 5.00 ORDER BY total_spent DESC;",
    "tags": [
      "where",
      "group-by",
      "having"
    ]
  },
  {
    "id": "sakila-34-count-star-vs-count-col",
    "title": "Milestone 35: COUNT(*) vs COUNT(column) — Returned vs Total Rentals",
    "description": "`COUNT(*)` counts **every row** (including NULLs). `COUNT(column)` counts only **non-NULL values** in that column. Use this difference to find each customer's total rentals vs how many they actually returned. Join `customer` to `rental`. Return `first_name || ' ' || last_name AS full_name`, `COUNT(*) AS total_rentals`, and `COUNT(r.return_date) AS returned_rentals`. Order by `total_rentals DESC`, then `full_name ASC`.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "`COUNT(*)` counts all joined rows — each rental is a row, even unreturned ones.",
      "`COUNT(r.return_date)` skips NULLs — a NULL `return_date` means the item was never returned.",
      "Concatenate names with `c.first_name || ' ' || c.last_name AS full_name` and group by `c.customer_id, full_name`."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT c.first_name || ' ' || c.last_name AS full_name, COUNT(*) AS total_rentals, COUNT(r.return_date) AS returned_rentals FROM customer c JOIN rental r ON c.customer_id = r.customer_id GROUP BY c.customer_id, full_name ORDER BY total_rentals DESC, full_name ASC;",
    "tags": [
      "aggregates",
      "count",
      "null"
    ]
  },
  {
    "id": "sakila-35-date-aggregation",
    "title": "Milestone 36: DATE() Aggregation — Daily Revenue Report",
    "description": "Strip the time part from `payment_date` using `DATE()` to group payments by calendar day. Return `DATE(payment_date) AS pay_date`, `COUNT(*) AS transactions`, and `ROUND(SUM(amount), 2) AS daily_revenue`. Order by `pay_date ASC` to see the revenue trend over time.",
    "difficulty": "advanced",
    "requireOrder": true,
    "hints": [
      "Use `DATE(payment_date)` to convert a full datetime like `'2005-05-25 11:30:37'` into just `'2005-05-25'`.",
      "Group by the same expression: `GROUP BY pay_date` (SQLite allows aliases in GROUP BY) or `GROUP BY DATE(payment_date)`.",
      "`ROUND(SUM(amount), 2)` rounds the revenue total to 2 decimal places."
    ],
    "starterQuery": "",
    "referenceSolution": "SELECT DATE(payment_date) AS pay_date, COUNT(*) AS transactions, ROUND(SUM(amount), 2) AS daily_revenue FROM payment GROUP BY pay_date ORDER BY pay_date ASC;",
    "tags": [
      "date-functions",
      "group-by",
      "aggregates"
    ]
  }
];
