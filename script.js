// Play Hindi product brief audio
function playBrief(id) {
  // Pause and reset all audio elements
  document.querySelectorAll('audio').forEach(function(a) {
    a.pause();
    a.currentTime = 0;
  });
  // Play the selected audio
  var audio = document.getElementById(id);
  if (audio) {
    audio.play();
  }
}

// Stop any playing audio (used when navigating between slides)
function stopAllAudio() {
  document.querySelectorAll('audio').forEach(function(a) {
    a.pause();
    a.currentTime = 0;
  });
}

// Smooth page flip navigation
document.addEventListener('DOMContentLoaded', function() {
  // === SWIPE NAVIGATION FOR MOBILE ===
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const SWIPE_THRESHOLD = 50;
  const SWIPE_RESTRAINT = 100; // max vertical movement allowed

  // Ordered list of slide IDs for swipe navigation
  const slideOrder = [];
  document.querySelectorAll('.slide').forEach(function(slide) {
    if (slide.id) slideOrder.push(slide.id);
  });

  function getCurrentSlideIndex() {
    var current = document.querySelector('.slide[style*="display: flex"], .slide:not([style*="display: none"])');
    if (current && current.id) {
      return slideOrder.indexOf(current.id);
    }
    return 0;
  }

  function navigateToSlide(targetId) {
    var targetSlide = document.getElementById(targetId);
    var currentSlide = document.querySelector('.slide[style*="display: flex"], .slide:not([style*="display: none"])');
    
    if (currentSlide && targetSlide && currentSlide !== targetSlide) {
      stopAllAudio();
      currentSlide.classList.add('flip-out');
      
      setTimeout(function() {
        currentSlide.style.display = 'none';
        currentSlide.classList.remove('flip-out');
        
        targetSlide.style.display = 'flex';
        targetSlide.style.animation = 'none';
        setTimeout(function() {
          targetSlide.style.animation = '';
        }, 10);
        
        document.querySelectorAll('.nav-btn').forEach(function(btn) { btn.classList.remove('active'); });
        document.querySelectorAll('a[href="#' + targetId + '"]').forEach(function(btn) { btn.classList.add('active'); });
        
        // Scroll active nav button into view on mobile
        var activeBtn = document.querySelector('.nav-sidebar .nav-btn.active');
        if (activeBtn && window.innerWidth <= 768) {
          activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        
        window.scrollTo({ top: 0 });
      }, 700);
    }
  }

  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    var diffX = touchEndX - touchStartX;
    var diffY = touchEndY - touchStartY;

    // Only register horizontal swipes (not vertical scrolls or taps on nav)
    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffY) < SWIPE_RESTRAINT) {
      var currentIdx = getCurrentSlideIndex();
      
      if (diffX < 0) {
        // Swipe left → next slide
        if (currentIdx < slideOrder.length - 1) {
          navigateToSlide(slideOrder[currentIdx + 1]);
        }
      } else {
        // Swipe right → previous slide
        if (currentIdx > 0) {
          navigateToSlide(slideOrder[currentIdx - 1]);
        }
      }
    }
  }

  // Show swipe hint on first visit (mobile only)
  if (window.innerWidth <= 768 && !sessionStorage.getItem('swipeHintShown')) {
    var hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.textContent = '← Swipe to navigate →';
    document.body.appendChild(hint);
    sessionStorage.setItem('swipeHintShown', '1');
  }

  // PWA Install Button Handling
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');

  // Check if iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Show install button if not already installed
  if (!isStandalone) {
    // For iOS, show button with different behavior
    if (isIOS) {
      installBtn.style.display = 'flex';
      installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        Add to Home Screen
      `;
    } else {
      // For Android/Desktop, show if beforeinstallprompt fires
      installBtn.style.display = 'flex';
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installBtn.style.display = 'flex';
    installBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Install App
    `;
  });

  installBtn.addEventListener('click', async () => {
    if (isIOS) {
      // Show iOS instructions
      alert('To install this app:\n\n1. Tap the Share button (square with arrow)\n2. Scroll and tap "Add to Home Screen"\n3. Tap "Add" in the top right');
      return;
    }
    
    if (!deferredPrompt) {
      // Detect browser type
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = 'To install this app:\n\n';
      
      if (userAgent.includes('chrome')) {
        instructions += '1. Tap the three dots (⋮) in the top right\n2. Tap "Add to Home screen" or "Install app"\n3. Tap "Add" or "Install"';
      } else if (userAgent.includes('firefox')) {
        instructions += '1. Tap the three dots in the address bar\n2. Tap "Install"\n3. Tap "Add" to confirm';
      } else if (userAgent.includes('samsung')) {
        instructions += '1. Tap the menu button\n2. Tap "Add page to"\n3. Tap "Home screen"';
      } else {
        instructions += '1. Look for "Install app" or "Add to Home screen" in your browser menu (⋮)\n2. Follow the prompts to install';
      }
      
      alert(instructions);
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // Clear the deferredPrompt
    deferredPrompt = null;
    // Hide the install button
    installBtn.style.display = 'none';
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    installBtn.style.display = 'none';
  });

  const navButtons = document.querySelectorAll('.nav-btn');
  const slides = document.querySelectorAll('.slide');
  
  // Hide all slides except home initially
  slides.forEach((slide, index) => {
    if (index !== 0) {
      slide.style.display = 'none';
    }
  });
  
  navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      navigateToSlide(targetId);
    });
  });

  // Image Modal Functionality
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <span class="modal-close">&times;</span>
    <img class="modal-content" src="" alt="">
    <div class="modal-caption"></div>
  `;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.modal-content');
  const modalCaption = modal.querySelector('.modal-caption');
  const closeBtn = modal.querySelector('.modal-close');

  // Add click event to all clickable images
  document.querySelectorAll('.clickable-img').forEach(img => {
    img.addEventListener('click', function() {
      modal.classList.add('active');
      modalImg.src = this.src;
      modalCaption.textContent = this.alt;
    });
  });

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function() {
    modal.classList.remove('active');
  });

  // Close modal when clicking outside the image
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Close modal with ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  // Register Service Worker for PWA functionality
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
          // Pre-load all audio files into cache for offline use
          preloadAudioForOffline();
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
});

// Pre-load all audio files so they are cached for offline playback
function preloadAudioForOffline() {
  var allAudio = document.querySelectorAll('audio[src]');
  allAudio.forEach(function(audioEl) {
    var src = audioEl.getAttribute('src');
    if (src) {
      // Fetch the audio file to trigger the service worker to cache it
      fetch(src).then(function() {
        console.log('Pre-cached audio:', src);
      }).catch(function(e) {
        console.warn('Failed to pre-cache audio:', src, e);
      });
    }
  });
}

