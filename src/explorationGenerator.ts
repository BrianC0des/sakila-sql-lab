import type { SqlChallenge } from "./challenges";

interface SchemaTable {
  name: string;
  columns: string[];
}

/**
 * Automatically synthesizes introductory exploration milestones
 * for any newly imported SQLite database schema.
 */
export function generateExplorationMilestones(
  tables: SchemaTable[]
): SqlChallenge[] {
  if (!tables || tables.length === 0) return [];

  const challenges: SqlChallenge[] = [];
  const primaryTable = tables[0];
  const secondTable = tables.length > 1 ? tables[1] : null;

  // Milestone 1: Table inspection
  challenges.push({
    id: `auto-explore-${primaryTable.name}-peek`,
    title: `Explore: Sample 10 Rows from "${primaryTable.name}"`,
    description: `Inspect the first 10 rows from the \`${primaryTable.name}\` table to understand its structure and data. Select all columns (\`*\`) and limit the output to 10 records.`,
    difficulty: "beginner",
    requireOrder: false,
    hints: [
      `Use the basic SELECT * syntax on table "${primaryTable.name}".`,
      `Add a LIMIT clause: SELECT * FROM ${primaryTable.name} LIMIT 10;`
    ],
    starterQuery: "",
    referenceSolution: `SELECT * FROM ${primaryTable.name} LIMIT 10;`,
    isCustom: true
  });

  // Milestone 2: Row Count
  challenges.push({
    id: `auto-explore-${primaryTable.name}-count`,
    title: `Aggregation: Count Total Records in "${primaryTable.name}"`,
    description: `Determine the total volume of records in the \`${primaryTable.name}\` table using \`COUNT(*)\`. Alias the count as \`total_records\`.`,
    difficulty: "beginner",
    requireOrder: false,
    hints: [
      `Use COUNT(*) in your SELECT clause.`,
      `Alias with AS total_records: SELECT COUNT(*) AS total_records FROM ${primaryTable.name};`
    ],
    starterQuery: "",
    referenceSolution: `SELECT COUNT(*) AS total_records FROM ${primaryTable.name};`,
    isCustom: true
  });

  // Milestone 3: Column selection on primary table
  if (primaryTable.columns.length >= 2) {
    const selectedCols = primaryTable.columns.slice(0, 3);
    challenges.push({
      id: `auto-explore-${primaryTable.name}-cols`,
      title: `Projection: Specific Columns from "${primaryTable.name}"`,
      description: `Retrieve specific columns (\`${selectedCols.join("`, `")}\`) from \`${primaryTable.name}\`. Limit the output to 5 rows.`,
      difficulty: "beginner",
      requireOrder: false,
      hints: [
        `List the columns explicitly in your SELECT: ${selectedCols.join(", ")}.`,
        `Append LIMIT 5.`
      ],
      starterQuery: "",
      referenceSolution: `SELECT ${selectedCols.join(", ")} FROM ${primaryTable.name} LIMIT 5;`,
      isCustom: true
    });
  }

  // Milestone 4: Sort and Paginate
  const sortCol = primaryTable.columns[0] || "1";
  challenges.push({
    id: `auto-explore-${primaryTable.name}-sort`,
    title: `Sorting & Pagination: Sort "${primaryTable.name}" Descending`,
    description: `Order the records in \`${primaryTable.name}\` by \`${sortCol}\` in descending order (\`DESC\`). Retrieve 5 rows starting from offset 5 (\`LIMIT 5 OFFSET 5\`).`,
    difficulty: "intermediate",
    requireOrder: true,
    hints: [
      `Use ORDER BY ${sortCol} DESC.`,
      `Add pagination: LIMIT 5 OFFSET 5.`
    ],
    starterQuery: "",
    referenceSolution: `SELECT * FROM ${primaryTable.name} ORDER BY ${sortCol} DESC LIMIT 5 OFFSET 5;`,
    isCustom: true
  });

  // Milestone 5: Second table exploration (if available)
  if (secondTable) {
    challenges.push({
      id: `auto-explore-${secondTable.name}-count`,
      title: `Inspection: Sample Records from "${secondTable.name}"`,
      description: `Switch focus to the second table \`${secondTable.name}\`. Select all columns and limit to 5 rows.`,
      difficulty: "beginner",
      requireOrder: false,
      hints: [
        `Query table ${secondTable.name} with LIMIT 5.`,
        `SELECT * FROM ${secondTable.name} LIMIT 5;`
      ],
      starterQuery: "",
      referenceSolution: `SELECT * FROM ${secondTable.name} LIMIT 5;`,
      isCustom: true
    });
  }

  return challenges;
}
