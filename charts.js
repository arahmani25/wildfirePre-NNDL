/**
 * WildfireGuard AI - Interactive Charts
 * Powered by Chart.js - Data visualizations for EDA and model performance
 */

// Nature-themed color palette
const colors = {
    forest: '#2d5016',
    leaf: '#56ab2f',
    fire: '#e63946',
    orange: '#f77f00',
    sky: '#48cae4',
    earth: '#8b4513',
    moss: '#8fbc8f',
    smoke: '#696969'
};

// Initialize all charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initClassDistributionChart();
    initDatasetSplitChart();
    initRGBAnalysisChart();
    initMetricsChart();
    initTrainingHistoryChart();
    initModelComparisonChart();
    
    console.log('📊 All charts initialized successfully');
});

/**
 * Class Distribution Pie Chart
 */
function initClassDistributionChart() {
    const ctx = document.getElementById('classDistributionChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Wildfire Images', 'No Wildfire Images'],
            datasets: [{
                data: [22710, 20140],
                backgroundColor: [colors.fire, colors.leaf],
                borderColor: ['#fff', '#fff'],
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' },
                        color: '#2d3748'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Dataset Split Bar Chart
 */
function initDatasetSplitChart() {
    const ctx = document.getElementById('datasetSplitChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Training', 'Validation', 'Test'],
            datasets: [
                {
                    label: 'Wildfire',
                    data: [15750, 3480, 3480],
                    backgroundColor: colors.fire,
                    borderRadius: 8
                },
                {
                    label: 'No Wildfire',
                    data: [14500, 2820, 2820],
                    backgroundColor: colors.leaf,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    grid: { display: false }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

/**
 * RGB Channel Analysis Chart
 */
function initRGBAnalysisChart() {
    const ctx = document.getElementById('rgbAnalysisChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Red Channel', 'Green Channel', 'Blue Channel', 'Brightness', 'Contrast', 'Saturation'],
            datasets: [
                {
                    label: 'Wildfire Images',
                    data: [185, 120, 95, 140, 155, 145],
                    backgroundColor: 'rgba(230, 57, 70, 0.2)',
                    borderColor: colors.fire,
                    borderWidth: 3,
                    pointBackgroundColor: colors.fire,
                    pointBorderColor: '#fff',
                    pointRadius: 5
                },
                {
                    label: 'No Wildfire Images',
                    data: [110, 145, 125, 130, 125, 115],
                    backgroundColor: 'rgba(86, 171, 47, 0.2)',
                    borderColor: colors.leaf,
                    borderWidth: 3,
                    pointBackgroundColor: colors.leaf,
                    pointBorderColor: '#fff',
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 200,
                    ticks: {
                        stepSize: 50
                    }
                }
            }
        }
    });
}

/**
 * Model Performance Metrics Bar Chart
 */
function initMetricsChart() {
    const ctx = document.getElementById('metricsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC'],
            datasets: [{
                label: 'Score',
                data: [0.952, 0.948, 0.956, 0.952, 0.982],
                backgroundColor: [
                    colors.leaf,
                    colors.forest,
                    colors.moss,
                    colors.sky,
                    colors.orange
                ],
                borderRadius: 8,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Training History Line Chart
 */
function initTrainingHistoryChart() {
    const ctx = document.getElementById('trainingHistoryChart');
    if (!ctx) return;
    
    const epochs = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: epochs,
            datasets: [
                {
                    label: 'Training Accuracy',
                    data: [0.72, 0.82, 0.87, 0.90, 0.92, 0.93, 0.94, 0.945, 0.950, 0.952, 0.954],
                    borderColor: colors.forest,
                    backgroundColor: 'rgba(45, 80, 22, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Validation Accuracy',
                    data: [0.70, 0.80, 0.85, 0.88, 0.90, 0.91, 0.92, 0.925, 0.930, 0.940, 0.952],
                    borderColor: colors.leaf,
                    backgroundColor: 'rgba(86, 171, 47, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0,
                    ticks: {
                        callback: function(value) {
                            return (value * 100).toFixed(0) + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Epoch',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

/**
 * Model Comparison Chart
 */
function initModelComparisonChart() {
    const ctx = document.getElementById('modelComparisonChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Our CNN', 'ResNet50', 'VGG16', 'MobileNet', 'Basic CNN'],
            datasets: [{
                label: 'Accuracy (%)',
                data: [95.2, 96.1, 94.8, 93.5, 88.3],
                backgroundColor: [
                    colors.leaf,
                    colors.sky,
                    colors.orange,
                    colors.moss,
                    colors.smoke
                ],
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Accuracy: ${context.parsed.x.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Add animation to charts on scroll
 */
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

// Observe all canvas elements
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.style.opacity = '0';
        canvas.style.transform = 'translateY(20px)';
        canvas.style.transition = 'all 0.6s ease-out';
        chartObserver.observe(canvas);
    });
});
