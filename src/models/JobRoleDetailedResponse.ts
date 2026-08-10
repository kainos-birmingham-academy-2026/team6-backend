export type JobRoleDetailedResponse = {
  jobRoleId: number;
  roleName: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  location: string;
  capabilityName: string;
  bandName: string;
  closingDate: Date;
  statusName: string;
  numberOfOpenPositions?: number;
};
