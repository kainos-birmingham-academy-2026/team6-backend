-- Adds 20 open job roles. Idempotent: skips any roleName that already exists.
INSERT INTO "job-roles" (
  "roleName", "location", "capabilityId", "bandId", "closingDate",
  "description", "resposibilities", "sharepointUrl", "statusId", "numberOfOpenPositions"
)
SELECT
  r.role_name, r.location, r.capability_id, r.band_id,
  NOW() + (r.days || ' days')::INTERVAL,
  r.description, r.responsibilities, r.sharepoint_url, 1, r.open_positions
FROM (VALUES
  ('Junior Backend Developer','Birmingham',1,1,30,'Start your backend engineering career building APIs and services.','Write and test API endpoints, fix defects, learn our delivery standards.','https://kainos.sharepoint.com/job-roles/junior-backend-developer',4),
  ('Backend Team Lead','London',1,4,45,'Lead a backend team delivering high-throughput services.','Own architecture decisions, mentor engineers, manage delivery risk.','https://kainos.sharepoint.com/job-roles/backend-team-lead',1),
  ('Java Developer','Belfast',1,2,60,'Build enterprise Java applications for public sector clients.','Develop Spring Boot services, write unit tests, support releases.','https://kainos.sharepoint.com/job-roles/java-developer',3),
  ('Node.js Developer','Remote',1,2,38,'Develop Node.js microservices on a modern cloud platform.','Build REST APIs, integrate third-party services, monitor production.','https://kainos.sharepoint.com/job-roles/nodejs-developer',2),
  ('API Integration Engineer','Manchester',1,3,52,'Connect client systems through robust, well-documented APIs.','Design integration contracts, handle auth flows, troubleshoot live issues.','https://kainos.sharepoint.com/job-roles/api-integration-engineer',2),
  ('React Developer','London',2,2,40,'Build accessible React interfaces used by thousands daily.','Develop components, meet WCAG standards, optimise bundle size.','https://kainos.sharepoint.com/job-roles/react-developer',3),
  ('Senior Frontend Developer','Birmingham',2,4,55,'Set the frontend technical direction across multiple squads.','Define patterns, review code, drive performance improvements.','https://kainos.sharepoint.com/job-roles/senior-frontend-developer',1),
  ('UI Engineer','Remote',2,2,33,'Turn design systems into reusable production components.','Build component libraries, document usage, pair with designers.','https://kainos.sharepoint.com/job-roles/ui-engineer',2),
  ('Accessibility Specialist','Leeds',2,3,47,'Ensure our products are usable by everyone.','Audit interfaces, advise teams, run assistive technology testing.','https://kainos.sharepoint.com/job-roles/accessibility-specialist',1),
  ('Cloud Platform Engineer','Manchester',3,3,50,'Build and run the cloud platform our products deploy to.','Manage Terraform modules, improve observability, handle incidents.','https://kainos.sharepoint.com/job-roles/cloud-platform-engineer',2),
  ('Site Reliability Engineer','Remote',3,4,42,'Keep critical services reliable and performant at scale.','Define SLOs, automate recovery, lead post-incident reviews.','https://kainos.sharepoint.com/job-roles/site-reliability-engineer',1),
  ('Infrastructure Engineer','Belfast',3,2,58,'Provision and maintain secure infrastructure as code.','Write Terraform, manage networking, apply security baselines.','https://kainos.sharepoint.com/job-roles/infrastructure-engineer',2),
  ('Security Engineer','London',3,4,36,'Embed security across our delivery lifecycle.','Run threat modelling, triage vulnerabilities, advise on remediation.','https://kainos.sharepoint.com/job-roles/security-engineer',1),
  ('Machine Learning Engineer','Birmingham',4,3,44,'Take models from notebook to production.','Build training pipelines, deploy models, monitor drift.','https://kainos.sharepoint.com/job-roles/machine-learning-engineer',2),
  ('Data Engineer','Leeds',4,2,62,'Build the pipelines that power our analytics.','Develop ETL jobs, model warehouses, ensure data quality.','https://kainos.sharepoint.com/job-roles/data-engineer',3),
  ('Data Analyst','Remote',4,1,28,'Turn raw data into decisions stakeholders can act on.','Build dashboards, run analyses, present findings.','https://kainos.sharepoint.com/job-roles/data-analyst',2),
  ('Senior Data Scientist','London',4,4,49,'Lead data science engagements end to end.','Frame problems, build models, communicate results to executives.','https://kainos.sharepoint.com/job-roles/senior-data-scientist',1),
  ('Automation Test Engineer','Manchester',5,2,35,'Build the automated suites that guard our releases.','Write Playwright tests, maintain CI pipelines, report coverage.','https://kainos.sharepoint.com/job-roles/automation-test-engineer',3),
  ('Performance Test Engineer','Belfast',5,3,53,'Prove our systems hold up under real-world load.','Design load models, run performance tests, identify bottlenecks.','https://kainos.sharepoint.com/job-roles/performance-test-engineer',1),
  ('QA Manager','Birmingham',5,4,65,'Own the quality strategy across a client portfolio.','Lead the QA function, set standards, manage stakeholders.','https://kainos.sharepoint.com/job-roles/qa-manager',1)
) AS r(
  role_name, location, capability_id, band_id, days,
  description, responsibilities, sharepoint_url, open_positions
)
WHERE NOT EXISTS (
  SELECT 1 FROM "job-roles" jr WHERE jr."roleName" = r.role_name
);
