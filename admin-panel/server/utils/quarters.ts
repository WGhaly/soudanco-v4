// Quarter utility functions for reward system

export interface QuarterInfo {
  quarter: number;
  year: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Get quarter number (1-4) from a date
 */
export function getQuarterFromDate(date: Date): number {
  const month = date.getMonth() + 1; // 1-12
  return Math.ceil(month / 3);
}

/**
 * Get current quarter info
 */
export function getCurrentQuarter(): QuarterInfo {
  const now = new Date();
  const quarter = getQuarterFromDate(now);
  const year = now.getFullYear();
  
  return {
    quarter,
    year,
    ...getQuarterDateRange(quarter, year)
  };
}

/**
 * Get start and end dates for a specific quarter
 */
export function getQuarterDateRange(quarter: number, year: number): { startDate: Date; endDate: Date } {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be between 1 and 4');
  }

  const startMonth = (quarter - 1) * 3; // 0, 3, 6, 9
  const endMonth = startMonth + 2; // 2, 5, 8, 11

  const startDate = new Date(year, startMonth, 1, 0, 0, 0, 0);
  const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999); // Last day of month

  return { startDate, endDate };
}

/**
 * Get all quarters for a year
 */
export function getYearQuarters(year: number): QuarterInfo[] {
  return [1, 2, 3, 4].map(quarter => ({
    quarter,
    year,
    ...getQuarterDateRange(quarter, year)
  }));
}

/**
 * Format quarter label (e.g., "Q1 2024")
 */
export function formatQuarterLabel(quarter: number, year: number): string {
  return `Q${quarter} ${year}`;
}

/**
 * Format quarter label in Arabic (e.g., "الربع الأول 2024")
 */
export function formatQuarterLabelAr(quarter: number, year: number): string {
  const quarterNames = [
    'الربع الأول',
    'الربع الثاني', 
    'الربع الثالث',
    'الربع الرابع'
  ];
  return `${quarterNames[quarter - 1]} ${year}`;
}

/**
 * Get previous quarter
 */
export function getPreviousQuarter(quarter: number, year: number): QuarterInfo {
  if (quarter === 1) {
    return {
      quarter: 4,
      year: year - 1,
      ...getQuarterDateRange(4, year - 1)
    };
  }
  return {
    quarter: quarter - 1,
    year,
    ...getQuarterDateRange(quarter - 1, year)
  };
}

/**
 * Get next quarter
 */
export function getNextQuarter(quarter: number, year: number): QuarterInfo {
  if (quarter === 4) {
    return {
      quarter: 1,
      year: year + 1,
      ...getQuarterDateRange(1, year + 1)
    };
  }
  return {
    quarter: quarter + 1,
    year,
    ...getQuarterDateRange(quarter + 1, year)
  };
}

/**
 * Check if a date falls within a specific quarter
 */
export function isDateInQuarter(date: Date, quarter: number, year: number): boolean {
  const { startDate, endDate } = getQuarterDateRange(quarter, year);
  return date >= startDate && date <= endDate;
}
