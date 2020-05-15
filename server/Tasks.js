const {v4: uuidv4 }= require('uuid'); 

class Tasks {
    constructor() {
        this.tasks = {
            "0001": {title: "Task1", taskId: "0001"},
            "0002": {title: "Task2", taskId: "0002", children: ["0004", "0006"]},
            "0003": {title: "Task3", taskId: "0003"},
            "0004": {title: "Task4", taskId: "0004", parent: "0002"},
            "0007": {title: "Task7", taskId: "0007", parent: "0006"},
            "0006": {title: "Task6", taskId: "0006", parent: "0002", children: ["0007"]},
            "0005": {title: "Task5", taskId: "0005"},
          }
    }

    get(req, res) {
        res.json({result: this.tasks});
    }

    create(req, res) {
        try {
            const taskId = uuidv4();
            const {parent, title} = req.body;
            let task = {
                taskId: taskId,
                title: title
            }
            if (parent) {
                task.parent = parent;
                if (this.tasks[parent].children) {
                    this.tasks[parent].children.push(taskId);
                } else {
                    this.tasks[parent].children = [taskId];
                }
            }
            this.tasks[taskId] = task
            res.json({result: this.tasks});
        }
        catch (error) {
            res.status(500).json({error: error})
        }
    }

    complete(req, res) {
        try {
            const taskId = req.body.taskId;
            this.tasks[taskId].completed = true;
            res.json({result: this.tasks});
        }
        catch (error) {
            res.status(500).json({error: error})
        }
    }

    delete(req, res) {
        try {
            const taskId = req.params.taskId;
            let task = this.tasks[taskId];
            if (task.parent && this.tasks[task.parent]) {
                const index = this.tasks[task.parent].children.indexOf(taskId);
                if (index > -1) {
                    this.tasks[task.parent].children.splice(index, 1)
                }
            }
            this.deleteChildren(taskId);
            res.json({result: this.tasks});
        }
        catch (error) {
            res.status(500).json({error: error})
        }
    }

    deleteChildren(taskId) {
        if (this.tasks[taskId].children && this.tasks[taskId].children.length > 0) {
            this.tasks[taskId].children.forEach(id => {
                this.deleteChildren(id);
            })
        }
        delete this.tasks[taskId];
    }

}

module.exports = Tasks;