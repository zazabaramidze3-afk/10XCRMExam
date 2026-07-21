document.addEventListener('DOMContentLoaded', () => {
  // 1. წამოვიღოთ კლიენტების მონაცემები (თქვენთან ბაზაში ქვია 'crm_clients')
  const savedClients = JSON.parse(localStorage.getItem('crm_clients')) || [];

  // 2. მომხმარებლის რეალური სახელის წამოღება (თქვენთან ბაზაში ქვია 'crm_session')
  const sessionData = localStorage.getItem('crm_session');
  
  if (sessionData) {
    try {
      const userObj = JSON.parse(sessionData);
      // სკრინშოტის მიხედვით, ობიექტში ველს ქვია 'fullName'
      if (userObj && userObj.fullName) {
        document.getElementById('userName').textContent = userObj.fullName;
      } else {
        document.getElementById('userName').textContent = 'მომხმარებელო';
      }
    } catch (error) {
      console.error("სესიის მონაცემების წაკითხვის შეცდომა:", error);
      document.getElementById('userName').textContent = 'მომხმარებელო';
    }
  } else {
    document.getElementById('userName').textContent = 'სტუმარო';
  }

  // თუ მასივი ცარიელია, ეკრანზე ნულები დარჩება და კონსოლში დაგვილოგავს
  if (savedClients.length === 0) {
    console.warn("LocalStorage-ში კლიენტები ვერ მოიძებნა!");
    return;
  }

  // 2. მეტრიკების დათვლა reduce-ით
  const metrics = savedClients.reduce((acc, client) => {
    // დარწმუნდით, რომ PRD-ის მიხედვით ველს ჰქვია 'dealValue'
    const value = Number(client.dealValue) || 0; 
    
    // ჯამი
    acc.totalPipelineValue += value;

    // სტატუსების შემოწმება (toUpperCase() თავიდან აგვაცილებს "won" და "WON" ქეისებს)
    const status = client.status ? client.status.toUpperCase() : '';

    if (status === 'WON') {
      acc.wonRevenue += value;
      acc.wonCount += 1;
    } else if (status === 'LOST') {
      acc.lostCount += 1;
    }

    return acc;
  }, {
    totalPipelineValue: 0,
    wonRevenue: 0,
    wonCount: 0,
    lostCount: 0,
    totalCount: savedClients.length
  });

  // 3. კონვერტაციის კურსის ფორმულა
  const totalClosed = metrics.wonCount + metrics.lostCount;
  const conversionRate = totalClosed > 0 ? ((metrics.wonCount / totalClosed) * 100).toFixed(1) : 0;

  // 4. DOM-ში მნიშვნელობების დასმა (დარწმუნდით, რომ HTML-ში ID-ები ემთხვევა)
  document.getElementById('totalPipeline').textContent = `$${metrics.totalPipelineValue.toLocaleString()}`;
  document.getElementById('wonRevenue').textContent = `$${metrics.wonRevenue.toLocaleString()}`;
  document.getElementById('conversionRate').textContent = `${conversionRate}%`;
  document.getElementById('totalClients').textContent = metrics.totalCount;
});

  // --- ეტაპი 4.1: მისალმების ზოლი და ცოცხალი საათი ---
  
   // 1. მომხმარებლის რეალური სახელის წამოღება სესიიდან (current_session)
  const sessionData = localStorage.getItem('crm_session');
  
  if (sessionData) {
    try {
      const userObj = JSON.parse(sessionData);
      // თუ ობიექტში არის 'name' ველი, ჩავსვათ ეკრანზე
      if (userObj && userObj.name) {
        document.getElementById('userName').textContent = userObj.name;
      } else {
        document.getElementById('userName').textContent = 'მომხმარებელო';
      }
    } catch (error) {
      console.error("სესიის მონაცემების წაკითხვის შეცდომა:", error);
      document.getElementById('userName').textContent = 'მომხმარებელო';
    }
  } else {
    document.getElementById('userName').textContent = 'სტუმარო';
  }

  // 2. ცოცხალი საათის მართვა
  const timeEl = document.getElementById('liveTime');
  const dateEl = document.getElementById('currentDate');

  const updateClock = () => {
    const now = new Date();
    
    // დროის ფორმატირება (HH:MM:SS) ქართული ლოკალით
    timeEl.textContent = now.toLocaleTimeString('ka-GE', { hour12: false });
    
    // თარიღის ფორმატირება (მაგ: 21 ივლ. 2026)
    dateEl.textContent = now.toLocaleDateString('ka-GE', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // პირველივე გაშვება (რომ 00:00:00 არ დააყოვნოს 1 წამით)
  updateClock(); 
  
  // ყოველ წამში საათის განახლება
  setInterval(updateClock, 1000);
