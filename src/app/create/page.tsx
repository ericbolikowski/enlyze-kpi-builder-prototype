'use client';

import React from 'react';
import KpiFormContainer from '@/components/KpiFormContainer';

export default function CreateKpi() {
  return (
    <KpiFormContainer 
      title="Create New KPI"
      isEditMode={false}
    />
  );
} 