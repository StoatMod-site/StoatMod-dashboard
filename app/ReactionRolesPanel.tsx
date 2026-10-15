"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import type { Theme, EmojiStyle } from "emoji-picker-react";
import { api } from "./lib/api";
import { ApplicationEmbedPreview } from "./ApplicationsPanel";
import styles from "./ReactionRolesPanel.module.css";

type Option = {emoji:string;role_id:string;label:string};
type Config = {title:string;description:string;color:string;footer:string;channel_id:string;mode:"multiple"|"single"|"keep";options:Option[]};
type Panel = {id:string;config:Config;revision:number;status:string;error:string|null;message_id:string|null;published_channel_id:string|null};
type Directory = {channels:{id:string;name:string}[];roles:{id:string;name:string;assignable:boolean;reason:string|null}[];emojis:{id:string;name:string}[];updated_at:string};
type Response = {panels:Panel[];directory:Directory|null};
type Preview = {embed:{title:string;description:string;color:string};publish_error:string|null};
const EmojiPicker=lazy(()=>import("emoji-picker-react"));
const blank=():Config=>({title:"Choose your roles",description:"Pick the topics and notifications you want to follow.",color:"#5865F2",footer:"You can update your choices here.",channel_id:"",mode:"multiple",options:[{emoji:"🎮",role_id:"",label:""}]});
const modeHelp={multiple:"Members can select several roles. Removing a reaction removes its role.",single:"Members choose one role from this message. A new selection replaces the previous one.",keep:"A reaction grants the role permanently. Removing the reaction keeps the role."};

export function ReactionRolesPanel(){
  const [panels,setPanels]=useState<Panel[]>([]);
  const [directory,setDirectory]=useState<Directory|null>(null);
  const [loaded,setLoaded]=useState(false);
  const [selected,setSelected]=useState<Panel|null>(null);
  const [draft,setDraft]=useState<Config>(blank);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [roleQuery,setRoleQuery]=useState("");
  const [emojiIndex,setEmojiIndex]=useState<number|null>(null);
  const [deleteConfirm,setDeleteConfirm]=useState(false);
  const [cleanup,setCleanup]=useState(false);
  const [preview,setPreview]=useState<(Preview & {source:string})|null>(null);
  const [previewError,setPreviewError]=useState("");
  const [previewBusy,setPreviewBusy]=useState(false);
  const refresh=useCallback(async()=>{const result=await api<Response>("/api/reaction-roles");setPanels(result.panels);setDirectory(result.directory);setLoaded(true);},[]);
  useEffect(()=>{let active=true;const load=()=>{if(active)void refresh().catch(err=>{if(active){setError(err.message);setLoaded(true);}});};load();const timer=window.setInterval(load,5000);return()=>{active=false;window.clearInterval(timer);};},[refresh]);
  const payload=JSON.stringify(draft);
  const previewSource=JSON.stringify([payload,directory?.updated_at]);
  useEffect(()=>{
    let active=true;
    const timer=window.setTimeout(()=>{
      setPreviewBusy(true);
      void api<Preview>("/api/reaction-roles",{method:"POST",body:JSON.stringify({...JSON.parse(payload),operation:"preview"})})
        .then(result=>{if(active){setPreview({...result,source:previewSource});setPreviewError("");}})
        .catch(err=>{if(active)setPreviewError(err.message);})
        .finally(()=>{if(active)setPreviewBusy(false);});
    },300);
    return()=>{active=false;window.clearTimeout(timer);};
  },[payload,previewSource]);
  async function run(work:()=>Promise<void>){setBusy(true);setError("");setNotice("");try{await work();}catch(err){setError(err instanceof Error?err.message:"The action failed.");}finally{setBusy(false);}}
  function choose(panel:Panel|null){setSelected(panel);setDraft(panel?structuredClone(panel.config):blank());setDeleteConfirm(false);setCleanup(false);setEmojiIndex(null);setNotice("");setError("");}
  function optionChange(index:number,change:Partial<Option>){setDraft(current=>({...current,options:current.options.map((option,i)=>i===index?{...option,...change}:option)}));}
  async function save(){await run(async()=>{const result=await api<{panel:Panel}>(selected?`/api/reaction-roles/${selected.id}`:"/api/reaction-roles",{method:"POST",body:JSON.stringify({...draft,revision:selected?.revision})});setSelected(result.panel);setNotice("Saved. Stoatmod is publishing the panel; its status will update here.");await refresh();});}
  async function action(operation:string){if(!selected)return;await run(async()=>{const current=panels.find(panel=>panel.id===selected.id)||selected;const result=await api<{panel:Panel}>(`/api/reaction-roles/${selected.id}`,{method:"POST",body:JSON.stringify({operation,revision:current.revision,cleanup})});setSelected(result.panel);setDeleteConfirm(false);setNotice(operation==="delete"?"Deletion queued. Your choice about assigned roles has been saved.":"Update queued. Check the panel status for confirmation.");await refresh();});}
  const current=panels.find(panel=>panel.id===selected?.id)||selected;
  const pending=current?.status==="pending";
  const roles=directory?.roles.filter(role=>role.name.toLowerCase().includes(roleQuery.toLowerCase()))||[];
  const channel=directory?.channels.find(item=>item.id===draft.channel_id);
  const previewCurrent=preview?.source===previewSource;
  return <div className={`dashboard-surface ${styles.page}`}>
    <header className={styles.header}><div><p className="eyebrow">Member preferences</p><h2>Let members choose their roles.</h2><p>Publish an emoji menu for interests, events, and notifications.</p></div><button className="primary-button" onClick={()=>choose(null)}>＋ New panel</button></header>
    {error&&<p className={styles.error} role="alert">{error}</p>}{notice&&<p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.layout}>
      <aside className={styles.list}><h3>Your panels</h3>{!loaded&&<p>Loading panels…</p>}{loaded&&!panels.length&&<p>No panels yet. Create your first role menu.</p>}
        {panels.map(panel=><button className={selected?.id===panel.id?styles.selected:""} key={panel.id} onClick={()=>choose(panel)}><strong>{panel.config.title}</strong><span>{panel.status==="pending"?"Updating…":panel.status}{panel.error?" · Needs attention":""}</span><small>{panel.config.options.length} role options</small></button>)}
        <button className="text-button" disabled={busy} onClick={()=>void run(async()=>{await api("/api/reaction-roles",{method:"POST",body:JSON.stringify({operation:"directory"})});setNotice("Refreshing server roles, channels and emojis…");})}>Refresh server options</button>
      </aside>
      <section className={styles.editor}>
        <div className={styles.row}><h3>{selected?"Edit panel":"Create a panel"}</h3>{current&&<span className={styles.status}>{current.status==="pending"?"Updating…":current.status}</span>}</div>
        {current?.error&&<p className={styles.error} role="alert">{current.error}</p>}
        {!directory&&<p role="status">Loading server roles, channels and emojis. If they do not appear, use Refresh server options and check that Stoatmod is connected.</p>}
        <fieldset disabled={busy||pending||!directory||current?.status==="deleted"}>
          <label>Channel<select value={draft.channel_id} disabled={Boolean(current?.message_id)} onChange={event=>setDraft({...draft,channel_id:event.target.value})}><option value="">Choose a channel</option>{directory?.channels.map(item=><option value={item.id} key={item.id}># {item.name}</option>)}</select></label>
          <label>Embed title<input value={draft.title} maxLength={100} onChange={event=>setDraft({...draft,title:event.target.value})}/></label>
          <label>Description<textarea value={draft.description} maxLength={1000} rows={3} onChange={event=>setDraft({...draft,description:event.target.value})}/></label>
          <div className={styles.pair}><label>Accent colour<input type="color" value={draft.color} onChange={event=>setDraft({...draft,color:event.target.value})}/></label><label>Selection mode<select value={draft.mode} onChange={event=>setDraft({...draft,mode:event.target.value as Config["mode"]})}><option value="multiple">Multiple roles</option><option value="single">One role per message</option><option value="keep">Keep after selection</option></select></label></div>
          <p className={styles.hint}>{modeHelp[draft.mode]}</p>
          <div className={styles.row}><h3>Emoji → role</h3><span>{draft.options.length} / 12</span></div>
          <label>Find a role<input type="search" value={roleQuery} onChange={event=>setRoleQuery(event.target.value)} placeholder="Search role names"/></label>
          {draft.options.map((option,index)=><div className={styles.option} key={index}>
            <div className={styles.optionTop}><button className={styles.emojiButton} aria-label={`Choose emoji for role ${index+1}`} aria-expanded={emojiIndex===index} onClick={()=>setEmojiIndex(emojiIndex===index?null:index)}>{directory?.emojis.find(emoji=>emoji.id===option.emoji)?":"+directory.emojis.find(emoji=>emoji.id===option.emoji)?.name+":" : option.emoji}</button>
              <label>Role<select value={option.role_id} onChange={event=>optionChange(index,{role_id:event.target.value})}><option value="">Choose a role</option>{directory?.roles.filter(role=>roles.includes(role)||role.id===option.role_id).map(role=><option value={role.id} disabled={!role.assignable} key={role.id}>{role.name}{role.assignable?"":" — "+role.reason}</option>)}</select></label>
              <button className="text-button" aria-label={`Remove role option ${index+1}`} disabled={draft.options.length===1} onClick={()=>{setDraft({...draft,options:draft.options.filter((_,i)=>i!==index)});setEmojiIndex(null);}}>×</button></div>
            {emojiIndex===index&&<div className={styles.picker}><Suspense fallback={<p>Loading emoji picker…</p>}><EmojiPicker width="100%" height={320} theme={"auto" as Theme} emojiStyle={"native" as EmojiStyle} lazyLoadEmojis onEmojiClick={choice=>{optionChange(index,{emoji:choice.emoji});setEmojiIndex(null);}}/></Suspense>{Boolean(directory?.emojis.length)&&<label>Server emoji<select value={directory?.emojis.some(emoji=>emoji.id===option.emoji)?option.emoji:""} onChange={event=>{if(event.target.value){optionChange(index,{emoji:event.target.value});setEmojiIndex(null);}}}><option value="">Choose a server emoji</option>{directory?.emojis.map(emoji=><option value={emoji.id} key={emoji.id}>:{emoji.name}:</option>)}</select></label>}<button className="text-button" onClick={()=>setEmojiIndex(null)}>Close emoji picker</button></div>}
            <label>Display label<input value={option.label} maxLength={60} placeholder={directory?.roles.find(role=>role.id===option.role_id)?.name||"Defaults to the role name"} onChange={event=>optionChange(index,{label:event.target.value})}/></label>
          </div>)}
          <button className="secondary-button" disabled={draft.options.length>=12} onClick={()=>setDraft({...draft,options:[...draft.options,{emoji:"🔔",role_id:"",label:""}]})}>＋ Add role option</button>
          <label>Footer<input value={draft.footer} maxLength={160} onChange={event=>setDraft({...draft,footer:event.target.value})}/></label>
          <p className={styles.hint}>Members complete required CAPTCHAs and applications before choosing roles. Staff roles and the application access role are unavailable.</p>
          {previewCurrent&&preview?.publish_error&&<p className={styles.hint}>{preview.publish_error}</p>}
          <button className="primary-button" disabled={!previewCurrent||Boolean(preview?.publish_error)||Boolean(previewError)} onClick={()=>void save()}>{busy?"Saving…":selected?"Save panel changes":"Publish role panel"} →</button>
        </fieldset>
        {current&&current.status!=="deleted"&&<div className={styles.actions}>
          <button className="secondary-button" disabled={busy||pending} onClick={()=>void action(current.status==="paused"?"publish":"pause")}>{current.status==="paused"?"Resume panel":"Pause panel"}</button>
          <button className="secondary-button" disabled={busy||pending} onClick={()=>void action("publish")}>Republish / repair</button>
          {current.error&&<button className="secondary-button" disabled={busy||pending} onClick={()=>void action("retry")}>Retry failed action</button>}
          <button className="text-button" disabled={busy||pending} onClick={()=>setDeleteConfirm(true)}>Delete panel</button>
        </div>}
        {deleteConfirm&&<section className={styles.confirm} role="group" aria-label="Delete panel confirmation"><h3>Delete this role message?</h3><p>Existing roles stay assigned by default.</p><label className={styles.checkbox}><input type="checkbox" checked={cleanup} onChange={event=>setCleanup(event.target.checked)}/>Also remove roles granted solely by this panel</label><div className={styles.row}><button className="secondary-button" disabled={busy} onClick={()=>setDeleteConfirm(false)}>Cancel</button><button className="primary-button" disabled={busy} onClick={()=>void action("delete")}>Confirm deletion</button></div></section>}
      </section>
      <aside className={styles.preview} aria-label="Live embed preview"><p className="eyebrow">Live embed preview</p><h3>{channel?"# "+channel.name:"New role message"}</h3>{previewError&&<p className={styles.error} role="alert">{previewError}</p>}{(!previewError||preview)&&<ApplicationEmbedPreview embeds={preview?[preview.embed]:[]} loading={!previewError&&(previewBusy||!previewCurrent)} context="Server message · just now"/>}<div className={styles.reactions} aria-label="Message reactions">{draft.options.map((option,index)=><span key={index}>{directory?.emojis.find(emoji=>emoji.id===option.emoji)?":"+directory.emojis.find(emoji=>emoji.id===option.emoji)?.name+":" : option.emoji} <small>1</small></span>)}</div><p className={styles.hint}>Preview only. Role changes begin after the panel is published.</p></aside>
    </div>
  </div>;
}
