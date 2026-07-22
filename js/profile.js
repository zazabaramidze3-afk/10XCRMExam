document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('edit-profile-form');
    const passwordForm = document.getElementById('change-password-form');
    const btnResetData = document.getElementById('btn-reset-data');

    const profileNameInput = document.getElementById('profile-name');
    const profileEmailInput = document.getElementById('profile-email');

    // 🎯 პროფესიონალური Toast შეტყობინების ფუნქცია
    const showProfileToast = (message, isError = false) => {
        const toast = document.createElement('div');
        toast.className = 'crm-toast';
        toast.style.borderLeft = isError ? '5px solid #dc2626' : '5px solid #16a34a';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${isError ? '❌' : '✅'}</span>
                <span class="toast-message"></span>
            </div>
        `;
        toast.querySelector('.toast-message').textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    // 2. მიმდინარე მონაცემების პირველადი ჩატვირთვა
    let currentSession = JSON.parse(localStorage.getItem('crm_session'));
    if (currentSession) {
        profileNameInput.value = currentSession.fullName || '';
        profileEmailInput.value = currentSession.email || '';
    }

    // 3. პროფილის პერსონალური ინფორმაციის განახლება
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentSession = JSON.parse(localStorage.getItem('crm_session'));
        if (!currentSession) return;

        const updatedName = profileNameInput.value.trim();
        const updatedEmail = profileEmailInput.value.trim();
        const originalEmail = currentSession.email;

        currentSession = {
            ...currentSession,
            fullName: updatedName,
            email: updatedEmail
        };
        localStorage.setItem('crm_session', JSON.stringify(currentSession));

        const allUsers = JSON.parse(localStorage.getItem('crm_users')) || [];
        const updatedUsers = allUsers.map(user => {
            if (!user) return user;
            if (user.email === originalEmail || String(user.id) === String(currentSession.userId)) {
                return { ...user, fullName: updatedName, email: updatedEmail };
            }
            return user; 
        }).filter(Boolean);
        localStorage.setItem('crm_users', JSON.stringify(updatedUsers));

        showProfileToast('პროფილის მონაცემები წარმატებით განახლდა!');
    });

    // 4. პაროლის შეცვლის მყარი ლოგიკა
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        currentSession = JSON.parse(localStorage.getItem('crm_session'));
        
        document.getElementById('currentPasswordError').textContent = '';
        document.getElementById('newPasswordError').textContent = '';

        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;

        if (!currentSession || !currentSession.password) {
            document.getElementById('currentPasswordError').textContent = 'სესიის მონაცემები ვერ მოიძებნა. გადაარეფრეშეთ გვერდი!';
            return;
        }

        if (currentPass !== currentSession.password) {
            document.getElementById('currentPasswordError').textContent = 'მიმდინარე პაროლი არასწორია!';
            return;
        }

        if (newPass.length < 6) {
            document.getElementById('newPasswordError').textContent = 'ახალი პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს!';
            return;
        }

        currentSession.password = newPass;
        localStorage.setItem('crm_session', JSON.stringify(currentSession));

        const allUsers = JSON.parse(localStorage.getItem('crm_users')) || [];
        const updatedUsers = allUsers.map(user => {
            if (!user) return user;
            if (user.email === currentSession.email || String(user.id) === String(currentSession.userId)) {
                return { ...user, password: newPass };
            }
            return user; 
        }).filter(Boolean);
        localStorage.setItem('crm_users', JSON.stringify(updatedUsers));

        passwordForm.reset(); 
        showProfileToast('პაროლი წარმატებით შეიცვალა!');
    });

    // 5. Danger Zone — ბაზის ქლიარი (ახალი კასტომური მოდალით)
    const confirmModal = document.getElementById('confirm-modal');
    const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    btnResetData.addEventListener('click', () => {
        if (confirmModal) confirmModal.style.display = 'flex';
    });

    btnConfirmCancel.addEventListener('click', () => {
        if (confirmModal) confirmModal.style.display = 'none';
    });

    btnConfirmDelete.addEventListener('click', () => {
        localStorage.removeItem('crm_clients'); 
        if (confirmModal) confirmModal.style.display = 'none'; 
        showProfileToast('ყველა კლიენტის მონაცემი წარმატებით წაიშალა!', true);
    });

    window.addEventListener('click', (e) => {
        if (e.target === confirmModal && confirmModal) {
            confirmModal.style.display = 'none';
        }
    });
});
