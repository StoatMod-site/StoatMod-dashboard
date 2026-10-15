"use client";

import { pluralize } from "./lib/plural";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { EmojiStyle, Theme } from "emoji-picker-react";
import { api } from "./lib/api";
import styles from "./ApplicationsPanel.module.css";

type Question = {title:string;prompt:string;type:"text"|"choice"|"agreement";required:boolean;options:string[];emoji?:string;color?:string};
type Appearance = {color:string;footer:string;submitted_title:string;submitted_message:string;submitted_emoji:string};
type FormSettings = {enabled:boolean;introduction:string;questions:Question[];appearance:Appearance;visible_channel_ids:string[];version:number;access_role_id:string|null;setup_status:string;setup_error:string|null};
type Channel = {channel_id:string;channel_name:string;category_id:string|null};
type Category = {category_id:string;category_name:string};
type Application = {
  id:string;user_id:string;username?:string;status:string;created_at:string;expires_at:string;
  submitted_at:string|null;reviewed_at:string|null;reviewer_id:string|null;reason:string|null;
  screening_required:boolean;screening_passed:boolean;enforcement_status:string;error:string|null;
  privacy_accepted_at:string;privacy_version:string;form_version:number;questions:Question[];answers:{position:number;answer:string;created_at:string}[];
};
type SettingsResponse = {settings:FormSettings;dm_notifications:boolean;channels:Channel[];categories:Category[]};
type ListResponse = {applications:Application[];next_cursor:string|null};

const FullEmojiPicker = lazy(()=>import("emoji-picker-react"));
const questionEmoji = (question:Question) => question.emoji ?? ({text:"👋",choice:"💬",agreement:"📜"}[question.type]);
const newQuestion = ():Question => ({title:"",prompt:"",type:"text",required:true,options:[],emoji:"👋",color:""});
const date = (value:string) => new Date(value).toLocaleString();
const available = (app:Application) => new Date(app.expires_at).getTime()>Date.now();
const label = (value:string) => ({screening:"Awaiting checks",answering:"In progress",submitted:"Awaiting review",approved:"Approved",denied:"Denied",expired:"Expired",left:"Left server"}[value] || value);

export function ApplicationsPanel() {
  const [settings,setSettings]=useState<FormSettings|null>(null);
  const [channels,setChannels]=useState<Channel[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [applications,setApplications]=useState<Application[]>([]);
  const [nextCursor,setNextCursor]=useState<string|null>(null);
  const [selected,setSelected]=useState<Application|null>(null);
  const [tab,setTab]=useState<"inbox"|"setup">("inbox");
  const [notifications,setNotifications]=useState(false);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [error,setError]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [reason,setReason]=useState("");
  const [filter,setFilter]=useState("all");
  const selectedId=selected?.id;

  const refresh = useCallback(async () => {
    const result=await api<ListResponse>("/api/applications");
    setApplications(result.applications);setNextCursor(result.next_cursor);
    setSelected((current)=>current?result.applications.find((app)=>app.id===current.id)||null:null);
  },[]);

  useEffect(()=>{
    let active=true;
    Promise.all([api<SettingsResponse>("/api/applications/settings"),api<ListResponse>("/api/applications")])
      .then(async ([config,list])=>{
        if(!active)return;
        setSettings(config.settings);setNotifications(config.dm_notifications);
        setChannels(config.channels);setCategories(config.categories);
        setApplications(list.applications);setNextCursor(list.next_cursor);setLoaded(true);
        const id=new URLSearchParams(window.location.search).get("application");
        if(id){const detail=await api<{application:Application}>(`/api/applications/${encodeURIComponent(id)}`);if(active)setSelected(detail.application);}
      }).catch((err)=>{if(active){setError(err instanceof Error?err.message:"Could not load applications.");setLoaded(true);}});
    return()=>{active=false;};
  },[]);

  useEffect(()=>{
    if(!loaded)return;
    const timer=window.setInterval(()=>{
      void Promise.all([api<SettingsResponse>("/api/applications/settings"),api<ListResponse>("/api/applications"),
        selectedId?api<{application:Application}>(`/api/applications/${selectedId}`).catch(()=>null):Promise.resolve(null)])
        .then(([config,list,detail])=>{
          // Preserve unsaved form edits and older loaded pages during polling.
          setSettings((current)=>current?{...current,setup_status:config.settings.setup_status,setup_error:config.settings.setup_error,access_role_id:config.settings.access_role_id}:config.settings);
          setChannels(config.channels);setCategories(config.categories);
          setApplications((current)=>[...list.applications,...current.filter((app)=>available(app)&&!list.applications.some((fresh)=>fresh.id===app.id))]);
          setSelected(detail&&available(detail.application)?detail.application:null);
        }).catch((err)=>setError(err instanceof Error?err.message:"Could not refresh applications."));
    },15000);
    return()=>window.clearInterval(timer);
  },[loaded,selectedId]);

  useEffect(()=>{
    const timer=window.setInterval(()=>{
      setApplications((current)=>current.filter(available));
      setSelected((current)=>current&&available(current)?current:null);
    },1000);
    return()=>window.clearInterval(timer);
  },[]);

  async function run(work:()=>Promise<void>){setBusy(true);setNotice("");setError("");try{await work();}catch(err){setError(err instanceof Error?err.message:"The action failed.");}finally{setBusy(false);}}
  async function save(repair=false){if(!settings)return;await run(async()=>{
    const result=await api<SettingsResponse>("/api/applications/settings",{method:"POST",body:JSON.stringify({...settings,repair_access:repair})});
    setSettings(result.settings);setChannels(result.channels);setCategories(result.categories);
    setNotice(result.settings.setup_status==="pending"?"Saved. Stoatmod is updating applicant channel access. The setup status will update here.":"Application settings saved. Current applicants keep the questions they started with.");
  });}
  async function decide(decision:"approved"|"denied"){if(!selected)return;await run(async()=>{
    const result=await api<{application:Application}>(`/api/applications/${selected.id}/review`,{method:"POST",body:JSON.stringify({decision,reason})});
    setSelected(result.application);setReason("");await refresh();
    setNotice(decision==="approved"?"Approval saved. Stoatmod is assigning roles and removing verification restrictions.":"Denial saved. Stoatmod is removing the member with your reason.");
  });}
  async function retry(){if(!selected)return;await run(async()=>{
    await api(`/api/applications/${selected.id}/retry`,{method:"POST",body:"{}"});
    setNotice("Retry queued. The result will update here.");await refresh();
  });}
  const visible=applications.filter((app)=>filter==="all"||app.status===filter);
  const canReview=selected?.status==="submitted"&&available(selected);

  return <div className={`dashboard-surface ${styles.page}`}>
    <div className={styles.toolbar}>
      <div className={styles.tabs} aria-label="Application views"><button className={tab==="inbox"?styles.active:""} aria-pressed={tab==="inbox"} onClick={()=>setTab("inbox")}>Review applications</button><button className={tab==="setup"?styles.active:""} aria-pressed={tab==="setup"} onClick={()=>setTab("setup")}>Form &amp; setup</button></div>
      <span className={styles.status}>{settings?.setup_status==="pending"||settings?.setup_status==="configuring"?"Updating access…":settings?.setup_status==="error"?"Setup needs attention":settings?.enabled?"Applications enabled":"Applications disabled"}</span>
    </div>
    {notice&&<p className={styles.notice} role="status">{notice}</p>}
    {error&&<p className={styles.error} role="alert">{error}</p>}
    {!loaded&&<section className="panel"><p role="status">Loading applications…</p></section>}
    {settings&&tab==="setup"&&<>
      <section className={styles.access}>
        <header><p className="eyebrow">01 / Member access</p><h2>Before approval</h2><p>Choose what new members can see while they complete their application and wait for a decision.</p></header>
        <div className={styles.accessControls}>
          <label className={styles.enable}><span><strong>Require an application</strong><small>New members answer your questions in DMs.</small></span><input type="checkbox" checked={settings.enabled} onChange={(event)=>setSettings({...settings,enabled:event.target.checked})}/></label>
          <ApplicantChannelPicker channels={channels} categories={categories} selected={settings.visible_channel_ids} disabled={busy||settings.setup_status==="configuring"} onChange={(ids)=>setSettings({...settings,visible_channel_ids:ids})}/>
          {settings.setup_error&&<p className={styles.error} role="alert">{settings.setup_error} Fix the permissions, then save again to retry setup.</p>}
          {settings.access_role_id&&<div className={styles.row}><small>{settings.setup_status==="ready"?"Channel access is configured. Repair it if server permissions have changed.":"Channel hiding is not confirmed until access setup is ready."}</small><button className="secondary-button" disabled={busy||settings.setup_status==="configuring"||settings.setup_status==="pending"} onClick={()=>void save(true)}>Save &amp; repair access</button></div>}
          {!settings.enabled&&settings.access_role_id&&<p>New applications are disabled. Existing applicants still need a decision; new members receive access automatically.</p>}
          <details className={styles.explainer}><summary>How admission works</summary><p>Members must agree to the privacy notice before answering questions and get seven days to finish. Moderators can review the application for 14 days after submission. At that deadline its records are deleted, including approved applications, and an undecided application is automatically denied. Approval grants access and configured roles; manual denial removes the member.</p><p>CAPTCHA follows your Join protection settings and is off by default. After the privacy agreement and any required CAPTCHA, the DM questions begin. Verification does not scan IP addresses.</p><p>Stoatmod creates a Verified member role to preserve existing access. It needs Manage Roles, Manage Permissions, Assign Roles, Timeout Members, and Kick Members, with its role above the members it manages.</p></details>
        </div>
      </section>
      <ApplicationFormEditor settings={settings} onChange={setSettings}/>
      <footer className={styles.footer}><p>Channel changes apply to everyone awaiting approval.</p><button className="primary-button" disabled={busy||settings.setup_status==="configuring"||(settings.enabled&&!settings.questions.length)} onClick={()=>void save()}>{busy?"Saving…":"Save application settings"} <span aria-hidden="true">→</span></button></footer>
    </>}
    {loaded&&tab==="inbox"&&<>
      <section className={`panel ${styles.notifications}`}><div><h2>New applicant notifications</h2><p>Submitted applications appear in the logs channel. You can also receive a DM linking to the dashboard.</p></div><label className={styles.check}><input type="checkbox" disabled={busy} checked={notifications} onChange={(event)=>{const enabled=event.target.checked;void run(async()=>{const result=await api<{dm_notifications:boolean}>("/api/applications/notifications",{method:"POST",body:JSON.stringify({enabled})});setNotifications(result.dm_notifications);setNotice("Your notification preference was saved.");});}}/>DM me when someone applies</label></section>
      <div className={styles.inbox}>
        <section className={`panel ${styles.list}`}><div className={styles.row}><h2>Applicants</h2><button className="text-button" disabled={busy} onClick={()=>void run(refresh)}>Refresh</button></div><label>Show<select value={filter} onChange={(event)=>setFilter(event.target.value)}><option value="all">All applications</option>{["submitted","screening","answering","approved","denied","expired","left"].map((status)=><option key={status} value={status}>{label(status)}</option>)}</select></label>
          {visible.map((app)=><button key={app.id} className={`${styles.applicant} ${selected?.id===app.id?styles.selected:""}`} onClick={()=>{setSelected(app);setReason("");setNotice("");}}><strong>{app.username||app.user_id}</strong><span>{label(app.status)}</span><small>{date(app.created_at)}</small>{app.enforcement_status==="failed"&&<b className={styles.error}>Action failed</b>}</button>)}
          {!visible.length&&<p className={styles.empty}>{applications.length?"No loaded applications match this filter.":"No applications yet. Configure your form to start accepting applicants."}</p>}
          {nextCursor&&<button disabled={busy} className="secondary-button" onClick={()=>void run(async()=>{const result=await api<ListResponse>(`/api/applications?before=${nextCursor}`);setApplications((current)=>[...current,...result.applications.filter((app)=>!current.some((existing)=>existing.id===app.id))]);setNextCursor(result.next_cursor);})}>Load older applications</button>}
        </section>
        {selected?<section className={`panel ${styles.detail}`}><header><p className="eyebrow">{label(selected.status)}</p><h2>{selected.username||selected.user_id}</h2><code>{selected.user_id}</code></header><dl><div><dt>{selected.submitted_at?"Review & deletion deadline":"Completion & deletion deadline"}</dt><dd>{date(selected.expires_at)}</dd></div><div><dt>CAPTCHA</dt><dd>{!selected.screening_required?"Not required":selected.screening_passed?"Passed":"Waiting"}</dd></div><div><dt>Privacy agreement</dt><dd>{selected.privacy_accepted_at?date(selected.privacy_accepted_at):"Not recorded"}</dd></div><div><dt>Questions</dt><dd>{selected.answers.length}/{selected.questions.length} answered · form version {selected.form_version}</dd></div>{selected.reviewed_at&&<div><dt>Decision</dt><dd>{date(selected.reviewed_at)} · {selected.reviewer_id||"Automatic"}</dd></div>}</dl>
          {selected.error&&<p className={styles.error} role="alert">{selected.error}</p>}
          {selected.questions.map((question,index)=><article className={styles.answer} key={index}><h3>{index+1}. {question.title}</h3><p data-no-translate>{question.prompt}</p><blockquote data-no-translate>{selected.answers.find((answer)=>answer.position===index)?.answer||"Not answered yet"}</blockquote></article>)}
          {selected.reason&&<div className={styles.answer}><h3>Decision reason</h3><p data-no-translate>{selected.reason}</p></div>}
          {canReview&&<div className={styles.decisions}><label>Decision reason (required for denial)<textarea rows={3} maxLength={1000} value={reason} onChange={(event)=>setReason(event.target.value)} placeholder="Explain your decision to the applicant."/></label><div className={styles.row}><button className="primary-button" disabled={busy} onClick={()=>void decide("approved")}>Approve &amp; grant access</button><button className={styles.deny} disabled={busy||reason.trim().length<3} onClick={()=>void decide("denied")}>Deny &amp; kick</button></div><small>Server command: <code>~approve {selected.user_id}</code></small></div>}
          {["approved","denied","expired"].includes(selected.status)&&<p className={styles.status}>{selected.enforcement_status==="applied"?"Decision applied":selected.enforcement_status==="failed"?"Decision saved · action failed":"Decision saved · applying action…"}</p>}
          {(selected.enforcement_status==="failed"||selected.error||["screening","answering","submitted"].includes(selected.status))&&<button className="secondary-button" disabled={busy} onClick={()=>void retry()}>{selected.enforcement_status==="failed"?"Retry action":selected.enforcement_status==="applied"?"Retry notifications":"Resend applicant DM"}</button>}
        </section>:<section className={`panel ${styles.empty}`}><h2>Select an application</h2><p>Review answers and required checks, then approve access or deny with a reason.</p></section>}
      </div>
    </>}
  </div>;
}

type PreviewEmbed = {title:string;description:string;color:string};

function EmojiField({value,onChange,label}:{value:string;onChange:(value:string)=>void;label:string}) {
  const [open,setOpen]=useState(false);
  return <div className={styles.emojiField}><span>{label}</span><div className={styles.row}><button className={styles.emojiButton} aria-label={`Choose ${label.toLowerCase()}`} aria-expanded={open} onClick={()=>setOpen(!open)}>{value||"＋"}</button><button className="text-button" onClick={()=>onChange("")}>No emoji</button></div>{open&&<div className={styles.emojiPopover}><Suspense fallback={<p role="status">Loading emojis…</p>}><FullEmojiPicker className="poll-full-emoji-picker" emojiStyle={"native" as EmojiStyle} theme={"auto" as Theme} width="100%" height={360} lazyLoadEmojis searchPlaceholder="Search emojis" previewConfig={{showPreview:false}} onEmojiClick={(selection)=>{onChange(selection.emoji);setOpen(false);}}/></Suspense><button className="text-button" onClick={()=>setOpen(false)}>Close emoji picker</button></div>}</div>;
}

function ApplicationFormEditor({settings,onChange}:{settings:FormSettings;onChange:(settings:FormSettings)=>void}) {
  const [selected,setSelected]=useState(0);
  const [stage,setStage]=useState<"privacy"|"question"|"submitted">("privacy");
  const [embeds,setEmbeds]=useState<PreviewEmbed[]>([]);
  const [previewError,setPreviewError]=useState("");
  const [loading,setLoading]=useState(true);
  const [sample,setSample]=useState("");
  const index=Math.min(selected,Math.max(0,settings.questions.length-1));
  const question=settings.questions[index];
  const formPayload=JSON.stringify({enabled:settings.enabled,introduction:settings.introduction,questions:settings.questions,appearance:settings.appearance,position:index,stage});
  useEffect(()=>{
    let active=true;
    const timer=window.setTimeout(()=>{
      setLoading(true);setPreviewError("");
      void api<{embeds:PreviewEmbed[]}>("/api/applications/preview",{method:"POST",body:formPayload})
        .then((result)=>{if(active)setEmbeds(result.embeds);})
        .catch((error)=>{if(active){setEmbeds([]);setPreviewError(error instanceof Error?error.message:"Could not load the DM preview.");}})
        .finally(()=>{if(active)setLoading(false);});
    },250);
    return()=>{active=false;window.clearTimeout(timer);};
  },[formPayload]);
  function choose(position:number){setSelected(position);setStage("question");setSample("");}
  function change(patch:Partial<Question>){onChange({...settings,questions:settings.questions.map((q,i)=>i===index?{...q,...patch}:q)});}
  function style(patch:Partial<Appearance>){onChange({...settings,appearance:{...settings.appearance,...patch}});}
  function add(question:Question){if(settings.questions.length>=20)return;onChange({...settings,questions:[...settings.questions,question]});choose(settings.questions.length);}
  function move(direction:number){const questions=[...settings.questions];[questions[index],questions[index+direction]]=[questions[index+direction],questions[index]];onChange({...settings,questions});choose(index+direction);}
  return <div className={styles.setup}>
    <section className={`panel ${styles.editor}`}>
      <header><p className="eyebrow">02 / Form studio</p><h2>Make it your welcome</h2><p>Build your questions, style each embed, and follow the conversation as a new member.</p></header>
      <details className={styles.appearance} open><summary>Embed appearance</summary><div className={styles.appearanceFields}>
        <div className={styles.row}><label>Default accent colour<input className={styles.colorInput} type="color" value={settings.appearance.color} onChange={(event)=>style({color:event.target.value})}/></label><span className={styles.colorValue}>{settings.appearance.color.toUpperCase()}</span></div>
        <label>Introduction<textarea maxLength={1000} rows={3} value={settings.introduction} onChange={(event)=>onChange({...settings,introduction:event.target.value})} placeholder="Welcome! Tell us a little about yourself."/><small>Shown with the first question. Supports **bold**, *italic* and links.</small></label>
        <label>Embed footer<input maxLength={160} value={settings.appearance.footer} onChange={(event)=>style({footer:event.target.value})} placeholder="Your answers are only shared with our reviewers."/><small>{settings.appearance.footer.length}/160 · shown below questions and the submission message</small></label>
      </div></details>
      <div className={styles.row}><h3>Your questions</h3><span>{settings.questions.length}/20</span></div>
      {settings.questions.length>0&&<nav className={styles.questionNav} aria-label="Questions to edit">{settings.questions.map((q,i)=><button key={i} className={i===index?styles.currentQuestion:""} aria-current={i===index?"step":undefined} onClick={()=>choose(i)}><span className={styles.questionNumber}>{String(i+1).padStart(2,"0")}</span><span className={styles.questionNavTitle}>{questionEmoji(q)} {q.title||"Untitled question"}</span><small>{q.required?"Required":"Optional"}</small></button>)}</nav>}
      {question?<fieldset className={styles.question}>
        <legend>Editing question {index+1}</legend>
        <div className={styles.questionActions}><button disabled={index===0} onClick={()=>move(-1)} aria-label={`Move question ${index+1} up`}>↑</button><button disabled={index===settings.questions.length-1} onClick={()=>move(1)} aria-label={`Move question ${index+1} down`}>↓</button><button disabled={settings.questions.length>=20} onClick={()=>add({...question,options:[...question.options]})}>Duplicate</button><button onClick={()=>{onChange({...settings,questions:settings.questions.filter((_,i)=>i!==index)});choose(Math.max(0,index-1));}}>Remove</button></div>
        <div className={styles.titleRow}><EmojiField key={`question-${index}`} label="Question emoji" value={questionEmoji(question)} onChange={(emoji)=>change({emoji})}/><label>Embed title<input maxLength={120} value={question.title} onChange={(event)=>change({title:event.target.value})} placeholder="Introduce yourself"/></label></div>
        <label>Question text<textarea rows={5} maxLength={1200} value={question.prompt} onChange={(event)=>change({prompt:event.target.value})} placeholder="Tell us what interests you about this server."/><small>{question.prompt.length}/1,200 · **bold**, *italic*, `code` and links</small></label>
        <div className={styles.row}><label>Answer type<select value={question.type} onChange={(event)=>{const type=event.target.value as Question["type"];change({type,options:type==="choice"?["",""]:[]});}}><option value="text">Text answer</option><option value="choice">Multiple choice</option><option value="agreement">Rules agreement</option></select></label><label className={styles.check}><input type="checkbox" checked={question.required} onChange={(event)=>change({required:event.target.checked})}/>Required answer</label></div>
        {question.type==="choice"&&<div className={styles.optionEditor}><span>Answer options · {question.options.length}/8</span>{question.options.map((option,i)=><div key={i}><span>{i+1}.</span><input aria-label={`Answer option ${i+1}`} maxLength={100} value={option} onChange={(event)=>change({options:question.options.map((value,j)=>i===j?event.target.value:value)})} placeholder={`Option ${i+1}`}/><button className="text-button" disabled={question.options.length<=2} aria-label={`Remove option ${i+1}`} onClick={()=>change({options:question.options.filter((_,j)=>j!==i)})}>×</button></div>)}<button className="text-button" disabled={question.options.length>=8} onClick={()=>change({options:[...question.options,""]})}>＋ Add option</button></div>}
        <div className={styles.row}><label className={styles.check}><input type="checkbox" checked={Boolean(question.color)} onChange={(event)=>change({color:event.target.checked?settings.appearance.color:""})}/>Custom colour for this question</label>{question.color&&<label>Accent colour<input className={styles.colorInput} type="color" value={question.color} onChange={(event)=>change({color:event.target.value})}/></label>}</div>
      </fieldset>:<p className={styles.empty}>Start with a template below or add a blank question.</p>}
      <div className={styles.templates}><p className="eyebrow">Add a question</p><div><button disabled={settings.questions.length>=20} onClick={()=>add({...newQuestion(),title:"Introduce yourself",prompt:"What would you like us to know about you, and why would you like to join?"})}>👋 Introduction</button><button disabled={settings.questions.length>=20} onClick={()=>add({...newQuestion(),type:"choice",emoji:"💬",title:"Find your people",prompt:"What brings you to our community?",options:["Meeting new people","Sharing my interests","Learning something new"]})}>💬 Multiple choice</button><button disabled={settings.questions.length>=20} onClick={()=>add({...newQuestion(),type:"agreement",emoji:"📜",title:"Our community rules",prompt:"Please read our server rules. Do you agree to follow them?"})}>📜 Rules agreement</button><button disabled={settings.questions.length>=20} onClick={()=>add(newQuestion())}>＋ Blank question</button></div></div>
      <details className={styles.appearance} onToggle={(event)=>{if(event.currentTarget.open)setStage("submitted");}}><summary>Submission message</summary><div className={styles.appearanceFields}>
        <div className={styles.titleRow}><EmojiField label="Submission emoji" value={settings.appearance.submitted_emoji} onChange={(submitted_emoji)=>style({submitted_emoji})}/><label>Embed title<input maxLength={120} value={settings.appearance.submitted_title} onChange={(event)=>style({submitted_title:event.target.value})}/></label></div>
        <label>Thank-you message<textarea maxLength={1000} rows={4} value={settings.appearance.submitted_message} onChange={(event)=>style({submitted_message:event.target.value})}/></label><small>The 14-day review and deletion notice is always included. The separate privacy agreement cannot be disabled.</small>
      </div></details>
    </section>
    <aside className={`panel ${styles.preview}`}>
      <div className={styles.row}><p className="eyebrow">Live DM preview</p><span className={styles.previewBadge}>PREVIEW ONLY</span></div>
      <div className={styles.tabs}><button aria-pressed={stage==="privacy"} className={stage==="privacy"?styles.active:""} onClick={()=>setStage("privacy")}>Privacy agreement</button><button aria-pressed={stage==="question"} className={stage==="question"?styles.active:""} onClick={()=>setStage("question")}>Question</button><button aria-pressed={stage==="submitted"} className={stage==="submitted"?styles.active:""} onClick={()=>setStage("submitted")}>Submitted</button></div>
      {stage==="question"&&question&&<div className={styles.previewPager}><button disabled={index===0} aria-label="Preview previous question" onClick={()=>choose(index-1)}>←</button><span>Question {index+1} of {settings.questions.length}</span><button disabled={index===settings.questions.length-1} aria-label="Preview next question" onClick={()=>choose(index+1)}>→</button></div>}
      {previewError?<p className={styles.error} role="alert">{previewError}</p>:<ApplicationEmbedPreview embeds={embeds} loading={loading}/>}
      {stage==="question"&&question&&<div className={styles.sampleReply}><label>Try a reply<textarea rows={2} maxLength={2000} value={sample} onChange={(event)=>setSample(event.target.value)} placeholder={question.type==="agreement"?"agree":question.type==="choice"?"Type an option number…":"Type a sample answer…"}/></label>{sample&&<div className={styles.replyBubble}><strong>You <small>Preview</small></strong><p>{sample}</p></div>}<small>Sample replies stay here. Nothing is sent or submitted.</small></div>}
      <p>This preview uses the bot’s message formatter, including long questions split into separate messages. Stoat may render Markdown slightly differently.</p>
    </aside>
  </div>;
}

function inlineMarkdown(text:string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).map((part,i)=>{
    if(part.startsWith("**")&&part.endsWith("**"))return <strong key={i}>{part.slice(2,-2)}</strong>;
    if(part.startsWith("`")&&part.endsWith("`"))return <code key={i}>{part.slice(1,-1)}</code>;
    if(part.startsWith("*")&&part.endsWith("*"))return <em key={i}>{part.slice(1,-1)}</em>;
    const link=part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if(link)return <a key={i} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return part;
  });
}

export function ApplicationEmbedPreview({embeds,loading=false,context="Direct message · just now"}:{embeds:PreviewEmbed[];loading?:boolean;context?:string}) {
  return <div className={styles.dmPreview} aria-busy={loading}><header className={styles.dmSender}><span className={styles.botAvatar} aria-hidden="true">S</span><div><strong>Stoatmod <span>BOT</span></strong><small>{context}</small></div></header>{embeds.map((embed,i)=><article key={i} className={styles.embed} style={{borderLeftColor:embed.color}}><h3>{embed.title}</h3><div className={styles.markdown}>{inlineMarkdown(embed.description)}</div></article>)}{!embeds.length&&<p>{loading?"Loading preview…":"Add a question to preview your application."}</p>}<small role="status">{loading?"Updating preview…":embeds.length>1?`${embeds.length} messages will be sent`:""}</small></div>;
}

export function ApplicantChannelPicker({channels,categories,selected,disabled,onChange}:{channels:Channel[];categories:Category[];selected:string[];disabled:boolean;onChange:(ids:string[])=>void}) {
  const groups=categories.map((category)=>({id:category.category_id,name:category.category_name,channels:channels.filter((channel)=>channel.category_id===category.category_id)}));
  const ungrouped=channels.filter((channel)=>!categories.some((category)=>category.category_id===channel.category_id));
  if(ungrouped.length)groups.push({id:"uncategorised",name:"Uncategorised",channels:ungrouped});
  const count=channels.filter((channel)=>selected.includes(channel.channel_id)).length;
  const unavailable=selected.filter((id)=>!channels.some((channel)=>channel.channel_id===id));
  function toggle(ids:string[],checked:boolean){onChange(checked?[...new Set([...selected,...ids])]:selected.filter((id)=>!ids.includes(id)));}
  return <fieldset className={styles.channelPicker} disabled={disabled}>
    <legend>Visible channels</legend>
    <div className={styles.channelHeading}><p id="applicant-channel-help">Selected channels are read-only. Leave all unchecked to hide every channel. Category checkboxes select their current channels.</p><button type="button" className="text-button" disabled={disabled||!selected.length} onClick={()=>onChange([])}>Clear selection</button></div>
    <div className={styles.channelTree} aria-describedby="applicant-channel-help">
      {groups.filter((group)=>group.channels.length).map((group)=>{
        const ids=group.channels.map((channel)=>channel.channel_id);
        const all=ids.every((id)=>selected.includes(id));
        const partial=!all&&ids.some((id)=>selected.includes(id));
        return <section className={styles.channelGroup} key={group.id}>
          <label className={styles.categoryRow}><input type="checkbox" checked={all} aria-checked={partial?"mixed":all} ref={(element)=>{if(element)element.indeterminate=partial;}} onChange={(event)=>toggle(ids,event.target.checked)}/><strong>{group.name}</strong></label>
          <div>{group.channels.map((channel)=><label className={styles.channelRow} key={channel.channel_id}><input type="checkbox" checked={selected.includes(channel.channel_id)} disabled={disabled||all} onChange={(event)=>toggle([channel.channel_id],event.target.checked)}/><span>− # {channel.channel_name}</span></label>)}</div>
        </section>;
      })}
    </div>
    {!channels.length&&<p className={styles.channelEmpty}>No channels are available. Run <code>~dashboard</code> in your server to refresh the channel list.</p>}
    {!!unavailable.length&&<div className={styles.missingChannels}><p>{unavailable.length} saved channel selection(s) are no longer in the channel list.</p><button type="button" className="text-button" onClick={()=>toggle(unavailable,false)}>Remove unavailable selections</button></div>}
    <small className={styles.channelCount}>{count?`${pluralize(count,"channel","channels")} visible · Read-only access`:"All channels hidden"}</small>
  </fieldset>;
}
