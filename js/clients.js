// 1. ვპოულობთ კონტეინერს HTML-ში, სადაც კლიენტები უნდა ჩავსვათ
const clientsContainer = document.getElementById("clients-container");

// 2. გვერდის ინიციალიზაციის მთავარი ფუნქცია
async function initClientsPage() {
    // შემოწმება: ხომ არ გვაქვს უკვე შენახული კლიენტები ლოკალურად?
    let clients = StorageManager.get("crm_clients");

    // თუ ბაზა ცარიელია (პირველი ჩატვირთვაა), მივმართავთ API-ს
    if (!clients) {
        clients = await fetchClientsFromAPI();
    }

    // თუ მონაცემები წარმატებით გვაქვს, გამოვიძახოთ რენდერის ფუნქცია
    if (clients) {
        renderClients(clients);
    }
}

// 3. ასინქრონული ფუნქცია API-დან მონაცემების წამოსაღებად
async function fetchClientsFromAPI() {
    try {
        // ვითხოვთ 30 იუზერს dummyjson სერვერიდან
        const response = await fetch("https://dummyjson.com/users?limit=30");
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // .map() მეთოდით API-დან წამოღებულ იუზერებს ვაქცევთ CRM-ის კლიენტებად
        const transformedClients = data.users.map(user => {
            // სტატუსების მასივი რეალური CRM-ის სიმულაციისთვის
            const statuses = ["Lead", "Contacted", "In Progress", "Won", "Lost"];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            // შემთხვევითი გარიგების თანხა (Deal Value) 500$-დან 15000$-მდე
            const randomDealValue = Math.floor(Math.random() * 14500) + 500;

            return {
                id: `cli_${user.id}`,
                fullName: `${user.firstName} ${user.lastName}`,
                email: user.email,
                company: user.company?.name || "Independent Contractor",
                status: randomStatus,
                dealValue: randomDealValue,
                avatar: user.image,
                notes: [], // საწყის ეტაპზე შენიშვნები ცარიელია
                createdAt: new Date(Date.now() - Math.random() * 1000000000).toISOString() // შემთხვევითი თარიღი წარსულში
            };
        });

        // მიღებულ მასივს უსაფრთხოდ ვინახავთ localStorage-ში
        StorageManager.set("crm_clients", transformedClients);
        return transformedClients;

    } catch (error) {
        console.error("Failed to fetch clients from API:", error);

        if (clientsContainer) {
            // 1. ვასუფთავებთ კონტეინერს
            clientsContainer.innerHTML = "";

            // 2. ვქმნით შეცდომის მთავარ კონტეინერს
            const errorDiv = document.createElement("div");
            errorDiv.className = "error-state";

            // 3. ვქმნით შეცდომის ტექსტს
            const errorMessage = document.createElement("p");
            errorMessage.textContent = "Failed to load clients. Please check your internet connection.";

            // 4. ვქმნით Retry ღილაკს
            const retryButton = document.createElement("button");
            retryButton.className = "btn-primary";
            retryButton.textContent = "Retry";

            // საუკეთესო პრაქტიკა: ივენთს ვამაგრებთ პირდაპირ JS-იდან და არა HTML-ში
            retryButton.addEventListener("click", initClientsPage);

            // 5. ვაერთიანებთ ელემენტებს
            errorDiv.appendChild(errorMessage);
            errorDiv.appendChild(retryButton);

            // 6. ვსვამთ მთავარ კონტეინერში
            clientsContainer.appendChild(errorDiv);
        }
        return null;
    }
}

// 4. სრულფასოვანი და უსაფრთხო DOM რენდერი (3.2 ფიჩერი)
function renderClients(clientsList) {
    if (!clientsContainer) return;
    
    // კონტეინერის სრული გასუფთავება ძველი ტექსტებისგან
    clientsContainer.innerHTML = ""; 

    clientsList.forEach(client => {
        // ვქმნით ბარათის მთავარ კონტეინერს
        const card = document.createElement("div");
        card.className = "client-card";
        card.id = client.id;

        // ა) ჰედერი: ავატარი და სტატუსის ბეიჯი
        const headerNode = document.createElement("div");
        headerNode.className = "card-header";

        const avatarNode = document.createElement("img");
        avatarNode.className = "client-avatar";
        avatarNode.src = client.avatar; // სურათის ლინკი ბაზიდან
        avatarNode.alt = client.fullName;
        avatarNode.style.width = "50px"; // დროებითი ზომა, სანამ CSS-ს დავწერთ
        avatarNode.style.borderRadius = "50%";

        const statusNode = document.createElement("span");
        statusNode.className = `status-badge ${client.status.toLowerCase().replace(" ", "-")}`;
        statusNode.textContent = ` [${client.status}]`;

        headerNode.appendChild(avatarNode);
        headerNode.appendChild(statusNode);

        // ბ) ბოდი: სახელი, კომპანია და იმეილი
        const bodyNode = document.createElement("div");
        bodyNode.className = "card-body";

        const nameNode = document.createElement("h3");
        nameNode.textContent = client.fullName; // XSS დაცვა

        const companyNode = document.createElement("p");
        companyNode.className = "company";
        companyNode.textContent = `Company: ${client.company}`; // კომპანიის სახელი

        const emailNode = document.createElement("p");
        emailNode.className = "email";
        emailNode.textContent = `Email: ${client.email}`;

        bodyNode.appendChild(nameNode);
        bodyNode.appendChild(companyNode);
        bodyNode.appendChild(emailNode);

        // გ) ფუტერი: გარიგების თანხა
        const footerNode = document.createElement("div");
        footerNode.className = "card-footer";
        
        const valueNode = document.createElement("span");
        valueNode.className = "deal-value";
        valueNode.textContent = ` Value: $${client.dealValue.toLocaleString()}`;
        
        footerNode.appendChild(valueNode);

        // ვაერთიანებთ ყველაფერს მთავარ ბარათში
        card.appendChild(headerNode);
        card.appendChild(bodyNode);
        card.appendChild(footerNode);

        // ბარათს ვსვამთ HTML კონტეინერში
        clientsContainer.appendChild(card);
    });
}


// აუცილებლად ვუშვებთ ფუნქციას ფაილის ბოლოს
initClientsPage();
