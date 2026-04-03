document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = this.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var submitButton = contactForm.querySelector('button[type="submit"]');
    var submitOriginalText = submitButton ? submitButton.textContent : 'Send Message';

    function setSubmitting(isBusy) {
      if (!submitButton) return;
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? 'Sending…' : submitOriginalText;
      submitButton.classList.toggle('sending', isBusy);
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      setSubmitting(true);
      var endpoint = contactForm.action;
      var errorMessage = document.getElementById('form-error');
      var successMessage = document.getElementById('form-success');
      var formData = new FormData(contactForm);

      if (endpoint.includes('your-form-id-goes-here') || endpoint.includes('{yourFormID}')) {
        setSubmitting(false);
        errorMessage.hidden = false;
        successMessage.hidden = true;
        return;
      }

      errorMessage.hidden = true;

      fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      }).then(function (response) {
        if (response.ok) {
          successMessage.hidden = false;
          contactForm.reset();
          errorMessage.hidden = true;
        } else {
          return response.json().then(function (data) {
            throw new Error(data.error || 'Form submission failed.');
          });
        }
      }).catch(function (error) {
        errorMessage.textContent = 'Sorry, there was a problem sending your message. Please try again later.';
        errorMessage.hidden = false;
        successMessage.hidden = true;
        console.error(error);
      }).finally(function () {
        setSubmitting(false);
      });
    });
  }

  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav.classList.contains('nav-open')) {
          nav.classList.remove('nav-open');
        }
      });
    });
  }

  var modeToggle = document.getElementById('mode-toggle');
  var body = document.body;
  var savedTheme = localStorage.getItem('aurora-theme');

  function applyTheme(theme) {
    body.classList.remove('dark-mode', 'light-mode');
    body.classList.add(theme + '-mode');
    document.documentElement.setAttribute('data-theme', theme);
  }

  function getInitialTheme() {
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.textContent = message;
    body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('visible');
    });
    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 1700);
  }

  function toggleTheme() {
    var isDark = body.classList.contains('dark-mode');
    var nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('aurora-theme', nextTheme);
    updateModeButton();
    showToast('Switched to ' + nextTheme + ' mode');
  }

  var activeTheme = getInitialTheme();
  applyTheme(activeTheme);

  if (modeToggle) {
    function updateModeButton() {
      if (body.classList.contains('dark-mode')) {
        modeToggle.textContent = 'Light mode ☀️';
        modeToggle.setAttribute('aria-label', 'Switch to light mode');
      } else {
        modeToggle.textContent = 'Dark mode 🌙';
        modeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }

    updateModeButton();

    modeToggle.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        toggleTheme();
      }
    });
  }
});
