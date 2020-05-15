import React from "react";

import rightArrow from "./assets/images/rightArrow.svg";

import "./Chain.css";

export default function Chain(props) {
  return (
    <div className="chain">
      {props.list.map((taskId, index) => {
        const title = taskId === "Home" ? "Home" : props.data[taskId].title;
        return (
          <span className="chain-title" key={taskId}>
            <span onClick={() => props.changeTask(taskId)}>{title}</span>
            {index < props.list.length - 1 && (
              <img alt="" className="chain-arrow" src={rightArrow} />
            )}
          </span>
        );
      })}
    </div>
  );
}
