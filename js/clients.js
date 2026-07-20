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

// 4. დროებითი ფუნქცია-ზაგლუშკა (სანამ ლამაზ ბარათებს ავაწყობთ) მხოლოდ შესამოწმებლად
function renderClients(clientsList) {
    if (!clientsContainer) return;
    clientsContainer.innerHTML = ""; // მხოლოდ ვასუფთავებთ კონტეინერს ხელით

    clientsList.forEach(client => {
        // ვქმნით ბარათის მთავარ კონტეინერს
        const card = document.createElement("div");
        card.className = "client-card";
        card.id = client.id;

        // ვქმნით სახელს (უსაფრთხო ტექსტი)
        const nameNode = document.createElement("h3");
        nameNode.textContent = client.fullName; // XSS-სგან დაცული

        // ვქმნით იმეილს
        const emailNode = document.createElement("p");
        emailNode.className = "email";
        emailNode.textContent = client.email;

        // ვამატებთ ელემენტებს ბარათში
        card.appendChild(nameNode);
        card.appendChild(emailNode);

        // ბარათს ვამატებთ მთავარ კონტეინერში
        clientsContainer.appendChild(card);
    });
}


// აუცილებლად ვუშვებთ ფუნქციას ფაილის ბოლოს
initClientsPage();
