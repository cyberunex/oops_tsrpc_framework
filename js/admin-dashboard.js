// 后台管理仪表盘脚本
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 加载用户信息
    const user = JSON.parse(localStorage.getItem('adminUser') || '{"username":"Admin","avatar":"https://ui-avatars.com/api/?name=Admin"}');
    document.getElementById('userName').textContent = user.username;
    document.getElementById('userAvatar').src = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.username);

    // 侧边栏切换
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    sidebarToggle.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('show');
        } else {
            sidebar.classList.toggle('show');
            mainContent.classList.toggle('expanded');
        }
    });

    // 初始化 ECharts 图表
    initVisitChart();
    initDeviceChart();

    // 访问趋势图表
    function initVisitChart() {
        const chartDom = document.getElementById('visitChart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        const option = {
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['IP', 'PV', 'UV']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'IP',
                    type: 'line',
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    smooth: true
                },
                {
                    name: 'PV',
                    type: 'line',
                    data: [1220, 1332, 1401, 1534, 1690, 1730, 1820],
                    smooth: true
                },
                {
                    name: 'UV',
                    type: 'line',
                    data: [620, 732, 801, 834, 990, 1030, 1120],
                    smooth: true
                }
            ]
        };
        myChart.setOption(option);

        // 响应式调整
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }

    // 设备分布图表
    function initDeviceChart() {
        const chartDom = document.getElementById('deviceChart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        const option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: '设备类型',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: 1048, name: '桌面端' },
                        { value: 735, name: '移动端' },
                        { value: 580, name: '平板' },
                        { value: 484, name: '其他' }
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);

        // 响应式调整
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }
});
