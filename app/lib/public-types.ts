export type PublicServer = {
  server_id: string;
  server_name: string;
  server_icon_url: string | null;
  value: number;
};

export type PublicStats = {
  server_count: number;
  member_count: number;
  case_count: number;
  updated_at: string | null;
  top_servers: PublicServer[];
};

export type DiscoveryServer = {
  server_id: string;
  server_name: string;
  server_icon_url: string;
  server_banner_url: string;
  invite_url: string;
  tags: string[];
  member_count: number;
  daily_messages: number;
  global_rank: number | null;
  approved_at: string | null;
  last_bumped_at: string | null;
  description: string;
  information: string;
  updated_at: string;
};

export type PublicProofServer = Pick<
  DiscoveryServer,
  "server_id" | "server_name" | "server_icon_url" | "member_count" | "description"
> & { detail_url: string };
