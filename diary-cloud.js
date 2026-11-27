/* Stable account paths are independent of app releases. Never clear data on deploy. */
(() => {
  const stats = window.ProgressDiaryStats = {pageViews:null, registeredAccounts:null, startedAt:null, status:'loading'};
  const publishStats = patch => {Object.assign(stats,patch);window.dispatchEvent(new CustomEvent('progressdiary:stats'));};
  let statsRef, accountCountPending=false;
  async function countRegisteredAccount() {
    if(!user||!statsRef||accountCountPending)return;
    const uid=user.uid;accountCountPending=true;
    try {
      await sdk.runTransaction(db,async tx=>{
        const marker=sdk.doc(db,'accountStats',uid), seen=await tx.get(marker);
        if(seen.exists())return;
        const total=await tx.get(statsRef);if(!total.exists())throw Error('Statistics are not initialized.');
        tx.set(marker,{createdAt:sdk.serverTimestamp()});
        tx.update(statsRef,{registeredAccounts:sdk.increment(1)});
      });
    } catch(err) {console.warn('Account statistics are unavailable.',err.code||err.message);}
    finally{accountCountPending=false;}
  }
  function connectPublicStatistics() {
    statsRef=sdk.doc(db,'publicStats','progressdiary');
    sdk.onSnapshot(statsRef,snapshot=>{
      const data=snapshot.data();
      if(!data||!Number.isSafeInteger(data.pageViews)||!Number.isSafeInteger(data.registeredAccounts)){publishStats({status:'unavailable'});return;}
      publishStats({pageViews:data.pageViews,registeredAccounts:data.registeredAccounts,startedAt:data.startedAt,status:'ready'});
    },()=>publishStats({status:'unavailable'}));
    sdk.updateDoc(statsRef,{pageViews:sdk.increment(1)}).catch(()=>publishStats({status:'unavailable'}));
    window.addEventListener('online',countRegisteredAccount);
  }
  const LOCAL = 'progressdiary-github-v1';
  const maskEmail = email => { const [name,domain] = String(email||"").split("@"); if(!domain)return ""; const chars=Array.from(name),count=chars.length; const first=count>=8?4:count>=4?1:0,last=count>=6?2:count>=3?1:0; return chars.slice(0,first).join("")+"*".repeat(count-first-last)+(last?chars.slice(-last).join(""):"")+"@"+domain; };
  let sdk, auth, db, user = null, writing = 0, error = null, stop = [];
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });
  const cloud = window.ProgressDiaryCloud = {ready, get signedIn() { return !!user; }, request};
  const bar = document.createElement('section');
  bar.className = 'cloud-account';
  bar.setAttribute('aria-label', 'Google account and sync');
  bar.innerHTML = '<div><strong id="cloud-name">ProgressDiary account</strong><p id="cloud-identity" hidden></p><p id="cloud-status" role="status">Connecting to Google sign-in…</p></div><div class="cloud-actions"><button id="cloud-login" disabled>Continue with Google</button><button id="cloud-migrate" hidden>Connect this browser diary</button><button id="cloud-logout" hidden>Sign out</button></div>';
  document.body.prepend(bar);
  const logout=bar.querySelector("#cloud-logout"),sidebarActions=document.createElement("div");sidebarActions.className="sidebar-account-actions";
  function placeAccount(){const sidebar=document.querySelector(".sidebar-bottom");sidebarActions.hidden=!user;if(sidebar){if(bar.parentElement!==sidebar||sidebar.firstElementChild!==bar)sidebar.prepend(bar);if(sidebarActions.parentElement!==sidebar)sidebar.append(sidebarActions);if(logout.parentElement!==sidebarActions)sidebarActions.append(logout);}else{const actions=bar.querySelector(".cloud-actions");if(logout.parentElement!==actions)actions.append(logout);if(bar.parentElement!==document.body)document.body.prepend(bar);}}
  new MutationObserver(placeAccount).observe(document.body,{childList:true,subtree:true});
  const $ = id => document.getElementById(id);
  let originalStatus=$('cloud-status').textContent;
  const localize=value=>window.ProgressDiaryLanguage?.text(value)||value;
  const say = message => { originalStatus=message;$('cloud-status').textContent=localize(message); };
  function translateAccount(){say(originalStatus);$('cloud-login').textContent=localize('Continue with Google');$('cloud-logout').textContent=localize('Sign out');$('cloud-migrate').textContent=localize('Connect this browser diary');bar.setAttribute('aria-label',localize('Google account and sync'));if(!user)$('cloud-name').textContent=localize('ProgressDiary account');}
  window.addEventListener('progressdiary-language',translateAccount);translateAccount();
  const clean = value => ({__pd_json_v1: JSON.stringify(value)});
  const decode = value => { if (!value || typeof value !== "object") return value; if (typeof value.__pd_json_v1 === "string") return decode(JSON.parse(value.__pd_json_v1)); if (Array.isArray(value)) return value.map(decode); return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,decode(item)])); };
  const refresh = (accountChange=false) => window.dispatchEvent(new CustomEvent('progressdiary:refresh',{detail:{accountChange}}));
  const base = () => ['diaries', user.uid];
  const ref = (...path) => sdk.doc(db, ...base(), ...path);
  const col = (...path) => sdk.collection(db, ...base(), ...path);
  function local() {
    try { return JSON.parse(localStorage.getItem(LOCAL) || 'null'); } catch { return null; }
  }
  function safeSize(value) {
    if (new TextEncoder().encode(JSON.stringify(value)).length > 850000) throw Error('This record is too large to sync. Your existing records are unchanged.');
  }
  function checkVersion(data) {
    if (data?.schemaVersion > 1) throw Error('A newer diary version is needed. Refresh the app; your saved data has not been changed.');
  }
  function unwrap(snapshot) {
    const data = snapshot.exists() ? snapshot.data() : null;
    checkVersion(data);
    return decode(data?.value) || null;
  }
  async function readState() {
    const [profile, days] = await Promise.all([sdk.getDoc(ref('meta', 'profile')), sdk.getDocs(col('days'))]);
    return {profile: unwrap(profile), entries: days.docs.map(unwrap).filter(Boolean), history: []};
  }
  async function request(url, method = 'GET', body, reduce) {
    if (error) throw error;
    if (!user) throw Error('Sign in again to access your account diary.');
    const parsed = new URL(url, location.origin), path = parsed.pathname.replace(/^\//, '');
    if (method === 'GET') {
      const state = await readState();
      const date = parsed.searchParams.get('date');
      if (path === 'history' && date || path === 'backup') {
        const dates = date ? [date] : state.entries.map(day => day.date);
        state.history = (await Promise.all(dates.map(async day => (await sdk.getDocs(col('days', day, 'versions'))).docs.map(d => ({...decode(d.data().value),versionId:d.id}))))).flat();
      }
      const result = await reduce(state);
      if (path === 'state') {
        try { localStorage.setItem('progressdiary-account-cache-' + user.uid, JSON.stringify(state)); } catch {}
        say('Saved records are synced online.');
      }
      return result;
    }
    if (!navigator.onLine) throw Error('You are offline. Your draft is still on screen. Reconnect before saving to your account.');
    writing++;
    say('Saving to your Google account…');
    try {
      const result = await sdk.runTransaction(db, async tx => {
        const date = path === 'profile' ? new Intl.DateTimeFormat("en-CA-u-nu-latn",{timeZone:body.profile.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()) : body?.date || body?.entry?.date;
        const target = path === 'profile' ? ref('meta', 'profile') : ref('days', date);
        const current = unwrap(await tx.get(target));
        const todayTarget=path === 'profile' ? ref('days',date) : null;
        const todayEntry=todayTarget ? unwrap(await tx.get(todayTarget)) : null;
        const state = {profile: path === 'profile' ? current : null, entries: path === 'profile' ? (todayEntry?[todayEntry]:[]) : current ? [current] : [], history: []};
        if (path === 'history' && method === 'POST') {
          const old = await tx.get(ref('days', date, 'versions', String(body.version)));
          if (old.exists()) state.history.push(decode(old.data().value));
          if (old.exists()) body={...body,version:decode(old.data().value).revision};
        }
        const historyStart = state.history.length;
        const value = await reduce(state, body);
        const next = path === 'profile' ? state.profile : state.entries.find(d => d.date === date);
        safeSize(next);
        tx.set(target, {schemaVersion: 1, value: clean(next), updatedAt: sdk.serverTimestamp()}, {merge: true});
        if(todayTarget){const updated=state.entries.find(day=>day.date===date);if(updated&&updated.revision!==todayEntry?.revision){safeSize(updated);tx.set(todayTarget,{schemaVersion:1,value:clean(updated),updatedAt:sdk.serverTimestamp()},{merge:true});}}
        for (const version of state.history.slice(historyStart)) {
          safeSize(version);
          tx.set(ref('days', version.date, 'versions', String(version.revision)), {schemaVersion: 1, value: clean(version)});
        }
        return value;
      });
      say('Saved to your Google account. Available on your other devices.');
      return result;
    } catch (err) {
      say('Save failed. Your draft is still on screen; existing online records are unchanged.');
      throw err;
    } finally { writing--; }
  }
  async function migrate() {
    const data = local();
    if (!data?.profile && !data?.entries?.length) return;
    if (!confirm('Connect this browser diary to ' + maskEmail(user.email) + '? Existing online dates will be kept. This browser copy will also be kept.')) return;
    $('cloud-migrate').disabled = true;
    writing++;
    try {
      say('Connecting existing saved records. Keep this page open…');
      // A stable source ID makes retries safe and keeps same-date local records in history.
      let source = localStorage.getItem('progressdiary-device-id');
      if (!source) { source = crypto.randomUUID(); localStorage.setItem('progressdiary-device-id', source); }
      if (data.profile) await sdk.runTransaction(db, async tx => {
        const target = ref('meta','profile'), current = await tx.get(target);
        if (!current.exists()) tx.set(target, {schemaVersion:1, value:clean(data.profile), updatedAt:sdk.serverTimestamp()});
        tx.set(ref('migrations', source), {schemaVersion:1, value:clean(data.profile)});
      });
      for (const day of data.entries || []) {
        safeSize(day);
        await sdk.runTransaction(db, async tx => {
          const target=ref('days',day.date), current=await tx.get(target);
          if (!current.exists()) {
            tx.set(target,{schemaVersion:1,value:clean(day),updatedAt:sdk.serverTimestamp()});
            tx.set(ref('days',day.date,'versions',String(day.revision||0)), {schemaVersion:1,value:{date:day.date,entry:clean(day),revision:day.revision||0,savedAt:new Date().toISOString(),action:'connected'}});
          }
          tx.set(ref('days',day.date,'versions','local-'+source+'-'+(day.revision||0)), {schemaVersion:1,value:{date:day.date,entry:clean(day),revision:day.revision||0,savedAt:new Date().toISOString(),action:'browser copy'}});
        });
      }
      for (let i=0;i<(data.history||[]).length;i++) {
        const version=data.history[i];
        if (!version?.date || !version.entry) continue;
        await sdk.setDoc(ref('days',version.date,'versions','history-'+source+'-'+i),{schemaVersion:1,value:clean(version)});
      }
      localStorage.setItem('progressdiary-connected-'+user.uid, 'yes');
      $('cloud-migrate').hidden = true;
      say('Browser records connected. Existing online records and your original browser copy were kept.');
      refresh();
    } catch(err) { say('Connection stopped: '+err.message+'. Original browser records are still available. You can retry safely.'); }
    finally { writing--; $('cloud-migrate').disabled=false; }
  }
  async function start() {
    try {
      const root='https://www.gstatic.com/firebasejs/12.0.0/';
      const [app,authentication,firestore]=await Promise.all([import(root+'firebase-app.js'),import(root+'firebase-auth.js'),import(root+'firebase-firestore.js')]);
      sdk={...authentication,...firestore};
      const firebase=app.initializeApp({apiKey:'AIzaSyCHsUvpgd86IXUZYnEgRDL0CUGbOqH04ig',authDomain:'progressdairy-72561.firebaseapp.com',projectId:'progressdairy-72561',appId:'1:746537801100:web:cd0470559b3a97138232a9'});
      auth=sdk.getAuth(firebase); db=sdk.getFirestore(firebase);
      connectPublicStatistics();
      let initial=true;
      sdk.onAuthStateChanged(auth, async account => {
        user=account; error=null; stop.forEach(fn=>fn());stop=[];
        $("cloud-name").textContent=user?(user.displayName||localize("Your account")):localize("ProgressDiary account");
        $('cloud-identity').hidden=!user;
        $('cloud-identity').textContent=user?maskEmail(user.email):'';
        placeAccount();
        $('cloud-login').hidden=!!user; $('cloud-login').disabled=false; $('cloud-logout').hidden=!user;
        $('cloud-migrate').hidden=!user||!local()?.profile||localStorage.getItem('progressdiary-connected-'+user?.uid)==='yes';
        say(user?'Loading your account diary…':'Browser-only diary · Continue with Google to sync phone and computer.');
        if(user) {
          countRegisteredAccount();
          for(const target of [ref('meta','profile'),col('days')]) {
            let first=true;
            stop.push(sdk.onSnapshot(target,snapshot=>{
              if(first){first=false;return;}
              if(!writing&&!snapshot.metadata.hasPendingWrites){say('Account diary updated. Loading the latest saved records…');refresh();}
            },err=>{say('Sync unavailable: '+err.message+'. Your existing records have not been deleted.');}));
          }
        }
        if(initial){initial=false;resolveReady();} else refresh(true);
      },err=>{error=err;resolveReady();say('Google sign-in is unavailable. Reload to retry.');});
      $('cloud-login').onclick=async()=>{
        if(window.ProgressDiaryDirty&&!confirm('Save your draft before changing accounts. Continue and discard only the unsaved draft?'))return;
        $('cloud-login').disabled=true;
        try {
          const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});
          await sdk.signInWithPopup(auth,provider);
        } catch(err) {say('Sign-in failed: '+err.message+'. Your browser diary is unchanged. Allow pop-ups and try again.');}
        finally{$('cloud-login').disabled=false;}
      };
      $('cloud-logout').onclick=async()=>{if(confirm('Sign out? Save your current draft first. Online records will stay in your account.')){if(writing){say('Wait for the current save to finish before signing out.');return;}await sdk.signOut(auth);}};
      $('cloud-migrate').onclick=()=>migrate();
    } catch(err) {error=err;resolveReady();say('Cloud connection could not load. Browser-only records are still available; refresh to retry.');}
  }
  start();
})();

