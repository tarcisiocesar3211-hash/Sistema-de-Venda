export const salesData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Fev', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Abr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mai', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Ago', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Set', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Out', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dez', total: Math.floor(Math.random() * 5000) + 1000 },
];

export const recentSales = [
    {
        name: 'Olivia Martin',
        email: 'olivia.martin@email.com',
        amount: '+$1,999.00',
    },
    {
        name: 'Jackson Lee',
        email: 'jackson.lee@email.com',
        amount: '+$39.00',
    },
    {
        name: 'Isabella Nguyen',
        email: 'isabella.nguyen@email.com',
        amount: '+$299.00',
    },
    {
        name: 'William Kim',
        email: 'will@email.com',
        amount: '+$99.00',
    },
    {
        name: 'Sofia Davis',
        email: 'sofia.davis@email.com',
        amount: '+$39.00',
    },
]

export const plans = [
    { id: 'plan_01', name: 'Básico', price: 'R$ 49,90/mês' },
    { id: 'plan_02', name: 'Pro', price: 'R$ 99,90/mês' },
    { id: 'plan_03', name: 'Empresarial', price: 'R$ 199,90/mês' },
];

export const clients = [
    { id: 'CLT001', name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890', planId: 'plan_01' },
    { id: 'CLT002', name: 'Solutions Co.', email: 'info@solutions.co', phone: '234-567-8901', planId: 'plan_02' },
    { id: 'CLT003', name: 'Synergy Corp', email: 'support@synergy.com', phone: '345-678-9012', planId: 'plan_01' },
    { id: 'CLT004', name: 'Quantum Ltd.', email: 'hello@quantum.ltd', phone: '456-789-0123', planId: 'plan_03' },
    { id: 'CLT005', name: 'Apex Enterprises', email: 'admin@apex.com', phone: '567-890-1234', planId: 'plan_02' },
    { id: 'CLT006', name: 'Pinnacle Group', email: 'contact@pinnacle.com', phone: '678-901-2345', planId: 'plan_01' },
    { id: 'CLT007', name: 'Fusion Dynamics', email: 'info@fusion.com', phone: '789-012-3456', planId: 'plan_03' },
]

export const payments = [
  { invoiceId: 'INV001', client: 'Innovate Inc.', amount: '$250.00', status: 'Pago', date: '2023-01-15' },
  { invoiceId: 'INV002', client: 'Solutions Co.', amount: '$150.00', status: 'Pendente', date: '2023-02-20' },
  { invoiceId: 'INV003', client: 'Synergy Corp', amount: '$350.00', status: 'Pago', date: '2023-03-10' },
  { invoiceId: 'INV004', client: 'Quantum Ltd.', amount: '$450.00', status: 'Atrasado', date: '2023-02-28' },
  { invoiceId: 'INV005', client: 'Apex Enterprises', amount: '$550.00', status: 'Pago', date: '2023-04-05' },
  { invoiceId: 'INV006', client: 'Pinnacle Group', amount: '$200.00', status: 'Pendente', date: '2023-05-12' },
  { invoiceId: 'INV007', client: 'Fusion Dynamics', amount: '$600.00', status: 'Pago', date: '2023-06-18' },
];

export const invoices = [
  { invoice: 'INV001', clientName: 'Innovate Inc.', amount: '$250.00', status: 'Pago', dueDate: '2023-01-15' },
  { invoice: 'INV002', clientName: 'Solutions Co.', amount: '$150.00', status: 'Pendente', dueDate: '2023-02-20' },
  { invoice: 'INV003', clientName: 'Synergy Corp', amount: '$350.00', status: 'Pago', dueDate: '2023-03-10' },
  { invoice: 'INV004', clientName: 'Quantum Ltd.', amount: '$450.00', status: 'Atrasado', dueDate: '2023-02-28' },
  { invoice: 'INV005', clientName: 'Apex Enterprises', amount: '$550.00', status: 'Pago', dueDate: '2023-04-05' },
  { invoice: 'INV006', clientName: 'Pinnacle Group', amount: '$200.00', status: 'Pendente', dueDate: '2023-05-12' },
  { invoice: 'INV007', clientName: 'Fusion Dynamics', amount: '$600.00', status: 'Pago', dueDate: '2023-06-18' },
];
