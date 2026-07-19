
// ინკაფსულირებული ობიექტი LocalStorage-თან სამუშაოდ
const StorageManager = {
    // მონაცემის უსაფრთხო წაკითხვა ბაზიდან
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading key "${key}" from localStorage:`, error);
            return null;
        }
    },

    // მონაცემის უსაფრთხო ჩაწერა/განახლება ბაზაში
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing key "${key}" to localStorage:`, error);
            return false;
        }
    },

    // მონაცემის წაშლა ბაზიდან
    remove(key) {
        localStorage.removeItem(key);
    }
};
