document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('edit-profile-form');
    const passwordForm = document.getElementById('change-password-form');
    const btnResetData = document.getElementById('btn-reset-data');

    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');

    // ინფუთების საწყისი შევსება მიმდინარე სესიის მონაცემებით (მუშაობს!)
    const initialSession = JSON.parse(localStorage.getItem('crm_session'));
    if (initialSession) {
        if (profileNameInput) profileNameInput.value = initialSession.fullName || '';
        if (profileEmailInput) profileEmailInput.value = initialSession.email || '';
    }

    // 3. პროფილის პერსონალური ინფორმაციის განახლება
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let latestSession = JSON.parse(localStorage.getItem('crm_session'));
            if (!latestSession) return;

            const updatedName = profileNameInput.value.trim();
            const updatedEmail = profileEmailInput.value.trim();

            if (!updatedName || !updatedEmail) {
                showProfileToast('გთხოვთ შეავსოთ ყველა ველი!', true);
                return;
            }

            latestSession = {
                ...latestSession,
                fullName: updatedName,
                email: updatedEmail
            };
            localStorage.setItem('crm_session', JSON.stringify(latestSession));

            // უსაფრთხო ID-ის ამოღება (ამოწმებს ორივე ქის: userId და id)
            const currentUserId = latestSession.userId || latestSession.id;

            const allUsers = JSON.parse(localStorage.getItem('crm_users')) || [];
            const updatedUsers = allUsers.map(user => {
                if (!user) return user;
                if (String(user.id) === String(currentUserId) || String(user.userId) === String(currentUserId)) {
                    return { ...user, fullName: updatedName, email: updatedEmail };
                }
                return user; 
            }).filter(Boolean);
            localStorage.setItem('crm_users', JSON.stringify(updatedUsers));

            showProfileToast('Profile data successfully updated!');
        });
    }

        // 4. პაროლის შეცვლის ლოგიკა (შესწორებული ვერსია ბაზიდან წაკითხვით)
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentSession = JSON.parse(localStorage.getItem('crm_session'));
            const allUsers = JSON.parse(localStorage.getItem('crm_users')) || [];
            
            const currentPasswordError = document.getElementById('currentPasswordError');
            const newPasswordError = document.getElementById('newPasswordError');

            if (currentPasswordError) currentPasswordError.textContent = '';
            if (newPasswordError) newPasswordError.textContent = '';

            const currentPass = document.getElementById('current-password').value;
            const newPass = document.getElementById('new-password').value;

            if (!currentSession) {
                if (currentPasswordError) currentPasswordError.textContent = 'Session data not found. Please refresh the page!';
                return;
            }

            // ვიღებთ უსაფრთხო ID-ს სესიიდან (თქვენს სესიაში 'userId' წერია)
            const currentUserId = currentSession.userId || currentSession.id || currentSession.user_Id;

            // ვეძებთ მომხმარებელს დიდ ბაზაში (crm_users), სადაც პაროლი გარანტირებულად ინახება
            const dbUser = allUsers.find(user => user && String(user.id) === String(currentUserId));

            if (!dbUser || !dbUser.password) {
                if (currentPasswordError) currentPasswordError.textContent = 'User data could not be found in the database!';
                return;
            }

            // შედარებას ვაკეთებთ ბაზიდან წამოღებულ რეალურ პაროლთან
            if (currentPass !== dbUser.password) {
                if (currentPasswordError) currentPasswordError.textContent = 'The current password is incorrect!';
                return;
            }

            if (newPass.length < 6) {
                if (newPasswordError) newPasswordError.textContent = 'The new password must contain at least 6 characters!';
                return;
            }

            // 1. ვანახლებთ პაროლს დიდ ბაზაში (crm_users)
            const updatedUsers = allUsers.map(user => {
                if (!user) return user;
                if (String(user.id) === String(currentUserId)) {
                    return { ...user, password: newPass };
                }
                return user; 
            }).filter(Boolean);
            localStorage.setItem('crm_users', JSON.stringify(updatedUsers));

            // 2. ვანახლებთ სესიასაც (თუ გსურთ, რომ მომავალში სესიასაც ჰქონდეს პაროლი)
            currentSession.password = newPass;
            localStorage.setItem('crm_session', JSON.stringify(currentSession));

            passwordForm.reset(); 
            showProfileToast('პაროლი წარმატებით შეიცვალა!');
            // Redirect auth page
            localStorage.removeItem('crm_session');
            window.location.href = "index.html";
        });
    }


    // 5. Danger Zone — ბაზის ქლიარი
    const confirmModal = document.getElementById('confirm-modal');
    const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    if (btnResetData && confirmModal) {
        btnResetData.addEventListener('click', () => {
            confirmModal.style.display = 'flex';
        });
    }

    if (btnConfirmCancel && confirmModal) {
        btnConfirmCancel.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }

    if (btnConfirmDelete && confirmModal) {
        btnConfirmDelete.addEventListener('click', () => {
            localStorage.removeItem('crm_clients'); 
            confirmModal.style.display = 'none'; 
            showProfileToast('All client data has been successfully deleted!', true);
        });
    }

    window.addEventListener('click', (e) => {
        if (confirmModal && e.target === confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
});

// ტოსტ შეტყობინების function
function showProfileToast(message, isSuccess = true) {
    // 1. ვამოწმებთ, ძველი ტოსტი ხომ არ არის უკვე ეკრანზე, რომ არ გაორმაგდეს
    let toast = document.getElementById('dynamic-profile-toast');
    
    if (!toast) {
        // 2. თუ არ არსებობს, ვქმნით ახალ div-ს
        toast = document.createElement('div');
        toast.id = 'dynamic-profile-toast';
        document.body.appendChild(toast);
    }

    // 3. ვწერთ გადაცემულ ტექსტს
    toast.textContent = message;

    // 4. თქვენს მუქ დიზაინს რომ მოუხდეს - ლამაზი სტილები (Tailwind-ის გარეშე, სუფთა JS-ით)
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#ffffff';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    toast.style.transition = 'all 0.3s ease';

    // PRD სტანდარტი: მწვანე წარმატებისთვის, წითელი შეცდომისთვის
    if (isSuccess) {
        toast.style.backgroundColor = '#22c55e'; // მწვანე
    } else {
        toast.style.backgroundColor = '#ef4444'; // წითელი
    }

    // 5. გამოვაჩინოთ ეკრანზე
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    // PRD მოთხოვნა (გვერდი 7): ავტომატურად გაქრეს ზუსტად 3 წამში
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        // გაქრობის ანიმაციის შემდეგ სრულად ვშლით DOM-იდან
        setTimeout(() => { toast.remove(); }, 300);
    }, 3000);
}

