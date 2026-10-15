import { AppealPage } from "../AppealPage";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Appeal a decision | Stoatmod",
  description: "Securely review and appeal an eligible Stoatmod moderation decision.",
  path: "/appeal",
  index: false,
});
export default function AppealRoute(){return <AppealPage/>;}
