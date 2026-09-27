/**
 * Processes Form Submission on index.html
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const studentData = {
        studentName: document.getElementById('studentName').value.trim(),
        rollNo: document.getElementById('rollNo').value.trim(),
        program: document.getElementById('program').value.trim(),
        semester: document.getElementById('semester').value,
        subjects: [
            {
                name: document.getElementById('sub1Name').value.trim(),
                marks: parseFloat(document.getElementById('sub1Marks').value)
            },
            {
                name: document.getElementById('sub2Name').value.trim(),
                marks: parseFloat(document.getElementById('sub2Marks').value)
            },
            {
                name: document.getElementById('sub3Name').value.trim(),
                marks: parseFloat(document.getElementById('sub3Marks').value)
            }
        ]
    };

    // Save to browser session/storage
    localStorage.setItem('vb_student_data', JSON.stringify(studentData));

    // Redirect to results page
    window.location.href = 'result.html';
}

/**
 * Calculates Grade and Grade Points based on marks out of 100
 */
function calculateGrade(marks) {
    if (marks >= 90) return { grade: 'O', point: 10, status: 'Pass' };
    if (marks >= 80) return { grade: 'A+', point: 9, status: 'Pass' };
    if (marks >= 70) return { grade: 'A', point: 8, status: 'Pass' };
    if (marks >= 60) return { grade: 'B+', point: 7, status: 'Pass' };
    if (marks >= 50) return { grade: 'B', point: 6, status: 'Pass' };
    if (marks >= 40) return { grade: 'C', point: 5, status: 'Pass' };
    return { grade: 'F', point: 0, status: 'Fail' };
}

/**
 * Loads Marksheet details onto result.html
 */
function loadMarksheet() {
    const storedData = localStorage.getItem('vb_student_data');
    
    if (!storedData) {
        alert('No data found. Redirecting to form.');
        window.location.href = 'index.html';
        return;
    }

    const data = JSON.parse(storedData);

    // Populate Info Header
    const infoGrid = document.getElementById('studentInfoGrid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-item"><span class="label">Student Name:</span><span class="value">${escapeHtml(data.studentName)}</span></div>
            <div class="info-item"><span class="label">Roll / Reg No:</span><span class="value">${escapeHtml(data.rollNo)}</span></div>
            <div class="info-item"><span class="label">Program:</span><span class="value">${escapeHtml(data.program)}</span></div>
            <div class="info-item"><span class="label">Semester:</span><span class="value">${escapeHtml(data.semester)}</span></div>
        `;
    }

    // Populate Table
    const tbody = document.getElementById('marksTableBody');
    let totalObtained = 0;
    let totalMax = data.subjects.length * 100;
    let totalPoints = 0;
    let isOverallPass = true;

    if (tbody) {
        tbody.innerHTML = '';
        data.subjects.forEach((sub, index) => {
            const evalRes = calculateGrade(sub.marks);
            totalObtained += sub.marks;
            totalPoints += evalRes.point;

            if (evalRes.status === 'Fail') {
                isOverallPass = false;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(sub.name)}</strong></td>
                <td>100</td>
                <td>${sub.marks}</td>
                <td><strong>${evalRes.grade}</strong></td>
                <td>${evalRes.point}</td>
                <td><span class="${evalRes.status === 'Pass' ? 'badge-pass' : 'badge-fail'}">${evalRes.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // Calculations
    const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
    const sgpa = (totalPoints / data.subjects.length).toFixed(2);

    // Summary Display
    const summaryBox = document.getElementById('summaryBox');
    if (summaryBox) {
        summaryBox.innerHTML = `
            <div class="summary-item">
                <div class="num">${totalObtained} / ${totalMax}</div>
                <div class="lbl">Total Marks</div>
            </div>
            <div class="summary-item">
                <div class="num">${percentage}%</div>
                <div class="lbl">Percentage</div>
            </div>
            <div class="summary-item">
                <div class="num">${sgpa}</div>
                <div class="lbl">SGPA</div>
            </div>
            <div class="summary-item">
                <div class="num" style="color: ${isOverallPass ? 'var(--success-green)' : 'var(--fail-red)'};">
                    ${isOverallPass ? 'PASSED' : 'FAILED'}
                </div>
                <div class="lbl">Final Result</div>
            </div>
        `;
    }
}

/**
 * Escapes HTML characters for security
 */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}