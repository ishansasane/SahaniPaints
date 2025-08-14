import React, { useState } from "react";


const ConfirmBox = ({  setConfirmBox, deleteProject, project }) => {

    const chooseOption = (val) => {
        if(val){
            deleteProject(project.projectName);
        }
        setConfirmBox(false);
    }

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-lg bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md shadow-md text-center">
        <p className="mb-4">Do you want to the delete the project ?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => chooseOption(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Yes
          </button>
          <button
            onClick={() => chooseOption(false)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
