// SQL Quiz Bank — covers all topics from the MySQL + Sakila SQL Cheat Sheet
// Organized into batches by topic. Each question has 4 options, one correct answer (0-indexed), and an explanation.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // 0-indexed
  explanation: string;
}

export interface QuizBatch {
  id: string;
  title: string;
  icon: string;
  description: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  questions: QuizQuestion[];
}

// ─── BATCH 1: SELECT & FROM ────────────────────────────────────────────────
const batch_select_from: QuizBatch = {
  id: "quiz-select-from",
  title: "SELECT & FROM Basics",
  icon: "target",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Test your understanding of choosing columns and tables.",
  questions: [
    {
      id: "sf-01",
      question: "Which clause tells SQL which table to read data from?",
      options: ["SELECT", "WHERE", "FROM", "ORDER BY"],
      correct: 2,
      explanation: "FROM specifies the table. Think: FROM = WHERE does my data live?"
    },
    {
      id: "sf-02",
      question: "What does `SELECT *` do?",
      options: [
        "Selects the first column only",
        "Selects all columns from the table",
        "Selects zero columns",
        "Selects only numeric columns"
      ],
      correct: 1,
      explanation: "`*` is a wildcard meaning 'all columns'. It's handy for exploration but slow in production."
    },
    {
      id: "sf-03",
      question: "Which query selects only the title and rental_rate from the film table?",
      options: [
        "SELECT * FROM film;",
        "SELECT title, rental_rate FROM film;",
        "FROM film SELECT title rental_rate;",
        "GET title, rental_rate FROM film;"
      ],
      correct: 1,
      explanation: "SQL syntax: SELECT <columns> FROM <table>. Column names are comma-separated."
    },
    {
      id: "sf-04",
      question: "What is the correct write order for a basic SQL statement?",
      options: [
        "FROM → SELECT → WHERE",
        "SELECT → FROM → WHERE",
        "WHERE → FROM → SELECT",
        "SELECT → WHERE → FROM"
      ],
      correct: 1,
      explanation: "The WRITE order is SELECT → FROM → WHERE. MySQL processes them in a different internal order, but you write SELECT first."
    },
    {
      id: "sf-05",
      question: "Which command inspects the columns of a table?",
      options: ["SHOW film;", "LIST COLUMNS film;", "DESCRIBE film;", "SELECT COLUMNS FROM film;"],
      correct: 2,
      explanation: "DESCRIBE film (or DESC film) shows a table's column names, types, and constraints."
    }
  ]
};

// ─── BATCH 2: WHERE & Operators ───────────────────────────────────────────
const batch_where: QuizBatch = {
  id: "quiz-where",
  title: "WHERE & Comparison Operators",
  icon: "search",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Practice filtering rows with conditions and operators.",
  questions: [
    {
      id: "wh-01",
      question: "Which query finds all PG-rated films?",
      options: [
        "SELECT * FROM film HAVING rating = 'PG';",
        "SELECT * FROM film WHERE rating = 'PG';",
        "SELECT * FROM film IF rating = 'PG';",
        "SELECT * WHERE rating = 'PG' FROM film;"
      ],
      correct: 1,
      explanation: "WHERE filters rows. HAVING filters groups (after GROUP BY). Always WHERE for row-level conditions."
    },
    {
      id: "wh-02",
      question: "What does `WHERE rental_rate > 3` return?",
      options: [
        "Films with exactly a $3.00 rate",
        "Films with a rate of 3 or more",
        "Films with a rate strictly above $3.00",
        "Films cheaper than $3.00"
      ],
      correct: 2,
      explanation: "`>` is strictly greater than. For 'greater than or equal', use `>=`. So >3 excludes exactly 3.00."
    },
    {
      id: "wh-03",
      question: "Which operator means 'not equal to'?",
      options: ["=", "<>", "!=", "Both <> and !="],
      correct: 3,
      explanation: "In SQL, both `!=` and `<>` mean 'not equal'. Both are valid."
    },
    {
      id: "wh-04",
      question: "What does `WHERE length <= 90` return?",
      options: [
        "Films longer than 90 minutes",
        "Films exactly 90 minutes long",
        "Films 90 minutes or shorter",
        "Films shorter than 90 minutes"
      ],
      correct: 2,
      explanation: "`<=` means 'less than or equal to', so films of 90 minutes or fewer are included."
    },
    {
      id: "wh-05",
      question: "Which query finds films that are NOT rated PG?",
      options: [
        "SELECT title FROM film WHERE rating = NOT 'PG';",
        "SELECT title FROM film WHERE NOT rating = 'PG';",
        "SELECT title FROM film EXCLUDE rating = 'PG';",
        "SELECT title FROM film WHERE rating NONE 'PG';"
      ],
      correct: 1,
      explanation: "`NOT rating = 'PG'` is valid, as is `rating != 'PG'` or `rating <> 'PG'`."
    }
  ]
};

// ─── BATCH 3: Logical Operators ────────────────────────────────────────────
const batch_logical: QuizBatch = {
  id: "quiz-logical",
  title: "AND, OR & NOT",
  icon: "brain",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Combine multiple conditions with logical operators.",
  questions: [
    {
      id: "lo-01",
      question: "Which keyword requires BOTH conditions to be true?",
      options: ["OR", "NOT", "AND", "BETWEEN"],
      correct: 2,
      explanation: "AND requires both sides to be TRUE. OR requires at least one side to be TRUE."
    },
    {
      id: "lo-02",
      question: "Which query finds films rated 'G' OR 'PG'?",
      options: [
        "WHERE rating = 'G' AND rating = 'PG'",
        "WHERE rating = 'G' OR rating = 'PG'",
        "WHERE rating IN 'G', 'PG'",
        "WHERE rating BETWEEN 'G' AND 'PG'"
      ],
      correct: 1,
      explanation: "A film can only have one rating, so AND would always return nothing. OR is correct here."
    },
    {
      id: "lo-03",
      question: "What does `WHERE rating = 'PG' AND rental_rate < 3` return?",
      options: [
        "Films rated PG or cheaper than $3",
        "All PG films only",
        "Only films cheaper than $3",
        "Films that are BOTH PG AND cheaper than $3"
      ],
      correct: 3,
      explanation: "AND requires BOTH conditions true simultaneously — PG rating AND price under $3."
    },
    {
      id: "lo-04",
      question: "What is the result of: `WHERE NOT rating = 'PG'`?",
      options: [
        "Only PG films",
        "All films except PG",
        "No films at all",
        "Films where rating is NULL"
      ],
      correct: 1,
      explanation: "NOT inverts the condition. NOT (rating = 'PG') returns everything except PG-rated films."
    },
    {
      id: "lo-05",
      question: "How many conditions must be TRUE for `A OR B OR C` to return a row?",
      options: ["All three (A, B, and C)", "At least two", "Exactly one", "At least one"],
      correct: 3,
      explanation: "OR returns a row if at least ONE condition is TRUE — even if only A is true while B and C are false."
    }
  ]
};

// ─── BATCH 4: IN, BETWEEN, DISTINCT ───────────────────────────────────────
const batch_in_between: QuizBatch = {
  id: "quiz-in-between",
  title: "IN, BETWEEN & DISTINCT",
  icon: "clipboard",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Range filters, list matching, and deduplication.",
  questions: [
    {
      id: "ib-01",
      question: "`WHERE rental_rate BETWEEN 2 AND 4` — is 2.00 included in the results?",
      options: [
        "No, BETWEEN is exclusive",
        "Yes, BETWEEN includes both endpoints",
        "Only if there's a HAVING clause",
        "Depends on the database"
      ],
      correct: 1,
      explanation: "BETWEEN in SQL is always inclusive of both endpoints. It's equivalent to >= 2 AND <= 4."
    },
    {
      id: "ib-02",
      question: "Which is the shorthand for `rating = 'G' OR rating = 'PG' OR rating = 'R'`?",
      options: [
        "WHERE rating IN ('G', 'PG', 'R')",
        "WHERE rating BETWEEN 'G' AND 'R'",
        "WHERE rating = ('G', 'PG', 'R')",
        "WHERE rating ANY ('G', 'PG', 'R')"
      ],
      correct: 0,
      explanation: "IN provides a clean shorthand for multiple OR conditions on the same column."
    },
    {
      id: "ib-03",
      question: "What does `SELECT DISTINCT rating FROM film` return?",
      options: [
        "All ratings including duplicates",
        "Only the first rating alphabetically",
        "Each unique rating value once",
        "The count of each rating"
      ],
      correct: 2,
      explanation: "DISTINCT removes duplicate values, returning each unique rating exactly once."
    },
    {
      id: "ib-04",
      question: "Which query finds films where rental_rate is exactly $2.99 or $4.99?",
      options: [
        "WHERE rental_rate BETWEEN 2.99 AND 4.99",
        "WHERE rental_rate = 2.99 OR rental_rate = 4.99",
        "WHERE rental_rate IN (2.99, 4.99)",
        "Both B and C are correct"
      ],
      correct: 3,
      explanation: "Both OR and IN produce the same results. BETWEEN 2.99 AND 4.99 would also include 3.00, 3.99, etc., so it's wrong."
    },
    {
      id: "ib-05",
      question: "What does `NOT IN ('G', 'PG')` return?",
      options: [
        "Only G and PG films",
        "Films with any rating not in the list",
        "All films including G and PG",
        "Nothing — NOT IN is invalid"
      ],
      correct: 1,
      explanation: "`NOT IN` is the inverse of IN — it returns rows where the column value is NOT in the specified list."
    }
  ]
};

// ─── BATCH 5: NULL ─────────────────────────────────────────────────────────
const batch_null: QuizBatch = {
  id: "quiz-null",
  title: "NULL Values",
  icon: "alert",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Understanding and handling NULL — SQL's 'no value' concept.",
  questions: [
    {
      id: "nu-01",
      question: "How do you correctly check if a column is NULL?",
      options: [
        "WHERE column = NULL",
        "WHERE column == NULL",
        "WHERE column IS NULL",
        "WHERE column EQUALS NULL"
      ],
      correct: 2,
      explanation: "NULL is not a value — it's the absence of a value. You can't compare it with = or ==. Always use IS NULL."
    },
    {
      id: "nu-02",
      question: "What does NULL represent in SQL?",
      options: [
        "The number zero",
        "An empty string ''",
        "False (boolean)",
        "The absence of any value"
      ],
      correct: 3,
      explanation: "NULL means 'no value' — it's not 0, not empty string, not false. It's unknown/missing."
    },
    {
      id: "nu-03",
      question: "In the Sakila rental table, a NULL `return_date` means what?",
      options: [
        "The rental was cancelled",
        "The film has not been returned yet",
        "The rental date is unknown",
        "There was a system error"
      ],
      correct: 1,
      explanation: "A missing return_date = the film is still checked out. IS NULL is how you find unreturned rentals."
    },
    {
      id: "nu-04",
      question: "Which query finds films where `special_features` has a value (is not missing)?",
      options: [
        "WHERE special_features != NULL",
        "WHERE special_features <> NULL",
        "WHERE special_features IS NOT NULL",
        "WHERE special_features EXISTS"
      ],
      correct: 2,
      explanation: "IS NOT NULL is the correct way to check for the presence of a value."
    },
    {
      id: "nu-05",
      question: "What happens when you use `WHERE return_date = NULL`?",
      options: [
        "It returns rows where return_date is NULL",
        "It returns an error",
        "It returns zero rows because NULL = NULL is never TRUE in SQL",
        "It returns all rows"
      ],
      correct: 2,
      explanation: "In SQL, NULL = NULL evaluates to UNKNOWN (not TRUE), so the condition never matches. Always use IS NULL."
    }
  ]
};

// ─── BATCH 6: LIKE & Wildcards ─────────────────────────────────────────────
const batch_like: QuizBatch = {
  id: "quiz-like",
  title: "LIKE & Wildcards",
  icon: "type",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Pattern matching with % and _ wildcards.",
  questions: [
    {
      id: "lk-01",
      question: "What does `%` match in a LIKE pattern?",
      options: [
        "Exactly one character",
        "Zero or more characters",
        "Only letters (not numbers)",
        "A literal percent sign"
      ],
      correct: 1,
      explanation: "`%` is a wildcard that matches any sequence of zero or more characters."
    },
    {
      id: "lk-02",
      question: "What does `_` match in a LIKE pattern?",
      options: [
        "Zero or more characters",
        "Only spaces",
        "Exactly one character",
        "Any digit"
      ],
      correct: 2,
      explanation: "`_` matches exactly one character — unlike `%` which matches any number."
    },
    {
      id: "lk-03",
      question: "Which pattern finds films that START with the letter A?",
      options: ["LIKE '%A'", "LIKE 'A%'", "LIKE '_A_'", "LIKE '%A%'"],
      correct: 1,
      explanation: "'A%' means: starts with A, followed by anything. '%A' would mean ENDING with A."
    },
    {
      id: "lk-04",
      question: "Which pattern finds films that CONTAIN the word 'STAR' anywhere in the title?",
      options: ["LIKE 'STAR'", "LIKE 'STAR%'", "LIKE '%STAR%'", "LIKE '%STAR'"],
      correct: 2,
      explanation: "'%STAR%' allows any characters before and after STAR, so it matches STAR anywhere."
    },
    {
      id: "lk-05",
      question: "`WHERE title LIKE 'A___'` — how many characters must the title have in total?",
      options: [
        "Exactly 1 (just A)",
        "Exactly 4 (A + 3 more)",
        "At least 4",
        "Any number starting with A"
      ],
      correct: 1,
      explanation: "'A___' = literal A followed by exactly 3 underscores = exactly 4-character titles beginning with A."
    }
  ]
};

// ─── BATCH 7: ORDER BY & LIMIT / OFFSET ────────────────────────────────────
const batch_order_limit: QuizBatch = {
  id: "quiz-order-limit",
  title: "ORDER BY, LIMIT & OFFSET",
  icon: "chart",
  topic: "Retrieve Data",
  difficulty: "beginner",
  description: "Sorting results and paginating output.",
  questions: [
    {
      id: "ol-01",
      question: "What does `ORDER BY rental_rate DESC` do?",
      options: [
        "Sorts films from cheapest to most expensive",
        "Sorts films from most expensive to cheapest",
        "Filters films by rental rate",
        "Groups films by rental rate"
      ],
      correct: 1,
      explanation: "DESC = descending order = highest first. ASC = ascending = lowest first (ASC is the default)."
    },
    {
      id: "ol-02",
      question: "What does `LIMIT 5` do?",
      options: [
        "Skips the first 5 rows",
        "Returns only the first 5 rows",
        "Returns the last 5 rows",
        "Limits the query to 5 seconds"
      ],
      correct: 1,
      explanation: "LIMIT n restricts the result set to the first n rows after sorting."
    },
    {
      id: "ol-03",
      question: "Which query gets the 5 most expensive films?",
      options: [
        "SELECT title FROM film LIMIT 5 ORDER BY rental_rate;",
        "SELECT title, rental_rate FROM film ORDER BY rental_rate DESC LIMIT 5;",
        "SELECT title FROM film WHERE rental_rate > 5;",
        "SELECT TOP 5 title FROM film ORDER BY rental_rate DESC;"
      ],
      correct: 1,
      explanation: "ORDER BY rental_rate DESC puts most expensive first, then LIMIT 5 takes the top 5. TOP is SQL Server syntax."
    },
    {
      id: "ol-04",
      question: "What does `LIMIT 10 OFFSET 10` return?",
      options: [
        "Rows 1–10",
        "Rows 10–20",
        "Rows 11–20",
        "Rows 0–10"
      ],
      correct: 2,
      explanation: "OFFSET 10 skips the first 10 rows, then LIMIT 10 returns the next 10 — rows 11 through 20."
    },
    {
      id: "ol-05",
      question: "What is the default sort direction when ASC/DESC is omitted?",
      options: ["DESC", "RANDOM", "ASC", "It depends on the database"],
      correct: 2,
      explanation: "SQL defaults to ASC (ascending, smallest first) when you don't specify a direction."
    }
  ]
};

// ─── BATCH 8: Aggregate Functions ─────────────────────────────────────────
const batch_aggregates: QuizBatch = {
  id: "quiz-aggregates",
  title: "Aggregate Functions",
  icon: "hash",
  topic: "Analyze Data",
  difficulty: "beginner",
  description: "COUNT, SUM, AVG, MIN, MAX — summarizing data.",
  questions: [
    {
      id: "ag-01",
      question: "Which function counts the total number of rows in a table?",
      options: ["SUM(*)", "COUNT(*)", "TOTAL(*)", "LEN(*)"],
      correct: 1,
      explanation: "COUNT(*) counts every row regardless of NULLs. COUNT(column) skips NULLs in that column."
    },
    {
      id: "ag-02",
      question: "What does `SELECT AVG(rental_rate) FROM film` return?",
      options: [
        "The highest rental rate",
        "The lowest rental rate",
        "The average rental rate across all films",
        "The total of all rental rates"
      ],
      correct: 2,
      explanation: "AVG() computes the arithmetic mean. SUM() gives total. MIN()/MAX() give lowest/highest."
    },
    {
      id: "ag-03",
      question: "Which function gives you the total revenue from all payments?",
      options: [
        "SELECT COUNT(amount) FROM payment;",
        "SELECT TOTAL(amount) FROM payment;",
        "SELECT SUM(amount) FROM payment;",
        "SELECT ADD(amount) FROM payment;"
      ],
      correct: 2,
      explanation: "SUM() adds up all values in a column. It's the standard SQL function for totalling."
    },
    {
      id: "ag-04",
      question: "How do you label the result of COUNT(*) as 'total_films'?",
      options: [
        "SELECT COUNT(*) NAMED total_films FROM film;",
        "SELECT COUNT(*) AS total_films FROM film;",
        "SELECT total_films = COUNT(*) FROM film;",
        "SELECT COUNT(*) LABEL total_films FROM film;"
      ],
      correct: 1,
      explanation: "AS creates a column alias. It renames the output column without changing the data."
    },
    {
      id: "ag-05",
      question: "Which query returns the cheapest AND most expensive rental rate in one row?",
      options: [
        "SELECT MIN(rental_rate), MAX(rental_rate) FROM film;",
        "SELECT LEAST(rental_rate), GREATEST(rental_rate) FROM film;",
        "SELECT rental_rate WHERE MIN OR MAX FROM film;",
        "SELECT MIN, MAX FROM film ORDER BY rental_rate;"
      ],
      correct: 0,
      explanation: "Multiple aggregates can be combined in one SELECT. MIN() and MAX() both work on the same column simultaneously."
    }
  ]
};

// ─── BATCH 9: GROUP BY ─────────────────────────────────────────────────────
const batch_group_by: QuizBatch = {
  id: "quiz-group-by",
  title: "GROUP BY",
  icon: "package",
  topic: "Analyze Data",
  difficulty: "intermediate",
  description: "Grouping rows to calculate aggregates per category.",
  questions: [
    {
      id: "gb-01",
      question: "What does `GROUP BY rating` do?",
      options: [
        "Sorts the results by rating",
        "Filters rows to a specific rating",
        "Groups all rows with the same rating together for aggregation",
        "Removes duplicate ratings"
      ],
      correct: 2,
      explanation: "GROUP BY collapses rows with the same value into one group, then you apply aggregates per group."
    },
    {
      id: "gb-02",
      question: "Which query counts films per rating?",
      options: [
        "SELECT COUNT(*) FROM film;",
        "SELECT rating, COUNT(*) AS total FROM film ORDER BY rating;",
        "SELECT rating, COUNT(*) AS total FROM film GROUP BY rating;",
        "SELECT rating FROM film COUNT(*) GROUP BY rating;"
      ],
      correct: 2,
      explanation: "You need GROUP BY to split the count by rating. Without it, COUNT(*) gives one total number."
    },
    {
      id: "gb-03",
      question: "Why must 'rating' appear in GROUP BY when it's in SELECT alongside COUNT(*)?",
      options: [
        "It doesn't have to — any column can be selected",
        "Because non-aggregated columns in SELECT must be in GROUP BY",
        "Because COUNT(*) requires it",
        "For performance optimization only"
      ],
      correct: 1,
      explanation: "The Golden Rule: every column in SELECT that isn't inside an aggregate function MUST appear in GROUP BY."
    },
    {
      id: "gb-04",
      question: "What does `SELECT rating, AVG(rental_rate) FROM film GROUP BY rating` return?",
      options: [
        "One row with the overall average",
        "The average rental rate for each rating group",
        "All films sorted by rating",
        "A count of each rating"
      ],
      correct: 1,
      explanation: "GROUP BY + AVG gives you the average per group — one row per unique rating with that group's average."
    },
    {
      id: "gb-05",
      question: "Can you use a SELECT alias like `total_films` in ORDER BY?",
      options: [
        "No — you can only ORDER BY raw column names",
        "Yes — ORDER BY is processed after SELECT, so aliases are available",
        "Only in MySQL, not in standard SQL",
        "Only when using LIMIT"
      ],
      correct: 1,
      explanation: "MySQL and SQLite both allow using aliases defined in SELECT in the ORDER BY clause."
    }
  ]
};

// ─── BATCH 10: HAVING ──────────────────────────────────────────────────────
const batch_having: QuizBatch = {
  id: "quiz-having",
  title: "HAVING vs WHERE",
  icon: "flask",
  topic: "Analyze Data",
  difficulty: "intermediate",
  description: "Filter groups after aggregation using HAVING.",
  questions: [
    {
      id: "hv-01",
      question: "What is the key difference between WHERE and HAVING?",
      options: [
        "WHERE is faster than HAVING",
        "WHERE filters rows before grouping; HAVING filters groups after aggregation",
        "HAVING can only be used with JOINs",
        "There is no difference"
      ],
      correct: 1,
      explanation: "WHERE runs before GROUP BY on individual rows. HAVING runs after GROUP BY on aggregated groups."
    },
    {
      id: "hv-02",
      question: "Which clause would you use to find ratings with MORE THAN 100 films?",
      options: [
        "WHERE COUNT(*) > 100",
        "FILTER COUNT(*) > 100",
        "HAVING COUNT(*) > 100",
        "LIMIT COUNT > 100"
      ],
      correct: 2,
      explanation: "COUNT(*) > 100 is an aggregate condition — it filters groups, so it must use HAVING, not WHERE."
    },
    {
      id: "hv-03",
      question: "Which query finds customers who spent more than $100 total?",
      options: [
        "SELECT customer_id, SUM(amount) FROM payment WHERE SUM(amount) > 100 GROUP BY customer_id;",
        "SELECT customer_id, SUM(amount) AS total FROM payment GROUP BY customer_id HAVING total > 100;",
        "SELECT customer_id FROM payment HAVING amount > 100;",
        "SELECT customer_id, amount FROM payment WHERE amount > 100;"
      ],
      correct: 1,
      explanation: "SUM(amount) > 100 is an aggregate filter, so it goes in HAVING. The first option is invalid — aggregates can't go in WHERE."
    },
    {
      id: "hv-04",
      question: "In what processing order does SQL evaluate: WHERE, GROUP BY, HAVING?",
      options: [
        "HAVING → WHERE → GROUP BY",
        "WHERE → HAVING → GROUP BY",
        "GROUP BY → WHERE → HAVING",
        "WHERE → GROUP BY → HAVING"
      ],
      correct: 3,
      explanation: "SQL processes: FROM → JOIN → WHERE (filter rows) → GROUP BY (group) → HAVING (filter groups) → SELECT → ORDER BY → LIMIT."
    },
    {
      id: "hv-05",
      question: "Can you use both WHERE and HAVING in the same query?",
      options: [
        "No — they are mutually exclusive",
        "Yes — WHERE filters rows first, then HAVING filters the grouped results",
        "Only if there's no JOIN",
        "Only in MySQL"
      ],
      correct: 1,
      explanation: "Yes! WHERE + GROUP BY + HAVING works together: filter individual rows first, then filter groups."
    }
  ]
};

// ─── BATCH 11: CASE WHEN ───────────────────────────────────────────────────
const batch_case: QuizBatch = {
  id: "quiz-case",
  title: "CASE WHEN",
  icon: "shuffle",
  topic: "Analyze Data",
  difficulty: "intermediate",
  description: "SQL's if/else conditional logic inside queries.",
  questions: [
    {
      id: "cw-01",
      question: "What SQL keyword is equivalent to if/else logic inside a query?",
      options: [
        "IF…THEN…ELSE",
        "CASE WHEN…THEN…ELSE…END",
        "SWITCH…CASE",
        "CONDITIONAL"
      ],
      correct: 1,
      explanation: "CASE WHEN is SQL's conditional expression. It evaluates conditions top-to-bottom and returns the first match."
    },
    {
      id: "cw-02",
      question: "In a CASE WHEN chain, what happens if multiple conditions are TRUE?",
      options: [
        "All matching THEN values are returned",
        "An error is thrown",
        "The first TRUE condition's THEN value is used",
        "The last TRUE condition's THEN value is used"
      ],
      correct: 2,
      explanation: "CASE WHEN is evaluated top-to-bottom. The FIRST matching condition wins."
    },
    {
      id: "cw-03",
      question: "What is returned if NO condition matches and there's no ELSE clause?",
      options: ["An empty string", "Zero", "NULL", "An error"],
      correct: 2,
      explanation: "If no WHEN condition is TRUE and there's no ELSE, CASE WHEN returns NULL."
    },
    {
      id: "cw-04",
      question: "What does this return for a film with length = 95: `CASE WHEN length < 60 THEN 'Short' WHEN length <= 120 THEN 'Medium' ELSE 'Long' END`?",
      options: ["Short", "Medium", "Long", "NULL"],
      correct: 1,
      explanation: "95 is not < 60 (first fails). 95 <= 120 is TRUE, so 'Medium' is returned."
    },
    {
      id: "cw-05",
      question: "Where in a SQL query can a CASE WHEN expression appear?",
      options: [
        "Only in WHERE",
        "Only in SELECT",
        "In SELECT, WHERE, ORDER BY, and HAVING",
        "Only after GROUP BY"
      ],
      correct: 2,
      explanation: "CASE WHEN is an expression — it can appear anywhere an expression is valid: SELECT, WHERE, ORDER BY, HAVING."
    }
  ]
};

// ─── BATCH 12: INNER JOIN ──────────────────────────────────────────────────
const batch_inner_join: QuizBatch = {
  id: "quiz-inner-join",
  title: "INNER JOIN",
  icon: "link",
  topic: "Connect Data",
  difficulty: "intermediate",
  description: "Combining data from multiple related tables.",
  questions: [
    {
      id: "ij-01",
      question: "What does INNER JOIN return?",
      options: [
        "All rows from both tables",
        "All rows from the left table",
        "Only rows where the ON condition matches in BOTH tables",
        "All rows from the right table"
      ],
      correct: 2,
      explanation: "INNER JOIN returns only rows where the join condition finds a match in BOTH tables."
    },
    {
      id: "ij-02",
      question: "What does the ON clause specify in a JOIN?",
      options: [
        "Which table to read from first",
        "The condition linking rows between tables (usually FK = PK)",
        "Which columns to display",
        "The sort order"
      ],
      correct: 1,
      explanation: "ON specifies the join condition — typically matching a foreign key in one table to the primary key in another."
    },
    {
      id: "ij-03",
      question: "In `JOIN payment p ON c.customer_id = p.customer_id`, what does `p` stand for?",
      options: [
        "A column name",
        "A table alias for 'payment'",
        "A primary key indicator",
        "A parameter"
      ],
      correct: 1,
      explanation: "`p` is a table alias — a shorter name for 'payment' used throughout the query."
    },
    {
      id: "ij-04",
      question: "How do you join 3 tables: customer, rental, and film in sequence?",
      options: [
        "FROM customer, rental, film JOIN all three;",
        "JOIN customer TO rental TO film;",
        "FROM customer c JOIN rental r ON c.customer_id = r.customer_id JOIN film f ON r.film_id = f.film_id;",
        "FROM customer JOIN (rental JOIN film);"
      ],
      correct: 2,
      explanation: "Chain JOIN clauses sequentially — each JOIN adds another table with its own ON condition."
    },
    {
      id: "ij-05",
      question: "Why use JOIN with ON instead of selecting from multiple tables with commas?",
      options: [
        "JOIN is the same as comma syntax — just style",
        "JOIN with ON makes the link explicit and avoids accidental Cartesian products",
        "Comma syntax doesn't work in MySQL",
        "JOIN is faster only for large tables"
      ],
      correct: 1,
      explanation: "Comma syntax without a WHERE produces a Cartesian product. Explicit JOIN with ON is clearer and safer."
    }
  ]
};

// ─── BATCH 13: LEFT JOIN ───────────────────────────────────────────────────
const batch_left_join: QuizBatch = {
  id: "quiz-left-join",
  title: "LEFT JOIN & NULL Pattern",
  icon: "arrow-left",
  topic: "Connect Data",
  difficulty: "intermediate",
  description: "Keeping all rows from the left table, detecting missing matches.",
  questions: [
    {
      id: "lj-01",
      question: "What does LEFT JOIN return that INNER JOIN does not?",
      options: [
        "Rows from the right table with no match on the left",
        "All rows from the left table even when there's no match on the right",
        "Only matching rows from both tables",
        "A Cartesian product"
      ],
      correct: 1,
      explanation: "LEFT JOIN keeps ALL rows from the left table. Unmatched right-table columns appear as NULL."
    },
    {
      id: "lj-02",
      question: "In a LEFT JOIN, what value appears for right-table columns when there's no match?",
      options: ["0", "Empty string", "NULL", "'N/A'"],
      correct: 2,
      explanation: "When LEFT JOIN finds no matching row on the right side, all right-table columns are filled with NULL."
    },
    {
      id: "lj-03",
      question: "Which pattern finds customers who have made NO payments?",
      options: [
        "JOIN payment p WHERE p.amount = 0",
        "LEFT JOIN payment p ON c.customer_id = p.customer_id WHERE p.payment_id IS NULL",
        "WHERE NOT EXISTS payments",
        "OUTER JOIN payment p"
      ],
      correct: 1,
      explanation: "LEFT JOIN keeps all customers, then IS NULL on payment_id identifies those with no match (no payments)."
    },
    {
      id: "lj-04",
      question: "Why use `COUNT(r.rental_id)` instead of `COUNT(*)` when LEFT JOINing rentals?",
      options: [
        "They produce the same result",
        "COUNT(*) is slower",
        "COUNT(*) counts the NULL row too, giving 1 instead of 0 for customers with no rentals",
        "COUNT(r.rental_id) is invalid after a LEFT JOIN"
      ],
      correct: 2,
      explanation: "COUNT(*) counts the row itself (even if all right-side columns are NULL), giving 1 for unmatched rows. COUNT(r.rental_id) skips NULLs, correctly returning 0."
    },
    {
      id: "lj-05",
      question: "When should you use LEFT JOIN instead of INNER JOIN?",
      options: [
        "Always — it's safer than INNER JOIN",
        "Only when tables have no foreign key relationships",
        "When you need ALL records from the left table regardless of whether they have matches",
        "When you need better performance"
      ],
      correct: 2,
      explanation: "Use LEFT JOIN when you want all rows from the left table, including those without a matching record on the right."
    }
  ]
};

// ─── BATCH 14: JOIN + GROUP BY ─────────────────────────────────────────────
const batch_join_group: QuizBatch = {
  id: "quiz-join-group",
  title: "JOIN + GROUP BY",
  icon: "merge",
  topic: "Connect Data",
  difficulty: "intermediate",
  description: "Combining joins and aggregation for powerful reports.",
  questions: [
    {
      id: "jg-01",
      question: "Which query calculates how much each customer spent in total?",
      options: [
        "SELECT customer_id, amount FROM payment GROUP BY customer_id;",
        "SELECT c.first_name, SUM(p.amount) FROM customer c JOIN payment p ON c.customer_id = p.customer_id GROUP BY c.customer_id;",
        "SELECT SUM(amount) FROM payment JOIN customer;",
        "SELECT c.first_name, p.amount FROM customer c JOIN payment p ON c.customer_id = p.customer_id;"
      ],
      correct: 1,
      explanation: "JOIN connects customer and payment, then GROUP BY customer_id collapses their payments, and SUM adds them up."
    },
    {
      id: "jg-02",
      question: "After joining and grouping by customer_id, how do you find only customers who spent > $50?",
      options: [
        "WHERE SUM(p.amount) > 50",
        "FILTER SUM(p.amount) > 50",
        "HAVING SUM(p.amount) > 50",
        "LIMIT SUM > 50"
      ],
      correct: 2,
      explanation: "SUM(p.amount) > 50 is an aggregate condition on a group — it must be HAVING, not WHERE."
    },
    {
      id: "jg-03",
      question: "In `GROUP BY c.customer_id, c.first_name, c.last_name`, why include first_name and last_name?",
      options: [
        "For performance reasons",
        "Because they're in SELECT and aren't aggregated — they must appear in GROUP BY",
        "To sort the results",
        "It's optional — only customer_id is required"
      ],
      correct: 1,
      explanation: "The Golden Rule: any column in SELECT that's not inside an aggregate function must appear in GROUP BY."
    },
    {
      id: "jg-04",
      question: "What does `COUNT(fc.film_id)` count when joining category to film_category and grouping by category?",
      options: [
        "Total films in the database",
        "The number of films in each category group",
        "The number of categories per film",
        "The sum of film IDs"
      ],
      correct: 1,
      explanation: "After GROUP BY category, COUNT(fc.film_id) counts how many film_category rows belong to each category group."
    },
    {
      id: "jg-05",
      question: "A many-to-many join (actor ↔ film through film_actor) requires how many JOIN clauses?",
      options: [
        "One JOIN",
        "Two JOINs — one to film_actor, one to film",
        "Three JOINs",
        "No JOIN needed"
      ],
      correct: 1,
      explanation: "actor → film_actor → film requires 2 JOINs. You can't jump directly; the relationship goes through the junction table."
    }
  ]
};

// ─── BATCH 15: Subqueries ─────────────────────────────────────────────────
const batch_subqueries: QuizBatch = {
  id: "quiz-subqueries",
  title: "Subqueries",
  icon: "layers",
  topic: "Complex Queries",
  difficulty: "advanced",
  description: "Queries nested inside other queries.",
  questions: [
    {
      id: "sq-01",
      question: "What is a subquery?",
      options: [
        "A stored procedure in the database",
        "A query written inside another query, wrapped in parentheses",
        "A query that uses more than 3 tables",
        "A query with a GROUP BY clause"
      ],
      correct: 1,
      explanation: "A subquery is a complete SQL query nested inside another query, always wrapped in parentheses."
    },
    {
      id: "sq-02",
      question: "What type of subquery returns exactly ONE value (one row, one column)?",
      options: ["Correlated subquery", "Table subquery", "Scalar subquery", "Aggregate subquery"],
      correct: 2,
      explanation: "A scalar subquery returns a single value. It can be used in WHERE with comparison operators like >, =, <."
    },
    {
      id: "sq-03",
      question: "Which query finds films priced ABOVE the average rental rate?",
      options: [
        "SELECT title FROM film WHERE rental_rate > AVG(rental_rate);",
        "SELECT title FROM film WHERE rental_rate > (SELECT AVG(rental_rate) FROM film);",
        "SELECT title FROM film HAVING rental_rate > AVG(rental_rate);",
        "SELECT title, AVG(rental_rate) FROM film WHERE rental_rate > average;"
      ],
      correct: 1,
      explanation: "AVG() can't appear directly in WHERE — wrap it in a scalar subquery: (SELECT AVG(rental_rate) FROM film)."
    },
    {
      id: "sq-04",
      question: "In `WHERE customer_id IN (SELECT customer_id FROM payment WHERE amount > 10)`, the subquery returns what?",
      options: [
        "A single average amount",
        "A list of customer_ids who have a payment > $10",
        "All payments greater than $10",
        "The count of qualifying customers"
      ],
      correct: 1,
      explanation: "The subquery returns a list of customer_ids. IN then checks if the outer query's customer_id is in that list."
    },
    {
      id: "sq-05",
      question: "When should you prefer a JOIN over a subquery?",
      options: [
        "Always — JOINs are always better",
        "When you need columns from both tables in the result",
        "When the subquery is in the WHERE clause",
        "Only when using GROUP BY"
      ],
      correct: 1,
      explanation: "If you need to SELECT data from both tables, use JOIN. If you only need to filter based on another table's data, a subquery can work."
    }
  ]
};

// ─── BATCH 16: SQL Query Order ─────────────────────────────────────────────
const batch_query_order: QuizBatch = {
  id: "quiz-query-order",
  title: "SQL Processing Order",
  icon: "refresh",
  topic: "Patterns & Concepts",
  difficulty: "advanced",
  description: "Understanding how SQL actually executes a query.",
  questions: [
    {
      id: "qo-01",
      question: "In what order does SQL INTERNALLY process a query's clauses?",
      options: [
        "SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT",
        "FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
        "WHERE → FROM → SELECT → GROUP BY → ORDER BY → HAVING → LIMIT",
        "FROM → SELECT → WHERE → HAVING → GROUP BY → ORDER BY → LIMIT"
      ],
      correct: 1,
      explanation: "SQL processes: FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT."
    },
    {
      id: "qo-02",
      question: "Why can't you use a SELECT alias in a WHERE clause?",
      options: [
        "You can — aliases work everywhere",
        "Because WHERE is processed BEFORE SELECT, so the alias doesn't exist yet",
        "Because aliases only work with GROUP BY",
        "SQL syntax doesn't support aliases in WHERE"
      ],
      correct: 1,
      explanation: "WHERE is evaluated before SELECT in SQL's processing order. The alias defined in SELECT doesn't exist yet when WHERE runs."
    },
    {
      id: "qo-03",
      question: "Can you use a SELECT alias in ORDER BY?",
      options: [
        "No — ORDER BY only sees column names",
        "Yes — ORDER BY is processed after SELECT, so aliases are available",
        "Only in MySQL, not in standard SQL",
        "Only with numeric aliases (ORDER BY 1, 2)"
      ],
      correct: 1,
      explanation: "ORDER BY is processed AFTER SELECT, so SELECT aliases are available. MySQL and SQLite both support this."
    },
    {
      id: "qo-04",
      question: "Why does HAVING work with aggregates but WHERE does not?",
      options: [
        "They are functionally identical — it's just a syntax rule",
        "HAVING is processed after GROUP BY when aggregate values exist; WHERE is processed before grouping",
        "WHERE is for strings and HAVING is for numbers",
        "Aggregates require HAVING as a SQL standard rule for readability"
      ],
      correct: 1,
      explanation: "WHERE runs before GROUP BY — no groups exist yet. HAVING runs after GROUP BY when each group's aggregate is already computed."
    },
    {
      id: "qo-05",
      question: "In the processing order, when does LIMIT take effect?",
      options: [
        "Before WHERE — to reduce the data loaded",
        "After FROM but before SELECT",
        "Last — after ORDER BY",
        "At the same time as WHERE"
      ],
      correct: 2,
      explanation: "LIMIT is the very last step — it truncates the final sorted result set. That's why it works correctly with ORDER BY."
    }
  ]
};

// ─── BATCH 17: Keys & Relationships ───────────────────────────────────────
const batch_keys: QuizBatch = {
  id: "quiz-keys",
  title: "Primary Keys & Foreign Keys",
  icon: "key",
  topic: "Connect Data",
  difficulty: "beginner",
  description: "Understanding how tables relate through keys.",
  questions: [
    {
      id: "pk-01",
      question: "What is the purpose of a primary key?",
      options: [
        "To sort the table rows",
        "To uniquely identify each row in a table",
        "To link two tables together",
        "To store the most important column"
      ],
      correct: 1,
      explanation: "A primary key uniquely identifies every row. No two rows can share the same primary key value, and it can't be NULL."
    },
    {
      id: "pk-02",
      question: "What is a foreign key?",
      options: [
        "A key that comes from another country's database",
        "A column that references the primary key of another table",
        "The second most important column in a table",
        "An encrypted key for security"
      ],
      correct: 1,
      explanation: "A foreign key is a column that points to (references) a primary key in another table, creating a relationship."
    },
    {
      id: "pk-03",
      question: "In Sakila, `payment.customer_id` is a foreign key pointing to which table?",
      options: ["rental", "film", "customer", "actor"],
      correct: 2,
      explanation: "payment.customer_id references customer.customer_id — it links each payment to the customer who made it."
    },
    {
      id: "pk-04",
      question: "What kind of relationship exists between `film` and `actor` in Sakila?",
      options: [
        "One-to-one",
        "One-to-many",
        "Many-to-many (via film_actor junction table)",
        "No relationship"
      ],
      correct: 2,
      explanation: "A film can have many actors; an actor can appear in many films. This is a many-to-many relationship via the film_actor junction table."
    },
    {
      id: "pk-05",
      question: "The `rental` table has both `film_id` and `customer_id`. What does this tell you?",
      options: [
        "Rental has a one-to-one relationship with both tables",
        "Rental records which customer rented which film — it connects two tables via foreign keys",
        "It means rental is the primary table in the database",
        "It's a design error — a table should only have one foreign key"
      ],
      correct: 1,
      explanation: "Multiple foreign keys in one table is normal — it shows that a rental involves a customer (customer_id) renting a specific film (film_id)."
    }
  ]
};

// ─── BATCH 18: Sakila Mixed Practice ──────────────────────────────────────
const batch_sakila_mixed: QuizBatch = {
  id: "quiz-sakila-mixed",
  title: "Sakila Mixed Practice",
  icon: "film",
  topic: "All Topics",
  difficulty: "advanced",
  description: "Real-world questions using the Sakila rental database — combining everything you've learned.",
  questions: [
    {
      id: "sm-01",
      question: "Which Sakila table acts as a junction between `film` and `category`?",
      options: ["film_actor", "film_category", "rental", "category_film"],
      correct: 1,
      explanation: "film_category is the junction table linking films to their categories (many-to-many relationship)."
    },
    {
      id: "sm-02",
      question: "How do you find the total amount paid by customer_id = 1?",
      options: [
        "SELECT amount FROM payment WHERE customer_id = 1;",
        "SELECT SUM(amount) FROM payment WHERE customer_id = 1;",
        "SELECT COUNT(amount) FROM payment WHERE customer_id = 1;",
        "SELECT total FROM payment WHERE customer_id = 1;"
      ],
      correct: 1,
      explanation: "SUM(amount) with WHERE customer_id = 1 adds all payments for that specific customer."
    },
    {
      id: "sm-03",
      question: "To get the number of films each actor appeared in, which join direction is correct?",
      options: [
        "film → film_category → category",
        "actor → film_actor (COUNT film_id per actor)",
        "actor → rental → film",
        "customer → payment → film"
      ],
      correct: 1,
      explanation: "Actor appearances: JOIN film_actor ON actor.actor_id = film_actor.actor_id, then GROUP BY actor and COUNT(film_actor.film_id)."
    },
    {
      id: "sm-04",
      question: "A customer's `active` column is 0. What does that mean?",
      options: [
        "They have 0 rentals",
        "They've been deactivated / are inactive",
        "Their account is new",
        "They owe $0 in payments"
      ],
      correct: 1,
      explanation: "In Sakila, `active = 1` means active customer. `active = 0` means deactivated — a soft-delete pattern."
    },
    {
      id: "sm-05",
      question: "Which query finds all films rented but NOT yet returned?",
      options: [
        "SELECT * FROM rental WHERE return_date = 0;",
        "SELECT * FROM rental WHERE return_date IS NULL;",
        "SELECT * FROM rental WHERE return_date NOT EXISTS;",
        "SELECT * FROM rental WHERE return_date = '';"
      ],
      correct: 1,
      explanation: "A missing return_date is stored as NULL. IS NULL is the correct check for unreturned films."
    }
  ]
};

// ─── Export All Batches ────────────────────────────────────────────────────
export const quizBatches: QuizBatch[] = [
  batch_select_from,
  batch_where,
  batch_logical,
  batch_in_between,
  batch_null,
  batch_like,
  batch_order_limit,
  batch_aggregates,
  batch_group_by,
  batch_having,
  batch_case,
  batch_inner_join,
  batch_left_join,
  batch_join_group,
  batch_subqueries,
  batch_query_order,
  batch_keys,
  batch_sakila_mixed,
];
