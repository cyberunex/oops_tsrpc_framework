// 产品管理脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 模拟产品数据
    let productsData = JSON.parse(localStorage.getItem('productsData')) || [
        { id: 1, category: 1, image: '/images/p1.jpg', title: '产品 A', desc: '优质产品 A 介绍', link: '#', images: '["/img1.jpg","/img2.jpg"]', status: 1 },
        { id: 2, category: 2, image: '/images/s1.jpg', title: '服务 B', desc: '专业服务 B 介绍', link: '#', images: '["/img3.jpg"]', status: 1 },
        { id: 3, category: 1, image: '/images/p2.jpg', title: '产品 C', desc: '创新产品 C 介绍', link: '#', images: '[]', status: 0 }
    ];

    let dataTable;

    // 初始化 DataTable
    function initTable() {
        if (dataTable) {
            dataTable.destroy();
        }

        $('#productsTable').DataTable({
            data: productsData,
            columns: [
                { data: 'id' },
                { 
                    data: 'category',
                    render: function(data) {
                        return data == 1 ? '<span class="badge bg-primary">产品</span>' : '<span class="badge bg-success">服务</span>';
                    }
                },
                { 
                    data: 'image',
                    render: function(data) {
                        return data ? `<img src="${data}" alt="" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">` : '-';
                    }
                },
                { data: 'title' },
                { 
                    data: 'desc',
                    render: function(data) {
                        return data ? (data.length > 30 ? data.substring(0, 30) + '...' : data) : '-';
                    }
                },
                { data: 'link' },
                { 
                    data: 'status',
                    render: function(data, type, row) {
                        return data == 1 
                            ? '<span class="badge bg-success">启用</span>' 
                            : '<span class="badge bg-secondary">停用</span>';
                    }
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary btn-edit" data-id="${row.id}"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-outline-${row.status == 1 ? 'warning' : 'success'} btn-toggle" data-id="${row.id}">${row.status == 1 ? '停用' : '启用'}</button>
                                <button class="btn btn-outline-danger btn-delete" data-id="${row.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        `;
                    }
                }
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/zh-CN.json'
            },
            pageLength: 10
        });

        dataTable = $('#productsTable').DataTable();
    }

    // 打开添加模态框
    document.querySelector('[data-bs-target="#addProductModal"]').addEventListener('click', function() {
        resetForm();
        document.getElementById('productModalTitle').textContent = '添加产品';
    });

    // 保存产品
    document.getElementById('saveProduct').addEventListener('click', function() {
        const id = document.getElementById('productId').value;
        const category = parseInt(document.getElementById('productCategory').value);
        const title = document.getElementById('productTitle').value.trim();
        const image = document.getElementById('productImage').value.trim();
        const desc = document.getElementById('productDesc').value.trim();
        const link = document.getElementById('productLink').value.trim();
        const images = document.getElementById('productImages').value.trim();
        const status = parseInt(document.getElementById('productStatus').value);

        if (!title) {
            alert('请输入标题');
            return;
        }

        if (id) {
            // 更新
            const index = productsData.findIndex(p => p.id == id);
            if (index !== -1) {
                productsData[index] = { ...productsData[index], category, title, image, desc, link, images, status };
            }
        } else {
            // 新增
            const newId = Math.max(...productsData.map(p => p.id), 0) + 1;
            productsData.push({ id: newId, category, title, image, desc, link, images, status });
        }

        localStorage.setItem('productsData', JSON.stringify(productsData));
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        resetForm();
        initTable();
        alert('保存成功！');
    });

    // 表格操作事件委托
    $('#productsTable').on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        const product = productsData.find(p => p.id == id);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productTitle').value = product.title;
            document.getElementById('productImage').value = product.image || '';
            document.getElementById('productDesc').value = product.desc || '';
            document.getElementById('productLink').value = product.link || '';
            document.getElementById('productImages').value = product.images || '[]';
            document.getElementById('productStatus').value = product.status;
            
            document.getElementById('productModalTitle').textContent = '编辑产品';
            const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
            modal.show();
        }
    });

    $('#productsTable').on('click', '.btn-toggle', function() {
        const id = $(this).data('id');
        const index = productsData.findIndex(p => p.id == id);
        if (index !== -1) {
            productsData[index].status = productsData[index].status == 1 ? 0 : 1;
            localStorage.setItem('productsData', JSON.stringify(productsData));
            initTable();
        }
    });

    $('#productsTable').on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (confirm('确定要删除该产品吗？')) {
            productsData = productsData.filter(p => p.id != id);
            localStorage.setItem('productsData', JSON.stringify(productsData));
            initTable();
        }
    });

    // 重置表单
    function resetForm() {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
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
    initTable();
});
