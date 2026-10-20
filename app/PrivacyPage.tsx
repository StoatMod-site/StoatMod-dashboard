import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import styles from "./ReadingPage.module.css";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import { PrivacyUpdateCallout } from "./PrivacyUpdateCallout";

const contents = [
  ["controller", "Who we are"],
  ["information", "Information we process"],
  ["applications", "Member applications"],
  ["purposes", "Why we use it"],
  ["automation", "Automated decisions"],
  ["appeals", "Appeals and consent"],
  ["ai-improvement", "Optional AI improvement"],
  ["sharing", "Who receives it"],
  ["retention", "Retention"],
  ["security", "Security"],
  ["rights", "Your rights"],
  ["children", "Children's privacy"],
  ["updates", "Policy updates"],
  ["contact", "Contact"],
];

function List({ children }: { children: React.ReactNode }) {
  return <ul className="privacy-list">{children}</ul>;
}

export function PrivacyPage() {
  return <main className={styles.page}>
    <SiteNav active="privacy" />
    <PublicPageHeading eyebrow="Legal / Privacy" title="Privacy policy." description="How Stoatmod collects, uses, shares and protects information when moderating Stoat communities." action={{href:"mailto:admin@modstoat.site",label:"Privacy enquiries"}} />
    <PublicSummary title="Your information, explained." description="What Stoatmod processes, how long information is kept, and the choices available to you." facts={["Last updated 20 October 2026","No advertising or data sales","Stoatmod Limited"]} />
    <PrivacyUpdateCallout />

    <div className="docs-layout privacy-layout">
      <aside className="docs-sidebar privacy-sidebar">
        <strong>On this page</strong>
        {contents.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        <div><span>Privacy request?</span><a href="mailto:admin@modstoat.site">admin@modstoat.site →</a></div>
      </aside>

      <article className="docs-content privacy-content">
        <section className="policy-summary">
          <p className="section-number">SUMMARY</p>
          <h2>The short version</h2>
          <p>Stoatmod processes Stoat account, server, message, attachment and moderation information to provide automated moderation, security checks, statistics and a moderator dashboard.</p>
          <List>
            <li>Message text and images may be sent to Stoatmod&apos;s self-hosted moderation model for safety classification.</li>
            <li>Original content from an AI moderation decision is deleted from Stoatmod&apos;s database and managed files 30 days after that decision unless an appeal is submitted.</li>
            <li>An appeal requires a separate privacy agreement. Its content is deleted when decided, or when automatically rejected 10 days after submission if no decision was made.</li>
            <li>You can separately choose to contribute your own original moderated text for AI improvement. Contributions are kept for up to 90 days after a moderator&apos;s decision and can be withdrawn. An appeal that reaches the 10-day deadline without a decision has all its content deleted, even with this option selected.</li>
            <li>Optional join verification and report submission use Cloudflare Turnstile for a browser CAPTCHA. Stoatmod does not scan IP addresses or match alternate accounts by IP address. Cloudflare processes network and browser information to operate its CAPTCHA.</li>
            <li>Member applications require a separate privacy agreement before any questions. Application records are deleted 14 days after submission, including accepted applications. Undecided applications are automatically denied at that deadline. Application answers are not sent to the AI moderation API.</li>
            <li>Message text kept in any moderation record, including automatic link and self-harm removals, is deleted 30 days after the event unless an open appeal needs it.</li>
            <li>Cloudflare Turnstile only loads after you agree, on both the join verification page and the report form.</li>
            <li>If a server turns on the optional Thinking check, the AI&apos;s written reasoning about a flagged message is stored with that case for the server&apos;s moderators and deleted together with the original message.</li>
            <li>Join protection, which is on by default, records only the server, your account ID and when your protection starts and ends. This record is deleted when the protection ends or when you leave the server.</li>
            <li>Stoatmod does not sell personal information or use it for advertising.</li>
            <li>Automated decisions can be challenged and submitted for human review.</li>
          </List>
        </section>

        <section id="controller">
          <p className="section-number">01 / CONTROLLER</p>
          <h2>Who we are</h2>
          <p>Stoatmod is a moderation bot and web dashboard for communities hosted on Stoat. It provides automated moderation, server statistics, security checks, moderation records, logging and configuration tools.</p>
          <address className="controller-card">
            <strong>Stoatmod Limited</strong>
            <a href="mailto:admin@modstoat.site">admin@modstoat.site</a>
          </address>
          <p>Stoatmod Limited is the data controller for personal information processed to operate Stoatmod and this website, unless stated otherwise. Server owners and moderators also decide how Stoatmod is configured and used in their communities and may be separate controllers for their own moderation activities. You should also read the privacy information and rules supplied by the server you use.</p>
          <p>Stoatmod is an independent service and is not operated by or affiliated with the Stoat platform.</p>
        </section>

        <section id="information">
          <p className="section-number">02 / INFORMATION</p>
          <h2>Information we process</h2>
          <h3>Stoat accounts and servers</h3>
          <p>We may process Stoat user IDs, usernames, display names, tags, nicknames, profile information available through Stoat, server IDs and names, channel/category/role IDs and names, membership events, permissions, moderator IDs and server configuration.</p>
          <h3>Messages and attachments</h3>
          <p>When message moderation is enabled, Stoatmod reads message text, links, website domains and account mentions. It uses message and channel IDs and timestamps to identify the content and carry out an action. Image checks are on by default and process image attachments, animated GIF frames and link-preview pictures; server owners can turn them off for the whole server or for individual channels. When an image is removed for graphic violence, a reduced copy is kept with the case so the server&apos;s moderators and Stoatmod&apos;s operators can review it behind a content warning. When an image is removed for explicit nudity, only a small, permanently blurred thumbnail is kept and the original is never stored. Images that may involve minors are never stored. AI checks produce safety categories and model scores.</p>
          <p>Stoatmod stores message content only when it is the subject of a moderation action. Deleting a message does not cause its content to be saved. Edited messages are reassessed, but their content is saved only if the edited message violates policy and is moderated. We do not keep routine message archives or before-and-after edit logs.</p>
          <p>AI-moderated message content follows the 30-day limit and appeal rules below. Information you intentionally submit through an application, report, appeal or support request is handled for that separate purpose. Messages already posted in a server&apos;s Stoat moderation-log channel are held separately from Stoatmod&apos;s database.</p>
          <h3>Moderation and safety records</h3>
          <p>Records may include warnings, case IDs, kicks, bans, mutes, timeouts, reasons, model scores, moderator attribution where available, case status, verification results, dashboard changes, moderator logins, joins, leaves, deletions and edits. When Stoat does not provide an actor for an external action, Stoatmod records the actor as unavailable rather than guessing.</p>
          <h3>Global bans and warnings</h3>
          <p>Stoatmod maintains service-wide bans and warnings for enforcement by authorised administrators. It does not share a server&apos;s moderation history with other servers when someone joins or send other servers alerts about a local ban.</p>
          <h3>Dashboard authentication</h3>
          <p>We process moderator and server IDs, cryptographic hashes of one-time codes and session tokens, creation/expiry/use times, dashboard login events and dashboard changes. Codes are normally valid for ten minutes and usable once. Dashboard sessions normally last twelve hours.</p>
          <p>The dashboard uses the strictly necessary <code>stoat_dashboard_session</code> and <code>stoat_dashboard_csrf</code> cookies for authentication and request security. They are not advertising or behavioural-tracking cookies.</p>
          <h3>Join verification</h3>
          <p>Join CAPTCHA is off by default. When a server enables it, the member must tick a separate agreement to this policy and the verification notice before the CAPTCHA loads and before submitting the form. Stoatmod processes the Stoat user and server IDs, one-time verification token, CAPTCHA result and attempts, and the agreement time and policy version solely to complete and troubleshoot that join verification. The application does not collect browser language or timezone for this purpose.</p>
          <p>Stoatmod does not scan visitor IP addresses, store raw IP addresses in verification or report records, create IP fingerprints or link accounts by IP address. Cloudflare receives browser and network information, including an IP address, when its widget connects. Some website endpoints briefly use IP addresses in memory to limit repeated requests; hosting providers also handle network connections to deliver the service.</p>
          <p>You can decline by leaving the form, or untick the box before submitting. Contact your server moderators for help if you cannot complete verification. To withdraw agreement or request deletion of verification records, contact <a href="mailto:admin@modstoat.site">admin@modstoat.site</a> with your Stoat user and server IDs. Verification agreement does not authorise unrelated message collection, AI training or cross-server profiling.</p>
          <p>The report form works the same way: the Cloudflare Turnstile browser check only loads after you tick a box agreeing to it, and you can decline by not submitting a report.</p>
          <h3>Statistics and technical data</h3>
          <p>Statistics use daily community totals for non-bot messages, joins and leaves, plus total memberships, servers and cases. Statistics do not retain user IDs, per-user counts, individual rankings, channel activity breakdowns or words extracted from messages. We do not calculate unique active-user counts. Website infrastructure may also process IP address, request time, endpoint, browser/device details, errors and security events.</p>
          <p>Stoatmod offers no per-user activity statistics and no leaderboards, within a server or across servers.</p>
          <h3>Information you provide</h3>
          <p>If you contact us, appeal a decision or make a privacy request, we may process your contact details, Stoat user ID, relevant server, request content, supporting evidence and correspondence. Appeal privacy agreement and optional AI-improvement permission are recorded separately with the notice version and time. We do not record an IP address as proof of either choice.</p>
          <h3>Sources</h3>
          <p>Information comes from Stoat and its bot API, Stoat users, server owners and moderators, your browser, Cloudflare Turnstile, Stoatmod&apos;s self-hosted moderation model and Stoatmod&apos;s automated rules.</p>
        </section>

        <section id="applications">
          <h2>Member applications</h2>
          <p>When a server requires an application, Stoatmod sends a separate privacy notice in a direct message before asking any questions. Read the linked policy and reply <strong>“I agree”</strong> to agree to the stated application processing. You can decline by not continuing. Server questions and rules agreements do not replace this privacy step.</p>
          <p>We store your answers, Stoat user and server identifiers, application and verification status, agreement time and notice version, submission date, and review details. Authorised moderators of the originating server can access the application during its retention period. Application answers are not used for AI classification or model training.</p>
          <List>
            <li><strong>Before submission:</strong> you have seven days to finish. An unfinished application and its stored answers are deleted when that window ends.</li>
            <li><strong>After submission:</strong> the application and its associated records are retained for 14 days from submission. Moderators may accept or deny it during that time.</li>
            <li><strong>At the 14-day deadline:</strong> all stored application records are deleted. If no decision was made, the application is automatically denied. Accepted and manually denied applications are also deleted at the same deadline; a review does not restart the clock.</li>
          </List>
          <p>Deletion includes answers, agreement records, reviewer details, delivery state and linked application records in Stoatmod&apos;s database. It does not reverse access already granted to an accepted member. Direct messages and notices already sent on Stoat remain subject to Stoat&apos;s controls. To withdraw agreement or request earlier deletion, contact <a href="mailto:admin@modstoat.site">admin@modstoat.site</a> with your user and server IDs; deleting an application may prevent its review.</p>
        </section>

        <section id="purposes">
          <p className="section-number">03 / PURPOSE AND BASIS</p>
          <h2>Why we use information</h2>
          <p>We use information to provide moderation and server-management features; identify unsafe text, images, links, spam, mass mentions and risky names; operate join verification; create cases and audit logs; authenticate moderators; assign configured roles; provide statistics; investigate errors, abuse and security incidents; answer support and privacy requests; protect users and communities; and comply with applicable law.</p>
          <h3>Lawful bases</h3>
          <p>Under the Isle of Man Data Protection Act 2018 and the Data Protection (Application of GDPR) Order 2018, we generally rely on:</p>
          <List>
            <li><strong>Legitimate interests:</strong> operating a safe, secure and effective moderation service, protecting servers and users, maintaining proportionate audit records and improving reliability.</li>
            <li><strong>Contract:</strong> where processing is necessary to provide Stoatmod to a server owner or administrator who requested the service.</li>
            <li><strong>Legal obligation:</strong> where processing or retention is required by applicable law, a court order or a valid request from a competent authority.</li>
            <li><strong>Consent:</strong> for the processing explained in the separate verification, application and appeal steps, and separately for any optional AI-improvement contribution. Optional permission is never inferred from bot installation, server membership, silence or a moderator&apos;s decision.</li>
          </List>
          <p>The optional join CAPTCHA requires a separate affirmative agreement to its stated data processing. This agreement covers verification only. An application agreement covers admission processing only. An appeal agreement covers that review only; optional AI-improvement permission is a separate choice. Messages may incidentally contain sensitive information. Stoatmod does not intentionally use content to determine a person&apos;s health, religion, political opinions, sexuality, ethnicity or other protected characteristics.</p>
          <p>We do not sell personal information or use it for targeted advertising.</p>
        </section>

        <section id="automation">
          <p className="section-number">04 / AUTOMATION</p>
          <h2>Automated moderation and decisions</h2>
          <p>Stoatmod uses automated rules and self-hosted model classifications. Depending on server settings, processing may delete a message, create a warning, send a safety message, apply a timeout, restore a protected nickname, require or reject join verification, kick a user after three failed checks, or escalate repeated warnings to a timeout, kick or ban.</p>
          <p>AI moderation evaluates content against safety categories and returns scores. Server moderators select a threshold, and configured actions may occur when a score exceeds it. Other protections consider links, message speed/repetition, mention counts, account age and CAPTCHA completion.</p>
          <aside className="docs-note"><strong>Human review</strong><p>Automated systems can make mistakes. A classification is not proof of intent or wrongdoing. You may request an explanation, challenge an action and ask the relevant server&apos;s moderators for human review. If the concern is about Stoatmod itself, email <a href="mailto:admin@modstoat.site">admin@modstoat.site</a>.</p></aside>
        </section>

        <section id="appeals">
          <p className="section-number">05 / APPEALS</p>
          <h2>Appeals, evidence and privacy agreement</h2>
          <p>Use the private appeal code from your moderation message and your Stoat user ID to access your case. Before submitting an appeal or follow-up, you must tick the unchecked box agreeing to this policy and the stated processing of your appeal. We record the case, user and server identifiers, the notice version and your agreement time.</p>
          <p>We use your statement, relevant original moderated message, follow-ups and evidence images to investigate the decision. Only authorised reviewers and operators who need access may handle these records. Submit information relevant to your own case and avoid unnecessary information about other people.</p>
          <List>
            <li><strong>No appeal:</strong> original AI-moderated message content expires 30 days after the automated decision. Opening the appeal page does not extend this period.</li>
            <li><strong>Submitted appeal:</strong> available message content and the submitted appeal content remain available while the appeal is open, for no more than 10 days from submission. Follow-ups and requests for more information do not restart the clock.</li>
            <li><strong>Accepted or rejected by a moderator:</strong> the original message, statement, follow-ups and evidence attachments are removed from ordinary case storage when the decision is recorded. Only a separately opted-in original message may move to the restricted contribution store described below.</li>
            <li><strong>No decision within 10 days:</strong> the appeal is automatically rejected and all associated user content is deleted, including any AI-improvement contribution, regardless of the optional checkbox.</li>
          </List>
          <p>Deletion covers Stoatmod&apos;s database records and managed file copies, including linked evidence and duplicate copies in stored action payloads. It does not remove moderation-log messages already posted within the originating Stoat server. Those are subject to Stoat&apos;s and the server&apos;s controls. We may retain the case identifier, decision, dates, consent record, category scores and necessary action identifiers without the deleted message or appeal content.</p>
          <p>You can decline by leaving the form without submitting. To withdraw agreement to appeal processing or request earlier deletion, contact <a href="mailto:admin@modstoat.site">admin@modstoat.site</a> with your user ID and case reference. Removing the material needed for a review may prevent us from continuing that review. Declining or withdrawing the optional AI permission does not prevent an appeal.</p>
        </section>

        <section id="ai-improvement">
          <p className="section-number">06 / OPTIONAL AI IMPROVEMENT</p>
          <h2>Your own moderated message and model improvement</h2>
          <p>The appeal form offers a separate, unchecked option: <strong>“Use my own moderated message to improve our AI.”</strong> Selecting it is voluntary and has no effect on whether your appeal is accepted, rejected or prioritised. Only the original message authored by the appealing account and already associated with an automated moderation decision is eligible.</p>
          <p>The purpose is to review classification mistakes and prepare corrections for training Stoatmod&apos;s own moderation model. This includes false positives, where content was incorrectly flagged, and false negatives, where a relevant safety category was missed. An appeal decision alone does not establish that a training example is correct.</p>
          <p>Your permission covers only your own original moderated text. It excludes messages written by somebody else, appeal statements, follow-ups, screenshots and other evidence attachments. <strong>We do not currently train models using appeal contributions.</strong> Contributions are held separately for review. We will explain any material change to this use and obtain fresh permission where the purpose, information used or recipients change.</p>
          <p>Following a moderator&apos;s decision, an opted-in original message may be kept in a restricted holding store with the user, server, message and appeal identifiers, outcome, consent version and expiry date. It is deleted 90 days after that decision, or sooner if permission is withdrawn. Approval, rejection, later review or backup restoration must not restart the 90-day period. An automatic rejection after 10 days has no contribution exception.</p>
          <p>To withdraw immediately, return to the appeal page with your code and user ID and select <strong>“Withdraw AI-improvement permission.”</strong> This deletes any saved contribution and stops future use. You can also contact <a href="mailto:admin@modstoat.site">admin@modstoat.site</a>. Withdrawing this permission does not affect your appeal or your access to the review process.</p>
        </section>

        <section id="sharing">
          <p className="section-number">07 / RECIPIENTS</p>
          <h2>Who receives information</h2>
          <h3>Server owners and moderators</h3>
          <p>Authorised moderators can access their server&apos;s settings, cases, logs and activity. A server&apos;s moderation history and local ban alerts are not shared with other servers. Global bans and warnings are handled separately by authorised administrators.</p>
          <h3>Stoat</h3>
          <p>Stoat supplies the platform and bot API. Your use of Stoat is also governed by <a href="https://stoat.chat/legal">Stoat&apos;s policies</a>.</p>
          <h3>Self-hosted moderation model</h3>
          <p>Message text, image URLs and image content may be sent to Stoatmod&apos;s self-hosted moderation model for classification. Processing takes place on infrastructure operated for Stoatmod. Category percentages are model scores, not guaranteed accuracy. Optional AI-improvement permission does not include sending your message to an external AI classifier.</p>
          <h3>Cloudflare</h3>
          <p>Cloudflare Turnstile processes verification tokens, IP addresses and browser/device signals to provide its CAPTCHA. See Cloudflare&apos;s <a href="https://developers.cloudflare.com/turnstile/">Turnstile documentation</a> and <a href="https://www.cloudflare.com/turnstile-privacy-policy/">Turnstile privacy addendum</a>.</p>
          <h3>Infrastructure and legal disclosure</h3>
          <p>VPS, domain, DNS, backup and network providers may process information to host and secure the service. We may also disclose information where reasonably necessary to comply with law, protect safety, investigate abuse, establish or defend legal claims, or answer a valid authority request.</p>
          <h3>International transfers</h3>
          <p>Some providers may process information outside the Isle of Man or United Kingdom. Where required, we rely on adequacy decisions, approved contractual clauses, the UK International Data Transfer Agreement or Addendum, and appropriate contractual and organisational safeguards. Contact us for more information about relevant safeguards.</p>
        </section>

        <section id="retention">
          <p className="section-number">08 / RETENTION</p>
          <h2>How long we keep information</h2>
          <p>We retain information only while reasonably needed for the purposes in this policy, security, disputes or legal compliance. Current practices include:</p>
          <List>
            <li>submitted applications and all associated application records: 14 days after submission, whether accepted, denied or awaiting review; incomplete applications: seven days from creation;</li>
            <li>original AI-moderated message content: 30 days from the automated decision unless an appeal is submitted;</li>
            <li>copies of removed images kept with a case (a reduced copy for graphic violence, a permanently blurred thumbnail for explicit nudity): deleted together with the original message content, 30 days from the automated decision, or earlier when an appeal is decided;</li>
            <li>uploaded files and images (report evidence, case evidence added by moderators, attachments sent with appeal follow-ups or to our support email): 30 days from upload, unless an open appeal still needs them;</li>
            <li>the AI&apos;s reasoning, recorded only when a server turns on the optional Thinking check: deleted together with the original message, 30 days from the automated decision unless an appeal is submitted;</li>
            <li>message text kept in any other moderation record (for example automatic link removals, self-harm removals and automation runs): 30 days from the event, unless an open appeal needs the message; the case outcome, dates and category scores remain;</li>
            <li>content linked to a submitted appeal: until the decision, with automatic rejection and content deletion if no decision is made within 10 days of submission;</li>
            <li>separately opted-in original messages: up to 90 days after a moderator&apos;s decision, or until permission is withdrawn; this extension does not apply after an appeal times out;</li>
            <li>dashboard codes are usable for about ten minutes and only once;</li>
            <li>dashboard sessions are usable for about twelve hours;</li>
            <li>join protection records (server, account ID and start and end times): deleted when the protection ends (1 day by default, at most 30 days) or when the member leaves the server;</li>
            <li>active join-verification challenges normally expire after about thirty minutes or are removed following success, moderator bypass or three failures;</li>
            <li>temporary login and verification rate-limit data stays in memory for about five to ten minutes;</li>
            <li>server snapshots are refreshed as updated server information is received;</li>
            <li>remaining case metadata, warnings, general event logs, configuration history and statistics are retained while operationally necessary; these records currently have no single automatic deletion period, and server administrators cannot choose a separate history-retention period;</li>
            <li>removed cases may remain as audit records marked as removed;</li>
            <li>when Stoatmod is removed from a server, all records belonging to that server are deleted, except network-level enforcement records such as a server blacklist entry;</li>
            <li>verification agreement records, bot-side verification event records and completed verification action records expire after 30 days; this does not remove log messages already posted on Stoat and application verification flags are deleted with the application; and</li>
            <li>system and VPS logs follow operational logging and backup settings.</li>
          </List>
          <p>Expired content is removed automatically. Following downtime, overdue content is removed when the service resumes. The application, AI-content, appeal and optional AI-improvement deadlines are fixed and cannot be extended through server settings. Necessary case outcomes may remain without the deleted source content.</p>
          <p>The deletion periods also apply to managed file copies and backups under our control. A backup that cannot be cleared selectively must be deleted in full. Restoring a backup does not restart a retention period. Messages already posted in the originating server&apos;s Stoat log channel are outside this deletion process; contact that server&apos;s moderators about those messages.</p>
        </section>

        <section id="security">
          <p className="section-number">09 / SECURITY</p>
          <h2>How we protect information</h2>
          <p>Measures include HTTPS, hashed login codes and session tokens, expiring one-time access, server-scoped dashboard sessions, CSRF protection, secure/SameSite cookie controls, rate limiting, restricted log channels, VPS/database access controls, security headers, backups and operational monitoring.</p>
          <p>No internet service can guarantee absolute security. Report suspected vulnerabilities or breaches to <a href="mailto:admin@modstoat.site">admin@modstoat.site</a>. Never send passwords, bot tokens, API keys or dashboard codes in a support message.</p>
        </section>

        <section id="rights">
          <p className="section-number">10 / YOUR RIGHTS</p>
          <h2>Your information rights</h2>
          <p>Depending on your location and circumstances, you may have rights to be informed, access information, correct it, request deletion or restriction, object to legitimate-interests processing, request portability, challenge certain automated decisions, obtain human intervention, withdraw consent where applicable, and complain to a regulator.</p>
          <p>These rights are not absolute. We may retain limited information to protect others, preserve a necessary audit record, comply with law or handle legal claims.</p>
          <h3>Right to object</h3>
          <p><strong>You have the right to object to processing based on our legitimate interests.</strong> Tell us which processing concerns you and why. We will stop unless compelling legitimate grounds require it to continue or it is needed for legal claims.</p>
          <h3>Making a request</h3>
          <p>Email <a href="mailto:admin@modstoat.site">admin@modstoat.site</a> with your Stoat user ID, relevant server, the right you want to exercise and enough information to locate the records. We may reasonably verify your identity. We normally respond within one month; legally permitted extensions may apply to complex requests.</p>
          <h3>Complaints</h3>
          <p>Please contact us first so we can investigate. You may also complain to:</p>
          <address className="controller-card regulator-card">
            <strong>Isle of Man Information Commissioner</strong>
            <span>P.O. Box 69, Douglas, Isle of Man, IM99 1EQ</span>
            <a href="mailto:ask@inforights.im">ask@inforights.im</a>
            <a href="https://www.inforights.im/">inforights.im</a>
            <span>+44 1624 693260</span>
          </address>
          <p>If UK data-protection law applies to your processing, you may also contact the <a href="https://ico.org.uk/make-a-complaint/">UK Information Commissioner&apos;s Office</a>. You may have the right to complain to another authority where you live or work.</p>
        </section>

        <section id="children">
          <p className="section-number">11 / CHILDREN</p>
          <h2>Children&apos;s privacy</h2>
          <p>Stoatmod may operate in communities containing younger users. It does not intentionally collect dates of birth or identity documents. Users must meet Stoat&apos;s minimum-age requirements, their server&apos;s rules and applicable law.</p>
          <p>We aim to collect only information necessary for moderation/security, avoid advertising and behavioural tracking, use privacy-protective defaults, restrict moderation-record access, explain automated actions and provide human review. A parent or guardian may contact us about a child&apos;s information; we may need to verify their authority.</p>
        </section>

        <section id="updates">
          <p className="section-number">12 / UPDATES</p>
          <h2>Changes to this policy</h2>
          <p>We may update this policy when features, providers, hosting, retention practices or legal requirements change. The revised policy will appear at <code>https://modstoat.site/privacy</code> with a new date. We will take reasonable steps to notify participating servers or users where a change materially affects the use of personal information.</p>
        </section>

        <section id="contact">
          <p className="section-number">13 / CONTACT</p>
          <h2>Contact Stoatmod Limited</h2>
          <address className="controller-card">
            <strong>Stoatmod Limited</strong>
            <a href="mailto:admin@modstoat.site">admin@modstoat.site</a>
            <a href="https://modstoat.site">modstoat.site</a>
          </address>
        </section>
      </article>
    </div>

    <PublicFooter description="Privacy and data protection information." />
  </main>;
}
