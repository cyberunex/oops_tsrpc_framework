// 菜单管理脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 模拟菜单数据
    let menuData = JSON.parse(localStorage.getItem('menuData')) || [
        { id: 1, parentId: 0, name: '首页', link: 'index.html', icon: 'fas fa-home', description: '网站首页', status: 1, sort: 0 },
        { id: 2, parentId: 0, name: '产品服务', link: '', icon: 'fas fa-box', description: '产品与服务', status: 1, sort: 1 },
        { id: 3, parentId: 2, name: '产品分类', link: 'products.html?cat=1', icon: 'fas fa-list', description: '产品分类列表', status: 1, sort: 0 },
        { id: 4, parentId: 2, name: '服务分类', link: 'products.html?cat=2', icon: 'fas fa-concierge-bell', description: '服务分类列表', status: 1, sort: 1 },
        { id: 5, parentId: 0, name: '专题活动', link: 'activities.html', icon: 'fas fa-calendar-alt', description: '专题活动页面', status: 1, sort: 2 },
        { id: 6, parentId: 0, name: '企业大事记', link: 'history.html', icon: 'fas fa-history', description: '企业发展历程', status: 1, sort: 3 },
        { id: 7, parentId: 0, name: '反馈招聘', link: 'feedback.html', icon: 'fas fa-envelope', description: '留言与招聘', status: 1, sort: 4 }
    ];

    let currentEditId = null;

    // 渲染菜单树
    function renderMenuTree(parentId = 0, container = null) {
        const items = menuData.filter(item => item.parentId == parentId);
        
        if (items.length === 0) return '';
        
        let html = '';
        items.forEach(item => {
            const children = menuData.filter(m => m.parentId == item.id);
            const statusClass = item.status == 1 ? 'text-success' : 'text-secondary';
            const statusIcon = item.status == 1 ? 'fa-check-circle' : 'fa-times-circle';
            
            html += `
                <div class="list-group-item list-group-item-action menu-tree-item" data-id="${item.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <i class="${item.icon || 'fas fa-folder'} me-2 ${statusClass}"></i>
                            <span>${item.name}</span>
                            ${children.length > 0 ? '<small class="text-muted ms-2">(' + children.length + ')</small>' : ''}
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-edit-menu" data-id="${item.id}" title="编辑">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-success btn-add-child" data-id="${item.id}" title="添加子菜单">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-outline-${item.status == 1 ? 'warning' : 'success'} btn-toggle-status" data-id="${item.id}" title="${item.status == 1 ? '停用' : '启用'}">
                                <i class="fas ${statusIcon}"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-delete-menu" data-id="${item.id}" title="删除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            if (children.length > 0) {
                html += `<div class="menu-tree-children">` + renderMenuTree(item.id) + `</div>`;
            }
        });
        
        return html;
    }

    // 填充父菜单选择器
    function fillParentSelect() {
        const select = document.getElementById('menuParentSelect');
        if (!select) return;
        
        let options = '<option value="0">无（根菜单）</option>';
        menuData.forEach(item => {
            options += `<option value="${item.id}">${item.name}</option>`;
        });
        select.innerHTML = options;
    }

    // 初始化
    function init() {
        const menuTreeContainer = document.getElementById('menuTree');
        if (menuTreeContainer) {
            menuTreeContainer.innerHTML = renderMenuTree();
            attachMenuEvents();
        }
        fillParentSelect();
    }

    // 绑定事件
    function attachMenuEvents() {
        // 点击菜单项加载到表单
        document.querySelectorAll('.menu-tree-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.btn-group')) {
                    const id = this.dataset.id;
                    loadMenuToForm(id);
                }
            });
        });

        // 编辑按钮
        document.querySelectorAll('.btn-edit-menu').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                loadMenuToForm(this.dataset.id);
            });
        });

        // 添加子菜单按钮
        document.querySelectorAll('.btn-add-child').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const parentId = this.dataset.id;
                resetForm();
                document.getElementById('menuParentId').value = parentId;
                document.getElementById('menuParentSelect').value = parentId;
                document.getElementById('menuName').focus();
            });
        });

        // 切换状态按钮
        document.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenuStatus(this.dataset.id);
            });
        });

        // 删除按钮
        document.querySelectorAll('.btn-delete-menu').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteMenu(this.dataset.id);
            });
        });
    }

    // 加载菜单到表单
    function loadMenuToForm(id) {
        const item = menuData.find(m => m.id == id);
        if (!item) return;

        currentEditId = item.id;
        document.getElementById('menuId').value = item.id;
        document.getElementById('menuParentId').value = item.parentId;
        document.getElementById('menuParentSelect').value = item.parentId;
        document.getElementById('menuName').value = item.name;
        document.getElementById('menuLink').value = item.link || '';
        document.getElementById('menuIcon').value = item.icon || '';
        document.getElementById('menuDescription').value = item.description || '';
        document.getElementById('menuStatus').value = item.status;
        document.getElementById('menuSort').value = item.sort || 0;
    }

    // 重置表单
    function resetForm() {
        document.getElementById('menuForm').reset();
        document.getElementById('menuId').value = '';
        document.getElementById('menuParentId').value = '0';
        currentEditId = null;
    }

    // 保存菜单
    document.getElementById('menuForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('menuId').value;
        const parentId = parseInt(document.getElementById('menuParentSelect').value);
        const name = document.getElementById('menuName').value.trim();
        const link = document.getElementById('menuLink').value.trim();
        const icon = document.getElementById('menuIcon').value.trim();
        const description = document.getElementById('menuDescription').value.trim();
        const status = parseInt(document.getElementById('menuStatus').value);
        const sort = parseInt(document.getElementById('menuSort').value) || 0;

        if (!name) {
            alert('请输入菜单名称');
            return;
        }

        if (id) {
            // 更新
            const index = menuData.findIndex(m => m.id == id);
            if (index !== -1) {
                menuData[index] = { ...menuData[index], parentId, name, link, icon, description, status, sort };
            }
        } else {
            // 新增
            const newId = Math.max(...menuData.map(m => m.id), 0) + 1;
            menuData.push({ id: newId, parentId, name, link, icon, description, status, sort });
        }

        // 保存到 localStorage
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        alert('保存成功！');
        resetForm();
        init();
    });

    // 添加根菜单
    document.getElementById('confirmAddRootMenu').addEventListener('click', function() {
        const name = document.getElementById('rootMenuName').value.trim();
        const link = document.getElementById('rootMenuLink').value.trim();
        const icon = document.getElementById('rootMenuIcon').value.trim();

        if (!name) {
            alert('请输入菜单名称');
            return;
        }

        const newId = Math.max(...menuData.map(m => m.id), 0) + 1;
        menuData.push({ id: newId, parentId: 0, name, link, icon, description: '', status: 1, sort: menuData.length });
        
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        // 关闭 modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMenuModal'));
        modal.hide();
        
        // 清空表单
        document.getElementById('addRootMenuForm').reset();
        
        alert('添加成功！');
        init();
    });

    // 切换状态
    function toggleMenuStatus(id) {
        const index = menuData.findIndex(m => m.id == id);
        if (index !== -1) {
            menuData[index].status = menuData[index].status == 1 ? 0 : 1;
            localStorage.setItem('menuData', JSON.stringify(menuData));
            init();
        }
    }

    // 删除菜单
    function deleteMenu(id) {
        // 检查是否有子菜单
        const hasChildren = menuData.some(m => m.parentId == id);
        if (hasChildren) {
            if (!confirm('该菜单包含子菜单，删除将同时删除所有子菜单。确定要删除吗？')) {
                return;
            }
            // 删除所有子菜单
            menuData = menuData.filter(m => m.id != id && m.parentId != id);
        } else {
            if (!confirm('确定要删除该菜单吗？')) {
                return;
            }
            menuData = menuData.filter(m => m.id != id);
        }
        
        localStorage.setItem('menuData', JSON.stringify(menuData));
        resetForm();
        init();
    }

    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('show');
            } else {
                sidebar.classList.toggle('show');
                mainContent.classList.toggle('expanded');
            }
        });
    }

    // 初始化
    init();
});
