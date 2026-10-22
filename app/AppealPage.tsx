"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { api, apiBase } from "./lib/api";
import { SiteNav } from "./SiteNav";
import { PublicFooter } from "./PublicFooter";
import styles from "./PrivateForms.module.css";
import access from "./AppealAccess.module.css";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import { LocaleSelector, useSiteLocale } from "./WebsiteI18n";

type AppealEvidence = {
  case_id?:string;
  action?:string;
  moderator_reason?:string;
  created_at?:string;
  original_message?:string|null;
  detected_thresholds?:Record<string,unknown>;
  entries?:AppealEvidenceEntry[];
};
type AppealEvidenceAttachment = { id:number; filename:string; content_type:string; size:number; created_at:string };
type AppealEvidenceEntry = { id:number; content:string; created_at:string; attachments:AppealEvidenceAttachment[] };
type AppealMessage={id:number;sender_type:"appellant"|"moderator"|"system";message:string;request_info:boolean;created_at:string;attachments:AppealEvidenceAttachment[]};
type AppealPrivacy = {policy_version:string;ai_notice_version:string;ai_improvement_eligible:boolean;ai_improvement_opt_in:boolean;ai_training_enabled:boolean;ai_contribution_days:number;appeal_deadline:string|null;ai_contribution_expires_at:string|null;content_deleted_at:string|null};
type Appeal = { id:number; status:"eligible"|"submitted"|"approved"|"denied"; case_reference:string; case_kind:string; statement:string|null; reviewer_response:string|null; needs_info?:boolean;messages?:AppealMessage[]; evidence:AppealEvidence;privacy:AppealPrivacy };

function pretty(value:string){return value.replaceAll("_"," ").replace(/\b\w/g,(letter)=>letter.toUpperCase());}
function confidenceScores(evidence:AppealEvidence){
  const thresholdData=evidence.detected_thresholds||{};
  const source=thresholdData.scores&&typeof thresholdData.scores==="object"?thresholdData.scores as Record<string,unknown>:thresholdData;
  return Object.entries(source).flatMap(([label,value])=>{
    const numeric=Number(value);
    if(!Number.isFinite(numeric))return [];
    const percentage=Math.max(0,Math.min(100,Math.round(numeric<=1?numeric*100:numeric)));
    return [[label,percentage] as const];
  }).sort(([,left],[,right])=>right-left);
}
function matchedCategories(evidence:AppealEvidence){
  const value=evidence.detected_thresholds?.categories;
  if(Array.isArray(value))return value.map(String);
  if(value&&typeof value==="object")return Object.entries(value).filter(([,matched])=>Boolean(matched)).map(([label])=>label);
  return [];
}
function formatBytes(value:number){if(value<1024)return `${value} B`;if(value<1024*1024)return `${(value/1024).toFixed(1)} KB`;return `${(value/(1024*1024)).toFixed(1)} MB`;}

function AppealAttachment({attachment,code,userId,kind="evidence"}:{attachment:AppealEvidenceAttachment;code:string;userId:string;kind?:"evidence"|"message"}){
  const [url,setUrl]=useState("");
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const controller=new AbortController();
    let objectUrl="";
    const path=kind==="evidence"?`/api/appeals/evidence/${attachment.id}`:`/api/appeals/attachments/${attachment.id}`;
    void fetch(`${apiBase()}${path}`,{credentials:"include",headers:{"X-Appeal-Code":code,"X-Stoat-User-ID":userId},signal:controller.signal}).then((response)=>{if(!response.ok)throw new Error("Evidence image unavailable");return response.blob();}).then((blob)=>{objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}).catch((reason)=>{if((reason as Error).name!=="AbortError")setFailed(true);});
    return()=>{controller.abort();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[attachment.id,code,userId,kind]);
  return <a href={url||undefined} onClick={(event)=>{if(!url)event.preventDefault();}} target="_blank" rel="noreferrer" aria-label={`Open ${attachment.filename}`}><span className="appeal-evidence-image">{url?<img src={url} alt={attachment.filename}/>:<b>{failed?"Image unavailable":"Loading image…"}</b>}</span><span><strong>{attachment.filename}</strong><small>{formatBytes(attachment.size)}{url?" · Open original ↗":""}</small></span></a>;
}

export function AppealPage(){
  const [locale]=useSiteLocale();
  const [code,setCode]=useState("");
  const [userId,setUserId]=useState("");
  const [statement,setStatement]=useState("");
  const [followUp,setFollowUp]=useState("");
  const [appeal,setAppeal]=useState<Appeal|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [images,setImages]=useState<File[]>([]);
  const [notice,setNotice]=useState("");
  const [privacyAgreed,setPrivacyAgreed]=useState(false);
  const [aiOptIn,setAiOptIn]=useState(false);
  const caseHeading=useRef<HTMLHeadingElement>(null);
  const codeInput=useRef<HTMLInputElement>(null);
  const uploadInput=useRef<HTMLInputElement>(null);
  const validCredentials=/^[A-Z0-9]{10}$/.test(code)&&/^[A-Za-z0-9]{10,64}$/.test(userId);

  useEffect(()=>{if(appeal?.id)caseHeading.current?.focus();},[appeal?.id]);

  async function lookup(event:FormEvent){
    event.preventDefault();if(busy||!validCredentials)return;setBusy(true);setError("");setNotice("");
    try{const result=await api<{appeal:Appeal}>("/api/appeals/lookup",{method:"POST",body:JSON.stringify({code,user_id:userId})});setAppeal(result.appeal);setPrivacyAgreed(false);setAiOptIn(result.appeal.privacy.ai_improvement_opt_in);setStatement(result.appeal.status==="eligible"?result.appeal.statement||"":"");setFollowUp("");}
    catch(reason){setError(reason instanceof Error?reason.message:"Could not find that appeal.");}
    finally{setBusy(false);}
  }
  async function submit(event:FormEvent){
    event.preventDefault();if(busy||!appeal)return;if(!privacyAgreed){setError("Agree to the privacy policy and appeal processing before submitting.");return;}setBusy(true);setError("");setNotice("");
    try{const form=new FormData();form.append("code",code);form.append("user_id",userId);form.append("privacy_policy_agreed","true");form.append("privacy_policy_version",appeal.privacy.policy_version);form.append("ai_improvement_opt_in",String(aiOptIn));form.append("ai_notice_version",appeal.privacy.ai_notice_version);if(appeal.status==="submitted")form.append("message",followUp);else form.append("statement",statement);for(const image of images)form.append("images",image,image.name);const response=await fetch(`${apiBase()}${appeal.status==="submitted"?"/api/appeals/respond":"/api/appeals/submit"}`,{method:"POST",body:form});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||"Could not submit the appeal.");setNotice(appeal.status==="submitted"?"Your follow-up was added to the case.":"Your appeal was submitted for review.");setAppeal(body.appeal as Appeal);setPrivacyAgreed(false);setAiOptIn((body.appeal as Appeal).privacy.ai_improvement_opt_in);setStatement("");setFollowUp("");setImages([]);if(uploadInput.current)uploadInput.current.value="";}
    catch(reason){setError(reason instanceof Error?reason.message:"Could not submit the appeal.");}
    finally{setBusy(false);}
  }
  async function withdrawAiPermission(){
    if(busy)return;setBusy(true);setError("");setNotice("");
    try{const result=await api<{appeal:Appeal}>("/api/appeals/ai-permission",{method:"DELETE",body:JSON.stringify({code,user_id:userId})});setAppeal(result.appeal);setAiOptIn(false);setNotice("AI-improvement permission withdrawn. Any saved contribution has been deleted.");}
    catch(reason){setError(reason instanceof Error?reason.message:"Could not withdraw permission.");}
    finally{setBusy(false);}
  }
  function reset(){setAppeal(null);setCode("");setStatement("");setFollowUp("");setImages([]);setPrivacyAgreed(false);setAiOptIn(false);setError("");setNotice("");requestAnimationFrame(()=>codeInput.current?.focus());}

  function selectImages(input:HTMLInputElement){
    const selected=Array.from(input.files||[]);
    const problem=selected.length>3?"Choose up to three evidence images.":selected.some(file=>file.size>4*1024*1024)?"Each evidence image must be 4 MB or smaller.":selected.reduce((size,file)=>size+file.size,0)>8*1024*1024?"Evidence images must be 8 MB or smaller in total.":selected.some(file=>!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))?"Choose PNG, JPEG, WebP or GIF images.":"";
    if(problem){setError(problem);input.value="";return;}
    setError("");setImages(selected);
  }

  const evidence=appeal?.evidence||{};
  const scores=confidenceScores(evidence);
  const categories=matchedCategories(evidence);
  const evidenceEntries=evidence.entries||[];
  const dateLocale={en:"en-GB",fr:"fr-FR",pt:"pt-PT",es:"es-ES"}[locale];
  const isDecided=appeal?.status==="approved"||appeal?.status==="denied";
  const responseText=appeal?.status==="submitted"?followUp:statement;
  const responseLimit=appeal?.status==="submitted"?4000:2000;

  return <main className={`appeal-page ${styles.appeal}`}>
    <SiteNav active="appeal"/>
    <PublicPageHeading eyebrow="Appeals" title="Appeal a decision." description="Read the case. Share your side. Follow the review." action={{href:"/docs/appeals",label:"How appeals work"}} />
    <PublicSummary title={appeal?"Your private case is open":"A fair review starts with the details."} description={appeal?"Review the recorded evidence and keep your response with the case.":"Use the appeal code from your Stoatmod DM and your Stoat user ID to open your case securely."} facts={["Private case access","Evidence and responses in one place","Reviewed by a moderator"]} />

    {!appeal?<section className={access.gateway}>
      <div><header className={access.sectionHead}><div><p className={access.eyebrow}>Case access</p><h2>Open your case</h2></div><span className={access.privateLabel}>Code + user ID</span></header>
      <form className={access.form} onSubmit={lookup} aria-busy={busy}>
        <p className={access.intro}>Both details must match before your case or its evidence can be shown.</p>
        <div className={access.field}><label htmlFor="appeal-code">Appeal code <span>10 CHARACTERS</span></label><input className={access.code} id="appeal-code" ref={codeInput} name="appeal-code" required value={code} autoComplete="one-time-code" spellCheck={false} onChange={(event)=>setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,10))} placeholder="XXXXXXXXXX" aria-describedby="appeal-code-help"/><small id="appeal-code-help">Find this in your moderation DM. Spaces and hyphens are removed automatically.</small></div>
        <div className={access.field}><label htmlFor="appeal-user-id">Stoat user ID <span>YOUR ACCOUNT</span></label><input id="appeal-user-id" name="stoat-user-id" required value={userId} maxLength={64} autoComplete="username" spellCheck={false} onChange={(event)=>setUserId(event.target.value.trim())} placeholder="Paste your Stoat user ID" aria-describedby="appeal-user-help"/><small id="appeal-user-help">Use your account’s user ID, rather than your display name or case number.</small></div>
        <div className={access.formFooter}>{error&&<p className="appeal-error" role="alert">{error}</p>}<button type="submit" disabled={busy||!validCredentials}>{busy?"Checking…":"View case"}<span aria-hidden="true">→</span></button><p>Your appeal code belongs to one case. Keep it private.</p></div>
      </form></div>
      <aside className={access.guidance}>
        <header className={access.sectionHead}><div><p className={access.eyebrow}>The process</p><h2>What happens next</h2></div></header>
        <ol className={access.steps}><li><span>01</span><div><h3>Read the decision</h3><p>See the action, moderator’s reason, and stored evidence.</p></div></li><li><span>02</span><div><h3>Explain your side</h3><p>Point out anything inaccurate and add relevant context or evidence.</p></div></li><li><span>03</span><div><h3>Follow the review</h3><p>Return with the same details to read the response or add a follow-up.</p></div></li></ol>
        <div className={access.help}><h3>Need help getting in?</h3><details><summary>Where is my appeal code?</summary><p>Check the moderation message sent by Stoatmod. Eligible decisions include the private appeal code. If you cannot find it, contact the server’s moderators.</p></details><details><summary>My details are not being accepted</summary><p>Use the code from the decision you want reviewed and the Stoat user ID for the account involved. A case ID or display name cannot be used here.</p></details><details><summary>Is this the right place for a global ban?</summary><p>Global bans have a separate review route. Follow the <a href="/guides/how-to-report-scams-and-appeal-global-bans-on-stoat">global-ban appeal guide</a>.</p></details></div>
        <p className={access.note}>Only submit information relevant to the decision. <a href="/privacy">Read the privacy policy.</a></p>
      </aside>
    </section>:<section className="appeal-review-workspace" id="appeal-case">
      <header className="appeal-review-head">
        <div><button type="button" onClick={reset} disabled={busy}>← Use another code</button><p className="eyebrow">Private case · CASE-{appeal.case_reference}</p><h2 ref={caseHeading} tabIndex={-1}>{pretty(evidence.action||appeal.case_kind)}</h2></div>
        <span className={`appeal-status ${appeal.status}`}>{pretty(appeal.status)}</span>
      </header>

      <ol className="appeal-progress" aria-label="Appeal process"><li className="complete"><span>✓</span><div><strong>Verified</strong><small>Identity matched</small></div></li><li className="complete"><span>✓</span><div><strong>Case opened</strong><small>Evidence available</small></div></li><li className={appeal.status==="eligible"?"active":"complete"}><span>{appeal.status==="eligible"?"03":"✓"}</span><div><strong>{isDecided?"Decision issued":appeal.needs_info?"Information requested":appeal.status==="submitted"?"Submitted":"Your response"}</strong><small>{isDecided?pretty(appeal.status):appeal.needs_info?"A moderator is waiting for your response":appeal.status==="submitted"?"Awaiting review":"Ready to write"}</small></div></li></ol>

      <div className="appeal-review-grid">
        <article className="appeal-case-record">
          <div className="appeal-record-title"><div><p className="section-number">02 / Decision record</p><h3>What the reviewer recorded</h3></div><span>{evidence.created_at?new Date(evidence.created_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"}):"Date unavailable"}</span></div>
          <dl><div><dt>Case ID</dt><dd>CASE-{evidence.case_id||appeal.case_reference}</dd></div><div><dt>Action</dt><dd>{pretty(evidence.action||appeal.case_kind)}</dd></div></dl>
          <section className="appeal-reason"><h4>Moderator reason</h4><p>{evidence.moderator_reason||"No reason supplied"}</p></section>
          <section className="appeal-original"><h4>Original message</h4>{evidence.original_message?<blockquote>{evidence.original_message}</blockquote>:<p>{appeal.privacy.content_deleted_at?"Deleted from the case under the content-retention policy.":"No original content is available. It may not have been stored or may have expired."}</p>}</section>
          <section className="appeal-added-evidence"><div className="appeal-evidence-heading"><h4>Additional case evidence</h4><span>{evidenceEntries.length} {evidenceEntries.length===1?"entry":"entries"}</span></div>{evidenceEntries.length?<div className="appeal-public-evidence-list">{evidenceEntries.map((item)=><article key={item.id}><header><strong>Evidence</strong><time>{new Date(item.created_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</time></header>{item.content&&<p>{item.content}</p>}{item.attachments.length>0&&<div className="appeal-evidence-attachments">{item.attachments.map((attachment)=><AppealAttachment key={attachment.id} attachment={attachment} code={code} userId={userId}/>)}</div>}</article>)}</div>:<p>No additional evidence was added to this case.</p>}</section>
          {categories.length>0&&<section className="appeal-categories"><h4>Matched policy categories</h4><div>{categories.map((category)=><span key={category}>{pretty(category)}</span>)}</div></section>}
          <section className="appeal-confidence"><div className="appeal-evidence-heading"><h4>Detected confidence</h4>{scores.length>0&&<span>0—100% scale</span>}</div>{scores.length>0?<div className="appeal-score-list">{scores.map(([label,percentage])=><span key={label}><span><b>{pretty(label)}</b><strong>{percentage}%</strong></span><i aria-label={`${pretty(label)} confidence ${percentage}%`}><b style={{width:`${percentage}%`}}/></i></span>)}</div>:<p>No automated threshold evidence applies to this case.</p>}</section>
        </article>

        <aside className="appeal-response-card">
          <p className="section-number">03 / Your response</p>
          {notice&&<p className="appeal-success" role="status">{notice}</p>}
          <div className={styles.appealRetention}><p>AI-moderated message content expires 30 days after the automated decision unless an appeal is submitted. Appeal content is deleted when the appeal is decided.</p><p>{appeal.privacy.appeal_deadline?`Review deadline: ${new Date(appeal.privacy.appeal_deadline).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}. `:""}If no decision is made within 10 days of submission, the appeal is automatically rejected and all its content is deleted, even if you selected AI improvement. Follow-ups do not extend this deadline.</p></div>
          {Boolean(appeal.messages?.length)&&<div className="appeal-portal-timeline"><h3>Decision timeline</h3>{appeal.messages?.map((message)=><article key={message.id}><header><strong>{message.sender_type==="appellant"?"You":"Moderator"}</strong><time>{new Date(message.created_at).toLocaleString(dateLocale,{dateStyle:"medium",timeStyle:"short"})}</time></header><p data-no-translate>{message.message}</p>{message.attachments.length>0&&<div className="appeal-evidence-attachments">{message.attachments.map((attachment)=><AppealAttachment key={attachment.id} attachment={attachment} code={code} userId={userId} kind="message"/>)}</div>}</article>)}</div>}
          {isDecided?<div className={`appeal-decision ${appeal.status}`}><span aria-hidden="true">{appeal.status==="approved"?"✓":"×"}</span><p className="eyebrow">Review complete</p><h3>Appeal {appeal.status}.</h3><p>{appeal.reviewer_response||"The moderator did not add a public response."}</p></div>:<form className="appeal-statement" onSubmit={submit} aria-busy={busy}>
            <div><h3>{appeal.status==="submitted"?"Add a follow-up":"Tell the reviewer what changed"}</h3><p>{appeal.status==="submitted"?"Add new context or answer a moderator request. Your original statement stays unchanged.":"Explain what happened, identify anything inaccurate, and add context that was missing from the original decision."}</p></div>
            {appeal.status==="submitted"&&<p className="appeal-submitted-note"><span aria-hidden="true">✓</span> Your appeal is in the review queue. Follow-ups are added to its timeline.</p>}
            <label>{appeal.status==="submitted"?"Follow-up":"Your appeal"}<textarea minLength={appeal.status==="submitted"?3:20} maxLength={responseLimit} required value={responseText} onChange={(event)=>appeal.status==="submitted"?setFollowUp(event.target.value):setStatement(event.target.value)} placeholder={appeal.status==="submitted"?"Add new information or answer the moderator’s question.":"Explain what happened and why this decision should be reviewed."}/></label>
            <label className="appeal-upload-button">Add evidence images<input ref={uploadInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple aria-describedby="appeal-upload-help" onChange={(event)=>selectImages(event.target)}/></label><small id="appeal-upload-help">Up to three PNG, JPEG, WebP or GIF images. Maximum 4 MB each and 8 MB total.</small>{images.map((image,index)=><div className="appeal-selected-image" key={`${image.name}-${image.size}`}><small data-no-translate>{image.name} · {formatBytes(image.size)}</small><button type="button" aria-label={`Remove ${image.name}`} onClick={()=>{setImages(current=>current.filter((_,item)=>item!==index));if(uploadInput.current)uploadInput.current.value="";}}>Remove</button></div>)}
            <ul><li>Refer to the case evidence above.</li><li>Keep the statement factual and specific.</li><li>Include relevant context the moderator could not see.</li></ul>
            <div className={styles.appealConsent}>
              <label><input type="checkbox" required checked={privacyAgreed} onChange={(event)=>setPrivacyAgreed(event.target.checked)}/><span>I agree to the <a href="/privacy#appeals" target="_blank" rel="noreferrer">privacy policy and appeal processing</a>, including storage of my statement, evidence and follow-ups for this review until a decision or the 10-day deadline.</span></label>
              {(appeal.privacy.ai_improvement_eligible||appeal.privacy.ai_improvement_opt_in)&&<><label><input type="checkbox" checked={aiOptIn} onChange={(event)=>setAiOptIn(event.target.checked)} aria-describedby="appeal-ai-help"/><span>Optional: use my own moderated message to improve our AI. I agree to the separate <a href="/privacy#ai-improvement" target="_blank" rel="noreferrer">AI-improvement notice</a>.</span></label><p id="appeal-ai-help">Only your own original message is eligible. After a moderator decides the appeal, it may be held for up to 90 days to review false positives and false negatives. Your appeal statement, images and other people&apos;s messages are excluded. This choice does not affect your appeal. We do not currently train models using appeal contributions.</p><p>Your choice is saved when you submit this form. You can withdraw saved permission immediately using the button below.</p></>}
            </div>
            {error&&<p className="appeal-error" role="alert">{error}</p>}
            <footer><small>{responseText.length.toLocaleString()}/{responseLimit.toLocaleString()}</small><button type="submit" disabled={busy||!privacyAgreed||responseText.trim().length<(appeal.status==="submitted"?3:20)}>{busy?"Submitting…":appeal.needs_info?"Send requested information":appeal.status==="submitted"?"Add follow-up":"Submit appeal"}<span aria-hidden="true">→</span></button></footer>
          </form>}
          {appeal.privacy.ai_improvement_opt_in&&<div className={styles.appealRetention}><p>AI-improvement permission is saved.{appeal.privacy.ai_contribution_expires_at?` Your original contribution expires on ${new Date(appeal.privacy.ai_contribution_expires_at).toLocaleDateString(dateLocale)}.`:""}</p><button type="button" disabled={busy} onClick={withdrawAiPermission}>Withdraw AI-improvement permission</button></div>}
          {isDecided&&error&&<p className="appeal-error" role="alert">{error}</p>}
          <p className="appeal-response-privacy"><span aria-hidden="true">●</span> Your statement is shared only with authorised reviewers for this case.</p>
        </aside>
      </div>
    </section>}
    <LocaleSelector/>
    <PublicFooter />
  </main>;
}
