const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks, extra = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => {
    if (name in mocks) return { __esModule: true, ...mocks[name] };
    if (name.endsWith('.png')) return 'logo';
    throw Error(`Unexpected module: ${name}`);
  }, URL, URLSearchParams, process: { env: {} }, ...extra });
  return exports;
}

function helpers() {
  const disk = new Map();
  const storage = { getItem: async k => disk.get(k) ?? null, setItem: async (k,v) => disk.set(k,v), removeItem: async k => disk.delete(k), multiRemove: async keys => keys.forEach(k => disk.delete(k)) };
  const platform = { OS: 'web' };
  const env = { EXPO_BASE_URL: '/butcee', NODE_ENV: 'production', EXPO_PUBLIC_SUPABASE_URL: 'https://project.supabase.co' };
  const result = load('src/lib/authHelpers.ts', {
    '@react-native-async-storage/async-storage': { default: storage },
    'expo-linking': { createURL: path => platform.OS === 'web' ? `https://example.com${path}` : `butcee://${path.replace(/^\//,'')}` },
    'react-native': { Platform: platform },
  }, { process: { env } });
  return { ...result, disk, storage, platform, env };
}

test('remember only normalized email; unchecking removes it; legacy tokens are removed, budget data remains', async () => {
  const h=helpers();
  await h.rememberEmail(' User@Example.com ',true);
  assert.equal(await h.readRememberedEmail(),'user@example.com');
  assert.equal(h.disk.size,1);
  await h.rememberEmail('',false);
  assert.equal(await h.readRememberedEmail(),'');
  h.disk.set('sb-project-auth-token','old-token'); h.disk.set('@budget','data');
  await h.removeLegacySession();
  assert.equal(h.disk.has('sb-project-auth-token'),false);
  assert.equal(h.disk.get('@budget'),'data');
});

test('callback URLs respect production subpaths, development root and native scheme', () => {
  const h=helpers();
  assert.equal(h.authRedirectUrl('reset-password'),'https://example.com/butcee/reset-password');
  h.env.NODE_ENV='development'; assert.equal(h.authRedirectUrl('auth'),'https://example.com/auth');
  h.platform.OS='ios'; assert.equal(h.authRedirectUrl('reset-password'),'butcee://reset-password');
});

test('valid recovery links and confirmation links are distinct; expired or incomplete links cannot recover', () => {
  const h=helpers();
  for(const url of ['https://example.com/reset-password#type=recovery&access_token=a&refresh_token=b','butcee://reset-password#type=recovery&access_token=a&refresh_token=b']) assert.equal(h.parseAuthCallback(url).kind,'recovery');
  assert.equal(h.parseAuthCallback('https://example.com/auth#type=signup&access_token=a&refresh_token=b').kind,'confirmed');
  for(const url of ['https://example.com/reset-password','https://example.com/reset-password#error=access_denied&error_code=otp_expired','https://example.com/reset-password#type=recovery&access_token=a']) assert.equal(h.parseAuthCallback(url).kind,'invalid');
  assert.equal(h.parseAuthCallback('https://example.com/cards'),null);
});

// A small hook harness isolates screen/provider business logic from native rendering.
// Browser smoke tests cover the actual rendered controls separately.
function harness() {
  const values=[], dependencies=[], effects=[]; let cursor=0;
  const react={
    useState(initial) { const i=cursor++; if(!(i in values))values[i]=initial; return [values[i],v=>{values[i]=typeof v==='function'?v(values[i]):v;}]; },
    useRef(initial) { const i=cursor++; if(!(i in values))values[i]={current:initial}; return values[i]; },
    useEffect(fn,deps) { const i=cursor++; if(!dependencies[i]||deps.some((v,j)=>v!==dependencies[i][j])) { dependencies[i]=deps; effects.push(fn); } },
    createContext: () => ({Provider:'Provider'}),
    useContext: () => null,
  };
  const jsx=(type,props)=>({type,props});
  return { mocks:{react,'react/jsx-runtime':{jsx,jsxs:jsx}}, render(Component,props={}){cursor=0;return Component(props);}, async effects(){ while(effects.length)effects.shift()(); await new Promise(r=>setImmediate(r)); } };
}
function find(tree, predicate) {
  if (!tree || typeof tree!=='object')return null;
  if(predicate(tree))return tree;
  for(const child of [tree.props?.children].flat(Infinity)){const found=find(child,predicate);if(found)return found;}
  return null;
}
function screen(authOverride={}) {
  const h=harness(), utils=helpers(), calls=[];
  const auth={user:null,recovering:false,notice:'',signIn:async(...v)=>calls.push(['login',...v]),signOut:async()=>{},finishRecovery:async v=>calls.push(['update',v]),...authOverride};
  const service={signUp:async input=>{calls.push(['signup',input]);return {data:{session:null},error:null};},resetPasswordForEmail:async(...v)=>{calls.push(['reset',...v]);return {error:null};},signOut:async()=>({error:null})};
  const C=load('src/app/auth.tsx',{
    ...h.mocks,'expo-router':{Redirect:'Redirect'},'react-native':{StyleSheet:{create:s=>s},Image:'Image',Pressable:'Pressable',ScrollView:'ScrollView',Text:'Text',TextInput:'TextInput',View:'View'},
    '../lib/supabase':{supabase:{auth:service}},'./context/AuthContext':{useAuth:()=>auth},'../lib/authHelpers':utils,
  }).default;
  const render=()=>h.render(C);
  return {h,utils,calls,service,auth,render,
    fill(label,value){find(render(),e=>e.props.accessibilityLabel===label).props.onChangeText(value);},
    button(text){return find(render(),e=>e.type==='Pressable'&&find(e,x=>x.type==='Text'&&x.props.children===text));},
    alert(){return find(render(),e=>e.props.accessibilityRole==='alert')?.props.children;},
  };
}

test('registration validates confirmation, sends email redirect, never logs in or sends security answers', async () => {
  const s=screen();s.render();await s.h.effects();
  s.button('Kayıt ol').props.onPress();s.fill('E-posta adresi',' USER@example.com ');s.fill('Yeni şifre','test-password');s.fill('Şifreyi tekrar gir','different');
  await s.button('Kayıt ol').props.onPress();assert.equal(s.calls.length,0);assert.equal(s.alert(),'Şifreler eşleşmiyor.');
  s.fill('Şifreyi tekrar gir','test-password');await s.button('Kayıt ol').props.onPress();
  assert.equal(s.calls.length,1);assert.equal(s.calls[0][0],'signup');assert.equal(s.calls[0][1].email,'user@example.com');
  assert.equal(s.calls[0][1].options.emailRedirectTo,'https://example.com/butcee/auth');assert.equal(s.calls[0][1].options.data,undefined);
  assert.match(s.alert(),/doğrulama bağlantısını/);
});

test('forgot password sends correct reset redirect and displays generic success or localized error', async () => {
  const s=screen();s.render();await s.h.effects();s.button('Şifremi unuttum').props.onPress();
  s.fill('E-posta adresi','user@example.com');await s.button('Sıfırlama bağlantısı gönder').props.onPress();
  assert.equal(s.calls[0][0],'reset');assert.equal(s.calls[0][2].redirectTo,'https://example.com/butcee/reset-password');assert.match(s.alert(),/bir hesap varsa/);
  s.service.resetPasswordForEmail=async()=>({error:{code:'over_email_send_rate_limit'}});
  await s.button('Sıfırlama bağlantısı gönder').props.onPress();assert.match(s.alert(),/Çok fazla/);
});

test('remembered email leaves password blank; login still requires password and blocks duplicate submissions', async () => {
  let finish;const s=screen({signIn:()=>new Promise(r=>finish=r)});await s.utils.rememberEmail('user@example.com',true);s.render();await s.h.effects();
  assert.equal(find(s.render(),e=>e.props.accessibilityLabel==='E-posta adresi').props.value,'user@example.com');
  assert.equal(find(s.render(),e=>e.props.accessibilityLabel==='Şifre').props.value,'');
  await s.button('Giriş yap').props.onPress();assert.equal(s.alert(),'Şifreni gir.');
  s.fill('Şifre','test-password');const first=s.button('Giriş yap').props.onPress();await new Promise(r=>setImmediate(r));
  assert.equal(s.button('İşlem yapılıyor...').props.disabled,true);await s.button('İşlem yapılıyor...').props.onPress();finish();await first;
  assert.deepEqual([...s.utils.disk.values()],['user@example.com']);
});

test('recovery checks repeated password before calling update', async () => {
  const s=screen({recovering:true});s.render();await s.h.effects();
  s.fill('Yeni şifre','test-password');s.fill('Şifreyi tekrar gir','wrong');await s.button('Şifreyi güncelle').props.onPress();assert.equal(s.calls.length,0);
  s.fill('Şifreyi tekrar gir','test-password');await s.button('Şifreyi güncelle').props.onPress();assert.equal(s.calls[0][0],'update');
});

test('session persistence and automatic URL login are disabled', () => {
  let options;load('src/lib/supabase.ts',{'react-native-url-polyfill/auto':{},'@supabase/supabase-js':{createClient:(url,key,opts)=>{options=opts;return {};}}},{process:{env:{EXPO_PUBLIC_SUPABASE_URL:'https://example.com',EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public-key'}}});
  assert.equal(options.auth.persistSession,false);assert.equal(options.auth.detectSessionInUrl,false);
});

test('switching accounts during a pending local write never writes the previous data into the new account', async () => {
  let finish;const writes=[];
  const storage=load('src/lib/userStorage.ts',{'@react-native-async-storage/async-storage':{default:{setItem:()=>new Promise(r=>finish=r)}},'./supabase':{supabase:{from:()=>({upsert:async row=>{writes.push(row);return {error:null};}})}}});
  storage.setActiveStorageUser('first');const pending=storage.default.setItem('cards','private-data');storage.setActiveStorageUser('second');finish();await pending;assert.equal(writes.length,0);
});


test('auth provider requires explicit login, keeps recovery separate and signs out after password update', async () => {
  const h=harness(),utils=helpers();let eventHandler,urlHandler,activeUser=null;const calls=[];
  const recoverySession={user:{id:'recovery-user'}};
  const service={
    onAuthStateChange:fn=>{eventHandler=fn;return {data:{subscription:{unsubscribe(){}}}};},
    setSession:async input=>{calls.push(['setSession',input]);eventHandler('SIGNED_IN',recoverySession);return {data:{session:recoverySession},error:null};},
    signInWithPassword:async()=>({data:{session:{user:{id:'normal-user'}}},error:null}),
    updateUser:async input=>{calls.push(['update',input]);return {error:null};},
    signOut:async()=>{calls.push(['signOut']);eventHandler('SIGNED_OUT',null);return {error:null};},
  };
  const C=load('src/app/context/AuthContext.tsx',{
    ...h.mocks,'expo-linking':{addEventListener:(_,fn)=>{urlHandler=fn;return {remove(){}};},getInitialURL:async()=>null},
    '../../lib/userStorage':{setActiveStorageUser:id=>{activeUser=id;}},'../../lib/supabase':{supabase:{auth:service}},'../../lib/authHelpers':utils,
  }).AuthProvider;
  const state=()=>h.render(C).props.value;
  state();await h.effects();assert.equal(state().loading,false);assert.equal(state().user,null);
  eventHandler('INITIAL_SESSION',{user:{id:'saved'}});eventHandler('SIGNED_IN',{user:{id:'saved'}});assert.equal(state().user,null);
  await assert.rejects(()=>state().finishRecovery('password'));
  await state().signIn('user@example.com','password');assert.equal(state().user.id,'normal-user');assert.equal(activeUser,'normal-user');
  urlHandler({url:'https://example.com/reset-password#type=recovery&access_token=a&refresh_token=b'});await new Promise(r=>setImmediate(r));
  assert.equal(state().recovering,true);assert.equal(state().user,null);assert.equal(activeUser,null);
  await state().finishRecovery('new-password');assert.equal(state().recovering,false);assert.equal(state().user,null);assert.match(state().notice,/Şifren güncellendi/);assert.equal(calls.at(-1)[0],'signOut');
  service.setSession=async()=>({data:{session:null},error:Error('expired')});
  urlHandler({url:'https://example.com/reset-password#type=recovery&access_token=expired&refresh_token=invalid'});await new Promise(r=>setImmediate(r));
  assert.equal(state().recovering,false);assert.equal(state().user,null);assert.match(state().notice,/doğrulanamadı/);
});
