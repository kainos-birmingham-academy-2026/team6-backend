import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.applications.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.capability.deleteMany();
  await prisma.band.deleteMany();
  await prisma.status.deleteMany();
  await prisma.user.deleteMany();

  // Create Capabilities
  console.log("📋 Creating capabilities...");
  const javascript = await prisma.capability.create({
    data: { capabilityName: "JavaScript" },
  });
  const react = await prisma.capability.create({
    data: { capabilityName: "React" },
  });
  const typescript = await prisma.capability.create({
    data: { capabilityName: "TypeScript" },
  });
  const nodejs = await prisma.capability.create({
    data: { capabilityName: "Node.js" },
  });
  const leadership = await prisma.capability.create({
    data: { capabilityName: "Leadership" },
  });
  const projectManagement = await prisma.capability.create({
    data: { capabilityName: "Project Management" },
  });
  const sql = await prisma.capability.create({
    data: { capabilityName: "SQL" },
  });
  const devops = await prisma.capability.create({
    data: { capabilityName: "DevOps" },
  });

  // Create Bands
  console.log("🎯 Creating bands...");
  const bandA = await prisma.band.create({
    data: { bandName: "Band A" },
  });
  const bandB = await prisma.band.create({
    data: { bandName: "Band B" },
  });
  const bandC = await prisma.band.create({
    data: { bandName: "Band C" },
  });

  // Create Status
  console.log("✅ Creating statuses...");
  const openStatus = await prisma.status.create({
    data: { statusName: "open" },
  });
  const closedStatus = await prisma.status.create({
    data: { statusName: "closed" },
  });

  // Create Job Roles
  console.log("🔨 Creating job roles...");
  const jobRoles = [
    {
      roleName: "Senior Frontend Engineer",
      location: "London",
      capabilityId: react.capabilityId,
      bandId: bandC.bandId,
      closingDate: new Date("2026-12-31"),
      statusId: openStatus.statusId,
      description: "Lead frontend development with React",
      numberOfOpenPositions: 2,
    },
    {
      roleName: "Full Stack Developer",
      location: "London",
      capabilityId: javascript.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date("2026-11-30"),
      statusId: openStatus.statusId,
      description: "Develop full stack applications",
      numberOfOpenPositions: 3,
    },
    {
      roleName: "TypeScript Specialist",
      location: "New York",
      capabilityId: typescript.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date("2026-10-15"),
      statusId: openStatus.statusId,
      description: "TypeScript expert for large-scale projects",
      numberOfOpenPositions: 1,
    },
    {
      roleName: "Backend Engineer",
      location: "San Francisco",
      capabilityId: nodejs.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date("2026-12-01"),
      statusId: openStatus.statusId,
      description: "Build scalable backend systems",
      numberOfOpenPositions: 2,
    },
    {
      roleName: "Tech Lead",
      location: "London",
      capabilityId: leadership.capabilityId,
      bandId: bandC.bandId,
      closingDate: new Date("2026-09-30"),
      statusId: openStatus.statusId,
      description: "Lead engineering team",
      numberOfOpenPositions: 1,
    },
    {
      roleName: "Project Manager",
      location: "Berlin",
      capabilityId: projectManagement.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date("2026-11-15"),
      statusId: openStatus.statusId,
      description: "Manage software projects",
      numberOfOpenPositions: 1,
    },
    {
      roleName: "Database Administrator",
      location: "Amsterdam",
      capabilityId: sql.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date("2026-12-20"),
      statusId: openStatus.statusId,
      description: "Manage and optimize databases",
      numberOfOpenPositions: 1,
    },
    {
      roleName: "DevOps Engineer",
      location: "Dublin",
      capabilityId: devops.capabilityId,
      bandId: bandB.bandId,
      closingDate: new Date("2026-10-31"),
      statusId: openStatus.statusId,
      description: "Build and maintain infrastructure",
      numberOfOpenPositions: 2,
    },
    {
      roleName: "React Developer",
      location: "Paris",
      capabilityId: react.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date("2026-11-20"),
      statusId: openStatus.statusId,
      description: "Frontend development with React",
      numberOfOpenPositions: 2,
    },
    {
      roleName: "JavaScript Engineer",
      location: "New York",
      capabilityId: javascript.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date("2026-12-10"),
      statusId: openStatus.statusId,
      description: "JavaScript development",
      numberOfOpenPositions: 3,
    },
    {
      roleName: "Junior Developer",
      location: "London",
      capabilityId: typescript.capabilityId,
      bandId: bandA.bandId,
      closingDate: new Date("2026-09-15"),
      statusId: openStatus.statusId,
      description: "Entry-level development position",
      numberOfOpenPositions: 5,
    },
    {
      roleName: "Senior Architect",
      location: "San Francisco",
      capabilityId: leadership.capabilityId,
      bandId: bandC.bandId,
      closingDate: new Date("2026-12-31"),
      statusId: openStatus.statusId,
      description: "Architect large-scale systems",
      numberOfOpenPositions: 1,
    },
  ];

  for (const role of jobRoles) {
    await prisma.jobRole.create({ data: role });
  }

  // Create test users
  console.log("👥 Creating test users...");
  await prisma.user.create({
    data: {
      email: "applicant@example.com",
      password: "hashedpassword123",
      userRole: "applicant",
    },
  });
  await prisma.user.create({
    data: {
      email: "recruiter@example.com",
      password: "hashedpassword123",
      userRole: "recruiter",
    },
  });

  console.log("✨ Database seed completed successfully!");
  console.log(`✅ Created 12 job roles`);
  console.log(`✅ Created 8 capabilities`);
  console.log(`✅ Created 3 bands`);
  console.log(`✅ Created 2 statuses`);
  console.log(`✅ Created 2 test users`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
