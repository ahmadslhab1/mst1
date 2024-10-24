const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

let currentUserRole = ""; 
let currentUsername = ""; 

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    currentUsername = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    currentUserRole = document.getElementById('role').value;

    const users = getUsersFromStorage();
    const existingUser = users.find(user => user.username === currentUsername && user.password === password && user.role === currentUserRole);
    
    if (!existingUser) {
        alert('«”„ «·„” Œœ„ √Ê ﬂ·„… «·„—Ê— €Ì— ’ÕÌÕ….');
        return;
    }

    if (!existingUser.approved) {
        alert('Õ”«»ﬂ ›Ì «‰ Ÿ«— «·„Ê«›ﬁ… „‰ «·„‘—›.');
        return;
    }

    alert(`„—Õ»« ${currentUsername}° ·ﬁœ ﬁ„  » ”ÃÌ· «·œŒÊ· ﬂ‹ ${currentUserRole}!`);
    document.getElementById('taskContainer').classList.remove('hidden');
    document.getElementById('showRegisterForm').style.display = 'none';
    document.getElementById('addTaskSection').style.display = currentUserRole === 'volunteer' ? 'none' : 'block';

    loadTasks();
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newRole = document.getElementById('newRole').value;

    const existingUsers = getUsersFromStorage();
    if (existingUsers.some(user => user.username === newUsername)) {
        alert('ÌÊÃœ Õ”«» »‰›” «”„ «·„” Œœ„. Ì—ÃÏ «Œ Ì«— «”„ ¬Œ—.');
        return;
    }

    addUserToStorage(newUsername, newPassword, newRole, false);

    alert(` „ ≈—”«· ÿ·»ﬂ ·≈‰‘«¡ Õ”«». Ì—ÃÏ «·«‰ Ÿ«— ·„Ê«›ﬁ… «·„‘—›.`);
    document.getElementById('registerForm').reset();
});

function addUserToStorage(username, password, role, approved) {
    const users = getUsersFromStorage();
    users.push({ username, password, role, approved });
    localStorage.setItem('users', JSON.stringify(users));
}

function getUsersFromStorage() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

document.getElementById('addTaskBtn').addEventListener('click', function() {
    if (currentUserRole !== 'admin') {
        alert('·« Ì„ﬂ‰ﬂ ≈÷«›… „Â«„° ›ﬁÿ «·„‘—›Ì‰ Ì„ﬂ‰Â„ «·ﬁÌ«„ »–·ﬂ.');
        return;
    }

    const taskTitle = document.getElementById('taskTitle').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const creationDate = new Date().toLocaleDateString('ar-EG');
    const dueDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('ar-EG');

    if (taskTitle && taskDescription) {
        const taskItems = document.getElementById('taskItems');
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${taskTitle}</td>
            <td>${taskDescription}</td>
            <td>${creationDate}</td>
            <td class="due-date">${dueDate}</td>
            <td><span class="volunteer-name">·„ Ì „ «” ·«„Â« »⁄œ</span></td>
            <td><button class="accept-btn">ﬁ»Ê·</button></td>
            <td><button class="reject-btn">—›÷</button></td>
            <td><input type="file" class="file-upload" accept=".pdf, .doc, .docx"></td>
            <td><button class="download-btn hidden"> Õ„Ì·</button></td>
            <td>
                <input type="date" class="extend-deadline hidden" />
                <button class="extend-btn hidden"> „œÌœ</button>
            </td>
        `;

        row.querySelector('.accept-btn').addEventListener('click', function() {
            const volunteerName = currentUserRole === 'admin' ? prompt('«œŒ· «”„ «·„ ÿÊ⁄') : currentUsername;
            if (volunteerName) {
                row.querySelector('.volunteer-name').textContent = volunteerName;
                row.querySelector('.accept-btn').style.backgroundColor = 'green';
                row.querySelector('.reject-btn').style.display = 'none';
                row.querySelector('.download-btn').classList.remove('hidden');
                alert(` „ ﬁ»Ê· «·„Â„…: ${taskTitle}`);
            }
        });

        row.querySelector('.reject-btn').addEventListener('click', function() {
            alert(` „ —›÷ «·„Â„…: ${taskTitle}`);
            row.querySelector('.accept-btn').style.display = 'none';
        });

        row.querySelector('.file-upload').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const storageRef = storage.ref(`uploads/${file.name}`);
                storageRef.put(file).then(() => {
                    alert(` „ —›⁄ «·„·›: ${file.name}`);
                });
            }
        });

        row.querySelector('.extend-btn').addEventListener('click', function() {
            const newDueDate = row.querySelector('.extend-deadline').value;
            if (newDueDate) {
                row.querySelector('.due-date').textContent = newDueDate;
                alert(` „  „œÌœ „Ê⁄œ «· ”·Ì„ ≈·Ï: ${newDueDate}`);
            } else {
                alert('Ì—ÃÏ «Œ Ì«—  «—ÌŒ ÃœÌœ.');
            }
        });

        if (currentUserRole === 'admin') {
            row.querySelector('.extend-deadline').classList.remove('hidden');
            row.querySelector('.extend-btn').classList.remove('hidden');
        }

        taskItems.appendChild(row);
        addTaskToStorage(taskTitle, taskDescription, '', creationDate, dueDate);
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
    } else {
        alert('Ì—ÃÏ  ⁄»∆… Ã„Ì⁄ «·ÕﬁÊ·!');
    }
});

function addTaskToStorage(title, description, volunteer, creationDate, dueDate) {
    const tasks = getTasksFromStorage();
    tasks.push({ title, description, volunteer, creationDate, dueDate });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    const tasks = localStorage.getItem('tasks');
    return tasks ? JSON.parse(tasks) : [];
}

function loadTasks() {
    const tasks = getTasksFromStorage();
    const taskItems = document.getElementById('taskItems');
    taskItems.innerHTML = '';

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.title}</td>
            <td>${task.description}</td>
            <td>${task.creationDate}</td>
            <td class="due-date">${task.dueDate}</td>
            <td><span class="volunteer-name">${task.volunteer || '·„ Ì „ «” ·«„Â« »⁄œ'}</span></td>
            <td><button class="accept-btn">ﬁ»Ê·</button></td>
            <td><button class="reject-btn">—›÷</button></td>
            <td><input type="file" class="file-upload" accept=".pdf, .doc, .docx"></td>
            <td><button class="download-btn hidden"> Õ„Ì·</button></td>
            <td>
                <input type="date" class="extend-deadline hidden" />
                <button class="extend-btn hidden"> „œÌœ</button>
            </td>
        `;

        if (currentUserRole === 'admin') {
            row.querySelector('.extend-deadline').classList.remove('hidden');
            row.querySelector('.extend-btn').classList.remove('hidden');
        }

        taskItems.appendChild(row);
    });
}
