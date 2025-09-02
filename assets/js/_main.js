/* ==========================================================================
   jQuery plugin settings and other scripts
   ========================================================================== */

$(document).ready(function(){
  
  // Brave Browser Compatibility Helper
  function addEventListenerSafe(element, event, handler) {
    try {
      if (element && typeof element === 'object') {
        if (element.addEventListener) {
          element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
          element.attachEvent('on' + event, handler);
        } else {
          element['on' + event] = handler;
        }
        return true;
      }
    } catch (error) {
      console.warn('Failed to attach event listener:', error);
    }
    return false;
  }
  
  // Make it globally available
  window.addEventListenerSafe = addEventListenerSafe;
   
   // Sticky footer
  var bumpIt = function() {
      $("body").css("margin-bottom", $(".page__footer").outerHeight(true));
    },
    didResize = false;

  bumpIt();

  $(window).resize(function() {
    didResize = true;
  });
  setInterval(function() {
    if (didResize) {
      didResize = false;
      bumpIt();
    }
  }, 250);
  // FitVids init
  $("#main").fitVids();

  // init sticky sidebar
  $(".sticky").Stickyfill();

  var stickySideBar = function(){
    var show = $(".author__urls-wrapper button").length === 0 ? $(window).width() > 1024 : !$(".author__urls-wrapper button").is(":visible");
    // console.log("has button: " + $(".author__urls-wrapper button").length === 0);
    // console.log("Window Width: " + windowWidth);
    // console.log("show: " + show);
    //old code was if($(window).width() > 1024)
    if (show) {
      // fix
      Stickyfill.rebuild();
      Stickyfill.init();
      $(".author__urls").show();
    } else {
      // unfix
      Stickyfill.stop();
      $(".author__urls").hide();
    }
  };

  stickySideBar();

  $(window).resize(function(){
    stickySideBar();
  });

  // Follow menu drop down

  $(".author__urls-wrapper button").on("click", function() {
    $(".author__urls").fadeToggle("fast", function() {});
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // init smooth scroll
  $("a").smoothScroll({offset: -20});

  // add lightbox class to all image links
  $("a[href$='.jpg'],a[href$='.jpeg'],a[href$='.JPG'],a[href$='.png'],a[href$='.gif']").addClass("image-popup");

  // Magnific-Popup options
  $(".image-popup").magnificPopup({
    // disableOn: function() {
    //   if( $(window).width() < 500 ) {
    //     return false;
    //   }
    //   return true;
    // },
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">Image #%curr%</a> could not be loaded.',
    },
    removalDelay: 500, // Delay in milliseconds before popup is removed
    // Class that is added to body when popup is open.
    // make it unique to apply your CSS animations just to this exact popup
    mainClass: 'mfp-zoom-in',
    callbacks: {
      beforeOpen: function() {
        // just a hack that adds mfp-anim class to markup
        this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
      }
    },
    closeOnContentClick: true,
    midClick: true // allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source.
  });

  // Dark Mode Toggle with Brave Browser Compatibility
  function initDarkMode() {
    try {
      const darkModeToggle = document.getElementById('darkModeToggle');
      const toggleIcon = document.getElementById('toggleIcon');
      const html = document.documentElement;
      
      if (!html) {
        console.warn('Document element not found - dark mode disabled');
        return;
      }
      
      // Check for saved theme preference or default to 'light'
      let currentTheme = 'light';
      try {
        currentTheme = localStorage.getItem('theme') || 'light';
      } catch (e) {
        console.warn('localStorage blocked - using default light theme');
      }
      
      // Apply the saved theme
      html.setAttribute('data-theme', currentTheme);
      updateToggleIcon(currentTheme, toggleIcon);
      
      // Toggle theme on button click with fallback for blocked addEventListener
      if (darkModeToggle) {
        const toggleTheme = function() {
          try {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply new theme
            html.setAttribute('data-theme', newTheme);
            updateToggleIcon(newTheme, toggleIcon);
            
            // Save preference (with error handling for privacy browsers)
            try {
              localStorage.setItem('theme', newTheme);
            } catch (e) {
              console.warn('localStorage blocked - theme preference not saved');
            }
            
            // Add a subtle animation with error handling
            try {
              darkModeToggle.style.transform = 'scale(0.95)';
              setTimeout(function() {
                if (darkModeToggle && darkModeToggle.style) {
                  darkModeToggle.style.transform = 'scale(1)';
                }
              }, 100);
            } catch (e) {
              // Animation failed, ignore
            }
          } catch (error) {
            console.error('Theme toggle failed:', error);
          }
        };
        
        // Try modern addEventListener first, fallback to older methods for compatibility
        try {
          if (darkModeToggle.addEventListener) {
            darkModeToggle.addEventListener('click', toggleTheme, false);
          } else if (darkModeToggle.attachEvent) {
            darkModeToggle.attachEvent('onclick', toggleTheme);
          } else {
            darkModeToggle.onclick = toggleTheme;
          }
        } catch (error) {
          console.error('Failed to attach dark mode toggle event:', error);
        }
      }
    } catch (error) {
      console.error('Dark mode initialization failed:', error);
    }
  }
  
  function updateToggleIcon(theme, iconElement) {
    if (iconElement) {
      iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }
  
  // Initialize dark mode when DOM is ready
  initDarkMode();
  
  // Initialize filtering functionality
  initFiltering();
  
  // Initialize expandable cards
  initExpandableCards();

}); // DOM ready

// Filtering functionality
function initFiltering() {
  // Publication filtering
  initPublicationFilters();
  
  // People filtering  
  initPeopleFilters();
}

function initPublicationFilters() {
  var filterTabs = document.querySelectorAll('.publications-filter .filter-tab');
  var keywordTabs = document.querySelectorAll('.keywords-filter .keyword-tab');
  var publicationItems = document.querySelectorAll('.publication-item');
  var publicationSections = document.querySelectorAll('.publications-section');
  
  if (filterTabs.length === 0 || publicationItems.length === 0) return;
  
  function filterPublications() {
    var activePublicationFilter = document.querySelector('.publications-filter .filter-tab.active');
    var activeKeywordFilter = document.querySelector('.keywords-filter .keyword-tab.active');
    var publicationFilterValue = activePublicationFilter ? activePublicationFilter.getAttribute('data-filter') : 'all';
    var keywordFilterValue = activeKeywordFilter ? activeKeywordFilter.getAttribute('data-filter') : 'all-keywords';
    
    publicationItems.forEach(function(item) {
      var itemCategories = (item.getAttribute('data-categories') || '').split(' ');
      var showByPublication = (publicationFilterValue === 'all' || itemCategories.indexOf(publicationFilterValue) !== -1);
      var showByKeyword = (keywordFilterValue === 'all-keywords' || itemCategories.indexOf(keywordFilterValue) !== -1);
      
      if (showByPublication && showByKeyword) {
        item.style.display = 'block';
        item.classList.remove('filtering-out');
      } else {
        item.classList.add('filtering-out');
        setTimeout(function() {
          if (item.classList.contains('filtering-out')) {
            item.style.display = 'none';
          }
        }, 300);
      }
    });
    
    // Update section visibility
    setTimeout(function() {
      publicationSections.forEach(function(section) {
        var visibleItems = section.querySelectorAll('.publication-item:not([style*="display: none"])');
        if (visibleItems.length > 0) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    }, 350);
  }

  filterTabs.forEach(function(tab) {
    addEventListenerSafe(tab, 'click', function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      
      // Update active tab
      filterTabs.forEach(function(t) { 
        if (t && t.classList) {
          t.classList.remove('active'); 
        }
      });
      if (tab && tab.classList) {
        tab.classList.add('active');
      }
      
      filterPublications();
    });
  });
  
  keywordTabs.forEach(function(tab) {
    addEventListenerSafe(tab, 'click', function(e) {
      if (e && e.preventDefault) {
        e.preventDefault();
      }
      
      // Update active tab
      keywordTabs.forEach(function(t) { 
        if (t && t.classList) {
          t.classList.remove('active'); 
        }
      });
      if (tab && tab.classList) {
        tab.classList.add('active');
      }
      
      filterPublications();
    });
  });
  
  // Tag click functionality
  var tags = document.querySelectorAll('.tag');
  tags.forEach(function(tag) {
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      var tagValue = this.getAttribute('data-tag');
      
      // Find corresponding keyword filter and activate it
      var correspondingFilter = document.querySelector('.keywords-filter .keyword-tab[data-filter="' + tagValue + '"]');
      if (correspondingFilter) {
        keywordTabs.forEach(function(t) { t.classList.remove('active'); });
        correspondingFilter.classList.add('active');
        filterPublications();
      }
    });
  });
}

function initPeopleFilters() {
  var filterTabs = document.querySelectorAll('.people-filter .filter-tab');
  var peopleCards = document.querySelectorAll('.person-card');
  var alumniSection = document.querySelector('.alumni-section');
  
  if (filterTabs.length === 0 || peopleCards.length === 0) return;
  
  filterTabs.forEach(function(tab) {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      
      var targetFilter = tab.getAttribute('data-filter');
      
      // Update active tab
      filterTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      
      // Show/hide alumni section based on filter
      if (alumniSection) {
        if (targetFilter === 'alumni') {
          alumniSection.classList.add('visible');
        } else {
          alumniSection.classList.remove('visible');
        }
      }
      
      // Filter people
      peopleCards.forEach(function(card) {
        var cardPosition = card.getAttribute('data-position');
        var isCurrent = card.getAttribute('data-current') === 'true';
        
        var shouldShow = false;
        if (targetFilter === 'current' && isCurrent) {
          shouldShow = true;
        } else if (targetFilter === cardPosition) {
          shouldShow = true;
        }
        
        if (shouldShow) {
          card.style.display = 'block';
          card.classList.remove('filtering-out');
        } else {
          card.classList.add('filtering-out');
          setTimeout(function() {
            if (card.classList.contains('filtering-out')) {
              card.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });
}

// Initialize expandable cards
function initExpandableCards() {
  var personCards = document.querySelectorAll('.person-card');
  var researchCards = document.querySelectorAll('.research-card');
  var communityCards = document.querySelectorAll('.community-card');
  var teachingCards = document.querySelectorAll('.teaching-card');
  
  // Initialize person cards
  if (personCards.length > 0) {
    personCards.forEach(function(card) {
      card.addEventListener('click', function() {
        var isCollapsed = card.classList.contains('collapsed');
        var expandableContent = card.querySelector('.person-card__expandable');
        var indicator = card.querySelector('.person-card__expand-indicator');
        
        if (isCollapsed) {
          // Close all other cards of all types first
          personCards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.person-card__expandable');
              var otherIndicator = otherCard.querySelector('.person-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          researchCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.research-card__expandable');
              var otherIndicator = otherCard.querySelector('.research-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          communityCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.community-card__expandable');
              var otherIndicator = otherCard.querySelector('.community-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          teachingCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.teaching-card__expandable');
              var otherIndicator = otherCard.querySelector('.teaching-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          
          // Expand the clicked card
          card.classList.remove('collapsed');
          card.classList.add('expanded');
          if (expandableContent) {
            expandableContent.classList.add('expanded');
          }
          if (indicator) {
            indicator.textContent = '−';
          }
        } else {
          // Collapse the card
          card.classList.remove('expanded');
          card.classList.add('collapsed');
          if (expandableContent) {
            expandableContent.classList.remove('expanded');
          }
          if (indicator) {
            indicator.textContent = '+';
          }
        }
      });
    });
  }
  
  // Initialize research cards
  if (researchCards.length > 0) {
    researchCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // Check if text is being selected
        var selection = window.getSelection();
        if (selection.toString().length > 0) {
          return; // Don't toggle if text is selected
        }
        
        // Don't toggle if clicking on links or inside expandable content
        if (e.target.tagName === 'A' || e.target.closest('.research-card__expandable')) {
          return;
        }
        
        var isCollapsed = card.classList.contains('collapsed');
        var expandableContent = card.querySelector('.research-card__expandable');
        var indicator = card.querySelector('.research-card__expand-indicator');
        
        if (isCollapsed) {
          // Close all other cards of all types first
          personCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.person-card__expandable');
              var otherIndicator = otherCard.querySelector('.person-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          researchCards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.research-card__expandable');
              var otherIndicator = otherCard.querySelector('.research-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          communityCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.community-card__expandable');
              var otherIndicator = otherCard.querySelector('.community-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          teachingCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.teaching-card__expandable');
              var otherIndicator = otherCard.querySelector('.teaching-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          
          // Expand the clicked card
          card.classList.remove('collapsed');
          card.classList.add('expanded');
          if (expandableContent) {
            expandableContent.classList.add('expanded');
          }
          if (indicator) {
            indicator.textContent = '×';
          }
        } else {
          // Collapse the card
          card.classList.remove('expanded');
          card.classList.add('collapsed');
          if (expandableContent) {
            expandableContent.classList.remove('expanded');
          }
          if (indicator) {
            indicator.textContent = '+';
          }
        }
      });
    });
  }
  
  // Initialize community cards
  if (communityCards.length > 0) {
    communityCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // Check if text is being selected
        var selection = window.getSelection();
        if (selection.toString().length > 0) {
          return; // Don't toggle if text is selected
        }
        
        // Don't toggle if clicking on links or inside expandable content
        if (e.target.tagName === 'A' || e.target.closest('.community-card__expandable')) {
          return;
        }
        
        var isCollapsed = card.classList.contains('collapsed');
        var expandableContent = card.querySelector('.community-card__expandable');
        var indicator = card.querySelector('.community-card__expand-indicator');
        
        if (isCollapsed) {
          // Close all other cards of all types first
          personCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.person-card__expandable');
              var otherIndicator = otherCard.querySelector('.person-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          researchCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.research-card__expandable');
              var otherIndicator = otherCard.querySelector('.research-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          communityCards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.community-card__expandable');
              var otherIndicator = otherCard.querySelector('.community-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          
          // Expand the clicked card
          card.classList.remove('collapsed');
          card.classList.add('expanded');
          if (expandableContent) {
            expandableContent.classList.add('expanded');
          }
          if (indicator) {
            indicator.textContent = '×';
          }
        } else {
          // Collapse the card
          card.classList.remove('expanded');
          card.classList.add('collapsed');
          if (expandableContent) {
            expandableContent.classList.remove('expanded');
          }
          if (indicator) {
            indicator.textContent = '+';
          }
        }
      });
    });
  }
  
  // Initialize photography cards
  var photographyCards = document.querySelectorAll('.photography-card');
  if (photographyCards.length > 0) {
    photographyCards.forEach(function(card) {
      var header = card.querySelector('.photography-card__header');
      if (header) {
        header.addEventListener('click', function() {
          // Close other cards
          photographyCards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
            }
          });
          
          // Toggle current card
          card.classList.toggle('expanded');
          card.classList.toggle('collapsed');
        });
      }
    });
  }
  
  // Initialize teaching cards
  if (teachingCards.length > 0) {
    teachingCards.forEach(function(card) {
      card.addEventListener('click', function(e) {
        // Check if text is being selected
        var selection = window.getSelection();
        if (selection.toString().length > 0) {
          return; // Don't toggle if text is selected
        }
        
        // Don't toggle if clicking on links or inside expandable content
        if (e.target.tagName === 'A' || e.target.closest('.teaching-card__expandable')) {
          return;
        }
        
        var isCollapsed = card.classList.contains('collapsed');
        var expandableContent = card.querySelector('.teaching-card__expandable');
        var indicator = card.querySelector('.teaching-card__expand-indicator');
        
        if (isCollapsed) {
          // Close all other cards of all types first
          personCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.person-card__expandable');
              var otherIndicator = otherCard.querySelector('.person-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          researchCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.research-card__expandable');
              var otherIndicator = otherCard.querySelector('.research-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          communityCards.forEach(function(otherCard) {
            if (otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.community-card__expandable');
              var otherIndicator = otherCard.querySelector('.community-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          teachingCards.forEach(function(otherCard) {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');
              otherCard.classList.add('collapsed');
              var otherExpandable = otherCard.querySelector('.teaching-card__expandable');
              var otherIndicator = otherCard.querySelector('.teaching-card__expand-indicator');
              if (otherExpandable) {
                otherExpandable.classList.remove('expanded');
              }
              if (otherIndicator) {
                otherIndicator.textContent = '+';
              }
            }
          });
          
          // Expand the clicked card
          card.classList.remove('collapsed');
          card.classList.add('expanded');
          if (expandableContent) {
            expandableContent.classList.add('expanded');
          }
          if (indicator) {
            indicator.textContent = '×';
          }
        } else {
          // Collapse the card
          card.classList.remove('expanded');
          card.classList.add('collapsed');
          if (expandableContent) {
            expandableContent.classList.remove('expanded');
          }
          if (indicator) {
            indicator.textContent = '+';
          }
        }
      });
    });
  }
}
