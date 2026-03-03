
// Global Variables
let currentSection = 'dashboard';
let charts = {};
let isSidebarOpen = false;

// Chart Configuration
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#a3a8b8',
                font: {
                    family: 'Inter',
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: '#1a1d26',
            titleColor: '#ffffff',
            bodyColor: '#a3a8b8',
            borderColor: '#2d3340',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: {
                color: '#2d3340'
            },
            ticks: {
                color: '#a3a8b8'
            }
        },
        y: {
            grid: {
                color: '#2d3340'
            },
            ticks: {
                color: '#a3a8b8'
            }
        }
    }
};

// Sample Data
const sampleData = {
    sales: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Vendas (R$)',
            data: [65000, 59000, 80000, 81000, 56000, 55000, 87000, 94000, 76000, 89000, 95000, 102000],
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    leads: {
        labels: ['WhatsApp', 'Instagram', 'Facebook', 'Site', 'Email', 'Telefone'],
        datasets: [{
            data: [35, 25, 20, 10, 7, 3],
            backgroundColor: [
                '#25d366',
                '#e1306c',
                '#1877f2',
                '#00d4ff',
                '#f59e0b',
                '#10b981'
            ],
            borderWidth: 0
        }]
    },
    analytics: {
        line: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Receita',
                data: [120000, 190000, 300000, 500000, 200000, 300000],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                tension: 0.4
            }, {
                label: 'Lucro',
                data: [80000, 120000, 180000, 300000, 120000, 180000],
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                tension: 0.4
            }]
        },
        bar: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: 'Vendas',
                data: [450000, 520000, 380000, 670000],
                backgroundColor: ['#00d4ff', '#7c3aed', '#f59e0b', '#10b981']
            }]
        },
        pie: {
            labels: ['Produtos', 'Serviços', 'Consultorias', 'Outros'],
            datasets: [{
                data: [40, 30, 20, 10],
                backgroundColor: ['#00d4ff', '#7c3aed', '#f59e0b', '#10b981']
            }]
        },
        radar: {
            labels: ['Vendas', 'Marketing', 'Suporte', 'Produto', 'RH', 'TI'],
            datasets: [{
                label: 'Performance',
                data: [85, 75, 90, 80, 70, 95],
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.2)'
            }]
        },
        scatter: {
            datasets: [{
                label: 'ROI vs Investimento',
                data: [
                    {x: 10000, y: 25000},
                    {x: 15000, y: 35000},
                    {x: 20000, y: 50000},
                    {x: 25000, y: 45000},
                    {x: 30000, y: 70000},
                    {x: 35000, y: 80000}
                ],
                backgroundColor: '#00d4ff'
            }]
        },
        bubble: {
            datasets: [{
                label: 'Campanhas',
                data: [
                    {x: 20, y: 30, r: 15},
                    {x: 40, y: 10, r: 10},
                    {x: 50, y: 50, r: 20},
                    {x: 70, y: 40, r: 25}
                ],
                backgroundColor: 'rgba(0, 212, 255, 0.6)'
            }]
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    showSection('dashboard');
});

// Chart Initialization
function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: sampleData.sales,
            options: {
                ...chartConfig,
                plugins: {
                    ...chartConfig.plugins,
                    title: {
                        display: false
                    }
                }
            }
        });
    }

    // Leads Chart
    const leadsCtx = document.getElementById('leadsChart');
    if (leadsCtx) {
        charts.leads = new Chart(leadsCtx, {
            type: 'doughnut',
            data: sampleData.leads,
            options: {
                ...chartConfig,
                plugins: {
                    ...chartConfig.plugins,
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a3a8b8',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Analytics Chart
    const analyticsCtx = document.getElementById('analyticsChart');
    if (analyticsCtx) {
        charts.analytics = new Chart(analyticsCtx, {
            type: 'line',
            data: sampleData.analytics.line,
            options: {
                ...chartConfig,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    ...chartConfig.plugins,
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#a3a8b8',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
}

// Event Listeners
function setupEventListeners() {
    // Resize handler for charts
    window.addEventListener('resize', function() {
        Object.values(charts).forEach(chart => {
            if (chart) chart.resize();
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    switchSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    switchSection('analytics');
                    break;
                case '3':
                    e.preventDefault();
                    switchSection('chat');
                    break;
            }
        }
    });
}

// Navigation Functions
function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event?.target?.closest('.nav-item')?.classList.add('active') || 
    document.querySelector(`[onclick*="${section}"]`)?.classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${section}-section`).classList.add('active');

    // Update header
    const titles = {
        dashboard: 'Dashboard',
        analytics: 'Analytics Avançado',
        chat: 'Chat & VoIP',
        crm: 'CRM',
        financeiro: 'Financeiro',
        estoque: 'Estoque',
        tarefas: 'Tarefas'
    };
    
    document.getElementById('section-title').textContent = titles[section];
    document.getElementById('breadcrumb-current').textContent = titles[section];
    
    currentSection = section;

    // Resize charts when switching to analytics
    if (section === 'analytics' && charts.analytics) {
        setTimeout(() => charts.analytics.resize(), 100);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        sidebar.classList.add('open');
    } else {
        sidebar.classList.remove('open');
    }
}

// Chart Functions
function updateChart(chartId, type) {
    const chart = charts[chartId.replace('Chart', '')];
    if (!chart) return;

    chart.config.type = type;
    chart.update();
}

function changeChartType() {
    const selector = document.getElementById('chartTypeSelector');
    const chartType = selector.value;
    const chart = charts.analytics;
    
    if (!chart) return;

    // Destroy existing chart
    chart.destroy();

    // Create new chart with selected type
    const ctx = document.getElementById('analyticsChart');
    let newData = sampleData.analytics.line;
    let newOptions = { ...chartConfig };

    switch(chartType) {
        case 'bar':
        case 'horizontalBar':
            newData = sampleData.analytics.bar;
            if (chartType === 'horizontalBar') {
                newOptions.indexAxis = 'y';
            }
            break;
        case 'pie':
        case 'doughnut':
        case 'polarArea':
            newData = sampleData.analytics.pie;
            newOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a3a8b8',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            };
            break;
        case 'radar':
            newData = sampleData.analytics.radar;
            newOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: '#2d3340'
                        },
                        pointLabels: {
                            color: '#a3a8b8'
                        },
                        ticks: {
                            color: '#a3a8b8'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#a3a8b8'
                        }
                    }
                }
            };
            break;
        case 'scatter':
            newData = sampleData.analytics.scatter;
            newOptions.scales.x.title = {
                display: true,
                text: 'Investimento (R$)',
                color: '#a3a8b8'
            };
            newOptions.scales.y.title = {
                display: true,
                text: 'ROI (R$)',
                color: '#a3a8b8'
            };
            break;
        case 'bubble':
            newData = sampleData.analytics.bubble;
            break;
        case 'area':
            chartType = 'line';
            newData = {
                ...sampleData.analytics.line,
                datasets: sampleData.analytics.line.datasets.map(dataset => ({
                    ...dataset,
                    fill: true
                }))
            };
            break;
        case 'mixed':
            chartType = 'bar';
            newData = {
                labels: sampleData.analytics.line.labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'Receita',
                        data: sampleData.analytics.line.datasets[0].data,
                        borderColor: '#00d4ff',
                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        type: 'bar',
                        label: 'Vendas',
                        data: [80, 120, 200, 300, 150, 200],
                        backgroundColor: '#7c3aed',
                        yAxisID: 'y1'
                    }
                ]
            };
            newOptions.scales.y1 = {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                    color: '#2d3340'
                },
                ticks: {
                    color: '#a3a8b8'
                }
            };
            break;
        case 'funnel':
            chartType = 'bar';
            newData = {
                labels: ['Visitantes', 'Leads', 'Oportunidades', 'Propostas', 'Vendas'],
                datasets: [{
                    label: 'Funil de Vendas',
                    data: [10000, 3000, 1000, 500, 200],
                    backgroundColor: [
                        '#00d4ff',
                        '#7c3aed',
                        '#f59e0b',
                        '#10b981',
                        '#ef4444'
                    ]
                }]
            };
            newOptions.indexAxis = 'y';
            break;
    }

    charts.analytics = new Chart(ctx, {
        type: chartType,
        data: newData,
        options: newOptions
    });
}

// Data Management Functions
function fetchDataFromAPI(endpoint) {
    // Simulated API call - replace with actual backend integration
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(sampleData);
        }, 1000);
    });
}

function updateDashboardStats() {
    // Simulate real-time data updates
    const stats = document.querySelectorAll('.stat-content h3');
    stats.forEach(stat => {
        const currentValue = parseFloat(stat.textContent.replace(/[^\d.-]/g, ''));
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const newValue = currentValue * (1 + variation);
        
        if (stat.textContent.includes('R$')) {
            stat.textContent = `R$ ${newValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}`;
        } else if (stat.textContent.includes('%')) {
            stat.textContent = `${newValue.toFixed(1)}%`;
        } else {
            stat.textContent = Math.round(newValue).toLocaleString('pt-BR');
        }
    });
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: var(--text-primary);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-lg);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Auto-update dashboard every 30 seconds
setInterval(() => {
    if (currentSection === 'dashboard') {
        updateDashboardStats();
    }
}, 30000);

// Export functions for global access
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;
window.updateChart = updateChart;
window.changeChartType = changeChartType;
window.showNotification = showNotification;

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Theme management (for future implementation)
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('crm-theme', theme);
}

function getTheme() {
    return localStorage.getItem('crm-theme') || 'dark';
}

// Initialize theme
setTheme(getTheme());

console.log('🚀 CRM Pro 2050 initialized successfully!');
