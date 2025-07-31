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
            <td class="${problem.correct ? 'correct' : 'incorrect'}">${problem.correct ? '正确' : '错误'}</td>
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