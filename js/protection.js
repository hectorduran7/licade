/**
 * protection.js — Protección de código fuente y bloqueo de inspector
 * La Biblioteca de ADE (UNGS)
 */
(function () {
  'use strict';

  // 1. Bloquear menú contextual (clic derecho)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Bloquear atajos de teclado de desarrollo, inspección y copia
  document.addEventListener('keydown', function (e) {
    var key = (e.key || '').toLowerCase();
    var code = e.code || '';
    var isCtrl = e.ctrlKey || e.metaKey; // Windows/Linux Ctrl o macOS Cmd
    var isAlt = e.altKey;
    var isShift = e.shiftKey;
    var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
    var isInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA';

    // F12
    if (code === 'F12' || key === 'f12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (DevTools Inspector)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
    // Ctrl+Shift+K / Cmd+Option+K (Firefox Console)
    // Ctrl+Shift+E / Cmd+Option+E (Network)
    if (isCtrl && (isShift || isAlt) && (key === 'i' || key === 'j' || key === 'c' || key === 'k' || key === 'e')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U / Cmd+U (Ver código fuente)
    if (isCtrl && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Guardar página)
    if (isCtrl && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+C / Cmd+C (Copiar código fuera de campos de entrada)
    if (isCtrl && key === 'c' && !isInput) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Bloquear evento copy fuera de inputs/textareas
  document.addEventListener('copy', function (e) {
    var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
    if (targetTag !== 'INPUT' && targetTag !== 'TEXTAREA') {
      e.preventDefault();
      return false;
    }
  });

  // 4. Detección heurística de apertura de DevTools
  var threshold = 160;
  var devtoolsOpen = false;

  function checkDevTools() {
    var widthDiff = window.outerWidth - window.innerWidth;
    var heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        try {
          window.location.replace(window.location.href.split('?')[0]);
        } catch (err) {}
      }
    } else {
      devtoolsOpen = false;
    }
  }

  setInterval(checkDevTools, 1200);
})();
