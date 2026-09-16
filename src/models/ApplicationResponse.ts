export type MyApplicationResponse = {
  applicationId: number;
  applicationStatusName: string;
  jobRoleId: number;
  roleName: string;
  location: string;
  capabilityName: string;
  bandName: string;
  closingDate: Date;
};

export type JobRoleApplicationResponse = {
  applicationId: number;
  userId: number;
  email: string;
  applicationStatusName: string;
  cv: string;
};

export type AdminApplicationResponse = {
  applicationId: number;
  userId: number;
  email: string;
  applicationStatusName: string;
  jobRoleId: number;
  roleName: string;
};
