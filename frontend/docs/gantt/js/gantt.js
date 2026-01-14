document.addEventListener('DOMContentLoaded', function() {
    generateGanttChart();
    initTooltips();
    animateProgressBar();
});

function generateGanttChart() {
    const tbody = document.getElementById('ganttBody');
    if (!tbody) return;

    let html = '';

    projectData.phases.forEach(phase => {
        html += `
            <tr class="phase-row">
                <td colspan="10">
                    <i class="fas ${phase.icon}"></i>
                    ${phase.name}
                    <span class="phase-hours">${phase.hours}h</span>
                </td>
            </tr>
        `;

        phase.tasks.forEach(task => {
            html += `<tr class="task-row">`;
            
            const taskNameStyle = task.final ? 'font-weight: 700;' : '';
            html += `
                <td style="${taskNameStyle}">
                    <i class="fas ${task.icon}"></i>
                    ${task.name}
                </td>
            `;

            for (let week = 1; week <= 9; week++) {
                html += `<td class="week-cell">`;
                
                const isInWeek = task.week === week || (task.weeks && task.weeks.includes(week));
                
                if (isInWeek) {
                    if (task.milestone) {
                        const milestoneStyle = task.final ? 'background: linear-gradient(135deg, #f1c40f, #e74c3c);' : '';
                        html += `
                            <div class="milestone-marker" style="${milestoneStyle}"
                                data-task="${task.name}"
                                data-start="${task.start} 2025"
                                data-end="${task.end} 2025"
                                data-hours="${task.hours}h">
                                <i class="fas ${task.final ? 'fa-trophy' : 'fa-star'}"></i>
                            </div>
                        `;
                    } else {
                        const nextColor = projectData.phases[phase.id + 1]?.color || phase.color;
                        html += `
                            <div class="task-bar" 
                                style="background: linear-gradient(135deg, ${phase.color}, ${nextColor});"
                                data-task="${task.name}"
                                data-start="${task.start} 2025"
                                data-end="${task.end} 2025"
                                data-hours="${task.hours}h">
                                ${task.hours}h
                            </div>
                        `;
                    }
                }
                
                html += `</td>`;
            }

            html += `</tr>`;
        });
    });

    tbody.innerHTML = html;
}

function initTooltips() {
    const tooltip = document.getElementById('tooltip');
    const tooltipTitle = document.getElementById('tooltipTitle');
    const tooltipStart = document.getElementById('tooltipStart');
    const tooltipEnd = document.getElementById('tooltipEnd');
    const tooltipHours = document.getElementById('tooltipHours');

    if (!tooltip) return;

    document.addEventListener('mouseover', function(e) {
        const target = e.target.closest('.task-bar, .milestone-marker');
        if (!target) return;

        const data = target.dataset;
        if (!data.task) return;

        tooltipTitle.textContent = data.task;
        tooltipStart.textContent = 'Inicio: ' + data.start;
        tooltipEnd.textContent = 'Fin: ' + data.end;
        tooltipHours.textContent = 'Duración: ' + data.hours;

        tooltip.classList.add('active');
        positionTooltip(e);
    });

    document.addEventListener('mouseout', function(e) {
        const target = e.target.closest('.task-bar, .milestone-marker');
        if (target) {
            tooltip.classList.remove('active');
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (tooltip.classList.contains('active')) {
            positionTooltip(e);
        }
    });
}

function positionTooltip(e) {
    const tooltip = document.getElementById('tooltip');
    if (!tooltip) return;

    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const offset = 15;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let left = e.clientX + offset;
    let top = e.clientY + offset;

    if (left + tooltipWidth > windowWidth - 20) {
        left = e.clientX - tooltipWidth - offset;
    }

    if (top + tooltipHeight > windowHeight - 20) {
        top = e.clientY - tooltipHeight - offset;
    }

    if (left < 10) left = 10;
    if (top < 10) top = 10;

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function animateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    progressBar.style.width = '0%';
    progressBar.textContent = '';

    setTimeout(() => {
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.textContent = '100% Completado';
        }, 800);
    }, 300);
}

function printGantt() {
    window.print();
}
