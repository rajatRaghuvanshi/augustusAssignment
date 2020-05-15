import React from "react";
import "./App.css";

import Chain from "./Chain";

import showButton from "./assets/images/button.svg";
import addButton from "./assets/images/signs.svg";
import deleteTask from "./assets/images/delete.svg";
import finished from "./assets/images/finished.svg";
import rightArrow from "./assets/images/rightArrow.svg";
import downArrow from "./assets/images/downArrow.svg";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: {},
      isFetching: false, // to show spinner
      activeTask: "Home",
      showAddTaskField: false,
      openedList: ["Home"],
      showAllList: {},
    };
  }

  componentDidMount() {
    fetch("http://localhost:3001/tasks")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          data: data.result,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  saveTask(e) {
    if (e.key === "Enter") {
      fetch("http://localhost:3001/task", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: e.target.value,
          parent:
            this.state.activeTask !== "Home" ? this.state.activeTask : null,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.setState({
            data: data.result,
            showAddTaskField: false,
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  handleDelete(taskId) {
    fetch(`http://localhost:3001/task/${taskId}`, {
      method: "DELETE", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const activeIndex = this.state.openedList.indexOf(taskId);
        if (activeIndex > -1) {
          this.setState({
            openedList: this.state.openedList.slice(0, activeIndex),
            activeTask: this.state.openedList[activeIndex - 1],
          });
        }
        this.setState({
          data: data.result,
          showAddTaskField: false,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  handleCompleted(taskId) {
    fetch("http://localhost:3001/task", {
      method: "PUT", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskId: taskId }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          data: data.result,
          showAddTaskField: false,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  getMainTasks() {
    // return all main tasks which aren't subtasks of any task
    let tasks = [];
    for (let taskId in this.state.data) {
      if (!this.state.data[taskId].parent) {
        tasks.push(this.state.data[taskId]);
      }
    }
    return tasks;
  }

  getChainTrail(taskId, openedList, startPoint) {
    // get trail of what is currenlty open
    if (
      !this.state.data[taskId].parent ||
      this.state.data[taskId].parent === openedList[startPoint - 1]
    ) {
      openedList.splice(startPoint, 0, taskId);
      return openedList;
    } else {
      openedList.splice(startPoint, 0, taskId);
      return this.getChainTrail(
        this.state.data[taskId].parent,
        openedList,
        startPoint
      );
    }
  }

  handleTaskSelection(taskId) {
    // when user click on show task
    let openedList = this.getChainTrail(
      taskId,
      this.state.openedList,
      this.state.openedList.length
    );
    this.setState({
      activeTask: taskId,
      openedList: openedList,
    });
  }

  changeTask(taskId) {
    // when user clicks on trail to navigate to previous tasks
    let index = this.state.openedList.indexOf(taskId);
    if (index > -1) {
      this.setState({
        openedList: this.state.openedList.slice(0, index + 1),
        activeTask: taskId,
      });
    }
  }

  handleAddTaskButton(show) {
    // show/hide task edittor
    this.setState({
      showAddTaskField: show,
    });
  }

  openChildren(taskId, show) {
    // show/hide sub tasks 
    this.setState({
      showAllList: {
        ...this.state.showAllList,
        [taskId]: show,
      },
    });
  }

  // -----------Rendering---------

  renderChildren(list) {
    return list.map((id) => {
      return this.renderTask(id);
    });
  }

  renderTask(taskId) {
    let task = this.state.data[taskId];
    if (!task) return null;
    const activeTask = this.state.activeTask === taskId;
    const isOpened = this.state.showAllList[taskId];
    return (
      <div
        key={taskId}
        className={"task " + (task.completed ? "completed" : "")}
      >
        <span className="menu-button-wrapper">
          <img
            alt=""
            className="menu-button"
            src={deleteTask}
            onClick={() => this.handleDelete(taskId)}
          />
          <img
            alt=""
            className="menu-button"
            src={finished}
            onClick={() => this.handleCompleted(taskId)}
          />
          {task.children && task.children.length > 0  && !activeTask ? (
            isOpened ? (
              <img
                alt=""
                className="menu-button"
                src={downArrow}
                onClick={() => this.openChildren(taskId, false)}
              />
            ) : (
              <img
                alt=""
                className="menu-button"
                src={rightArrow}
                onClick={() => this.openChildren(taskId, true)}
              />
            )
          ) : null}
        </span>
        {!activeTask && (
          <img
            alt=""
            className="showButton"
            src={showButton}
            onClick={() => this.handleTaskSelection(taskId)}
          />
        )}
        <span className={activeTask ? "activeTask" : ""}>{task.title}</span>
        {(activeTask || isOpened) &&
          task.children &&
          this.renderChildren(task.children)}
      </div>
    );
  }

  renderTasks() {
    let tasks = this.getMainTasks();
    return (
      <div>
        {tasks.map((task) => {
          return this.renderTask(task.taskId);
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="todo">
        <Chain
          list={this.state.openedList}
          changeTask={(taskId) => this.changeTask(taskId)}
          data={this.state.data}
        />
        {this.state.activeTask === "Home"
          ? this.renderTasks()
          : this.renderTask(this.state.activeTask)}
        <div className="add-task-wrapper">
          <img
            alt=""
            className="addButton"
            src={addButton}
            onClick={() => this.handleAddTaskButton(true)}
          />
          {this.state.showAddTaskField && (
            <input
              onKeyDown={(event) => this.saveTask(event)}
              className="add-task-input"
              type="text"
              autoFocus
            />
          )}
        </div>
      </div>
    );
  }
}

export default App;
