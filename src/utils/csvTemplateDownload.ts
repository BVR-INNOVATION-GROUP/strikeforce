/**
 * CSV Template Download Utility
 * Generates and downloads CSV templates for bulk uploads
 */

/**
 * Download CSV template for departments
 */
export function downloadDepartmentsTemplate() {
  const csvContent = "name,universityId\nComputer Science,org-university-1\nEngineering,org-university-1";
  downloadCSV(csvContent, "departments_template.csv");
}

/**
 * Download CSV template for programmes
 */
export function downloadProgrammesTemplate() {
  const csvContent = "name,departmentId\nBachelor of Engineering,1\nBachelor of Science,1";
  downloadCSV(csvContent, "programmes_template.csv");
}

/**
 * Download CSV template for students
 */
export function downloadStudentsTemplate() {
  const csvContent = "name,email,departmentId,programmeId\nJohn Doe,john@university.edu,1,1\nJane Smith,jane@university.edu,1,2";
  downloadCSV(csvContent, "students_template.csv");
}

/**
 * Download CSV template for supervisors
 */
export function downloadSupervisorsTemplate() {
  const csvContent = "name,email,departmentId\nDr. Jane Smith,jane@university.edu,1\nProf. John Doe,john@university.edu,2";
  downloadCSV(csvContent, "supervisors_template.csv");
}

/**
 * Helper function to trigger CSV download
 */
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

