/* GA4 generate_lead on submit of the request-info (contact) form.
   Fires before the FormSubmit POST navigates away. The submit waits for
   gtag's event_callback but never longer than a short timeout, so it is
   never blocked (ad blockers, gtag.js not loaded, slow network).
   Params carry no personal data: only a fixed form_name. */
(function () {
  var form = document.getElementById('request-info');
  if (!form || typeof window.gtag !== 'function') return;
  form.addEventListener('submit', function (e) {
    var honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return; // likely a bot: submit as-is, no event
    e.preventDefault();
    var sent = false;
    function go() {
      if (sent) return;
      sent = true;
      HTMLFormElement.prototype.submit.call(form); // does not re-fire 'submit'
    }
    window.gtag('event', 'generate_lead', {
      form_name: 'santosh_contact',
      transport_type: 'beacon',
      event_callback: go,
      event_timeout: 800
    });
    setTimeout(go, 1000); // fallback if gtag.js never loaded
  });
})();
