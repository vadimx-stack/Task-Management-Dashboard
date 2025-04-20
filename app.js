document.addEventListener('DOMContentLoaded', () => {
    const boardsContainer = document.getElementById('boardsContainer');
    const addBoardBtn = document.getElementById('addBoardBtn');
    const boardTemplate = document.getElementById('boardTemplate');
    const taskTemplate = document.getElementById('taskTemplate');
    
    let boards = JSON.parse(localStorage.getItem('taskBoards')) || [];
    
    const renderBoards = () => {
        boardsContainer.innerHTML = '';
        boards.forEach((board, boardIndex) => {
            const boardElement = createBoardElement(board, boardIndex);
            boardsContainer.appendChild(boardElement);
        });
        
        saveBoards();
    };
    
    const createBoardElement = (board, boardIndex) => {
        const boardClone = boardTemplate.content.cloneNode(true);
        const boardElement = boardClone.querySelector('.board');
        const title = boardElement.querySelector('.board-title');
        const tasksContainer = boardElement.querySelector('.tasks-container');
        const addTaskBtn = boardElement.querySelector('.add-task-btn');
        const deleteBoardBtn = boardElement.querySelector('.delete-board-btn');
        
        boardElement.dataset.boardIndex = boardIndex;
        
        title.textContent = board.title;
        
        title.addEventListener('blur', () => {
            boards[boardIndex].title = title.textContent;
            saveBoards();
        });
        
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                title.blur();
            }
        });
        
        board.tasks.forEach((task, taskIndex) => {
            const taskElement = createTaskElement(task, boardIndex, taskIndex);
            tasksContainer.appendChild(taskElement);
        });
        
        addTaskBtn.addEventListener('click', () => {
            const newTask = {
                title: 'Новая задача',
                description: 'Описание задачи'
            };
            
            boards[boardIndex].tasks.push(newTask);
            const taskElement = createTaskElement(newTask, boardIndex, boards[boardIndex].tasks.length - 1);
            tasksContainer.appendChild(taskElement);
            saveBoards();
        });
        
        deleteBoardBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить эту доску?')) {
                boards.splice(boardIndex, 1);
                renderBoards();
            }
        });
        
        Sortable.create(tasksContainer, {
            group: 'tasks',
            animation: 150,
            onEnd: function(evt) {
                const fromBoardIndex = parseInt(evt.from.closest('.board').dataset.boardIndex);
                const toBoardIndex = parseInt(evt.to.closest('.board').dataset.boardIndex);
                
                if (fromBoardIndex === toBoardIndex) {
                    const tasksList = Array.from(evt.from.querySelectorAll('.task'));
                    boards[fromBoardIndex].tasks = tasksList.map(taskEl => {
                        const taskIndex = parseInt(taskEl.dataset.taskIndex);
                        return boards[fromBoardIndex].tasks[taskIndex];
                    });
                } else {
                    const movedTask = boards[fromBoardIndex].tasks.splice(evt.oldIndex, 1)[0];
                    boards[toBoardIndex].tasks.splice(evt.newIndex, 0, movedTask);
                    
                    renderBoards();
                }
                
                saveBoards();
            }
        });
        
        return boardElement;
    };
    
    const createTaskElement = (task, boardIndex, taskIndex) => {
        const taskClone = taskTemplate.content.cloneNode(true);
        const taskElement = taskClone.querySelector('.task');
        const title = taskElement.querySelector('.task-title');
        const description = taskElement.querySelector('.task-description');
        const deleteTaskBtn = taskElement.querySelector('.delete-task-btn');
        
        taskElement.dataset.boardIndex = boardIndex;
        taskElement.dataset.taskIndex = taskIndex;
        
        title.textContent = task.title;
        description.textContent = task.description;
        
        title.addEventListener('blur', () => {
            boards[boardIndex].tasks[taskIndex].title = title.textContent;
            saveBoards();
        });
        
        description.addEventListener('blur', () => {
            boards[boardIndex].tasks[taskIndex].description = description.textContent;
            saveBoards();
        });
        
        title.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                title.blur();
            }
        });
        
        deleteTaskBtn.addEventListener('click', () => {
            boards[boardIndex].tasks.splice(taskIndex, 1);
            renderBoards();
        });
        
        return taskElement;
    };
    
    const saveBoards = () => {
        localStorage.setItem('taskBoards', JSON.stringify(boards));
    };
    
    addBoardBtn.addEventListener('click', () => {
        const newBoard = {
            title: 'Новая доска',
            tasks: []
        };
        
        boards.push(newBoard);
        renderBoards();
    });
    
    if (boards.length === 0) {
        boards = [
            {
                title: 'Задачи',
                tasks: []
            },
            {
                title: 'В процессе',
                tasks: []
            },
            {
                title: 'Готово',
                tasks: []
            }
        ];
    }
    
    renderBoards();
}); 