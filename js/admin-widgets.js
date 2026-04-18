// 小组件管理脚本
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    let widgetsData = JSON.parse(localStorage.getItem('widgetsData')) || [
        { id: 1, section: 'home', icon: 'fas fa-star', title: '优质服务', content: '我们提供最优质的服务', status: 1 },
        { id: 2, section: 'home', icon: 'fas fa-users', title: '专业团队', content: '经验丰富的专业团队', status: 1 },
        { id: 3, section: 'products', icon: 'fas fa-box', title: '产品展示', content: '精选产品推荐', status: 1 }
    ];

    let dataTable;
    const sections = {home:'首页',products:'产品页',about:'关于页'};

    function initTable() {
        if (dataTable) dataTable.destroy();
        $('#widgetsTable').DataTable({
            data: widgetsData,
            columns: [
                { data: 'id' },
                { data: 'section', render: function(d){return '<span class="badge bg-info">'+(sections[d]||d)+'</span>';} },
                { data: 'icon', render: function(d){return d?'<i class="'+d+'"></i>':'-';} },
                { data: 'title' },
                { data: 'content', render: function(d){return d?(d.length>20?d.substring(0,20)+'...':d):'-';} },
                { data: 'status', render: function(d){return d==1?'<span class="badge bg-success">启用</span>':'<span class="badge bg-secondary">停用</span>';} },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `<div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-edit" data-id="${row.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-outline-${row.status==1?'warning':'success'} btn-toggle" data-id="${row.id}">${row.status==1?'停用':'启用'}</button>
                            <button class="btn btn-outline-danger btn-delete" data-id="${row.id}"><i class="fas fa-trash"></i></button>
                        </div>`;
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/zh-CN.json' },
            pageLength: 10
        });
        dataTable = $('#widgetsTable').DataTable();
    }

    document.getElementById('saveWidget').addEventListener('click', function() {
        const id = document.getElementById('widgetId').value;
        const section = document.getElementById('widgetSection').value;
        const icon = document.getElementById('widgetIcon').value.trim();
        const title = document.getElementById('widgetTitle').value.trim();
        const content = document.getElementById('widgetContent').value.trim();
        const status = parseInt(document.getElementById('widgetStatus').value);

        if (!title) { alert('请输入标题'); return; }

        if (id) {
            const index = widgetsData.findIndex(w => w.id == id);
            if (index !== -1) widgetsData[index] = { ...widgetsData[index], section, icon, title, content, status };
        } else {
            const newId = Math.max(...widgetsData.map(w => w.id), 0) + 1;
            widgetsData.push({ id: newId, section, icon, title, content, status });
        }
        localStorage.setItem('widgetsData', JSON.stringify(widgetsData));
        bootstrap.Modal.getInstance(document.getElementById('addWidgetModal')).hide();
        resetForm();
        initTable();
        alert('保存成功！');
    });

    $('#widgetsTable').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const item = widgetsData.find(w => w.id == id);
        if (item) {
            document.getElementById('widgetId').value = item.id;
            document.getElementById('widgetSection').value = item.section;
            document.getElementById('widgetIcon').value = item.icon || '';
            document.getElementById('widgetTitle').value = item.title;
            document.getElementById('widgetContent').value = item.content || '';
            document.getElementById('widgetStatus').value = item.status;
            new bootstrap.Modal(document.getElementById('addWidgetModal')).show();
        }
    });

    $('#widgetsTable').on('click', '.btn-toggle', function() {
        const id = $(this).data('id');
        const index = widgetsData.findIndex(w => w.id == id);
        if (index !== -1) {
            widgetsData[index].status = widgetsData[index].status == 1 ? 0 : 1;
            localStorage.setItem('widgetsData', JSON.stringify(widgetsData));
            initTable();
        }
    });

    $('#widgetsTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (confirm('确定要删除吗？')) {
            widgetsData = widgetsData.filter(w => w.id != id);
            localStorage.setItem('widgetsData', JSON.stringify(widgetsData));
            initTable();
        }
    });

    function resetForm() {
        document.getElementById('widgetForm').reset();
        document.getElementById('widgetId').value = '';
    }

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('show');
            document.getElementById('mainContent').classList.toggle('expanded');
        });
    }

    initTable();
});
