  // ==========================================
  // ეტაპი 5.3: Dark Mode გლობალური ლოგიკა
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // 1. გვერდის ჩატვირთვისას ვამოწმებთ, რა თემა იყო შენახული ბაზაში
  const savedTheme = localStorage.getItem('crm_theme') || 'light';
  
  // ვადებთ ბრაუზერის მთავარ HTML ტეგს შესაბამის ატრიბუტს
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // ღილაკის იკონის განახლება მიმდინარე თემის მიხედვით
  if (themeToggleBtn) {
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  }

  // 2. ღილაკზე კლიკის ივენთი (თემის შეცვლა)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let newTheme = 'light';

      if (currentTheme === 'light') {
        newTheme = 'dark';
        themeToggleBtn.textContent = '☀️'; // მუქ თემაზე გამოჩნდეს მზის იკონი
      } else {
        newTheme = 'light';
        themeToggleBtn.textContent = '🌙'; // ღია თემაზე გამოჩნდეს მთვარის იკონი
      }

      // ვადებთ ახალ ატრიბუტს და ვინახავთ LocalStorage-ში
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('crm_theme', newTheme);
    });
  }
