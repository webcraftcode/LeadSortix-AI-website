/**
 * LeadSortix AI – Main Application & UI Interactions
 * Handles sticky nav, drawer toggle, FAQ accordion, clipboard helpers, and ecosystem inspection
 */

(function () {
  'use strict';

  // 1. Sticky Navigation on Scroll
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    // Close when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // 3. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question-btn');
    questionBtn?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close other items
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });

  // 4. Slide-Over Admin Drawer Mockup Toggle
  const openDrawerBtns = document.querySelectorAll('[data-open-drawer]');
  const closeDrawerBtns = document.querySelectorAll('[data-close-drawer]');
  const slideDrawer = document.getElementById('wp-admin-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  function openDrawer() {
    slideDrawer?.classList.add('open');
    drawerBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    slideDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  openDrawerBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  closeDrawerBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  drawerBackdrop?.addEventListener('click', closeDrawer);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // 5. Copy to Clipboard Utility
  const copyBtns = document.querySelectorAll('[data-copy-target]');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.dataset.copyTarget;
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const textToCopy = targetEl.innerText || targetEl.textContent;
      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Copied!
        `;
        btn.style.color = 'var(--emerald-400)';
        btn.style.borderColor = 'var(--emerald-500)';

        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2200);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    });
  });

  // 6. Ecosystem Form Plugin Inspector
  const formCards = document.querySelectorAll('.form-compat-card');
  const hookModal = document.getElementById('ecosystem-hook-modal');
  const hookModalTitle = document.getElementById('hook-modal-title');
  const hookModalCode = document.getElementById('hook-modal-code');
  const hookModalDesc = document.getElementById('hook-modal-desc');

  const HOOK_DETAILS = {
    'Contact Form 7': {
      hook: `add_action('wpcf7_mail_sent', function($contact_form) {\n    $submission = WPCF7_Submission::get_instance();\n    LeadSortix_AI::triage_submission($submission->get_posted_data(), 'cf7');\n});`,
      desc: 'Seamlessly intercepts after form validation. No JavaScript tampering or layout changes.'
    },
    'Elementor Forms': {
      hook: `add_action('elementor_pro/forms/new_record', function($record, $handler) {\n    $raw_fields = $record->get('fields');\n    LeadSortix_AI::triage_elementor($raw_fields);\n}, 10, 2);`,
      desc: 'Captures both Elementor popup and inline forms with full hidden field mapping.'
    },
    'WPForms': {
      hook: `add_action('wpforms_process_complete', function($fields, $entry, $form_data) {\n    LeadSortix_AI::triage_wpforms($fields, $form_data['id']);\n}, 10, 3);`,
      desc: 'Native hook fires on both WPForms Lite and Pro versions instantly.'
    },
    'Forminator': {
      hook: `add_action('forminator_custom_form_submit_before_set_fields', function($entry, $form_id, $field_data) {\n    LeadSortix_AI::triage_forminator($field_data, $form_id);\n}, 10, 3);`,
      desc: 'Hooks before database serialization to evaluate urgency in under 300ms.'
    },
    'Fluent Forms': {
      hook: `add_action('fluentform/submission_inserted', function($entryId, $formData, $form) {\n    LeadSortix_AI::triage_fluent($formData, $form->id);\n}, 10, 3);`,
      desc: 'Zero-latency integration with Fluent Form’s ultra-fast MySQL schema.'
    },
    'Gravity Forms': {
      hook: `add_action('gform_after_submission', function($entry, $form) {\n    LeadSortix_AI::triage_gravity($entry, $form['id']);\n}, 10, 2);`,
      desc: 'Full support for multi-page Gravity Forms and conditional logic fields.'
    },
    'Ninja Forms': {
      hook: `add_action('ninja_forms_after_submission', function($form_data) {\n    LeadSortix_AI::triage_ninja($form_data['fields']);\n});`,
      desc: 'Intercepts submissions after processing pipeline without blocking UI.'
    },
    'Formidable Forms': {
      hook: `add_action('frm_after_create_entry', function($entry_id, $form_id) {\n    LeadSortix_AI::triage_formidable($entry_id, $form_id);\n}, 30, 2);`,
      desc: 'Captures advanced calculation and repeater entries automatically.'
    },
    'REST API Webhook': {
      hook: `POST /wp-json/leadsortix/v1/triage\nHeaders:\n  X-LSX-Secret: [Your_Secret_Key]\n  Content-Type: application/json\nBody:\n  {"name":"Sarah", "message":"Pipe leak", "phone":"+1555..."}`,
      desc: 'Connect Next.js, Webflow, Shopify, or external CRM webhooks directly into the triage engine.'
    }
  };

  formCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.formName;
      const data = HOOK_DETAILS[name];
      if (!data) return;

      if (hookModal && hookModalTitle && hookModalCode && hookModalDesc) {
        hookModalTitle.textContent = `${name} Native Zero-Config Hook`;
        hookModalCode.textContent = data.hook;
        hookModalDesc.textContent = data.desc;
        hookModal.classList.add('active');
      }
    });
  });

  const closeHookModal = document.getElementById('close-hook-modal');
  closeHookModal?.addEventListener('click', () => {
    hookModal?.classList.remove('active');
  });
  hookModal?.addEventListener('click', (e) => {
    if (e.target === hookModal) hookModal.classList.remove('active');
  });

  // 7. Interactive Drawer Action Handlers (in demo)
  const drawerResendSendBtn = document.getElementById('drawer-resend-send-btn');
  const drawerResendStatus = document.getElementById('drawer-resend-status');
  if (drawerResendSendBtn && drawerResendStatus) {
    drawerResendSendBtn.addEventListener('click', () => {
      drawerResendSendBtn.disabled = true;
      drawerResendSendBtn.textContent = 'Transmitting via Resend REST API...';
      
      setTimeout(() => {
        drawerResendStatus.style.display = 'block';
        drawerResendSendBtn.textContent = '✓ Delivered (Status 200 OK)';
        drawerResendSendBtn.style.background = 'var(--emerald-500)';
      }, 700);
    });
  }

  // 8. Dynamic Scroll Spy for Nav links
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNav = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        targetNav?.classList.add('active');
      } else {
        targetNav?.classList.remove('active');
      }
    });
  }, { passive: true });

})();
