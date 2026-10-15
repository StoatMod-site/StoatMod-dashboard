export type FeatureGroup = "Protection" | "Moderation" | "Server tools";
export type FeatureProfile = {
  name: string;
  group: FeatureGroup;
  summary: string;
  headline: string;
  benefits: [string, string, string];
  workflow: { title: string; text: string }[];
  facts: { label: string; value: string }[];
  setup: { href: string; label: string };
};

export const featureGroups: FeatureGroup[] = ["Protection", "Moderation", "Server tools"];

export const featureProfiles: Record<string, FeatureProfile> = {
  automod: {
    name: "Automod", group: "Protection",
    summary: "Choose which content to flag and how the bot responds, with room for human review.",
    headline: "Your community. Your moderation rules.",
    benefits: ["Choose the categories that matter to your server.", "Observe, review or enforce with a policy for each category.", "Keep channel exclusions and moderator exemptions under your control."],
    workflow: [
      { title: "Choose what to watch", text: "Enable moderation categories and set the confidence needed for a match." },
      { title: "Set the response", text: "Decide whether a match should be observed, reviewed or acted on." },
      { title: "Review the outcome", text: "Use event history and eligible cases to understand what happened." },
    ],
    facts: [{ label: "Control", value: "Categories & thresholds" }, { label: "Configure in", value: "Policy Studio" }, { label: "Responses", value: "Observe · Review · Enforce" }],
    setup: { href: "/guides/how-to-create-a-stoat-moderation-policy", label: "Build your moderation policy" },
  },
  "spam-protection": {
    name: "Spam protection", group: "Protection",
    summary: "Catch repeated messages, rapid bursts and mass mentions with rules tuned to your server.",
    headline: "Keep the conversation moving.",
    benefits: ["Watch for repeats, bursts, flooding and mass mentions.", "Tune the counts and timing for your community’s pace.", "Set the timeout length and review the resulting warning."],
    workflow: [
      { title: "Spot a pattern", text: "The bot checks message rate, repeats, activity score and mentions." },
      { title: "Apply your limits", text: "The server’s saved thresholds decide when a spam rule triggers." },
      { title: "Give chat a pause", text: "A triggered rule can time out the member and record a warning." },
    ],
    facts: [{ label: "Control", value: "Per-server thresholds" }, { label: "Configure in", value: "Protection Centre" }, { label: "Covers", value: "Repeats · Bursts · Mentions" }],
    setup: { href: "/guides/how-to-stop-spam-and-mass-mentions-on-stoat", label: "Set up spam protection" },
  },
  "link-protection": {
    name: "Link protection", group: "Protection",
    summary: "Keep external links out of selected spaces, with exclusions for the channels that need them.",
    headline: "Set clear boundaries for links.",
    benefits: ["Recognise web addresses, bare domains and IP-address links.", "Remove matching messages without adding a routine warning.", "Use channel exclusions and the optional GIF allowance."],
    workflow: [
      { title: "Define the spaces", text: "Enable link protection and exclude channels where sharing is welcome." },
      { title: "Recognise the link", text: "The filter looks for supported external-link formats in a message." },
      { title: "Apply the rule", text: "The bot attempts to remove the message using its channel permissions." },
    ],
    facts: [{ label: "Purpose", value: "External-link filtering" }, { label: "Default", value: "Off until enabled" }, { label: "Exceptions", value: "Channels & GIF allowance" }],
    setup: { href: "/guides/how-to-block-external-links-on-stoat", label: "Configure link rules" },
  },
  "image-moderation": {
    name: "Image moderation", group: "Protection",
    summary: "Add optional checks for explicit sexual content and severe real-world violence in image uploads.",
    headline: "Bring image uploads into your policy.",
    benefits: ["Opt in to checks for two severe image-content categories.", "Use channel overrides where uploads need different rules.", "Choose observation, review or enforcement through your policy."],
    workflow: [
      { title: "Opt in", text: "Enable image scanning for the server and choose channel overrides." },
      { title: "Check an upload", text: "Eligible images are checked against the supported content categories." },
      { title: "Follow your policy", text: "Configured thresholds and actions decide the response to a match." },
    ],
    facts: [{ label: "Availability", value: "Experimental · Opt in" }, { label: "Control", value: "Server & channel settings" }, { label: "On check failure", value: "Upload stays in place" }],
    setup: { href: "/docs/automod", label: "Read the image setup guide" },
  },
  "join-protection": {
    name: "Join protection", group: "Protection",
    summary: "Give new accounts a private verification step and moderators a clear recovery path.",
    headline: "A more considered welcome.",
    benefits: ["Challenge eligible new accounts through a private verification link.", "Let moderators review and release a pending member.", "Keep account-age signals alongside the context your team needs."],
    workflow: [
      { title: "Check the new arrival", text: "Account age and the server’s verification settings determine eligibility." },
      { title: "Send a private check", text: "The member receives a verification link before the challenge is applied." },
      { title: "Complete or review", text: "A completed check releases the timeout; moderators have a bypass command." },
    ],
    facts: [{ label: "Verification", value: "Private member link" }, { label: "Default scope", value: "Accounts under 14 days" }, { label: "Recovery", value: "Moderator bypass" }],
    setup: { href: "/guides/how-to-protect-a-stoat-server-from-raids", label: "Plan your join protection" },
  },
  "moderation-cases": {
    name: "Moderation cases", group: "Moderation",
    summary: "Keep reasons, evidence and follow-up connected to the decisions your team makes.",
    headline: "Keep the reason with the decision.",
    benefits: ["Find eligible actions by case ID or member.", "Bring reasons, notes and supported evidence into one record.", "Track active warnings and follow a case through review."],
    workflow: [
      { title: "Take an action", text: "A warning or eligible moderation action creates a server-scoped case." },
      { title: "Keep the context", text: "Review the reason, action and available evidence; add follow-up notes." },
      { title: "Make the next decision", text: "Review the member’s history, remove a case or handle an eligible appeal." },
    ],
    facts: [{ label: "Records", value: "Reasons · Notes · Evidence" }, { label: "Scope", value: "Your server" }, { label: "Find by", value: "Case ID or member" }],
    setup: { href: "/guides/how-to-review-warnings-cases-and-appeals", label: "Learn the case review flow" },
  },
  "automatic-roles": {
    name: "Automatic roles", group: "Server tools",
    summary: "Give new members their starting roles without repeating the same manual task.",
    headline: "A consistent start for every member.",
    benefits: ["Assign one or several configured roles when someone joins.", "Manage the role list with short commands or the dashboard.", "Check permissions and hierarchy before relying on assignment."],
    workflow: [
      { title: "Choose the roles", text: "Add the role IDs that new members should receive." },
      { title: "Check access", text: "Give Stoatmod the required permissions and place it above those roles." },
      { title: "Welcome a member", text: "The bot attempts to assign the configured roles when a new member joins." },
    ],
    facts: [{ label: "Trigger", value: "New member joins" }, { label: "Role list", value: "One or several roles" }, { label: "Requires", value: "Permissions & hierarchy" }],
    setup: { href: "/guides/how-to-configure-automatic-roles-on-stoat", label: "Set up automatic roles" },
  },
  "moderation-statistics": {
    name: "Server statistics", group: "Server tools",
    summary: "Follow activity, member growth and moderation trends from your server dashboard.",
    headline: "See the patterns behind the activity.",
    benefits: ["Review message activity and the channels people use.", "Follow joins, leaves and net member growth.", "Put cases and moderation events alongside activity trends."],
    workflow: [
      { title: "Collect activity counts", text: "The statistics view uses aggregate activity rather than stored message text." },
      { title: "Explore the dashboard", text: "Compare channel activity, membership changes and moderation records." },
      { title: "Use the context", text: "Bring trends into team reviews and decisions about server policy." },
    ],
    facts: [{ label: "Access", value: "Private server dashboard" }, { label: "Activity data", value: "Aggregate counts" }, { label: "Public totals", value: "Visibility controlled" }],
    setup: { href: "/docs/dashboard", label: "Explore dashboard access" },
  },
  appeals: {
    name: "Appeals", group: "Moderation",
    summary: "Give members a private way to explain what happened and moderators a structured review path.",
    headline: "Make room for a second look.",
    benefits: ["Connect an eligible action to a private appeal code.", "Review the member’s statement and supporting evidence.", "Record a decision and reason, then verify any requested reversal."],
    workflow: [
      { title: "Open the appeal", text: "An eligible member uses their appeal code and matching Stoat user ID to access the private form." },
      { title: "Add context", text: "The member submits a statement and optional evidence for the team to review." },
      { title: "Record a decision", text: "A moderator accepts or denies the appeal with a reason." },
    ],
    facts: [{ label: "Access", value: "Appeal code + user ID" }, { label: "Review", value: "Statement & evidence" }, { label: "Decisions", value: "Accept or deny with reason" }],
    setup: { href: "/docs/appeals", label: "Understand the appeal process" },
  },
};
