// 大事记管理脚本
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    let historyData = JSON.parse(localStorage.getItem('historyData')) || [
        { id: 1, type: 'single', title: '公司成立', content: '2020 年公司正式成立', attachment: '/img/found.jpg', status: 1 },
        { id: 2, type: 'video', title: '产品发布会', content: '新产品发布会成功举办', attachment: '/video/launch.mp4', status: 1 },
        { id: 3, type: 'text', title: '获得奖项', content: '荣获行业创新奖', attachment: null, status: 1 }
    ];

    let dataTable;

    function initTable() {
        if (dataTable) dataTable.destroy();
        $('#historyTable').DataTable({
            data: historyData,
            columns: [
                { data: 'id' },
                { 
                    data: 'type',
                    render: function(data) {
                        const types = {single:'单图',gallery:'多图',video:'视频',audio:'音频',text:'文本'};
                        return '<span class="badge bg-info">'+(types[data]||data)+'</span>';
                    }
                },
                { data: 'title' },
                { data: 'content', render: function(d){return d?(d.length>20?d.substring(0,20)+'...':d):'-';} },
                { data: 'attachment', render: function(d){return d?'<i class="fas fa-file"></i>':'-';} },
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
        dataTable = $('#historyTable').DataTable();
    }

    document.getElementById('saveHistory').addEventListener('click', function() {
        const id = document.getElementById('historyId').value;
        const type = document.getElementById('historyType').value;
        const title = document.getElementById('historyTitle').value.trim();
        const content = document.getElementById('historyContent').value.trim();
        const attachment = document.getElementById('historyAttachment').value.trim();
        const status = parseInt(document.getElementById('historyStatus').value);

        if (!title) { alert('请输入标题'); return; }

        if (id) {
            const index = historyData.findIndex(h => h.id == id);
            if (index !== -1) historyData[index] = { ...historyData[index], type, title, content, attachment, status };
        } else {
            const newId = Math.max(...historyData.map(h => h.id), 0) + 1;
            historyData.push({ id: newId, type, title, content, attachment, status });
        }
        localStorage.setItem('historyData', JSON.stringify(historyData));
        bootstrap.Modal.getInstance(document.getElementById('addHistoryModal')).hide();
        resetForm();
        initTable();
        alert('保存成功！');
    });

    $('#historyTable').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const item = historyData.find(h => h.id == id);
        if (item) {
            document.getElementById('historyId').value = item.id;
            document.getElementById('historyType').value = item.type;
            document.getElementById('historyTitle').value = item.title;
            document.getElementById('historyContent').value = item.content || '';
            document.getElementById('historyAttachment').value = item.attachment || '';
            document.getElementById('historyStatus').value = item.status;
            new bootstrap.Modal(document.getElementById('addHistoryModal')).show();
        }
    });

    $('#historyTable').on('click', '.btn-toggle', function() {
        const id = $(this).data('id');
        const index = historyData.findIndex(h => h.id == id);
        if (index !== -1) {
            historyData[index].status = historyData[index].status == 1 ? 0 : 1;
            localStorage.setItem('historyData', JSON.stringify(historyData));
            initTable();
        }
    });

    $('#historyTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (confirm('确定要删除吗？')) {
            historyData = historyData.filter(h => h.id != id);
            localStorage.setItem('historyData', JSON.stringify(historyData));
            initTable();
        }
    });

    function resetForm() {
        document.getElementById('historyForm').reset();
        document.getElementById('historyId').value = '';
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
