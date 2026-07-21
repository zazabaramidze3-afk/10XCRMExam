// ==========================================================================
// 1. კონფიგურაცია და გლობალური ცვლადები
// ==========================================================================
const ALLOWED_STATUSES = ["Lead", "Contacted", "Won", "Lost"];

const clientsContainer = document.getElementById("clients-container");
const addClientModal = document.getElementById('add-client-modal');
const openModalBtn = document.getElementById('btn-add-client');
const closeModalBtn = document.getElementById('btn-close-modal');
const addClientForm = document.getElementById('add-client-form');

// ==========================================================================
// 2. გვერდის ინიციალიზაცია და API FETCH (ეტაპი 3.1)
// ==========================================================================

// გვერდის ჩატვირთვის მთავარი ფუნქცია
async function initClientsPage() {
    let clients = StorageManager.get("crm_clients");

    // თუ ლოკალური ბაზა ცარიელია, მივმართავთ API-ს
    if (!clients) {
        clients = await fetchClientsFromAPI();
    }

    // თუ მონაცემები გვაქვს, გადავცემთ რენდერის ფუნქციას
    if (clients) {
        renderClients(clients);
    }
}

// ასინქრონული ფუნქცია API-დან 30 იუზერის წამოსაღებად
async function fetchClientsFromAPI() {
    try {
        const response = await fetch("https://dummyjson.com/users?limit=30");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // მონაცემთა ტრანსფორმაცია PRD სტრუქტურის მიხედვით
        const transformedClients = data.users.map(user => {
            const randomStatus = ALLOWED_STATUSES[Math.floor(Math.random() * ALLOWED_STATUSES.length)];
            const randomDealValue = Math.floor(Math.random() * 14500) + 500;

            return {
                id: user.id, // რიცხვითი ID მარტივი წაშლისთვის
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone || "",
                company: user.company?.name || "Independent Contractor",
                status: randomStatus,
                dealValue: randomDealValue,
                image: user.image,
                notes: [],
                createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString()
            };
        });

        // მასივის შენახვა ლოკალურად
        StorageManager.set("crm_clients", transformedClients);
        return transformedClients;

    } catch (error) {
        console.error("კლიენტების წამოღება API-დან ჩავარდა:", error);

        if (clientsContainer) {
            clientsContainer.innerHTML = "";

            const errorDiv = document.createElement("div");
            errorDiv.className = "error-state";

            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Failed to load clients. Please check your internet connection.";

            const retryButton = document.createElement("button");
            retryButton.className = "btn-primary";
            retryButton.textContent = "Retry";
            retryButton.addEventListener("click", initClientsPage);

            errorDiv.appendChild(errorMessage);
            errorDiv.appendChild(retryButton);
            clientsContainer.appendChild(errorDiv);
        }
        return null;
    }
}

// ==========================================================================
// 3. DOM რენდერი (ეტაპი 3.2)
// ==========================================================================

// კლიენტების ბარათების დინამიური აწყობა HTML-ში
function renderClients(clientsList) {
    if (!clientsContainer) return;
    
    clientsContainer.innerHTML = ""; 

    if (clientsList.length === 0) {
        clientsContainer.innerHTML = `<p class="no-clients">No clients found</p>`;
        return;
    }

    clientsList.forEach(client => {
        const card = document.createElement("div");
        card.className = `client-card status-${client.status.toLowerCase()}`;
        card.setAttribute("data-id", client.id);

        // ა) ჰედერი: ავატარი და სტატუსი
        const headerNode = document.createElement("div");
        headerNode.className = "card-header";

        const avatarNode = document.createElement("img");
        avatarNode.className = "client-avatar";
        avatarNode.src = client.image;
        avatarNode.alt = client.name;
        avatarNode.style.width = "50px"; 
        avatarNode.style.borderRadius = "50%";

        const statusNode = document.createElement("span");
        statusNode.className = `status-badge ${client.status.toLowerCase()}`;
        statusNode.textContent = client.status;

        headerNode.appendChild(avatarNode);
        headerNode.appendChild(statusNode);

        // ბ) ბოდი: ინფორმაცია
        const bodyNode = document.createElement("div");
        bodyNode.className = "card-body";

        const nameNode = document.createElement("h3");
        nameNode.textContent = client.name; // XSS დაცვა

        const companyNode = document.createElement("p");
        companyNode.className = "company";
        companyNode.textContent = `Company: ${client.company}`;

        const emailNode = document.createElement("p");
        emailNode.className = "email";
        emailNode.textContent = `Email: ${client.email}`;

        bodyNode.appendChild(nameNode);
        bodyNode.appendChild(companyNode);
        bodyNode.appendChild(emailNode);

        // გ) ფუტერი: თანხა და წაშლის ღილაკი
        const footerNode = document.createElement("div");
        footerNode.className = "card-footer";
        
        const valueNode = document.createElement("span");
        valueNode.className = "deal-value";
        valueNode.textContent = `Value: $${client.dealValue.toLocaleString()}`;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn-delete";
        deleteBtn.textContent = "Delete";
        // წაშლის ივენთის მიბმა პირდაპირ JS-იდან
        deleteBtn.addEventListener("click", () => deleteClient(client.id));

        footerNode.appendChild(valueNode);
        footerNode.appendChild(deleteBtn);

        card.appendChild(headerNode);
        card.appendChild(bodyNode);
        card.appendChild(footerNode);

        clientsContainer.appendChild(card);
    });
}

// ==========================================================================
// 4. კლიენტის წაშლა (ეტაპი 3.4)
// ==========================================================================
function deleteClient(clientId) {
    const isConfirmed = confirm("Are you sure you want to delete this client?");
    
    if (!isConfirmed) return;

    let currentClients = StorageManager.get("crm_clients") || [];

    // მასივის გაფილტვრა წასაშლელი ID-ის გარეშე
    currentClients = currentClients.filter(client => client.id !== clientId);

    StorageManager.set("crm_clients", currentClients);
    renderClients(currentClients);

    if (typeof showToast === 'function') {
        showToast('Client deleted successfully', 'success');
    }
}
// ==========================================================================
// 5. მოდალის მართვა და დამხმარე ფუნქციები (ეტაპი 3.3)
// ==========================================================================

// მოდალის დახურვის და ფორმის ველების სრული გასუფთავების ფუნქცია
function closeAndResetModal() {
    if (addClientModal) addClientModal.style.display = 'none';
    if (addClientForm) addClientForm.reset();
    
    // შეცდომების ტექსტებისა და წითელი ჩარჩოების მოხსნა
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    document.querySelectorAll('input, select').forEach(el => el.classList.remove('input-error'));
}

// დამხმარე ფუნქცია კონკრეტულ ველზე შეცდომის ვიზუალურად გამოსატანად
function showFieldError(inputId, errorSpanId, errorMessage) {
    const inputElement = document.getElementById(inputId);
    const errorSpanElement = document.getElementById(errorSpanId);
    
    if (inputElement) inputElement.classList.add('input-error');
    if (errorSpanElement) errorSpanElement.textContent = errorMessage;
}


// ==========================================================================
// 6. ივენთები და ფორმის ვალიდაცია / საბმიტი (ეტაპი 3.3)
// ==========================================================================

// მოდალის გახსნა "Add Client" ღილაკზე დაჭერისას
if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        if (addClientModal) addClientModal.style.display = 'flex';
    });
}

// მოდალის დახურვა "X" ღილაკზე დაჭერისას
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAndResetModal);
}

// მოდალის დახურვა ფონზე (მუქ სივრცეზე) დაჭერისას
window.addEventListener('click', (e) => {
    if (e.target === addClientModal) {
        closeAndResetModal();
    }
});

// ფორმის გაგზავნის და კომპლექსური ვალიდაციის ლოგიკა
if (addClientForm) {
    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // გვერდის გადატვირთვის მყისიერი ბლოკირება

        // ძველი შეცდომების სრული ქლიარი ახალი შემოწმების წინ
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
        document.querySelectorAll('input, select').forEach(el => el.classList.remove('input-error'));

        // მნიშვნელობების ამოღება ზუსტად HTML ინპუტებიდან
        const nameVal = document.getElementById('client-name').value.trim();
        const emailVal = document.getElementById('client-email').value.trim();
        const phoneVal = document.getElementById('client-phone').value.trim();
        const companyVal = document.getElementById('client-company').value.trim();
        const dealValueVal = document.getElementById('client-value').value.trim();
        const statusVal = document.getElementById('client-status').value;

        let hasError = false;
        const currentClients = StorageManager.get('crm_clients') || [];

        // ა) Name ვალიდაცია (მინიმუმ 3 სიმბოლო)
        if (nameVal.length < 3) {
            showFieldError('client-name', 'nameError', 'Name must be at least 3 characters');
            hasError = true;
        }

        // ბ) Email ვალიდაცია (სწორი ფორმატი და უნიკალურობა ბაზაში)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
            showFieldError('client-email', 'emailError', 'Please enter a valid email address');
            hasError = true;
        } else {
            const isEmailDuplicate = currentClients.some(c => c.email.toLowerCase() === emailVal.toLowerCase());
            if (isEmailDuplicate) {
                showFieldError('client-email', 'emailError', 'A client with this email already exists');
                hasError = true;
            }
        }

        // გ) Phone ვალიდაცია (არასავალდებულო, მაგრამ თუ შევსებულია - მინიმუმ 6 სიმბოლო)
        if (phoneVal.length > 0 && phoneVal.length < 6) {
            showFieldError('client-phone', 'phoneError', 'Phone number looks too short');
            hasError = true;
        }

        // დ) Deal Value ვალიდაცია (სავალდებულო, მხოლოდ დადებითი რიცხვი)
        const parsedValue = Number(dealValueVal);
        if (!dealValueVal || isNaN(parsedValue) || parsedValue <= 0) {
            showFieldError('client-value', 'dealValueError', 'Deal value must be a positive number');
            hasError = true;
        }

        // თუ რომელიმე ვალიდაცია ჩავარდა, ვაჩერებთ კოდის შესრულებას
        if (hasError) return;

        // ახალი კლიენტის ობიექტის აწყობა PRD სტრუქტურით
        const newClient = {
            id: Date.now(), // უნიკალური ID დროის მიხედვით
            name: nameVal,
            email: emailVal,
            phone: phoneVal || "",
            company: companyVal || "Independent Contractor",
            image: `https://dummyjson.com{Math.floor(Math.random() * 50) + 1}`, 
            status: statusVal, 
            dealValue: parsedValue,
            notes: [],
            createdAt: new Date().toISOString()
        };

        try {
            // იმიტირებული POST რექვესტი DummyJSON-ზე
            const response = await fetch('https://dummyjson.com/users?limit=30', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: nameVal,
                    email: emailVal
                })
            });

            if (!response.ok) throw new Error('API Request Failed');

            // ახალი კლიენტის ჩამატება მასივის დასაწყისში (unshift)
            currentClients.unshift(newClient);
            StorageManager.set('crm_clients', currentClients);

            // UI სიის მყისიერი განახლება და მოდალის დახურვა
            renderClients(currentClients);
            closeAndResetModal();

            // წარმატების თოასტი (თუ showToast ფუნქცია არსებობს)
            if (typeof showToast === 'function') {
                showToast('Client added ✓', 'success');
            }

        } catch (error) {
            console.error('კლიენტის დამატებისას დაფიქსირდა შეცდომა:', error);
            // ფოლბექი: სერვერის შეცდომის მიუხედავად, ლოკალურად მაინც ვინახავთ მონაცემს
            currentClients.unshift(newClient);
            StorageManager.set('crm_clients', currentClients);
            renderClients(currentClients);
            closeAndResetModal();
        }
    });
}

// ==========================================================================
// 7. გვერდის ავტომატური გაშვება ჩატვირთვისას
// ==========================================================================
initClientsPage();

// ==========================================================================
// 7. ძებნა და ფილტრაცია
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM ელემენტების წამოღება HTML-იდან
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const sortBySelect = document.getElementById('sort-by');
  const clientsContainer = document.getElementById('clients-container');

  // 2. ცენტრალური ფილტრაციის, სორტირების და რენდერის ფუნქცია
  const filterAndRenderClients = () => {
    // ყოველთვის ვკითხულობთ განახლებულ მასივს ბაზიდან (გასაღები: crm_clients)
    const allClients = JSON.parse(localStorage.getItem('crm_clients')) || [];

    // ინპუტების მიმდინარე მნიშვნელობების აღება
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;
    const sortBy = sortBySelect.value;

    // --- ფაზა 1: ტექსტური ძებნა (სახელით, მეილით ან კომპანიით) ---
    let filteredClients = allClients.filter(client => {
      const name = (client.fullName || client.name || '').toLowerCase();
      const email = (client.email || '').toLowerCase();
      const company = (client.company || '').toLowerCase();

      return name.includes(searchTerm) || 
             email.includes(searchTerm) || 
             company.includes(searchTerm);
    });

    // --- ფაზა 2: ფილტრაცია სტატუსის მიხედვით ---
    if (selectedStatus !== 'all') {
      filteredClients = filteredClients.filter(client => {
        return client.status && client.status.toUpperCase() === selectedStatus.toUpperCase();
      });
    }

    // --- ფაზა 3: სორტირება ---
    filteredClients.sort((a, b) => {
      if (sortBy === 'name-asc') {
        const nameA = (a.fullName || a.name || '');
        const nameB = (b.fullName || b.name || '');
        return nameA.localeCompare(nameB);
      }
      
      if (sortBy === 'name-desc') {
        const nameA = (a.fullName || a.name || '');
        const nameB = (b.fullName || b.name || '');
        return nameB.localeCompare(nameA);
      }
      
      if (sortBy === 'value-high') {
        return (Number(b.dealValue) || 0) - (Number(a.dealValue) || 0);
      }
      
      if (sortBy === 'value-low') {
        return (Number(a.dealValue) || 0) - (Number(b.dealValue) || 0);
      }
      
      return 0;
    });

    // --- ფაზა 4: DOM რენდერი (ეკრანზე გამოტანა) ---
    renderClientsList(filteredClients);
  };

  // 3. ეკრანზე ქარდების დახატვის დამხმარე ფუნქცია
  const renderClientsList = (clientsList) => {
    clientsContainer.innerHTML = ''; // ძველი ქარდების გასუფთავება

    if (clientsList.length === 0) {
      clientsContainer.innerHTML = '<div class="no-results">კლიენტები ვერ მოიძებნა 🔍</div>';
      return;
    }

    clientsList.forEach(client => {
      const card = document.createElement('div');
      card.className = 'client-card';
      
      // მნიშვნელობების მომზადება
      const name = client.fullName || client.name || 'Unknown';
      const company = client.company || 'Independent Contractor';
      const value = Number(client.dealValue) || 0;
      const status = client.status || 'Lead';
      const email = client.email || '';
      const image = client.image || 'https://placeholder.com';

      // 1. წინასწარ მოვამზადოთ უსაფრთხო სტატუსის კლასი CSS-ისთვის (მხოლოდ ასოები და ტირე)
      const safeStatusClass = String(status).toLowerCase().replace(/[^a-z0-9]/g, '-');

      // 2. HTML-ში ვტოვებთ მხოლოდ იმას, რაც გარანტირებულად რიცხვია ან უსაფრთხო ID-ია
      card.innerHTML = `
        <div class="client-avatar">
          <img class="client-img" src="" alt="">
        </div>
        <div class="client-info">
          <h4 class="client-name"></h4>
          <p class="client-company"></p>
          <p class="client-email"></p>
          <span class="status-badge ${safeStatusClass}"></span>
        </div>
        <div class="client-footer">
          <span class="client-value">$${Number(value).toLocaleString()}</span>
          <button class="btn-delete" data-id="${client.id}">🗑️</button>
        </div>
      `;

      // 3. აბსოლუტურად ყველა ტექსტს და ატრიბუტს ვსვამთ უსაფრთხო მეთოდებით (XSS Protection)
      card.querySelector('.client-name').textContent = name;
      card.querySelector('.client-company').textContent = company;
      card.querySelector('.client-email').textContent = email;
      card.querySelector('.status-badge').textContent = status;
      
      // სურათის ატრიბუტების უსაფრთხო დასმა
      const imgEl = card.querySelector('.client-img');
      imgEl.src = image;
      imgEl.alt = name;

      clientsContainer.appendChild(card);
    });

    // წაშლის ივენთების თავიდან მიბმა ახლად დახატულ ღილაკებზე
    attachDeleteEvents();
  };

  // 4. წაშლის ფუნქციონალი (სინქრონიზებული ფილტრებთან)
  const attachDeleteEvents = () => {
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.onclick = (e) => {
        const clientId = e.target.getAttribute('data-id');
        
        if (confirm('ნამდვილად გსურთ კლიენტის წაშლა?')) {
          const allClients = JSON.parse(localStorage.getItem('crm_clients')) || [];
          
          // ვფილტრავთ მასივს წაშლილი იუზერის გარეშე
          const updatedClients = allClients.filter(c => String(c.id) !== String(clientId));
          
          // ვინახავთ ბაზაში
          localStorage.setItem('crm_clients', JSON.stringify(updatedClients));
          
          // ვიძახებთ ცენტრალურ ფილტრაციას (ინარჩუნებს მიმდინარე ფილტრებს ეკრანზე)
          filterAndRenderClients();
        }
      };
    });
  };

  // 5. ივენთების მსმენელები (Event Listeners) ყველა ფილტრისთვის
  searchInput.addEventListener('input', filterAndRenderClients);
  statusFilter.addEventListener('change', filterAndRenderClients);
  sortBySelect.addEventListener('change', filterAndRenderClients);

  // პირველადი გაშვება გვერდის ჩატვირთვისას
  filterAndRenderClients();
});
