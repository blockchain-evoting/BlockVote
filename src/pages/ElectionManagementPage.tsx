import React from 'react';
import ElectionManagement from '../components/ElectionManagement';

const ElectionManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Election Management</h1>
        <ElectionManagement />
      </div>
    </div>
  );
};

export default ElectionManagementPage;
