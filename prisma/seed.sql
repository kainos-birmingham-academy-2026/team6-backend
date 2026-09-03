-- Local development seed data. Safe to re-run: inserts are skipped if rows already exist.

INSERT INTO "Status" ("statusName")
SELECT v FROM (VALUES ('open'), ('closed')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM "Status");

INSERT INTO "Capability" ("capabilityName")
SELECT v FROM (VALUES ('Engineering'), ('Business Analysis'), ('Product Management'), ('Design'), ('Quality Assurance')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM "Capability");

INSERT INTO "Band" ("bandName")
SELECT v FROM (VALUES ('Associate'), ('Consultant'), ('Principal'), ('Senior')) AS t(v)
WHERE NOT EXISTS (SELECT 1 FROM "Band");

INSERT INTO "job-roles" (
  "roleName", "location", "capabilityId", "bandId", "closingDate",
  "description", "resposibilities", "sharepointUrl", "statusId", "numberOfOpenPositions"
)
SELECT
  r.role_name,
  r.location,
  (SELECT "capabilityId" FROM "Capability" WHERE "capabilityName" = r.capability),
  (SELECT "bandId" FROM "Band" WHERE "bandName" = r.band),
  r.closing_date,
  r.description,
  r.responsibilities,
  r.sharepoint_url,
  (SELECT "statusId" FROM "Status" WHERE "statusName" = 'open'),
  r.open_positions
FROM (VALUES
  (
    'Software Engineer', 'Belfast', 'Engineering', 'Associate',
    NOW() + INTERVAL '60 days',
    'Build and maintain software products for our clients.',
    'Write clean code, review pull requests, support live services.',
    'https://kainos.sharepoint.com/job-roles/software-engineer',
    3
  ),
  (
    'Senior Software Engineer', 'London', 'Engineering', 'Consultant',
    NOW() + INTERVAL '45 days',
    'Lead delivery of technical solutions across multiple teams.',
    'Design systems, mentor engineers, own technical quality.',
    'https://kainos.sharepoint.com/job-roles/senior-software-engineer',
    2
  ),
  (
    'Business Analyst', 'Birmingham', 'Business Analysis', 'Associate',
    NOW() + INTERVAL '30 days',
    'Bridge the gap between business needs and technical delivery.',
    'Gather requirements, map processes, support user research.',
    'https://kainos.sharepoint.com/job-roles/business-analyst',
    1
  ),
  (
    'Lead Business Analyst', 'Remote', 'Business Analysis', 'Consultant',
    NOW() + INTERVAL '90 days',
    'Shape analysis practice across a portfolio of client accounts.',
    'Lead discovery phases, coach analysts, own stakeholder relationships.',
    'https://kainos.sharepoint.com/job-roles/lead-business-analyst',
    1
  ),
  (
    'Full Stack Developer', 'London', 'Engineering', 'Consultant',
    NOW() + INTERVAL '75 days',
    'Build end-to-end web applications.',
    'Develop frontend and backend features, optimize database queries.',
    'https://kainos.sharepoint.com/job-roles/fullstack-developer',
    2
  ),
  (
    'QA Engineer', 'Belfast', 'Quality Assurance', 'Associate',
    NOW() + INTERVAL '20 days',
    'Ensure product quality through comprehensive testing.',
    'Write test cases, perform regression testing, report bugs.',
    'https://kainos.sharepoint.com/job-roles/qa-engineer',
    4
  ),
  (
    'Product Manager', 'London', 'Product Management', 'Principal',
    NOW() + INTERVAL '50 days',
    'Drive product strategy and roadmap.',
    'Define features, work with stakeholders, measure success metrics.',
    'https://kainos.sharepoint.com/job-roles/product-manager',
    1
  ),
  (
    'UX Designer', 'Remote', 'Design', 'Senior',
    NOW() + INTERVAL '35 days',
    'Create beautiful and intuitive user experiences.',
    'Design wireframes, conduct user research, create prototypes.',
    'https://kainos.sharepoint.com/job-roles/ux-designer',
    2
  ),
  (
    'Junior Software Engineer', 'Belfast', 'Engineering', 'Associate',
    NOW() + INTERVAL '55 days',
    'Start your software engineering career with us.',
    'Learn best practices, write code under guidance, contribute to features.',
    'https://kainos.sharepoint.com/job-roles/junior-engineer',
    5
  ),
  (
    'DevOps Engineer', 'Remote', 'Engineering', 'Consultant',
    NOW() + INTERVAL '40 days',
    'Build and maintain cloud infrastructure.',
    'Manage CI/CD pipelines, monitor systems, optimize deployments.',
    'https://kainos.sharepoint.com/job-roles/devops-engineer',
    1
  ),
  (
    'Business Systems Analyst', 'Birmingham', 'Business Analysis', 'Senior',
    NOW() + INTERVAL '65 days',
    'Analyze and improve business processes.',
    'Map workflows, optimize systems, lead process improvements.',
    'https://kainos.sharepoint.com/job-roles/business-systems-analyst',
    2
  ),
  (
    'Quality Assurance Lead', 'London', 'Quality Assurance', 'Senior',
    NOW() + INTERVAL '25 days',
    'Lead the quality assurance team.',
    'Plan testing strategy, mentor QA team, report quality metrics.',
    'https://kainos.sharepoint.com/job-roles/qa-lead',
    1
  ),
  (
    'Backend Engineer', 'Remote', 'Engineering', 'Consultant',
    NOW() + INTERVAL '70 days',
    'Build scalable backend systems.',
    'Design APIs, optimize database performance, ensure reliability.',
    'https://kainos.sharepoint.com/job-roles/backend-engineer',
    3
  ),
  (
    'Frontend Engineer', 'London', 'Engineering', 'Associate',
    NOW() + INTERVAL '48 days',
    'Create responsive and accessible user interfaces.',
    'Develop React components, optimize performance, fix bugs.',
    'https://kainos.sharepoint.com/job-roles/frontend-engineer',
    2
  ),
  (
    'Technical Product Manager', 'Belfast', 'Product Management', 'Consultant',
    NOW() + INTERVAL '55 days',
    'Combine technical and product expertise.',
    'Define technical requirements, work with engineers, shape vision.',
    'https://kainos.sharepoint.com/job-roles/technical-pm',
    1
  )
) AS r(
  role_name, location, capability, band, closing_date,
  description, responsibilities, sharepoint_url, open_positions
)
WHERE NOT EXISTS (SELECT 1 FROM "job-roles");
