        // Global variables
        let currentUser = null;
        let allTasks = [];

        // Helper: set the active nav link based on current location or SPA page id
        function setActiveNavFromLocation() {
            try {
                const navLinks = document.querySelectorAll('.nav-links a');
                navLinks.forEach(a => a.classList.remove('active'));

                navLinks.forEach(a => {
                    const href = a.getAttribute('href') || '';
                    if (!href) return;
                    if (href === 'index.html' && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html'))) {
                        a.classList.add('active');
                        return;
                    }
                    if (window.location.pathname.endsWith(href) || window.location.pathname === '/' + href) {
                        a.classList.add('active');
                    }
                });

                // click handlers to set active immediately for UX
                navLinks.forEach(a => {
                    a.addEventListener('click', () => {
                        navLinks.forEach(x => x.classList.remove('active'));
                        a.classList.add('active');
                    });
                });
            } catch (e) {
                // no-op
            }
        }

        // Tasks data for classes 1-10 (define tasksData so later code can extend it for 11-50)
        const tasksData = {
            1: [
                { id: 1, title: "HTML Basics", description: "Learn HTML structure and elements.", requirements: ["Create semantic HTML", "Use headings and lists"], dueDate: "2024-01-20", difficulty: "Beginner" },
                { id: 101, title: "HTML Forms", description: "Build forms and handle input types.", requirements: ["Create form fields", "Use labels and validation"], dueDate: "2024-01-22", difficulty: "Beginner" }
            ],
            2: [
                { id: 2, title: "CSS Fundamentals", description: "Styling with CSS selectors and layout.", requirements: ["Use Flexbox", "Apply responsive design"], dueDate: "2024-01-24", difficulty: "Beginner" },
                { id: 102, title: "Advanced CSS", description: "Learn transitions and animations.", requirements: ["Create animations", "Use transitions"], dueDate: "2024-01-26", difficulty: "Intermediate" }
            ],
            3: [
                { id: 3, title: "JavaScript Variables & Functions", description: "Practice JavaScript fundamentals.", requirements: ["Create variables", "Write functions"], dueDate: "2024-01-28", difficulty: "Beginner" },
                { id: 203, title: "DOM Manipulation Basics", description: "Learn to manipulate HTML elements using JavaScript.", requirements: ["Select DOM elements", "Change content", "Add event listeners"], dueDate: "2024-01-30", difficulty: "Intermediate" }
            ],
            4: [
                { id: 4, title: "Responsive Portfolio", description: "Build a responsive portfolio website.", requirements: ["Mobile-first design", "Use Grid or Flexbox"], dueDate: "2024-01-30", difficulty: "Intermediate" },
                { id: 104, title: "Bootstrap Framework", description: "Create a responsive website using Bootstrap.", requirements: ["Use Bootstrap components", "Customize theme"], dueDate: "2024-02-02", difficulty: "Intermediate" }
            ],
            5: [
                { id: 5, title: "Interactive To-Do App", description: "Create a to-do application.", requirements: ["DOM manipulation", "Local storage"], dueDate: "2024-02-05", difficulty: "Intermediate" },
                { id: 105, title: "JavaScript Arrays & Objects", description: "Work with arrays and objects.", requirements: ["Manipulate arrays", "Use object methods"], dueDate: "2024-02-08", difficulty: "Intermediate" }
            ],
            6: [
                { id: 106, title: "ES6+ Features", description: "Learn modern JavaScript features.", requirements: ["Arrow functions", "Destructuring"], dueDate: "2024-02-10", difficulty: "Intermediate" },
                { id: 206, title: "Async JavaScript", description: "Master promises and async/await.", requirements: ["Use promises", "Implement async/await"], dueDate: "2024-02-12", difficulty: "Advanced" }
            ],
            7: [
                { id: 107, title: "API Integration", description: "Integrate external APIs.", requirements: ["Fetch data", "Handle responses"], dueDate: "2024-02-15", difficulty: "Advanced" },
                { id: 207, title: "Weather App Project", description: "Build a weather application.", requirements: ["Use weather API", "Display current weather"], dueDate: "2024-02-18", difficulty: "Advanced" }
            ],
            8: [
                { id: 108, title: "React Introduction", description: "Get started with React.", requirements: ["Create components", "Use JSX"], dueDate: "2024-02-20", difficulty: "Advanced" },
                { id: 208, title: "React Props & State", description: "Master props and state.", requirements: ["Pass props", "Manage state"], dueDate: "2024-02-22", difficulty: "Advanced" }
            ],
            9: [
                { id: 109, title: "React Hooks", description: "Learn React hooks.", requirements: ["useState", "useEffect"], dueDate: "2024-02-25", difficulty: "Advanced" },
                { id: 209, title: "React Router", description: "Implement client-side routing.", requirements: ["Set up routes", "Handle navigation"], dueDate: "2024-02-28", difficulty: "Advanced" }
            ],
            10: [
                { id: 110, title: "Node.js Basics", description: "Intro to server-side JavaScript.", requirements: ["Set up Node", "Create server"], dueDate: "2024-03-02", difficulty: "Advanced" },
                { id: 210, title: "Express.js Framework", description: "Build apps with Express.", requirements: ["Create API routes", "Handle middleware"], dueDate: "2024-03-05", difficulty: "Advanced" }
            ]
        };

        // Initialize the application
        window.addEventListener('load', function() {
            setTimeout(() => {
                const loadingEl = document.getElementById('loadingScreen');
                if (loadingEl) loadingEl.classList.add('hidden');

                checkAuthStatus();

                // Only run page-specific initializers when their DOM exists
                if (document.getElementById('taskList')) loadDefaultTasks();
                if (document.getElementById('typewriterText')) startTypewriter();
                // If we are on the SPA tasks/dashboard area (visible) or the standalone tasks.html,
                // ensure tasks are rendered or redirect. This prevents forcing login when Home is active.
                const dashboardListEl = document.getElementById('taskList');
                const tasksListEl = document.getElementById('tasksList');

                function isVisibleInSPA(el) {
                    if (!el) return false;
                    const page = el.closest('.page');
                    if (page) return page.classList.contains('active');
                    // if not inside a .page container, assume standalone page and visible
                    return true;
                }

                const onStandaloneTasksPage = window.location.pathname.endsWith('tasks.html') || window.location.pathname.endsWith('/tasks.html');

                if ((dashboardListEl && isVisibleInSPA(dashboardListEl)) || (tasksListEl && isVisibleInSPA(tasksListEl)) || onStandaloneTasksPage) {
                    if (!currentUser) {
                        // redirect unauthenticated users to login and include next param
                        location.href = 'login.html?next=tasks.html';
                    } else {
                        renderAllTasks();
                    }
                }
            }, 3000);
        });

        // Typewriter effect
        function startTypewriter() {
            const messages = [
                "Your homework submission and task management platform",
                "Submit assignments and track your progress",
                "Manage your learning journey with ease",
                "Connect with instructors and classmates"
            ];
            
            let messageIndex = 0;
            let charIndex = 0;
            let isDeleting = false;
            const typewriterElement = document.getElementById('typewriterText');
            if (!typewriterElement) return; // nothing to do on other pages

            function type() {
                const currentMessage = messages[messageIndex];

                if (isDeleting) {
                    typewriterElement.textContent = currentMessage.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typewriterElement.textContent = currentMessage.substring(0, charIndex + 1);
                    charIndex++;
                }

                let typeSpeed = isDeleting ? 50 : 100;

                if (!isDeleting && charIndex === currentMessage.length) {
                    typeSpeed = 2000;
                    isDeleting = true;
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    messageIndex = (messageIndex + 1) % messages.length;
                    typeSpeed = 500;
                }

                setTimeout(type, typeSpeed);
            }

            type();
        }

        // Website reload function
        function reloadWebsite() {
            location.reload();
        }

        // Navigation functions
        function showPage(pageId) {
            // Try SPA behavior first (when all sections are present). If the requested
            // page section is not in the DOM (because we're on a separate HTML file),
            // navigate to the corresponding HTML file.
            const sectionId = pageId + 'Page';
            const sectionEl = document.getElementById(sectionId);

            // Protect dashboard access
            if (pageId === 'dashboard' && !currentUser) {
                // if on SPA, show login; otherwise redirect to login page
                if (document.getElementById('loginPage')) {
                    showMessage('loginMessage', 'Please login to access the student dashboard!', 'error');
                    showPage('login');
                    return;
                } else {
                    location.href = 'login.html';
                    return;
                }
            }

            if (sectionEl) {
                // SPA: show/hide sections
                const pages = document.querySelectorAll('.page');
                pages.forEach(page => page.classList.remove('active'));
                sectionEl.classList.add('active');

                // Close mobile menu when navigating
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.classList.remove('active');
                    // Update active nav link for SPA navigation
                    try { 
                        const mapping = { home: 'index.html', about: 'about.html', team: 'team.html', tasks: 'tasks.html', contact: 'contact.html', dashboard: 'dashboard.html', login: 'login.html', signup: 'signup.html' };
                        const href = mapping[pageId] || (pageId + '.html');
                        const link = document.querySelector('.nav-links a[href="' + href + '"]');
                        if (link) {
                            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                            link.classList.add('active');
                        }
                    } catch (e) {}
                return;
            }

            // Fallback: navigate to standalone HTML pages
            const mapping = {
                home: 'index.html',
                about: 'about.html',
                team: 'team.html',
                tasks: 'tasks.html',
                login: 'login.html',
                signup: 'signup.html',
                contact: 'contact.html',
                dashboard: 'dashboard.html'
            };

            const target = mapping[pageId] || (pageId + '.html');
            location.href = target;
        }

        // Render all tasks to the tasks page (support dashboard's #taskList and legacy #tasksList)
        function renderAllTasks() {
            const dashboardList = document.getElementById('taskList');
            const tasksList = document.getElementById('tasksList');
            const container = dashboardList || tasksList;
            if (!container) return;

            container.innerHTML = '';

            Object.keys(tasksData).forEach(classNum => {
                tasksData[classNum].forEach(task => {
                    const card = createTaskCard(task, classNum);
                    container.appendChild(card);
                });
            });
        }

        function toggleMobileMenu() {
                    const navLinks = document.getElementById('navLinks');
                    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                    if (!navLinks || !mobileMenuBtn) return; // nothing to toggle on this page
                    navLinks.classList.toggle('active');
                    mobileMenuBtn.classList.toggle('active');
        }

        // Helper to read query params from URL
        function getQueryParam(name) {
            const params = new URLSearchParams(window.location.search);
            return params.get(name);
        }

        // Authentication functions
        function handleLogin(event) {
            event.preventDefault();
            
            const emailOrUsername = document.getElementById('loginEmailOrUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => 
                (u.email === emailOrUsername || u.username === emailOrUsername) && 
                u.password === password
            );
            
            if (user) {
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));
                showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    updateNavigation();
                    // If there's a next param in the URL, go there after login
                    const next = getQueryParam('next');
                    if (next) {
                        const allowed = ['tasks.html', 'dashboard.html', 'index.html'];
                        if (allowed.includes(next)) {
                            location.href = next;
                            return;
                        }
                    }
                    showPage('dashboard');
                    updateWelcomeMessage();
                    updateStudentDashboardStats();
                    updateProfileDisplay();
                }, 1000);
            } else {
                showMessage('loginMessage', 'Invalid email/username or password!', 'error');
            }
        }

        function handleSignup(event) {
            event.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const phone = document.getElementById('signupPhone').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            
            // Validate passwords match
            if (password !== confirmPassword) {
                showMessage('signupMessage', 'Passwords do not match!', 'error');
                return;
            }
            
            // Validate password strength
            if (password.length < 6) {
                showMessage('signupMessage', 'Password must be at least 6 characters long!', 'error');
                return;
            }
            

            
            // Get existing users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if user already exists
            if (users.find(u => u.email === email)) {
                showMessage('signupMessage', 'User with this email already exists!', 'error');
                return;
            }
            
            // Check if username already exists
            if (users.find(u => u.username === username)) {
                showMessage('signupMessage', 'Username is already taken!', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: Date.now(),
                name,
                username,
                email,
                phone,
                password,
                profileImage: null,
                joinDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            showMessage('signupMessage', 'Account created successfully! Please login.', 'success');
            
            setTimeout(() => {
                showPage('login');
            }, 1500);
        }

        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateNavigation();
            showPage('home');
        }

        function checkAuthStatus() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateNavigation();
                updateWelcomeMessage();
                updateStudentDashboardStats();
                updateProfileDisplay();
                // If on tasks page (either id), render tasks
                if (document.getElementById('taskList') || document.getElementById('tasksList')) {
                    renderAllTasks();
                }
            }
        }

        function updateNavigation() {
            const loginLink = document.getElementById('loginLink');
            const logoutLink = document.getElementById('logoutLink');
            const dashboardLink = document.getElementById('dashboardLink');
            const tasksLink = document.getElementById('tasksLink');

            if (currentUser) {
                if (loginLink) loginLink.style.display = 'none';
                if (logoutLink) logoutLink.style.display = 'block';
                if (dashboardLink) dashboardLink.style.display = 'block';
                if (tasksLink) tasksLink.style.display = 'block';
            } else {
                if (loginLink) loginLink.style.display = 'block';
                if (logoutLink) logoutLink.style.display = 'none';
                if (dashboardLink) dashboardLink.style.display = 'none';
                if (tasksLink) tasksLink.style.display = 'none';
            }
        }

        function updateWelcomeMessage() {
            if (currentUser) {
                const welcomeEl = document.getElementById('welcomeMessage');
                if (welcomeEl) {
                    welcomeEl.textContent = `Welcome back, ${currentUser.name}!`;
                }
            }
        }

        function updateProfileDisplay() {
            if (!currentUser) return;
            const profileImage = document.getElementById('userProfileImage');
            const defaultAvatar = document.getElementById('defaultAvatar');

            if (currentUser.profileImage) {
                if (profileImage) {
                    profileImage.src = currentUser.profileImage;
                    profileImage.style.display = 'block';
                }
                if (defaultAvatar) defaultAvatar.style.display = 'none';
            } else {
                if (profileImage) profileImage.style.display = 'none';
                if (defaultAvatar) defaultAvatar.style.display = 'flex';
            }
        }

        // Profile management functions
        function changeProfileImage() {
            if (!currentUser) return;
            const input = document.getElementById('profileImageInput');
            if (input) input.click();
        }

        function handleProfileImageChange(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                currentUser.profileImage = e.target.result;
                
                // Update user in localStorage
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
                
                updateProfileDisplay();
            };
            reader.readAsDataURL(file);
        }

        function showEditProfile() {
            if (!currentUser) return;
            const modalTitle = document.getElementById('modalTaskTitle');
            const modalContent = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitle || !modalContent || !taskModalEl) return;

            modalTitle.textContent = '✏️ Edit Profile';
            modalContent.innerHTML = `
                <div style="color: white;">
                    <form onsubmit="handleProfileUpdate(event)">
                        <div style="text-align: center; margin-bottom: 2rem;">
                            <div style="position: relative; display: inline-block;">
                                ${currentUser.profileImage ? 
                                    `<img src="${currentUser.profileImage}" class="profile-image" style="width: 120px; height: 120px;" onclick="changeProfileImage()">` :
                                    `<div style="width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: white; cursor: pointer; margin: 0 auto;" onclick="changeProfileImage()">👤</div>`
                                }
                                <div style="position: absolute; bottom: 0; right: 0; background: #667eea; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white;" onclick="changeProfileImage()">
                                    <i class="fas fa-camera" style="font-size: 0.8rem;"></i>
                                </div>
                            </div>
                            <p style="margin-top: 1rem; opacity: 0.8; font-size: 0.9rem;">Click to change profile picture</p>
                        </div>
                        
                        <div class="form-group">
                            <label for="editName">Full Name</label>
                            <input type="text" id="editName" value="${currentUser.name}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editEmail">Email</label>
                            <input type="email" id="editEmail" value="${currentUser.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editPassword">New Password (leave blank to keep current)</label>
                            <input type="password" id="editPassword" placeholder="Enter new password">
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button type="submit" class="btn btn-primary" style="flex: 1;">Save Changes</button>
                            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            
            taskModalEl.classList.add('active');
        }

        function handleProfileUpdate(event) {
            event.preventDefault();
            
            const newName = document.getElementById('editName').value;
            const newEmail = document.getElementById('editEmail').value;
            const newPassword = document.getElementById('editPassword').value;
            
            // Check if email is already taken by another user
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const emailExists = users.find(u => u.email === newEmail && u.id !== currentUser.id);
            
            if (emailExists) {
                alert('This email is already taken by another user!');
                return;
            }
            
            // Update current user
            currentUser.name = newName;
            currentUser.email = newEmail;
            if (newPassword) {
                currentUser.password = newPassword;
            }
            
            // Update in localStorage
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            updateWelcomeMessage();
            closeModal();
            
            // Show success message
            setTimeout(() => {
                alert('Profile updated successfully!');
            }, 300);
        }

        // Task functions
        function loadDefaultTasks() {
            const taskList = document.getElementById('taskList');
            if (!taskList) return;
            taskList.innerHTML = '';
            
            // Show tasks from classes 1-10 by default
            for (let classNum = 1; classNum <= 10; classNum++) {
                if (tasksData[classNum]) {
                    tasksData[classNum].forEach(task => {
                        taskList.appendChild(createTaskCard(task, classNum));
                    });
                }
            }
        }

        function searchTasks(event) {
            event.preventDefault();
            
            const classSearchEl = document.getElementById('classSearch');
            const classNumber = classSearchEl ? classSearchEl.value : null;
            const taskList = document.getElementById('taskList');
            if (!taskList) return;
            
            if (!classNumber) {
                loadDefaultTasks();
                return;
            }
            
            taskList.innerHTML = '';
            
            if (tasksData[classNumber]) {
                tasksData[classNumber].forEach(task => {
                    taskList.appendChild(createTaskCard(task, classNumber));
                });
            } else {
                taskList.innerHTML = `
                    <div class="task-card">
                        <h3>No tasks found for Class ${classNumber}</h3>
                        <p>Tasks for this class haven't been assigned yet. Check back later!</p>
                    </div>
                `;
            }
        }

        function createTaskCard(task, classNumber) {
            const card = document.createElement('div');
            card.className = 'task-card';
            
            card.innerHTML = `
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="task-class">Class ${classNumber}</span>
                </div>
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">${task.description}</p>
                
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                    <h4 style="color: #667eea; margin-bottom: 0.5rem;">📋 What You Need to Do:</h4>
                    <ul style="padding-left: 1.5rem; line-height: 1.6;">
                        ${task.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; font-size: 0.9rem;">
                    <div><strong>📅 Due:</strong> ${task.dueDate}</div>
                    <div><strong>⭐ Level:</strong> ${task.difficulty}</div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-primary" onclick="submitTask(${task.id}, ${classNumber})" style="flex: 1;">
                        📤 Submit Your Work
                    </button>
                    <button class="btn btn-secondary" onclick="viewTaskDetails(${task.id}, ${classNumber})">
                        👁️ Full Details
                    </button>
                </div>
            `;
            
            return card;
        }

        function viewTaskDetails(taskId, classNumber) {
            const task = tasksData[classNumber] && tasksData[classNumber].find(t => t.id === taskId);
            if (!task) return;
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = `📚 ${task.title} - Class ${classNumber}`;
            modalContentEl.innerHTML = `
                <div style="color: white; line-height: 1.6;">
                    <div style="background: rgba(102, 126, 234, 0.2); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem; border-left: 4px solid #667eea;">
                        <h4 style="margin-bottom: 1rem; color: #667eea;">📝 Task Description:</h4>
                        <p style="font-size: 1.1rem;">${task.description}</p>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="margin-bottom: 1rem; color: #f093fb;">✅ Step-by-Step Requirements:</h4>
                        <ol style="padding-left: 1.5rem; font-size: 1rem;">
                            ${task.requirements.map(req => `<li style="margin-bottom: 0.5rem;">${req}</li>`).join('')}
                        </ol>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="background: rgba(245, 87, 108, 0.2); padding: 1rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📅</div>
                            <strong>Due Date</strong><br>
                            ${task.dueDate}
                        </div>
                        <div style="background: rgba(79, 172, 254, 0.2); padding: 1rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⭐</div>
                            <strong>Difficulty</strong><br>
                            ${task.difficulty}
                        </div>
                        <div style="background: rgba(0, 242, 254, 0.2); padding: 1rem; border-radius: 10px; text-align: center;">
                            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎯</div>
                            <strong>Class</strong><br>
                            Class ${classNumber}
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="closeModal(); submitTask(${task.id}, ${classNumber})" style="padding: 1rem 2rem; font-size: 1.1rem;">
                            📤 Ready to Submit Your Work
                        </button>
                    </div>
                </div>
            `;
            
            taskModalEl.classList.add('active');
        }

        function submitTask(taskId, classNumber) {
            if (!currentUser) {
                alert('Please login to submit tasks!');
                showPage('login');
                return;
            }
            
            const task = tasksData[classNumber].find(t => t.id === taskId);
            if (!task) return;
            
            // Create file upload interface
            const uploadHTML = `
                <div class="file-upload">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <h3 style="color: white; margin-bottom: 0.5rem;">📤 Submit Your Work</h3>
                        <p style="color: rgba(255,255,255,0.8); font-size: 1.1rem;">${task.title}</p>
                    </div>
                    
                    <form onsubmit="handleTaskSubmission(event, ${taskId}, ${classNumber})">
                        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem;">
                            <h4 style="color: #667eea; margin-bottom: 1rem;">👤 Student Information</h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                <div class="form-group">
                                    <label for="studentName">Name</label>
                                    <input type="text" id="studentName" value="${currentUser.name}" readonly>
                                </div>

                                <div class="form-group">
                                    <label for="studentEmail">Email</label>
                                    <input type="email" id="studentEmail" value="${currentUser.email}" readonly>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem;">
                            <h4 style="color: #f093fb; margin-bottom: 1rem;">📁 Upload Your Completed Work</h4>
                            <div class="form-group">
                                <label for="taskFile" style="font-size: 1rem; margin-bottom: 1rem; display: block;">
                                    Choose your file (HTML, CSS, JS, ZIP, PDF, Images, etc.)
                                </label>
                                <div class="upload-area" onclick="document.getElementById('taskFile').click()">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; margin-bottom: 1rem; color: #667eea;"></i>
                                    <p style="font-size: 1.1rem; font-weight: 600;">Click here to select your file</p>
                                    <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem;">or drag and drop your file here</p>
                                    <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 1rem;">✅ All file types accepted • No size limit</p>
                                </div>
                                <input type="file" id="taskFile" style="display: none;" required>
                            </div>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem;">
                            <div class="form-group">
                                <label for="taskNotes" style="color: #4facfe; font-weight: 600;">💬 Additional Comments (Optional)</label>
                                <textarea id="taskNotes" placeholder="Tell us about your work, any challenges you faced, or special features you added..." style="width: 100%; padding: 1rem; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 10px; background: rgba(255, 255, 255, 0.1); color: white; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; font-weight: 600;">
                            🚀 Submit My Work
                        </button>
                    </form>
                </div>
            `;
            
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = 'Submit Task';
            modalContentEl.innerHTML = uploadHTML;
            taskModalEl.classList.add('active');
            
            // Add drag and drop functionality
            setupDragAndDrop();
        }

        function setupDragAndDrop() {
            const uploadArea = document.querySelector('.upload-area');
            const fileInput = document.getElementById('taskFile');
            if (!uploadArea || !fileInput) return;

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    updateUploadArea(files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    updateUploadArea(e.target.files[0]);
                }
            });
        }

        function updateUploadArea(file) {
            const uploadArea = document.querySelector('.upload-area');
            if (!uploadArea) return;
            uploadArea.innerHTML = `
                <i class="fas fa-file-check" style="font-size: 3rem; margin-bottom: 1rem; color: #22c55e;"></i>
                <p><strong>File Selected:</strong> ${file.name}</p>
                <p style="font-size: 0.9rem; opacity: 0.7;">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p style="font-size: 0.8rem; margin-top: 0.5rem;">Click to change file</p>
            `;
        }

        function handleTaskSubmission(event, taskId, classNumber) {
            event.preventDefault();
            
            const fileInput = document.getElementById('taskFile');
            const notesEl = document.getElementById('taskNotes');
            const notes = notesEl ? notesEl.value : '';
            
            if (!fileInput.files[0]) {
                alert('Please select a file to submit!');
                return;
            }
            
            const file = fileInput.files[0];
            const submission = {
                id: Date.now(),
                taskId,
                classNumber,
                studentName: currentUser.name,
                studentEmail: currentUser.email,
                fileName: file.name,
                fileSize: file.size,
                notes,
                submissionDate: new Date().toISOString()
            };
            
            // Save submission to localStorage
            const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
            submissions.push(submission);
            localStorage.setItem('taskSubmissions', JSON.stringify(submissions));
            
            // Show success message
            const modalContent = document.getElementById('modalTaskContent');
            if (modalContent) {
                modalContent.innerHTML = `
                <div style="text-align: center; color: white;">
                    <i class="fas fa-check-circle" style="font-size: 4rem; color: #22c55e; margin-bottom: 1rem;"></i>
                    <h3>Task Submitted Successfully!</h3>
                    <p style="margin: 1rem 0;">Your task has been submitted and will be reviewed by the instructor.</p>
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 10px; margin: 1rem 0;">
                        <strong>Submission Details:</strong><br>
                        File: ${file.name}<br>
                        Size: ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
                        Submitted: ${new Date().toLocaleString()}
                    </div>
                    <button class="btn btn-primary" onclick="closeModal(); updateStudentDashboardStats();">Close</button>
                </div>
            `;
            }
        }

        function closeModal() {
            const taskModalEl = document.getElementById('taskModal');
            if (taskModalEl) taskModalEl.classList.remove('active');
        }

        // Contact form handler
        function handleContactForm(event) {
            event.preventDefault();
            
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessageText').value;
            
            // Save contact message
            const contacts = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            contacts.push({
                id: Date.now(),
                name,
                email,
                subject,
                message,
                date: new Date().toISOString()
            });
            localStorage.setItem('contactMessages', JSON.stringify(contacts));
            
            showMessage('contactMessage', 'Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            event.target.reset();
        }

        // Utility functions
        function showMessage(elementId, message, type) {
            const element = document.getElementById(elementId);
            if (!element) return;
            element.innerHTML = `<div class="message ${type}">${message}</div>`;
            
            setTimeout(() => {
                if (element) element.innerHTML = '';
            }, 5000);
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('taskModal');
            if (e.target === modal) {
                closeModal();
            }
        });

        // Team member data
        const teamMembers = {
            1: {
                name: "Ahmed Rahman",
                role: "Lead Instructor",
                specialty: "Full-Stack Development",
                bio: "Ahmed has over 8 years of experience in web development and has worked with companies like Google and Microsoft. He leads the Web Dev Academy platform development and curriculum design.",
                skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB", "AWS", "Docker", "GraphQL"],
                experience: "8+ years",
                education: "MS Computer Science, BUET",
                social: {
                    github: "https://github.com/ahmed-rahman",
                    linkedin: "https://linkedin.com/in/ahmed-rahman",
                    twitter: "https://twitter.com/ahmed_dev",
                    email: "ahmed@webdevacademy.com"
                },
                achievements: [
                    "Former Senior Developer at Google",
                    "Published author of 'Modern Web Development'",
                    "Speaker at 15+ tech conferences",
                    "Mentored 200+ developers",
                    "Created 10+ open source projects"
                ]
            },
            2: {
                name: "Fatima Khan",
                role: "Frontend Specialist",
                specialty: "React & UI/UX Design",
                bio: "Fatima is a creative frontend developer with a keen eye for design. She specializes in creating beautiful, user-friendly interfaces and has a passion for modern web technologies.",
                skills: ["React", "Vue.js", "CSS3", "Figma", "Adobe XD", "TypeScript", "Tailwind CSS", "Framer Motion"],
                experience: "5+ years",
                education: "BS Software Engineering, NSU",
                social: {
                    github: "https://github.com/fatima-khan",
                    linkedin: "https://linkedin.com/in/fatima-khan",
                    dribbble: "https://dribbble.com/fatima_designs",
                    email: "fatima@webdevacademy.com"
                },
                achievements: [
                    "UI/UX Designer at top fintech startup",
                    "Winner of 3 international design competitions",
                    "Created 50+ successful web applications",
                    "Expert in responsive and accessible design",
                    "Featured designer on Dribbble"
                ]
            },
            3: {
                name: "Rafiq Hassan",
                role: "Backend Developer",
                specialty: "Node.js & Database Expert",
                bio: "Rafiq is a backend specialist with extensive experience in server-side development, database optimization, and API design. He ensures our platform runs smoothly and efficiently.",
                skills: ["Node.js", "Express.js", "MongoDB", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Microservices"],
                experience: "6+ years",
                education: "MS Software Engineering, BUET",
                social: {
                    github: "https://github.com/rafiq-hassan",
                    linkedin: "https://linkedin.com/in/rafiq-hassan",
                    stackoverflow: "https://stackoverflow.com/users/rafiq",
                    email: "rafiq@webdevacademy.com"
                },
                achievements: [
                    "Senior Backend Engineer at major e-commerce platform",
                    "Optimized systems handling 1M+ daily users",
                    "Expert in database performance tuning",
                    "Contributor to several open source projects",
                    "Top 1% contributor on Stack Overflow"
                ]
            },
            4: {
                name: "Nadia Islam",
                role: "UI/UX Designer",
                specialty: "Creative Design & User Experience",
                bio: "Nadia brings creativity and user-centered design thinking to our platform. She focuses on creating intuitive and engaging user experiences that make learning enjoyable.",
                skills: ["Figma", "Adobe Creative Suite", "Sketch", "Principle", "InVision", "User Research", "Prototyping", "Design Systems"],
                experience: "4+ years",
                education: "BFA Graphic Design, University of Dhaka",
                social: {
                    behance: "https://behance.net/nadia-islam",
                    linkedin: "https://linkedin.com/in/nadia-islam",
                    dribbble: "https://dribbble.com/nadia_ui",
                    email: "nadia@webdevacademy.com"
                },
                achievements: [
                    "Lead Designer at award-winning design agency",
                    "Designed interfaces for 100+ mobile apps",
                    "Winner of UX Design Excellence Award 2023",
                    "Speaker at Design Conference Bangladesh",
                    "Featured in top design publications"
                ]
            },
            5: {
                name: "Karim Ahmed",
                role: "DevOps Engineer",
                specialty: "Cloud & Infrastructure",
                bio: "Karim manages our cloud infrastructure and deployment pipelines. He ensures our platform is scalable, secure, and always available for our students worldwide.",
                skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Monitoring", "Security", "CI/CD"],
                experience: "7+ years",
                education: "BS Computer Engineering, BUET",
                social: {
                    github: "https://github.com/karim-ahmed",
                    linkedin: "https://linkedin.com/in/karim-ahmed",
                    medium: "https://medium.com/@karim_devops",
                    email: "karim@webdevacademy.com"
                },
                achievements: [
                    "DevOps Lead at multinational tech company",
                    "Managed infrastructure for 10M+ users",
                    "AWS Certified Solutions Architect",
                    "Reduced deployment time by 80%",
                    "Published 20+ technical articles"
                ]
            },
            6: {
                name: "Sadia Rahman",
                role: "Mobile Developer",
                specialty: "React Native & Flutter",
                bio: "Sadia specializes in mobile app development and cross-platform solutions. She helps students learn mobile development and creates our mobile learning apps.",
                skills: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "App Store Optimization", "Mobile UI/UX", "Performance Optimization"],
                experience: "5+ years",
                education: "BS Computer Science, CMPI",
                social: {
                    github: "https://github.com/sadia-rahman",
                    linkedin: "https://linkedin.com/in/sadia-rahman",
                    playstore: "https://play.google.com/store/apps/developer?id=Sadia+Rahman",
                    email: "sadia@webdevacademy.com"
                },
                achievements: [
                    "Senior Mobile Developer at leading fintech",
                    "Published 15+ apps with 1M+ downloads",
                    "Google Play Featured Developer",
                    "Expert in cross-platform development",
                    "Mobile development workshop instructor"
                ]
            }
        };

        // Show team member details
        function showTeamMember(memberId) {
            const member = teamMembers[memberId];
            if (!member) return;
            
            const gradientColors = {
                1: ['#667eea', '#764ba2'],
                2: ['#f093fb', '#f5576c'],
                3: ['#4facfe', '#00f2fe'],
                4: ['#f5576c', '#f093fb'],
                5: ['#764ba2', '#667eea'],
                6: ['#00f2fe', '#4facfe']
            };
            
            const colors = gradientColors[memberId] || ['#667eea', '#764ba2'];
            
            // Get social media links
            const socialLinks = [];
            if (member.social.github) socialLinks.push(`<a href="${member.social.github}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-github"></i></a>`);
            if (member.social.linkedin) socialLinks.push(`<a href="${member.social.linkedin}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-linkedin"></i></a>`);
            if (member.social.twitter) socialLinks.push(`<a href="${member.social.twitter}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-twitter"></i></a>`);
            if (member.social.dribbble) socialLinks.push(`<a href="${member.social.dribbble}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-dribbble"></i></a>`);
            if (member.social.behance) socialLinks.push(`<a href="${member.social.behance}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-behance"></i></a>`);
            if (member.social.stackoverflow) socialLinks.push(`<a href="${member.social.stackoverflow}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-stack-overflow"></i></a>`);
            if (member.social.medium) socialLinks.push(`<a href="${member.social.medium}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-medium"></i></a>`);
            if (member.social.playstore) socialLinks.push(`<a href="${member.social.playstore}" target="_blank" rel="noopener noreferrer" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-google-play"></i></a>`);
            if (member.social.email) socialLinks.push(`<a href="mailto:${member.social.email}" style="color: ${colors[0]}; font-size: 1.5rem; margin: 0 0.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><i class="fas fa-envelope"></i></a>`);
            
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = `👨‍💻 ${member.name}`;
            modalContentEl.innerHTML = `
                <div style="color: white; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <div style="width: 150px; height: 150px; margin: 0 auto 1rem; position: relative;">
                            <img src="https://images.unsplash.com/photo-${memberId === 1 ? '1507003211169-0a1dd7228f2d' : memberId === 2 ? '1494790108755-2616b612b786' : memberId === 3 ? '1472099645785-5658abf4ff4e' : memberId === 4 ? '1438761681033-6461ffad8d80' : memberId === 5 ? '1500648767791-00dcc994a43e' : '1534528741775-53994a69daeb'}?w=150&h=150&fit=crop&crop=face&auto=format" 
                                alt="${member.name}" 
                                style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid ${colors[0]}; box-shadow: 0 8px 25px rgba(${colors[0] === '#667eea' ? '102, 126, 234' : colors[0] === '#f093fb' ? '240, 147, 251' : colors[0] === '#4facfe' ? '79, 172, 254' : colors[0] === '#f5576c' ? '245, 87, 108' : colors[0] === '#764ba2' ? '118, 75, 162' : '0, 242, 254'}, 0.4);"
                                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%); display: none; align-items: center; justify-content: center; font-size: 4rem; color: white; box-shadow: 0 8px 25px rgba(${colors[0] === '#667eea' ? '102, 126, 234' : colors[0] === '#f093fb' ? '240, 147, 251' : colors[0] === '#4facfe' ? '79, 172, 254' : colors[0] === '#f5576c' ? '245, 87, 108' : colors[0] === '#764ba2' ? '118, 75, 162' : '0, 242, 254'}, 0.4);">
                                ${memberId <= 2 ? '👨‍💻' : memberId === 3 ? '👨‍💼' : memberId === 4 ? '👩‍🎨' : memberId === 5 ? '👨‍🔬' : '👩‍💻'}
                            </div>
                        </div>
                        <h2 style="margin-bottom: 0.5rem;">${member.name}</h2>
                        <p style="color: ${colors[0]}; font-size: 1.2rem; font-weight: 600;">${member.role}</p>
                        <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">${member.specialty}</p>
                        
                        <!-- Social Media Links -->
                        <div style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            ${socialLinks.join('')}
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="color: #f093fb; margin-bottom: 1rem;">📖 About ${member.name.split(' ')[0]}</h4>
                        <p style="font-size: 1rem; line-height: 1.7;">${member.bio}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="background: rgba(102, 126, 234, 0.2); padding: 1.5rem; border-radius: 15px;">
                            <h4 style="color: #667eea; margin-bottom: 1rem;">🛠️ Technical Skills</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${member.skills.map(skill => `<span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">${skill}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div style="background: rgba(240, 147, 251, 0.2); padding: 1.5rem; border-radius: 15px;">
                            <h4 style="color: #f093fb; margin-bottom: 1rem;">📊 Experience & Education</h4>
                            <p style="margin-bottom: 0.5rem;"><strong>Experience:</strong> ${member.experience}</p>
                            <p><strong>Education:</strong> ${member.education}</p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(79, 172, 254, 0.2); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="color: #4facfe; margin-bottom: 1rem;">🏆 Key Achievements</h4>
                        <ul style="padding-left: 1.5rem;">
                            ${member.achievements.map(achievement => `<li style="margin-bottom: 0.5rem;">${achievement}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="closeModal()">Close Profile</button>
                    </div>
                </div>
            `;
            
            taskModalEl.classList.add('active');
        }

        // Scroll to top functionality
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Show/hide scroll to top button
        window.addEventListener('scroll', () => {
            const scrollButton = document.getElementById('scrollToTop');
            if (window.pageYOffset > 300) {
                scrollButton.classList.add('visible');
            } else {
                scrollButton.classList.remove('visible');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navLinks = document.getElementById('navLinks');
            const mobileMenu = document.getElementById('mobileMenuBtn') || document.querySelector('.mobile-menu');
            if (!navLinks || !mobileMenu) return; // nothing to do if elements missing

            if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
                navLinks.classList.remove('active');
                if (mobileMenu.classList) mobileMenu.classList.remove('active');
            }
        });

        // Student Dashboard functions
        function updateStudentDashboardStats() {
            if (!currentUser) return;
            
            const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
            const mySubmissions = submissions.filter(sub => sub.studentEmail === currentUser.email);
            
            let totalTasks = 0;
            Object.keys(tasksData).forEach(classNum => {
                totalTasks += tasksData[classNum].length;
            });
            
            const completedTasks = mySubmissions.length;
            const pendingTasks = totalTasks - completedTasks;
            
            document.getElementById('mySubmissions').textContent = mySubmissions.length;
            document.getElementById('completedTasks').textContent = completedTasks;
            document.getElementById('pendingTasks').textContent = pendingTasks;
            document.getElementById('totalAvailableTasks').textContent = totalTasks;
        }

        function showMySubmissions() {
            if (!currentUser) return;
            
            const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
            const mySubmissions = submissions.filter(sub => sub.studentEmail === currentUser.email);
            
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = '📄 My Submissions';
            modalContentEl.innerHTML = `
                <div style="color: white;">
                    ${mySubmissions.length === 0 ? 
                        '<p style="text-align: center; opacity: 0.7; padding: 2rem;">You haven\'t submitted any tasks yet. Start working on your assignments!</p>' :
                        mySubmissions.map(sub => `
                            <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                    <h4>Task ID: ${sub.taskId} (Class ${sub.classNumber})</h4>
                                    <span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.8rem;">✅ Submitted</span>
                                </div>
                                <p><strong>📁 File:</strong> ${sub.fileName} (${(sub.fileSize / 1024 / 1024).toFixed(2)} MB)</p>
                                <p><strong>📅 Submitted:</strong> ${new Date(sub.submissionDate).toLocaleString()}</p>
                                ${sub.notes ? `<p><strong>💬 Notes:</strong> ${sub.notes}</p>` : ''}
                            </div>
                        `).join('')
                    }
                    <button class="btn btn-primary" onclick="closeModal()" style="width: 100%; margin-top: 1rem;">Close</button>
                </div>
            `;
            taskModalEl.classList.add('active');
        }

        function showMyProgress() {
            if (!currentUser) return;
            
            const submissions = JSON.parse(localStorage.getItem('taskSubmissions') || '[]');
            const mySubmissions = submissions.filter(sub => sub.studentEmail === currentUser.email);
            
            let totalTasks = 0;
            Object.keys(tasksData).forEach(classNum => {
                totalTasks += tasksData[classNum].length;
            });
            
            const completedTasks = mySubmissions.length;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = '📊 My Learning Progress';
            modalContentEl.innerHTML = `
                <div style="color: white; text-align: center;">
                    <div style="background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
                        <div style="width: 150px; height: 150px; margin: 0 auto 1rem; position: relative;">
                            <svg width="150" height="150" style="transform: rotate(-90deg);">
                                <circle cx="75" cy="75" r="60" stroke="rgba(255,255,255,0.2)" stroke-width="8" fill="none"/>
                                <circle cx="75" cy="75" r="60" stroke="#667eea" stroke-width="8" fill="none" 
                                        stroke-dasharray="${2 * Math.PI * 60}" 
                                        stroke-dashoffset="${2 * Math.PI * 60 * (1 - progressPercentage / 100)}"
                                        style="transition: stroke-dashoffset 1s ease;"/>
                            </svg>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2rem; font-weight: bold;">
                                ${progressPercentage}%
                            </div>
                        </div>
                        <h3 style="margin-bottom: 0.5rem;">Overall Progress</h3>
                        <p style="opacity: 0.8;">Keep up the great work!</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div style="background: rgba(34, 197, 94, 0.2); padding: 1.5rem; border-radius: 10px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                            <h4>${completedTasks}</h4>
                            <p>Tasks Completed</p>
                        </div>
                        <div style="background: rgba(245, 87, 108, 0.2); padding: 1.5rem; border-radius: 10px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
                            <h4>${totalTasks - completedTasks}</h4>
                            <p>Tasks Remaining</p>
                        </div>
                        <div style="background: rgba(79, 172, 254, 0.2); padding: 1.5rem; border-radius: 10px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📚</div>
                            <h4>${totalTasks}</h4>
                            <p>Total Tasks</p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="color: #f093fb; margin-bottom: 1rem;">🎯 Next Steps</h4>
                        <p style="text-align: left; line-height: 1.6;">
                            ${completedTasks === 0 ? 
                                "Start by completing your first task! Browse the available tasks and pick one that interests you." :
                                completedTasks < totalTasks ? 
                                    `Great progress! You've completed ${completedTasks} out of ${totalTasks} tasks. Keep going to master web development!` :
                                    "🎉 Congratulations! You've completed all available tasks. You're now ready for advanced projects!"
                            }
                        </p>
                    </div>
                    
                    <button class="btn btn-primary" onclick="closeModal()" style="width: 100%;">Close</button>
                </div>
            `;
            taskModalEl.classList.add('active');
        }

        // Password toggle function
        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }

        // Terms and Conditions function
        function showTermsAndConditions() {
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = '📋 Terms and Conditions';
            modalContentEl.innerHTML = `
                <div style="color: white; line-height: 1.6; max-height: 400px; overflow-y: auto;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">1. Acceptance of Terms</h4>
                    <p style="margin-bottom: 1rem;">By accessing and using Web Dev Academy, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">2. Use License</h4>
                    <p style="margin-bottom: 1rem;">Permission is granted to temporarily use Web Dev Academy for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">3. User Account</h4>
                    <p style="margin-bottom: 1rem;">You are responsible for safeguarding the password and for maintaining the confidentiality of your account.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">4. Prohibited Uses</h4>
                    <p style="margin-bottom: 1rem;">You may not use our platform for any unlawful purpose or to solicit others to perform unlawful acts.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">5. Content Liability</h4>
                    <p style="margin-bottom: 1rem;">We shall not be held responsible for any content that appears on your website or platform.</p>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="closeModal()">I Understand</button>
                    </div>
                </div>
            `;
            taskModalEl.classList.add('active');
        }

        // Privacy Policy function
        function showPrivacyPolicy() {
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = '🔒 Privacy Policy';
            modalContentEl.innerHTML = `
                <div style="color: white; line-height: 1.6; max-height: 400px; overflow-y: auto;">
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Information We Collect</h4>
                    <p style="margin-bottom: 1rem;">We collect information you provide directly to us, such as when you create an account, submit assignments, or contact us.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">How We Use Your Information</h4>
                    <p style="margin-bottom: 1rem;">We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Information Sharing</h4>
                    <p style="margin-bottom: 1rem;">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Data Security</h4>
                    <p style="margin-bottom: 1rem;">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    
                    <h4 style="color: #667eea; margin-bottom: 1rem;">Contact Us</h4>
                    <p style="margin-bottom: 1rem;">If you have any questions about this Privacy Policy, please contact us at privacy@webdevacademy.com</p>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button class="btn btn-primary" onclick="closeModal()">I Understand</button>
                    </div>
                </div>
            `;
            taskModalEl.classList.add('active');
        }

        // Developer Profile function
        function showDeveloperProfile() {
            const modalTitleEl = document.getElementById('modalTaskTitle');
            const modalContentEl = document.getElementById('modalTaskContent');
            const taskModalEl = document.getElementById('taskModal');
            if (!modalTitleEl || !modalContentEl || !taskModalEl) return;

            modalTitleEl.textContent = '👨‍💻 Developer Profile - Salah Uddin Kader';
            modalContentEl.innerHTML = `
                <div style="color: white; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <img src="Images/Profile-Images.png" 
                            alt="Salah Uddin Kader" 
                            style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #667eea; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); margin: 0 auto 1rem;"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="width: 150px; height: 150px; margin: 0 auto 1rem; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: none; align-items: center; justify-content: center; font-size: 4rem; color: white; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);">
                            👨‍💻
                        </div>
                        <h2 style="margin-bottom: 0.5rem;">Salah Uddin Kader</h2>
                        <p style="color: #667eea; font-size: 1.2rem; font-weight: 600;">Full-Stack Developer & UI/UX Designer</p>
                        <p style="color: rgba(255,255,255,0.8); margin-bottom: 1rem;">Passionate about creating innovative web solutions</p>
                        
                        <!-- Social Media Links -->
                        <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                            <a href="https://github.com/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="https://linkedin.com/in/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="https://twitter.com/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="https://facebook.com/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-facebook"></i>
                            </a>
                            <a href="https://instagram.com/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-instagram"></i>
                            </a>
                            
                            <a href="https://wa.me/8801851075537" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-whatsapp"></i>
                            </a>
                            <a href="https://behance.net/salahuddingfx" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-behance"></i>
                            </a>
                            <a href="https://salahuddingfx.blogspot.com" target="_blank" rel="noopener noreferrer" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fab fa-blogger"></i>
                            </a>
                            <a href="mailto:salauddinkaderappy@gmail.com" style="color: #667eea; font-size: 1.5rem; transition: all 0.3s ease; text-decoration: none;" onmouseover="this.style.transform='scale(1.3)'; this.style.color='#764ba2'" onmouseout="this.style.transform='scale(1)'; this.style.color='#667eea'">
                                <i class="fas fa-envelope"></i>
                            </a>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="color: #f093fb; margin-bottom: 1rem;">📖 About Salah Uddin Kader</h4>
                        <p style="font-size: 1rem; line-height: 1.7;">
                            Salah Uddin Kader is a passionate Full-Stack Developer and UI/UX Designer with over 2 years of experience in creating innovative web solutions and educational platforms. He specializes in modern web technologies and has a keen eye for creating user-friendly, accessible, and beautiful digital experiences.
                        </p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div style="background: rgba(102, 126, 234, 0.2); padding: 1.5rem; border-radius: 15px;">
                            <h4 style="color: #667eea; margin-bottom: 1rem;">🛠️ Technical Skills</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">HTML</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">CSS</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">JavaScript</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">TypeScript</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">Adobe Photoshop</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">Figma</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">Adobe XD</span>
                                <span style="background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;">Adobe Illustrator</span>
                            </div>
                        </div>
                        
                        <div style="background: rgba(240, 147, 251, 0.2); padding: 1.5rem; border-radius: 15px;">
                            <h4 style="color: #f093fb; margin-bottom: 1rem;">📊 Experience & Education</h4>
                            <p style="margin-bottom: 0.5rem;"><strong>Experience:</strong> 2+ years</p>
                            <p style="margin-bottom: 0.5rem;"><strong>Education:</strong> Diploma in Civil Technology</p>
                            <p><strong>Specialization:</strong> Full-Stack Development & UI/UX Design</p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(79, 172, 254, 0.2); padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                        <h4 style="color: #4facfe; margin-bottom: 1rem;">🏆 Key Achievements</h4>
                        <ul style="padding-left: 1.5rem;">
                            <li style="margin-bottom: 0.5rem;">Created 50+ successful web applications and platforms</li>
                            <li style="margin-bottom: 0.5rem;">Expert in modern web development frameworks and tools</li>
                            <li style="margin-bottom: 0.5rem;">Specialized in creating educational and e-learning platforms</li>
                            <li style="margin-bottom: 0.5rem;">Strong focus on user experience and accessibility</li>
                            <li style="margin-bottom: 0.5rem;">Passionate about mentoring and teaching web development</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center;">
                        <button class="btn btn-primary" onclick="closeModal()">Close Profile</button>
                    </div>
                </div>
            `;
            taskModalEl.classList.add('active');
        }

        // Add comprehensive tasks for all classes
        window.addEventListener('load', () => {
            // Add tasks for classes 11-50
            const advancedTopics = [
                "MongoDB Database", "RESTful APIs", "Authentication & JWT", "File Upload System", "Real-time Chat App",
                "E-commerce Platform", "Blog Management", "User Dashboard", "Payment Integration", "Email System",
                "Image Gallery", "Social Media App", "Task Management", "Calendar App", "Video Streaming",
                "Music Player", "Game Development", "Data Visualization", "Machine Learning", "AI Chatbot",
                "Blockchain Basics", "Cryptocurrency", "NFT Marketplace", "Cloud Deployment", "Docker Containers",
                "Microservices", "GraphQL API", "Progressive Web App", "Mobile App", "Desktop App",
                "Chrome Extension", "VS Code Extension", "Automation Scripts", "Testing Framework", "CI/CD Pipeline",
                "Performance Optimization", "Security Implementation", "Accessibility Features", "SEO Optimization", "Analytics Integration"
            ];

            const projectTypes = [
                "Build a complete", "Create an advanced", "Develop a modern", "Design and implement", "Build a scalable",
                "Create a responsive", "Develop a full-stack", "Build an interactive", "Create a dynamic", "Develop a professional"
            ];

            const requirements = [
                ["Use modern JavaScript ES6+", "Implement responsive design", "Add proper error handling"],
                ["Follow MVC architecture", "Use database integration", "Implement user authentication"],
                ["Add real-time features", "Use modern frameworks", "Implement API integration"],
                ["Follow best practices", "Add comprehensive testing", "Use version control"],
                ["Implement security measures", "Add performance optimization", "Use cloud deployment"],
                ["Add mobile responsiveness", "Implement PWA features", "Use modern build tools"],
                ["Follow accessibility guidelines", "Add SEO optimization", "Implement analytics"],
                ["Use TypeScript", "Add comprehensive documentation", "Implement CI/CD pipeline"]
            ];

            for (let i = 11; i <= 90; i++) {
                const topicIndex = (i - 11) % advancedTopics.length;
                const projectTypeIndex = (i - 11) % projectTypes.length;
                const reqIndex = (i - 11) % requirements.length;
                
                const month = Math.ceil(i / 10) + 2;
                const day = ((i - 1) % 10) * 3 + 5;
                
                tasksData[i] = [
                    {
                        id: i * 10,
                        title: `${projectTypes[projectTypeIndex]} ${advancedTopics[topicIndex]}`,
                        description: `${projectTypes[projectTypeIndex]} ${advancedTopics[topicIndex].toLowerCase()} system for Class ${i}. This advanced project will test your full-stack development skills.`,
                        requirements: requirements[reqIndex],
                        dueDate: `2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                        difficulty: i <= 20 ? "Intermediate" : i <= 35 ? "Advanced" : "Expert"
                    },
                    {
                        id: i * 10 + 1,
                        title: `${advancedTopics[topicIndex]} - Frontend`,
                        description: `Focus on the frontend implementation of ${advancedTopics[topicIndex].toLowerCase()} with modern UI/UX design.`,
                        requirements: ["Create responsive UI", "Implement modern design", "Add interactive features"],
                        dueDate: `2024-${month.toString().padStart(2, '0')}-${(day + 3).toString().padStart(2, '0')}`,
                        difficulty: i <= 20 ? "Intermediate" : i <= 35 ? "Advanced" : "Expert"
                    },
                    {
                        id: i * 10 + 2,
                        title: `${advancedTopics[topicIndex]} - Backend`,
                        description: `Develop the backend infrastructure for ${advancedTopics[topicIndex].toLowerCase()} with robust API design.`,
                        requirements: ["Build RESTful APIs", "Implement database design", "Add security measures"],
                        dueDate: `2024-${month.toString().padStart(2, '0')}-${(day + 6).toString().padStart(2, '0')}`,
                        difficulty: i <= 20 ? "Advanced" : "Expert"
                    }
                ];
            }
        });