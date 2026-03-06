export type ProjectType = {
  id: string;
  name: string;
  type?: "MOBILE" | "WEB";
  theme: string;
  thumbnail?: string;
  frames: FrameType[];
  createdAt: Date;
  updatedAt?: Date;
};

export type FrameType = {
  id: string;
  title: string;
  htmlContent: string;
  projectId?: string;
  createdAt?: Date;
  updatedAt?: Date;

  isLoading?: boolean;
};
