import jsPDF from 'jspdf';

type Msg = { role: 'user' | 'assistant'; content: string };

export function exportChatToPDF(messages: Msg[], title = 'AI Conversation') {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxW = pageW - margin * 2;
  let y = margin;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EzySuite AI', margin, 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, margin, 46);
  doc.text(new Date().toLocaleString(), pageW - margin, 46, { align: 'right' });

  y = 90;
  doc.setTextColor(20, 20, 20);

  for (const m of messages) {
    const isUser = m.role === 'user';
    const label = isUser ? 'You' : 'AI Assistant';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(isUser ? 37 : 16, isUser ? 99 : 122, isUser ? 235 : 87);
    if (y > pageH - margin - 40) { doc.addPage(); y = margin; }
    doc.text(label, margin, y);
    y += 16;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    // Strip markdown basics for PDF readability
    const clean = m.content
      .replace(/```[\s\S]*?```/g, (b) => b.replace(/```\w*\n?|```/g, ''))
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/`([^`]+)`/g, '$1');

    const lines = doc.splitTextToSize(clean, maxW);
    for (const line of lines) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 12;

    // Divider
    doc.setDrawColor(230);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
  }

  const safeTitle = title.replace(/[^\w\s-]/g, '').slice(0, 40) || 'conversation';
  doc.save(`${safeTitle}-${Date.now()}.pdf`);
}
