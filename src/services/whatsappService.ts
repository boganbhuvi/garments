import { Order, WhatsAppNotificationRecord } from '../types/order';

export type WhatsAppTemplateId = 
  | 'ORDER_BOOKED'
  | 'CUTTING_STARTED'
  | 'CUTTING_COMPLETED'
  | 'STITCHING_STARTED'
  | 'STITCHING_COMPLETED'
  | 'QC_COMPLETED'
  | 'READY_FOR_PICKUP'
  | 'ORDER_DELIVERED'
  | 'DELIVERY_REMINDER';

export interface WhatsAppTemplate {
  id: WhatsAppTemplateId;
  title: string;
  stage: string;
  defaultText: (order: Order) => string;
}

/**
 * 9 Standard Enterprise WhatsApp Templates for Giriraj Garments ERP
 */
export const WHATSAPP_TEMPLATES: Record<WhatsAppTemplateId, WhatsAppTemplate> = {
  ORDER_BOOKED: {
    id: 'ORDER_BOOKED',
    title: '1. Order Booked',
    stage: 'Front Desk',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      const priority = order.billing.priority || 'Normal';
      const dueDate = order.billing.dueDate || 'Soon';
      return `Hello ${name}, your order ${billNo} has been successfully booked at Giriraj Garments.\n\nPriority: ${priority}\nExpected Delivery: ${dueDate}\n\nThank you!`;
    }
  },

  CUTTING_STARTED: {
    id: 'CUTTING_STARTED',
    title: '2. Cutting Started',
    stage: 'Cutting Dept',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, cutting has started for your order ${billNo}.`;
    }
  },

  CUTTING_COMPLETED: {
    id: 'CUTTING_COMPLETED',
    title: '3. Cutting Completed',
    stage: 'Cutting Dept',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, cutting is completed for your order ${billNo}.\nYour garments are moving to the next stage.`;
    }
  },

  STITCHING_STARTED: {
    id: 'STITCHING_STARTED',
    title: '4. Stitching Started',
    stage: 'Stitching Dept',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, stitching has started for your order ${billNo}.`;
    }
  },

  STITCHING_COMPLETED: {
    id: 'STITCHING_COMPLETED',
    title: '5. Stitching Completed',
    stage: 'Stitching Dept',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, stitching is completed for your order ${billNo}.\nYour garments are moving to quality checking.`;
    }
  },

  QC_COMPLETED: {
    id: 'QC_COMPLETED',
    title: '6. QC Completed',
    stage: 'QC & Audit',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, quality checking is completed for order ${billNo}.`;
    }
  },

  READY_FOR_PICKUP: {
    id: 'READY_FOR_PICKUP',
    title: '7. Ready for Pickup',
    stage: 'Dispatch & Delivery',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Hello ${name}, your order ${billNo} is ready for pickup at Giriraj Garments.`;
    }
  },

  ORDER_DELIVERED: {
    id: 'ORDER_DELIVERED',
    title: '8. Order Delivered',
    stage: 'Dispatch & Delivery',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      return `Thank you, ${name}, for choosing Giriraj Garments. Your order ${billNo} has been successfully delivered.`;
    }
  },

  DELIVERY_REMINDER: {
    id: 'DELIVERY_REMINDER',
    title: '9. Delivery Reminder',
    stage: 'Customer Followup',
    defaultText: (order: Order) => {
      const name = order.customer.customerName || 'Customer';
      const billNo = order.customer.billNumber || order.id;
      const dueDate = order.billing.dueDate || 'Today';
      return `Hello ${name}, your order ${billNo} is scheduled for delivery on ${dueDate}.\nPlease contact us for any assistance.`;
    }
  }
};

/**
 * Format Indian phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Open WhatsApp click-to-chat with pre-filled message
 */
export function sendWhatsAppNotification(rawPhone: string, message: string): boolean {
  if (!rawPhone || !rawPhone.trim()) {
    return false;
  }
  const formattedPhone = formatPhoneForWhatsApp(rawPhone);
  const encodedText = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Helper to get recommended template from an order's current status
 */
export function getRecommendedTemplateForStatus(status: string): WhatsAppTemplateId {
  switch (status) {
    case 'IN_CUTTING':
      return 'CUTTING_STARTED';
    case 'CUTTING_COMPLETED':
      return 'CUTTING_COMPLETED';
    case 'IN_STITCHING':
      return 'STITCHING_STARTED';
    case 'READY_FOR_QC':
    case 'IN_QC':
      return 'STITCHING_COMPLETED';
    case 'READY_FOR_DISPATCH':
    case 'READY_FOR_TRIAL':
      return 'READY_FOR_PICKUP';
    case 'DELIVERED':
    case 'COMPLETED':
      return 'ORDER_DELIVERED';
    case 'NEW':
    default:
      return 'ORDER_BOOKED';
  }
}

/**
 * Generate standard order booking / confirmation WhatsApp message
 */
export function generateOrderConfirmationWhatsAppMessage(order: Order): string {
  return WHATSAPP_TEMPLATES.ORDER_BOOKED.defaultText(order);
}

/**
 * Generate standard status change WhatsApp message based on order and status
 */
export function generateStatusWhatsAppMessage(order: Order, status: string, remarks?: string): string {
  const templateId = getRecommendedTemplateForStatus(status);
  const template = WHATSAPP_TEMPLATES[templateId] || WHATSAPP_TEMPLATES.ORDER_BOOKED;
  let text = template.defaultText(order);
  if (remarks && remarks.trim()) {
    text += `\n\nNote: ${remarks.trim()}`;
  }
  return text;
}
