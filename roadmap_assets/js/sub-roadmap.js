document.addEventListener('DOMContentLoaded', () => {
    // Navigation Menu Logic
    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', () => {
            const expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !expanded);
            navLinks.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.nav-container')) {
                menuButton.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
            }
        });
    }

    // Toggle Topic Cards
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach(card => {
        const header = card.querySelector('.topic-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
    });

    // Tab Switching Logic
    const topicContents = document.querySelectorAll('.topic-content');
    topicContents.forEach(content => {
        const tabs = content.querySelectorAll('.tab-btn');
        const bundles = content.querySelectorAll('.bundle');

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs in this topic
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                e.target.classList.add('active');

                // Hide all bundles
                bundles.forEach(b => b.classList.remove('active'));

                // Show corresponding bundle
                const level = e.target.dataset.level;
                const topicCard = content.closest('.topic-card');
                const topicId = topicCard.dataset.topic;
                const targetBundle = content.querySelector(`#${topicId}-${level}`);

                if (targetBundle) {
                    targetBundle.classList.add('active');
                }
            });
        });
    });

    // Progress Tracking Logic
    const updateProgress = (topicCard) => {
        const checkboxes = topicCard.querySelectorAll('.status-check');
        const checked = topicCard.querySelectorAll('.status-check:checked');
        const progressBar = topicCard.querySelector('.progress-bar');
        const progressText = topicCard.querySelector('.progress-text');

        if (checkboxes.length > 0) {
            const percentage = Math.round((checked.length / checkboxes.length) * 100);
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% Completed`;

            // Save to localStorage
            const topicId = topicCard.dataset.topic;
            const checkedIds = Array.from(checked).map(cb => cb.dataset.id);
            localStorage.setItem(`dsa-progress-${topicId}`, JSON.stringify(checkedIds));

            // Trigger Confetti if 100%
            if (percentage === 100) {
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            }
        }
    };

    // Initialize Checkboxes and Progress
    const checkboxes = document.querySelectorAll('.status-check');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const topicCard = e.target.closest('.topic-card');
            updateProgress(topicCard);
        });
    });

    // Load Progress from LocalStorage
    topicCards.forEach(card => {
        const topicId = card.dataset.topic;
        const savedProgress = JSON.parse(localStorage.getItem(`dsa-progress-${topicId}`)) || [];

        savedProgress.forEach(id => {
            const checkbox = card.querySelector(`.status-check[data-id="${id}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        updateProgress(card);
    });

    // Solve Modal Logic
    window.openSolveModal = (title, url) => {
        const modal = document.getElementById('solve-modal');
        const modalTitle = document.getElementById('solve-problem-title');
        const iframe = document.getElementById('leetcode-frame');

        if (modal && modalTitle && iframe) {
            modalTitle.textContent = title;
            iframe.src = url;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }
    };

    window.closeSolveModal = () => {
        const modal = document.getElementById('solve-modal');
        const iframe = document.getElementById('leetcode-frame');

        if (modal) {
            modal.classList.remove('show');
            if (iframe) iframe.src = ''; // Clear src to stop video/loading
            document.body.style.overflow = ''; // Restore scrolling
        }
    };

    // Close modal when clicking outside
    const modal = document.getElementById('solve-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeSolveModal();
            }
        });
    }

    // Ripple Effect for Buttons (Optional Polish)
    document.querySelectorAll('.solve-btn, .tab-btn, .expand-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

            setTimeout(() => ripple.remove(), 600);
        });
    });
});