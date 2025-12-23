
import { Handler } from '@netlify/functions';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const handler: Handler = async (event) => {
  try {
    await client.connect();
    const { httpMethod, path, body } = event;

    // Route: /reports
    if (httpMethod === 'GET' && path.endsWith('/reports')) {
      const reportsRes = await client.query('SELECT * FROM reports');
      const entriesRes = await client.query('SELECT * FROM report_entries');
      
      const reports = reportsRes.rows.map(r => ({
        ...r,
        selectedGoals: r.selected_goals,
        departmentId: r.department_id,
        createdBy: r.created_by,
        submittedAt: r.submitted_at,
        entries: entriesRes.rows
          .filter(e => e.report_id === r.id)
          .map(e => ({
            ...e,
            reportId: e.report_id,
            objectiveId: e.objective_id,
            supportNeeded: e.support_needed,
            evidenceUrl: e.evidence_url,
            createdAt: e.created_at
          }))
      }));
      
      return { statusCode: 200, body: JSON.stringify(reports) };
    }

    if (httpMethod === 'POST' && path.endsWith('/reports')) {
      const report = JSON.parse(body || '{}');
      
      // Upsert Report
      await client.query(`
        INSERT INTO reports (id, department_id, period, status, created_by, submitted_at, selected_goals)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          submitted_at = EXCLUDED.submitted_at,
          selected_goals = EXCLUDED.selected_goals
      `, [report.id, report.departmentId, report.period, report.status, report.createdBy, report.submittedAt, report.selectedGoals]);

      // Sync Entries (Delete and Re-insert for simplicity in this demo, or use UPSERT)
      await client.query('DELETE FROM report_entries WHERE report_id = $1', [report.id]);
      for (const entry of report.entries) {
        await client.query(`
          INSERT INTO report_entries (id, report_id, objective_id, status, narrative, metrics, challenges, support_needed, evidence_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [entry.id, entry.reportId, entry.objectiveId, entry.status, entry.narrative, entry.metrics, entry.challenges, entry.supportNeeded, entry.evidenceUrl]);
      }

      return { statusCode: 200, body: JSON.stringify({ message: 'Saved successfully' }) };
    }

    return { statusCode: 404, body: 'Not Found' };
  } catch (err: any) {
    return { statusCode: 500, body: err.message };
  } finally {
    await client.end();
  }
};
