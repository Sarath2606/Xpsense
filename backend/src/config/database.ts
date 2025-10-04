/**
 * Database Configuration
 * Handles different database URL formats for Railway deployment
 */

export function getDatabaseUrl(): string {
  // Check for different Railway database URL formats
  const possibleUrls = [
    process.env.DATABASE_URL,
    process.env.DATABASE_PUBLIC_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PUBLIC_URL,
    process.env.PG_URL,
    process.env.PG_PUBLIC_URL
  ];

  // Find the first available URL
  const databaseUrl = possibleUrls.find(url => url && url.trim() !== '');
  
  if (!databaseUrl) {
    throw new Error(
      'No database URL found. Please set one of these environment variables:\n' +
      '- DATABASE_URL (recommended for Railway internal services)\n' +
      '- DATABASE_PUBLIC_URL (for external connections)\n' +
      '- POSTGRES_URL\n' +
      '- POSTGRES_PUBLIC_URL\n' +
      '- PG_URL\n' +
      '- PG_PUBLIC_URL'
    );
  }

  console.log(`🔗 Using database URL: ${databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
  return databaseUrl;
}

// Set the DATABASE_URL environment variable for Prisma
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}
