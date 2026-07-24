export type UserMe = {
  id: string;
  name: string;
  email: string;
  customInstructions: string;
};

export type WorkspaceProject = {
  _id: string;
  name: string;
  status: string;
  busyAt?: number;
  previewUrl?: string;
  boxId?: string;
  error?: string;
  modelId?: string;
  publishStatus?: string;
  publishedUrl?: string;
  publishError?: string;
  cfSubdomain?: string;
  customDomain?: string;
  customDomainStatus?: string;
};
