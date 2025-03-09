document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const removeSelectedBtn = document.getElementById("removeSelected");
    const totalCount = document.getElementById("totalCount");
    const completedCount = document.getElementById("completedCount");
    const themeToggle = document.getElementById("themeToggle");
    const sortAscBtn = document.getElementById("sortAsc");
    const sortDescBtn = document.getElementById("sortDesc");
    const resetOrderBtn = document.getElementById("resetOrder");
    const deletedCountDisplay = document.getElementById("deletedCount");
    const editedCountDisplay = document.getElementById("editedCount");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let originalTasks = [...tasks]; 
    let deletedCount = parseInt(localStorage.getItem("deletedCount")) || 0;
    let editedCount = parseInt(localStorage.getItem("editedCount")) || 0;

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateDeletedCount() {
        deletedCount++;
        localStorage.setItem("deletedCount", deletedCount);
        deletedCountDisplay.textContent = deletedCount;
    }

    function updateEditedCount() {
        editedCount++;
        localStorage.setItem("editedCount", editedCount);
        editedCountDisplay.textContent = editedCount;
    }

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            const li = document.createElement("li");
            li.draggable = true;
            li.classList.toggle("completed", task.completed);
            li.classList.toggle("selected", task.selected);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.selected;
            checkbox.addEventListener("change", () => toggleSelect(index));

            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            taskText.addEventListener("dblclick", () => editTask(index));

            const taskButtons = document.createElement("div");
            taskButtons.classList.add("task-buttons");

            const checkBtn = document.createElement("button");
            checkBtn.innerHTML = "✔️";
            checkBtn.classList.add("check-btn");
            checkBtn.addEventListener("click", () => toggleComplete(index));

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "❌";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.addEventListener("click", () => confirmDelete(index));

            taskButtons.appendChild(checkBtn);
            taskButtons.appendChild(deleteBtn);
            li.appendChild(checkbox);
            li.appendChild(taskText);
            li.appendChild(taskButtons);
            li.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", index);
            });

            taskList.appendChild(li);
        });
        updateCounters();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) {
            alert("Task cannot be empty!");
            return;
        }
        
        if (tasks.some(task => task.text.toLowerCase() === text.toLowerCase())) {
            alert("This task already exists!");
            return;
        }
        tasks.push({ text, completed: false, selected: false });
        originalTasks = [...tasks]; 
        saveTasks();
        renderTasks();
        taskInput.value = "";
    }

    function toggleSelect(index) {
        tasks[index].selected = !tasks[index].selected;
        saveTasks();
        renderTasks();
    }

    function editTask(index) {
        const li = taskList.children[index];
        const taskText = li.querySelector("span");
        const input = document.createElement("input");
        input.type = "text";
        input.value = tasks[index].text;
        input.classList.add("edit-input");

        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.disabled = true;
        deleteBtn.style.opacity = "0.5"; 

        li.replaceChild(input, taskText);
        input.focus();

        function saveEdit() {
            const newText = input.value.trim();
            if (!newText) return;
            if (tasks.some((task, i) => i !== index && task.text.toLowerCase() === newText.toLowerCase())) {
                alert("This task already exists!");
                return;
            }
            tasks[index].text = newText;
            saveTasks();
            renderTasks();
            updateEditedCount();
        }

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                saveEdit();
            }
        });
        input.addEventListener("blur", saveEdit);
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function confirmDelete(index) {
        if (confirm("Are you sure you want to delete this task?")) {
            tasks.splice(index, 1);
            originalTasks = [...tasks]; 
            saveTasks();
            renderTasks();
            updateDeletedCount();
        }
    }

    function removeSelected() {
        const selectedCount = tasks.filter(task => task.selected).length;
        if (selectedCount === 0) {
            alert("No tasks selected!");
            return;
        }
        if (confirm(`Are you sure you want to delete ${selectedCount} selected tasks?`)) {
            tasks = tasks.filter(task => !task.selected);
            originalTasks = [...tasks]; 
            saveTasks();
            renderTasks();
            updateDeletedCount();
        }
    }

    function updateCounters() {
        totalCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(task => task.completed).length;
    }

    sortAscBtn.addEventListener("click", () => {
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        saveTasks();
        renderTasks();
    });

    sortDescBtn.addEventListener("click", () => {
        tasks.sort((a, b) => b.text.localeCompare(a.text));
        saveTasks();
        renderTasks();
    });

    resetOrderBtn.addEventListener("click", () => {
        tasks = [...originalTasks]; 
        saveTasks();
        renderTasks();
    });

    taskList.addEventListener("dragover", (e) => e.preventDefault());

    taskList.addEventListener("drop", (e) => {
        const fromIndex = e.dataTransfer.getData("text/plain");
        const toElement = e.target.closest("li");
        if (toElement) {
            const toIndex = [...taskList.children].indexOf(toElement);
            const [movedTask] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, movedTask);
            originalTasks = [...tasks]; 
            saveTasks();
            renderTasks();
        }
    });

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    function styleButtons() {
        const buttons = [removeSelectedBtn, sortAscBtn, sortDescBtn, resetOrderBtn];
        buttons.forEach(button => {
            button.style.backgroundColor = "#007bff";
            button.style.color = "white";
            button.style.border = "none";
            button.style.padding = "8px 12px";
            button.style.borderRadius = "5px";
            button.style.cursor = "pointer";
        });
    }

    styleButtons();
    
    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => { if (e.key === "Enter") addTask(); });
    removeSelectedBtn.addEventListener("click", removeSelected);

    renderTasks();
    deletedCountDisplay.textContent = deletedCount;
    editedCountDisplay.textContent = editedCount;
});
