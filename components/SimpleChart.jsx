'use client';
import React from 'react';
import { useAppContext } from '@/context/AppContext';

const SimpleChart = ({ data, title, type = 'bar' }) => {
  const { currency } = useAppContext();
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...Object.values(data));
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

  const renderBarChart = () => (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 capitalize">{key}</span>
            <span className="font-medium">
              {typeof value === 'number' && value > 0 ? `${value}` : value}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${colors[index % colors.length]}`}
              style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{key}</span>
              <span className="font-medium">
                {typeof value === 'number' && value > 0 ? ` ${value.toFixed(0)}` : (value || 0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value], index) => (
        <div key={key} className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
          <div className="flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize">{key}</span>
              <span className="font-medium">
                {typeof value === 'number' && value > 0 ? `${currency || '$'} ${value.toFixed(2)}` : (value || 0)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-center justify-center">
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
};

export default SimpleChart; 