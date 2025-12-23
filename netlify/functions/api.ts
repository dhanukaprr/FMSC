import { Handler } from '@netlify/functions';
import { Client } from 'pg';

export const handler: Handler = async (event) => {
  // Use the specific environment variables provided by Netlify's Neon integration
  const dbUrl = 
    process.env.NETLIFY_DATABASE_URL || 
    process.env.NETLIFY_DATABASE_URL_UNPOOLED || 
    process.env.DATABASE_URL;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (!dbUrl) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: 'Database connection string is missing.',
        debug: {
          checked: ['NETLIFY_DATABASE_URL', 'NETLIFY_DATABASE_URL_UNPOOLED', 'DATABASE_URL']
        },
        help: 'Ensure your Neon integration is connected in Netlify or manually set NETLIFY_DATABASE_URL.'
      }) 
    };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { httpMethod, body, queryStringParameters } = event;

    // Health Check / Connection Test
    if (queryStringParameters?.test === 'true') {
      const dbRes = await client.query('SELECT NOW()');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          status: 'ok', 
          message: 'Connected to Neon successfully.',
          source: process.env.NETLIFY_DATABASE_URL ? 'NETLIFY_DATABASE_URL' : (process.env.NETLIFY_DATABASE_URL_UNPOOLED ? 'NETLIFY_DATABASE_URL_UNPOOLED' : 'DATABASE_URL'),
          time: dbRes.rows[0].now 
        })
      };
    }

    // Handle Fetching (GET)
    if (httpMethod === 'GET') {
      const reportsRes = await client.query('SELECT * FROM reports ORDER BY period DESC');
      const entriesRes = await client.query('SELECT * FROM report_entries');
      
      const reports = reportsRes.rows.map(r => ({
        id: r.id,
        period: r.period,
        status: r.status,
        departmentId: r.department_id,
        createdBy: r.created_by,
        submittedAt: r.submitted_at,
        selectedGoals: r.selected_goals || [],
        entries: entriesRes.rows
          .filter(e => e.report_id === r.id)
          .map(e => ({
            id: e.id,
            reportId: e.report_id,
            objectiveId: e.objective_id,
            status: e.status,
            narrative: e.narrative,
            metrics: e.metrics,
            challenges: e.challenges,
            supportNeeded: e.support_needed,
            evidenceUrl: e.evidence_url,
            createdAt: e.created_at
          }))
      }));
      
      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify(reports) 
      };
    }

    // Handle Saving (POST)
    if (httpMethod === 'POST') {
      const report = JSON.parse(body || '{}');
      
      if (!report.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing report ID' }) };
      }

      // Upsert report
      await client.query(`
        INSERT INTO reports (id, department_id, period, status, created_by, submitted_at, selected_goals)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          submitted_at = EXCLUDED.submitted_at,
          selected_goals = EXCLUDED.selected_goals
      `, [
        report.id, 
        report.departmentId, 
        report.period, 
        report.status, 
        report.createdBy, 
        report.submittedAt || null, 
        JSON.stringify(report.selectedGoals || [])
      ]);

      // Refresh entries for this report
      await client.query('DELETE FROM report_entries WHERE report_id = $1', [report.id]);
      
      if (report.entries && report.entries.length > 0) {
        for (const entry of report.entries) {
          await client.query(`
            INSERT INTO report_entries (
              id, report_id, objective_id, status, narrative, metrics, challenges, support_needed, evidence_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            entry.id, 
            report.id, 
            entry.objectiveId, 
            entry.status, 
            entry.narrative || null, 
            entry.metrics || null, 
            entry.challenges || null, 
            entry.supportNeeded || null, 
            entry.evidenceUrl || null
          ]);
        }
      }

      return { 
        statusCode: 200, 
        headers,
        body: JSON.stringify({ success: true }) 
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err: any) {
    console.error("Database Error:", err);
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: err.message,
        hint: "Ensure the SQL schema has been applied in the Neon console. Specifically check if selected_goals column exists and is of type jsonb or text."
      }) 
    };
  } finally {
    await client.end();
  }
};