/* ======================================================
    main.js
====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const cameraRig = document.getElementById('cameraRig');
  const root = document.documentElement;

  /* ---------- Web Audio Safe Fallback Setup ---------- */
  let audioCtx = null;
  let musicGain = null;

  function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(bgMusic);
    musicGain = audioCtx.createGain();
    source.connect(musicGain);
    musicGain.connect(audioCtx.destination);
  }

  function startMusic() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    bgMusic.play();
    gsap.to(musicGain.gain, { value: 0.7, duration: 0.8 });
  }

  /* ---------- loading ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      const l = document.getElementById('loading');
      l.style.opacity = 0;
      setTimeout(() => l.style.display = 'none', 1200);
      initCinematicCamera();
    }, 900);
  });

  /* ---------- candlelight flickering engine ---------- */
  function startCandleFlicker() {
    const baseGlow = 750;
    gsap.to({}, {
      duration: 0.1,
      repeat: -1,
      onRepeat: () => {
        const xMod = (Math.random() - 0.5) * 4.5;
        const yMod = (Math.random() - 0.5) * 3.5;
        const glowMod = baseGlow + (Math.random() - 0.5) * 45;
        
        root.style.setProperty('--flicker-x', `${xMod}px`);
        root.style.setProperty('--flicker-y', `${yMod}px`);
        root.style.setProperty('--flicker-glow', `${glowMod}px`);
      }
    });
  }
  startCandleFlicker();

  /* ---------- cinematic camera loop ---------- */
  function initCinematicCamera() {
    gsap.to(cameraRig, {
      rotationY: 1.5,
      rotationX: 1,
      z: 5,
      duration: 4.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
    
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) - 0.5;
      const normY = (e.clientY / window.innerHeight) - 0.5;
      gsap.to(cameraRig, {
        rotationY: normX * 3.5,
        rotationX: normY * -3.5,
        duration: 1.2,
        ease: "power1.out",
        overwrite: "auto"
      });
    });
  }

  /* ---------- particles.js : dust ---------- */
  const canvas = document.getElementById('dust-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); addEventListener('resize', resize);
  
  function makeParticles(n) {
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.4,
      vy: Math.random() * 0.12 + 0.04,
      vx: (Math.random() - 0.5) * 0.06,
      a: Math.random() * 0.4 + 0.1
    }));
  }
  makeParticles(70);
  
  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#dfc185';
    particles.forEach(p => {
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      ctx.globalAlpha = p.a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();

  /* ---------- envelope open logic ---------- */
  const seal = document.getElementById('seal');
  const envelope = document.getElementById('envelope');
  const intro = document.getElementById('intro');
  const letterStage = document.getElementById('letter-stage');
  const foldUpper = document.getElementById('foldUpper');
  const foldLower = document.getElementById('foldLower');
  const paperWrap = document.getElementById('paperWrap');
  const parchment = document.getElementById('parchment');
  const scrollTrack = document.getElementById('scrollTrack');

  let opened = false;
  seal.addEventListener('click', () => {
    if (opened) return; opened = true;
    
    const rect = seal.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
      const frag = document.createElement('div');
      frag.className = 'wax-fragment';
      frag.style.width = `${Math.random() * 12 + 6}px`;
      frag.style.height = `${Math.random() * 10 + 5}px`;
      frag.style.left = `${rect.left + rect.width / 2}px`;
      frag.style.top = `${rect.top + rect.height / 2}px`;
      document.body.appendChild(frag);
      
      gsap.set(frag, { opacity: 0.95 });
      gsap.to(frag, {
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.2) * 140 + 60,
        rotation: (Math.random() - 0.5) * 360,
        duration: Math.random() * 0.6 + 0.4,
        ease: "power2.out",
        onComplete: () => frag.remove()
      });
    }

    const impactTl = gsap.timeline();
    impactTl.to(cameraRig, { z: -40, rotationX: 2, duration: 0.08, ease: "power2.out" })
            .to(cameraRig, { z: 0, rotationX: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });

    const tl = gsap.timeline();
    tl.to(seal, { scale: 1.1, opacity: 0, rotation: -15, duration: 0.2, ease: 'power2.in' })
      .call(() => envelope.classList.add('open'))
      .to(cameraRig, {
        "--blur-amt": "2px",
        z: -120,
        duration: 1.2,
        ease: "power2.inOut"
      }, "+=0.2")
      .call(() => {
        letterStage.classList.add('active');
        gsap.to(letterStage, { opacity: 1, duration: 0.8 });
      })
      .to(intro, { opacity: 0, scale: 0.92, duration: 1.0, ease: 'power2.inOut' }, '-=0.6')
      .call(() => intro.style.display = 'none')
      
      // Smooth unfolding sequence
      .fromTo(foldUpper, { rotateX: 0 }, { rotateX: -174, duration: 1.4, ease: 'power2.inOut' })
      .fromTo(foldLower, { rotateX: 0 }, { rotateX: 174, duration: 1.4, ease: 'power2.inOut' }, '<')
      .to(cameraRig, { "--blur-amt": "0px", z: 0, duration: 1.0, ease: "power2.out" }, "-=0.3")
      
      // Smooth opacity fade swap from 3D panels to actual paper
      .to(paperWrap, { opacity: 0, duration: 0.4, ease: "power2.in" })
      .call(() => { 
        paperWrap.style.display = 'none'; 
        scrollTrack.style.opacity = 1;
        window.scrollTo({ top: 0, behavior: 'instant' });
      })
      .fromTo(parchment, 
        { opacity: 0, y: 40, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }
      )
      .call(() => {
        startSequentialWriting();
      });
  });

  /* ---------- sequential writing engine ---------- */
  function prepareAndParseText(el) {
    if (!el || el.dataset.parsed) return;
    const rawStr = el.dataset.text || '';
    el.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < rawStr.length; i++) {
      const char = rawStr[i];
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'char';
        span.textContent = char;
        const varianceOpacity = (0.86 + Math.random() * 0.12).toFixed(2);
        span.style.setProperty('--char-op', varianceOpacity);
      }
      fragment.appendChild(span);
    }
    el.appendChild(fragment);
    el.dataset.parsed = '1';
  }

  const sequenceElements = Array.from(document.querySelectorAll('.type-block, .divider, .artifact'));
  let activeSequenceIndex = 0;
  let lastScrollTime = 0;

  function startSequentialWriting() {
    processNextElement();
  }

  function processNextElement() {
    if (activeSequenceIndex >= sequenceElements.length) {
      triggerEndingSequence();
      return;
    }

    const el = sequenceElements[activeSequenceIndex];

    // Smooth dynamic auto-scrolling engine using GSAP ScrollTo
    const now = Date.now();
    if (activeSequenceIndex > 0 && now - lastScrollTime > 800) {
      lastScrollTime = now;
      const rect = el.getBoundingClientRect();
      const absoluteTop = window.scrollY + rect.top;
      const targetScroll = absoluteTop - (window.innerHeight / 2);

      gsap.to(window, {
        scrollTo: targetScroll,
        duration: 1.5,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    if (el.classList.contains('type-block')) {
      prepareAndParseText(el);
      executeInkAnimation(el, () => {
        activeSequenceIndex++;
        setTimeout(processNextElement, 500 + Math.random() * 300);
      });
    } else {
      el.classList.add('show');
      activeSequenceIndex++;
      setTimeout(processNextElement, 800);
    }
  }

  function executeInkAnimation(el, onCompleteCallback) {
    const chars = el.querySelectorAll('.char, .space');
    let idx = 0;

    function writeNibs() {
      if (idx < chars.length) {
        const target = chars[idx];
        if (target.classList.contains('char')) {
          target.classList.add('char-inked');
        }
        
        const prevRawChar = target.textContent;
        let pacingDelay = 15 + Math.random() * 25;
        
        if (/\./.test(prevRawChar)) pacingDelay = 500 + Math.random() * 200; 
        else if (/,/.test(prevRawChar)) pacingDelay = 200 + Math.random() * 100;
        
        idx++;
        setTimeout(writeNibs, pacingDelay);
      } else {
        el.classList.add('done');
        if (onCompleteCallback) onCompleteCallback();
      }
    }
    writeNibs();
  }

  /* ---------- background music engine script ---------- */
  const bgMusic = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  let musicPlaying = false;

  musicBtn.addEventListener("click", () => {
    initAudio();

    if (!musicGain) {
      startMusic();
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.querySelector("span").textContent = "Pause Music";
      return;
    }

    if (bgMusic.paused) {
      bgMusic.play();
      gsap.to(musicGain.gain, {
        value: .7,
        duration: .8
      });
      musicPlaying = true;
      musicBtn.classList.add("playing");
      musicBtn.querySelector("span").textContent = "Pause Music";
    } else {
      gsap.to(musicGain.gain, {
        value: 0,
        duration: .6,
        onComplete() {
          bgMusic.pause();
        }
      });
      musicPlaying = false;
      musicBtn.classList.remove("playing");
      musicBtn.querySelector("span").textContent = "Play Letter Theme";
    }
  });

  /* ---------- ending scene trigger ---------- */
  const finalSeal = document.getElementById('finalSeal');
  const scriptSig = document.getElementById('scriptSig');
  const endingFade = document.getElementById('ending-fade');

  function triggerEndingSequence() {
    const rect = scriptSig.getBoundingClientRect();
    const targetScroll = window.scrollY + rect.top - (window.innerHeight / 2);
    gsap.to(window, { scrollTo: targetScroll, duration: 1.2, ease: "power2.out" });

    setTimeout(() => {
      scriptSig.classList.add('draw');
      
      setTimeout(() => {
        finalSeal.classList.add('show');
        
        // Heavy stamp physical camera shake impact
        gsap.timeline()
          .to(cameraRig, { z: -35, rotationX: 1.5, duration: 0.06, ease: "power3.out" })
          .to(cameraRig, { z: 0, rotationX: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });

        // Gentle pull back out of the desk space into total dark void
        gsap.to(cameraRig, { 
          z: -400, 
          rotationX: -15, 
          opacity: 0, 
          duration: 3.5, 
          ease: "power2.inOut",
          delay: 2.5 
        });
        
        setTimeout(() => {
          endingFade.classList.add('show');
          
          // Smoothly clear audio track completely when fade hits
          if (musicGain) {
            gsap.to(musicGain.gain, {
              value: 0,
              duration: 3,
              ease: "power2.out",
              onComplete() {
                bgMusic.pause();
                bgMusic.currentTime = 0;
                musicBtn.classList.remove("playing");
                musicBtn.querySelector("span").textContent = "Play Letter Theme";
              }
            });
          }
        }, 4500);

      }, 3200);
    }, 1000);
  }
});