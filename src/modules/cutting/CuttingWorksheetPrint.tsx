import React from 'react';
import { Order } from '../../types/order';
import { GarmentWorksheets } from '../../components/print/GarmentWorksheets';

interface CuttingWorksheetPrintProps {
  order: Order;
  onClose: () => void;
  initialGarmentIndex?: number | 'ALL';
}

export const CuttingWorksheetPrint: React.FC<CuttingWorksheetPrintProps> = ({ 
  order, 
  onClose,
  initialGarmentIndex = 'ALL'
}) => {
  return (
    <GarmentWorksheets 
      order={order}
      isOpen={true}
      onClose={onClose}
      initialGarmentIndex={initialGarmentIndex}
    />
  );
};
