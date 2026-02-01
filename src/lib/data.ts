export const salesData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
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

export const clients = [
    { id: 'CLT001', name: 'Innovate Inc.', email: 'contact@innovate.com', phone: '123-456-7890', company: 'Innovate Inc.' },
    { id: 'CLT002', name: 'Solutions Co.', email: 'info@solutions.co', phone: '234-567-8901', company: 'Solutions Co.' },
    { id: 'CLT003', name: 'Synergy Corp', email: 'support@synergy.com', phone: '345-678-9012', company: 'Synergy Corp' },
    { id: 'CLT004', name: 'Quantum Ltd.', email: 'hello@quantum.ltd', phone: '456-789-0123', company: 'Quantum Ltd.' },
    { id: 'CLT005', name: 'Apex Enterprises', email: 'admin@apex.com', phone: '567-890-1234', company: 'Apex Enterprises' },
    { id: 'CLT006', name: 'Pinnacle Group', email: 'contact@pinnacle.com', phone: '678-901-2345', company: 'Pinnacle Group' },
    { id: 'CLT007', name: 'Fusion Dynamics', email: 'info@fusion.com', phone: '789-012-3456', company: 'Fusion Dynamics' },
]

export const payments = [
  { invoiceId: 'INV001', client: 'Innovate Inc.', amount: '$250.00', status: 'Paid', date: '2023-01-15' },
  { invoiceId: 'INV002', client: 'Solutions Co.', amount: '$150.00', status: 'Pending', date: '2023-02-20' },
  { invoiceId: 'INV003', client: 'Synergy Corp', amount: '$350.00', status: 'Paid', date: '2023-03-10' },
  { invoiceId: 'INV004', client: 'Quantum Ltd.', amount: '$450.00', status: 'Overdue', date: '2023-02-28' },
  { invoiceId: 'INV005', client: 'Apex Enterprises', amount: '$550.00', status: 'Paid', date: '2023-04-05' },
  { invoiceId: 'INV006', client: 'Pinnacle Group', amount: '$200.00', status: 'Pending', date: '2023-05-12' },
  { invoiceId: 'INV007', client: 'Fusion Dynamics', amount: '$600.00', status: 'Paid', date: '2023-06-18' },
];

export const invoices = [
  { invoice: 'INV001', clientName: 'Innovate Inc.', amount: '$250.00', status: 'Paid', dueDate: '2023-01-15' },
  { invoice: 'INV002', clientName: 'Solutions Co.', amount: '$150.00', status: 'Pending', dueDate: '2023-02-20' },
  { invoice: 'INV003', clientName: 'Synergy Corp', amount: '$350.00', status: 'Paid', dueDate: '2023-03-10' },
  { invoice: 'INV004', clientName: 'Quantum Ltd.', amount: '$450.00', status: 'Overdue', dueDate: '2023-02-28' },
  { invoice: 'INV005', clientName: 'Apex Enterprises', amount: '$550.00', status: 'Paid', dueDate: '2023-04-05' },
  { invoice: 'INV006', clientName: 'Pinnacle Group', amount: '$200.00', status: 'Pending', dueDate: '2023-05-12' },
  { invoice: 'INV007', clientName: 'Fusion Dynamics', amount: '$600.00', status: 'Paid', dueDate: '2023-06-18' },
];
