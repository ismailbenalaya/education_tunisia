document.addEventListener('DOMContentLoaded', () => {
    console.log('Modern Blog Loaded');

    // Add scroll animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    });

    document.querySelectorAll('.blog-card, .stat-item, .pull-quote, h2, p').forEach((el) => {
        observer.observe(el);
    });

    // Poll Functionality
    const pollContainer = document.getElementById('poll-container');
    if (pollContainer) {
        // Check if already voted
        const hasVoted = localStorage.getItem('tunisia_edu_vote');
        if (hasVoted) {
            showPollResults(hasVoted);
        }
    }
});

function vote(choice) {
    localStorage.setItem('tunisia_edu_vote', choice);
    showPollResults(choice);
}

function showPollResults(userChoice) {
    const pollContainer = document.getElementById('poll-container');
    if (!pollContainer) return;

    // Simulated results
    const results = {
        satisfied: 29,
        dissatisfied: 71
    };

    // Adjust slightly based on user vote for "live" feel
    if (userChoice === 'satisfied') results.satisfied++;
    else results.dissatisfied++;

    const total = results.satisfied + results.dissatisfied;
    const satPct = Math.round((results.satisfied / total) * 100);
    const disPct = 100 - satPct;

    pollContainer.innerHTML = `
        <div style="margin-top: 20px; text-align: left;">
            <p><strong>Thank you for voting!</strong> Here are the current results:</p>
            
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Satisfied</span>
                    <span>${satPct}%</span>
                </div>
                <div style="height: 20px; background: #eee; border-radius: 10px; overflow: hidden;">
                    <div style="height: 100%; width: ${satPct}%; background: var(--success);"></div>
                </div>
            </div>

            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Dissatisfied</span>
                    <span>${disPct}%</span>
                </div>
                <div style="height: 20px; background: #eee; border-radius: 10px; overflow: hidden;">
                    <div style="height: 100%; width: ${disPct}%; background: var(--tunisia-red);"></div>
                </div>
            </div>
        </div>
    `;
}

async function submitSurvey(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    // Netlify needs the form-name attribute
    formData.append('form-name', 'student-survey');

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Submitting...';
    btn.disabled = true;

    try {
        const response = await fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
            form.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3 style="color: var(--success); font-size: 2rem;">Thank You!</h3>
                    <p>Your feedback has been recorded.</p>
                    <button onclick="window.location.reload()" style="background: var(--text-primary); color: white; padding: 10px 20px; border: none; border-radius: 8px; margin-top: 20px; cursor: pointer;">Submit Another</button>
                </div>
            `;
        } else {
            alert('Error submitting form. Please try again.');
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
