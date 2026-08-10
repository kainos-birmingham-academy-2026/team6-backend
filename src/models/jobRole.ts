export interface JobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capabilityId: number;
  bandId: number;
  closingDate: Date;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  statusId?: number;
  numberOfOpenPositions?: number;
}