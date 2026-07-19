// 1. ველოდებით გვერდის სრულად ჩატვირთვას
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");

    // თუ რეგისტრაციის გვერდზე ვართ
    if (signupForm) {
        signupForm.addEventListener("submit", handleSignup);
    }
    
    // თუ ლოგინის გვერდზე ვართ
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
});


// 2. რეგისტრაციის მთავარი ფუნქცია
function handleSignup(e) {
    e.preventDefault(); // ვაჩერებთ გვერდის გადატვირთვას

    // ვკრებთ მონაცემებს ველებიდან (.trim() აშორებს ზედმეტ სფეისებს)
    const fullName = document.getElementById("reg-fullname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const company = document.getElementById("reg-company").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm").value;

    // ყოველი საბმიტისას ჯერ ვასუფთავებთ წინა შეცდომებს
    clearErrors();

    let isValid = true;

    // --- PRD ვალიდაციის წესები ---

    // წესი 1: Full Name უნდა იყოს მინიმუმ 2 სიტყვა, თითო სიტყვა მინიმუმ 2 ასო
    const nameParts = fullName.split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
        showError("err-fullname", "Full Name must contain at least 2 words, each 2+ characters long.");
        isValid = false;
    }

    // წესი 2: Email-ის ფორმატი (Regex-ით)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("err-email", "Please enter a valid email address.");
        isValid = false;
    }

    // წესი 3: Company Name მინიმუმ 2 სიმბოლო
    if (company.length < 2) {
        showError("err-company", "Company name must be at least 2 characters long.");
        isValid = false;
    }

    // წესი 4: პაროლი (მინიმუმ 8 სიმბოლო, 1 დიდი ასო, 1 პატარა ასო, 1 ციფრი)
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(password)) {
        showError("err-password", "Password must be 8+ chars with at least 1 uppercase, 1 lowercase, and 1 number.");
        isValid = false;
    }

    // წესი 5: პაროლების დამთხვევა
    if (password !== confirmPassword) {
        showError("err-confirm", "Passwords do not match.");
        isValid = false;
    }

    // თუ რომელიმე წესი დაირღვა, კოდის შესრულებას ვაჩერებთ აქ
    if (!isValid) return;

    // წესი 6: მომხმარებლის უნიკალურობა (ამოწმებს უკვე არსებობს თუ არა ეს იმეილი)
    const users = StorageManager.get("crm_users") || [];
    const userExists = users.some(u => u.email === email);

    if (userExists) {
        showError("err-email", "An account with this email already exists.");
        return;
    }

    // თუ ყველა ვალიდაცია გაიარა, ვქმნით ახალ იუზერს
    const newUser = {
        id: "usr_" + Date.now(),
        fullName,
        email,
        company,
        password // რეალურ პროექტში ჰეშირდება, საგამოცდოდ ვინახავთ ასე
    };

    // ვამატებთ მასივში და ვინახავთ StorageManager-ის დახმარებით
    users.push(newUser);
    StorageManager.set("crm_users", users);

    // წარმატების შეტყობინება
    showToast("Registration successful! Redirecting to login...", "success");

    // 1.5 წამში გადაგვყავს ლოგინის გვერდზე
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

// 3. დამხმარე ფუნქცია შეცდომის გამოსაჩენად
function showError(id, message) {
    const errorSpan = document.getElementById(id);
    if (errorSpan) {
        errorSpan.textContent = message;
        // ინპუტს ვამატებთ წითელ ჩარჩოს (კლასს CSS-ისთვის)
        errorSpan.previousElementSibling.classList.add("input-error");
    }
}

// 4. დამხმარე ფუნქცია შეცდომების გასასუფთავებლად
function clearErrors() {
    document.querySelectorAll(".error-msg").forEach(span => span.textContent = "");
    document.querySelectorAll("input").forEach(input => input.classList.remove("input-error"));
}

// 5. დამხმარე ფუნქცია პატარა შეტყობინებისთვის (Toast)
function showToast(message, type) {
    const toast = document.getElementById("auth-toast");
    if (toast) {
        toast.textContent = message;
        toast.className = `toast ${type}`; // აძლევს ვიზუალს
        // 3 წამში ისევ მალავს
        setTimeout(() => toast.className = "toast hidden", 3000);
    }
}


// 6. სისტემაში შესვლის (Login) მთავარი ფუნქცია
function handleLogin(e) {
    e.preventDefault(); // ვაჩერებთ გვერდის გადატვირთვას

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    // ვასუფთავებთ ძველ შეცდომებს
    clearErrors();

    let isValid = true;

    // ბაზისური შემოწმება: ცარიელი ხომ არ არის ველები?
    if (!email) {
        showError("err-login-email", "Email address is required.");
        isValid = false;
    }
    if (!password) {
        showError("err-login-password", "Password is required.");
        isValid = false;
    }

    if (!isValid) return;

    // StorageManager-იდან ამოგვაქვს დარეგისტრირებული იუზერების მასივი
    const users = StorageManager.get("crm_users") || [];
    
    // ვეძებთ იუზერს, რომლის იმეილი და პაროლი ემთხვევა შეყვანილს
    const user = users.find(u => u.email === email && u.password === password);

    // თუ იუზერი ვერ მოიძებნა
    if (!user) {
        // PRD-ის მოთხოვნა: უსაფრთხოებისთვის ვაჩვენებთ მხოლოდ ზოგად შეცდომას (Toast)
        showToast("Invalid email or password.", "error");
        return;
    }

    // თუ იუზერი მოიძებნა, ვქმნით მიმდინარე სესიის ობიექტს (პაროლის გარეშე)
    const sessionData = {
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        loginTime: Date.now()
    };

    // ვინახავთ სესიას ბაზაში გასაღებით "crm_session"
    StorageManager.set("crm_session", sessionData);

    // წარმატების შეტყობინება
    showToast("Login successful! Redirecting to dashboard...", "success");
    
    // 1.2 წამში გადაგვყავს მომხმარებელი დეშბორდზე
    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 1200);
}
