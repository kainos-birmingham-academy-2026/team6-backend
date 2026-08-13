export type JobRoleDetailedResponse = {
  jobRoleId: number;
  roleName: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  location: string;
  capabilityId: number;
  capabilityName: string;
  bandId: number;
  bandName: string;
  closingDate: Date;
  statusName: string;
  numberOfOpenPositions?: number;
};
