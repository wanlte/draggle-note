// ---------- 初始化 ----------

// 预定义变量
let noteCount = 0;
const addBtn = document.getElementById('addBtn');
const trashBin = document.getElementById('trash-bin');

// 页面加载时，先尝试读取保存的数据
window.addEventListener('load', () => {
    // 先看有没有保存的便签
    const savedNotes = localStorage.getItem('notes');
    
    if (savedNotes && JSON.parse(savedNotes).length > 0) {
        // 有保存的数据，加载它们
        loadNotes();
        // 计算现有便签数量，用于新便签的编号
        const existingNotes = document.querySelectorAll('.note');
        noteCount = existingNotes.length;
    } else {
        // 没有保存的数据，创建一个默认便签
        noteCount++;
        createNote('便签 1');
    }
});

// ---------- localStorage 相关函数 ----------

/**
 * 保存所有便签到 localStorage
 */
function saveNotes() {
    const notes = document.querySelectorAll('.note');
    const notesData = [];
    
    notes.forEach(note => {
        const titleInput = note.querySelector('.note-title');
        const contentTextarea = note.querySelector('.note-content');
        
        notesData.push({
            id: note.id,
            title: titleInput ? titleInput.value : '',
            content: contentTextarea ? contentTextarea.value : '',
            left: note.style.left,
            top: note.style.top
        });
    });
    
    localStorage.setItem('notes', JSON.stringify(notesData));
    console.log('已保存', notesData.length, '个便签');
}

/**
 * 加载便签
 */
function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (!savedNotes) return;
    
    try {
        const notesData = JSON.parse(savedNotes);
        notesData.forEach(noteData => {
            // 直接创建便签元素，不调用createNote避免重复保存
            const note = document.createElement('div');
            note.id = noteData.id;
            note.className = 'note';
            note.style.left = noteData.left;
            note.style.top = noteData.top;
            
            // 便签内容
            note.innerHTML = `
                <div class="note-header">
                    <input type="text" class="note-title" value="${noteData.title}" placeholder="输入标题...">
                    <button class="delete-btn">✕</button>
                </div>
                <textarea class="note-content" placeholder="输入内容...">${noteData.content}</textarea>
            `;
            
            // 添加到容器中
            document.getElementById('notesContainer').appendChild(note);
            
            // 初始化拖拽功能
            initDrag(note);
            
            // 添加内容修改自动保存功能
            const titleInput = note.querySelector('.note-title');
            const contentTextarea = note.querySelector('.note-content');
            
            // 标题修改时保存
            titleInput.addEventListener('input', saveNotes);
            
            // 内容修改时保存
            contentTextarea.addEventListener('input', saveNotes);
        });
        
        console.log('已加载', notesData.length, '个便签');
    } catch (e) {
        console.error('加载失败', e);
    }
}

/**
 * 创建便签的通用函数
 * @param {string} title 便签标题
 * @param {string} content 便签内容
 * @param {string} left 左边距
 * @param {string} top 顶边距
 * @param {string} existingId 已存在的ID（用于加载）
 */
function createNote(title, content = '双击编辑内容', left = null, top = null, existingId = null) {
    const note = document.createElement('div');
    note.className = 'note';
    
    // 设置唯一ID（如果没有传就用时间戳）
    const noteId = existingId || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    note.dataset.id = noteId;
    note.id = noteId;
    
    // 设置位置（如果传了就用传的值，否则随机）
    const maxLeft = window.innerWidth - 220;
    const maxTop = window.innerHeight - 200;
    
    if (left && top) {
        note.style.left = left;
        note.style.top = top;
    } else {
        note.style.left = Math.min(100 + Math.random() * 200, maxLeft) + 'px';
        note.style.top = Math.min(100 + Math.random() * 200, maxTop) + 'px';
    }
    
    // 便签内容
    note.innerHTML = `
        <div class="note-header">
            <input type="text" class="note-title" value="${title}" placeholder="输入标题...">
            <button class="delete-btn">✕</button>
        </div>
        <textarea class="note-content" placeholder="输入内容...">${content}</textarea>
    `;
    
    document.getElementById('notesContainer').appendChild(note);
    
    // 初始化拖拽功能
    initDrag(note);
    
    // 添加内容修改自动保存功能
    const titleInput = note.querySelector('.note-title');
    const contentTextarea = note.querySelector('.note-content');
    
    // 标题修改时保存
    titleInput.addEventListener('input', saveNotes);
    
    // 内容修改时保存
    contentTextarea.addEventListener('input', saveNotes);
    
    // 新添加的便签立即保存
    saveNotes();
    return note;
}

/**
 * 添加新便签（简化版，调用createNote）
 */
function addNote() {
    const noteCount = document.querySelectorAll('.note').length + 1;
    createNote(`便签 ${noteCount}`, '双击编辑内容', null, null, null);
}

// 为添加便签按钮添加点击事件
addBtn.addEventListener('click', () => {
    noteCount++;
    createNote(`便签 ${noteCount}`);
    // 不用额外调用 saveNotes，createNote 里已经调用了
});

/**
 * 初始化拖拽功能
 * @param {HTMLElement} note 便签元素
 */
function initDrag(note) {
    /* isDragging指鼠标是否正在拖拽 */
    let isDragging = false;
    let offsetX, offsetY;
    
    // 鼠标按下事件
    note.addEventListener('mousedown', function(e) {
        // 如果点击的是输入框或文本域，不启动拖拽，允许输入
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // 阻止默认行为，避免文本选择
        e.preventDefault();
        
        // 标记为正在拖拽
        isDragging = true;
        
        // 计算鼠标相对于便签的位置
        offsetX = e.clientX - note.getBoundingClientRect().left;
        offsetY = e.clientY - note.getBoundingClientRect().top;
        
        // 提高当前便签的层级，使其在最上层
        note.style.zIndex = 100;
        note.style.cursor = 'grabbing';
        
        // 添加全局拖拽事件
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    });
    
    // 拖拽函数
    function drag(e) {
        if (!isDragging) return;
        
        // 计算新位置
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        
        // 边界检查，确保便签完全在可视区域内
        newX = Math.max(0, Math.min(newX, window.innerWidth - note.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - note.offsetHeight));
        
        // 更新便签位置
        note.style.left = `${newX}px`;
        note.style.top = `${newY}px`;
    }
    
    // 停止拖拽函数
    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        note.style.cursor = 'move';
        note.style.zIndex = 1;
        
        // 每个dom对象在监听完后需要移除监听，否则会导致内存泄漏
        // 移除全局监听
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        
        // 拖拽结束后保存位置
        saveNotes();
    }
    
    // 删除功能
    const deleteBtn = note.querySelector('.delete-btn');
    
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();  // 防止冒泡触发其他事件
        
        // 确认删除
        if (confirm('确定要删除这个便签吗？')) {
            // 添加删除动画
            note.classList.add('deleting');
            
            // 让回收站高亮
            if (trashBin) {
                /* 让回收站高亮 */
                trashBin.classList.add('has-items');
            }
            
            // 动画结束后删除
            setTimeout(() => {
                note.remove();
                /* 删除便签元素 */
                // 检查是否还有便签，如果没有，回收站取消高亮
                if (trashBin && document.querySelectorAll('.note').length === 0) {
                    /* 取消高亮 */
                    trashBin.classList.remove('has-items');
                }
                
                // 保存到localStorage
                saveNotes();
            }, 300);
        }
    });
}

/**
 * 关闭便签
 * @param {string} noteId 便签ID
 */
function closeNote(noteId) {
    const note = document.getElementById(noteId);
    if (note) {
        note.remove();
    }
}
