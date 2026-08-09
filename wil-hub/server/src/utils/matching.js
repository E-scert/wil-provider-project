/**
 * Proposes matches between students and approved, open WIL programs based on skill
 * overlap (Postgres array `&&` operator — true if the two arrays share any element).
 * Skips any student+program pair that already has a match row of any status, so
 * running this repeatedly is safe and only ever adds genuinely new proposals.
 *
 * Matches are attributed to the institution that ran the match, since the schema has
 * no fixed student->institution link (see db/optional-schema-additions.sql).
 */
async function generateMatches(client, institutionId) {
  const { rows } = await client.query(
    `INSERT INTO matches (student_id, program_id, institution_id, match_status)
     SELECT s.student_id, p.program_id, $1, 'proposed'
     FROM students s
     CROSS JOIN wil_programs p
     WHERE p.posting_status = 'approved'
       AND p.slots_open > 0
       AND s.skills && p.required_skills
       AND NOT EXISTS (
         SELECT 1 FROM matches m WHERE m.student_id = s.student_id AND m.program_id = p.program_id
       )
     RETURNING *`,
    [institutionId]
  );
  return rows;
}

module.exports = { generateMatches };
