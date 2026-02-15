// =====================================================
// CSV Export Utilities
// =====================================================

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =====================================================
// Export Users to CSV
// =====================================================
export function exportUsersToCSV(users: any[]) {
  const exportData = users.map(user => ({
    'Name': user.name || '',
    'Email': user.email || '',
    'Phone': user.phone || '',
    'Reliability Score': user.reliabilityScore || 100,
    'Is Verified': user.isVerified ? 'Yes' : 'No',
    'Is Trusted': user.isTrusted ? 'Yes' : 'No',
    'Is Blocked': user.isBlocked ? 'Yes' : 'No',
    'Tasks Completed': user.totalTasksCompleted || 0,
    'Wishes Granted': user.totalWishesGranted || 0,
    'Listings Count': user.listingsCount || 0,
    'Created At': user.createdAt || '',
  }));
  
  exportToCSV(exportData, 'oldcycle_users');
}

// =====================================================
// Export Tasks to CSV
// =====================================================
export function exportTasksToCSV(tasks: any[]) {
  const exportData = tasks.map(task => ({
    'Title': task.title,
    'Description': task.description.substring(0, 100),
    'Price': task.price,
    'Status': task.status,
    'Category': task.categoryName,
    'City': task.cityName,
    'Area': task.areaName,
    'Is Negotiable': task.isNegotiable ? 'Yes' : 'No',
    'Time Window': task.timeWindow || 'N/A',
    'Created By': task.userName,
    'Created At': task.createdAt,
  }));
  
  exportToCSV(exportData, 'oldcycle_tasks');
}

// =====================================================
// Export Wishes to CSV
// =====================================================
export function exportWishesToCSV(wishes: any[]) {
  const exportData = wishes.map(wish => ({
    'Title': wish.title,
    'Description': wish.description.substring(0, 100),
    'Budget Min': wish.budgetMin || 'N/A',
    'Budget Max': wish.budgetMax || 'N/A',
    'Urgency': wish.urgency || 'N/A',
    'Category': wish.categoryName,
    'City': wish.cityName,
    'Area': wish.areaName,
    'Created By': wish.userName,
    'Created At': wish.createdAt,
  }));
  
  exportToCSV(exportData, 'oldcycle_wishes');
}

// =====================================================
// Export Reports to CSV
// =====================================================
export function exportReportsToCSV(reports: any[]) {
  const exportData = reports.map(report => ({
    'Listing ID': report.listingId || 'N/A',
    'Reason': report.reason,
    'Reported By': report.reportedBy,
    'Created At': report.createdAt,
    'Status': report.status || 'Pending',
  }));
  
  exportToCSV(exportData, 'oldcycle_reports');
}
