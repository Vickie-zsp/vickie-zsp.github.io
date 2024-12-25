document.addEventListener('DOMContentLoaded', function() {
    // 音乐播放控制
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false;

    musicToggle.addEventListener('click', function() {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 照片墙图片加载
    const photoGrid = document.querySelector('.photo-grid');
    let photos = JSON.parse(localStorage.getItem('photos')) || [];

    // 添加一个空状态提示
    function showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <i class="fas fa-images"></i>
                <h3>还没有照片哦</h3>
                <p>点击上方的"上传新照片"按钮来添加照片吧！</p>
            </div>
        `;
        photoGrid.appendChild(emptyState);
    }

    // 保存照片到 localStorage 的函数
    function savePhotos() {
        localStorage.setItem('photos', JSON.stringify(photos));
    }

    // 修改 loadPhotos 函数，添加删除后的保存功能
    function loadPhotos() {
        photoGrid.innerHTML = ''; // 清空现有照片
        
        if (photos.length === 0) {
            showEmptyState();
            return;
        }

        photos.forEach((photo, index) => {
            const photoElement = document.createElement('div');
            photoElement.className = 'photo-item';
            photoElement.innerHTML = `
                <div class="photo-actions">
                    <button class="edit-photo" title="编辑照片">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-photo" title="删除照片">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <img src="${photo.src}" alt="${photo.caption}">
                <p class="photo-caption">${photo.caption}</p>
                <div class="edit-form" style="display: none;">
                    <input type="text" class="edit-caption" value="${photo.caption}">
                    <div class="edit-buttons">
                        <button class="save-edit">保存</button>
                        <button class="cancel-edit">取消</button>
                    </div>
                </div>
            `;

            // 添加编辑功能
            const editButton = photoElement.querySelector('.edit-photo');
            const editForm = photoElement.querySelector('.edit-form');
            const caption = photoElement.querySelector('.photo-caption');
            const editCaption = photoElement.querySelector('.edit-caption');
            
            editButton.addEventListener('click', () => {
                editForm.style.display = 'block';
                caption.style.display = 'none';
            });

            photoElement.querySelector('.cancel-edit').addEventListener('click', () => {
                editForm.style.display = 'none';
                caption.style.display = 'block';
            });

            photoElement.querySelector('.save-edit').addEventListener('click', () => {
                const newCaption = editCaption.value.trim();
                if (newCaption) {
                    photos[index].caption = newCaption;
                    caption.textContent = newCaption;
                    savePhotos();
                    editForm.style.display = 'none';
                    caption.style.display = 'block';
                }
            });

            // 添加删除功能
            const deleteButton = photoElement.querySelector('.delete-photo');
            deleteButton.addEventListener('click', function() {
                if (confirm('确定要删除这张照片吗？')) {
                    photoElement.classList.add('fade-out');
                    setTimeout(() => {
                        photoElement.remove();
                        // 从数组中删除照片
                        photos.splice(index, 1);
                        // 保存更新后的照片数组
                        savePhotos();
                    }, 300);
                }
            });

            photoGrid.appendChild(photoElement);
        });
    }

    // 留言板功能
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.querySelector('.messages');
    // 从 localStorage 获取保存的留言
    let savedMessages = JSON.parse(localStorage.getItem('messages')) || [];

    // 保存留言到 localStorage
    function saveMessages() {
        localStorage.setItem('messages', JSON.stringify(savedMessages));
    }

    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const message = this.querySelector('textarea').value;
            
            // 创建新留言对象
            const newMessage = {
                name: name,
                message: message,
                time: new Date().toLocaleString()
            };
            
            // 添加到留言数组
            savedMessages.unshift(newMessage);
            // 保存到 localStorage
            saveMessages();
            
            // 添加新留言到页面
            addMessage(newMessage.name, newMessage.message, newMessage.time);
            
            // 重置表单
            this.reset();
        });
    }

    function addMessage(name, message, time) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <h4>${name}</h4>
            <p>${message}</p>
            <span class="time">${time}</span>
        `;
        messagesContainer.prepend(messageElement);
    }

    // 加载保存的留言
    function loadMessages() {
        messagesContainer.innerHTML = '';
        if (savedMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-messages">
                    <i class="fas fa-comments"></i>
                    <h3>还没有留言</h3>
                    <p>来写下第一条留言吧！</p>
                </div>
            `;
            return;
        }

        savedMessages.forEach(msg => {
            addMessage(msg.name, msg.message, msg.time);
        });
    }

    // 在页面加载时调用 loadMessages
    loadMessages();

    // 动画效果
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // 添加日记展示功能
    function addDiaryEntry(date, title, content, images = [], index) {
        const entryElement = document.createElement('div');
        entryElement.className = 'diary-entry';
        
        let imagesHTML = '';
        if (images.length > 0) {
            imagesHTML = `
                <div class="diary-images">
                    ${images.map(img => `<img src="${img}" alt="日记图片">`).join('')}
                </div>
            `;
        }

        entryElement.innerHTML = `
            <div class="diary-actions">
                <button class="edit-diary-entry" title="编辑日记">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-diary-entry" title="删除日记">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="diary-content">
            <div class="diary-header">
                <span class="diary-date">${date}</span>
                <h3>${title}</h3>
            </div>
                <div class="diary-text">
                <p>${content}</p>
                ${imagesHTML}
            </div>
            <div class="diary-footer">
                <span class="diary-signature">——爱你们的妈妈</span>
                </div>
            </div>
            <div class="diary-edit-form" style="display: none;">
                <input type="text" class="edit-diary-title" value="${title}">
                <textarea class="edit-diary-content">${content}</textarea>
                <div class="edit-buttons">
                    <button class="save-diary-edit">保存</button>
                    <button class="cancel-diary-edit">取消</button>
                </div>
            </div>
        `;
        
        // 添加编辑功能
        const editButton = entryElement.querySelector('.edit-diary-entry');
        const deleteButton = entryElement.querySelector('.delete-diary-entry');
        const editForm = entryElement.querySelector('.diary-edit-form');
        const diaryContent = entryElement.querySelector('.diary-content');

        editButton.addEventListener('click', () => {
            editForm.style.display = 'block';
            diaryContent.style.display = 'none';
        });

        entryElement.querySelector('.cancel-diary-edit').addEventListener('click', () => {
            editForm.style.display = 'none';
            diaryContent.style.display = 'block';
        });

        entryElement.querySelector('.save-diary-edit').addEventListener('click', () => {
            const newTitle = entryElement.querySelector('.edit-diary-title').value.trim();
            const newContent = entryElement.querySelector('.edit-diary-content').value.trim();

            if (newTitle && newContent) {
                diaryEntries[index].title = newTitle;
                diaryEntries[index].content = newContent;
                localStorage.setItem('diaries', JSON.stringify(diaryEntries));
                
                // 更新显示
                entryElement.querySelector('.diary-header h3').textContent = newTitle;
                entryElement.querySelector('.diary-text p').textContent = newContent;
                
                editForm.style.display = 'none';
                diaryContent.style.display = 'block';
            }
        });

        // 添加删除功能
        deleteButton.addEventListener('click', () => {
            if (confirm('确定要删除这篇日记吗？')) {
                diaryEntries.splice(index, 1);
                localStorage.setItem('diaries', JSON.stringify(diaryEntries));
                entryElement.remove();
                
                // 如果没有日记了，显示空状态
                if (diaryEntries.length === 0) {
                    loadDiaries();
                }
            }
        });

        diaryContainer.prepend(entryElement);
    }

    // 添加时光轴条目的函数
    function addTimelineEntry(date, title, description, imageSrc) {
        const timeline = document.querySelector('.timeline');
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <h3>${date}</h3>
                <h4>${title}</h4>
                <p>${description}</p>
                ${imageSrc ? `<img src="${imageSrc}" alt="${title}">` : ''}
            </div>
        `;
        timeline.appendChild(timelineItem);
    }

    // 删除原有的示例时光轴条目，添加新的时光轴功能
    const timelineEntries = JSON.parse(localStorage.getItem('timeline')) || [];
    const timeline = document.querySelector('.timeline');
    const addMilestoneBtn = document.querySelector('.add-milestone-btn');
    const milestoneForm = document.querySelector('.milestone-form');
    const milestoneImage = document.getElementById('milestoneImage');
    const previewImage = document.querySelector('.milestone-preview-image');
    let selectedImage = null;

    // 显示/隐藏里程碑表单
    addMilestoneBtn.addEventListener('click', () => {
        milestoneForm.style.display = 'block';
        addMilestoneBtn.style.display = 'none';
    });

    // 取消按钮
    document.querySelector('.cancel-milestone').addEventListener('click', () => {
        milestoneForm.style.display = 'none';
        addMilestoneBtn.style.display = 'block';
        resetMilestoneForm();
    });

    // 处理图片预览
    milestoneImage.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImage = e.target.result;
                previewImage.innerHTML = `<img src="${selectedImage}" alt="预览图片">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // 保存里程碑
    document.querySelector('.save-milestone').addEventListener('click', function() {
        const date = document.getElementById('milestoneDate').value;
        const title = document.getElementById('milestoneTitle').value;
        const content = document.getElementById('milestoneContent').value;

        if (!date || !title || !content) {
            alert('请填写完整信息');
            return;
        }

        const newMilestone = {
            date: date,
            title: title,
            description: content,
            image: selectedImage
        };

        timelineEntries.unshift(newMilestone);
        localStorage.setItem('timeline', JSON.stringify(timelineEntries));
        
        addTimelineEntry(newMilestone.date, newMilestone.title, newMilestone.description, newMilestone.image);
        
        resetMilestoneForm();
        milestoneForm.style.display = 'none';
        addMilestoneBtn.style.display = 'block';
    });

    // 重置表单
    function resetMilestoneForm() {
        document.getElementById('milestoneDate').value = '';
        document.getElementById('milestoneTitle').value = '';
        document.getElementById('milestoneContent').value = '';
        previewImage.innerHTML = '';
        selectedImage = null;
        milestoneImage.value = '';
    }

    // 加载保存的里程碑
    function loadTimeline() {
        timeline.innerHTML = '';
        if (timelineEntries.length === 0) {
            timeline.innerHTML = `
                <div class="empty-timeline">
                    <i class="fas fa-road"></i>
                    <h3>还没有里程碑</h3>
                    <p>点击"添加新里程碑"按钮记录重要时刻吧！</p>
                </div>
            `;
            return;
        }

        timelineEntries.forEach((entry, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-actions">
                        <button class="edit-timeline" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-timeline" title="删除">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <h3>${entry.date}</h3>
                    <h4>${entry.title}</h4>
                    <p>${entry.description}</p>
                    ${entry.image ? `<img src="${entry.image}" alt="${entry.title}">` : ''}
                </div>
                <div class="timeline-edit-form" style="display: none;">
                    <input type="text" class="edit-date" value="${entry.date}">
                    <input type="text" class="edit-title" value="${entry.title}">
                    <textarea class="edit-description">${entry.description}</textarea>
                    <div class="edit-buttons">
                        <button class="save-timeline-edit">保存</button>
                        <button class="cancel-timeline-edit">取消</button>
                    </div>
                </div>
            `;

            // 添加编辑功能
            const editButton = timelineItem.querySelector('.edit-timeline');
            const editForm = timelineItem.querySelector('.timeline-edit-form');
            const content = timelineItem.querySelector('.timeline-content');

            editButton.addEventListener('click', () => {
                editForm.style.display = 'block';
                content.style.display = 'none';
            });

            timelineItem.querySelector('.cancel-timeline-edit').addEventListener('click', () => {
                editForm.style.display = 'none';
                content.style.display = 'block';
            });

            timelineItem.querySelector('.save-timeline-edit').addEventListener('click', () => {
                const newDate = timelineItem.querySelector('.edit-date').value.trim();
                const newTitle = timelineItem.querySelector('.edit-title').value.trim();
                const newDescription = timelineItem.querySelector('.edit-description').value.trim();

                if (newDate && newTitle && newDescription) {
                    timelineEntries[index].date = newDate;
                    timelineEntries[index].title = newTitle;
                    timelineEntries[index].description = newDescription;
                    
                    localStorage.setItem('timeline', JSON.stringify(timelineEntries));
                    loadTimeline(); // 重新加载显示
                }
            });

            // 添加删除功能
            timelineItem.querySelector('.delete-timeline').addEventListener('click', () => {
                if (confirm('确定要��除这个里程碑吗？')) {
                    timelineEntries.splice(index, 1);
                    localStorage.setItem('timeline', JSON.stringify(timelineEntries));
                    loadTimeline();
                }
            });

            timeline.appendChild(timelineItem);
        });
    }

    // 初始加载时光轴
    loadTimeline();

    // 添加照片上传功能
    const photoUpload = document.getElementById('photo-upload');
    
    photoUpload.addEventListener('change', function(e) {
        console.log('文件选择事件触发');
        const files = Array.from(e.target.files);
        console.log('选择的文件：', files);
        
        if (files.length === 0) {
            console.log('没有选择文件');
            return;
        }

        // 创建预览区域
        const previewSection = document.createElement('div');
        previewSection.className = 'upload-preview';
        console.log('创建预览区域');
        
        // 创建预览区域的基本结构
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        
        // 将预览区域添加到页面（移到这里）
        photoGrid.insertBefore(previewSection, photoGrid.firstChild);
        previewSection.appendChild(previewContainer);
        
        files.forEach(file => {
            console.log('处理文件：', file.name);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    console.log('文件读取完成');
                    // 创建预览元素
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    
                    // 添加照片到预览区域
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="预览图片">
                        <div class="remove-preview">×</div>
                        <input type="text" name="photo-description" 
                               placeholder="添加描述..." 
                               class="photo-description">
                    `;
                    
                    // 添加删除功能
                    const removeButton = previewItem.querySelector('.remove-preview');
                    removeButton.addEventListener('click', () => {
                        previewItem.remove();
                        if (previewContainer.children.length === 0) {
                            previewSection.remove();
                        }
                    });

                    previewContainer.appendChild(previewItem);
                };
                
                reader.onerror = function(error) {
                    console.log('文件读取错误：', error);
                };
                
                reader.readAsDataURL(file);
            }
        });

        // 添加确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.className = 'confirm-upload';
        confirmButton.innerHTML = '确认添加这些照片';
        previewSection.appendChild(confirmButton);

        // 确认按钮的点击事件
        confirmButton.addEventListener('click', function() {
            console.log('确认按钮点击');
            const previewItems = previewContainer.querySelectorAll('.preview-item');
            console.log('找到预览项数量：', previewItems.length);
            
            previewItems.forEach((item, index) => {
                console.log(`处理第 ${index + 1} 张照片`);
                const imgSrc = item.querySelector('img').src;
                const description = item.querySelector('.photo-description').value || '温馨时刻';
                console.log('描述文字：', description);
                
                // 添加新照片到数组
                photos.push({
                    src: imgSrc,
                    caption: description
                });

                // 创建新的照片项
                const photoElement = document.createElement('div');
                photoElement.className = 'photo-item';
                photoElement.innerHTML = `
                    <div class="photo-actions">
                        <button class="edit-photo" title="编辑照片">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-photo" title="删除照片">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <img src="${imgSrc}" alt="${description}">
                    <p class="photo-caption">${description}</p>
                    <div class="edit-form" style="display: none;">
                        <input type="text" class="edit-caption" value="${description}">
                        <div class="edit-buttons">
                            <button class="save-edit">保存</button>
                            <button class="cancel-edit">取消</button>
                        </div>
                    </div>
                `;

                // 添加编辑功能
                const editButton = photoElement.querySelector('.edit-photo');
                const editForm = photoElement.querySelector('.edit-form');
                const caption = photoElement.querySelector('.photo-caption');
                const editCaption = photoElement.querySelector('.edit-caption');
                
                editButton.addEventListener('click', () => {
                    editForm.style.display = 'block';
                    caption.style.display = 'none';
                });

                photoElement.querySelector('.cancel-edit').addEventListener('click', () => {
                    editForm.style.display = 'none';
                    caption.style.display = 'block';
                });

                photoElement.querySelector('.save-edit').addEventListener('click', () => {
                    const newCaption = editCaption.value.trim();
                    if (newCaption) {
                        photos[index].caption = newCaption;
                        caption.textContent = newCaption;
                        savePhotos();
                        editForm.style.display = 'none';
                        caption.style.display = 'block';
                    }
                });

                // 添加删除功能
                const deleteButton = photoElement.querySelector('.delete-photo');
                deleteButton.addEventListener('click', function() {
                    if (confirm('确定要删除这张照片吗？')) {
                        photoElement.classList.add('fade-out');
                        setTimeout(() => {
                            photoElement.remove();
                        }, 300);
                    }
                });
                
                // 添加到照片墙
                photoGrid.appendChild(photoElement);
            });
            
            // 保存到 localStorage
            localStorage.setItem('photos', JSON.stringify(photos));
            
            // 清空预览区域
            previewSection.remove();
            
            // 重置文件输入
            photoUpload.value = '';
        });
    });

    // 日记功能
    const diaryEntries = JSON.parse(localStorage.getItem('diaries')) || [];
    const diaryContainer = document.querySelector('.diary-entries');
    const addDiaryBtn = document.querySelector('.add-diary-btn');
    const diaryForm = document.querySelector('.diary-form');
    const diaryImages = document.getElementById('diaryImages');
    const previewContainer = document.querySelector('.diary-preview-images');
    let selectedImages = [];

    // 显示/隐藏日记表单
    addDiaryBtn.addEventListener('click', () => {
        diaryForm.style.display = 'block';
        addDiaryBtn.style.display = 'none';
    });

    // 取消按钮
    document.querySelector('.cancel-diary').addEventListener('click', () => {
        diaryForm.style.display = 'none';
        addDiaryBtn.style.display = 'block';
        resetDiaryForm();
    });

    // 处理图片预览
    diaryImages.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        selectedImages = [];
        previewContainer.innerHTML = '';

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    selectedImages.push(e.target.result);
                    previewContainer.innerHTML += `
                        <img src="${e.target.result}" alt="预览图片">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // 保存日记
    document.querySelector('.save-diary').addEventListener('click', function() {
        const title = document.getElementById('diaryTitle').value;
        const content = document.getElementById('diaryContent').value;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        const newDiary = {
            date: new Date().toLocaleDateString(),
            title: title,
            content: content,
            images: selectedImages
        };

        diaryEntries.unshift(newDiary);
        localStorage.setItem('diaries', JSON.stringify(diaryEntries));
        
        addDiaryEntry(newDiary.date, newDiary.title, newDiary.content, newDiary.images);
        
        resetDiaryForm();
        diaryForm.style.display = 'none';
        addDiaryBtn.style.display = 'block';
    });

    // 重置表单
    function resetDiaryForm() {
        document.getElementById('diaryTitle').value = '';
        document.getElementById('diaryContent').value = '';
        previewContainer.innerHTML = '';
        selectedImages = [];
        diaryImages.value = '';
    }

    // 加载保存的日记
    function loadDiaries() {
        diaryContainer.innerHTML = '';
        if (diaryEntries.length === 0) {
            diaryContainer.innerHTML = `
                <div class="empty-diary">
                    <i class="fas fa-book"></i>
                    <h3>还没有日记哦</h3>
                    <p>点击"写新日记"按钮开始记录美好时刻吧！</p>
                </div>
            `;
            return;
        }

        diaryEntries.forEach((diary, index) => {
            addDiaryEntry(diary.date, diary.title, diary.content, diary.images, index);
        });
    }

    // 初始加载日记
    loadDiaries();

    // 在文档加载完成时调用 loadPhotos
    loadPhotos();

    // 贪吃蛇游戏
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startGame');
    const scoreElement = document.getElementById('score');

    // 设置画布大小
    canvas.width = 400;
    canvas.height = 400;

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [];
    let food = {};
    let direction = 'right';
    let score = 0;
    let gameInterval;
    let gameSpeed = 150;

    // 初始化游戏
    function initGame() {
        snake = [
            { x: 3, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 1 }
        ];
        direction = 'right';
        score = 0;
        scoreElement.textContent = score;
        createFood();
    }

    // 创建食物
    function createFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        // 确保食物不会出现在蛇身上
        while (snake.some(part => part.x === food.x && part.y === food.y)) {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        }
    }

    // 绘制游戏
    function draw() {
        // 清空画布
        ctx.fillStyle = '#f8f8f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制蛇
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? '#ff7b9c' : '#ff9eaa';
            ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // 绘制食物
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    // 移动蛇
    function moveSnake() {
        const head = { ...snake[0] };

        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
            snake.some(part => part.x === head.x && part.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            createFood();
            // 加快游戏速度
            if (gameSpeed > 50) {
                gameSpeed -= 5;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            snake.pop();
        }
    }

    // 游戏循环
    function gameLoop() {
        moveSnake();
        draw();
    }

    // 游戏结束
    function gameOver() {
        clearInterval(gameInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2);
        startBtn.textContent = '重新开始';
    }

    // 开始游戏
    startBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
        startBtn.textContent = '重新开始';
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
            case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
            case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
            case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
        }
    });

    // 移动端控制
    document.getElementById('upBtn')?.addEventListener('click', () => {
        if (direction !== 'down') direction = 'up';
    });
    document.getElementById('downBtn')?.addEventListener('click', () => {
        if (direction !== 'up') direction = 'down';
    });
    document.getElementById('leftBtn')?.addEventListener('click', () => {
        if (direction !== 'right') direction = 'left';
    });
    document.getElementById('rightBtn')?.addEventListener('click', () => {
        if (direction !== 'left') direction = 'right';
    });

    // 初始化画布
    draw();

    // 确保在页面加载时调用所有加载函数
    loadPhotos();
    loadTimeline();
    loadDiaries();
    
    // 初始化贪吃蛇游戏
    initGame();
    draw();
}); 