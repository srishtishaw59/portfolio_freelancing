/**
 * SRISHTI SHAW — PORTFOLIO V2
 * Interactive Scroll Percentage Dialer & Smooth Navigation System
 */

(function () {
  'use strict';

  // 1. Ensure the Scroll Dialer component exists in DOM
  function ensureScrollDialer() {
    if (document.getElementById('scrollDialer')) return;

    const dialer = document.createElement('div');
    dialer.className = 'scroll-dialer';
    dialer.id = 'scrollDialer';
    dialer.setAttribute('role', 'progressbar');
    dialer.setAttribute('aria-valuenow', '0');
    dialer.setAttribute('aria-valuemin', '0');
    dialer.setAttribute('aria-valuemax', '100');
    dialer.setAttribute('title', 'Scroll progress (click track or drag to navigate, click at 100% for top)');

    dialer.innerHTML = `
      <div class="scroll-track" id="scrollTrack">
        <div class="scroll-fill" id="scrollFill"></div>
        <div class="scroll-knob" id="scrollKnob">
          <svg class="scroll-ring-svg" viewBox="0 0 42 42">
            <defs>
              <linearGradient id="dialerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6E6DF2" />
                <stop offset="50%" stop-color="#B867CA" />
                <stop offset="100%" stop-color="#F87545" />
              </linearGradient>
            </defs>
            <circle class="scroll-ring-track" cx="21" cy="21" r="18" />
            <circle class="scroll-ring-bar" id="scrollRingBar" cx="21" cy="21" r="18" stroke="url(#dialerGrad)" />
          </svg>
          <span class="scroll-pct-text" id="scrollPctText">0%</span>
        </div>
      </div>
    `;

    document.body.appendChild(dialer);
  }

  // 2. Initialize Dialer Behavior
  function initDialer() {
    ensureScrollDialer();

    const track = document.getElementById('scrollTrack');
    const fill = document.getElementById('scrollFill');
    const knob = document.getElementById('scrollKnob');
    const pctText = document.getElementById('scrollPctText');
    const ringBar = document.getElementById('scrollRingBar');

    if (!track || !fill || !knob || !pctText || !ringBar) return;

    const CIRCUMFERENCE = 113.1; // 2 * Math.PI * 18

    function updateDialer() {
      const scrollElement = document.documentElement;
      const scrollTop = window.pageYOffset || scrollElement.scrollTop || document.body.scrollTop || 0;
      const scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      const clientHeight = window.innerHeight || scrollElement.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100))) : 0;

      // Update text
      pctText.textContent = pct + '%';

      // Update circular progress stroke
      const strokeOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
      ringBar.style.strokeDashoffset = strokeOffset;

      // Update knob position and track fill
      const trackHeight = track.clientHeight;
      const knobY = (pct / 100) * trackHeight;
      knob.style.top = knobY + 'px';
      fill.style.height = knobY + 'px';
    }

    // Scroll and resize listeners
    window.addEventListener('scroll', updateDialer, { passive: true });
    window.addEventListener('resize', updateDialer, { passive: true });

    // Initial update
    updateDialer();

    // Track click -> smooth scroll to percentage
    track.addEventListener('click', function (e) {
      const rect = track.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const ratio = Math.min(1, Math.max(0, clickY / rect.height));
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({
        top: ratio * scrollHeight,
        behavior: 'smooth'
      });
    });

    // Knob click -> if at 100%, smooth scroll back to top
    knob.addEventListener('click', function (e) {
      if (pctText.textContent === '100%') {
        e.stopPropagation();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Drag support on knob
    let isDragging = false;
    knob.addEventListener('pointerdown', function (e) {
      isDragging = true;
      knob.setPointerCapture(e.pointerId);
      e.stopPropagation();
      e.preventDefault();
    });

    knob.addEventListener('pointermove', function (e) {
      if (!isDragging) return;
      const rect = track.getBoundingClientRect();
      const dragY = e.clientY - rect.top;
      const ratio = Math.min(1, Math.max(0, dragY / rect.height));
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: ratio * scrollHeight });
    });

    function endDrag(e) {
      if (isDragging) {
        isDragging = false;
        try { knob.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }

    knob.addEventListener('pointerup', endDrag);
    knob.addEventListener('pointercancel', endDrag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDialer);
  } else {
    initDialer();
  }
})();
