(() => {
  'use strict';
  const { questions, dimensions, people } = window.ARCHIVE;
  const app = document.getElementById('app');
  // 固定口令仅限制网页入口，不能代替服务端付费授权。
  const accessHash = 'd848d3ae5473fa93392cf33ef27d0fe05cdedf65cbb30ce45630d80ff60df268';
  const accessKey = 'zhaojian-access-v1';
  let unlocked = false;
  try { unlocked = sessionStorage.getItem(accessKey) === accessHash; } catch {}
  function accessGate() {
    app.innerHTML = `<section class="access-page fade-in"><div class="access-art"><img src="${window.PORTRAIT}" alt="李清照艺术想象画像"><span class="seal">照见</span></div><div class="access-copy"><div class="eyebrow">照见古人 · 入卷凭笺</div><h1>你的故事，<br>从这一笺开始。</h1><p class="scene">输入测试码，走进二十四个古代情境，<br>找到与你处事方式相近的历史人物。</p><form id="access-form"><label for="access-code">测试码</label><input id="access-code" name="code" type="password" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="64" required placeholder="请输入你收到的测试码" aria-describedby="access-message"><p id="access-message" role="status" aria-live="polite">不区分大小写，请保留码中的连字符。</p><button class="button primary" type="submit">验证并进入　↗</button></form><p class="small-note">24道情境题 · 8位人物 · 按答案匹配<br>历史人物主题的趣味自我探索，非专业心理测评。<br>还没有测试码？请向提供本链接的人获取。</p></div></section>`;
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
  const key = 'zhaojian-test-v2';
  let storageOK = true;
  let state = { answers: Array(questions.length).fill(null), index: 0 };
  try {
    const saved=JSON.parse(localStorage.getItem(key));
    if(saved && Array.isArray(saved.answers) && saved.answers.length===questions.length && saved.answers.every(a=>a===null||(Number.isInteger(a)&&a>=0&&a<4)) && Number.isInteger(saved.index)&&saved.index>=0&&saved.index<questions.length) state=saved;
  } catch { storageOK=false; }
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{storageOK=false;}};
  const complete=()=>state.answers.every(a=>a!==null);
  const result=()=>window.matchArchive(state.answers);
  const button=(text,action,primary=false)=>`<button class="button ${primary?'primary':''}" data-action="${action}">${text}</button>`;
  const artCache={};
  const drawings={
    ban:'<path d="M155 290 Q235 260 300 292 Q365 260 445 290 L445 480 Q365 450 300 484 Q235 450 155 480 Z M300 292 V484"/><path d="M180 320 L275 330 M180 352 L275 362 M180 384 L275 394 M325 330 L420 320 M325 362 L420 352 M325 394 L420 384"/>',
    xue:'<path d="M180 265 L420 300 L390 505 L150 470 Z M190 320 L365 346 M185 355 L360 381 M180 390 L295 407 M345 475 Q390 370 462 260 M380 383 Q401 285 462 260 Q455 345 380 383"/>',
    qin:'<path d="M230 220 V540 M233 235 Q330 205 410 260 L370 310 Q305 280 233 310 M310 350 L400 520 M330 380 L280 415 M293 400 L370 355 M210 540 H410"/><circle cx="330" cy="245" r="10"/>',
    su:'<path d="M130 335 Q300 140 470 335 Z M130 335 Q215 275 300 335 Q385 275 470 335 M300 238 V510 Q300 555 260 530 M140 240 L130 260 M420 200 L410 220 M185 175 L175 195 M460 410 L450 430 M210 460 L200 480"/>',
    tao:'<path d="M300 540 Q275 435 300 350 M295 455 Q225 395 205 460 Q245 490 295 455 M295 400 Q365 370 380 410 Q345 435 295 400"/><g transform="translate(300 315)"><circle r="24"/><ellipse cy="-54" rx="17" ry="39"/><ellipse cy="54" rx="17" ry="39"/><ellipse cx="54" rx="39" ry="17"/><ellipse cx="-54" rx="39" ry="17"/><ellipse cy="-54" rx="17" ry="39" transform="rotate(45)"/><ellipse cy="-54" rx="17" ry="39" transform="rotate(135)"/><ellipse cy="-54" rx="17" ry="39" transform="rotate(225)"/><ellipse cy="-54" rx="17" ry="39" transform="rotate(315)"/></g>',
    shen:'<circle cx="300" cy="360" r="130"/><ellipse cx="300" cy="360" rx="130" ry="45" transform="rotate(-30 300 360)"/><ellipse cx="300" cy="360" rx="45" ry="130" transform="rotate(-30 300 360)"/><path d="M300 210 V510 M150 360 H450 M300 490 V545 M215 545 H385"/><circle cx="300" cy="360" r="12"/>',
    xu:'<path d="M110 475 L240 250 L320 375 L375 290 L500 475 M208 305 L240 325 L269 295 M344 345 L375 365 L400 337 M310 490 Q215 515 315 550 Q390 580 235 610"/><path d="M145 470 L190 400 L225 470 M405 470 L435 410 L475 470"/>'
  };
  function art(p){
    if(p.id==='li')return window.PORTRAIT;
    if(!artCache[p.id]) {
      const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#eee6d7"/><circle cx="300" cy="330" r="220" fill="${p.color}" opacity=".08"/><rect x="35" y="35" width="530" height="730" fill="none" stroke="#c3b79f"/><path d="M35 640 Q150 590 260 650 T565 630 M35 660 Q170 610 285 665 T565 650" fill="none" stroke="#c3b79f"/><g fill="none" stroke="${p.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawings[p.id]}</g><text x="64" y="100" fill="${p.color}" font-family="serif" font-size="22" letter-spacing="7">照见古人</text><text x="300" y="705" text-anchor="middle" fill="${p.color}" font-family="serif" font-size="29" letter-spacing="10">${p.theme}</text><rect x="482" y="86" width="42" height="58" fill="none" stroke="${p.color}"/><text x="503" y="123" text-anchor="middle" fill="${p.color}" font-family="serif" font-size="25">${p.motif}</text></svg>`;
      artCache[p.id]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    }
    return artCache[p.id];
  }
  const portrait=p=>`<img src="${art(p)}" alt="${p.name}${p.id==='li'?'艺术想象画像':'主题意象插画'}">`;
  function home(){
    const started=state.answers.some(a=>a!==null);
    app.innerHTML=`<section class="hero fade-in"><div class="hero-copy"><div class="eyebrow">二十四次取舍 · 八种人生底色</div><h1>如果走进历史，<br>你会与谁<em>相似</em>？</h1><p class="hero-desc">粮仓前的取舍，风雨中的决定。<br>把自己放进古代情境，看见你的处事方式。</p><div class="hero-meta"><span><strong>24</strong> 道情境题<br>无需历史知识</span><span><strong>08</strong> 位历史人物<br>按本次答案匹配</span><span><strong>一</strong> 份深度档案<br>解读优势与代价</span></div><div class="hero-actions">${button(started?'继续我的测试　↗':'翻开我的档案　↗','start',true)}${button('人物图鉴','gallery')}</div><p class="small-note">题目是虚构的古代情境，没有标准答案。请选你最可能先做的事，而非看起来最正确的事。答案仅保存在当前浏览器。</p>${started?button('清空记录，重新测试','reset'):''}</div><div class="hero-art">${portrait(people[0])}<div class="art-label">借古人的故事，读自己的选择<small>人物图鉴 · 李清照</small></div><div class="art-foot"><span>艺术想象画像 · 首页人物不决定测试结果</span><span class="seal">照见</span></div></div></section><section class="collection-strip"><div><span>壹</span><div><h3>在两难处，看见偏好</h3><p>决策、协作与责任，每个选择都有取舍。</p></div></div><div><span>贰</span><div><h3>解读有迹可循</h3><p>查看支持结果的选择，也保留不同的一面。</p></div></div><div><span>叁</span><div><h3>把理解带回生活</h3><p>读人物档案，带走行动建议与专属收藏卡。</p></div></div></section>`;
  }
  function gallery(){
    app.innerHTML=`<section class="report fade-in"><div class="page-top">${button('← 返回首页','home')}<span>人物志 · 八份独立档案</span></div><div class="eyebrow">先认识古人，再照见自己</div><h1 class="review-title">八种处世方式，<br>没有高低之分。</h1><p class="scene">图鉴可以直接阅读。完成测试后，才会出现与你本次答案对应的人物与选择解读。所有人物均可匹配，不按性别分配。</p><div class="people-grid">${people.map(p=>`<a class="person-tile" href="#figure-${p.id}">${portrait(p)}<div><small>${p.subtitle}</small><h2>${p.name}</h2><p>${p.theme}</p><span>阅读图鉴 ↗</span></div></a>`).join('')}</div>${button('开始 / 继续测试　↗','start',true)}</section>`;
  }
  function quiz(){
    const i=state.index,q=questions[i],selected=state.answers[i],count=state.answers.filter(a=>a!==null).length;
    app.innerHTML=`<section class="page fade-in"><div class="page-top"><button class="text-button" data-action="home">← 返回书房</button><span>情境测试 · ${String(i+1).padStart(2,'0')} / ${questions.length}</span></div><div class="progress-track" role="progressbar" aria-label="已完成题目" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${count}"><span style="width:${count/questions.length*100}%"></span></div><div class="question-sheet"><div class="chapter">${q.chapter}</div><h1 id="question-title" tabindex="-1">${q.title}</h1><p class="scene">${q.scene}</p><div class="options" role="group" aria-labelledby="question-title">${q.options.map((o,j)=>`<button class="option ${selected===j?'selected':''}" data-option="${j}" aria-pressed="${selected===j}"><span class="option-letter">${'ABCD'[j]}</span><span>${o}</span></button>`).join('')}</div><div class="question-nav"><button class="button" data-action="previous" ${i===0?'disabled':''}>← 上一笺</button><button class="button primary" data-action="next" ${selected===null?'disabled':''}>${i===questions.length-1?'回看我的选择':'下一笺'} →</button></div></div><p class="hint">选你最可能先做的事 · 可返回修改 · 刷新可继续</p>${!storageOK?'<p class="storage-note">当前浏览器无法保存进度，请在本页完成测试。</p>':''}</section>`;
  }
  function requireAnswers(){
    if(complete())return true;
    state.index=state.answers.findIndex(a=>a===null);persist();navigate('quiz');return false;
  }
  function review(){
    if(!requireAnswers())return;
    app.innerHTML=`<section class="page fade-in"><div class="eyebrow">二十四笺已阅</div><h1 class="review-title">每一次取舍，<br>都留下了你的回答。</h1><p class="scene">检查你犹豫过的选择，随时可以修改。报告会以当前全部答案重新计算。</p><ol class="review-list">${questions.map((q,i)=>`<li><div><small>${q.chapter}</small><p>${q.options[state.answers[i]]}</p></div><button class="text-button" data-edit="${i}" aria-label="修改第${i+1}题">修改</button></li>`).join('')}</ol><div class="notice">从八位人物的叙事原型中，找出与你本次选择较接近的处事方式。结果不代表能力高低，也不是对你的完整定义。</div>${button('生成我的人物报告　↗','report',true)}<p class="hint">趣味自我探索 · 非专业心理测评</p></section>`;
  }
  function evidence(r){
    const dims=dimensions.map((d,i)=>({...d,index:i,count:r.counts[i]})).sort((a,b)=>b.count-a.count||a.index-b.index);
    const supporting=state.answers.map((a,i)=>({i,a,d:questions[i].scores[a]})).sort((a,b)=>r.person.weights[b.d]-r.person.weights[a.d]||a.i-b.i);
    const used=new Set();const picks=supporting.filter(x=>{if(used.has(x.d))return false;used.add(x.d);return true;}).slice(0,3);
    const other=supporting[supporting.length-1];
    const status=r.tied.length>1?`本次有并列候选：${r.tied.map(id=>people.find(p=>p.id===id).name).join('、')}。先展开其中一份档案，不代表它比其他候选更准确。`:r.diffuse?'本次选择比较分散，没有明显领先的处事偏好。可以把以下人物当作阅读起点，而不是唯一标签。':r.close?`你与${r.person.name}、${r.runner.name}两个原型的距离较接近，可结合两份档案阅读。`:`在当前八个人物原型中，${r.person.name}与你的本次选择更接近。`;
    return `<section class="report-section answer-evidence" id="evidence"><div class="chapter">答题解读 · 为什么是这个结果</div><h2>你的答案，怎样通向这份档案。</h2><p>${status}</p>${r.positionBias?'<div class="notice">你有至少20题选择了同一位置的选项。如果这是习惯性点击，建议回看答案再阅读结果。</div>':''}<p>本次优先选择中，「${dims[0].name}」出现${dims[0].count}次，「${dims[1].name}」出现${dims[1].count}次。这是情境里的先后选择，不是你拥有或缺少某种能力的证明。</p><div class="dimension-grid">${dimensions.map((d,i)=>`<div class="dimension-row"><span>${d.name}</span><div class="dimension-track"><i style="width:${r.counts[i]/12*100}%"></i></div><strong>${r.counts[i]}<small> / 12</small></strong></div>`).join('')}</div><p class="small-note">每个方向都有12次可选机会；每题只计所选方向1次，合计24次。条形表示选择次数，不是能力分数或人群排名。</p><h3>支持这一结果的具体选择</h3>${picks.map(x=>`<div class="evidence-item"><small>第${x.i+1}题 · ${questions[x.i].title}</small><p>你选择了：${questions[x.i].options[x.a]}</p><p>这次你优先照顾了「${dimensions[x.d].name}」。${dimensions[x.d].description}它是你接近「${r.person.theme}」这一原型的线索之一，并不能单独决定结果。</p></div>`).join('')}<h3>也保留与你的原型不同的一面</h3><p>第${other.i+1}题，你选择了“${questions[other.i].options[other.a]}”。在这一处，你将「${dimensions[other.d].name}」放到了前面。即使匹配同一人物，不同人的这类取舍也可能不同；请以具体选择校正人物标签，而不是反过来套用。</p><div class="notice"><strong>适合你这次答案的一步练习</strong><br>${dims[0].practice}</div><p><a href="#figure-${r.runner.id}">对照阅读另一位候选：${r.runner.name} · ${r.runner.theme} ↗</a></p><details class="sources"><summary>匹配依据与局限</summary><p>每个选项对应一个处事方向，八个方向的可选机会相同。程序把选择次数转成相对分布，与编辑定义的八个人物原型权重作距离比较。距离小者排前；完全相同时按固定编号顺序展示并明确标注并列。所有结果由答案计算，不随机分配。</p><p>原型权重是产品的叙事设计，没有心理量表常模或效度验证，也不是史料直接测出的古人性格。人物数量有限，更接近只表示在本库内的相对比较。古代情境可能与你现实生活不同，建议结合具体经历阅读。</p></details></section>`;
  }
  let currentPerson=people[0],currentPreview=false;
  function renderReport(previewPerson){
    if(!previewPerson&&!requireAnswers())return;
    const r=previewPerson?null:result(),p=previewPerson||r.person;
    currentPerson=p;currentPreview=!!previewPerson;
    const {report,actions,closing,sources}=p;
    app.innerHTML=`<article class="report fade-in" style="--red:${p.color}"><div class="page-top"><button class="text-button" data-action="${previewPerson?'gallery':'review'}">← ${previewPerson?'返回图鉴':'回看我的选择'}</button><span>NO.${String(people.indexOf(p)+1).padStart(3,'0')} · ${previewPerson?'图鉴预览':'本次匹配报告'}</span></div>${previewPerson?'<div class="notice">这是人物图鉴预览，不是你的测试结果。完成24题后，可查看自己的匹配报告与答案解读。</div>':''}<section class="report-cover"><div class="report-portrait">${portrait(p)}<div class="art-foot"><span>${p.id==='li'?'艺术想象画像':'原创人物意象 · 非历史肖像'}</span><span class="seal">${p.motif}</span></div></div><div class="report-cover-copy"><div class="eyebrow">照见古人 · ${previewPerson?'人物图鉴':'你的历史人物原型'}</div><h1>${p.name}</h1><p class="report-subtitle">${p.subtitle}</p><h2 class="report-theme">${p.theme}</h2><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div><p class="cover-quote">${p.quote}</p><p class="small-note">原创解读语 · 非古人名言<br>${previewPerson?'阅读原型，不代表你的匹配结果。':'根据24道题的选择匹配；相似的是处事倾向，不是全部人生。'}</p></div></section><div class="report-layout"><nav class="report-nav" aria-label="报告章节">${r?'<a href="#evidence">答题解读与八维倾向</a>':''}${report.map((s,i)=>`<a href="#section-${i}">${s.label}</a>`).join('')}<a href="#practice">07 / 给自己的练习</a><a href="#sources">史料与解读说明</a></nav><div class="report-body">${r?evidence(r):''}${report.map((s,i)=>`<section class="report-section" id="section-${i}"><div class="chapter">${s.label}</div><h2>${s.title}</h2>${s.paragraphs.map(text=>`<p>${text}</p>`).join('')}${s.source?'<p class="source-link">本节区分史料记述与现代解读 · <a href="#sources">查看出处 ↗</a></p>':''}</section>`).join('')}<section class="report-section" id="practice"><div class="chapter">07 / 给自己的练习</div><h2>从一件小事，慢慢开始。</h2><div class="actions-list">${actions.map((a,i)=>`<div class="action-item"><span>0${i+1}</span><div><h3>${a.title}</h3><p>${a.text}</p></div></div>`).join('')}</div></section><section class="closing"><div class="chapter">卷末 · 留给自己</div><h2>${p.theme}，也有自己的分寸。</h2><p>${closing}</p></section><div class="report-buttons">${button(previewPerson?'保存图鉴卡　↓':'保存我的人物卡　↓','share',true)}${previewPerson?button(complete()?'回到我的结果':'开始我的测试',complete()?'report':'start'):button('人物图鉴','gallery')}${button('重新测试','reset')}</div><details class="sources" id="sources"><summary>史料出处与解读边界</summary><p>第二节的事实依据见下列原典。其余生活描述、优势代价和建议为原创现代解读，不是古人心理测评结论。报告是自我对照的起点，不决定职业、关系或人生选择。</p><ul>${sources.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name} ↗</a><br>${s.note}</li>`).join('')}</ul><p>画像或意象插画均为艺术表达，不代表人物真实容貌。历史人物主题的趣味自我探索，非专业心理测评。</p></details></div></div></article>`;
  }
  function route(){
    if(!unlocked){accessGate();window.scrollTo(0,0);return;}
    const hash=location.hash.slice(1)||'home';
    if(hash.startsWith('figure-')){const [id,section]=hash.slice(7).split('/');const p=people.find(p=>p.id===id);p?renderReport(p):gallery();if(p){app.querySelectorAll('a[href^="#"]').forEach(a=>{const target=a.getAttribute('href').slice(1);if(target.startsWith('section-')||['practice','sources'].includes(target))a.href='#figure-'+id+'/'+target;});}if(section){requestAnimationFrame(()=>{const el=document.getElementById(section);if(el?.tagName==='DETAILS')el.open=true;el?.scrollIntoView();});return;}}
    else if(hash.startsWith('section-')||['practice','sources','evidence'].includes(hash)){
      renderReport(currentPreview?currentPerson:undefined);
      requestAnimationFrame(()=>{const el=document.getElementById(hash);if(el?.tagName==='DETAILS')el.open=true;el?.scrollIntoView();});return;
    }else ({home,quiz,review,gallery,report:()=>renderReport()}[hash]||home)();
    window.scrollTo(0,0);
  }
  function navigate(page){if(location.hash==='#'+page)route();else location.hash=page;}
  app.addEventListener('click',e=>{
    if(!unlocked)return;
    const target=e.target.closest('button');if(!target)return;
    if(target.dataset.option!==undefined){
      state.answers[state.index]=Number(target.dataset.option);persist();
      app.querySelectorAll('[data-option]').forEach(b=>{const on=b===target;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});
      app.querySelector('[data-action="next"]').disabled=false;
      const count=state.answers.filter(a=>a!==null).length,track=app.querySelector('[role="progressbar"]');
      track.setAttribute('aria-valuenow',count);track.firstElementChild.style.width=`${count/questions.length*100}%`;return;
    }
    if(target.dataset.edit!==undefined){state.index=Number(target.dataset.edit);persist();navigate('quiz');return;}
    switch(target.dataset.action){
      case 'start':if(complete())navigate('review');else{state.index=state.answers.findIndex(a=>a===null);persist();navigate('quiz');}break;
      case 'next':if(state.answers[state.index]===null)return;if(state.index===questions.length-1)navigate('review');else{state.index++;persist();quiz();window.scrollTo(0,0);document.getElementById('question-title').focus({preventScroll:true});}break;
      case 'previous':if(state.index>0){state.index--;persist();quiz();window.scrollTo(0,0);document.getElementById('question-title').focus({preventScroll:true});}break;
      case 'reset':if(state.answers.some(a=>a!==null)&&!window.confirm('清空本次答案并重新测试？'))return;state={answers:Array(questions.length).fill(null),index:0};persist();currentPreview=false;navigate('quiz');break;
      case 'share':showShare(target);break;
      default:if(['home','review','report','gallery'].includes(target.dataset.action))navigate(target.dataset.action);
    }
  });
  let downloadURL;
  async function makeCard(p,preview){
    const img=new Image();img.src=art(p);await img.decode();
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1440;const c=canvas.getContext('2d');
    c.fillStyle='#f5f0e6';c.fillRect(0,0,1080,1440);c.strokeStyle='#c7b99f';c.lineWidth=2;c.strokeRect(40,40,1000,1360);
    c.fillStyle=p.color;c.font='30px "Microsoft YaHei",sans-serif';c.fillText('照见古人',80,108);
    c.fillStyle='#6c7065';c.font='20px "Microsoft YaHei",sans-serif';c.textAlign='right';c.fillText(`人物志 · NO.${String(people.indexOf(p)+1).padStart(3,'0')} / ${preview?'图鉴预览':'本次匹配'}`,1000,104);
    const h=790,w=h*img.width/img.height;c.drawImage(img,(1080-w)/2,145,w,h);
    c.fillStyle='#2b3732';c.textAlign='center';c.font='64px SimSun,"Songti SC",serif';c.fillText(p.name.split('').join(' '),540,1025);
    c.font='32px SimSun,"Songti SC",serif';c.fillText(p.theme,540,1085);c.strokeStyle='#d6cbb7';c.beginPath();c.moveTo(200,1115);c.lineTo(880,1115);c.stroke();
    c.fillStyle='#6c7065';c.font='24px "Microsoft YaHei",sans-serif';c.fillText(p.tags.join('　 /　 '),540,1160);
    c.fillStyle=p.color;c.font='32px SimSun,"Songti SC",serif';c.fillText(p.quote,540,1235,900);
    c.fillStyle='#6c7065';c.font='19px "Microsoft YaHei",sans-serif';c.fillText('原创解读语 · 非古人名言 ｜ 画面为艺术表达',540,1290);
    c.font='18px "Microsoft YaHei",sans-serif';c.fillText(preview?'图鉴预览 · 不代表个人结果 · 非专业心理测评':'基于24道情境选择 · 趣味自我探索 · 非专业心理测评',540,1350);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('图片导出失败');
    if(downloadURL)URL.revokeObjectURL(downloadURL);downloadURL=URL.createObjectURL(blob);
    return canvas.toDataURL('image/png');
  }
  async function showShare(trigger){
    trigger.disabled=true;
    try{
      const p=currentPerson,preview=currentPreview,url=await makeCard(p,preview),img=document.getElementById('share-image'),link=document.getElementById('download-card');
      img.src=url;img.alt=`${p.name} · ${p.theme} · ${preview?'图鉴预览':'本次匹配'}收藏卡`;
      link.href=downloadURL;link.download=`照见古人-${p.name}-${preview?'图鉴':'结果'}收藏卡.png`;
      document.getElementById('share-status').textContent='如点击下载没有反应，请长按图片，选择“保存图片”。';document.getElementById('share-dialog').showModal();
    }catch{trigger.textContent='图片加载未完成，请点击重试';}finally{trigger.disabled=false;}
  }
  document.getElementById('close-share').addEventListener('click',()=>document.getElementById('share-dialog').close());
  document.getElementById('share-dialog').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
  window.addEventListener('hashchange',route);route();
})();
