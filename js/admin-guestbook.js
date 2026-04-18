// 留言管理脚本
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    let guestbookData = JSON.parse(localStorage.getItem('guestbookData')) || [
        { id: 1, name: '张三', email: 'zhang@example.com', message: '咨询产品价格', date: '2024-01-15', replied: true, reply: '已发送报价单' },
        { id: 2, name: '李四', email: 'li@example.com', message: '招聘相关信息', date: '2024-01-14', replied: false, reply: null },
        { id: 3, name: '王五', email: 'wang@example.com', message: '合作意向咨询', date: '2024-01-13', replied: false, reply: null }
    ];

    let dataTable;
    let deleteId = null;

    function initTable() {
        if (dataTable) dataTable.destroy();
        $('#guestbookTable').DataTable({
            data: guestbookData,
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'email' },
                { data: 'message', render: function(d){return d?(d.length>25?d.substring(0,25)+'...':d):'-';} },
                { data: 'date' },
                { data: 'replied', render: function(d){return d?'<span class="badge bg-success">已回复</span>':'<span class="badge bg-warning">未回复</span>';} },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `<div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-${row.replied?'info':'primary'} btn-reply" data-id="${row.id}">${row.replied?'查看':'回复'}</button>
                            <button class="btn btn-outline-danger btn-delete" data-id="${row.id}"><i class="fas fa-trash"></i></button>
                        </div>`;
                    }
                }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/zh-CN.json' },
            pageLength: 10
        });
        dataTable = $('#guestbookTable').DataTable();
    }

    // 回复按钮
    $('#guestbookTable').on('click', '.btn-reply', function() {
        const id = $(this).data('id');
        const item = guestbookData.find(g => g.id == id);
        if (item) {
            const tr = $(this).closest('tr');
            const existingRow = tr.next('.reply-row');
            
            if (existingRow.length > 0) {
                existingRow.remove();
                return;
            }
            
            let replyContent = '';
            if (item.replied && item.reply) {
                replyContent = `<div class="alert alert-success mb-0"><strong>已回复:</strong> ${item.reply}</div>`;
            } else {
                replyContent = `
                    <div class="p-3">
                        <div class="input-group">
                            <input type="text" class="form-control reply-input" placeholder="输入回复内容..." data-id="${id}">
                            <button class="btn btn-primary btn-send-reply" data-id="${id}"><i class="fas fa-paper-plane"></i> 发送</button>
                        </div>
                    </div>
                `;
            }
            
            tr.after(`<tr class="reply-row table-row-details"><td colspan="7">${replyContent}</td></tr>`);
        }
    });

    // 发送回复
    $('#guestbookTable').on('click', '.btn-send-reply', function() {
        const id = $(this).data('id');
        const input = $(`.reply-input[data-id="${id}"]`);
        const reply = input.val().trim();
        
        if (!reply) {
            alert('请输入回复内容');
            return;
        }
        
        const index = guestbookData.findIndex(g => g.id == id);
        if (index !== -1) {
            guestbookData[index].replied = true;
            guestbookData[index].reply = reply;
            localStorage.setItem('guestbookData', JSON.stringify(guestbookData));
            initTable();
            alert('回复成功！');
        }
    });

    // 删除按钮
    $('#guestbookTable').on('click', '.btn-delete', function() {
        deleteId = $(this).data('id');
        new bootstrap.Modal(document.getElementById('deleteModal')).show();
    });

    document.getElementById('confirmDelete').addEventListener('click', function() {
        if (deleteId) {
            guestbookData = guestbookData.filter(g => g.id != deleteId);
            localStorage.setItem('guestbookData', JSON.stringify(guestbookData));
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            initTable();
            deleteId = null;
        }
    });

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('show');
            document.getElementById('mainContent').classList.toggle('expanded');
        });
    }

    initTable();
});
