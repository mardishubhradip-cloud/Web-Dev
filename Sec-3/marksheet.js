document.addEventListener('DOMContentLoaded', () => {
    // 1. Extract Query Parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    
    const rollNo = urlParams.get('rollNo') || 'VB0442301004';
    const studentName = urlParams.get('studentName') || 'Arnab Mukherjee';
    const bhavana = urlParams.get('bhavana') || 'Siksha Bhavana';
    const semester = urlParams.get('semester') || 'Semester IV';
    const session = urlParams.get('session') || '2025-2026';

    // 2. Update Student Info DOM Elements
    document.getElementById('displayName').textContent = studentName;
    document.getElementById('displayRoll').textContent = rollNo;
    document.getElementById('displayReg').textContent = `VB-${rollNo.slice(-4) || '2022'}-0891`;
    document.getElementById('displayBhavana').textContent = bhavana;
    document.getElementById('displaySemester').textContent = semester;
    document.getElementById('displaySession').textContent = session;

    // 3. Mock Database of Course Curriculum per Bhavana
    const courseDatabase = {
        'Siksha Bhavana': [
            { code: 'CS-401', title: 'Database Management Systems', credits: 4, grade: 'A+', point: 9 },
            { code: 'CS-402', title: 'Operating Systems Concept', credits: 4, grade: 'A', point: 8 },
            { code: 'CS-403', title: 'Software Engineering', credits: 4, grade: 'O', point: 10 },
            { code: 'CS-404P', title: 'DBMS & OS Practical Lab', credits: 4, grade: 'O', point: 10 },
            { code: 'SEC-04', title: 'Python & Data Analysis', credits: 2, grade: 'A+', point: 9 }
        ],
        'Vidya Bhavana': [
            { code: 'HIST-401', title: 'Modern Indian History (1857-1947)', credits: 4, grade: 'A+', point: 9 },
            { code: 'HIST-402', title: 'European Revolutions & World Politics', credits: 4, grade: 'O', point: 10 },
            { code: 'ECON-403', title: 'Macroeconomic Principles', credits: 4, grade: 'A', point: 8 },
            { code: 'HIST-404P', title: 'Archival Methods & Field Project', credits: 4, grade: 'A+', point: 9 },
            { code: 'SEC-02', title: 'Heritage & Museum Studies', credits: 2, grade: 'O', point: 10 }
        ],
        'Kala Bhavana': [
            { code: 'ART-401', title: 'History of World Art & Sculpture', credits: 4, grade: 'O', point: 10 },
            { code: 'ART-402', title: 'Traditional Bengal Mural Painting', credits: 4, grade: 'O', point: 10 },
            { code: 'ART-403', title: 'Composition & Aesthetics', credits: 4, grade: 'A+', point: 9 },
            { code: 'ART-404P', title: 'Studio Practice Lab', credits: 4, grade: 'O', point: 10 },
            { code: 'SEC-01', title: 'Digital Graphics & Design', credits: 2, grade: 'A+', point: 9 }
        ]
    };

    // Fallback courses if Bhavana is not explicitly mapped above
    const defaultCourses = [
        { code: 'GEN-401', title: 'Core Academic Discipline Paper I', credits: 4, grade: 'A+', point: 9 },
        { code: 'GEN-402', title: 'Core Academic Discipline Paper II', credits: 4, grade: 'A', point: 8 },
        { code: 'GEN-403', title: 'Interdisciplinary Allied Paper', credits: 4, grade: 'A+', point: 9 },
        { code: 'GEN-404P', title: 'Practical / Project Work', credits: 4, grade: 'O', point: 10 },
        { code: 'SEC-04', title: 'Skill Enhancement Course', credits: 2, grade: 'A', point: 8 }
    ];

    // Select course list based on user choices
    const courses = courseDatabase[bhavana] || defaultCourses;

    // 4. Dynamically Render Table Rows & Calculate SGPA
    const tableBody = document.getElementById('marksTableBody');
    tableBody.innerHTML = ''; // Clear previous content

    let totalCredits = 0;
    let totalCreditPoints = 0;
    let isPassed = true;

    courses.forEach(course => {
        const creditPoints = course.credits * course.point;
        totalCredits += course.credits;
        totalCreditPoints += creditPoints;

        if (course.point < 4) {
            isPassed = false;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.code}</td>
            <td class="left">${course.title}</td>
            <td>${course.credits}</td>
            <td>${course.grade}</td>
            <td>${course.point}</td>
            <td>${creditPoints}</td>
        `;
        tableBody.appendChild(row);
    });

    // 5. Update Calculated Summary Metrics
    const sgpa = (totalCreditPoints / totalCredits).toFixed(2);
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('sgpaVal').textContent = sgpa;
    
    const statusEl = document.getElementById('resultStatus');
    if (isPassed) {
        statusEl.textContent = 'PASSED';
        statusEl.style.color = '#006600';
    } else {
        statusEl.textContent = 'BACKLOG / RE-APPEAR';
        statusEl.style.color = '#7A1C1C';
    }

    // 6. Print Button Action
    document.getElementById('btnPrint').addEventListener('click', () => {
        window.print();
    });
});