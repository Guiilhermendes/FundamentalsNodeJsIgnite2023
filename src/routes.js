import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.query;

            const search = {};
            if (title) search["title"] = title;
            if (description) search["description"] = description;

            let tasks = database.select("tasks", search)
            return res.writeHead(201).end(JSON.stringify(tasks));
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body;
    
            if (!title) return res.writeHead(404).end('Title is not defined!');
            if (!description) return res.writeHead(404).end('Description is not defined!');
    
            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                create_at: new Date(),
                updated_at: new Date()
            }

            try {
                database.insert("tasks", task)
            } catch (err) {
                return res.writeHead(500).end(String(err));
            }
            
            return res.writeHead(201).end();
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            const task = {};
            if (title) task["title"] = title;
            if (description) task["description"] = description;

            let updatedTask;
            try {
                updatedTask = database.update("tasks", id, task)
            } catch (err) {
                return res.writeHead(500).end(String(err));
            }
            
            return res.writeHead(200).end(JSON.stringify(updatedTask));
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                database.remove("tasks", id)
            } catch (err) {
                return res.writeHead(500).end(String(err));
            }

            return res.writeHead(200).end("Task removed");
        } 
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params;

            try {
                database.completeTask("tasks", id)
            } catch (err) {
                return res.writeHead(500).end(String(err));
            }

            return res.writeHead(200).end("Task completed");
        }
    }
];