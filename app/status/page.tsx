import { StatusPage } from "../StatusPage";
import { JsonLd } from "../JsonLd";
import { pageSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "System Status | Stoatmod",
  description: "Live health for the Stoatmod bot, local AI model, API and dashboard, with measured uptime and recorded downtime history.",
  path: "/status",
});

export default function StatusRoute() {
  return <><JsonLd data={pageSchema({ title: "Stoatmod Service Status", description: "Live service health, local AI model status and recorded downtime history.", path: "/status" })} /><StatusPage /></>;
}
