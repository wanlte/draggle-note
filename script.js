// 便签计数器，用于生成唯一ID
let noteCount = 0;

// 获取按钮和回收站
const addBtn = document.getElementById('addBtn');
const trashBin = document.getElementById('trash-bin');

/**
 * 添加新便签
 * 1. 生成唯一ID
 * 2. 计算随机位置（确保便签完全在可视区域内）
 * 3. 创建便签元素
 * 4. 添加到容器中
 * 5. 初始化拖拽功能
 */
function addNote() {
    // 生成唯一ID
    const noteId = `note-${++noteCount}`;
    
    // 计算随机位置
    // 考虑便签宽度和高度，确保便签完全在可视区域内
    // 修改成只在右半边生成便签
    const maxX = window.innerWidth - 220; // 200px宽 + 20px边距
    const maxY = window.innerHeight - 220; // 200px高 + 20px边距
    const x = (Math.random() * 0.5 + 0.5) * maxX;
    const y = Math.random() * maxY;
    
    // 创建便签元素
    const note = document.createElement('div');
    note.id = noteId;
    note.className = 'note';
    note.style.left = `${x}px`;
    note.style.top = `${y}px`;
    
    // 便签内容
    note.innerHTML = `
        <div class="note-header">
            <input type="text" class="note-title" value="便签 ${noteCount}" placeholder="输入标题...">
            <button class="delete-btn">✕</button>
        </div>
        <textarea class="note-content" placeholder="输入内容..."></textarea>
    `;
    
    // 添加到容器中
    document.getElementById('notesContainer').appendChild(note);
    
    // 初始化拖拽功能
    initDrag(note);
}

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
    });
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        // 计算新位置
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;
        
        // 边界检查，修改成只在右半边生成便签
        newX = Math.max(0, Math.min(newX, window.innerWidth - note.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - note.offsetHeight));
        
        // 更新便签位置
        note.style.left = `${newX}px`;
        note.style.top = `${newY}px`;
    });
    
    // 鼠标释放事件
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            // 标记为结束拖拽
            isDragging = false;
            // 恢复默认层级
            note.style.zIndex = 1;
        }
    });
    
    // 删除功能
    const deleteBtn = note.querySelector('.delete-btn');
    
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();  // 防止冒泡触发其他事件
        
        // 二次确认
        if (confirm('确定要删除这个便签吗？')) {
            // 添加删除动画
            note.classList.add('deleting');
            
            // 让回收站高亮
            if (trashBin) {
                trashBin.classList.add('has-items');
            }
            
            // 动画结束后删除
            setTimeout(() => {
                note.remove();
                
                // 检查是否还有便签，如果没有，回收站取消高亮
                if (trashBin && document.querySelectorAll('.note').length === 0) {
                    trashBin.classList.remove('has-items');
                }
            }, 300); // 300ms后真正删除（和动画时间一致）
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
