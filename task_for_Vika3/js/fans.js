const useLocalStorage = 0;
let db = null;
let formInputValue = document.querySelector(".form-input");
const emailInputElem = document.querySelector('#email');
const emailErrorElem = document.querySelector('.error-text_email');
const todoList = document.querySelector('.todo-list');
const listFromLocalStorage = document.querySelector('.mdc-data-table__content');
const formElem = document.querySelector('.login-form');
let todosItems = [];
let indexDBItems = [];


if (window.navigator.onLine) {
    listFromLocalStorage.innerHTML = '';
    getFromMongo();
}

createDB();

window.addEventListener('load', function() {
    let status = document.getElementById("status");
    let log = document.getElementById("log");

    function updateOnlineStatus(event) {
        let condition = navigator.onLine ? "online" : "offline";
        status.className = condition;
        status.innerHTML = condition.toUpperCase();
        log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; Status: " + condition);
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

});

const formatterData = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
});
const formatterTime = new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});
let getGreenwichData = (date) => {
    return formatterData.format(date);
}
let getGreenwichTime = (date) => {
    return formatterTime.format(date);
}

const isRequired = value => {
    return value ? undefined : 'Required'
}
const isNotNull = value => {
    let newValue = value.trim();
    return newValue.length === 0 ? 'Should not be empty' : undefined;
}
const validatorsByField = {
    email: [isRequired, isNotNull],

}
const validate = (fieldName, value) => {
    const validators = validatorsByField[fieldName];
    return validators
        .map(validator => validator(value))
        .filter(errorText => errorText)
        .join(',')
}
const onEmailChange = event => {
    const errorText = validate('email', event.target.value.trim());
    emailErrorElem.textContent = errorText;
}
emailInputElem.addEventListener('input', onEmailChange);


function onFormSubmit(event) {
    event.preventDefault();
    let a = formInputValue.value;
    let newElem = { id: Date.now(), text: a };
    if (!window.navigator.onLine) {
        if (useLocalStorage) {
            transformDataForRender(newElem);
            renderLocalStorage();
        } else {
            addAllDataToIndexDB(newElem);

        }
    } else if (window.navigator.onLine) {

        renderFromMongo();
    }
    formInputValue.value = '';
}

function pause() {
    listFromLocalStorage.innerHTML = 'Dowload data from Mongo...';
}

function handleConnectionChange(event) {
    if (event.type == "offline") {}

    if (event.type == "online") {
        passDataTOMongoDB();
        setTimeout(1000, pause);
        listFromLocalStorage.innerHTML = '';
        getFromMongo();
    }
}

window.addEventListener('online', handleConnectionChange);
window.addEventListener('offline', handleConnectionChange);

function addAllDataToIndexDB(value) {
    let transaction = db.transaction("listOfItems", "readwrite");
    let request = transaction.objectStore("listOfItems");
    indexDBItems.push(value);
    for (const i in indexDBItems) {
        request.put(indexDBItems[i]);
    }
}

function transformDataForRender(value) {
    let getElemFromLS = localStorage.getItem(`todosOfFans`);
    let parseData = JSON.parse(getElemFromLS);
    if (localStorage.length) {
        todosItems = [...todosItems, value];
    } else {
        todosItems.push(value);
    }

    localStorage.setItem(`todosOfFans`, JSON.stringify(todosItems));

}

function renderLocalStorage() {
    listFromLocalStorage.innerHTML = '';
    if (localStorage.length) {
        let getElemFromLS = localStorage.getItem(`todosOfFans`);
        let parseData = JSON.parse(getElemFromLS);
        parseData.forEach(elem => {
            let oneLi = ` <tr class="mdc-data-table__row">
            <td class="mdc-data-table__cell"><i class="material-icons">
            feedback
            </i></td>
            <td class="mdc-data-table__cell mdc-data-table__cell--numeric">${getGreenwichData(elem.id)}</td>
            <td class="mdc-data-table__cell mdc-data-table__cell--numeric">${getGreenwichTime(elem.id)}</td>
            <td class="mdc-data-table__cell">${elem.text}</td>
        </tr>`

            listFromLocalStorage.innerHTML += oneLi;
        });

    } else {

        listFromLocalStorage.innerHTML = `local storage is empty.....`
    }

}
formElem.addEventListener('submit', onFormSubmit);


//////// indexDb////////////////

const btnAddNote = document.getElementById("btnAddNote")
const btnViewNotes = document.getElementById("btnViewNotes")
const createDBBtn = document.querySelector(".submit-button");

function viewNotes() {
    const tx = db.transaction("listOfItems", "readonly");
    const pNotes = tx.objectStore("listOfItems");
    const request = pNotes.openCursor();

    request.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            let newElem = { id: cursor.value.id, text: cursor.value.text };
            postToMongoDBFromLS(newElem);
            cursor.continue();
        };

    }
}

function createDB() {
    const request = indexedDB.open("myDataBase");
    request.onupgradeneeded = e => {
        db = e.target.result;
        const indexedDBfeedback = db.createObjectStore("listOfItems", { keyPath: "id" });
        alert('Upgrading...');
    }
    request.onsuccess = e => {
        db = request.result;
    }
    request.onerror = e => {
        alert('Error, Fucc you!');
    }
    return db;
}

function indexedDBclear() {
    let transaction = db.transaction("listOfItems", "readwrite");
    let feedback = transaction.objectStore("listOfItems");
    feedback.clear();
}

function passDataTOMongoDB() {
    if (useLocalStorage) {
        let getElemFromLS = localStorage.getItem(`todosOfFans`);
        let parseData = JSON.parse(getElemFromLS);
        for (const key in parseData) {
            postToMongoDBFromLS(parseData[key]);
        }
        localStorage.clear();
    } else {
        viewNotes();
        indexedDBclear();

    }
}

function postToMongoDBFromLS({ id, text }) {
    let temp = JSON.stringify({
        id: id,
        text: text,
    });
    fetch('http://localhost:3000/fanPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: (temp)
    });
}

function postToMongoDB(text) {
    let temp = JSON.stringify({
        id: Date.now(),
        text: text
    });
    fetch('http://localhost:3000/fanPost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: (temp)
    });
}

function getFromMongo() {
    $.ajax({
        url: "http://localhost:3000/fanPost",
        type: "GET",
        success: function(res) {
            render(res);
        }
    });
}

function render(arr) {
    listFromLocalStorage.innerHTML = '';
    arr.forEach(elem => {
        let oneLi = `<tr class="mdc-data-table__row">
        <td class="mdc-data-table__cell"><i class="material-icons">
        feedback
        </i></td>
        <td class="mdc-data-table__cell mdc-data-table__cell--numeric">${getGreenwichData(elem.id)}</td>
        <td class="mdc-data-table__cell mdc-data-table__cell--numeric">${getGreenwichTime(elem.id)}</td>
        <td class="mdc-data-table__cell">${elem.text}</td>
    </tr>`
        listFromLocalStorage.innerHTML += oneLi;

    });
}


function renderFromMongo() {
    postToMongoDB(formInputValue.value)
    setTimeout(2000);
    listFromLocalStorage.innerHTML = '';
    getFromMongo();
}