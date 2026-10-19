(() => {
  const $ = (selector) => document.querySelector(selector);
  const STORAGE_KEY = 'dayflow-tasks-v1';
  const THEME_KEY = 'dayflow-theme';
  let tasks = [];
  let filter = 'all';
  let editingId = null;
  let toastTimer;

  const form = $('#taskForm');
  const nameInput = $('#taskName');
  const descriptionInput = $('#taskDescription');
  const categoryInput = $('#taskCategory');
  const priorityInput = $('#taskPriority');
  const dueInput = $('#taskDue');

  function storageAvailable() {
    try {
      const testKey = '__dayflow_storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      tasks = Array.isArray(parsed) ? parsed.map((task) => ({
        ...task,
        category: ['Work', 'Personal', 'Study'].includes(task.category) ? task.category : 'Personal',
        done: Boolean(task.done),
        created: Number(task.created) || Date.now()
      })) : [];
    } catch (error) {
      tasks = [];
      toast('Saved tasks could not be read. Starting with an empty list.');
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (error) {
      toast('Could not save. Browser storage may be unavailable or full.');
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function todayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function formatDate(value) {
    if (!value) return '';
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function getVisibleTasks() {
    const query = $('#searchInput').value.trim().toLowerCase();
    const category = $('#categoryFilter').value;
    let visible = tasks.filter((task) => {
      const matchesText = `${task.title} ${task.description || ''} ${task.category || ''}`.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || task.category === category;
      const matchesStatus = filter === 'all' || (filter === 'active' && !task.done) || (filter === 'completed' && task.done);
      return matchesText && matchesCategory && matchesStatus;
    });
    const sort = $('#sortSelect').value;
    visible.sort((a, b) => {
      if (sort === 'due') return (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31');
      if (sort === 'priority') return ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 1);
      return b.created - a.created;
    });
    return visible;
  }

  function render() {
    const completed = tasks.filter((task) => task.done).length;
    const active = tasks.length - completed;
    const rate = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    $('#totalStat').textContent = tasks.length;
    $('#doneStat').textContent = completed;
    $('#progressStat').textContent = active;
    $('#rateStat').textContent = `${rate}%`;
    $('#progressBar').style.width = `${rate}%`;
    $('#allCount').textContent = tasks.length;
    $('#activeCount').textContent = active;
    $('#completedCount').textContent = completed;

    const labels = { all: 'All tasks', active: 'Active tasks', completed: 'Completed tasks' };
    $('#crumb').textContent = labels[filter];
    $('#listTitle').childNodes[0].textContent = `${labels[filter]} `;
    const visible = getVisibleTasks();
    $('#visibleCount').textContent = visible.length;
    $('#taskList').innerHTML = visible.map((task) => {
      const overdue = task.due && task.due < todayString() && !task.done;
      return `<article class="task-row ${task.done ? 'is-done' : ''}" data-task-row="${escapeHTML(task.id)}">
        <input class="task-check" type="checkbox" data-action="toggle" data-id="${escapeHTML(task.id)}" ${task.done ? 'checked' : ''} aria-label="Mark ${escapeHTML(task.title)} complete">
        <div class="task-content"><div class="task-title">${escapeHTML(task.title)}</div>
          ${task.description ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ''}
          <div class="task-meta"><span class="pill category-${String(task.category).toLowerCase()}">${escapeHTML(task.category || 'Personal')}</span>
          <span class="pill priority-${escapeHTML(task.priority || 'medium')}">${escapeHTML((task.priority || 'medium').toUpperCase())} priority</span>
          ${task.due ? `<span class="due-date ${overdue ? 'overdue' : ''}">${overdue ? 'Overdue · ' : 'Due '}${formatDate(task.due)}</span>` : ''}</div>
        </div><div class="task-actions"><button class="icon-btn" data-action="edit" data-id="${escapeHTML(task.id)}" aria-label="Edit task">✎</button><button class="icon-btn" data-action="delete" data-id="${escapeHTML(task.id)}" aria-label="Delete task">×</button></div>
      </article>`;
    }).join('');
    $('#emptyState').classList.toggle('hidden', visible.length > 0);
    $('#taskList').classList.toggle('hidden', visible.length === 0);
    document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
  }

  function openForm(task = null) {
    editingId = task?.id ?? null;
    $('#formTitle').textContent = task ? 'Edit task' : 'Create a task';
    $('#saveTaskBtn').textContent = task ? 'Save changes' : 'Save task';
    nameInput.value = task?.title || '';
    descriptionInput.value = task?.description || '';
    categoryInput.value = task?.category || 'Personal';
    priorityInput.value = task?.priority || 'medium';
    dueInput.value = task?.due || '';
    form.classList.remove('hidden');
    nameInput.focus();
  }

  function closeForm() {
    form.classList.add('hidden');
    form.reset();
    editingId = null;
  }

  $('#addTaskBtn').addEventListener('click', () => openForm());
  $('#emptyAddBtn').addEventListener('click', () => openForm());
  $('#closeForm').addEventListener('click', closeForm);
  $('#cancelForm').addEventListener('click', closeForm);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = nameInput.value.trim();
    if (!title) return;
    const values = {
      title,
      description: descriptionInput.value.trim(),
      category: categoryInput.value,
      priority: priorityInput.value,
      due: dueInput.value
    };
    if (editingId) {
      const task = tasks.find((item) => item.id === editingId);
      if (task) Object.assign(task, values);
      showToast('Task updated');
    } else {
      tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...values, done: false, created: Date.now() });
      showToast('Task added — you’ve got this!');
    }
    saveToLocalStorage();
    closeForm();
    render();
  });

  $('#taskList').addEventListener('change', (event) => {
    const checkbox = event.target.closest('input[data-action="toggle"]');
    if (!checkbox) return;
    const task = tasks.find((item) => item.id === checkbox.dataset.id);
    if (!task) return;
    task.done = checkbox.checked;
    if (task.done) {
      const row = checkbox.closest('.task-row');
      row?.classList.add('just-completed');
      showToast('Nice work — task completed!');
    } else {
      showToast('Task moved to active');
    }
    saveToLocalStorage();
    window.setTimeout(render, task.done ? 350 : 0);
  });

  $('#taskList').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const task = tasks.find((item) => item.id === button.dataset.id);
    if (!task) return;
    if (button.dataset.action === 'edit') openForm(task);
    if (button.dataset.action === 'delete' && window.confirm(`Delete “${task.title}”?`)) {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveToLocalStorage();
      render();
      showToast('Task deleted');
    }
  });

  document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    render();
  }));
  $('#searchInput').addEventListener('input', render);
  $('#categoryFilter').addEventListener('change', render);
  $('#sortSelect').addEventListener('change', render);
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light');
    try { localStorage.setItem(THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark'); } catch { /* Theme preference is optional. */ }
  });

  try { if (localStorage.getItem(THEME_KEY) === 'light') document.body.classList.add('light'); } catch { /* Keep default theme. */ }
  $('#todayLabel').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  if (!storageAvailable()) showToast('Browser storage is unavailable; tasks may not persist.');
  loadFromLocalStorage();
  render();
})();
