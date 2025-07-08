// 75 Hard Challenge Progress Tracker
class SeventyFiveHardTracker {
    constructor() {
        this.currentDay = 1;
        this.totalDays = 75;
        this.progressData = this.loadProgressData();
        this.tasks = ['diet', 'workout1', 'workout2', 'water', 'reading', 'photo'];
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.generateCalendar();
    }

    loadProgressData() {
        const saved = localStorage.getItem('75HardProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Initialize progress data for all 75 days
        const progressData = {};
        for (let i = 1; i <= 75; i++) {
            progressData[i] = {
                diet: false,
                workout1: false,
                workout2: false,
                water: false,
                reading: false,
                photo: false,
                completed: false
            };
        }
        return progressData;
    }

    saveProgressData() {
        localStorage.setItem('75HardProgress', JSON.stringify(this.progressData));
    }

    initializeEventListeners() {
        // Task checkboxes
        this.tasks.forEach(task => {
            const checkbox = document.getElementById(task);
            checkbox.addEventListener('change', () => this.handleTaskToggle(task));
        });

        // Navigation buttons
        document.getElementById('prevDay').addEventListener('click', () => this.changeDay(-1));
        document.getElementById('nextDay').addEventListener('click', () => this.changeDay(1));
        
        // Reset button
        document.getElementById('resetChallenge').addEventListener('click', () => this.resetChallenge());
        
        // New challenge button
        document.getElementById('newChallenge').addEventListener('click', () => this.resetChallenge());
        
        // Analytics button
        document.getElementById('showAnalytics').addEventListener('click', () => this.showAnalytics());
        
        // Modal close events
        document.getElementById('closeModal').addEventListener('click', () => this.closeAnalytics());
        document.getElementById('analyticsModal').addEventListener('click', (e) => {
            if (e.target.id === 'analyticsModal') {
                this.closeAnalytics();
            }
        });

        // Toggle rules section
        document.getElementById('rulesToggle').addEventListener('click', () => this.toggleRulesSection());

        // Initialize checkboxes for current day
        this.loadDayTasks();
    }

    handleTaskToggle(task) {
        const checkbox = document.getElementById(task);
        const taskItem = checkbox.closest('.task-item');
        
        this.progressData[this.currentDay][task] = checkbox.checked;
        
        // Update visual feedback
        if (checkbox.checked) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
        }
        
        this.checkDayCompletion();
        this.saveProgressData();
        this.updateDisplay();
        this.updateCalendar();
        this.checkChallengeCompletion();
    }

    checkDayCompletion() {
        const dayData = this.progressData[this.currentDay];
        const allTasksComplete = this.tasks.every(task => dayData[task]);
        
        dayData.completed = allTasksComplete;
        
        // Visual feedback for day completion
        if (allTasksComplete) {
            this.showCompletionMessage();
        }
    }

    showCompletionMessage() {
        // Create a temporary success message
        const message = document.createElement('div');
        message.textContent = `Day ${this.currentDay} Complete! 🎉`;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: bold;
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    changeDay(direction) {
        const newDay = this.currentDay + direction;
        if (newDay >= 1 && newDay <= this.totalDays) {
            this.currentDay = newDay;
            this.loadDayTasks();
            this.updateDisplay();
            this.updateCalendar();
        }
    }

    loadDayTasks() {
        const dayData = this.progressData[this.currentDay];
        
        this.tasks.forEach(task => {
            const checkbox = document.getElementById(task);
            const taskItem = checkbox.closest('.task-item');
            
            checkbox.checked = dayData[task];
            
            if (dayData[task]) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        });
    }

    updateDisplay() {
        // Update day counter
        document.getElementById('currentDay').textContent = this.currentDay;
        
        // Update progress bar
        const progressPercentage = ((this.currentDay - 1) / this.totalDays) * 100;
        document.getElementById('progressFill').style.width = `${progressPercentage}%`;
        
        // Update navigation buttons
        document.getElementById('prevDay').disabled = this.currentDay === 1;
        document.getElementById('nextDay').disabled = this.currentDay === this.totalDays;
        
        // Update statistics
        this.updateStatistics();
    }

    updateStatistics() {
        const completedDays = Object.values(this.progressData)
            .filter(day => day.completed).length;
        
        const currentStreak = this.calculateCurrentStreak();
        const totalTasks = this.totalDays * this.tasks.length;
        const completedTasks = Object.values(this.progressData)
            .reduce((total, day) => {
                return total + this.tasks.filter(task => day[task]).length;
            }, 0);
        
        const overallCompletion = Math.round((completedTasks / totalTasks) * 100);
        
        document.getElementById('completedDays').textContent = completedDays;
        document.getElementById('streak').textContent = currentStreak;
        document.getElementById('completion').textContent = `${overallCompletion}%`;
    }

    calculateCurrentStreak() {
        let streak = 0;
        for (let i = this.currentDay - 1; i >= 1; i--) {
            if (this.progressData[i].completed) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    generateCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        for (let day = 1; day <= this.totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.addEventListener('click', () => this.jumpToDay(day));
            
            // Add appropriate classes based on day status
            if (day === this.currentDay) {
                dayElement.classList.add('current');
            } else if (day > this.currentDay) {
                dayElement.classList.add('future');
            } else if (this.progressData[day].completed) {
                dayElement.classList.add('complete');
            } else {
                dayElement.classList.add('incomplete');
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }

    updateCalendar() {
        const calendarDays = document.querySelectorAll('.calendar-day');
        
        calendarDays.forEach((dayElement, index) => {
            const day = index + 1;
            
            // Remove all status classes
            dayElement.classList.remove('current', 'future', 'complete', 'incomplete');
            
            // Add appropriate class based on day status
            if (day === this.currentDay) {
                dayElement.classList.add('current');
            } else if (day > this.currentDay) {
                dayElement.classList.add('future');
            } else if (this.progressData[day].completed) {
                dayElement.classList.add('complete');
            } else {
                dayElement.classList.add('incomplete');
            }
        });
    }

    jumpToDay(day) {
        if (day <= this.totalDays) {
            this.currentDay = day;
            this.loadDayTasks();
            this.updateDisplay();
            this.updateCalendar();
        }
    }

    resetChallenge() {
        if (confirm('Are you sure you want to start over? This will reset all your progress.')) {
            // Reset all data
            this.currentDay = 1;
            this.progressData = {};
            for (let i = 1; i <= 75; i++) {
                this.progressData[i] = {
                    diet: false,
                    workout1: false,
                    workout2: false,
                    water: false,
                    reading: false,
                    photo: false,
                    completed: false
                };
            }
            
            // Hide completion section
            document.getElementById('completionSection').style.display = 'none';
            
            // Save and update display
            this.saveProgressData();
            this.loadDayTasks();
            this.updateDisplay();
            this.generateCalendar();
            
            // Show reset message
            this.showResetMessage();
        }
    }

    showResetMessage() {
        const message = document.createElement('div');
        message.textContent = 'Challenge Reset! Starting fresh on Day 1. You got this! 💪';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-weight: bold;
            animation: slideIn 0.5s ease-out;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 4000);
    }

    checkChallengeCompletion() {
        // Check if all 75 days are completed
        const allDaysComplete = Object.values(this.progressData)
            .every(day => day.completed);
            
        if (allDaysComplete) {
            this.showChallengeCompletion();
        }
    }

    showChallengeCompletion() {
        // Show completion section
        document.getElementById('completionSection').style.display = 'block';
        
        // Start continuous confetti celebration
        this.startContinuousConfetti();
        
        // Play horn sounds
        this.playHornSounds();
        
        // Scroll to completion section
        document.getElementById('completionSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    createConfetti() {
        const colors = ['#667eea', '#764ba2', '#48bb78', '#38a169', '#e53e3e', '#ffd700', '#ff6b6b', '#4ecdc4'];
        const confettiCount = 100;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: 10px;
                    height: 10px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    transform: rotate(${Math.random() * 360}deg);
                    animation: confettiFall ${3 + Math.random() * 2}s linear forwards;
                    z-index: 9999;
                    pointer-events: none;
                `;
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 50);
        }
    }

    startContinuousConfetti() {
        // Store reference to stop confetti later
        this.confettiInterval = setInterval(() => {
            this.createConfettiBurst();
        }, 800); // New burst every 800ms
        
        // Stop continuous confetti after 15 seconds
        setTimeout(() => {
            if (this.confettiInterval) {
                clearInterval(this.confettiInterval);
                this.confettiInterval = null;
            }
        }, 15000);
        
        // Initial big burst
        this.createConfetti();
    }

    createConfettiBurst() {
        const colors = ['#667eea', '#764ba2', '#48bb78', '#38a169', '#e53e3e', '#ffd700', '#ff6b6b', '#4ecdc4', '#9f7aea', '#f687b3'];
        const confettiCount = 30; // Smaller bursts for continuous effect
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    top: -20px;
                    left: ${Math.random() * 100}vw;
                    width: ${8 + Math.random() * 6}px;
                    height: ${8 + Math.random() * 6}px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    transform: rotate(${Math.random() * 360}deg);
                    animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
                    z-index: 9999;
                    pointer-events: none;
                    opacity: ${0.7 + Math.random() * 0.3};
                `;
                
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 5000);
            }, i * 30);
        }
    }

    playHornSounds() {
        // Create multiple horn sound effects using Web Audio API
        this.createHornSound(220, 0.3); // Lower horn
        setTimeout(() => this.createHornSound(330, 0.4), 200);
        setTimeout(() => this.createHornSound(440, 0.5), 400);
        setTimeout(() => this.createHornSound(550, 0.3), 600);
        
        // Additional horn bursts
        setTimeout(() => {
            this.createHornSound(220, 0.4);
            setTimeout(() => this.createHornSound(330, 0.5), 100);
            setTimeout(() => this.createHornSound(440, 0.6), 200);
        }, 2000);
        
        setTimeout(() => {
            this.createHornSound(440, 0.5);
            setTimeout(() => this.createHornSound(550, 0.4), 150);
            setTimeout(() => this.createHornSound(660, 0.3), 300);
        }, 4000);
    }

    createHornSound(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configure horn sound
            oscillator.type = 'sawtooth'; // Gives a horn-like sound
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            // Volume envelope for realistic horn sound
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + duration * 0.7);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
            
            // Add frequency modulation for more realistic horn sound
            const modulator = audioContext.createOscillator();
            const modulatorGain = audioContext.createGain();
            modulator.connect(modulatorGain);
            modulatorGain.connect(oscillator.frequency);
            
            modulator.frequency.setValueAtTime(5, audioContext.currentTime); // 5Hz vibrato
            modulatorGain.gain.setValueAtTime(10, audioContext.currentTime);
            
            // Start and stop
            oscillator.start(audioContext.currentTime);
            modulator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            modulator.stop(audioContext.currentTime + duration);
            
        } catch (error) {
            console.log('Audio not supported, but confetti still works!');
        }
    }

    showAnalytics() {
        document.getElementById('analyticsModal').style.display = 'block';
        this.generateAnalytics();
    }

    closeAnalytics() {
        document.getElementById('analyticsModal').style.display = 'none';
    }

    generateAnalytics() {
        this.drawProgressChart();
        this.drawTaskChart();
        this.drawWeeklyChart();
        this.generateInsights();
        this.updateDetailedStats();
    }

    drawProgressChart() {
        const canvas = document.getElementById('progressChart');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart setup
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Calculate daily completion rates
        const dailyRates = [];
        for (let day = 1; day <= this.currentDay; day++) {
            const completed = this.tasks.filter(task => this.progressData[day][task]).length;
            dailyRates.push((completed / this.tasks.length) * 100);
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight * i / 10);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw line chart
        if (dailyRates.length > 1) {
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < dailyRates.length; i++) {
                const x = padding + (chartWidth * i / (dailyRates.length - 1));
                const y = height - padding - (chartHeight * dailyRates[i] / 100);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Draw points
            ctx.fillStyle = '#667eea';
            for (let i = 0; i < dailyRates.length; i++) {
                const x = padding + (chartWidth * i / (dailyRates.length - 1));
                const y = height - padding - (chartHeight * dailyRates[i] / 100);
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        
        // Add labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Daily Progress (%)', width / 2, height - 10);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Completion Rate', 0, 0);
        ctx.restore();
    }

    drawTaskChart() {
        const canvas = document.getElementById('taskChart');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const taskNames = ['Diet', 'Workout 1', 'Outdoor', 'Water', 'Reading', 'Photo'];
        const taskColors = ['#e53e3e', '#667eea', '#48bb78', '#38b2ac', '#764ba2', '#ffd700'];
        
        // Calculate task completion rates
        const taskRates = this.tasks.map(task => {
            let completed = 0;
            for (let day = 1; day <= this.currentDay; day++) {
                if (this.progressData[day][task]) completed++;
            }
            return this.currentDay > 0 ? (completed / this.currentDay) * 100 : 0;
        });
        
        const barWidth = (width - 80) / this.tasks.length;
        const maxRate = Math.max(...taskRates, 100);
        
        // Draw bars
        this.tasks.forEach((task, index) => {
            const barHeight = (taskRates[index] / maxRate) * (height - 80);
            const x = 40 + index * barWidth;
            const y = height - 40 - barHeight;
            
            ctx.fillStyle = taskColors[index];
            ctx.fillRect(x, y, barWidth - 10, barHeight);
            
            // Add percentage labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(taskRates[index])}%`, x + barWidth / 2 - 5, y - 5);
            
            // Add task labels
            ctx.save();
            ctx.translate(x + barWidth / 2 - 5, height - 20);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(taskNames[index], 0, 0);
            ctx.restore();
        });
    }

    drawWeeklyChart() {
        const canvas = document.getElementById('weeklyChart');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const weeks = Math.ceil(this.currentDay / 7);
        if (weeks === 0) return;
        
        const weeklyData = [];
        for (let week = 0; week < weeks; week++) {
            const startDay = week * 7 + 1;
            const endDay = Math.min((week + 1) * 7, this.currentDay);
            
            let totalTasks = 0;
            let completedTasks = 0;
            
            for (let day = startDay; day <= endDay; day++) {
                this.tasks.forEach(task => {
                    totalTasks++;
                    if (this.progressData[day][task]) completedTasks++;
                });
            }
            
            weeklyData.push(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0);
        }
        
        const barWidth = (width - 80) / weeks;
        
        // Draw weekly bars
        weeklyData.forEach((rate, index) => {
            const barHeight = (rate / 100) * (height - 80);
            const x = 40 + index * barWidth;
            const y = height - 40 - barHeight;
            
            ctx.fillStyle = '#38b2ac';
            ctx.fillRect(x, y, barWidth - 10, barHeight);
            
            // Add labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(rate)}%`, x + barWidth / 2 - 5, y - 5);
            ctx.fillText(`W${index + 1}`, x + barWidth / 2 - 5, height - 20);
        });
    }

    generateInsights() {
        const insights = [];
        const totalDays = this.currentDay;
        const completedDays = Object.values(this.progressData)
            .slice(0, totalDays)
            .filter(day => day.completed).length;
        
        // Progress insights
        const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
        
        if (completionRate >= 90) {
            insights.push("🔥 Incredible! You're crushing this challenge with over 90% perfect days!");
        } else if (completionRate >= 70) {
            insights.push("💪 Great work! You're maintaining strong consistency.");
        } else if (completionRate >= 50) {
            insights.push("📈 You're making progress! Focus on building consistency.");
        } else {
            insights.push("🎯 Every day is a new opportunity. Stay focused on your goals!");
        }
        
        // Task-specific insights
        const taskCompletion = this.tasks.map(task => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                if (this.progressData[day][task]) completed++;
            }
            return { task, rate: totalDays > 0 ? (completed / totalDays) * 100 : 0 };
        });
        
        const bestTask = taskCompletion.reduce((prev, current) => 
            prev.rate > current.rate ? prev : current);
        const worstTask = taskCompletion.reduce((prev, current) => 
            prev.rate < current.rate ? prev : current);
        
        const taskNames = {
            diet: 'Diet',
            workout1: 'First Workout',
            workout2: 'Outdoor Workout',
            water: 'Water Intake',
            reading: 'Reading',
            photo: 'Progress Photos'
        };
        
        if (bestTask.rate >= 80) {
            insights.push(`🏆 You're excelling at ${taskNames[bestTask.task]}! Keep it up!`);
        }
        
        if (worstTask.rate < 60 && totalDays > 7) {
            insights.push(`⚠️ ${taskNames[worstTask.task]} needs attention. Try setting reminders or adjusting your routine.`);
        }
        
        // Streak insights
        const currentStreak = this.calculateCurrentStreak();
        if (currentStreak >= 7) {
            insights.push(`🔥 Amazing ${currentStreak}-day streak! You're building unstoppable momentum!`);
        } else if (currentStreak >= 3) {
            insights.push(`✨ ${currentStreak}-day streak building! Keep the momentum going!`);
        }
        
        // Motivation based on progress
        const daysRemaining = 75 - totalDays;
        if (daysRemaining <= 10 && daysRemaining > 0) {
            insights.push(`🎯 Only ${daysRemaining} days left! The finish line is in sight!`);
        } else if (daysRemaining <= 30 && daysRemaining > 10) {
            insights.push(`💪 Less than a month to go! You've got this!`);
        }
        
        // Display insights
        const insightsContent = document.getElementById('insightsContent');
        insightsContent.innerHTML = insights.map(insight => 
            `<div style="margin: 10px 0; padding: 10px; background: #f0f8ff; border-left: 4px solid #667eea; border-radius: 5px;">${insight}</div>`
        ).join('');
    }

    updateDetailedStats() {
        const totalDays = this.currentDay;
        
        // Calculate weekly performance
        const weeks = Math.ceil(totalDays / 7);
        let bestWeek = { week: 1, rate: 0 };
        let worstWeek = { week: 1, rate: 100 };
        
        for (let week = 0; week < weeks; week++) {
            const startDay = week * 7 + 1;
            const endDay = Math.min((week + 1) * 7, totalDays);
            
            let totalTasks = 0;
            let completedTasks = 0;
            
            for (let day = startDay; day <= endDay; day++) {
                this.tasks.forEach(task => {
                    totalTasks++;
                    if (this.progressData[day][task]) completedTasks++;
                });
            }
            
            const rate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            if (rate > bestWeek.rate) {
                bestWeek = { week: week + 1, rate };
            }
            if (rate < worstWeek.rate) {
                worstWeek = { week: week + 1, rate };
            }
        }
        
        // Calculate task performance
        const taskCompletion = this.tasks.map(task => {
            let completed = 0;
            for (let day = 1; day <= totalDays; day++) {
                if (this.progressData[day][task]) completed++;
            }
            return { task, rate: totalDays > 0 ? (completed / totalDays) * 100 : 0 };
        });
        
        const bestTask = taskCompletion.reduce((prev, current) => 
            prev.rate > current.rate ? prev : current);
        const worstTask = taskCompletion.reduce((prev, current) => 
            prev.rate < current.rate ? prev : current);
        
        const taskNames = {
            diet: 'Diet',
            workout1: 'First Workout',
            workout2: 'Outdoor Workout',
            water: 'Water Intake',
            reading: 'Reading',
            photo: 'Progress Photos'
        };
        
        // Calculate average daily completion
        const totalPossibleTasks = totalDays * this.tasks.length;
        const completedTasks = Object.values(this.progressData)
            .slice(0, totalDays)
            .reduce((total, day) => {
                return total + this.tasks.filter(task => day[task]).length;
            }, 0);
        
        const avgCompletion = totalPossibleTasks > 0 ? 
            Math.round((completedTasks / totalPossibleTasks) * 100) : 0;
        
        // Update DOM elements
        document.getElementById('bestWeek').textContent = 
            weeks > 1 ? `Week ${bestWeek.week} (${Math.round(bestWeek.rate)}%)` : 'N/A';
        document.getElementById('worstWeek').textContent = 
            weeks > 1 ? `Week ${worstWeek.week} (${Math.round(worstWeek.rate)}%)` : 'N/A';
        document.getElementById('bestTask').textContent = 
            `${taskNames[bestTask.task]} (${Math.round(bestTask.rate)}%)`;
        document.getElementById('worstTask').textContent = 
            `${taskNames[worstTask.task]} (${Math.round(worstTask.rate)}%)`;
        document.getElementById('avgCompletion').textContent = `${avgCompletion}%`;
        document.getElementById('daysToGo').textContent = 
            totalDays < 75 ? `${75 - totalDays} days` : 'Challenge Complete!';
    }

    // Test function to complete all 75 days (for testing purposes)
    testCompleteChallenge() {
        console.log('🧪 Testing challenge completion...');
        
        // Complete all 75 days
        for (let day = 1; day <= 75; day++) {
            this.tasks.forEach(task => {
                this.progressData[day][task] = true;
            });
            this.progressData[day].completed = true;
        }
        
        // Set current day to 75
        this.currentDay = 75;
        
        // Save data and update display
        this.saveProgressData();
        this.loadDayTasks();
        this.updateDisplay();
        this.generateCalendar();
        this.checkChallengeCompletion();
        
        console.log('✅ Challenge completion test triggered!');
        console.log('🎉 Check for confetti and completion section!');
    }

    // Test function to complete just today (for daily testing)
    testCompleteToday() {
        console.log('🧪 Testing daily completion...');
        
        // Complete all tasks for current day
        this.tasks.forEach(task => {
            this.progressData[this.currentDay][task] = true;
            const checkbox = document.getElementById(task);
            checkbox.checked = true;
            const taskItem = checkbox.closest('.task-item');
            taskItem.classList.add('completed');
        });
        
        this.checkDayCompletion();
        this.saveProgressData();
        this.updateDisplay();
        this.updateCalendar();
        
        console.log('✅ Today completed! Check for completion message!');
    }

    // Toggle rules section visibility
    toggleRulesSection() {
        const rulesSection = document.querySelector('.rules-section');
        rulesSection.classList.toggle('collapsed');

        // Update collapse icon
        const collapseIcon = document.querySelector('.collapse-icon');
        collapseIcon.textContent = rulesSection.classList.contains('collapsed') ? '+' : '−';
    }

    // Test function to reset everything
    testReset() {
        console.log('🧪 Testing reset functionality...');
        this.resetChallenge();
        console.log('✅ Reset test completed!');
    }

    // Function to return to normal view (hide completion section)
    returnToNormalView() {
        // Hide completion section
        document.getElementById('completionSection').style.display = 'none';
        
        // Stop any ongoing confetti
        if (this.confettiInterval) {
            clearInterval(this.confettiInterval);
            this.confettiInterval = null;
        }
        
        // Remove any remaining confetti pieces
        const confettiPieces = document.querySelectorAll('[style*="confettiFall"]');
        confettiPieces.forEach(piece => {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        });
        
        // Reset to Day 1 if currently showing completion
        if (this.currentDay === 75) {
            this.currentDay = 1;
            this.loadDayTasks();
            this.updateDisplay();
            this.updateCalendar();
        }
        
        console.log('✅ Returned to normal view!');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Make tracker globally accessible for testing
    window.tracker = new SeventyFiveHardTracker();
    
    // Add console helpers for testing
    console.log('🎆 75 Hard Challenge Tracker Loaded!');
    console.log('🧪 Testing Commands Available:');
    console.log('  tracker.testCompleteChallenge() - Complete all 75 days');
    console.log('  tracker.testCompleteToday() - Complete today\'s tasks');
    console.log('  tracker.returnToNormalView() - Return to normal view');
    console.log('  tracker.testReset() - Reset the challenge');
    console.log('  tracker.showAnalytics() - Open analytics modal');
});
