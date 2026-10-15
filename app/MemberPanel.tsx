type CaseRecord = {
  reference_id: string;
  action: string;
  reason: string;
  status: string;
  created_at: string;
};

export type MemberRecord = {
  user_id: string;
  username: string;
  display_name: string | null;
  discriminator: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  joined_at: string | null;
  account_created_at: string | null;
  role_ids: string[];
  is_bot: boolean;
  online: boolean;
  timed_out_until: string | null;
  case_count: number;
  active_warning_count?: number;
  cases?: CaseRecord[];
};

type Role = { role_id: string; role_name: string };
type MemberAction = "warn" | "mute" | "kick" | "ban";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MemberAvatar({ member }: { member: MemberRecord }) {
  return (
    <span className="member-avatar">
      {member.avatar_url ? (
        <img src={member.avatar_url} alt="" />
      ) : (
        (member.display_name || member.username).slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export function MemberPanel({
  member,
  roles,
  busy,
  reason,
  onReason,
  onAction,
  onClose,
}: {
  member: MemberRecord;
  roles: Role[];
  busy: boolean;
  reason: string;
  onReason: (value: string) => void;
  onAction: (action: MemberAction) => void;
  onClose: () => void;
}) {
  const roleNames = member.role_ids.map(
    (id) => roles.find((role) => role.role_id === id)?.role_name || id,
  );

  return (
    <aside className="panel member-profile">
      <button className="member-close" onClick={onClose} aria-label="Close member profile">
        ×
      </button>
      <div className="member-banner">
        {member.banner_url ? (
          <img src={member.banner_url} alt="Profile banner" />
        ) : (
          <span>No profile banner</span>
        )}
      </div>
      <div className="member-identity">
        <MemberAvatar member={member} />
        <div>
          <p className="eyebrow">Member profile</p>
          <h2>{member.display_name || member.username}</h2>
          <p>
            @{member.username}
            {member.discriminator ? `#${member.discriminator}` : ""}
          </p>
        </div>
      </div>
      <dl className="member-facts">
        <div><dt>User ID</dt><dd><code>{member.user_id}</code></dd></div>
        <div><dt>Joined server</dt><dd>{member.joined_at ? formatDate(member.joined_at) : "Unavailable"}</dd></div>
        <div><dt>Account created</dt><dd>{member.account_created_at ? formatDate(member.account_created_at) : "Unavailable"}</dd></div>
        <div><dt>Status</dt><dd>{member.online ? "Online" : "Offline"}</dd></div>
        <div><dt>Active warnings</dt><dd>{member.active_warning_count ?? 0}</dd></div>
        <div><dt>Timeout</dt><dd>{member.timed_out_until ? `Until ${formatDate(member.timed_out_until)}` : "None"}</dd></div>
      </dl>
      <section className="member-roles">
        <h3>Roles</h3>
        <div>
          {roleNames.map((role, index) => <span key={`${role}-${index}`}>{role}</span>)}
          {!roleNames.length && <small>No roles recorded.</small>}
        </div>
      </section>
      <section className="member-actions">
        <h3>Moderation actions</h3>
        <textarea
          value={reason}
          onChange={(event) => onReason(event.target.value)}
          placeholder="Required moderation reason"
          maxLength={1000}
        />
        <div>
          <button disabled={busy} onClick={() => onAction("warn")}>Warn</button>
          <button disabled={busy} onClick={() => onAction("mute")}>Mute 1h</button>
          <button disabled={busy} onClick={() => onAction("kick")}>Kick</button>
          <button className="danger" disabled={busy} onClick={() => onAction("ban")}>Ban</button>
        </div>
      </section>

    </aside>
  );
}
