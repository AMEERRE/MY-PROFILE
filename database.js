// قاعدة بيانات الموقع الشخصي
class WebsiteDatabase {
    constructor() {
        this.dbName = 'personalWebsiteDB';
        this.dbVersion = 1;
        this.db = null;
        // إزالة استدعاء initDB() من هنا
    }

    // تهيئة قاعدة البيانات
    initDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.error("متصفحك لا يدعم IndexedDB");
                reject("متصفحك لا يدعم IndexedDB");
                return;
            }

            const request = window.indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("خطأ في فتح قاعدة البيانات:", event.target.error);
                reject("خطأ في فتح قاعدة البيانات");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("تم فتح قاعدة البيانات بنجاح");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // إنشاء مخازن البيانات (object stores)
                if (!db.objectStoreNames.contains('content')) {
                    db.createObjectStore('content', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('skills')) {
                    db.createObjectStore('skills', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('experiences')) {
                    db.createObjectStore('experiences', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('blogPosts')) {
                    db.createObjectStore('blogPosts', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('profileImage')) {
                    db.createObjectStore('profileImage', { keyPath: 'id' });
                }
                // إضافة مخزن جديد لحالة وضع التحرير
                if (!db.objectStoreNames.contains('editMode')) {
                    db.createObjectStore('editMode', { keyPath: 'id' });
                }
            };
        });
    }

    // حفظ حالة وضع التحرير بشكل منفصل
    saveEditMode(isEditMode) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['editMode'], 'readwrite');
            const store = transaction.objectStore('editMode');
            const request = store.put({ id: 'editModeState', isEnabled: isEditMode });

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error("خطأ في حفظ وضع التحرير:", event.target.error);
                reject("خطأ في حفظ وضع التحرير");
            };
        });
    }

    // استرجاع حالة وضع التحرير
    getEditMode() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['editMode'], 'readonly');
            const store = transaction.objectStore('editMode');
            const request = store.get('editModeState');

            request.onsuccess = (event) => {
                if (event.target.result) {
                    resolve(event.target.result.isEnabled);
                } else {
                    resolve(false); // القيمة الافتراضية هي false
                }
            };

            request.onerror = (event) => {
                console.error("خطأ في استرجاع وضع التحرير:", event.target.error);
                reject("خطأ في استرجاع وضع التحرير");
            };
        });
    }

    // حفظ المحتوى الأساسي
    saveContent(content) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['content'], 'readwrite');
            const store = transaction.objectStore('content');
            const request = store.put({ id: 'mainContent', data: content });

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error("خطأ في حفظ المحتوى:", event.target.error);
                reject("خطأ في حفظ المحتوى");
            };
        });
    }

    // استرجاع المحتوى الأساسي
    getContent() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['content'], 'readonly');
            const store = transaction.objectStore('content');
            const request = store.get('mainContent');

            request.onsuccess = (event) => {
                if (event.target.result) {
                    resolve(event.target.result.data);
                } else {
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error("خطأ في استرجاع المحتوى:", event.target.error);
                reject("خطأ في استرجاع المحتوى");
            };
        });
    }

    // حفظ المهارات
    saveSkills(skills) {
        return this.clearAndSaveItems('skills', skills);
    }

    // استرجاع المهارات
    getSkills() {
        return this.getAllItems('skills');
    }

    // حفظ الخبرات
    saveExperiences(experiences) {
        return this.clearAndSaveItems('experiences', experiences);
    }

    // استرجاع الخبرات
    getExperiences() {
        return this.getAllItems('experiences');
    }

    // حفظ المنشورات
    saveBlogPosts(posts) {
        return this.clearAndSaveItems('blogPosts', posts);
    }

    // استرجاع المنشورات
    getBlogPosts() {
        return this.getAllItems('blogPosts');
    }

    // حفظ الصورة الشخصية
    saveProfileImage(imageData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['profileImage'], 'readwrite');
            const store = transaction.objectStore('profileImage');
            const request = store.put({ id: 'profile', data: imageData });

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => {
                console.error("خطأ في حفظ الصورة:", event.target.error);
                reject("خطأ في حفظ الصورة");
            };
        });
    }

    // استرجاع الصورة الشخصية
    getProfileImage() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['profileImage'], 'readonly');
            const store = transaction.objectStore('profileImage');
            const request = store.get('profile');

            request.onsuccess = (event) => {
                if (event.target.result) {
                    resolve(event.target.result.data);
                } else {
                    resolve(null);
                }
            };

            request.onerror = (event) => {
                console.error("خطأ في استرجاع الصورة:", event.target.error);
                reject("خطأ في استرجاع الصورة");
            };
        });
    }

    // دالة مساعدة لمسح وحفظ العناصر
    clearAndSaveItems(storeName, items) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            // مسح جميع العناصر الموجودة
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                // إضافة العناصر الجديدة
                let successCount = 0;
                items.forEach(item => {
                    const request = store.add(item);
                    request.onsuccess = () => {
                        successCount++;
                        if (successCount === items.length) {
                            resolve(true);
                        }
                    };
                    request.onerror = (event) => {
                        console.error(`خطأ في حفظ عنصر في ${storeName}:`, event.target.error);
                    };
                });

                // إذا كانت المصفوفة فارغة
                if (items.length === 0) {
                    resolve(true);
                }
            };

            clearRequest.onerror = (event) => {
                console.error(`خطأ في مسح ${storeName}:`, event.target.error);
                reject(`خطأ في مسح ${storeName}`);
            };
        });
    }

    // دالة مساعدة للحصول على جميع العناصر
    getAllItems(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error(`خطأ في استرجاع ${storeName}:`, event.target.error);
                reject(`خطأ في استرجاع ${storeName}`);
            };
        });
    }
}

// تصدير الفئة للاستخدام في الملفات الأخرى
window.WebsiteDatabase = WebsiteDatabase;