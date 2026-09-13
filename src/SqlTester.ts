// SqlTester: Deterministic Result Set Comparator & Auto-Grader

export interface SqlEvalOptions {
  requireOrder?: boolean;
  checkColumns?: boolean;
}

export interface SqlEvalResult {
  passed: boolean;
  message: string;
  diff?: {
    missingRows?: any[];
    extraRows?: any[];
    columnMismatch?: { user: string[]; reference: string[] };
  };
}

function normalizeValue(val: any): string {
  if (val === null || val === undefined) return "__NULL__";
  if (typeof val === "number") return String(Number(val.toFixed(4)));
  return String(val).trim();
}

function rowKey(row: Record<string, any>): string {
  const keys = Object.keys(row).sort();
  return keys.map(k => `${k}:${normalizeValue(row[k])}`).join("|");
}

export function evaluateSqlQuery(
  userRows: Record<string, any>[],
  referenceRows: Record<string, any>[],
  options: SqlEvalOptions = {}
): SqlEvalResult {
  const { requireOrder = false, checkColumns = true } = options;

  if (!Array.isArray(userRows) || !Array.isArray(referenceRows)) {
    return { passed: false, message: "Result sets must be arrays of rows." };
  }

  // 1. Row count comparison
  if (userRows.length !== referenceRows.length) {
    return {
      passed: false,
      message: `Row count mismatch: expected ${referenceRows.length} rows, but query returned ${userRows.length} rows.`,
      diff: {
        missingRows: referenceRows.slice(userRows.length),
        extraRows: userRows.slice(referenceRows.length)
      }
    };
  }

  if (referenceRows.length === 0) {
    return { passed: true, message: "Query returned 0 rows as expected." };
  }

  // 2. Column presence comparison
  if (checkColumns) {
    const userCols = Object.keys(userRows[0]).sort();
    const refCols = Object.keys(referenceRows[0]).sort();

    const missingCols = refCols.filter(c => !userCols.includes(c));
    if (missingCols.length > 0) {
      return {
        passed: false,
        message: `Missing column(s): ${missingCols.join(", ")}`,
        diff: { columnMismatch: { user: userCols, reference: refCols } }
      };
    }
  }

  // 3. Row comparison with order
  if (requireOrder) {
    for (let i = 0; i < referenceRows.length; i++) {
      const uRow = userRows[i];
      const rRow = referenceRows[i];
      const rKeys = Object.keys(rRow);

      for (const key of rKeys) {
        if (normalizeValue(uRow[key]) !== normalizeValue(rRow[key])) {
          return {
            passed: false,
            message: `Order mismatch at row ${i + 1} for column '${key}': expected '${rRow[key]}', got '${uRow[key]}'`
          };
        }
      }
    }
    return { passed: true, message: `All ${userRows.length} rows match reference query in exact order.` };
  }

  // 4. Row comparison without order
  const refCounts = new Map<string, number>();
  for (const r of referenceRows) {
    const key = rowKey(r);
    refCounts.set(key, (refCounts.get(key) || 0) + 1);
  }

  for (let i = 0; i < userRows.length; i++) {
    const key = rowKey(userRows[i]);
    const count = refCounts.get(key);
    if (!count || count <= 0) {
      return {
        passed: false,
        message: `Row ${i + 1} does not match any expected row in reference results.`
      };
    }
    refCounts.set(key, count - 1);
  }

  return { passed: true, message: `All ${userRows.length} rows match reference query results.` };
}

export function formatSqlDiff(userRows: Record<string, any>[], refRows: Record<string, any>[]) {
  return {
    userRowCount: userRows.length,
    referenceRowCount: refRows.length,
    userPreview: userRows.slice(0, 5),
    referencePreview: refRows.slice(0, 5)
  };
}
