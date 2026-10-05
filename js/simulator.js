/**
 * LeadSortix AI – Live Lead Triage Simulator Engine
 * Implements realistic multi-provider latency, classification, and dynamic routing
 */

(function () {
  'use strict';

  // Presets Data
  const PRESETS = {
    emergency_pipe: {
      name: 'Sarah Jenkins',
      phone: '+1 (555) 382-9912',
      email: 'sarah.j@example.com',
      formSource: 'Contact Form 7',
      model: 'groq',
      message: 'EMERGENCY! Main water pipe burst in the upstairs master bathroom. Water is currently gushing through the ceiling into the living room below! We need an emergency plumber right now!',
      score: 98,
      urgency: 'emergency',
      category: 'Water Damage Disaster',
      summary: 'Critical structural water leak requiring immediate technician phone dispatch within <5 minutes.',
      hotline: '+1 (800) 555-PLUMB',
      actionTitle: 'High-Urgency Emergency Triage Activated',
      actionText: 'Priority escalation triggered. Direct hotline auto-dialer ready and SMS dispatched to on-call supervisor.'
    },
    remodel_quote: {
      name: 'David Miller',
      phone: '+1 (555) 749-1104',
      email: 'dmiller@remodelplans.org',
      formSource: 'Elementor Pro Forms',
      model: 'gemini',
      message: 'Hello, we are planning a full kitchen remodeling for our single-family home next spring. Looking to compare quotes and discuss quartz countertop installations, custom cabinetry, and estimated timeline.',
      score: 34,
      urgency: 'routine',
      category: 'Design & Construction Quote',
      summary: 'High-value routine consultation inquiry. Ideal for automated calendar appointment scheduling.',
      calendarUrl: 'https://cal.com/leadsortix-demo/kitchen-consultation',
      actionTitle: 'Automated Calendar Consultation Routing',
      actionText: 'AI pre-drafted quote proposal sent via Resend API with direct Cal.com booking link to avoid back-and-forth emails.'
    },
    server_hvac: {
      name: 'Marcus Vance (VP Ops)',
      phone: '+1 (555) 902-4411',
      email: 'mvance@techcore.io',
      formSource: 'WPForms',
      model: 'groq',
      message: 'CRITICAL: Our primary HVAC chiller unit in Server Room B just failed with error code E-99. Ambient temperature is already hitting 88°F and rising fast. Need emergency commercial technician dispatched immediately to prevent server shutdown!',
      score: 99,
      urgency: 'emergency',
      category: 'Commercial Infrastructure Failure',
      summary: 'Severe hardware thermal risk detected. Overrides routine queue and flashes hotline operator console.',
      hotline: '+1 (888) 911-HVAC',
      actionTitle: 'Enterprise Priority Hotline Routing',
      actionText: 'Commercial SLA guarantee active. Direct dispatch line ringing on duty engineer’s phone.'
    },
    warranty_faq: {
      name: 'Elena Rostova',
      phone: '+1 (555) 612-8830',
      email: 'elena.r@cloudmail.org',
      formSource: 'Forminator',
      model: 'openai',
      message: 'Hi there, do you offer seasonal maintenance packages for residential HVAC units, and what is your warranty on replaced parts? Would love to see your pricing sheet.',
      score: 18,
      urgency: 'routine',
      category: 'General Information & FAQ',
      summary: 'Standard inquiry with zero urgency indicators. Routed to knowledge base and routine consultation queue.',
      calendarUrl: 'https://calendly.com/leadsortix-demo/routine-check',
      actionTitle: 'Standard Consultation Routing',
      actionText: 'Instant auto-acknowledgment email drafted with service pricing tier PDF and optional booking slot.'
    }
  };

  // Model Latency Profiles (Simulated in milliseconds)
  const MODEL_LATENCIES = {
    groq: { min: 210, max: 340, name: 'Groq (Llama 3.1 70B)' },
    gemini: { min: 310, max: 460, name: 'Google Gemini 1.5 Flash' },
    openai: { min: 390, max: 540, name: 'OpenAI GPT-4o-mini' },
    claude: { min: 420, max: 580, name: 'Anthropic Claude 3.5 Haiku' },
    grok: { min: 440, max: 620, name: 'xAI Grok 2' },
    heuristic: { min: 1.8, max: 3.5, name: 'Offline Regex Heuristic Engine' }
  };

  // Emergency keywords regex dictionary for live custom queries
  const EMERGENCY_REGEX = /\b(emergency|urgent|asap|burst|flood|flooding|leak|leaking|fire|smoke|shattered|broken|disaster|danger|hazard|chiller|gushing|ceiling|collapse|sparking|blackout|gas|e-99|immediately|right now|help)\b/i;
  const ROUTINE_REGEX = /\b(quote|estimate|pricing|cost|consultation|schedule|appointment|remodel|renovation|kitchen|warranty|question|information|brochure|next month|next week|planning)\b/i;

  // DOM Elements
  const presetButtons = document.querySelectorAll('.preset-pill-btn');
  const leadNameInput = document.getElementById('sim-lead-name');
  const leadPhoneInput = document.getElementById('sim-lead-phone');
  const leadEmailInput = document.getElementById('sim-lead-email');
  const leadSourceSelect = document.getElementById('sim-lead-source');
  const leadModelSelect = document.getElementById('sim-ai-model');
  const leadMsgInput = document.getElementById('sim-lead-message');
  const btnRunTriage = document.getElementById('btn-run-triage');
  const btnResetSim = document.getElementById('btn-reset-sim');
  const progressBar = document.getElementById('scan-progress-bar');

  // Outputs
  const latencyBadge = document.getElementById('sim-latency-val');
  const scoreNumber = document.getElementById('sim-score-number');
  const scoreCircleProgress = document.getElementById('sim-score-progress');
  const outcomeTag = document.getElementById('sim-outcome-tag');
  const outcomeTitle = document.getElementById('sim-outcome-title');
  const outcomeDesc = document.getElementById('sim-outcome-desc');
  const dynamicActionCard = document.getElementById('sim-dynamic-action-card');
  const rawJsonOutput = document.getElementById('raw-json-output');
  const rawJsonToggle = document.getElementById('raw-json-toggle');
  const rawJsonIcon = document.getElementById('raw-json-icon');

  if (!btnRunTriage) return;

  // Sound FX Helper using Web Audio API (Zero external audio file overhead)
  let audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'scan') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'emergency') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, audioCtx.currentTime);
        osc.frequency.setValueAtTime(950, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio autoplay policy or unavailable, silently pass
    }
  }

  // Load Preset into inputs
  function loadPreset(presetKey) {
    const data = PRESETS[presetKey];
    if (!data) return;

    presetButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === presetKey);
    });

    leadNameInput.value = data.name;
    leadPhoneInput.value = data.phone;
    leadEmailInput.value = data.email;
    leadSourceSelect.value = data.formSource;
    leadModelSelect.value = data.model;
    leadMsgInput.value = data.message;

    executeTriageAnalysis(data);
  }

  // Execute Triage Analysis
  function executeTriageAnalysis(explicitData = null) {
    const modelKey = leadModelSelect.value || 'groq';
    const profile = MODEL_LATENCIES[modelKey] || MODEL_LATENCIES.groq;
    
    // Calculate realistic latency
    let latency = 0;
    if (modelKey === 'heuristic') {
      latency = (Math.random() * (profile.max - profile.min) + profile.min).toFixed(1);
    } else {
      latency = Math.floor(Math.random() * (profile.max - profile.min) + profile.min);
    }

    // Animation: Scan bar
    progressBar.style.transition = 'width 0.25s cubic-bezier(0.1, 0.7, 0.1, 1)';
    progressBar.style.width = '35%';
    btnRunTriage.disabled = true;
    btnRunTriage.innerHTML = `
      <svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
      </svg>
      <span>Analyzing with ${profile.name.split(' ')[0]}...</span>
    `;

    playSound('scan');

    setTimeout(() => {
      progressBar.style.width = '80%';
    }, 150);

    setTimeout(() => {
      progressBar.style.width = '100%';

      let score, urgency, category, summary, hotline, calendarUrl, actionTitle, actionText;

      if (explicitData && explicitData.score !== undefined) {
        score = explicitData.score;
        urgency = explicitData.urgency;
        category = explicitData.category;
        summary = explicitData.summary;
        hotline = explicitData.hotline;
        calendarUrl = explicitData.calendarUrl;
        actionTitle = explicitData.actionTitle;
        actionText = explicitData.actionText;
      } else {
        // Dynamic custom evaluation
        const text = (leadMsgInput.value || '').trim();
        const hasEmergency = EMERGENCY_REGEX.test(text);
        const hasRoutine = ROUTINE_REGEX.test(text);

        if (hasEmergency) {
          score = Math.floor(Math.random() * 8) + 92; // 92 - 99
          urgency = 'emergency';
          category = 'Urgent Hazard / Field Emergency';
          summary = 'Severe time-sensitive request detected. LeadSortix AI priority router bypasses email delays.';
          hotline = '+1 (800) 555-PLUMB';
          actionTitle = '🚨 High-Urgency Emergency Triage Activated';
          actionText = 'Direct phone hotline auto-dialer active. SMS alert dispatched to on-call contractor.';
        } else if (hasRoutine) {
          score = Math.floor(Math.random() * 20) + 25; // 25 - 45
          urgency = 'routine';
          category = 'Routine Project Inquiry';
          summary = 'Standard consultation inquiry. Cal.com / Calendly calendar booking link drafted.';
          calendarUrl = 'https://cal.com/leadsortix-demo/consultation';
          actionTitle = '📅 Automated Calendar Consultation Routing';
          actionText = 'In-app AI responder dispatched a tailored email with embedded calendar booking link.';
        } else {
          score = Math.floor(Math.random() * 30) + 15; // 15 - 45
          urgency = 'routine';
          category = 'General Consultation';
          summary = 'Standard inquiry. Routed to normal business queue and automated follow-up.';
          calendarUrl = 'https://calendly.com/leadsortix-demo/general';
          actionTitle = '📅 Routine Consultation Routing';
          actionText = 'Acknowledgment email delivered via Resend REST API (99.9% inbox deliverability).';
        }
      }

      renderOutcome({
        score,
        urgency,
        category,
        summary,
        latency,
        modelName: profile.name,
        modelKey,
        hotline,
        calendarUrl,
        actionTitle,
        actionText,
        name: leadNameInput.value || 'Valued Lead',
        phone: leadPhoneInput.value || '+1 (555) 000-0000',
        email: leadEmailInput.value || 'lead@example.com',
        source: leadSourceSelect.value
      });

      progressBar.style.width = '0%';
      btnRunTriage.disabled = false;
      btnRunTriage.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span>Run AI Triage Test</span>
      `;
    }, Math.max(300, typeof latency === 'number' ? Math.min(latency + 100, 650) : 400));
  }

  // Render Outcome to UI
  function renderOutcome(res) {
    // 1. Latency badge
    const unit = res.modelKey === 'heuristic' ? 'ms (Offline)' : 'ms';
    latencyBadge.innerHTML = `⚡ ${res.latency} ${unit} • ${res.modelName.split(' ')[0]}`;

    // 2. Score Circular Gauge (SVG circumference is ~200)
    scoreNumber.textContent = `${res.score}`;
    const maxOffset = 200;
    const progressOffset = maxOffset - (maxOffset * res.score) / 100;
    scoreCircleProgress.style.strokeDashoffset = progressOffset;

    if (res.urgency === 'emergency') {
      scoreCircleProgress.style.stroke = 'var(--neon-red)';
      outcomeTag.className = 'outcome-tag is-emergency';
      outcomeTag.innerHTML = `
        <span class="pulse-indicator" style="background:var(--neon-red);box-shadow:0 0 8px var(--neon-red)"></span>
        <span>High-Urgency Emergency (${res.score}/100)</span>
      `;
      outcomeTitle.textContent = `Immediate Operator Intervention Required`;
      outcomeDesc.textContent = res.summary;

      // Dynamic Action Card: Emergency Hotline
      dynamicActionCard.className = 'generated-action-card type-emergency';
      dynamicActionCard.innerHTML = `
        <div class="action-card-header">
          <div class="action-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--flame-500)" stroke-width="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>${res.actionTitle}</span>
          </div>
          <span class="action-card-badge" style="background:rgba(239,68,68,0.2);color:#fca5a5;border:1px solid rgba(239,68,68,0.4)">Sub-Second Route</span>
        </div>
        <div class="action-card-preview-text" style="border-left-color: var(--flame-500)">
          <strong>Lead:</strong> ${res.name} (${res.phone})<br/>
          <strong>Triage Reason:</strong> ${res.category} detected from ${res.source}.<br/>
          <strong>Action:</strong> Automated notification pushed to operator desk. Direct call link armed.
        </div>
        <a href="tel:${res.hotline || '+18005557582'}" class="sim-action-btn-main emergency-mode" id="btn-hotline-dial">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span>Call Emergency Hotline (${res.hotline || '+1 800-555-7582'})</span>
        </a>
      `;

      playSound('emergency');
    } else {
      scoreCircleProgress.style.stroke = 'var(--indigo-400)';
      outcomeTag.className = 'outcome-tag is-booking';
      outcomeTag.innerHTML = `
        <span class="pulse-indicator" style="background:var(--indigo-400);box-shadow:0 0 8px var(--indigo-400)"></span>
        <span>Routine Consultation (${res.score}/100)</span>
      `;
      outcomeTitle.textContent = `Direct Calendar Consultation Route`;
      outcomeDesc.textContent = res.summary;

      // Dynamic Action Card: Calendar Consultation
      dynamicActionCard.className = 'generated-action-card type-booking';
      dynamicActionCard.innerHTML = `
        <div class="action-card-header">
          <div class="action-card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo-400)" stroke-width="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${res.actionTitle}</span>
          </div>
          <span class="action-card-badge" style="background:rgba(99,102,241,0.2);color:#c7d2fe;border:1px solid rgba(99,102,241,0.4)">Zero Friction</span>
        </div>
        <div class="action-card-preview-text" style="border-left-color: var(--indigo-400)">
          <strong>Recipient:</strong> ${res.email}<br/>
          <strong>AI Response Draft:</strong> "Thank you for contacting us, ${res.name}. We have reviewed your request regarding ${res.category.toLowerCase()}. Click below to lock in a 15-minute consultation."
        </div>
        <a href="#calendar-demo" class="sim-action-btn-main booking-mode" onclick="alert('Demo: Redirecting to embedded Cal.com / Calendly calendar view for ${res.name}!')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Book Consultation (Cal.com / Calendly)</span>
        </a>
      `;

      playSound('success');
    }

    // 3. Raw JSON Output for Developers
    const rawPayload = {
      status: "success",
      triage_id: `lsx_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      lead_profile: {
        name: res.name,
        phone: res.phone,
        email: res.email,
        form_interceptor: res.source
      },
      evaluation: {
        urgency_score: res.score,
        classification: res.urgency === 'emergency' ? 'EMERGENCY_HOTLINE' : 'CALENDAR_CONSULTATION',
        category: res.category,
        sentiment: res.score > 60 ? 'HIGH_STRESS_URGENT' : 'NEUTRAL_INQUIRY',
        model_used: res.modelName,
        latency_ms: res.latency
      },
      action_execution: {
        routed_branch: res.urgency === 'emergency' ? 'BRANCH_1_PHONE_HOTLINE' : 'BRANCH_2_CALENDAR_RESEND',
        operator_hotline: res.urgency === 'emergency' ? res.hotline : null,
        calendar_invite_url: res.urgency === 'routine' ? res.calendarUrl : null,
        transactional_mailer: 'Resend_REST_v1',
        primary_inbox_deliverability: '99.9%'
      },
      security_audit: {
        nonce_verified: true,
        wordpress_transient_rate_limit: "PASS (<10 req/min)",
        dde_csv_injection_sanitized: true,
        gdpr_remote_tracking_blocked: true
      }
    };

    rawJsonOutput.textContent = JSON.stringify(rawPayload, null, 2);
  }

  // Event Listeners
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      loadPreset(presetKey);
    });
  });

  btnRunTriage.addEventListener('click', () => {
    executeTriageAnalysis();
  });

  btnResetSim.addEventListener('click', () => {
    loadPreset('emergency_pipe');
  });

  if (rawJsonToggle) {
    rawJsonToggle.addEventListener('click', () => {
      const isOpen = rawJsonOutput.classList.toggle('open');
      rawJsonIcon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  }

  // Initialize with the first emergency preset on page load
  loadPreset('emergency_pipe');

})();
