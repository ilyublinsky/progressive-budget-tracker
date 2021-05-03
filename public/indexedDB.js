const VERSION = 1;
const request = indexedDB.open("transactions", VERSION);
let db;

//Getting the DB when updated, and creating a new store if on does not exist.
request.onupgradeneeded = function (e) {
    db = e.target.result;
    if (db.objectStoreNames.length === 0)
        db.createObjectStore("TransactionsStore", { autoIncrement: true });
}

//Online browser status.
request.onsuccess = function (e) {
    db = e.target.result;
    if (navigator.onLine)
        checkDB();
}

request.onerror = function (e)
{
    console.error("Error: " + e.target.errorCode);
}

function checkDB()
{

    const getAll = db.transaction(["TransactionsStore"], "readwrite").objectStore("TransactionsStore").getAll();
    getAll.onsuccess = function ()
    {
      if (getAll.result.length > 0)
        {
            fetch("/api/transaction/bulk",
            {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(res =>
                    {
                        if (res.length !== 0)
                            db.transaction(["TransactionsStore"], "readwrite").objectStore("TransactionsStore").clear();
                    });
        }
    }
}

function saveRecord(record)
{
    db.transaction(["TransactionsStore"], "readwrite").objectStore("TransactionsStore").add(record);
}

//Checking for storaed data when the broswer is back online.
addEventListener("online", checkDB);