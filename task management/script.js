/* ==========================================================================
   TASK MANAGER WEB APP - JAVASCRIPT STATE & RENDERING ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
    // DOM Element References
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const inputError = document.getElementById('inputError');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    
    // Stats Elements
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');
    const footerSummary = document.getElementById('footerSummary');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');

    // App State
    let tasks = [];
    let currentFilter = 'all';

    // ==========================================================================
    // 1. LOCAL STORAGE PERSISTENCE
    // ==========================================================================

    /**
     * Load tasks array from browser localStorage
     */
    function loadTasks() {
        const saved = localStorage.getItem('task_manager_items');
        if (saved) {
            try {
                tasks = JSON.parse(saved);
            } catch (e) {
                tasks = [];
            }
        }
        renderTasks();
    }

    /**
     * Save current tasks array to localStorage
     */
    function saveTasks() {
        localStorage.setItem('task_manager_items', JSON.stringify(tasks));
    }

    // ==========================================================================
    // 2. TASK OPERATIONS (Add, Toggle, Delete, Clear)
    // ==========================================================================

    /**
     * Add a new task to the array
     */
    function addTask() {
        const text = taskInput.value.trim();

        // Validation: Empty check
        if (text === '') {
            inputError.textContent = '⚠️ Please enter a task before adding!';
            taskInput.focus();
            return;
        }

        // Clear error text
        inputError.textContent = '';

        // Create new task object
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        // Add to state
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();

        // Reset input field
        taskInput.value = '';
        taskInput.focus();
    }

    /**
     * Toggle completed status of a task by ID
     */
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    /**
     * Delete a task by ID
     */
    function deleteTask(id, element) {
        // Add fade-out CSS animation
        if (element) {
            element.classList.add('fade-out');
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
            }, 250);
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    /**
     * Clear all completed tasks
     */
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // ==========================================================================
    // 3. UI RENDERING ENGINE
    // ==========================================================================

    /**
     * Render task items in DOM based on current filter & update stats
     */
    function renderTasks() {
        // Filter tasks based on selected tab
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        // Clear existing list items
        taskList.innerHTML = '';

        // Render filtered tasks
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-left">
                    <div class="task-checkbox" aria-label="Toggle completed state"></div>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                </div>
                <button class="delete-btn" aria-label="Delete task">
                    🗑️
                </button>
            `;

            // Click listener on item (toggle completion)
            const taskLeft = li.querySelector('.task-left');
            taskLeft.addEventListener('click', () => toggleTask(task.id));

            // Click listener on delete button
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent toggling when clicking delete
                deleteTask(task.id, li);
            });

            taskList.appendChild(li);
        });

        // Update Empty State
        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
        }

        // Update Stats Counters
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        totalCount.textContent = total;
        pendingCount.textContent = pending;
        completedCount.textContent = completed;

        footerSummary.textContent = `${pending} task${pending !== 1 ? 's' : ''} remaining`;
    }

    /**
     * Escape special HTML characters to prevent XSS injection
     */
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ==========================================================================
    // 4. EVENT LISTENERS
    // ==========================================================================

    // Form submit listener (Clicking Add Task button or pressing Enter)
    taskForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addTask();
    });

    // Clear input error on typing
    taskInput.addEventListener('input', function () {
        if (inputError.textContent !== '') {
            inputError.textContent = '';
        }
    });

    // Filter tab button listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });

    // Clear completed button listener
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Initial load
    loadTasks();
});
