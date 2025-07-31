const encouragements = [
    { range: [0, 0], message: "看起来有点困难哦！别担心，找老师或家长帮忙，一起解决会更容易！" },
    { range: [0.01, 30], message: "已经迈出第一步了！继续尝试，多练习几次，你会越来越棒！" },
    { range: [30, 60], message: "不错哦，已经有进步了！继续加油，你一定可以做得更好！" },
    { range: [60, 70], message: "很棒的成绩！再加把劲，你会更上一层楼！" },
    { range: [70, 80], message: "太厉害了，你的努力很了不起！再多练习，你会更出色！" },
    { range: [80, 90], message: "非常棒，表现很优秀！再细心一点，你就接近完美了！" },
    { range: [90, 100], message: "哇，接近全对了！你的珠心算水平超强，继续保持！" },
    { range: [100, 100], message: "全对！你是珠心算小天才！太了不起了，继续闪耀吧！" }
];

function formatDateTime(date) {
    const offset = 8 * 60;
    const localDate = new Date(date.getTime() + offset * 60 * 1000);
    const year = localDate.getUTCFullYear();
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localDate.getUTCDate()).padStart(2, '0');
    const hours = String(localDate.getUTCHours()).padStart(2, '0');
    const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function showSummary(problems, currentIndex, startTime, numQuestions, userName, practiceName) {
    document.getElementById('practice').style.display = 'none';
    document.getElementById('summary').style.display = 'block';
    const endTime = new Date();
    const timeTaken = Math.round((endTime - startTime) / 1000);
    const correctCount = problems.filter(p => p.correct).length;
    const percentage = (correctCount / numQuestions) * 100;
    let encouragement = encouragements.find(e => percentage >= e.range[0] && percentage <= e.range[1]).message;
    
    document.getElementById('userNameDisplay').innerText = userName;
    document.getElementById('correctCount').innerText = `${correctCount}/${numQuestions}`;
    document.getElementById('totalTime').innerText = `${timeTaken} 秒`;
    document.getElementById('completionTime').innerText = formatDateTime(endTime);
    document.getElementById('encouragement').innerText = encouragement;

    const table = document.getElementById('summaryTable');
    table.innerHTML = '';
    problems.forEach((problem, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${problem.summaryText}</td>
            <td>${problem.userAnswer !== undefined ? problem.userAnswer : '-'}</td>
            <td class="${problem.correct ? 'correct' : 'incorrect'}">${problem.correct ? '✓' : '✗'}</td>
            <td>${problem.answer}</td>
        `;
        table.appendChild(row);
    });
}

function shareResult(userName, practiceName) {
    const shareArea = document.getElementById('shareArea');
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    const width = shareArea.offsetWidth;
    const height = shareArea.offsetHeight + 90;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    const xLeft = 20;
    let y = 30;
    const lineHeight = 30;
    ctx.font = '20px bold Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    const xCenter = width / 2;
    ctx.fillText('珠心算练习结果', xCenter, y);
    y += lineHeight;
    ctx.fillText(`（${practiceName}）`, xCenter, y);
    y += lineHeight;
    ctx.textAlign = 'left';
    ctx.font = '16px bold Arial';
    ctx.fillText(`姓名：${document.getElementById('userNameDisplay').innerText}`, xLeft, y);
    y += lineHeight;
    ctx.font = '16px Arial';
    ctx.fillText(`答对题数：${document.getElementById('correctCount').innerText}`, xLeft, y);
    y += lineHeight;
    ctx.fillText(`总用时：${document.getElementById('totalTime').innerText}`, xLeft, y);
    y += lineHeight;
    ctx.fillText(`完成时间：${document.getElementById('completionTime').innerText}`, xLeft, y);
    y += 2 * lineHeight;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'center';
    ctx.fillText('作者：颜毅翔', xCenter, y);
    canvas.toBlob(blob => {
        const file = new File([blob], 'result.png', { type: 'image/png' });
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (navigator.share && isMobile) {
            navigator.share({
                files: [file],
                title: '珠心算练习结果',
                text: '看看我的珠心算练习成绩！'
            }).catch(err => console.error('分享失败:', err));
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'result.png';
            a.click();
            URL.revokeObjectURL(url);
        }
    });
}

function downloadReport(problems, startTime, numQuestions, userName, practiceName) {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            throw new Error('jsPDF 库未加载，请检查网络连接或刷新页面。');
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Try to register Chinese font, fall back to Helvetica if unavailable
        try {
            doc.addFont('NotoSansCJKsc-normal.js', 'NotoSansCJKsc', 'normal');
            doc.setFont('NotoSansCJKsc');
        } catch (e) {
            console.warn('NotoSansCJKsc font failed to load, falling back to Helvetica:', e);
            doc.setFont('Helvetica');
        }

        // Header
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('珠心算练习报告', pageWidth / 2, y, { align: 'center' });
        y += 10;
        doc.setFontSize(16);
        doc.setFont(undefined, 'normal');
        doc.text(`（${practiceName}）`, pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Student Details
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`姓名：${userName}`, margin, y);
        y += 10;
        doc.setFont(undefined, 'normal');
        const endTime = new Date();
        const timeTaken = Math.round((endTime - startTime) / 1000);
        const correctCount = problems.filter(p => p.correct).length;
        doc.text(`答对题数：${correctCount}/${numQuestions}`, margin, y);
        y += 10;
        doc.text(`总用时：${timeTaken} 秒`, margin, y);
        y += 10;
        doc.text(`完成时间：${formatDateTime(endTime)}`, margin, y);
        y += 15;

        // Table
        doc.autoTable({
            startY: y,
            head: [['题目', '你的答案', '正确性', '正确答案']],
            body: problems.map(p => [
                p.summaryText,
                p.userAnswer !== undefined ? p.userAnswer : '-',
                p.correct ? '✓' : '✗',
                p.answer
            ]),
            styles: { font: doc.getFont().fontName, fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [76, 175, 80] },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 30 }
            }
        });

        // Footer
        y = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text('作者：颜毅翔', pageWidth / 2, y, { align: 'center' });

        // Save PDF
        const timestamp = formatDateTime(endTime).replace(/[: -]/g, '');
        doc.save(`report_${practiceName}_${timestamp}.pdf`);
    } catch (error) {
        console.error('PDF 生成失败:', error);
        alert('无法生成报告，请检查网络连接或刷新页面后重试。');
    }
}