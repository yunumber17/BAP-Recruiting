/* ==========================================================================
 * BAP Recruiting — Daily Focus Library (今日のフォーカス)
 * --------------------------------------------------------------------------
 * The locker-room mindset layer. Curated, deterministic, rotated by calendar
 * date — identical for every user, NO AI generation, NO per-user content.
 * This file is the authoritative library; bap.html falls back to a small inline
 * set if this file is absent, so the app never breaks.
 *
 * Each entry: { t: <theme key>, jp: <Japanese, primary>, en: <English, subtitle> }
 * Themes: consistency 継続 · communication 連絡 · exposure 露出 · decision 決断 ·
 *         discipline 規律 · mindset メンタル · academics 学業 · process 計画
 *
 * Quality bar (set by the product owner): every entry is unique, grounded in
 * recruiting reality, motivating without fluff — coaching tone, not influencer
 * feed. Grow this list in themed batches; never pad with filler.
 * ======================================================================== */
window.BAP_FOCUS_LIB = [

  /* ── 継続 consistency ─────────────────────────────────────────────── */
  { t:'consistency', jp:'コーチが信頼するのは、月に一度だけ現れる選手ではなく、毎週見える選手だ。継続は才能より雄弁に語る。', en:'Coaches trust who they see every week, not once a month.' },
  { t:'consistency', jp:'小さな前進を毎日積み重ねる。1日の差はわずかでも、シーズンが終わる頃には決定的な差になる。', en:'Small daily gains compound into a decisive gap by season’s end.' },
  { t:'consistency', jp:'調子が良い日も悪い日も同じ準備をする。その安定感こそ、次のレベルで最も評価される資質だ。', en:'Same prep on good and bad days — reliability is what the next level wants.' },
  { t:'consistency', jp:'記録を止めるな。数値・映像・連絡を残し続ける選手は、振り返ったとき必ず語れる物語を持っている。', en:'Never stop logging. The one who keeps records always has a story to show.' },
  { t:'consistency', jp:'モチベーションは尽きる。ルーティンは尽きない。気分に関係なく、今日やるべきことを淡々とやる。', en:'Motivation runs out; routine doesn’t. Do the work regardless of mood.' },
  { t:'consistency', jp:'一度の派手なプレーより、崩れない基礎。コーチはハイライトの裏にある平均値を見ている。', en:'Scouts look past the highlight to the average underneath it.' },
  { t:'consistency', jp:'回復も継続の一部だ。休養を計画に組み込む選手が、長いシーズンを最後まで戦い抜く。', en:'Rest is part of consistency. Plan recovery to survive a long season.' },
  { t:'consistency', jp:'週に一歩でいい。ただし止まるな。止まった瞬間から、リクルーティングは静かに後退し始める。', en:'One step a week is fine — but never stop. Standing still is quiet regression.' },
  { t:'consistency', jp:'毎日の素振り一本が、半年後の打席で結果になる。今日の一本を軽く見るな。', en:'Today’s single rep becomes next season’s at-bat. Don’t dismiss it.' },
  { t:'consistency', jp:'派手な一週間より、地味な三ヶ月。継続できる選手だけが、才能を実力に変える。', en:'A dull three months beats a flashy week. Only the consistent convert talent into skill.' },
  { t:'consistency', jp:'「気が向いたら」ではなく「決めた時間に」。予定に落とし込んだ習慣だけが残る。', en:'Not “when I feel like it” but “at a set time.” Only scheduled habits survive.' },
  { t:'consistency', jp:'連続記録を作れ。1日サボると、次の日はもっとサボりやすくなる。鎖を切らさないことに意味がある。', en:'Build a streak. One skipped day makes the next easier to skip. Don’t break the chain.' },
  { t:'consistency', jp:'昨日より1%。それを100日続ければ、別人の準備量になっている。', en:'One percent better than yesterday, a hundred days running, is a different athlete.' },
  { t:'consistency', jp:'結果が出ない時期こそ続ける価値がある。伸びは、たいてい辞めた人には見えない場所で起きる。', en:'The plateau is when continuing matters most. Growth hides where quitters can’t see.' },
  { t:'consistency', jp:'コーチは一度の面談より、半年の一貫した姿勢を覚えている。積み重ねが信用になる。', en:'Coaches remember six consistent months more than one meeting. Accumulation becomes trust.' },
  { t:'consistency', jp:'プロフィールを月初に必ず見直す。古いままの情報は、努力していないと同じに映る。', en:'Refresh your profile at the start of each month. Stale info reads as effort abandoned.' },
  { t:'consistency', jp:'練習ノートを一行でいいから毎日書け。振り返れる選手は、同じ失敗を繰り返さない。', en:'Write one line of training notes daily. Those who review don’t repeat mistakes.' },
  { t:'consistency', jp:'週次のセルフチェックを習慣にする。前に進んだか、止まったかを毎週正直に見よ。', en:'Make a weekly self-check a habit. Ask honestly each week: did I move, or stall?' },

  /* ── 連絡 communication ───────────────────────────────────────────── */
  { t:'communication', jp:'一通の丁寧なフォローアップが、途絶えていたリクルートを再び動かすことがある。沈黙を放置するな。', en:'One strong follow-up can reopen a silent recruitment path.' },
  { t:'communication', jp:'コーチは忙しい。要点を先に、短く、具体的に。読みやすいメールは、それだけで印象を上げる。', en:'Coaches are busy. Lead with the point, keep it short and specific.' },
  { t:'communication', jp:'返信が来ないのは拒否ではない。多くは埋もれただけだ。適切な間隔で、礼儀正しく再送しよう。', en:'No reply rarely means no. It’s often just buried — follow up politely.' },
  { t:'communication', jp:'新しい数値や映像は、連絡する正当な理由になる。進歩は、最良の書き出しだ。', en:'New numbers or film are a legitimate reason to reach out. Progress is your best opener.' },
  { t:'communication', jp:'名前を正しく、大学名を正しく。使い回しが透けるメールは、一瞬で見抜かれる。', en:'Get the name and school right. Recycled templates are spotted instantly.' },
  { t:'communication', jp:'質問を一つ添えると、返信率は上がる。相手が一言で答えられる具体的な問いを用意しよう。', en:'One clear question raises reply rates. Make it answerable in a sentence.' },
  { t:'communication', jp:'感謝を伝えるのに理由はいらない。返信や助言へのお礼が、関係を長く保つ。', en:'You don’t need a reason to say thanks. Gratitude keeps relationships alive.' },
  { t:'communication', jp:'誰にいつ何を送ったかを記録せよ。それを把握している選手だけが、会話を前に進められる。', en:'Log who/when/what you sent. Only that lets you move the conversation forward.' },
  { t:'communication', jp:'最初のメールは自己紹介ではなく、相手にとっての価値から始める。「なぜあなたのチームか」を語れ。', en:'Open not with your bio but with why their program — speak to their interest.' },
  { t:'communication', jp:'返信には24時間以内に返す。速さは熱意の証明であり、コストはほぼゼロだ。', en:'Reply within a day. Speed proves enthusiasm and costs almost nothing.' },
  { t:'communication', jp:'長文より、開いて3秒で用件が分かるメール。件名で結論を伝えろ。', en:'Beat length with clarity — the point visible in three seconds. Put it in the subject.' },
  { t:'communication', jp:'コーチの名前・役職・大学を一度きちんと調べる。相手を理解した一文は、テンプレ百通に勝る。', en:'Research the coach once, properly. One informed line beats a hundred templates.' },
  { t:'communication', jp:'断られても丁寧に礼を返せ。今日の「ノー」を、来年の紹介に変える選手もいる。', en:'Thank them even for a no. Some turn today’s no into next year’s referral.' },
  { t:'communication', jp:'電話やビデオ面談の機会は逃すな。声と表情は、文字の何倍も関係を近づける。', en:'Never skip a call or video meeting. Voice and face close distance faster than text.' },
  { t:'communication', jp:'約束したものは必ず送る。「動画を送ります」と言って送らない選手を、コーチは覚えている。', en:'Send what you promised. Coaches remember the player who said “film’s coming” and never sent it.' },
  { t:'communication', jp:'一斉送信ではなく、一校ずつ。10通の本気は、100通のコピペより遠くまで届く。', en:'One school at a time, not a blast. Ten sincere beats a hundred copied.' },
  { t:'communication', jp:'保護者ではなく、選手自身が連絡する。自分の言葉で書く選手を、コーチは信頼する。', en:'Reach out yourself, not through a parent. Coaches trust the athlete’s own words.' },
  { t:'communication', jp:'次の一手を必ず添えて終える。「来月の大会に来ます」の一言が、関係を継続させる。', en:'End with a next step. “I’ll be at next month’s event” keeps the thread alive.' },

  /* ── 露出 exposure ────────────────────────────────────────────────── */
  { t:'exposure', jp:'見られなければ、評価は始まらない。実力を証明できる場所に、自分から足を運ぶ。', en:'You can’t be evaluated unseen. Go to where the eyes are.' },
  { t:'exposure', jp:'映像は24時間働く名刺だ。短く、要点が伝わり、すぐ再生できるものを一本持っておく。', en:'Film is a business card that works 24/7. Keep one short, clear, instant-play clip.' },
  { t:'exposure', jp:'数字を添えろ。走力・球速・打率。文脈のある数値が、映像の説得力を裏づける。', en:'Attach numbers. Times and velocities give your film credibility.' },
  { t:'exposure', jp:'一つの大会での一つの好プレーが、道を開くことがある。準備を怠らず、その一瞬に備えよ。', en:'One good play at one event can open a door. Be ready for the moment.' },
  { t:'exposure', jp:'露出は量より設計。自分のレベルに合った場所を選ぶ方が、闇雲な参加より効く。', en:'Exposure is design, not volume. The right event beats every event.' },
  { t:'exposure', jp:'プロフィールを最新に保て。古い情報は、せっかく見に来たコーチを取り逃がす。', en:'Keep your profile current. Stale info loses the coach who came to look.' },
  { t:'exposure', jp:'自分を過小評価して機会を逃すな。等身大の実力を、正確に、堂々と提示する。', en:'Don’t undersell yourself out of the room. Present your real level, plainly.' },
  { t:'exposure', jp:'映像の最初の10秒で心を掴め。コーチは何百本も見ている。冒頭で結論を見せろ。', en:'Win the first ten seconds. Coaches watch hundreds — show your best up front.' },
  { t:'exposure', jp:'守備も走塁も撮っておけ。打撃だけの映像は、選手像の半分しか伝えない。', en:'Film defense and baserunning too. A hitting-only reel shows half the player.' },
  { t:'exposure', jp:'キャンプは実力を売る場であると同時に、コーチの人柄を確かめる場でもある。両方見て来い。', en:'A camp sells your skills and reveals the coach’s character. Read both.' },
  { t:'exposure', jp:'計測値は正直に出せ。盛った数字は、実演の場で必ずばれ、信用を失う。', en:'Report measurements honestly. Inflated numbers get exposed live and cost trust.' },
  { t:'exposure', jp:'露出の後は必ずフォローする。見てもらった直後の一通が、記憶に残る差を生む。', en:'Always follow up after being seen. A note right after locks in the memory.' },
  { t:'exposure', jp:'自分のポジションを明確に示せ。「どこでも守れる」は、しばしば「どこも任せられない」に聞こえる。', en:'State your position clearly. “I can play anywhere” often reads as “nowhere for sure.”' },
  { t:'exposure', jp:'映像は定期的に更新しろ。1年前の自分ではなく、今の自分を見せる。', en:'Update your film regularly. Show who you are now, not a year ago.' },
  { t:'exposure', jp:'観客席のコーチに気づけ。本気のプレーは、注目されている瞬間ほど価値が上がる。', en:'Notice the coach in the stands. Full effort is worth most when it’s being watched.' },

  /* ── 決断 decision ────────────────────────────────────────────────── */
  { t:'decision', jp:'上位3校が言えないなら、まだ戦略がない。優先順位を決めることが、行動の起点になる。', en:'If you can’t name your top 3, you don’t have a strategy yet.' },
  { t:'decision', jp:'選択肢を絞るのは損失ではない。エネルギーを集中させ、関係を深めるための投資だ。', en:'Narrowing options isn’t loss — it’s investing focus into real relationships.' },
  { t:'decision', jp:'条件を紙に書き出す。学業・競技・費用・場所。基準が明確なほど、迷いは減る。', en:'Write your criteria down. Clear standards shrink hesitation.' },
  { t:'decision', jp:'完璧な大学は存在しない。最も多くの条件を満たす現実的な選択を、勇気を持って選ぶ。', en:'No school is perfect. Choose the realistic best fit with courage.' },
  { t:'decision', jp:'決めないことも一つの決断で、たいてい最も高くつく。自分に期限を課そう。', en:'Not deciding is a decision — usually the costliest. Set yourself a deadline.' },
  { t:'decision', jp:'助言は集めろ、しかし最後に選ぶのは自分だ。責任を引き受けた選択は、後悔が少ない。', en:'Gather advice, but own the final call. Chosen paths carry fewer regrets.' },
  { t:'decision', jp:'全体像に圧倒されるな。段階を一つ進めることだけに集中すれば、道は必ず続く。', en:'Don’t drown in the whole picture. Advance one stage and the path continues.' },
  { t:'decision', jp:'憧れだけで選ぶな。試合に出られる環境こそ、成長と次の機会を生む。', en:'Don’t choose on prestige alone. Playing time creates growth and the next opportunity.' },
  { t:'decision', jp:'安全校・実力相応校・挑戦校をバランスよく持て。一点賭けは、戦略ではなく賭博だ。', en:'Balance safety, target, and reach schools. Betting on one is gambling, not strategy.' },
  { t:'decision', jp:'感情が高ぶった日には大きな決断をするな。24時間置いてから、もう一度見よ。', en:'Don’t make big calls on an emotional day. Sleep on it and look again.' },
  { t:'decision', jp:'「なんとなく良さそう」を「なぜ良いのか」に変えろ。言語化できない魅力は、たいてい幻だ。', en:'Turn “feels right” into “here’s why.” Attraction you can’t articulate is usually illusion.' },
  { t:'decision', jp:'合わない環境から早く離れる決断も、実力のうちだ。沈むボートを漕ぎ続けるな。', en:'Knowing when to leave a bad fit is a skill too. Don’t row a sinking boat.' },
  { t:'decision', jp:'家族と基準を共有せよ。全員が同じ物差しを持てば、意思決定は驚くほど速くなる。', en:'Share your criteria with family. One shared yardstick makes decisions far faster.' },
  { t:'decision', jp:'選ばなかった道を惜しむより、選んだ道を正解にする努力をしろ。', en:'Don’t mourn the road not taken — work to make the chosen one right.' },

  /* ── 規律 discipline ──────────────────────────────────────────────── */
  { t:'discipline', jp:'誰も見ていない時に何をするか。それが、見られている時のパフォーマンスを決める。', en:'What you do unwatched decides how you perform when watched.' },
  { t:'discipline', jp:'締め切りは守るためにある。書類を早く整える選手は、それだけで信頼を積む。', en:'Deadlines exist to be met. Early paperwork quietly builds trust.' },
  { t:'discipline', jp:'感情ではなく、計画で動く。気分の波に予定を委ねない者が、成果を積み上げる。', en:'Move by plan, not mood. Those who don’t outsource plans to feelings win.' },
  { t:'discipline', jp:'言い訳は一瞬、結果は残る。環境のせいにする前に、動かせる一つを動かそう。', en:'Excuses fade, results remain. Move the one thing you can before blaming the rest.' },
  { t:'discipline', jp:'準備の質が、本番の余裕を作る。前日に整える選手は、当日に迷わない。', en:'Quality prep buys composure. Prepare the night before; don’t scramble day-of.' },
  { t:'discipline', jp:'小さな約束を自分と守れ。それを積み重ねた者だけが、大きな約束を守れる。', en:'Keep small promises to yourself; only then can you keep big ones.' },
  { t:'discipline', jp:'早寝と食事は競技力の一部だ。派手ではないが、これを整えない選手は必ず頭打ちになる。', en:'Sleep and nutrition are part of performance. Ignore them and you’ll plateau.' },
  { t:'discipline', jp:'スマホに奪われる30分を、映像分析に回せ。時間は作るものであって、見つかるものではない。', en:'Redirect thirty phone minutes into film study. Time is made, not found.' },
  { t:'discipline', jp:'やる気が出ないから始めないのではない。始めるからやる気が出る。まず動け。', en:'You don’t wait for drive to start; starting creates drive. Move first.' },
  { t:'discipline', jp:'ルールは自由を奪うのではなく、迷いを消す。決めておけば、毎回考えずに済む。', en:'Rules don’t steal freedom; they kill hesitation. Decide once, act without debating.' },
  { t:'discipline', jp:'今日サボる理由は、いつも十分に立派に聞こえる。だからこそ理由を疑え。', en:'The reason to skip today always sounds reasonable. That’s why you should doubt it.' },
  { t:'discipline', jp:'環境を整えろ。誘惑を遠ざけ、道具を近づける。意志より仕組みが強い。', en:'Design your environment. Move temptation away, tools closer. Systems beat willpower.' },
  { t:'discipline', jp:'疲れている日ほど、最低ラインだけは守れ。ゼロにしないことが、習慣を殺さない。', en:'On tired days, at least hit the floor. Never zero — that’s what keeps the habit alive.' },
  { t:'discipline', jp:'結果ではなく、行動を約束せよ。「送る」は守れるが、「返事をもらう」は守れない。', en:'Commit to actions, not outcomes. You control “send,” not “get a reply.”' },

  /* ── メンタル mindset ─────────────────────────────────────────────── */
  { t:'mindset', jp:'才能は入口を開くが、姿勢が扉の先へ連れて行く。今日の姿勢を、自分で選べ。', en:'Talent opens the door; attitude carries you through. Choose today’s attitude.' },
  { t:'mindset', jp:'比較ではなく、昨日の自分を超えることに集中する。競争相手は鏡の中にいる。', en:'Compete with yesterday’s you, not others. Your rival is in the mirror.' },
  { t:'mindset', jp:'断られる恐れで動かないより、動いて断られる方が、ずっと前に進んでいる。', en:'Acting and getting a no beats freezing from fear of one. It moves you forward.' },
  { t:'mindset', jp:'不安は準備で小さくなる。コントロールできることに手をつければ、心は静かになる。', en:'Anxiety shrinks with preparation. Touch what you control and the mind settles.' },
  { t:'mindset', jp:'長い道のりだ。結果ではなく過程を信じられる者が、最後まで走り切る。', en:'It’s a long road. Those who trust the process, not just outcomes, finish it.' },
  { t:'mindset', jp:'今日できる最善を尽くせば十分だ。完璧ではなく、誠実な一歩を積み重ねよう。', en:'Your honest best today is enough. Stack sincere steps, not perfect ones.' },
  { t:'mindset', jp:'挫折は情報だ。何がうまくいかなかったかを学べば、次の挑戦は鋭くなる。', en:'Setbacks are information. Learn what failed and the next attempt sharpens.' },
  { t:'mindset', jp:'自分の物語を、他人の期限で測るな。歩みの速さより、方向を大切にしよう。', en:'Don’t measure your story by others’ timelines. Direction over speed.' },
  { t:'mindset', jp:'誇りを持て。海を越えて挑戦すると決めたこと自体が、すでに多くの人より一歩前だ。', en:'Take pride: deciding to chase this across an ocean already puts you ahead.' },
  { t:'mindset', jp:'緊張は敵ではない。それは、本気で挑んでいる証拠だ。震えを、集中に変えろ。', en:'Nerves aren’t the enemy — they prove you care. Turn the shake into focus.' },
  { t:'mindset', jp:'誰かと比べて落ち込む時間があるなら、その分だけ自分を鍛えろ。嫉妬は燃料に変えられる。', en:'Time spent envying others is better spent training. Jealousy converts into fuel.' },
  { t:'mindset', jp:'失敗を恐れる選手ではなく、挑戦を続ける選手をコーチは選ぶ。行動が評価を作る。', en:'Coaches pick the one who keeps trying, not the one who fears failing. Action earns evaluation.' },
  { t:'mindset', jp:'今日の練習で誰も見ていなくても、自分は見ている。自分への評価を下げるな。', en:'Even if no one watches today’s work, you do. Don’t lower your own regard.' },
  { t:'mindset', jp:'停滞は失敗ではない。多くの伸びは、目に見えない地下で根を張っている時間に起きる。', en:'A plateau isn’t failure. Much growth happens underground, out of sight.' },
  { t:'mindset', jp:'コントロールできないことを手放せ。天気も、相手も、審判も。残ったものに全力を注げ。', en:'Let go of what you can’t control — weather, opponents, umpires. Pour everything into the rest.' },
  { t:'mindset', jp:'一度の大きな決意より、毎朝の小さな選択。自分は続けると、今日もう一度決めろ。', en:'Small daily choices beat one grand vow. Decide again today that you’ll continue.' },
  { t:'mindset', jp:'恐れているその一歩の先に、たいてい成長がある。快適な場所に、上達は住んでいない。', en:'Growth usually sits just past the step you fear. Comfort is where improvement doesn’t live.' },
  { t:'mindset', jp:'孤独な時期もある。それでも動き続けた自分を、未来の自分が必ず誇りに思う。', en:'There will be lonely stretches. Future-you will be proud you kept moving.' },

  /* ── 学業 academics ──────────────────────────────────────────────── */
  { t:'academics', jp:'学業も競技の一部だ。GPAと英語は、選択肢そのものを広げる土台になる。', en:'Academics are part of the game. GPA and English widen your options themselves.' },
  { t:'academics', jp:'成績は、才能を無駄にしないための保険だ。良い数字は、迷ったコーチの背中を押す。', en:'Grades insure your talent isn’t wasted. Strong marks tip a hesitant coach your way.' },
  { t:'academics', jp:'英語のスコアは、実力の証明であると同時に、努力の証明でもある。毎日15分でいい。', en:'An English score proves ability and effort alike. Fifteen minutes a day is enough.' },
  { t:'academics', jp:'必要な試験と締め切りを早めに把握せよ。制度を知らないことで機会を逃すのは、最ももったいない。', en:'Map the required tests and deadlines early. Losing chances to ignorance of the system is the saddest loss.' },
  { t:'academics', jp:'授業を真面目に受ける選手は、練習でも指示を正確に理解する。学ぶ姿勢は、競技に滲み出る。', en:'The player who takes class seriously grasps coaching precisely too. A learner’s posture shows on the field.' },
  { t:'academics', jp:'学力があれば、奨学金の選択肢が増える。学業は、家族の負担を軽くする現実的な武器だ。', en:'Academic strength unlocks more aid. Grades are a real weapon that eases your family’s burden.' },
  { t:'academics', jp:'英語は「話せる」より「伝えられる」。完璧な文法より、意図が届く一文を目指せ。', en:'English is about being understood, not flawless. Aim for a sentence that lands, not perfect grammar.' },
  { t:'academics', jp:'テスト前夜の徹夜より、毎日の30分。学業も競技も、積み重ねの原理は同じだ。', en:'Thirty minutes daily beats an all-nighter. Academics and sport share the same law of accumulation.' },
  { t:'academics', jp:'コーチとの会話で自分の専攻や興味を語れると、人物像が立体的になる。学びは自己紹介になる。', en:'Speaking about your major and interests makes you three-dimensional to a coach. Learning is part of your introduction.' },
  { t:'academics', jp:'成績表もまた、あなたのハイライト映像だ。数字で「継続できる人間」だと証明できる。', en:'A transcript is also a highlight reel — proof in numbers that you can sustain effort.' },

  /* ── 計画 process ────────────────────────────────────────────────── */
  { t:'process', jp:'目標は大きく、行動は小さく。「全米で活躍する」を、今日の素振り20分に翻訳せよ。', en:'Dream big, act small. Translate “play in America” into today’s twenty minutes.' },
  { t:'process', jp:'逆算せよ。卒業から今日まで線を引けば、今週やるべきことが自然に見えてくる。', en:'Work backward. Draw a line from graduation to today and this week’s task appears.' },
  { t:'process', jp:'週の初めに3つだけ決める。多すぎる目標は、結局どれも進まない。', en:'Pick just three each week. Too many goals means none move.' },
  { t:'process', jp:'進捗は感覚ではなく記録で測れ。「頑張った気がする」は、たいてい実態より甘い。', en:'Measure progress by record, not feeling. “I think I worked hard” usually flatters reality.' },
  { t:'process', jp:'計画は変えていい。変えないのは、続けるという意思だけだ。', en:'Plans may change. The one thing that shouldn’t is the intent to continue.' },
  { t:'process', jp:'ボトルネックを一つ見つけて、そこに集中せよ。全部を少しずつより、一つを突破する方が効く。', en:'Find one bottleneck and attack it. Breaking through one beats nudging everything.' },
  { t:'process', jp:'締め切りのない目標は、願望にすぎない。日付を入れた瞬間に、計画になる。', en:'A goal without a deadline is a wish. Add a date and it becomes a plan.' },
  { t:'process', jp:'月末に振り返る時間を予定に入れよ。走りっぱなしの選手は、方向のズレに気づけない。', en:'Schedule a month-end review. Runners who never look up miss the drift in their direction.' },
  { t:'process', jp:'「いつか」を「何月何日」に変える。曖昧さは、行動の最大の敵だ。', en:'Turn “someday” into a date. Vagueness is action’s greatest enemy.' },
  { t:'process', jp:'次の一手が常に一つだけ見えている状態を保て。迷いがなければ、毎日確実に前へ進める。', en:'Always keep exactly one next move in view. No hesitation means steady daily progress.' },

  /* ── batch 2 ─────────────────────────────────────────────────────── */

  // 継続 consistency
  { t:'consistency', jp:'オフシーズンにこそ差がつく。誰もが休む時期に積んだものが、来季の先発を決める。', en:'The offseason is where gaps open. What you build while others rest decides next year’s lineup.' },
  { t:'consistency', jp:'怪我からの復帰は、焦りではなく積み重ねで戻る。昨日より少し、を守れば必ず戻れる。', en:'Return from injury by accumulation, not haste. A little more than yesterday always gets you back.' },
  { t:'consistency', jp:'雨の日の室内メニューを用意しておけ。言い訳を消しておく準備が、継続を支える。', en:'Have a rainy-day indoor plan ready. Pre-killing excuses is what sustains a streak.' },
  { t:'consistency', jp:'週7で全力より、週5を1年続ける方が遠くへ行く。持続可能なペースを設計せよ。', en:'Five days for a year beats seven days for a month. Design a pace you can sustain.' },
  { t:'consistency', jp:'記録は嘘をつかない。感覚では「やった」でも、ノートは「3日空いた」と教えてくれる。', en:'Records don’t lie. Your gut says “I did it”; the log says “you skipped three days.”' },
  { t:'consistency', jp:'コーチへの連絡も継続だ。3ヶ月に一度の近況報告が、忘れられない選手を作る。', en:'Outreach is a streak too. A quarterly update keeps you from being the forgotten name.' },
  { t:'consistency', jp:'最初の2週間で辞める人が最も多い。そこを越えれば、習慣が自分を運んでくれる。', en:'Most quit in the first two weeks. Cross that and the habit starts carrying you.' },
  { t:'consistency', jp:'完璧な1日より、平凡でも欠かさない30日。凡事徹底が、非凡を作る。', en:'Thirty unbroken ordinary days beat one perfect one. Mastering the mundane makes the exceptional.' },

  // 連絡 communication
  { t:'communication', jp:'試合の翌日に一行送れ。「昨日2安打しました」という即時報告が、熱意を可視化する。', en:'Send a line the day after a game. “Went 2-for-4 yesterday” makes enthusiasm visible.' },
  { t:'communication', jp:'フィードバックを求めよ。「何を伸ばせば可能性がありますか」の一言が、関係を一段深める。', en:'Ask for feedback. “What should I improve to have a shot?” deepens the relationship a level.' },
  { t:'communication', jp:'コーチの直近の試合結果に触れてみろ。相手を見ている証拠が、テンプレとの決定的な差になる。', en:'Reference the coach’s recent result. Proof you’re watching separates you from every template.' },
  { t:'communication', jp:'返信がなくても、感情的にならない。ビジネスとして淡々と、次の適切なタイミングを待て。', en:'No reply? Don’t take it personally. Stay businesslike and wait for the right next window.' },
  { t:'communication', jp:'キャンプ招待には24時間以内に返事を。速い返信そのものが、あなたの評価を上げる。', en:'Reply to a camp invite within a day. The speed itself raises your stock.' },
  { t:'communication', jp:'CCとBCCを間違えるな。基本的な礼儀とツールの扱いも、コーチは静かに見ている。', en:'Don’t mix up CC and BCC. Coaches quietly notice basic etiquette and tool literacy.' },
  { t:'communication', jp:'署名に学年・ポジション・卒業年・連絡先を入れておけ。探させないことが親切だ。', en:'Put your class, position, grad year, and contact in your signature. Don’t make them hunt.' },
  { t:'communication', jp:'一度の「ノー」を関係の終わりにするな。丁寧な返礼が、翌年の再挑戦の扉を開く。', en:'Don’t let one no end the relationship. A gracious reply opens next year’s door.' },
  { t:'communication', jp:'メールは送る前に一度声に出して読め。読みにくい一文は、たいてい耳で気づく。', en:'Read your email aloud before sending. The clunky sentence usually reveals itself to the ear.' },
  { t:'communication', jp:'質問攻めにするな。一通に問いは一つ。答えやすさが、返信率を決める。', en:'Don’t interrogate. One question per email — ease of reply drives the response rate.' },

  // 露出 exposure
  { t:'exposure', jp:'第三者計測の数字を持て。自己申告より、公式記録の一つが百の言葉より効く。', en:'Get third-party verified numbers. One official record beats a hundred self-reported words.' },
  { t:'exposure', jp:'SNSも露出の一部だ。荒れた投稿一つが、努力の全てを台無しにすることを忘れるな。', en:'Social media is exposure too. One ugly post can undo all your work — remember that.' },
  { t:'exposure', jp:'映像は誇張するな。実物とのギャップは、生で見た瞬間に信用を崩す。', en:'Don’t over-edit your film. The gap from reality collapses trust the moment they see you live.' },
  { t:'exposure', jp:'地域の大会でまず実績を作れ。近い舞台での結果が、大きな舞台への招待状になる。', en:'Build a record at regional events first. Results close by become the invite to bigger stages.' },
  { t:'exposure', jp:'キャンプでは技術以上に「コーチャブルさ」を見られている。指示への反応が評価を左右する。', en:'At camps they watch coachability as much as skill. How you take instruction shapes the verdict.' },
  { t:'exposure', jp:'失敗したプレーの後の姿勢を撮っておけ。切り替えの速さは、実力そのものだ。', en:'Capture how you respond after a mistake. Quick reset is a skill in itself.' },
  { t:'exposure', jp:'ハイライトだけでなく、1試合まるごとの映像も用意せよ。本気のコーチは、良い所だけを信じない。', en:'Have full-game film, not just highlights. Serious coaches don’t trust only the good parts.' },
  { t:'exposure', jp:'露出の機会は、行く前に目的を決めろ。「誰に何を見せるか」が曖昧だと、ただ参加しただけになる。', en:'Decide your goal before an event. Vague “who sees what” makes it mere attendance.' },
  { t:'exposure', jp:'自分より上のレベルに混じれ。強い相手の中で見せる姿は、実力を何倍にも証明する。', en:'Play up a level. Holding your own against stronger competition multiplies the proof.' },

  // 決断 decision
  { t:'decision', jp:'オファーの数ではなく、合う一校を探せ。10の妥協より、1の適合が競技人生を伸ばす。', en:'Chase the one right fit, not the count of offers. One good match outlasts ten compromises.' },
  { t:'decision', jp:'キャンパス訪問で違和感を覚えたら、それを軽視するな。直感は多くの情報を圧縮している。', en:'If a campus visit feels off, don’t dismiss it. Intuition compresses a lot of data.' },
  { t:'decision', jp:'ウォークオンか奨学金か。肩書より、伸びる環境と出場機会を基準に選べ。', en:'Walk-on or scholarship — choose by growth and playing time, not by label.' },
  { t:'decision', jp:'JUCO経由も立派な戦略だ。遠回りに見える道が、最短の成長ルートになることもある。', en:'The JUCO route is a real strategy. The long way around is sometimes the fastest growth.' },
  { t:'decision', jp:'レッドフラッグを無視するな。約束が曖昧、返信が遅い、話がすり替わる。小さな違和感を記録せよ。', en:'Don’t ignore red flags — vague promises, slow replies, shifting stories. Log the small unease.' },
  { t:'decision', jp:'コーチの人柄は、4年間を左右する。プログラムの名前より、日々を共にする人を見よ。', en:'A coach’s character shapes four years. Look at the person you’ll live with daily, not the brand.' },
  { t:'decision', jp:'迷ったら、5年後の自分がどちらを誇りに思うかで選べ。長い視点が、短期の不安を静める。', en:'When torn, choose what five-years-from-now you would be proud of. The long view quiets short-term fear.' },
  { t:'decision', jp:'情報が足りないなら、決める前にもう一つ質問しろ。決断の質は、準備の質で決まる。', en:'If you lack information, ask one more question before deciding. Decision quality follows preparation quality.' },

  // 規律 discipline
  { t:'discipline', jp:'食事は最も安いドーピングだ。何を口に入れるかで、翌日の質が変わる。', en:'Nutrition is the cheapest performance edge. What you eat changes tomorrow’s quality.' },
  { t:'discipline', jp:'映像分析を週の予定に固定せよ。感覚の練習より、証拠に基づく修正が速く伸びる。', en:'Lock film study into your week. Evidence-based correction beats practicing on feel.' },
  { t:'discipline', jp:'時間を守れ。5分前行動は、能力ではなく信頼を示す、最も簡単な方法だ。', en:'Be on time. Arriving early is the easiest way to signal trust, not talent.' },
  { t:'discipline', jp:'ウエイトルームの記録をつけろ。数字が伸びない週は、練習ではなく回復を疑え。', en:'Log your lifts. A stalled week points to recovery, not the workout.' },
  { t:'discipline', jp:'モビリティと柔軟性は、地味だが選手寿命を延ばす。派手な種目の前に、土台を整えよ。', en:'Mobility and flexibility are dull but extend a career. Build the base before the flashy work.' },
  { t:'discipline', jp:'寝る1時間前はスマホを置け。睡眠の質は、翌日の集中と判断を静かに支配する。', en:'Put the phone down an hour before bed. Sleep quality quietly governs next-day focus and judgment.' },
  { t:'discipline', jp:'「後でやる」は、たいてい「やらない」の丁寧な言い方だ。今できることは今やれ。', en:'“Later” is usually a polite word for “never.” Do the doable now.' },
  { t:'discipline', jp:'誘惑に勝とうとするな。誘惑を視界から消せ。環境設計は、意志より確実に効く。', en:'Don’t fight temptation — remove it from sight. Designing the environment beats relying on willpower.' },

  // メンタル mindset
  { t:'mindset', jp:'自分への言葉を選べ。「またミスした」ではなく「次はこうする」。内なる声も監督だ。', en:'Choose your self-talk. Not “I blew it again” but “next time I do this.” Your inner voice coaches too.' },
  { t:'mindset', jp:'拒絶は方向転換の合図であって、才能の否定ではない。門が閉じたら、別の門を探せ。', en:'Rejection is a redirection, not a verdict on your talent. When one door shuts, find another.' },
  { t:'mindset', jp:'プレッシャーは特権だ。期待される場所にいることを、まず誇れ。', en:'Pressure is a privilege. First be proud you’re somewhere expectations exist.' },
  { t:'mindset', jp:'野球選手である前に、一人の人間だ。競技の結果に、自分の価値の全てを預けるな。', en:'You’re a person before an athlete. Don’t stake all your worth on results.' },
  { t:'mindset', jp:'感謝は最強の安定剤だ。支えてくれる人を思い出すと、不安は驚くほど小さくなる。', en:'Gratitude is the strongest stabilizer. Recall who supports you and anxiety shrinks fast.' },
  { t:'mindset', jp:'焦りは、他人の時計を見ているから生まれる。自分の時計を信じて歩け。', en:'Impatience comes from watching others’ clocks. Trust your own and keep walking.' },
  { t:'mindset', jp:'勇気とは恐れがないことではない。恐れながらも、送信ボタンを押すことだ。', en:'Courage isn’t the absence of fear. It’s hitting send while afraid.' },
  { t:'mindset', jp:'今日の結果に一喜一憂するな。一試合はデータの一点であって、物語の結末ではない。', en:'Don’t ride the wave of one day’s result. A single game is one data point, not the ending.' },
  { t:'mindset', jp:'自分を信じられない日は、過去にやり切った証拠を見返せ。記録は、揺れる心を支える。', en:'On days you can’t believe in yourself, revisit proof of past follow-through. Records steady a shaky mind.' },
  { t:'mindset', jp:'コントロールできるのは、努力と態度と反応の3つだけ。そこに全てを注げ。', en:'You control three things: effort, attitude, response. Pour everything into those.' },

  // 学業 academics
  { t:'academics', jp:'NCAAの資格要件を早く確認せよ。知らなかったで夢を失うのは、最も避けられる失敗だ。', en:'Check NCAA eligibility rules early. Losing a dream to “I didn’t know” is the most avoidable failure.' },
  { t:'academics', jp:'履修科目の難易度も見られている。楽な道より、挑戦した記録が人物を語る。', en:'Course rigor is noticed too. A record of challenge speaks louder than the easy path.' },
  { t:'academics', jp:'GPAは一夜では上がらない。毎学期の積み重ねだけが、選択肢を静かに広げる。', en:'GPA can’t be raised overnight. Only term-by-term accumulation quietly widens your options.' },
  { t:'academics', jp:'英語は競技の通訳だ。技術がどれだけ高くても、伝わらなければ半分しか評価されない。', en:'English is the translator of your game. However high your skill, unheard is half-valued.' },
  { t:'academics', jp:'時間管理は、学業と競技を両立させる唯一の技術だ。カレンダーは、才能を守る盾になる。', en:'Time management is the one skill that lets sport and study coexist. A calendar shields your talent.' },
  { t:'academics', jp:'成績証明書は早めに整えろ。書類の遅れで機会を逃す選手が、毎年必ずいる。', en:'Prepare transcripts early. Every year, players lose chances to paperwork delays.' },
  { t:'academics', jp:'英語学習は毎日15分でいい。ゼロの日を作らないことが、半年後の会話力を決める。', en:'Fifteen daily minutes of English is enough. Never zero — that decides your fluency in six months.' },
  { t:'academics', jp:'コーチに専攻や学びの興味を語れると、単なる選手から「育てたい学生」に変わる。', en:'Speak of your major and curiosity, and you shift from mere recruit to a student worth developing.' },

  // 計画 process
  { t:'process', jp:'年間計画を四半期に割れ。1年は大きすぎるが、3ヶ月なら手が届く。', en:'Split the year into quarters. A year is too big; three months is graspable.' },
  { t:'process', jp:'測る指標を3つに絞れ。全部を追う者は、結局どれも改善できない。', en:'Track just three metrics. Chase them all and you improve none.' },
  { t:'process', jp:'締め切りの2週間前を、自分の締め切りにせよ。余白が、質と安心を生む。', en:'Make two weeks early your real deadline. Slack creates quality and calm.' },
  { t:'process', jp:'毎週日曜に翌週の3手を書け。日曜10分が、平日の迷いを消す。', en:'Every Sunday, write next week’s three moves. Ten minutes erases weekday hesitation.' },
  { t:'process', jp:'うまくいったことも記録せよ。改善点だけでなく、再現すべき成功も設計の材料だ。', en:'Log what worked, not just what to fix. Repeatable wins are design material too.' },
  { t:'process', jp:'計画倒れの原因はたいてい「多すぎ」だ。一つに絞れば、一つは必ず終わる。', en:'Failed plans usually failed from “too much.” Narrow to one and one gets done.' },
  { t:'process', jp:'進捗が止まったら、目標ではなく次の行動の大きさを疑え。一歩を小さく刻み直せ。', en:'When progress stalls, question the size of the next action, not the goal. Re-cut the step smaller.' },
  { t:'process', jp:'カレンダーに入っていない目標は、実在しない。時間を確保して初めて意思になる。', en:'A goal not on the calendar doesn’t exist. It becomes intent only when it owns a time slot.' },

  /* ── batch 3 ─────────────────────────────────────────────────────── */

  // 継続 consistency
  { t:'consistency', jp:'継続の敵は失敗ではなく、退屈だ。同じことを飽きずに磨ける者が、最後に抜きん出る。', en:'Consistency’s enemy is boredom, not failure. Those who polish the same thing without tiring pull ahead.' },
  { t:'consistency', jp:'今日の練習は誰も褒めてくれない。それでも積む者だけが、半年後に結果で報われる。', en:'No one applauds today’s reps. Only those who stack them anyway get paid in results later.' },
  { t:'consistency', jp:'調子の波は必ず来る。波を消そうとするな。低い日でも最低ラインを守れば、平均は上がる。', en:'Slumps will come. Don’t try to erase the wave — hold the floor on low days and your average rises.' },
  { t:'consistency', jp:'一度きりの猛練習より、毎日の軽い一歩。体は、突発よりリズムに応える。', en:'A steady daily step beats one brutal session. The body responds to rhythm, not to spikes.' },
  { t:'consistency', jp:'習慣は複利だ。今日は見えなくても、続けた者にだけ、ある日まとめて returns が来る。', en:'Habits compound. Invisible today, the returns arrive all at once — only for those who kept going.' },
  { t:'consistency', jp:'成長は直線ではない。停滞期に辞めなかった者だけが、次の跳ね上がりを受け取る。', en:'Growth isn’t linear. Only those who don’t quit the plateau catch the next jump.' },
  { t:'consistency', jp:'毎朝、同じ時間に始めよ。決断の回数を減らすほど、続ける力は温存される。', en:'Start at the same time each morning. Fewer decisions means more willpower left to continue.' },

  // 連絡 communication
  { t:'communication', jp:'コーチは記憶ではなく記録で動く。送った内容を自分でも残せば、次の会話が滑らかになる。', en:'Coaches run on records, not memory. Keep your own copy and the next conversation flows.' },
  { t:'communication', jp:'長い沈黙の後でも連絡していい。「ご無沙汰しています」の一言から、関係は再び動く。', en:'You can reach out even after long silence. “It’s been a while” restarts the relationship.' },
  { t:'communication', jp:'具体は信頼を生む。「頑張っています」より「60ヤードが6.9秒になりました」。', en:'Specifics build trust. Not “I’m working hard” but “my 60 dropped to 6.9.”' },
  { t:'communication', jp:'相手の時間を尊重せよ。要点を3文に収めるメールは、それだけで礼儀正しい。', en:'Respect their time. An email that fits its point in three sentences is polite by design.' },
  { t:'communication', jp:'感謝と近況と次の一手。この3つが揃えば、どんなフォローアップも形になる。', en:'Thanks, an update, and a next step — those three make any follow-up land.' },
  { t:'communication', jp:'メールの返信は、遅くとも当日中に。速度は、言葉以上に本気を伝える。', en:'Reply the same day at the latest. Speed says more about your seriousness than words.' },
  { t:'communication', jp:'誤字は熱意を薄める。送信前の30秒の見直しが、印象を確実に守る。', en:'Typos dilute enthusiasm. A thirty-second reread before sending protects the impression.' },
  { t:'communication', jp:'断られた理由を、可能なら丁寧に尋ねよ。次の相手への最良の準備になる。', en:'If turned down, ask politely why. It’s the best preparation for the next coach.' },
  { t:'communication', jp:'定型文でも、冒頭の一文だけは必ず手で書け。そこに相手の名が生きていれば、印象は変わる。', en:'Even with a template, hand-write the first line. A living use of their name changes everything.' },

  // 露出 exposure
  { t:'exposure', jp:'露出は狙って作れる。行き当たりばったりではなく、年間で「見せる場」を設計せよ。', en:'Exposure can be engineered. Design your “show” events across the year instead of leaving it to chance.' },
  { t:'exposure', jp:'映像のサムネイルと冒頭を磨け。開いてもらえなければ、どんな中身も存在しないのと同じだ。', en:'Polish your film’s thumbnail and opening. Unopened, even great content may as well not exist.' },
  { t:'exposure', jp:'計測イベントは怖くていい。逃げずに数字を残す経験そのものが、次への地図になる。', en:'Testing events can be scary — good. Facing them and logging real numbers becomes your map forward.' },
  { t:'exposure', jp:'一度の悪い日で腐るな。コーチは一点ではなく、傾向とメンタルの立ち直りを見ている。', en:'Don’t sour on one bad day. Coaches read trends and how you recover, not a single point.' },
  { t:'exposure', jp:'自分のポジションでの強みを一言で言えるようにしておけ。売り込みは、明確さから始まる。', en:'Be able to name your positional strength in one line. Selling yourself starts with clarity.' },
  { t:'exposure', jp:'露出の前に体調を整えろ。準備不足で臨む一度きりの舞台ほど、もったいないものはない。', en:'Arrive rested and ready. Nothing is more wasteful than a one-shot stage met underprepared.' },
  { t:'exposure', jp:'見てもらった後の礼と映像共有を忘れるな。露出は、その後のフォローで初めて実を結ぶ。', en:'Don’t forget the thank-you and film share afterward. Exposure bears fruit only in the follow-up.' },
  { t:'exposure', jp:'派手なプレーより、ミスの後の全力疾走を見せろ。姿勢は、才能よりも記憶に残る。', en:'Show the all-out sprint after a mistake, not just the flashy play. Attitude outlasts talent in memory.' },

  // 決断 decision
  { t:'decision', jp:'選択肢が多すぎると、人は決められなくなる。まず「これはない」を消して視界を晴らせ。', en:'Too many options paralyze. First cross off the clear no’s to clear your view.' },
  { t:'decision', jp:'条件のうち、絶対に譲れない一つを決めよ。核が定まれば、残りの比較は驚くほど速い。', en:'Decide your one non-negotiable. With a core fixed, the rest of the comparison flies.' },
  { t:'decision', jp:'華やかな約束より、書面と一貫性を信じろ。言葉は安く、記録は重い。', en:'Trust paperwork and consistency over dazzling promises. Words are cheap; records are heavy.' },
  { t:'decision', jp:'訪問できるなら必ず訪問せよ。写真で恋に落ちても、現地で目が覚めることは多い。', en:'Visit if you can. You may fall for the photos and wake up on campus.' },
  { t:'decision', jp:'出場機会は成長の酸素だ。ベンチの名門より、試合に出られる環境を選ぶ勇気を持て。', en:'Playing time is the oxygen of growth. Have the courage to pick minutes over a benched brand.' },
  { t:'decision', jp:'決断を先送りするコストを見積もれ。「待つ」もまた、静かに何かを失っている。', en:'Estimate the cost of delaying. “Waiting” is also quietly losing something.' },
  { t:'decision', jp:'誰かの正解が、自分の正解とは限らない。他人の道の眩しさに、自分の基準を明け渡すな。', en:'Someone else’s right answer isn’t yours. Don’t surrender your criteria to another’s shiny path.' },
  { t:'decision', jp:'最後は数字と直感の両方に聞け。片方だけを信じた決断は、たいてい後で揺れる。', en:'In the end, consult both data and gut. Decisions on only one usually wobble later.' },

  // 規律 discipline
  { t:'discipline', jp:'規律は罰ではなく、未来の自分への贈り物だ。今日の我慢が、明日の自由を買う。', en:'Discipline isn’t punishment; it’s a gift to future-you. Today’s restraint buys tomorrow’s freedom.' },
  { t:'discipline', jp:'水分と睡眠を軽く見るな。最も基本的なものを整えない選手が、最も伸び悩む。', en:'Don’t underrate water and sleep. Those who neglect the basics plateau the hardest.' },
  { t:'discipline', jp:'練習の質は、開始5分で決まる。だらだら始める癖を、まず断て。', en:'A session’s quality is set in the first five minutes. Kill the habit of a sluggish start.' },
  { t:'discipline', jp:'記録を怠るな。測らないものは、改善できない。数字が、努力を方向づける。', en:'Don’t skip logging. What isn’t measured can’t improve. Numbers aim your effort.' },
  { t:'discipline', jp:'誘惑に「今日だけ」を許すな。「今日だけ」が、習慣を殺す最初の一手だ。', en:'Never grant temptation a “just today.” “Just today” is the first move that kills a habit.' },
  { t:'discipline', jp:'疲れている時ほど、フォームは崩れる。集中を切らさないことも、立派な規律だ。', en:'Form breaks most when you’re tired. Holding focus then is discipline too.' },
  { t:'discipline', jp:'やるべきことを、先に、一番元気なうちに。後回しにした重要事項は、たいてい消える。', en:'Do the important thing first, while freshest. Deferred priorities usually vanish.' },
  { t:'discipline', jp:'小さなルールを一つ決めて、90日守れ。守り切った経験が、次の大きな規律を可能にする。', en:'Set one small rule and keep it ninety days. Following through unlocks bigger discipline next.' },

  // メンタル mindset
  { t:'mindset', jp:'比べるなら、SNSの誰かではなく、昨日の自分と。他人の編集された人生に、心を削られるな。', en:'If you must compare, compare to yesterday’s you — not a stranger’s edited life online.' },
  { t:'mindset', jp:'失敗の数は、挑戦の数だ。打席に立たない者だけが、三振ゼロでいられる。', en:'Your failure count equals your attempt count. Only those who never bat strike out zero.' },
  { t:'mindset', jp:'不安を紙に書き出せ。頭の中で膨らむ怪物も、文字にすると等身大に縮む。', en:'Write your worries down. The monster that swells in your head shrinks to size on paper.' },
  { t:'mindset', jp:'今日が思うようにいかなくても、明日また立てる。一日は、人生の判決ではない。', en:'A rough today doesn’t stop tomorrow’s start. One day is no verdict on a life.' },
  { t:'mindset', jp:'恐れは、大切にしている証だ。どうでもいいことに、人は緊張しない。', en:'Fear is a sign you care. No one gets nervous over what doesn’t matter.' },
  { t:'mindset', jp:'完璧主義は、しばしば前進の敵だ。80点で出す勇気が、100点の妄想に勝る。', en:'Perfectionism often blocks progress. The courage to ship at 80 beats the fantasy of 100.' },
  { t:'mindset', jp:'孤独に感じる挑戦こそ、最も価値がある。誰もが選ぶ道に、大きな成長は落ちていない。', en:'The lonely-feeling challenge is the most valuable. Big growth rarely lies on the crowded path.' },
  { t:'mindset', jp:'結果を手放し、過程に没頭せよ。皮肉にも、その時に最良の結果が近づく。', en:'Release the outcome and lose yourself in the process. Ironically, that’s when results come closest.' },
  { t:'mindset', jp:'自分を責める声に、証拠を要求しろ。「自分はダメだ」に、事実はたいてい伴っていない。', en:'Demand evidence from your inner critic. “I’m worthless” rarely comes with facts.' },
  { t:'mindset', jp:'今この瞬間に集中しろ。過去は変えられず、未来は来ていない。力は、今にしか宿らない。', en:'Focus on this moment. The past is fixed, the future hasn’t come. Power lives only in now.' },

  // 学業 academics
  { t:'academics', jp:'英語の面接練習をしておけ。技術の映像だけでなく、話せる自分も準備の一部だ。', en:'Rehearse an English interview. A self who can speak is part of your prep, not just film.' },
  { t:'academics', jp:'標準テストの日程を年間計画に組み込め。競技の繁忙期と重ねない設計が、点数を守る。', en:'Build test dates into your yearly plan. Not overlapping your busy season protects the score.' },
  { t:'academics', jp:'成績は、コーチが学校に「彼を入れたい」と言える根拠になる。学業は交渉材料だ。', en:'Grades give a coach grounds to tell admissions “I want him.” Academics are leverage.' },
  { t:'academics', jp:'わからない単語を一日3つ覚えるだけで、一年で千語になる。小さな積み上げを侮るな。', en:'Three new words a day is a thousand a year. Never scorn small accumulation.' },
  { t:'academics', jp:'課題の締め切りを守る癖は、書類提出の締め切りを守る癖につながる。学業は予行演習だ。', en:'The habit of meeting assignment deadlines becomes the habit of meeting paperwork ones. School is rehearsal.' },
  { t:'academics', jp:'英語は失敗しながら覚えるものだ。間違いを恐れて黙る一年より、間違え続ける一年を選べ。', en:'You learn English by failing at it. Choose a year of mistakes over a year of silent fear.' },

  // 計画 process
  { t:'process', jp:'大きな夢を、今週の1タスクに変換できたか。抽象を具体に落とせた時、初めて計画になる。', en:'Did you turn the big dream into one task this week? A plan is born when the abstract becomes concrete.' },
  { t:'process', jp:'月に一度、やめることを決めよ。足すだけの計画は、いつか自分を潰す。', en:'Once a month, decide what to stop. A plan that only adds eventually crushes you.' },
  { t:'process', jp:'進捗は「やったこと」ではなく「動いた距離」で測れ。忙しさと前進は、別物だ。', en:'Measure progress by distance moved, not tasks done. Busy and forward are not the same.' },
  { t:'process', jp:'計画に予備日を入れておけ。崩れる前提で組んだ計画だけが、現実に生き残る。', en:'Build buffer days in. Only plans that assume disruption survive reality.' },
  { t:'process', jp:'一週間の終わりに、たった一問。「来週、何を一つ変えるか」。継続的改善は、そこから始まる。', en:'End the week with one question: “What one thing changes next week?” That’s where improvement begins.' },
  { t:'process', jp:'目標は見える場所に貼れ。視界から消えた目標は、心からも静かに消えていく。', en:'Post your goal where you’ll see it. Out of sight, it quietly leaves your mind too.' },
  { t:'process', jp:'完璧な計画を待つな。走りながら直す方が、机上で完成させるより速く着く。', en:'Don’t wait for the perfect plan. Fixing while running arrives sooner than perfecting on paper.' },

  /* ── batch 4 ─────────────────────────────────────────────────────── */

  // 継続 consistency
  { t:'consistency', jp:'才能は開始の速さ、継続は到達の遠さを決める。長距離を制するのは、いつも後者だ。', en:'Talent sets your start; consistency sets how far you reach. The long race belongs to the latter.' },
  { t:'consistency', jp:'一週間サボっても、やめなければ失敗ではない。復帰した日が、また一日目になる。', en:'A skipped week isn’t failure if you don’t quit. The day you return is day one again.' },
  { t:'consistency', jp:'目立たない努力を続けられるか。拍手のない場所での積み重ねが、本当の差を作る。', en:'Can you sustain unglamorous effort? Stacking reps where no one claps makes the real difference.' },
  { t:'consistency', jp:'今日の1時間を、未来への振り込みだと思え。続けた口座だけが、いつか大きく引き出せる。', en:'Treat today’s hour as a deposit. Only the account you kept funding pays out big later.' },
  { t:'consistency', jp:'毎日やると決めたことは、歯磨きのレベルまで落とせ。考える隙をなくすと、続く。', en:'Drop your daily task to the level of brushing teeth. Remove the room to deliberate and it sticks.' },
  { t:'consistency', jp:'伸び悩みは、継続している証拠だ。始めたばかりの人は、伸び悩む場所にすら立てない。', en:'A plateau proves you kept going. Beginners never even reach the place where you plateau.' },

  // 連絡 communication
  { t:'communication', jp:'関係は一通では作れないが、一通も送らなければ絶対に作れない。まず一通目を送れ。', en:'One email won’t build a relationship, but zero guarantees none. Send the first one.' },
  { t:'communication', jp:'返信の有無に一喜一憂するな。送ることは自分の責任、返すかは相手の自由だ。', en:'Don’t ride the ups and downs of replies. Sending is your job; replying is their freedom.' },
  { t:'communication', jp:'季節の節目に近況を送れ。シーズン開始、終了、長期休み。自然な口実は年に何度もある。', en:'Send updates at seasonal turns — start, end, breaks. Natural excuses come several times a year.' },
  { t:'communication', jp:'相手の負担を減らす一文を添えよ。「ご返信不要です」が、かえって信頼を生むこともある。', en:'Add a line that eases their load. “No reply needed” sometimes builds more trust.' },
  { t:'communication', jp:'メールは資産だ。丁寧に積み上げたやり取りが、いつか推薦や紹介という形で返ってくる。', en:'Correspondence is an asset. Carefully built threads return one day as a recommendation or referral.' },
  { t:'communication', jp:'伝えたいことより、相手が知りたいことを先に書け。視点を変えるだけで、返信率は上がる。', en:'Lead with what they want to know, not what you want to say. The shift alone raises replies.' },
  { t:'communication', jp:'一度きりの豪華なメールより、短くても続くやり取り。関係は、頻度で温まる。', en:'A short ongoing exchange beats one lavish email. Relationships warm through frequency.' },

  // 露出 exposure
  { t:'exposure', jp:'見せる相手を選べ。自分のレベルと志向に合うプログラムに、狙いを定めた露出を。', en:'Choose who sees you. Aim your exposure at programs that fit your level and goals.' },
  { t:'exposure', jp:'映像は「証拠」であって「宣伝」ではない。誇張より、正確さがコーチの信頼を勝ち取る。', en:'Film is evidence, not advertising. Accuracy over hype wins a coach’s trust.' },
  { t:'exposure', jp:'露出の場では、うまくいかない時ほど見られている。崩れない姿が、最大のアピールになる。', en:'At showcases you’re watched most when things go wrong. Composure is the biggest pitch.' },
  { t:'exposure', jp:'一つの舞台に全てを賭けるな。複数の機会を持つ者が、一度の不調に潰されない。', en:'Don’t bet everything on one stage. Those with multiple chances survive a single off day.' },
  { t:'exposure', jp:'自分の映像を、他人の目で見返せ。3秒で魅力が伝わるか。伝わらなければ、編集を直せ。', en:'Watch your film as a stranger would. Does the appeal land in three seconds? If not, re-edit.' },
  { t:'exposure', jp:'露出はゴールではなく入口だ。見てもらった後にどう動くかで、機会が実になるかが決まる。', en:'Exposure is an entrance, not a finish. What you do after being seen decides if it bears fruit.' },

  // 決断 decision
  { t:'decision', jp:'決められないのは、情報不足か基準不足のどちらかだ。まず、どちらが欠けているかを見極めよ。', en:'Indecision comes from missing information or missing criteria. First identify which you lack.' },
  { t:'decision', jp:'「全部欲しい」は戦略ではない。何を得るために何を手放すかを決めるのが、大人の選択だ。', en:'“I want it all” isn’t a strategy. Choosing what to give up for what to gain is the grown-up call.' },
  { t:'decision', jp:'興奮している時と冷めている時、両方で同じ結論なら、それは本物だ。', en:'If you reach the same conclusion when excited and when calm, it’s real.' },
  { t:'decision', jp:'現地の空気は、パンフレットに載っていない情報を教えてくれる。可能な限り足を運べ。', en:'The air on campus tells you what no brochure can. Go in person whenever possible.' },
  { t:'decision', jp:'名門のベンチより、成長できる先発。若い時間は、試合の中でしか磨かれない。', en:'A starting role for growth beats a benched seat at a powerhouse. Young years sharpen only in games.' },
  { t:'decision', jp:'決断の前に、最悪の場合を紙に書け。多くの恐れは、言語化した瞬間に耐えられる大きさに縮む。', en:'Before deciding, write the worst case down. Most fears shrink to bearable once named.' },

  // 規律 discipline
  { t:'discipline', jp:'やる気は天気、規律は気候だ。日々の天気に振り回されず、長期の気候を整えよ。', en:'Motivation is weather; discipline is climate. Don’t be ruled by the day — shape the season.' },
  { t:'discipline', jp:'基礎練習を退屈だと切り捨てる者から、崩れていく。土台に飽きない者が、長く立つ。', en:'Those who dismiss the basics as boring crumble first. Those who don’t tire of the base stand longest.' },
  { t:'discipline', jp:'始める前に道具と場所を整えておけ。摩擦をなくすほど、行動は起きやすくなる。', en:'Set up your gear and space in advance. The less friction, the easier action becomes.' },
  { t:'discipline', jp:'数字で自分に嘘をつくな。ノートに残した記録だけが、感覚の甘えを正してくれる。', en:'Don’t lie to yourself with vibes. Only the written log corrects the flattery of feel.' },
  { t:'discipline', jp:'「明日から本気」を今日で終わらせろ。最良の開始日は、いつだって今日だ。', en:'End the “serious from tomorrow” loop today. The best start date is always today.' },
  { t:'discipline', jp:'集中力は筋肉だ。短く区切って鍛えれば、長く保てるようになる。', en:'Focus is a muscle. Train it in short blocks and it holds longer over time.' },

  // メンタル mindset
  { t:'mindset', jp:'才能を疑う日があってもいい。それでも現れる自分こそ、本当の実力だ。', en:'It’s fine to doubt your talent some days. The you who shows up anyway is your real ability.' },
  { t:'mindset', jp:'嫉妬を感じたら、それは自分が本当に欲しいものを教えてくれている。方向を、燃料に変えろ。', en:'Envy points at what you truly want. Turn the direction into fuel.' },
  { t:'mindset', jp:'緊張する場面は、成長のチャンスが来たという合図だ。逃げずに、その中に立て。', en:'A nerve-wracking moment signals a growth chance has arrived. Don’t flee — stand inside it.' },
  { t:'mindset', jp:'一敗は物語の一行であって、最終章ではない。ページをめくる権利は、まだ自分にある。', en:'One loss is a line, not the last chapter. You still hold the right to turn the page.' },
  { t:'mindset', jp:'感謝できることを毎晩3つ思い出せ。視点が変わると、同じ状況でも見える景色が変わる。', en:'Recall three things to be grateful for each night. A shift in view changes the same scene.' },
  { t:'mindset', jp:'早咲きも遅咲きも、咲けば同じ花だ。自分の季節を信じて、根を張り続けろ。', en:'Early or late bloom, a bloom is a bloom. Trust your season and keep rooting.' },
  { t:'mindset', jp:'恐れを消そうとするな。恐れを抱えたまま前に進む練習を積め。それが本当の強さだ。', en:'Don’t try to erase fear. Practice moving forward while carrying it — that’s true strength.' },
  { t:'mindset', jp:'結果はコントロールできない。しかし、次の一球への準備は、いつでも自分の手の中にある。', en:'You can’t control the outcome. But preparing for the next pitch is always in your hands.' },
  { t:'mindset', jp:'自分に厳しくていい。ただし、公平であれ。長所を数える時間も、同じだけ自分に与えよ。', en:'Be hard on yourself, but be fair. Give equal time to counting your strengths.' },

  // 学業 academics
  { t:'academics', jp:'学業の遅れは、競技のオファーを一瞬で無効にする。文武は、片方だけでは成立しない。', en:'Academic gaps can void an athletic offer instantly. Sport and study don’t stand on one leg.' },
  { t:'academics', jp:'英語の勉強を、義務ではなく武器だと捉え直せ。話せる分だけ、行ける場所が広がる。', en:'Reframe English study as a weapon, not a chore. The more you speak, the farther you can go.' },
  { t:'academics', jp:'定期テストごとに小さな目標を立てよ。学期の積み重ねが、卒業時の選択肢を決める。', en:'Set a small goal each exam period. Term-by-term buildup decides your options at graduation.' },
  { t:'academics', jp:'成績表は、努力の継続を証明する第二のスタッツだ。数字で誠実さを語れ。', en:'A transcript is a second stat line proving sustained effort. Let numbers speak your diligence.' },
  { t:'academics', jp:'必要書類のリストを早めに作れ。締め切り前夜に慌てる選手は、実力以前で機会を失う。', en:'List required documents early. Those scrambling the night before lose chances before skill even counts.' },

  // 計画 process
  { t:'process', jp:'夢に締め切りを与えろ。日付のない願いは、いつまでも「いつか」のまま漂う。', en:'Give your dream a deadline. A wish without a date drifts as “someday” forever.' },
  { t:'process', jp:'今日の3手を、前夜に決めておけ。朝の意思力を、選択ではなく実行に使え。', en:'Decide today’s three moves the night before. Spend morning willpower on doing, not choosing.' },
  { t:'process', jp:'計画は地図であって、鎖ではない。状況が変われば、迷わず引き直せ。', en:'A plan is a map, not a chain. When conditions change, redraw it without guilt.' },
  { t:'process', jp:'進んでいる実感が欲しければ、完了リストを見返せ。人は、残りばかり見て自分を過小評価する。', en:'Want to feel progress? Review your done list. We undervalue ourselves by staring only at what remains.' },
  { t:'process', jp:'一つの大きな行動より、10の小さな行動に割れ。着手のハードルが下がれば、必ず動き出す。', en:'Split one big action into ten small ones. Lower the start bar and motion follows.' },
  { t:'process', jp:'週末に5分、今週を採点せよ。振り返る習慣が、同じ轍を踏ませない。', en:'Spend five weekend minutes grading your week. The review habit keeps you off the same rut.' },
  { t:'process', jp:'最も重要な一手を、毎朝最初に片づけろ。一日の勝敗は、たいてい午前中に決まる。', en:'Clear your single most important move first each morning. The day is usually won before noon.' },
  { t:'process', jp:'計画の目的は、迷いを減らすことだ。次に何をするか悩まない状態こそ、良い計画の証拠だ。', en:'A plan exists to reduce hesitation. Never wondering what’s next is the sign of a good one.' },

  /* ── batch 5 (completes a full year, 365) ────────────────────────── */

  // 継続 consistency
  { t:'consistency', jp:'今日の自分に、未来の自分を裏切らせるな。積んだ一日は、必ず誰かの記憶に残る。', en:'Don’t let today’s you betray future you. A day stacked always lands in someone’s memory.' },
  { t:'consistency', jp:'才能あふれる三日坊主より、平凡な継続者。長い勝負では、後者しか生き残らない。', en:'A plain finisher beats a gifted quitter. In the long game, only the former survives.' },
  { t:'consistency', jp:'意欲が落ちた日は、量ではなく「触れる」ことを目標にせよ。ゼロを避ければ、鎖は続く。', en:'On low-drive days, aim to “touch it,” not to hit volume. Avoid zero and the chain holds.' },
  { t:'consistency', jp:'昨日の努力が今日実らなくても焦るな。種と収穫の間には、必ず時差がある。', en:'Don’t panic if yesterday’s work hasn’t paid yet. There’s always a lag between seed and harvest.' },
  { t:'consistency', jp:'習慣は、モチベーションが留守の日に代わりを務めてくれる。だから習慣を先に作れ。', en:'Habits cover for motivation on the days it’s out. So build the habit first.' },
  { t:'consistency', jp:'毎日同じ場所で練習しろ。環境が引き金になり、考える前に体が動き出す。', en:'Train in the same spot daily. The place becomes a trigger and the body starts before the mind.' },
  { t:'consistency', jp:'一年続けた人にしか見えない景色がある。途中でやめた人には、その存在すら分からない。', en:'There’s a view only a year of persistence reveals. Quitters never even learn it exists.' },

  // 連絡 communication
  { t:'communication', jp:'コーチとの関係は、営業に似ている。押しすぎず、消えすぎず、適切な間合いを保て。', en:'A coach relationship is like sales — not too pushy, not too absent. Hold the right distance.' },
  { t:'communication', jp:'返信が遅れたら、正直に一言添えて謝れ。誠実な対応は、遅れそのものより印象に残る。', en:'If you reply late, own it with a brief apology. Honesty outshines the delay itself.' },
  { t:'communication', jp:'メールの目的を一つに絞れ。あれもこれも詰め込むと、結局どれも伝わらない。', en:'Give each email one purpose. Cram in everything and nothing gets through.' },
  { t:'communication', jp:'良い知らせは即共有せよ。新記録も、表彰も、リアルタイムだからこそ価値が最大になる。', en:'Share good news immediately. A record or award is worth most in real time.' },
  { t:'communication', jp:'相手を主役にする一文を入れろ。「貴校の育成方針に惹かれています」は、自分語りに勝る。', en:'Include a line that centers them. “I admire your development philosophy” beats talking about yourself.' },

  // 露出 exposure
  { t:'exposure', jp:'実力は、見せて初めて実力になる。しまい込んだ才能は、存在しないのと同じだ。', en:'Ability becomes ability only when shown. Talent kept hidden may as well not exist.' },
  { t:'exposure', jp:'撮影は定点で、明るい場所で。基本的な見やすさが、内容の評価を左右する。', en:'Film from a fixed angle in good light. Basic watchability shapes how the content is judged.' },
  { t:'exposure', jp:'露出の場では、自己紹介を10秒で言えるようにしておけ。準備した一言が、次に繋がる。', en:'At events, be able to introduce yourself in ten seconds. A prepared line opens the next door.' },
  { t:'exposure', jp:'一度の失敗を隠すな。むしろ、そこからの立て直しを見せろ。それが本当の売りだ。', en:'Don’t hide a failure — show the recovery from it. That’s the real selling point.' },
  { t:'exposure', jp:'露出のたびに、次に見せたい姿を一つ決めろ。目的のある出場が、成長を加速させる。', en:'Each time you’re seen, pick one thing to show next. Purposeful appearances accelerate growth.' },
  { t:'exposure', jp:'量をこなす前に、狙いを定めよ。10の的外れより、1の的確な露出が扉を開く。', en:'Aim before you pile up volume. One well-targeted showing beats ten scattered ones.' },
  { t:'exposure', jp:'見られている意識は、緊張ではなく集中に使え。注目は、最高の自分を引き出す装置だ。', en:'Channel being watched into focus, not tension. Attention is a device that draws out your best.' },

  // 決断 decision
  { t:'decision', jp:'決断とは、可能性を捨てる痛みを引き受けることだ。捨てられる者だけが、深く進める。', en:'To decide is to accept the pain of discarding possibilities. Only those who can cut go deep.' },
  { t:'decision', jp:'迷いの99%は、基準が曖昧なだけだ。何を最優先するかを、まず言葉にせよ。', en:'Ninety-nine percent of dithering is fuzzy criteria. First put your top priority into words.' },
  { t:'decision', jp:'甘い言葉より、実際の待遇と実績を見よ。恋は盲目だが、契約は現実だ。', en:'Weigh real treatment and track record over sweet words. Love is blind; the deal is reality.' },
  { t:'decision', jp:'訪問できないなら、在校生や卒業生に話を聞け。内側の声は、公式サイトより正直だ。', en:'If you can’t visit, talk to current or former players. Inside voices are more honest than a website.' },
  { t:'decision', jp:'肩書に惚れるな、環境に惚れろ。4年間を過ごすのは、名前ではなく日々の練習場だ。', en:'Fall for the environment, not the title. You’ll spend four years in the practice field, not the name.' },
  { t:'decision', jp:'決めたら、振り返って比べ続けるな。選んだ道に集中する力が、結果を最良に近づける。', en:'Once decided, stop looking back to compare. Focus on the chosen road brings the best outcome.' },
  { t:'decision', jp:'最悪を想定し、最善を目指せ。両方を準備した決断だけが、現実の揺れに耐える。', en:'Plan for the worst, aim for the best. Only decisions ready for both survive reality’s shake.' },
  { t:'decision', jp:'選択に「正解」はない。あるのは、選んだ後にそれを正解にしていく行動だけだ。', en:'There’s no “right” choice — only the action that makes your choice right afterward.' },

  // 規律 discipline
  { t:'discipline', jp:'自由は、規律の向こう側にある。今の制約が、将来の選択肢を増やすと知れ。', en:'Freedom lies on the far side of discipline. Today’s constraint multiplies tomorrow’s options.' },
  { t:'discipline', jp:'体のケアをサボるな。動ける体こそ、全ての努力を積む土台だ。', en:'Don’t skip body care. A body that moves is the base on which all effort stacks.' },
  { t:'discipline', jp:'練習を始める儀式を持て。同じ準備運動が、集中モードへのスイッチになる。', en:'Have a ritual to start practice. The same warm-up becomes a switch into focus mode.' },
  { t:'discipline', jp:'サボりたい日の自分を、あらかじめ想定しておけ。対策を用意した誘惑は、力を失う。', en:'Anticipate the you who’ll want to skip. Temptation you’ve planned for loses its power.' },
  { t:'discipline', jp:'時間を守る小さな信用が、いつか大きな機会を運んでくる。約束は、実力の一部だ。', en:'The small trust of punctuality one day carries a big opportunity. Reliability is part of your skill.' },
  { t:'discipline', jp:'集中を乱すものを、机から物理的に離せ。距離が、意志の弱さを補ってくれる。', en:'Physically move distractions off your desk. Distance covers for weak willpower.' },
  { t:'discipline', jp:'完璧な一日を狙って崩れるより、80点の一日を積め。継続に必要なのは強度より頻度だ。', en:'Stack 80-point days instead of collapsing chasing perfect ones. Frequency, not intensity, sustains.' },
  { t:'discipline', jp:'記録を毎晩1分でつけろ。振り返れる仕組みが、翌日の自分を賢くする。', en:'Log one minute each night. A system you can review makes tomorrow’s you smarter.' },

  // メンタル mindset
  { t:'mindset', jp:'誰かになろうとするな。あなたにしか歩めない道が、必ずどこかにある。', en:'Don’t try to become someone else. A path only you can walk exists somewhere.' },
  { t:'mindset', jp:'落ち込む力があるのは、真剣な証拠だ。その情熱を、次の行動に向け直せ。', en:'The capacity to feel low proves you care. Redirect that passion into the next action.' },
  { t:'mindset', jp:'不安な夜は、明日できる小さな一手を一つ決めて眠れ。行動の予定が、心を鎮める。', en:'On anxious nights, decide one small move for tomorrow before sleep. A plan calms the mind.' },
  { t:'mindset', jp:'一度の拒絶を、自分の物語の結論にするな。断りは、ただの一つの意見にすぎない。', en:'Don’t make one rejection your story’s conclusion. A no is just one opinion.' },
  { t:'mindset', jp:'自分がどれだけ来たかを、時々振り返れ。始めた頃の自分は、今のあなたに憧れている。', en:'Look back sometimes at how far you’ve come. The you who started admires who you are now.' },
  { t:'mindset', jp:'焦る心には、「まだ途中だ」と言い聞かせろ。完成していないのは、失敗ではなく過程だ。', en:'Tell an impatient heart, “still in progress.” Unfinished is process, not failure.' },
  { t:'mindset', jp:'勇気は、才能ではなく習慣だ。小さな一歩を踏むたびに、次の一歩が軽くなる。', en:'Courage is a habit, not a gift. Each small step makes the next one lighter.' },
  { t:'mindset', jp:'結果に囚われた瞬間、プレーは硬くなる。過程に戻れば、体は自然に動き出す。', en:'The moment you fixate on outcome, play stiffens. Return to process and the body flows.' },
  { t:'mindset', jp:'自分を励ます言葉を、自分で用意しておけ。誰も見ていない時、それが最後の支えになる。', en:'Prepare your own words of encouragement. When no one’s watching, they’re the last support.' },
  { t:'mindset', jp:'今日の小さな勇気が、明日の当たり前になる。挑戦は、繰り返すほど怖くなくなる。', en:'Today’s small courage becomes tomorrow’s normal. Challenges scare less the more you repeat them.' },

  // 学業 academics
  { t:'academics', jp:'学業は、競技を続けるための入場券だ。券がなければ、どんな実力も入口で止められる。', en:'Academics are the ticket to keep competing. Without it, any talent is stopped at the door.' },
  { t:'academics', jp:'英語は毎日触れるほど、恐れが減る。慣れは、才能ではなく接触時間から生まれる。', en:'The more daily English, the less the fear. Fluency comes from contact time, not talent.' },
  { t:'academics', jp:'テスト日程から逆算して勉強を配れ。一夜漬けは、競技の一夜漬けと同じくらい効かない。', en:'Distribute study by working back from test dates. Cramming works as poorly here as in sport.' },
  { t:'academics', jp:'良い成績は、静かな自己PRだ。「継続して努力できる人間」だと、数字が代わりに語る。', en:'Good grades are a quiet pitch. The numbers say “I sustain effort” for you.' },
  { t:'academics', jp:'必要書類を早めに揃える選手は、締め切りに追われる選手より、常に一歩前にいる。', en:'Those who gather documents early always stand a step ahead of the deadline-chased.' },
  { t:'academics', jp:'英会話の失敗を、恥ではなく授業料だと思え。間違えた分だけ、確実に上達している。', en:'Treat spoken-English mistakes as tuition, not shame. Each one is measurable progress.' },
  { t:'academics', jp:'文と武は、時間の奪い合いではなく、互いを支える両輪だ。片方の規律が、もう片方を育てる。', en:'Study and sport aren’t rivals for time but wheels that support each other. Discipline in one grows the other.' },

  // 計画 process
  { t:'process', jp:'大きな目標を、今週の一行に落とせ。抽象は、具体になった瞬間から動き始める。', en:'Reduce the big goal to one line this week. The abstract starts moving the instant it turns concrete.' },
  { t:'process', jp:'計画に「やらないこと」を書け。捨てる勇気が、限られた時間を守ってくれる。', en:'Write a “not doing” list into your plan. The courage to cut protects your limited time.' },
  { t:'process', jp:'進捗が見えないと、人は続けられない。だから、小さな達成を意図的に可視化せよ。', en:'People can’t persist without visible progress. So deliberately make small wins visible.' },
  { t:'process', jp:'計画は、崩れることを前提に立てよ。修正を織り込んだ計画だけが、現実を生き延びる。', en:'Plan on the assumption it breaks. Only plans with revision built in survive reality.' },
  { t:'process', jp:'毎週、たった一つでいい。「先週より良くする点」を決めれば、一年で50回改善できる。', en:'Just one per week: “what to improve over last week” yields fifty upgrades a year.' },
  { t:'process', jp:'次の一手を、常に一つだけ明確にしておけ。迷いのない状態が、最速の前進を生む。', en:'Always keep exactly one next move clear. A state without hesitation drives the fastest progress.' },
  { t:'process', jp:'計画とは、未来の自分への指示書だ。今日、迷わないための地図を、自分で描いておけ。', en:'A plan is instructions to future you. Draw the map today so you won’t be lost tomorrow.' },

  // 締め (365 完成)
  { t:'academics', jp:'学ぶ姿勢は、グラウンドの外でも見られている。教室での誠実さが、人物評価を静かに支える。', en:'Your posture as a learner is seen off the field too. Classroom sincerity quietly backs your character.' },
  { t:'academics', jp:'英語も競技も、伸びる原理は同じだ。毎日少し、正しい方法で、長く続けること。', en:'English and sport grow by the same law: a little daily, done right, for a long time.' },
  { t:'exposure', jp:'見せ方を磨くのは、ごまかしではない。正しく伝える努力もまた、実力のうちだ。', en:'Polishing how you present isn’t faking. The effort to convey accurately is part of ability too.' },
  { t:'mindset', jp:'今日という一日は、二度と来ない練習日だ。だからこそ、悔いのない一歩を選べ。', en:'Today is a practice day that never returns. So choose a step you won’t regret.' },

];
