document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('mainContent');
  const cover = document.getElementById('cover');
  const enterBtn = document.getElementById('enterBtn');
  const content = document.getElementById('content');
  const tocList = document.getElementById('tocList');
  const fontSizeControl = document.getElementById('fontSize');
  const toggleThemeBtn = document.getElementById('toggleTheme');

  enterBtn.onclick = () => {
    cover.style.display = 'none';
    mainContent.classList.remove('hidden');
    generateSections();
    generateTOC();
  };

  function generateSections() {
    const paragraphs = Array.from(content.querySelectorAll('p'));
    content.innerHTML = ''; // Clear raw content

    const sectionSize = 3;
    for (let i = 0; i < paragraphs.length; i += sectionSize) {
      const section = document.createElement('section');
      section.id = `section${(i / sectionSize) + 1}`;
      for (let j = i; j < i + sectionSize && j < paragraphs.length; j++) {
        section.appendChild(paragraphs[j]);
      }
      content.appendChild(section);
    }
  }

  function generateTOC() {
    tocList.innerHTML = '';
    const sections = content.querySelectorAll('section');
    sections.forEach((section) => {
      let title = section.querySelector('p')?.textContent.trim() || 'अनाम विभाग';
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${section.id}`;
      a.textContent = title;
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  fontSizeControl.oninput = () => {
    content.style.fontSize = fontSizeControl.value + 'px';
  };

  toggleThemeBtn.onclick = () => {
    document.body.classList.toggle('night');
  };
});
