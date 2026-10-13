const SESSION_KEY='fitos-cloud-session';
const LEGACY_SESSION_KEY=SESSION_KEY;
const LAST_SYNC_KEY='fitos-cloud-last-sync';

export function getSyncConfig(){try{return JSON.parse(localStorage.getItem('fitos-cloud-config')||'{}')}catch{return {}}}
export function getSyncSession(){
  try{
    const saved=localStorage.getItem(SESSION_KEY);
    if(saved)return JSON.parse(saved);
    // Migrate an older tab-only session once, so an upgrade does not sign out an active user.
    const legacy=sessionStorage.getItem(LEGACY_SESSION_KEY);
    if(legacy){localStorage.setItem(SESSION_KEY,legacy);sessionStorage.removeItem(LEGACY_SESSION_KEY);return JSON.parse(legacy);}
  }catch{}
  return null;
}
function saveSession(session){localStorage.setItem(SESSION_KEY,JSON.stringify(session));}
export function saveSyncConfig(url,anonKey){const normalized=url.trim().replace(/\/$/,'');if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalized))throw new Error('请输入有效的 Supabase 项目 HTTPS URL');if(!anonKey.trim())throw new Error('请填写 Supabase anon/publishable key');localStorage.setItem('fitos-cloud-config',JSON.stringify({url:normalized,anonKey:anonKey.trim()}));}
function config(){const c=getSyncConfig();if(!c.url||!c.anonKey)throw new Error('先保存 Supabase 项目地址和公开 anon key');return c;}
async function request(path,{method='GET',body,token,prefer}={}){
  const c=config();let res;
  try{res=await fetch(c.url+path,{method,headers:{apikey:c.anonKey,Authorization:`Bearer ${token||c.anonKey}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
  catch{throw new Error('无法连接 Supabase，请检查网络和项目地址');}
  const raw=await res.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw;}
  if(!res.ok){const error=new Error(data?.msg||data?.message||data?.hint||`Supabase 返回 HTTP ${res.status}`);error.status=res.status;throw error;}
  return data;
}
function authSession(data){return {access_token:data.access_token,refresh_token:data.refresh_token,user:data.user,expires_at:Date.now()+Math.max(60,Number(data.expires_in)||3600)*1000};}
export async function signUp(email,password){if(password.length<8)throw new Error('密码至少需要 8 位');return request('/auth/v1/signup',{method:'POST',body:{email,password}});}
export async function signIn(email,password){const data=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});if(!data.access_token)throw new Error('登录未返回会话，请检查邮箱验证设置后重试');saveSession(authSession(data));return data.user;}
export function signOut(){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(LEGACY_SESSION_KEY);}
export async function ensureSyncSession(){
  const session=getSyncSession();if(!session?.refresh_token)return null;
  if(session.expires_at&&session.expires_at>Date.now()+60_000)return session;
  try{
    const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});
    if(!data.access_token)throw new Error('Supabase 未返回新的登录会话');
    const renewed=authSession(data);saveSession(renewed);return renewed;
  }catch(error){if(error.status===400||error.status===401){signOut();throw new Error(`登录状态已失效，请重新登录（${error.message}）`);}throw error;}
}
export function getLastSyncTime(){const value=localStorage.getItem(LAST_SYNC_KEY);return value||null;}
export function setLastSyncTime(value=new Date().toISOString()){localStorage.setItem(LAST_SYNC_KEY,value);}
async function currentSession(){const session=await ensureSyncSession();if(!session?.access_token)throw new Error('请先登录云同步账户');if(!session.user?.id)throw new Error('登录会话缺少用户信息，请重新登录');return session;}
export async function uploadSnapshot(tables){const s=await currentSession();return request('/rest/v1/fitos_sync?on_conflict=user_id',{method:'POST',token:s.access_token,prefer:'resolution=merge-duplicates,return=minimal',body:{user_id:s.user.id,payload:tables,updated_at:new Date().toISOString()}});}
export async function downloadSnapshot(){const s=await currentSession(),id=encodeURIComponent(s.user.id);const rows=await request(`/rest/v1/fitos_sync?select=payload,updated_at&user_id=eq.${id}&limit=1`,{token:s.access_token});return rows?.[0]||null;}
