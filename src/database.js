import fs from 'node:fs/promises';
const databasePath = new URL('../db.json', import.meta.url);

export class Database {
    #database = {};

    constructor() {
        fs.readFile(databasePath, 'utf8').then(data => {
            this.#database = JSON.parse(data)
        }).catch(() => { this.#persist(); })
    }

    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    #findDataInDB(table, id) {
        const dataTable = this.#database[table] ?? [];

        const task = dataTable.find(data => data.id === id);
        if (!task) { throw ('Task not found'); }
        return task;
    }

    select(table, search) {
        let data = this.#database[table] ?? [];

        if (Object.keys(search).length > 0) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                })
            })
        }

        return data;
    }

    insert(table, data) {
        if (Array.isArray(this.#database[table])) {
            if (this.#database[table].some(task => task.title === data.title)) { throw ('Title already exists in our database.'); }
            this.#database[table].push(data);
        } else {
            this.#database[table] = [data];
        }

        this.#persist();
    }

    update(table, id, data) {
        if (Object.keys(data).length == 0) { throw ('Please, insert values: Title and/or description'); }

        let task;
        try { task = this.#findDataInDB(table, id)
        } catch(err) { throw(err); }

        const changingToSameValue = Object.entries(task).some(([key, value]) => {
            return data[key] === value && value !== undefined;
        });
        if (changingToSameValue) { throw ('Please, insert values different the current value'); }

        Object.assign(task, {...data, updated_at: new Date()});
        this.#persist();

        return task;
    }

    remove(table, id) {
        let task;
        try { task = this.#findDataInDB(table, id)
        } catch(err) { throw(err); }

        const dataTable = this.#database[table] ?? [];
        dataTable.splice(task, 1);

        this.#persist();
    }

    completeTask(table, id) {
        let task;
        try { task = this.#findDataInDB(table, id)
        } catch(err) { throw(err); }

        task.completed_at = !task.completed_at;
        this.#persist();
    }
}