
  // Simple accessible Accordion script
  document.addEventListener('DOMContentLoaded', function() {
    const triggers = document.querySelectorAll('.faq-trigger');
    
    triggers.forEach(trigger => {
      trigger.addEventListener('click', function() {
        const item = this.parentElement;
        const content = item.querySelector('.faq-content');
        const icon = this.querySelector('.faq-icon');
        const isOpen = !content.classList.contains('hidden');

        // Close all other items in this accordion
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

        if (!isOpen) {
          content.classList.remove('hidden');
          icon.classList.add('rotate-180');
        }
      });
    });
  });
