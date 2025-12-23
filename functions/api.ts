
import { Handler } from '@netlify/functions';
import { Client } from 'pg';

export const handler: Handler = async (event) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const { httpMethod, path, body } = event;

    // GET /reports
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reports) 
      };
    }

    // POST /reports (Upsert)
    if (httpMethod === 'POST') {
      const report = JSON.parse(body || '{}');
      
      if (!report.id) {
        return { statusCode: 400, body: 'Missing report ID' };
      }

      // Upsert the main Report
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
        report.selectedGoals || []
      ]);

      // Handle Entries: Clean existing for this report and replace
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ success: true }) 
      };
    }

    return { statusCode: 404, body: 'Not Found' };
  } catch (err: any) {
    console.error("Database Error:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: err.message }) 
    };
  } finally {
    await client.end();
  }
};
