document.addEventListener('DOMContentLoaded', () => {
  // 1. წამოვიღოთ მონაცემები (შეცვალეთ 'clients' იმ ქიით, რაც რეალურად გიწერიათ ბაზაში)
  const savedClients = JSON.parse(localStorage.getItem('crm_clients')) || [];

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
