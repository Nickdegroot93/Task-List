('use strict');
// if (e.target.id == 'btn-delete-category') {
// 	const cat = e.target.closest('.category');
// 	console.log(cat);
// }

class Category {
	id = Math.floor(Math.random() * Date.now());
	date = new Date().toLocaleDateString();
	allTasks = [];

	constructor(title) {
		this.title = title;
	}
}

class Task {
	id = Math.floor(Math.random() * Date.now());
	date = new Date().toISOString().split('T')[0];

	constructor(title, description, priority, dueDate, completed) {
		this.title = title;
		this.description = description;
		this.priority = priority;
		this.dueDate = dueDate;
		this.completed = completed;
	}
}
///////////////////////////////////////
// APPLICATION ARCHITECTURE
const overlay = document.querySelector('.overlay');
const addCategory = document.querySelector('.add-category__box');
const addTask = document.querySelector('.add-task');
const categoryModal = document.querySelector('#category-modal');
const categoriesBox = document.querySelector('.categories__box');
const taskModal = document.querySelector('#task-modal');
const taskContainer = document.querySelector('.task-container');
const categoryContainer = document.querySelector('.categories-container');
const btnCloseModal = document.querySelectorAll('.btn--close-modal');
const btnConfirmCategory = document.querySelector('#btn-category-confirm');
const btnConfirmTask = document.querySelector('#btn-task-confirm');
const inputCategoryTitle = document.querySelector('#category-title');
const charLengthWarning = document.querySelector('.charlengh-warning');
const dateWarning = document.querySelector('.valid-date');
const inputTaskTitle = document.querySelector('#task-title');
const inputTaskDescription = document.querySelector('#input-description');
const inputPriorities = document.querySelector('#priorities');
const inputDueDate = document.querySelector('#duedate');

class App {
	#categories = [];

	constructor() {
		// Create default category
		const defaultCategory = new Category('Default');
		this.#categories.push(defaultCategory);
		this._renderCategory(defaultCategory);
		document.querySelector('.category').classList.add('active');

		////////////// EVENT HANDLERS //////////////////
		// Show category modal
		addCategory.addEventListener('click', this._displayCategoryModal);

		// Show task modal
		addTask.addEventListener('click', this._displayTaskModal);

		// Close modals on clicking overlay
		overlay.addEventListener('click', this._closeModals);

		// Close modals on clicking close button
		btnCloseModal.forEach((btn) => {
			btn.addEventListener('click', this._closeModals);
		});

		// Create category upon clicking confirm button
		btnConfirmCategory.addEventListener('click', this._newCategory.bind(this));

		// Create task upon clicking confirm button
		btnConfirmTask.addEventListener('click', this._newTask.bind(this));

		// Create category/task upon clicking enter
		window.addEventListener('keydown', (e) => {
			if (!categoryModal.classList.contains('hidden') && e.code == 'Enter') {
				this._newCategory();
			}
			if (!taskModal.classList.contains('hidden') && e.code == 'Enter') {
				this._newTask();
			}
		});

		// Switch between active category
		categoriesBox.addEventListener('click', this._setActiveCategory.bind(this));

		// Handle category edit and delete buttons
		categoriesBox.addEventListener('click', (e) => {
			// guard
			if (!e.target.closest('.category')) return;
			const id = e.target.closest('.category').dataset.id;
			if (e.target.id == 'btn-delete-category') {
				this._deleteCategory(id);
				this._clearAllCategories();
				this._renderAllCategories();
				this._clearTasks();
				console.log(e.target.closest('.category'));
			}
			if (e.target.id == 'btn-edit-category') {
				console.log(id);
			}
		});
	}

	_deleteCategory(id) {
		this.#categories.forEach((cat, i) => {
			if (cat.id == id) {
				this.#categories.splice(i, 1);
			}
		});
		if (this.#categories.length < 1) {
			addTask.style.display = 'none';
		}
	}

	_setActiveCategory(e) {
		// Create active category
		const category = e.target.closest('.category');
		// Guard clauses
		if (!category) return;
		if (category.classList.contains('active')) return;
		// Remove all active classes, add it to selected
		this._removeActiveClasses();
		category.classList.add('active');

		// Clear all current tasks
		this._clearTasks();

		// Render tasks belonging to active category
		this._renderAllTasks(category);
	}

	_setDefaultActiveCategory() {}

	_renderAllTasks(category) {
		this.#categories.forEach((cat) => {
			if (cat.id == category.dataset.id) {
				cat.allTasks.forEach((task) => {
					this._renderTask(task);
				});
			}
		});
	}

	_renderAllCategories() {
		this.#categories.forEach((cat) => {
			this._renderCategory(cat);
		});
	}

	_clearAllCategories() {
		let categories = categoryContainer.getElementsByClassName('category');

		while (categories[0]) {
			categories[0].parentNode.removeChild(categories[0]);
		}
	}

	_displayCategoryModal() {
		overlay.classList.remove('hidden');
		categoryModal.classList.remove('hidden');
		setTimeout(() => {
			inputCategoryTitle.focus();
		}, 100);
	}

	_displayTaskModal() {
		overlay.classList.remove('hidden');
		taskModal.classList.remove('hidden');
	}

	_closeModals() {
		overlay.classList.add('hidden');
		if (!categoryModal.classList.contains('hidden')) {
			categoryModal.classList.add('hidden');
			inputCategoryTitle.value = '';
		}
		if (!taskModal.classList.contains('hidden')) {
			taskModal.classList.add('hidden');
		}
	}

	_newCategory() {
		// Check if there is input not longer than 40 chars.
		if (
			inputCategoryTitle.value == '' ||
			inputCategoryTitle.value.length > 40
		) {
			charLengthWarning.classList.remove('hidden');
			return;
		}
		// Create new category object, push into array
		const catTitle = inputCategoryTitle.value;
		const category = new Category(catTitle);
		this.#categories.push(category);

		// Close modals, clear input & reset warning to hidden
		this._closeModals();
		inputCategoryTitle.value = '';
		charLengthWarning.classList.add('hidden');
		// Remove all active classes
		this._removeActiveClasses();
		// Render category
		this._renderCategory(category);
		// Set new category as active
		categoriesBox.lastChild.classList.add('active');
		//
		if (this.#categories.length > 0) {
			addTask.style.display = 'block';
		}
		// Empty all tasks (newly created category cannot have tasks upon creation)
		this._clearTasks();
	}

	_newTask() {
		// Check input
		if (inputTaskTitle.value == '' || inputTaskTitle.value.length > 40) {
			charLengthWarning.classList.remove('hidden');
			return;
		}
		let date = new Date().toISOString().split('T')[0];
		let taskDueDate;
		const taskTitle = inputTaskTitle.value;
		const taskDescription = inputTaskDescription.value;
		const taskPriority = inputPriorities.value;

		// Check if due date in future
		if (date <= inputDueDate.value) {
			taskDueDate = inputDueDate.value;
		} else if (date > inputDueDate.value) {
			dateWarning.classList.remove('hidden');
			return;
		}
		// Create new task object
		const task = new Task(
			taskTitle,
			taskDescription,
			taskPriority,
			taskDueDate,
			false
		);
		// Check which category is currently active
		let allCategories = document.querySelectorAll('.category');
		allCategories.forEach((cat) => {
			if (cat.classList.contains('active')) {
				const activeCategory = cat;
				const curID = activeCategory.dataset.id;

				// Loop over categories array to find matching ID
				this.#categories.forEach((cat) => {
					if (cat.id == curID) {
						cat.allTasks.push(task);
					}
				});
			}
		});

		// Clear task inputs
		this._clearTaskInputs();
		// Hide modals
		this._closeModals();
		// Clear all tasks from display
		this._clearTasks();
		// Render all tasks from active category
		allCategories.forEach((cat) => {
			if (cat.classList.contains('active')) {
				const activeCategory = cat;
				const curID = activeCategory.dataset.id;

				// Loop over categories array to find matching ID
				this.#categories.forEach((cat) => {
					if (cat.id == curID) {
						cat.allTasks.forEach((task) => {
							this._renderTask(task);
						});
					}
				});
			}
		});
	}

	_clearTasks() {
		while (taskContainer.childNodes.length > 2) {
			taskContainer.removeChild(taskContainer.lastChild);
		}
	}

	_clearTaskInputs() {
		inputDueDate.value = inputTaskTitle.value = inputTaskDescription.value = '';
		inputPriorities.value = 'low';
	}

	_renderCategory(category) {
		let html = `<div class="category" data-id="${category.id}">
						<p class="category__title">${category.title}</p>
						<p class="category__date">${category.date}</p>
						<div class="category__btns">
							<img src="img/delete.png" alt="delete" class="btn btn-delete" id="btn-delete-category"/>
							<img src="img/edit.png" alt="edit" class="btn btn-edit" id="btn-edit-category"/>
						</div>
					</div>`;

		categoriesBox.insertAdjacentHTML('beforeend', html);
	}

	_renderTask(task) {
		let html = `<div class="task" id="task-${task.id}">
		<div class="task__title">${task.title}</div>
		<div class="task__description">
			${task.description}
		</div>
		<div class="task__details">
			<div class="task__date-created">Date Created: ${task.date}</div>
			<div class="task__date-due">Due Date: ${task.dueDate}</div>
			<div class="task__priority">Priority: ${task.priority}</div>
			<div class="task__buttons">
				<img
					src="img/delete.png"
					alt="delete"
					class="btn btn-delete"
					id="btn-delete__task"
				/>
				<img
					src="img/edit.png"
					alt="edit"
					class="btn btn-edit"
					id="btn-edit__task"
				/>
				<img
					src="img/checkmark.png"
					alt="edit"
					class="btn btn-check"
					id="btn-check__task"
				/>
			</div>
		</div>
	</div>`;
		taskContainer.insertAdjacentHTML('beforeend', html);
	}

	_removeActiveClasses() {
		let allCategories = document.querySelectorAll('.category');
		allCategories.forEach((cat) => {
			if (cat.classList.contains('active')) cat.classList.remove('active');
		});
	}
}

const app = new App();
