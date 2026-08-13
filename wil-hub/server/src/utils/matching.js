/**
 * Proposes matches between students and approved, open WIL programs based on whether the
 * student's program_of_study is one of the program's eligible_courses (case-insensitive exact
 * match — see the note below on limitations). This mirrors how companies actually filter in
 * practice (by course/field, e.g. "Computer Science", "Informatics") rather than by a free-text
 * skills list, which is what real WIL postings look like (see the ZaiCode Labs flyer this was
 * modeled on: "We are looking for students in: Computer Science, Multimedia, Informatics,
 * Integrated Communication" — no skills mentioned at all).
 *
 * required_skills (on wil_programs) and skills (on students) are no longer used anywhere in
 * this app — matching, forms, and displays all run on program_of_study / eligible_courses now.
 * The columns themselves still exist in the database (dropping them is a separate, optional
 * migration — see db/migration-remove-skills.sql), they're just dead weight until you do.
 *
 * Skips any student+program pair that already has a match row of any status, so running this
 * repeatedly is safe and only ever adds genuinely new proposals.
 *
 * LIMITATION worth knowing: this is an exact string match after lowercasing/trimming (e.g. a
 * program listing "computer science" will match a student whose program_of_study is exactly
 * "Computer Science", but NOT one whose program is "BSc Computer Science" or "Computer
 * Science (Software Engineering)"). Real course names vary a lot in how they're written. If
 * that turns out to cause missed matches in practice, the fix is either (a) a shared, dropdown-
 * selected list of canonical course names both sides pick from instead of free text, or (b) a
 * fuzzy/substring match (e.g. ILIKE '%computer science%'). Left as exact-match for now since
 * that's a real design decision, not something to guess at silently.
 *
 * Matches are attributed to the institution that ran the match, since the schema has no fixed
 * student->institution link (see db/optional-schema-additions.sql).
 */
async function generateMatches(client, institutionId) {
  const { rows } = await client.query(
    `INSERT INTO matches (student_id, program_id, institution_id, match_status)
     SELECT s.student_id, p.program_id, $1, 'proposed'
     FROM students s
     CROSS JOIN wil_programs p
     WHERE p.posting_status = 'approved'
       AND p.slots_open > 0
       AND p.eligible_courses IS NOT NULL
       AND lower(trim(s.program_of_study)) = ANY(p.eligible_courses)
       AND NOT EXISTS (
         SELECT 1 FROM matches m WHERE m.student_id = s.student_id AND m.program_id = p.program_id
       )
     RETURNING *`,
    [institutionId]
  );
  return rows;
}

module.exports = { generateMatches };
