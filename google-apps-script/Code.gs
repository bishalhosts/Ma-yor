/**
 * Nagarik Voice backend (Google Apps Script).
 * TWO deployments of this same script are used:
 *  A) PUBLIC  – Execute as: Me, Who has access: Anyone      -> citizens POST feedback (doPost)
 *  B) ADMIN   – Execute as: User accessing, access: Anyone with Google account -> opens dashboard (doGet)
 * Admin access is enforced on the server by ADMIN_EMAILS below.
 */
const ADMIN_EMAILS = ['bishal94110@gmail.com'];
const SHEET_TITLE = 'Nagarik Voice Responses', TAB = 'Feedback';
const HEADERS = ['Submission ID','Timestamp','Name','Ward','Category','Message','Contact Information','Anonymous','Review Status','Admin Notes'];
const CATEGORIES = ['Complaint','Suggestion','Appreciation','General Feedback','Public Service Problem','Development-related Feedback'];
const STATUSES = ['New','Under Review','In Progress','Resolved','Rejected'];
const MAX_WARD = 33, MAX_MSG = 1000, GLOBAL_LIMIT_PER_MIN = 20;

function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function isAdmin_(){const e=Session.getActiveUser().getEmail();return !!e && ADMIN_EMAILS.map(s=>s.toLowerCase()).indexOf(e.toLowerCase())>-1;}
function sheet_(){
  const p=PropertiesService.getScriptProperties();let id=p.getProperty('SHEET_ID'),ss;
  if(id){ss=SpreadsheetApp.openById(id);}else{ss=SpreadsheetApp.create(SHEET_TITLE);p.setProperty('SHEET_ID',ss.getId());
    const sh=ss.getSheets()[0];sh.setName(TAB);sh.appendRow(HEADERS);sh.setFrozenRows(1);}
  return ss.getSheetByName(TAB);
}
function safe_(v){v=String(v==null?'':v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();return /^[=+\-@\t\r]/.test(v)?"'"+v:v;} // stops formula injection
function hash_(s){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,s)).slice(0,30);}

/** Run once from the editor to create the sheet and authorise. */
function setup(){Logger.log(sheet_().getParent().getUrl());}

function doPost(e){
  try{
    const d=JSON.parse(e.postData.contents);
    if(d.website) return json_({ok:false,error:'Rejected.'});                       // honeypot
    const ward=parseInt(d.ward,10),cat=String(d.category||''),msg=String(d.message||'').trim(),anon=d.anonymous===true;
    if(!(ward>=1&&ward<=MAX_WARD)) return json_({ok:false,error:'Invalid ward.'});
    if(CATEGORIES.indexOf(cat)<0) return json_({ok:false,error:'Invalid category.'});
    if(msg.length<10||msg.length>MAX_MSG) return json_({ok:false,error:'Message must be 10–'+MAX_MSG+' characters.'});
    const contact=String(d.contact||'').trim().slice(0,100);
    if(contact&&!(/^\S+@\S+\.\S+$/.test(contact)||/^[+\d][\d\s-]{6,}$/.test(contact))) return json_({ok:false,error:'Invalid contact.'});
    const name=anon?'Anonymous':String(d.name||'').trim().slice(0,80);
    const lock=LockService.getScriptLock();lock.waitLock(20000);
    try{
      const c=CacheService.getScriptCache(),k='r'+Math.floor(Date.now()/60000),n=+(c.get(k)||0);
      if(n>=GLOBAL_LIMIT_PER_MIN) return json_({ok:false,error:'Server busy. Try again in a minute.'});
      const dk='d'+hash_(ward+cat+msg);
      if(c.get(dk)) return json_({ok:false,error:'Duplicate submission detected.'});
      c.put(k,String(n+1),120);c.put(dk,'1',21600);
      const id='NV-'+Utilities.formatDate(new Date(),'UTC','yyyyMMdd')+'-'+Utilities.getUuid().slice(0,6).toUpperCase();
      sheet_().appendRow([id,new Date(),safe_(name),ward,cat,safe_(msg),safe_(contact),anon?'Yes':'No','New','']);
      return json_({ok:true,id:id});
    }finally{lock.releaseLock();}
  }catch(err){return json_({ok:false,error:'Invalid request.'});}
}

function doGet(e){
  if(!Session.getActiveUser().getEmail()) return json_({ok:true,service:'Nagarik Voice'}); // public deployment never returns data
  if(!isAdmin_()) return HtmlService.createHtmlOutput('<h2>Access denied</h2><p>Your account is not authorised.</p>');
  return HtmlService.createHtmlOutputFromFile('Admin').setTitle('Nagarik Voice – Admin').addMetaTag('viewport','width=device-width,initial-scale=1');
}

/* ---- Admin-only functions called from Admin.html via google.script.run ---- */
function adminList(){
  if(!isAdmin_()) throw new Error('Not authorised');
  const v=sheet_().getDataRange().getValues();v.shift();
  return v.map((r,i)=>({row:i+2,id:r[0],ts:r[1]?new Date(r[1]).toISOString():'',name:r[2],ward:r[3],cat:r[4],msg:r[5],contact:r[6],anon:r[7],status:r[8]||'New',notes:r[9]})).reverse();
}
function adminUpdate(row,status,notes){
  if(!isAdmin_()) throw new Error('Not authorised');
  if(STATUSES.indexOf(status)<0) throw new Error('Bad status');
  notes=safe_(notes).slice(0,2000);
  if(status==='Rejected'&&!notes) throw new Error('Rejected requires an explanation in notes.');
  const sh=sheet_();if(row<2||row>sh.getLastRow()) throw new Error('Bad row');
  sh.getRange(row,9,1,2).setValues([[status,notes]]);return true;
}
