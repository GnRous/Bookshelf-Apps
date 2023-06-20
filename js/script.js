bookShelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.getElementById('inputBookIsComplete');
    const shelfType = document.getElementById('shelfType');
    const submitBook = document.getElementById('inputBook');
    const btnSearch = document.getElementById('searchBook');

    checkbox.addEventListener('click', () => {
        if (checkboxClick()) {
            shelfType.innerText = 'Selesai Dibaca';
        } else {
            shelfType.innerText = 'Sedang Dibaca';
        }
    });

    submitBook.addEventListener('submit', (event) => {
        event.preventDefault();
        
        addBook();
        popupBox('tambahkan');
        
        document.getElementById('inputBookTitle').value = '';
        document.getElementById('inputBookAuthor').value = '';
        document.getElementById('inputBookYear').value = '';
        document.getElementById('inputBookIsComplete').checked = false;
    });
    
    btnSearch.addEventListener('submit', (event) => {
        event.preventDefault();
        
        searchBookTitle();
    });  
    
    
    if (isBookStorage()) {
        loadDataBookFromStorage();
    }
});

function checkboxClick() {
    const checkbox = document.getElementById('inputBookIsComplete');
    return checkbox.checked;
}

function searchBookTitle() {
    const searchBookTitle = document.getElementById('searchBookTitle');
    const keyword = searchBookTitle.value.toLowerCase();

    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookShelfItem of bookShelf) {
        const item = bookShelfItem.title.toLowerCase();

        if (item.includes(keyword)) {
            const bookShelfElement = makeBookShelf(bookShelfItem);
            
            if (!bookShelfItem.isCompleted) {
                incompleteBookshelfList.append(bookShelfElement);
            } else {
                completeBookshelfList.append(bookShelfElement);
            }
        }
    }
}

function addBook() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;

    const checkbox = checkboxClick()
    const generateID = generateId();
    
    const bookShelfObject = generateBookShelfObject(generateID, bookTitle, bookAuthor, bookYear, checkbox);

    bookShelf.push(bookShelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookChanges();
}

function generateId() {
    return +new Date();
}

function generateBookShelfObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

// Pengecekan nilai Input di dalam object 
document.addEventListener(RENDER_EVENT, () => {
    console.log(bookShelf);

    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completeBookshelfList = document.getElementById('completeBookshelfList');
    completeBookshelfList.innerHTML = '';

    for (const bookShelfItem of bookShelf) {
        const bookShelfElement = makeBookShelf(bookShelfItem);
        
        if (!bookShelfItem.isCompleted) {
            incompleteBookshelfList.append(bookShelfElement);
        } else {
            completeBookshelfList.append(bookShelfElement);
        }
    }
});

function makeBookShelf(bookShelfObject) {
    const textBookTitle = document.createElement('h3');
    textBookTitle.innerText = bookShelfObject.title;

    const textAuthor = document.createElement('tr')
    textAuthor.innerHTML = `<td>Penulis</td><td>:</td><td>${bookShelfObject.author}</td>`;
    const textYear = document.createElement('tr')
    textYear.innerHTML = `<td>Tahun</td><td>:</td><td>${bookShelfObject.year}</td>`;
    
    const tableBook = document.createElement('table');
    tableBook.append(textAuthor, textYear);

    const textBookData = document.createElement('div');
    textBookData.classList.add('bookData');
    textBookData.append(textBookTitle, tableBook);

    const bookItem = document.createElement('article');
    bookItem.classList.add('book_item');
    bookItem.append(textBookData);
    bookItem.setAttribute('id', `bookShelf-${bookShelfObject.id}`);

    if (bookShelfObject.isCompleted) {
        const readButton = document.createElement('button');
        readButton.classList.add('btn-read');

        readButton.addEventListener('click', () => {
            incompleteReadBook(bookShelfObject.id);
            popupBox('pindahkan');
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-trash');

        trashButton.addEventListener('click', () => {
            showModal();
            confirmDeleteData(bookShelfObject.id);
        });

        const buttonsAction = document.createElement('div');
        buttonsAction.classList.add('action');
        buttonsAction.append(readButton, trashButton);    

        bookItem.append(buttonsAction);

    } else {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('btn-unread');

        unreadButton.addEventListener('click', () => {
            completedReadBook(bookShelfObject.id);
            popupBox('pindahkan');
        });
        
        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-trash');

        trashButton.addEventListener('click', () => {
            showModal();
            confirmDeleteData(bookShelfObject.id);
        });
        

        const buttonsAction = document.createElement('div');
        buttonsAction.classList.add('action');
        buttonsAction.append(unreadButton, trashButton);
        
        bookItem.append(buttonsAction);
    }

    return bookItem;
}

function completedReadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookChanges();
}

function incompleteReadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookChanges();
}

const showModal = () => {
    const modalBox = document.getElementById('modalBox');
    modalBox.style.display = 'block';
}

function findBook(bookId) {
    for (const bookShelfItem of bookShelf) {
        if (bookShelfItem.id === bookId) {
            return bookShelfItem;
        }
    }
    return null;
}

const confirmDeleteData = (bookId) => {
    const cancelButton = document.querySelector('.btn-cancel');
    const deleteButton = document.querySelector('.btn-delete');
    const modalBox = document.getElementById('modalBox');

    cancelButton.addEventListener('click', (event) => {
        event.preventDefault();
        modalBox.style.display = 'none';
        
        bookId = null;
    })

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        modalBox.style.display = 'none';

        for (itemBook of bookShelf) {
            const item = itemBook.id;
            if (item == bookId) {
                removeBook(bookId);
            } 
        }
        popupBox('hapus');
    })
}

const popupBox = (customText) => {
    const popup = document.getElementById('popupBox');
    const text = document.querySelector('.text');
    
    popup.style.display = 'block';
    text.innerText = customText;

    setInterval(popupDisplayNone, 2000);
}

const popupDisplayNone = () => {
    const popup = document.getElementById('popupBox');
    popup.style.display = 'none';
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    bookShelf.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveBookChanges();
}

function limitNumber(max) {
    const maxNumber = 4;

    if (max.value.length > maxNumber) {
        max.value = max.value.substr(0, maxNumber);
    }
}

function findBookIndex(bookId) {
    for (const index in bookShelf) {
        if (bookShelf[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// Menyimpan perubahan pada isi BookShelf
function saveBookChanges() {
    if (isBookStorage()) {
        const parsed = JSON.stringify(bookShelf);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// Pemeriksaan dukungan LocalStorage.
function isBookStorage() {
    if (typeof (Storage) === undefined) {
        alert('Browser Anda tidak mendukung local storage');
        return false;
    }

    return true;
}

// Pengecekan status Data
document.addEventListener(SAVED_EVENT, () => {
    console.log('data Buku berhasil diSimpan');
})

// Muat dan tampilkan data Buku dari LocalStorage
function loadDataBookFromStorage() {
    const serializedBooksData = localStorage.getItem(STORAGE_KEY);
    let bookData = JSON.parse(serializedBooksData);

    if (bookData !== null) {
        for (const book of bookData) {
            bookShelf.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}