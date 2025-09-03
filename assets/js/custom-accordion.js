// Custom accordion behavior for publications and people sections
// Make cards close when another is opened (like teaching section)

document.addEventListener('DOMContentLoaded', function() {
    // Function to handle card expansion
    function setupAccordionBehavior(containerSelector, cardSelector, expandSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const expandIndicators = container.querySelectorAll(expandSelector);
        
        expandIndicators.forEach(indicator => {
            indicator.addEventListener('click', function(e) {
                const clickedCard = this.closest(cardSelector);
                const allCards = container.querySelectorAll(cardSelector);
                
                // Close all other cards in this container
                allCards.forEach(card => {
                    if (card !== clickedCard) {
                        card.classList.remove('expanded');
                        card.classList.add('collapsed');
                        const otherIndicator = card.querySelector(expandSelector);
                        if (otherIndicator) {
                            otherIndicator.textContent = '+';
                        }
                    }
                });
                
                // Toggle the clicked card
                const isExpanded = clickedCard.classList.contains('expanded');
                if (isExpanded) {
                    clickedCard.classList.remove('expanded');
                    clickedCard.classList.add('collapsed');
                    this.textContent = '+';
                } else {
                    clickedCard.classList.remove('collapsed');
                    clickedCard.classList.add('expanded');
                    this.textContent = '−';
                }
            });
        });
    }
    
    // Apply accordion behavior to publications
    setupAccordionBehavior('.publications-container', '.publication-item', '.publication-item__expand-indicator');
    
    // Apply accordion behavior to people - handle both current and alumni sections
    function setupPeopleAccordion() {
        // Get all people grids (main and alumni)
        const peopleGrids = document.querySelectorAll('.people-grid');
        if (peopleGrids.length === 0) return;
        
        // Combine all expand indicators from all people grids
        let allExpandIndicators = [];
        let allCards = [];
        
        peopleGrids.forEach(grid => {
            const indicators = grid.querySelectorAll('.person-card__expand-indicator');
            const cards = grid.querySelectorAll('.person-card, .alumni-card');
            allExpandIndicators = allExpandIndicators.concat(Array.from(indicators));
            allCards = allCards.concat(Array.from(cards));
        });
        
        allExpandIndicators.forEach(indicator => {
            indicator.addEventListener('click', function(e) {
                const clickedCard = this.closest('.person-card, .alumni-card');
                
                // Close all other cards across all people grids
                allCards.forEach(card => {
                    if (card !== clickedCard) {
                        card.classList.remove('expanded');
                        card.classList.add('collapsed');
                        const otherIndicator = card.querySelector('.person-card__expand-indicator');
                        if (otherIndicator) {
                            otherIndicator.textContent = '+';
                        }
                    }
                });
                
                // Toggle the clicked card
                const isExpanded = clickedCard.classList.contains('expanded');
                if (isExpanded) {
                    clickedCard.classList.remove('expanded');
                    clickedCard.classList.add('collapsed');
                    this.textContent = '+';
                } else {
                    clickedCard.classList.remove('collapsed');
                    clickedCard.classList.add('expanded');
                    this.textContent = '−';
                }
            });
        });
    }
    
    setupPeopleAccordion();
    
    // Apply accordion behavior to research cards - custom function to ensure it works like people section
    function setupResearchAccordion() {
        const researchGrid = document.querySelector('.research-grid');
        if (!researchGrid) return;
        
        const expandIndicators = researchGrid.querySelectorAll('.research-card__expand-indicator');
        const allCards = researchGrid.querySelectorAll('.research-card');
        
        expandIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const clickedCard = this.closest('.research-card');
                
                // Close all other cards
                allCards.forEach((card, cardIndex) => {
                    if (card !== clickedCard) {
                        card.classList.remove('expanded');
                        card.classList.add('collapsed');
                        const otherIndicator = card.querySelector('.research-card__expand-indicator');
                        if (otherIndicator) {
                            otherIndicator.textContent = '+';
                        }
                    }
                });
                
                // Toggle the clicked card
                const isExpanded = clickedCard.classList.contains('expanded');
                if (isExpanded) {
                    clickedCard.classList.remove('expanded');
                    clickedCard.classList.add('collapsed');
                    this.textContent = '+';
                } else {
                    clickedCard.classList.remove('collapsed');
                    clickedCard.classList.add('expanded');
                    this.textContent = '−';
                    
                    // Scroll to position the card optimally in view
                    setTimeout(() => {
                        const cardRect = clickedCard.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        const cardHeight = clickedCard.offsetHeight;
                        
                        // Calculate optimal scroll position
                        // Position card so it starts near the top but leaves some space for context
                        const optimalOffset = 200; // Leave 200px from top for masthead/context
                        const currentScrollY = window.pageYOffset;
                        const cardTopRelativeToPage = cardRect.top + currentScrollY;
                        const targetScrollY = cardTopRelativeToPage - optimalOffset;
                        
                        // Smooth scroll to the calculated position
                        window.scrollTo({
                            top: Math.max(0, targetScrollY),
                            behavior: 'smooth'
                        });
                    }, 100); // Small delay to let expansion animation start
                }
            });
        });
    }
    
    setupResearchAccordion();
    
    // Apply accordion behavior to community cards
    setupAccordionBehavior('.community-grid', '.community-card', '.community-card__expand-indicator');
    
    // Apply accordion behavior to photography cards
    setupAccordionBehavior('.photography-container', '.photography-card', '.photography-card__expand-indicator');
});