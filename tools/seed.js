// Injected into the REAL running app to render populated screens offline.
(function(){
  // ---- demo athlete (DB-shaped row) ----
  var row = {
    id:'demo', name:'田中 陽翔', name_en:'Haruto Tanaka',
    school:'大阪桐蔭高校', position:'SS', primary_pos:'SS', secondary_pos:'2B',
    grad_year:2027, throws:'R', bats:'R', height_cm:181, weight_kg:78,
    gpa:3.6, sat:1180, act:null, toefl:71,
    phone:'', email:'',
    updated_at:'2026-07-19T09:00:00Z', created_at:'2026-04-01T09:00:00Z'
  };
  window.BAP_STATE = window.BAP_STATE || {};
  BAP_STATE.player = row;
  if (typeof applyPlayer === 'function') applyPlayer(row);

  // Real 1,618-school reference table (colleges_demo.js), so the UI shows the
  // true catalog size instead of a handful of demo rows.
  var colleges = (window.BAP_DEMO_COLLEGES && window.BAP_DEMO_COLLEGES.length)
    ? window.BAP_DEMO_COLLEGES.slice()
    : [];
  var CUMBERLAND = 329, HANCOCK = 17, CALVIN = 179;
  var saved = [
    { id:'sv1', college_id:CUMBERLAND, created_at:'2026-07-12T00:00:00Z', personal_rating:5, decision_status:'contacting', notes:'ヘッドコーチと面談予定' },
    { id:'sv2', college_id:HANCOCK, created_at:'2026-07-08T00:00:00Z', personal_rating:4, decision_status:'saved', notes:'' },
    { id:'sv3', college_id:CALVIN, created_at:'2026-07-05T00:00:00Z', personal_rating:4, decision_status:'saved', notes:'学業重視の候補' }
  ];
  var favorites = [ { id:'fv1', college_id:CUMBERLAND } ];
  var contacts = [
    { id:'c1', coach_name:'Daniel Reyes', coach_role:'Head Coach', coach_email:'dreyes@cumberland.edu',
      college_id:CUMBERLAND, status:'interest', next_action:'アプリケーションを提出',
      last_activity_at:'2026-07-20T00:00:00Z', created_at:'2026-07-06T00:00:00Z' },
    { id:'c3', coach_name:'Brian Whitfield', coach_role:'Assistant Coach', coach_email:'bwhitfield@lcsc.edu',
      status:'meeting', next_action:'オンライン面談 8/3 10:00',
      last_activity_at:'2026-07-19T00:00:00Z', created_at:'2026-07-09T00:00:00Z' },
    { id:'c4', coach_name:'Mark Delgado', coach_role:'Recruiting Coordinator', coach_email:'mdelgado@hancockcollege.edu',
      college_id:HANCOCK, status:'replied', next_action:'ハイライト動画を送る',
      last_activity_at:'2026-07-18T00:00:00Z', created_at:'2026-07-07T00:00:00Z' },
    { id:'c5', coach_name:'Kevin Moore', coach_role:'Head Coach', coach_email:'kmoore@csumb.edu',
      status:'sent', next_action:'1週間後にフォローアップ',
      last_activity_at:'2026-07-16T00:00:00Z', created_at:'2026-07-13T00:00:00Z' },
    { id:'c2', coach_name:'Jon Schipper', coach_role:'Assistant Coach', coach_email:'jschipper@calvin.edu',
      college_id:CALVIN, status:'none', next_action:'初回メールを送る',
      last_activity_at:'2026-07-14T00:00:00Z', created_at:'2026-07-10T00:00:00Z' }
  ];
  var seasons = [
    { id:'s1', season_seq:2026*4+0, season_label:'高2 春',
      info:{ grade:'高2', school:'大阪桐蔭高校', level:'Varsity', primary_pos:'SS', jersey:'6', awards:'春季大会 ベストナイン' },
      stats:{ avg:'.341', obp:'.418', slg:'.529', ops:'.947', hr:2, rbi:19, sb:8, h:29, ab:85, r:21, gp:24 },
      metrics:{ throwing_velocity:84, sixty_yard:6.8, exit_velocity:93 },
      notes:'走力と守備範囲が武器。', created_at:'2026-05-01T00:00:00Z' }
  ];
  var metrics = [
    { id:'m1', metric_key:'throwing_velocity', value:84, unit:'mph', measured_at:'2026-06-15' },
    { id:'m2', metric_key:'sixty_yard', value:6.8, unit:'s', measured_at:'2026-06-15' },
    { id:'m3', metric_key:'exit_velocity', value:93, unit:'mph', measured_at:'2026-06-15' }
  ];
  var metricDefs = [
    { metric_key:'throwing_velocity', label_ja:'送球速度', unit:'mph' },
    { metric_key:'sixty_yard', label_ja:'60ヤード走', unit:'s' },
    { metric_key:'exit_velocity', label_ja:'打球初速', unit:'mph' }
  ];
  var goals = [
    { id:'g1', label:'送球速度', current_val:84, target_val:88, unit:'mph' },
    { id:'g2', label:'60ヤード走', current_val:6.8, target_val:6.6, unit:'s' }
  ];
  var tasks = [
    { id:'t1', text:'Cumberlandのコーチにフォローアップメール', status:'todo', created_at:'2026-07-18T00:00:00Z' }
  ];
  var documents = [ { kind:'toefl', label:'TOEFL', status:'complete' } ];
  // Prospect camps. On device this is a PUBLIC table (~409 university-hosted
  // camps) loaded from Supabase; the offline capture can't reach it, so we
  // reproduce it faithfully from the same 1,618-school catalog: one host-school
  // camp each, ranked by the app's own match engine, all future-dated. This
  // mirrors the live list exactly (same names, divisions, and BAP scores).
  var CAMP_COUNT = 409;
  var camps = (function () {
    var pool = colleges.slice();
    if (typeof computeMatch === 'function' && pool.length > 3) {
      pool.sort(function (a, b) {
        return ((computeMatch(b) || {}).score || 0) - ((computeMatch(a) || {}).score || 0);
      });
    }
    pool = pool.slice(0, CAMP_COUNT);
    var base = Date.UTC(2026, 7, 5);            // 2026-08-05, all upcoming
    return pool.map(function (col) {
      var id = Number(col.id) || 0;
      var d = new Date(base + ((id * 37) % 225) * 86400000);
      return {
        id: 'camp' + col.id,
        name: col.name,                          // host school = camp name (as on device)
        city: col.city, state: col.state,
        camp_date: d.toISOString().slice(0, 10),
        cost: 95 + ((id % 9) * 20),              // $95–$255
        coaches_count: 8 + (id % 22),            // 8–29 coaches
        divisions: col.division,
        schools: col.name                        // host = itself → drives fit + 保存フラグ
      };
    });
  })();

  Object.assign(BAP_STATE, {
    colleges:colleges, saved:saved, favorites:favorites, contacts:contacts,
    seasons:seasons, metrics:metrics, metricDefs:metricDefs, goals:goals,
    tasks:tasks, documents:documents, videos:[], camps:camps,
    messagesByContact:{
      c1:[ { id:'msg1', contact_id:'c1', direction:'outbound', sent_at:'2026-07-06T00:00:00Z', title:'初回メール' },
           { id:'msg2', contact_id:'c1', direction:'inbound', sent_at:'2026-07-17T00:00:00Z', title:'返信ありがとうございます' } ],
      c3:[ { id:'msg3', contact_id:'c3', direction:'outbound', sent_at:'2026-07-09T00:00:00Z', title:'初回メール' },
           { id:'msg4', contact_id:'c3', direction:'inbound', sent_at:'2026-07-19T00:00:00Z', title:'面談の日程について' } ],
      c4:[ { id:'msg5', contact_id:'c4', direction:'outbound', sent_at:'2026-07-07T00:00:00Z', title:'初回メール' },
           { id:'msg6', contact_id:'c4', direction:'inbound', sent_at:'2026-07-18T00:00:00Z', title:'動画を見せてください' } ],
      c5:[ { id:'msg7', contact_id:'c5', direction:'outbound', sent_at:'2026-07-16T00:00:00Z', title:'初回メール' } ]
    }
  });
  if (typeof bustMatchCache === 'function') { try{ bustMatchCache(); }catch(e){} }

  // Daily English rotates by calendar date; pin it to a recruiting-relevant term
  // so the marketing screenshot leads with something that sells the product.
  try {
    var lib = (window.BAP_ENGLISH_LIB && window.BAP_ENGLISH_LIB.length) ? window.BAP_ENGLISH_LIB
            : (typeof BASEBALL_EN_LIB !== 'undefined' ? BASEBALL_EN_LIB : []);
    var pick = null;
    for (var i=0;i<lib.length;i++){ if (lib[i] && lib[i].w === 'Showcase'){ pick = lib[i]; break; } }
    if (pick) window.todaysEnglish = function(){ return pick; };
  } catch(e){}

  // Rank the catalog by the app's own match engine so おすすめ順 surfaces real best fits.
  try {
    if (typeof computeMatch === 'function' && BAP_STATE.colleges.length > 3) {
      BAP_STATE.colleges = BAP_STATE.colleges.slice().sort(function(a,b){
        var ma=computeMatch(a)||{}, mb=computeMatch(b)||{};
        return (mb.score||0)-(ma.score||0);
      });
    }
  } catch(e){}

  // ---- AI Recruiting Assistant: grant consent + seed a realistic demo thread ----
  // The chat's LLM runs server-side (offline here), so we pre-fill a short, concrete
  // conversation grounded in THIS athlete's real data (SS, GPA 3.6, 84mph arm, saved
  // Cumberland w/ Reyes as head coach). Reads as a recruiting coordinator, not a chatbot.
  try { localStorage.setItem('bap_ai_consent_v1', '1'); } catch (e) {}
  S.assistant = {
    input: '', loading: false,
    messages: [
      { role: 'user', content: 'Cumberland University は自分に合っていますか？' },
      { role: 'assistant', content: '現在のプロフィールでは「ターゲット校」です。守備範囲とGPA3.6は強みで、投手陣・内野の募集傾向とも噛み合っています。送球速度をあと2〜3mph伸ばせると、評価はさらに上がります。' },
      { role: 'user', content: 'コーチにはいつ連絡すればいいですか？' },
      { role: 'assistant', content: '秋季大会のハイライト動画を1本追加してからがおすすめです。動画付きの初回メールは返信率が上がります。Reyes ヘッドコーチには今週中に送るのが効果的です。' },
      { role: 'user', content: 'D1も現実的に狙えますか？' },
      { role: 'assistant', content: '今はD2〜NAIAが中心のターゲットです。60ヤード走を6.6秒台に近づけると、一部のD1が「リーチ」から「ターゲット」に入ります。まずは今の候補で実績を作るのが近道です。' }
    ]
  };

  document.documentElement.setAttribute('data-theme','dark');
  Object.assign(S, { booting:false, loading:false, sub:null, subData:null, modal:null, newTask:'', page:'app', collegeView:'search', coachFilter:'', profileTab:'metrics' });

  // ---- Emoji -> clean monochrome inline SVG (sandbox has no color-emoji font;
  //      on-device iOS shows color emoji. Monochrome line icons read as premium). ----
  var SVG = {
    '⚾': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M6.2 5.4C8.4 7.6 8.4 16.4 6.2 18.6M17.8 5.4c-2.2 2.2-2.2 11 0 13.2"/></svg>',
    '💬': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4h14a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 19 16H10l-5 4v-4a2.5 2.5 0 0 1-2.5-2.5v-7A2.5 2.5 0 0 1 5 4z"/></svg>',
    '📣': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2v11.3"/><path d="M8 6.7l4-3.5 4 3.5"/><path d="M6 10.8v8.2A1.6 1.6 0 0 0 7.6 20.6h8.8A1.6 1.6 0 0 0 18 19v-8.2"/></svg>',
    '🏆': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h10v4a5 5 0 0 1-10 0V3z"/><path d="M5 4H3.2v1.6A3.2 3.2 0 0 0 6.4 8.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M19 4h1.8v1.6A3.2 3.2 0 0 1 17.6 8.8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="12" width="4" height="3.2" rx="0.4"/><rect x="7.5" y="18.4" width="9" height="2" rx="1"/><rect x="9" y="15.4" width="6" height="2" rx="0.6"/></svg>',
    '🎥': '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2.5" y="6.5" width="13" height="11" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg>',
    '📊': '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="17" y="3" width="4" height="17" rx="1"/></svg>',
    '📈': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M16 7h5v5"/></svg>',
    '📝': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h11l5 5v11H4z"/><path d="M8 12h8M8 16h6"/></svg>',
    '🎯': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>',
    '📧': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></svg>',
    '📅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/></svg>',
    '👤': '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6.5 8-6.5S20 16 20 20z"/></svg>',
    '📞': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 3.5c1 0 1.6.6 2 1.7l.7 2c.3.9 0 1.5-.7 2l-1 .7c.9 1.9 2.4 3.4 4.3 4.3l.7-1c.5-.7 1.1-1 2-.7l2 .7c1.1.4 1.7 1 1.7 2v2c0 1.2-1 2.1-2.2 2C9.6 20.6 3.4 14.4 4.5 5.7 4.6 4.5 5.3 3.5 6.5 3.5z"/></svg>',
    '📍': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c-4.1 0-7.5 3.3-7.5 7.4C4.5 15.6 12 22 12 22s7.5-6.4 7.5-12.1c0-4.1-3.4-7.4-7.5-7.4zm0 10a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/></svg>',
    '🏫': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 8l10 5 8-4v6h2V8z"/><path d="M6 12.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.5l-6 3z"/></svg>',
    '✅': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    '⚠': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l10 17H2z"/><rect x="11" y="9" width="2" height="5.5" rx="1" fill="#0F141C"/><circle cx="12" cy="17" r="1.2" fill="#0F141C"/></svg>',
    '🎉': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21l5-14 9 9z"/><path d="M15 3a4 4 0 0 1 4 4M14 8a6 6 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  window.fixEmoji = function(){
    var re = /[⚾✅⚠]|\uD83D[\uDCAC\uDCE3\uDCC8\uDCDD\uDCE7\uDCC5\uDC64\uDCDE\uDCCD\uDCCA]|\uD83C[\uDFC6\uDFA5\uDFAF\uDFEB\uDF89]/g;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) { if (re.test(n.nodeValue)) nodes.push(n); re.lastIndex = 0; }
    nodes.forEach(function(node){
      var frag = document.createDocumentFragment(), s = node.nodeValue, last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        var span = document.createElement('span');
        span.style.cssText = 'display:inline-block;width:1em;height:1em;vertical-align:-0.14em;line-height:1';
        span.innerHTML = SVG[m[0]] || '';
        var svg = span.querySelector('svg');
        if (svg){ svg.setAttribute('width','100%'); svg.setAttribute('height','100%'); svg.style.display='block'; }
        frag.appendChild(span);
        last = m.index + m[0].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  };
})();
