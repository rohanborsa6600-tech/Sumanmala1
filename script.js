document.addEventListener('DOMContentLoaded', () => {
  const tocList = document.getElementById('tocList');
  const mainContent = document.getElementById('main-content');

  function generateTOC() {
    const sections = mainContent.querySelectorAll('section');
    tocList.innerHTML = '';

    sections.forEach((section, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = section.querySelector('h2,h3,h4')?.textContent || `विभाग ${i + 1}`;
      a.href = `#${section.id}`;
      a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        setActive(a);
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  function setActive(activeLink) {
    tocList.querySelectorAll('a').forEach(link => {
      link.classList.toggle('active', link === activeLink);
    });
  }

  // IntersectionObserver to update active TOC on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        const id = entry.target.id;
        const activeLink = tocList.querySelector(`a[href="#${id}"]`);
        if(activeLink) setActive(activeLink);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('section').forEach(section => observer.observe(section));

  // Ripple effect on TOC click
  tocList.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'a') {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      e.target.appendChild(ripple);
      const rect = e.target.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.addEventListener('animationend', () => ripple.remove());
    }
  });

  generateTOC();
});
