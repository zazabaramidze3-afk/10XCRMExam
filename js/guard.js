// ინკაფსულირებული მოდული გვერდების დასაცავად
const AuthGuard = {
    // 1. მთავარი შემოწმების ფუნქცია
    check() {
        // ვიგებთ მიმდინარე გვერდის ფაილის სახელს (მაგ: dashboard.html)
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf("/") + 1);
        
        // ამოწმებს არის თუ არა იუზერი ავტორიზებული
        const session = StorageManager.get("crm_session");

        // საჯარო გვერდები (სადაც შესული იუზერი არ უნდა შევიდეს)
        const authPages = ["index.html", "signup.html", ""];

        if (!session) {
            // თუ მომხმარებელი არ არის შესული და ცდილობს დაცულ გვერდზე შესვლას
            if (!authPages.includes(page)) {
                window.location.href = "index.html";
            }
        } else {
            // თუ მომხმარებელი უკვე შესულია და ცდილობს შესვლის/რეგისტრაციის გვერდზე გადასვლას
            if (authPages.includes(page)) {
                window.location.href = "dashboard.html";
            }
        }
    },

    // 2. სისტემიდან გამოსვლის (Logout) ფუნქცია
    logout() {
        // ვშლით სესიას ბაზიდან
        StorageManager.remove("crm_session");
        // ვაბრუნებთ მომხმარებელს ლოგინის გვერდზე
        window.location.href = "index.html";
    }
};

// უშუალოდ ვუშვებთ შემოწმებას ყოველი გვერდის ჩატვირთვის საწყის ეტაპზე
AuthGuard.check();
