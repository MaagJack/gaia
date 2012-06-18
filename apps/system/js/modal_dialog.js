/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

// The modal dialog listen to mozbrowsershowmodalprompt event.
// Blocking the current app and then show cutom modal dialog
// (alert/confirm/prompt)

var ModalDialog = {
  blocked: false,
  promptType: null,
  cancel: function cancelDialog() {
    // Create a virtual mouse event
    var evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, false);

    switch (this.promptType) {
      case 'alert':
        document.getElementById('alert-ok').dispatchEvent(evt);
      break;
      case 'prompt':
        document.getElementById('prompt-cancel').dispatchEvent(evt);
      break;
      case 'confirm':
        document.getElementById('confirm-cancel').dispatchEvent(evt);
      break;
      default:
      break;
    }
  }
};

(function customModalDialog() {
    window.addEventListener('mozbrowsershowmodalprompt', function(ev) {
      ev.preventDefault();

      var alert_ok = document.getElementById('alert-ok');
      var prompt_ok = document.getElementById('prompt-ok');
      var prompt_cancel = document.getElementById('prompt-cancel');
      var confirm_ok = document.getElementById('confirm-ok');
      var confirm_cancel = document.getElementById('confirm-cancel');

      /* event listener function for all modal dialog buttons */
      var clickHandler = function customClickHandler(event) {
        document.getElementById('modal_dialog').classList.remove('visible');

        switch (ev.detail.promptType) {
          case 'alert':
            alert_ok.removeEventListener('click', clickHandler);
            document.getElementById('alert').classList.remove('visible');
            break;
          case 'prompt':
            /* return null when click cancel */
            prompt_ok.removeEventListener('click', clickHandler);
            prompt_cancel.addEventListener('click', clickHandler);
            if (event.target.dataset.buttonType == 'yes') {
              var input = document.getElementById('prompt-input');
              ev.detail.returnValue = input.value;
            }
            else
            {
              ev.detail.returnValue = null;
            }
            document.getElementById('prompt').classList.remove('visible');
            break;
          case 'confirm':
            /* return false when click cancel */
            confirm_ok.removeEventListener('click', clickHandler);
            confirm_cancel.removeEventListener('click', clickHandler);
            if (event.target.dataset.buttonType == 'yes') {
              ev.detail.returnValue = true;
            }
            else
            {
              ev.detail.returnValue = false;
            }
            document.getElementById('confirm').classList.remove('visible');
            break;
          default:
            break;
        }
        ev.detail.unblock();

        // Let WindowManager know it can return to home now.
        ModalDialog.blocked = false;
        ModalDialog.promptType = null;
      };

      document.getElementById('modal_dialog').classList.add('visible');
      ModalDialog.blocked = true;

      var message = ev.detail.message;

      switch (ev.detail.promptType) {
        case 'alert':
          alert_ok.addEventListener('click', clickHandler);
          document.getElementById('alert-message').textContent = message;
          document.getElementById('alert').classList.add('visible');
          break;
        case 'prompt':
          var initial = ev.detail.promptType;
          prompt_ok.addEventListener('click', clickHandler);
          prompt_cancel.addEventListener('click', clickHandler);
          document.getElementById('prompt').classList.add('visible');
          document.getElementById('prompt-input').value = initial;
          document.getElementById('prompt-message').textContent = message;
          break;
        case 'confirm':
          confirm_ok.addEventListener('click', clickHandler);
          confirm_cancel.addEventListener('click', clickHandler);
          document.getElementById('confirm').classList.add('visible');
          document.getElementById('confirm-message').textContent = message;
          break;
        default:
          break;
      }
      ModalDialog.promptType = ev.detail.promptType;
  });
})();
