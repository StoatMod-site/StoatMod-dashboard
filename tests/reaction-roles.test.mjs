import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require=createRequire(import.meta.url);
const source=await readFile(new URL("../app/ReactionRolesPanel.tsx",import.meta.url),"utf8");
const {outputText}=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
const directory={channels:[{id:"channel",name:"Roles"}],roles:[{id:"gaming",name:"Gaming",assignable:true},{id:"staff",name:"Staff",assignable:false,reason:"Staff permissions"}],emojis:[{id:"01CUSTOM000000000000000000",name:"stoat"}]};
const config={title:"Choose roles",description:"Hello",color:"#5865F2",footer:"",channel_id:"channel",mode:"multiple",options:[{emoji:"🎮",role_id:"gaming",label:"Games"}]};
function harness(){
  const states=[[],directory,true,null,structuredClone(config)],effects=[],requests=[],timers=[];let cursor=0;
  const hooks={...React,useEffect(effect){effects.push(effect);},useCallback(fn){return fn;},useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==="function"?initial():initial;return [states[i],next=>{states[i]=typeof next==="function"?next(states[i]):next;}];}};
  const compiledModule={exports:{}};
  runInNewContext(`(function(require,module,exports){${outputText}\n})`,{structuredClone,window:{setTimeout(fn){timers.push(fn);},clearTimeout(){}}})(id=>id==="react"?hooks:id.endsWith(".css")?new Proxy({},{get:(_,key)=>key==="__esModule"?false:String(key)}):id==="./lib/api"?{api:async(path,init)=>{requests.push({path,init});return {panels:[],directory,embed:{title:"Choose roles",description:"🎮 — Choose a role",color:"#5865F2"},publish_error:"Choose a channel"};}}:id==="./ApplicationsPanel"?{ApplicationEmbedPreview:()=>null}:require(id),compiledModule,compiledModule.exports);
  return {states,requests,render(){cursor=0;return compiledModule.exports.ReactionRolesPanel();},async preview(){effects.at(-1)();timers.shift()();await new Promise(setImmediate);}};
}
function elements(node,type){if(!node||typeof node!=="object")return [];if(Array.isArray(node))return node.flatMap(item=>elements(item,type));return [...(node.type===type?[node]:[]),...elements(node.props?.children,type)];}

test("dashboard navigation restores Applications after Members and retains review workflows",async()=>{
  const source=await readFile(new URL("../app/DashboardApp.tsx",import.meta.url),"utf8");
  const block=source.slice(source.indexOf("const navItems:"),source.indexOf("const FullEmojiPicker"));
  const labels=[...block.matchAll(/label:"([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(labels,["Overview","Cases","Appeals","Members","Applications","Activity log","Policy Studio","Automation Lab","Reaction roles","Polls 2.0","Leaderboards","Discovery"]);
  assert.match(source,/<\/nav><button className=\{`sidebar-support/);
  assert.doesNotMatch(source,/view==="applications"\?"members"/);
  assert.match(source,/view==="applications"&&<ApplicationsPanel\/>/);
  assert.match(source,/\["appeals","cases","reports"\]\.includes\(view\)/);
});

test("an unfinished panel shows the shared embed preview before selecting a channel or roles",()=>{
  const h=harness();h.states[1]=null;h.states[4].channel_id="";h.states[4].options[0].role_id="";
  const tree=h.render();
  const preview=elements(tree,"aside").find(item=>item.props["aria-label"]==="Live embed preview");
  assert.ok(preview);
  const shared=React.Children.toArray(preview.props.children).find(item=>typeof item.type==="function");
  assert.ok(shared);assert.equal(shared.props.loading,true);assert.equal(shared.props.context,"Server message · just now");
  assert.equal(elements(tree,"button").find(item=>item.props.children?.includes?.("Publish role panel")).props.disabled,true);
});

test("preview requests include unfinished drafts and display the returned embed",async()=>{
  const h=harness();h.states[1]=null;h.states[4].channel_id="";h.states[4].options[0].role_id="";
  h.render();await h.preview();
  assert.equal(h.requests.length,1);
  const request=JSON.parse(h.requests[0].init.body);
  assert.equal(request.operation,"preview");assert.equal(request.channel_id,"");assert.equal(request.options[0].role_id,"");
  const preview=elements(h.render(),"aside").find(item=>item.props["aria-label"]==="Live embed preview");
  const shared=React.Children.toArray(preview.props.children).find(item=>typeof item.type==="function");
  assert.equal(shared.props.embeds[0].description,"🎮 — Choose a role");assert.equal(shared.props.loading,false);
});

test("publishing needs a valid preview of the current draft",()=>{
  const h=harness();h.render();
  const publish=()=>elements(h.render(),"button").find(item=>item.props.children?.includes?.("Publish role panel"));
  h.states[12]={embed:{title:"Choose roles",description:"🎮 — Games",color:"#5865F2"},source:JSON.stringify([JSON.stringify(h.states[4]),undefined]),publish_error:null};
  assert.equal(publish().props.disabled,false);
  h.states[12].publish_error="Choose a text channel in this server.";
  assert.equal(publish().props.disabled,true);
  h.states[12].publish_error=null;h.states[4].title="Changed title";
  assert.equal(publish().props.disabled,true);
});

test("reaction-role editor offers three modes and blocks staff roles",()=>{
  const h=harness();const tree=h.render();const html=renderToStaticMarkup(tree);
  assert.match(html,/Multiple roles/);assert.match(html,/One role per message/);assert.match(html,/Keep after selection/);
  const staff=elements(tree,"option").find(option=>option.props.value==="staff");assert.equal(staff.props.disabled,true);
  const mode=elements(tree,"select").find(select=>select.props.value==="multiple");mode.props.onChange({target:{value:"single"}});
  assert.equal(h.states[4].mode,"single");
});

test("removing an option keeps the other role mapping intact",()=>{
  const h=harness();h.states[4].options.push({emoji:"🎨",role_id:"art",label:"Art"});
  const button=elements(h.render(),"button").find(item=>item.props["aria-label"]==="Remove role option 1");button.props.onClick();
  assert.equal(h.states[4].options.length,1);assert.equal(h.states[4].options[0].role_id,"art");
});

test("panel deletion defaults to preserving granted roles",()=>{
  const h=harness();h.render();h.states[10]=true;
  const checkbox=elements(h.render(),"input").find(input=>input.props.type==="checkbox");
  assert.equal(checkbox.props.checked,false);
  checkbox.props.onChange({target:{checked:true}});assert.equal(h.states[11],true);
});
