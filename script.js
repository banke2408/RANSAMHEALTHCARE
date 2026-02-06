// Smooth page flip navigation
document.addEventListener('DOMContentLoaded', function() {
  // PWA Install Button Handling
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installBtn.style.display = 'flex';
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) {
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
      const targetSlide = document.getElementById(targetId);
      const currentSlide = document.querySelector('.slide[style*="display: flex"], .slide:not([style*="display: none"])');
      
      if (currentSlide && targetSlide && currentSlide !== targetSlide) {
        // Add flip-out animation to current slide
        currentSlide.classList.add('flip-out');
        
        setTimeout(() => {
          currentSlide.style.display = 'none';
          currentSlide.classList.remove('flip-out');
          
          // Show and animate target slide
          targetSlide.style.display = 'flex';
          targetSlide.style.animation = 'none';
          setTimeout(() => {
            targetSlide.style.animation = '';
          }, 10);
          
          // Update active state
          document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
          document.querySelectorAll(`a[href="#${targetId}"]`).forEach(btn => btn.classList.add('active'));
          
          // Scroll to top
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 700);
      }
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
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
});

