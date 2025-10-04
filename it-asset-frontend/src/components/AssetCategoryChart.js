import React from 'react';
import { Chart } from 'primereact/chart';

const AssetCategoryChart = ({ data }) => {
    const chartData = {
        labels: data.map(item => item.categoryName),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: [
                    '#42A5F5', '#66BB6A', '#FFA726', '#26A69A', '#AB47BC', 
                    '#EC407A', '#78909C', '#FF7043', '#5C6BC0', '#8D6E63'
                ],
                hoverBackgroundColor: [
                    '#64B5F6', '#81C784', '#FFB74D', '#4DB6AC', '#BA68C8',
                    '#F06292', '#90A4AE', '#FF8A65', '#7986CB', '#A1887F'
                ]
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: '#495057'
                }
            }
        }
    };

    return (
        <div className="card flex justify-content-center">
            <Chart type="pie" data={chartData} options={chartOptions} style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: 'auto' }} />
        </div>
    );
}

export default AssetCategoryChart;