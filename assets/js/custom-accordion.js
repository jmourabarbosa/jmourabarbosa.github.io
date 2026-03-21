// Unified accordion behavior for all expandable card sections
// Single system replacing both custom-accordion.js and initExpandableCards()

window.initCustomAccordion = function() {
    // All card type configurations
    var cardTypes = [
        { container: '.publications-container', card: '.publication-item', indicator: '.publication-item__expand-indicator' },
        { container: '.teaching-columns', card: '.teaching-card', indicator: '.teaching-card__expand-indicator' },
        { container: '.photography-container', card: '.photography-card', indicator: '.photography-card__expand-indicator' }
    ];

    // People is special: multiple grids share one accordion group
    var peopleGrids = document.querySelectorAll('.people-grid');

    // Collect ALL cards and indicators across all types for cross-container closing
    var allCards = [];
    var allIndicatorSelectors = {};

    cardTypes.forEach(function(type) {
        var container = document.querySelector(type.container);
        if (!container) return;
        var cards = container.querySelectorAll(type.card);
        cards.forEach(function(card) { allCards.push({ el: card, type: type }); });
    });

    peopleGrids.forEach(function(grid) {
        var cards = grid.querySelectorAll('.person-card, .alumni-card');
        cards.forEach(function(card) {
            allCards.push({ el: card, type: { indicator: '.person-card__expand-indicator' } });
        });
    });

    // Close a single card
    function closeCard(cardEl, indicatorSelector) {
        cardEl.classList.remove('expanded');
        cardEl.classList.add('collapsed');
        var expandable = cardEl.querySelector(indicatorSelector.replace('__expand-indicator', '__expandable'));
        if (expandable) expandable.classList.remove('expanded');
        var ind = cardEl.querySelector(indicatorSelector);
        if (ind) ind.textContent = '+';
    }

    // Close all cards across ALL containers
    function closeAllCards(exceptEl) {
        allCards.forEach(function(entry) {
            if (entry.el !== exceptEl && entry.el.classList.contains('expanded')) {
                closeCard(entry.el, entry.type.indicator);
            }
        });
    }

    // Should we suppress the toggle?
    function shouldSuppress(e) {
        // Don't toggle if user is selecting text
        var selection = window.getSelection();
        if (selection && selection.toString().length > 0) return true;
        // Don't toggle if clicking a link
        if (e.target.tagName === 'A' || (e.target.closest && e.target.closest('a'))) return true;
        // Don't toggle if clicking CMS buttons
        if (e.target.closest && e.target.closest('.cms-edit-btn, .cms-delete-btn, .cms-add-btn')) return true;
        return false;
    }

    // Set up a card type
    function setupCards(containerSelector, cardSelector, indicatorSelector, scrollIntoView, toggleSelector) {
        var container = document.querySelector(containerSelector);
        if (!container) return;

        var cards = container.querySelectorAll(cardSelector);

        cards.forEach(function(card) {
            // Use the card header as the click target (the whole header area, not just indicator)
            var header = card.querySelector(indicatorSelector.replace('__expand-indicator', '__header'));
            var clickTarget = (toggleSelector && card.querySelector(toggleSelector)) || header || card;

            if (!card.querySelector(indicatorSelector)) return;

            if (clickTarget._accordionInit) return;
            clickTarget._accordionInit = true;

            clickTarget.addEventListener('click', function(e) {
                if (shouldSuppress(e)) return;

                var isExpanded = card.classList.contains('expanded');

                // Close all other cards across all containers
                closeAllCards(card);

                if (isExpanded) {
                    closeCard(card, indicatorSelector);
                } else {
                    card.classList.remove('collapsed');
                    card.classList.add('expanded');
                    var expandable = card.querySelector(indicatorSelector.replace('__expand-indicator', '__expandable'));
                    if (expandable) expandable.classList.add('expanded');
                    var ind = card.querySelector(indicatorSelector);
                    if (ind) ind.textContent = '\u2212'; // minus sign

                    if (scrollIntoView) {
                        setTimeout(function() {
                            var cardRect = card.getBoundingClientRect();
                            var currentScrollY = window.pageYOffset;
                            var cardTopRelativeToPage = cardRect.top + currentScrollY;
                            var targetScrollY = cardTopRelativeToPage - 200;
                            window.scrollTo({ top: Math.max(0, targetScrollY), behavior: 'smooth' });
                        }, 100);
                    }
                }
            });
        });
    }

    // Set up each card type
    cardTypes.forEach(function(type) {
        setupCards(type.container, type.card, type.indicator, type.scrollIntoView, type.toggleSelector);
    });

    // Set up people cards (special: multiple grids share accordion)
    if (peopleGrids.length > 0) {
        var allPeopleCards = [];
        peopleGrids.forEach(function(grid) {
            var cards = grid.querySelectorAll('.person-card, .alumni-card');
            cards.forEach(function(card) { allPeopleCards.push(card); });
        });

        allPeopleCards.forEach(function(card) {
            var header = card.querySelector('.person-card__header');
            var clickTarget = header || card;

            if (clickTarget._accordionInit) return;
            clickTarget._accordionInit = true;

            clickTarget.addEventListener('click', function(e) {
                if (shouldSuppress(e)) return;

                var isExpanded = card.classList.contains('expanded');

                closeAllCards(card);

                if (isExpanded) {
                    closeCard(card, '.person-card__expand-indicator');
                } else {
                    card.classList.remove('collapsed');
                    card.classList.add('expanded');
                    var expandable = card.querySelector('.person-card__expandable');
                    if (expandable) expandable.classList.add('expanded');
                    var ind = card.querySelector('.person-card__expand-indicator');
                    if (ind) ind.textContent = '\u2212';
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    window.initCustomAccordion();
});
