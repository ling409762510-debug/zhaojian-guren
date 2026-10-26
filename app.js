(() => {
  'use strict';
  const { questions, report, actions, closing, sources } = window.ARCHIVE;
  const app = document.getElementById('app');
  // 固定口令仅限制网页入口，不能代替服务端付费授权。
  const accessHash = 'd848d3ae5473fa93392cf33ef27d0fe05cdedf65cbb30ce45630d80ff60df268';
  const accessKey = 'zhaojian-access-v1';
  let unlocked = false;
  try { unlocked = sessionStorage.getItem(accessKey) === accessHash; } catch {}
  function accessGate() {
    app.innerHTML = `<section class="access-page fade-in"><div class="access-art"><img src="${window.PORTRAIT}" alt="李清照艺术想象画像"><span class="seal">照见</span></div><div class="access-copy"><div class="eyebrow">照见古人 · 入卷凭笺</div><h1>你的故事，<br>从这一笺开始。</h1><p class="scene">输入测试码，翻开六个生活片刻，<br>读一份关于敏锐与自持的档案。</p><form id="access-form"><label for="access-code">测试码</label><input id="access-code" name="code" type="password" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="64" required placeholder="请输入你收到的测试码" aria-describedby="access-message"><p id="access-message" role="status" aria-live="polite">不区分大小写，请保留码中的连字符。</p><button class="button primary" type="submit">验证并进入　↗</button></form><p class="small-note">体验样板 · 固定李清照示例报告<br>历史人物主题的趣味自我探索，非专业心理测评。<br>还没有测试码？请向提供本链接的人获取。</p></div></section>`;
  }
  app.addEventListener('submit', async e => {
    if (e.target.id !== 'access-form') return;
    e.preventDefault();
    const field = document.getElementById('access-code');
    const message = document.getElementById('access-message');
    const submit = e.target.querySelector('button');
    const code = field.value.trim().toUpperCase();
    if (!code) { message.textContent = '请先输入测试码。'; field.focus(); return; }
    submit.disabled = true;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('');
      if (hash !== accessHash) {
        field.setAttribute('aria-invalid','true');
        message.textContent = '测试码不正确，请核对后重试。';
        field.focus();
        return;
      }
      unlocked = true;
      try { sessionStorage.setItem(accessKey, accessHash); } catch {}
      field.value = '';
      route();
    } catch {
      message.textContent = '验证暂不可用，请用最新版浏览器打开 HTTPS 网页后重试。';
    } finally { submit.disabled = false; }
  });
  const key = 'zhaojian-sample-v1';
  let storageOK = true;
  let state = { answers: Array(questions.length).fill(null), index: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && Array.isArray(saved.answers) && saved.answers.length === questions.length && saved.answers.every(a => a === null || (Number.isInteger(a) && a >= 0 && a < 4)) && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < questions.length) state = saved;
  } catch { storageOK = false; }
  const persist = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { storageOK = false; } };
  const complete = () => state.answers.every(a => a !== null);
  const button = (text, action, primary = false) => `<button class="button ${primary ? 'primary' : ''}" data-action="${action}">${text}</button>`;
  const portrait = (cls = '') => `<img class="${cls}" src="${window.PORTRAIT}" alt="李清照艺术想象画像：身着淡青衣袍，手持书册，身旁有梅枝">`;
  function home() {
    const started = state.answers.some(a => a !== null);
    app.innerHTML = `<section class="hero fade-in"><div class="hero-copy"><div class="eyebrow">一面来自历史的镜子</div><h1>如果走进历史，<br>你会与谁<em>相似</em>？</h1><p class="hero-desc">把自己放进六个古代生活片刻。<br>在你的取舍之间，读懂那些未曾说清的在意。</p><div class="hero-meta"><span><strong>06</strong> 道情境题<br>无需历史知识</span><span><strong>一</strong> 份人物档案<br>看见优势与代价</span><span><strong>一</strong> 张收藏卡<br>留住此刻的共鸣</span></div><div class="hero-actions">${button(started ? '继续我的体验　↗' : '翻开我的档案　↗','start',true)}<button class="text-button" data-action="report">先读示例报告</button></div><p class="small-note">体验样板：答题后展示固定的李清照示例报告，暂不进行人物匹配。答案仅保存在当前浏览器。</p>${started ? '<button class="text-button" data-action="reset">清空记录，重新体验</button>' : ''}</div><div class="hero-art">${portrait()}<div class="art-label">一卷风雅，一寸自心<small>人物志 · 李清照</small></div><div class="art-foot"><span>原创艺术想象画像 · 非历史肖像复原</span><span class="seal">易安</span></div></div></section><section class="collection-strip"><div><span>壹</span><div><h3>选择你的真实反应</h3><p>没有标准答案，也不必选一个更好的自己。</p></div></div><div><span>贰</span><div><h3>让性格拥有细节</h3><p>从表达、关系与取舍，读到具体的生活。</p></div></div><div><span>叁</span><div><h3>带走一点新的理解</h3><p>保留优势，也看见它偶尔让你付出的代价。</p></div></div></section>`;
  }
  function quiz() {
    const i = state.index, q = questions[i], selected = state.answers[i];
    app.innerHTML = `<section class="page fade-in"><div class="page-top"><button class="text-button" data-action="home">← 返回书房</button><span>情境体验 · ${String(i + 1).padStart(2,'0')} / 06</span></div><div class="progress-track" role="progressbar" aria-label="已完成题目" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${state.answers.filter(a=>a!==null).length}"><span style="width:${state.answers.filter(a=>a!==null).length / 6 * 100}%"></span></div><div class="question-sheet"><div class="chapter">${q.chapter}</div><h1 id="question-title" tabindex="-1">${q.title}</h1><p class="scene">${q.scene}</p><div class="options" role="group" aria-labelledby="question-title">${q.options.map((o,j)=>`<button class="option ${selected===j?'selected':''}" data-option="${j}" aria-pressed="${selected===j}"><span class="option-letter">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div><div class="question-nav"><button class="button" data-action="previous" ${i===0?'disabled':''}>← 上一笺</button><button class="button primary" data-action="next" ${selected===null?'disabled':''}>${i===5?'回看我的选择':'下一笺'} →</button></div></div><p class="hint">选择后再翻页 · 可以返回修改 · 没有标准答案</p>${!storageOK?'<p class="storage-note">当前浏览器无法保存进度，请在本页完成体验。</p>':''}</section>`;
  }
  function review() {
    if (!complete()) { state.index = state.answers.findIndex(a=>a===null); persist(); navigate('quiz'); return; }
    app.innerHTML = `<section class="page fade-in"><div class="eyebrow">六笺已阅 · 留一刻给自己</div><h1 class="review-title">这些选择，<br>是你此刻的回答。</h1><p class="scene">先回望一下：哪些选择很笃定，哪些让你犹豫？<br>犹豫的地方，也许正藏着你同时珍惜的两件事。</p><ol class="review-list">${questions.map((q,i)=>`<li><div><small>${q.chapter}</small><p>${q.options[state.answers[i]]}</p></div><button class="text-button" data-edit="${i}" aria-label="修改第${i+1}题">修改</button></li>`).join('')}</ol><div class="notice"><strong>接下来是一份示例，不是匹配结论。</strong><br>本样板固定展示李清照「敏锐与自持」报告。你的回答已如实列在上方，尚未用于人物计分。阅读时，请保留认同的部分，也允许自己不同。</div><button class="button primary review-cta" data-action="report">翻开李清照示例档案　↗</button><p class="hint">历史人物主题的趣味自我探索，非专业心理测评。</p></section>`;
  }
  function renderReport() {
    app.innerHTML = `<article class="report fade-in"><div class="page-top"><button class="text-button" data-action="${complete()?'review':'home'}">← ${complete()?'回看我的选择':'返回书房'}</button><span>档案 NO.001 · 示例报告</span></div><section class="report-cover"><div class="report-portrait">${portrait()}<div class="art-foot"><span>原创艺术想象画像</span><span class="seal">易安</span></div></div><div class="report-cover-copy"><div class="eyebrow">照见古人 · 人物收藏档案</div><h1>李清照</h1><p class="report-subtitle">宋代词人 · 号易安居士</p><h2 class="report-theme">敏锐与自持</h2><div class="tags"><span>细腻感知</span><span>审美自觉</span><span>内在尺度</span></div><p class="cover-quote">把感受留给文字，<br>把分寸留给自己。</p><p class="small-note">原创解读语 · 非古人名言<br>固定示例报告，不代表本次答题的匹配结果。</p></div></section><div class="report-layout"><nav class="report-nav" aria-label="报告章节">${report.map((s,i)=>`<a href="#section-${i}">${s.label}</a>`).join('')}<a href="#practice">07 / 给自己的练习</a><a href="#sources">史料与解读说明</a></nav><div class="report-body">${report.map((s,i)=>`<section class="report-section" id="section-${i}"><div class="chapter">${s.label}</div><h2>${s.title}</h2>${s.paragraphs.map(p=>`<p>${p}</p>`).join('')}${s.source?'<p class="source-link">史料依据：《金石录后序》 · <a href="#sources">查看出处与说明 ↗</a></p>':''}</section>`).join('')}<section class="report-section" id="practice"><div class="chapter">07 / 给自己的练习</div><h2>从一件小事，慢慢开始。</h2><div class="actions-list">${actions.map((a,i)=>`<div class="action-item"><span>0${i+1}</span><div><h3>${a.title}</h3><p>${a.text}</p></div></div>`).join('')}</div></section><section class="closing"><div class="chapter">卷末 · 留白</div><h2>细腻可贵，你也一样。</h2><p>${closing}</p></section><div class="report-buttons">${button('收藏我的示例人物卡　↓','share',true)}<button class="text-button" data-action="home">返回首页</button><button class="text-button" data-action="reset">清空记录，重新体验</button></div><details class="sources" id="sources"><summary>查看史料出处与解读边界</summary><p>历史事实主要见第二节，其余为原创的现代生活观察与自我对照建议，并非史料结论。未对古人进行心理测评，也未从六道题推断你的完整人格。不认同的部分，无需勉强套用。</p><ul>${sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a><br>${s.note}</li>`).join('')}</ul><p>本页画像为 AI 辅助创作的艺术想象，不代表李清照的真实容貌。历史人物主题的趣味自我探索，非专业心理测评。</p></details></div></div></article>`;
  }
  function route() {
    if (!unlocked) { accessGate(); window.scrollTo(0,0); return; }
    const hash = location.hash.slice(1) || 'home';
    if (hash.startsWith('section-') || ['practice','sources'].includes(hash)) {
      renderReport();
      requestAnimationFrame(()=>document.getElementById(hash)?.scrollIntoView());
      return;
    }
    ({home, quiz, review, report:renderReport}[hash] || home)();
    window.scrollTo(0,0);
  }
  function navigate(page) { if (location.hash === '#' + page) route(); else location.hash = page; }
  app.addEventListener('click', e => {
    if (!unlocked) return;
    const target = e.target.closest('button'); if (!target) return;
    if (target.dataset.option !== undefined) {
      state.answers[state.index] = Number(target.dataset.option); persist();
      app.querySelectorAll('[data-option]').forEach(b => { const on = b === target; b.classList.toggle('selected',on); b.setAttribute('aria-pressed',String(on)); });
      app.querySelector('[data-action="next"]').disabled = false;
      const count = state.answers.filter(a=>a!==null).length;
      const track = app.querySelector('[role="progressbar"]'); track.setAttribute('aria-valuenow',count); track.firstElementChild.style.width = `${count/6*100}%`;
      return;
    }
    if (target.dataset.edit !== undefined) { state.index = Number(target.dataset.edit); persist(); navigate('quiz'); return; }
    switch (target.dataset.action) {
      case 'start': if(complete()) navigate('review'); else {state.index=state.answers.findIndex(a=>a===null);persist();navigate('quiz');} break;
      case 'next': if(state.answers[state.index]===null)return; if(state.index===5)navigate('review');else {state.index++;persist();quiz();window.scrollTo(0,0);document.getElementById('question-title').focus({preventScroll:true});} break;
      case 'previous': if(state.index>0){state.index--;persist();quiz();window.scrollTo(0,0);document.getElementById('question-title').focus({preventScroll:true});}break;
      case 'reset': state={answers:Array(6).fill(null),index:0};persist();navigate('quiz');break;
      case 'share': showShare(target);break;
      default: if(['home','review','report'].includes(target.dataset.action))navigate(target.dataset.action);
    }
  });
  // 本地画像以 data URL 装载，file:// 打开时也可安全导出画布。
  let cardURL, downloadURL;
  async function makeCard() {
    if (cardURL) return cardURL;
    const img = new Image(); img.src = window.PORTRAIT; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width=1080;canvas.height=1440;
    const c=canvas.getContext('2d');
    c.fillStyle='#f5f0e6';c.fillRect(0,0,1080,1440);
    c.strokeStyle='#c7b99f';c.lineWidth=2;c.strokeRect(40,40,1000,1360);
    c.fillStyle='#a44432';c.font='30px "Microsoft YaHei", sans-serif';c.fillText('照见古人',80,108);
    c.fillStyle='#6c7065';c.font='20px "Microsoft YaHei", sans-serif';c.textAlign='right';c.fillText('人物志 · NO.001 / 示例',1000,104);c.textAlign='left';
    // 保留完整画像比例，不裁掉人物头部与衣袖。
    const h=790,w=h*img.width/img.height;
    c.drawImage(img,(1080-w)/2,145,w,h);
    c.fillStyle='#2b3732';c.textAlign='center';c.font='64px SimSun, "Songti SC", serif';c.fillText('李 清 照',540,1025);
    c.font='32px SimSun, "Songti SC", serif';c.fillText('敏锐与自持',540,1085);
    c.strokeStyle='#d6cbb7';c.beginPath();c.moveTo(200,1115);c.lineTo(880,1115);c.stroke();
    c.fillStyle='#6c7065';c.font='24px "Microsoft YaHei", sans-serif';c.fillText('细腻感知　 /　 审美自觉　 /　 内在尺度',540,1160);
    c.fillStyle='#a44432';c.font='32px SimSun, "Songti SC", serif';c.fillText('把感受留给文字，把分寸留给自己。',540,1235);
    c.fillStyle='#6c7065';c.font='19px "Microsoft YaHei", sans-serif';c.fillText('原创解读语 · 非古人名言 ｜ 画像为艺术想象',540,1290);
    c.font='18px "Microsoft YaHei", sans-serif';c.fillText('固定示例人物卡 · 非答题匹配结果 · 非专业心理测评',540,1350);
    cardURL=canvas.toDataURL('image/png');
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw new Error('图片导出失败');
    downloadURL=URL.createObjectURL(blob);
    return cardURL;
  }
  async function showShare(trigger) {
    trigger.disabled=true;
    try { const url=await makeCard();document.getElementById('share-image').src=url;document.getElementById('download-card').href=downloadURL;document.getElementById('share-status').textContent='如点击下载没有反应，请长按图片，选择“保存图片”。';document.getElementById('share-dialog').showModal(); }
    catch { trigger.textContent='图片加载未完成，请点击重试'; }
    finally { trigger.disabled=false; }
  }
  document.getElementById('close-share').addEventListener('click',()=>document.getElementById('share-dialog').close());
  document.getElementById('share-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
  window.addEventListener('hashchange',route);
  route();
})();
