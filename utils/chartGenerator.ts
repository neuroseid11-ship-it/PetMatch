import { ChartConfiguration } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export class ChartGenerator {
    private canvas: ChartJSNodeCanvas;

    constructor(width = 600, height = 400) {
        this.canvas = new ChartJSNodeCanvas({
            width,
            height,
            backgroundColour: 'white'
        });
    }

    // Gráfico de Pizza
    async generatePieChart(data: { labels: string[]; values: number[]; colors?: string[] }, title: string): Promise<Buffer> {
        const configuration: ChartConfiguration = {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors || ['#55a630', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        color: '#5d2e0a'
                    },
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 }, color: '#5d2e0a' }
                    }
                }
            }
        };

        return await this.canvas.renderToBuffer(configuration);
    }

    // Gráfico de Barras
    async generateBarChart(data: { labels: string[]; values: number[]; color?: string }, title: string): Promise<Buffer> {
        const configuration: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total',
                    data: data.values,
                    backgroundColor: data.color || '#55a630',
                    borderColor: '#3d7a22',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        color: '#5d2e0a'
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#5d2e0a' }
                    },
                    x: {
                        ticks: { color: '#5d2e0a' }
                    }
                }
            }
        };

        return await this.canvas.renderToBuffer(configuration);
    }

    // Gráfico de Barras Horizontais (para rankings)
    async generateHorizontalBarChart(data: { labels: string[]; values: number[]; color?: string }, title: string): Promise<Buffer> {
        const configuration: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'XP',
                    data: data.values,
                    backgroundColor: data.color || '#0284c7',
                    borderColor: '#0369a1',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        color: '#5d2e0a'
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { color: '#5d2e0a' }
                    },
                    y: {
                        ticks: { color: '#5d2e0a' }
                    }
                }
            }
        };

        return await this.canvas.renderToBuffer(configuration);
    }

    // Gráfico de Linhas (tendências)
    async generateLineChart(data: { labels: string[]; values: number[]; color?: string }, title: string): Promise<Buffer> {
        const configuration: ChartConfiguration = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total',
                    data: data.values,
                    borderColor: data.color || '#55a630',
                    backgroundColor: `${data.color || '#55a630'}33`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        color: '#5d2e0a'
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#5d2e0a' }
                    },
                    x: {
                        ticks: { color: '#5d2e0a' }
                    }
                }
            }
        };

        return await this.canvas.renderToBuffer(configuration);
    }

    // Gráfico de Donnut (variação pizza com buraco no meio)
    async generateDoughnutChart(data: { labels: string[]; values: number[]; colors?: string[] }, title: string): Promise<Buffer> {
        const configuration: ChartConfiguration = {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors || ['#55a630', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: { size: 18, weight: 'bold' },
                        color: '#5d2e0a'
                    },
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 }, color: '#5d2e0a' }
                    }
                }
            }
        };

        return await this.canvas.renderToBuffer(configuration);
    }
}

export default ChartGenerator;
