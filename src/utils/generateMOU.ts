/**
 * MOU PDF Generation Utility
 * Generates a Memorandum of Understanding PDF with project details and signatures
 */
import jsPDF from "jspdf";

/**
 * Convert HTML to plain text with proper formatting for PDF
 * Preserves line breaks and handles lists
 */
function htmlToPlainText(html: string): string {
  if (!html) return "";
  
  // Create a temporary DOM element to parse HTML
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  
  // Replace block elements with line breaks
  const blockElements = tmp.querySelectorAll("p, div, br, h1, h2, h3, h4, h5, h6");
  blockElements.forEach((el) => {
    if (el.tagName === "BR") {
      el.replaceWith("\n");
    } else if (el.textContent) {
      el.replaceWith(`${el.textContent.trim()}\n`);
    }
  });
  
  // Handle lists
  const listItems = tmp.querySelectorAll("li");
  listItems.forEach((li) => {
    if (li.textContent) {
      li.replaceWith(`• ${li.textContent.trim()}\n`);
    }
  });
  
  // Get text content
  let text = tmp.textContent || tmp.innerText || "";
  
  // Clean up multiple newlines (max 2 consecutive)
  text = text.replace(/\n{3,}/g, "\n\n");
  
  // Replace HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Trim whitespace
  text = text.trim();
  
  return text;
}

export interface MOUData {
  projectTitle: string;
  universityName?: string;
  departmentName?: string;
  courseName?: string;
  summary?: string;
  challengeStatement?: string; // Challenges/opportunities
  scopeActivities?: string; // Activities
  expectations?: string; // Expectations
  skills?: string[]; // Required skills
  budget?: {
    currency: string;
    value: number;
  };
  deadline?: string;
  partnerName?: string;
  partnerSignature: string; // Base64 data URL
  universityAdminName?: string;
  universityAdminSignature: string; // Base64 data URL
}

/**
 * Load image from data URL to get dimensions
 */
function loadImageFromDataURL(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataURL;
  });
}

/**
 * Generate MOU PDF with project details and signatures
 * @param data - MOU data including project details and signatures
 * @returns Promise that resolves to PDF as Blob
 */
export async function generateMOUPDF(data: MOUData): Promise<Blob> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MEMORANDUM OF UNDERSTANDING", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Project Information Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  
  if (data.projectTitle) {
    doc.setFont("helvetica", "bold");
    doc.text("Project:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.projectTitle, margin + 30, yPos);
    yPos += 8;
  }

  if (data.universityName) {
    doc.setFont("helvetica", "bold");
    doc.text("University:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.universityName, margin + 35, yPos);
    yPos += 8;
  }

  if (data.departmentName) {
    doc.setFont("helvetica", "bold");
    doc.text("Department:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.departmentName, margin + 40, yPos);
    yPos += 8;
  }

  if (data.courseName) {
    doc.setFont("helvetica", "bold");
    doc.text("Course:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.courseName, margin + 30, yPos);
    yPos += 8;
  }

  yPos += 5;

  // Project Summary
  if (data.summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Project Summary:", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Convert HTML to plain text with proper formatting
    const plainTextSummary = htmlToPlainText(data.summary);
    
    // Split by lines to handle paragraphs and line breaks
    const paragraphs = plainTextSummary.split(/\n+/).filter(p => p.trim());
    
    for (const paragraph of paragraphs) {
      // Check if we need a new page
      if (yPos + 8 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      // Split long paragraphs into multiple lines
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 6 + 3; // 3mm spacing between paragraphs
    }
    
    yPos += 5; // Extra spacing after summary
  }

  // Challenges/Opportunities
  if (data.challengeStatement) {
    // Check if we need a new page
    if (yPos + 15 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Challenges/Opportunities:", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const plainTextChallenges = htmlToPlainText(data.challengeStatement);
    const challengeParagraphs = plainTextChallenges.split(/\n+/).filter(p => p.trim());
    
    for (const paragraph of challengeParagraphs) {
      if (yPos + 8 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 6 + 3;
    }
    
    yPos += 5;
  }

  // Activities
  if (data.scopeActivities) {
    // Check if we need a new page
    if (yPos + 15 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Activities:", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const plainTextActivities = htmlToPlainText(data.scopeActivities);
    const activityParagraphs = plainTextActivities.split(/\n+/).filter(p => p.trim());
    
    for (const paragraph of activityParagraphs) {
      if (yPos + 8 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 6 + 3;
    }
    
    yPos += 5;
  }

  // Expectations
  if (data.expectations) {
    // Check if we need a new page
    if (yPos + 15 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Expectations:", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const plainTextExpectations = htmlToPlainText(data.expectations);
    const expectationParagraphs = plainTextExpectations.split(/\n+/).filter(p => p.trim());
    
    for (const paragraph of expectationParagraphs) {
      if (yPos + 8 > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      
      const lines = doc.splitTextToSize(paragraph.trim(), contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 6 + 3;
    }
    
    yPos += 5;
  }

  // Required Skills
  if (data.skills && data.skills.length > 0) {
    // Check if we need a new page
    if (yPos + 15 > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Required Skills:", margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const skillsText = data.skills.join(", ");
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillsLines, margin, yPos);
    yPos += skillsLines.length * 6 + 5;
  }

  // Budget and Deadline
  if (data.budget && data.budget.value > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const budgetText = `Budget: ${data.budget.currency} ${data.budget.value.toLocaleString()}`;
    doc.text(budgetText, margin, yPos);
    yPos += 8;
  }

  if (data.deadline) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const deadlineDate = new Date(data.deadline).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Deadline: ${deadlineDate}`, margin, yPos);
    yPos += 10;
  }

  // Signatures Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SIGNATURES", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Partner Signature
  if (data.partnerName) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Partner:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.partnerName, margin + 30, yPos);
    yPos += 8;
  }

  if (data.partnerSignature) {
    try {
      const img = await loadImageFromDataURL(data.partnerSignature);
      const sigWidth = 60; // mm
      const sigHeight = (sigWidth * img.height) / img.width;
      doc.addImage(
        data.partnerSignature,
        "PNG",
        margin,
        yPos,
        sigWidth,
        sigHeight
      );
      yPos += sigHeight + 10;
    } catch (error) {
      console.error("Failed to add partner signature:", error);
      yPos += 20;
    }
  }

  // University Admin Signature
  if (data.universityAdminName) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("University Administrator:", margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(data.universityAdminName, margin + 60, yPos);
    yPos += 8;
  }

  if (data.universityAdminSignature) {
    try {
      const img = await loadImageFromDataURL(data.universityAdminSignature);
      const sigWidth = 60; // mm
      const sigHeight = (sigWidth * img.height) / img.width;
      doc.addImage(
        data.universityAdminSignature,
        "PNG",
        margin,
        yPos,
        sigWidth,
        sigHeight
      );
      yPos += sigHeight + 10;
    } catch (error) {
      console.error("Failed to add university admin signature:", error);
      yPos += 20;
    }
  }

  // Date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${currentDate}`, pageWidth - margin, yPos, { align: "right" });

  // Generate PDF blob - use arraybuffer for better compatibility
  // Then convert to Blob to ensure proper MIME type
  const arrayBuffer = doc.output("arraybuffer");
  const pdfBlob = new Blob([arrayBuffer], { type: "application/pdf" });
  return pdfBlob;
}
