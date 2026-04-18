// 专题活动管理脚本
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    let activitiesData = JSON.parse(localStorage.getItem('activitiesData')) || [
        { id: 1, title: '春季促销活动', category: 2, date: '2024-03-01', content: '春季大促活动内容...', status: 1 },
        { id: 2, title: '新品发布会', category: 1, date: '2024-04-15', content: '新产品发布活动详情...', status: 1 },
        { id: 3, title: '周年庆活动', category: 3, date: '2024-06-01', content: '公司周年庆典...', status: 0 }
    ];

    let dataTable;
    const categories = {1:'市场活动',2:'促销活动',3:'其他'};

    function initTable() {
        if (dataTable) dataTable.destroy();
        $('#activitiesTable').DataTable({
            data: activitiesData,
            columns: [
                { data: 'id' },
                { data: 'title' },
                { data: 'category', render: function(d){return '<span class="badge bg-info">'+(categories[d]||d)+'</span>';} },
                { data: 'date' },
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
        dataTable = $('#activitiesTable').DataTable();
    }

    document.getElementById('saveActivity').addEventListener('click', function() {
        const id = document.getElementById('activityId').value;
        const title = document.getElementById('activityTitle').value.trim();
        const category = parseInt(document.getElementById('activityCategory').value);
        const date = document.getElementById('activityDate').value;
        const content = document.getElementById('activityContent').value.trim();
        const status = parseInt(document.getElementById('activityStatus').value);

        if (!title) { alert('请输入标题'); return; }

        if (id) {
            const index = activitiesData.findIndex(a => a.id == id);
            if (index !== -1) activitiesData[index] = { ...activitiesData[index], title, category, date, content, status };
        } else {
            const newId = Math.max(...activitiesData.map(a => a.id), 0) + 1;
            activitiesData.push({ id: newId, title, category, date, content, status });
        }
        localStorage.setItem('activitiesData', JSON.stringify(activitiesData));
        bootstrap.Modal.getInstance(document.getElementById('addActivityModal')).hide();
        resetForm();
        initTable();
        alert('保存成功！');
    });

    $('#activitiesTable').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const item = activitiesData.find(a => a.id == id);
        if (item) {
            document.getElementById('activityId').value = item.id;
            document.getElementById('activityTitle').value = item.title;
            document.getElementById('activityCategory').value = item.category;
            document.getElementById('activityDate').value = item.date || '';
            document.getElementById('activityContent').value = item.content || '';
            document.getElementById('activityStatus').value = item.status;
            new bootstrap.Modal(document.getElementById('addActivityModal')).show();
        }
    });

    $('#activitiesTable').on('click', '.btn-toggle', function() {
        const id = $(this).data('id');
        const index = activitiesData.findIndex(a => a.id == id);
        if (index !== -1) {
            activitiesData[index].status = activitiesData[index].status == 1 ? 0 : 1;
            localStorage.setItem('activitiesData', JSON.stringify(activitiesData));
            initTable();
        }
    });

    $('#activitiesTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (confirm('确定要删除吗？')) {
            activitiesData = activitiesData.filter(a => a.id != id);
            localStorage.setItem('activitiesData', JSON.stringify(activitiesData));
            initTable();
        }
    });

    function resetForm() {
        document.getElementById('activityForm').reset();
        document.getElementById('activityId').value = '';
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
