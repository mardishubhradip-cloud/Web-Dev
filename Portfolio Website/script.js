/**
 * CS Portfolio - Client Side Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. EMAIL COPY FUNCTIONALITY & TOAST
     ========================================================================== */
  const userEmail = "mardishubhradip@gmail.com"; 
  const toast = document.getElementById('toastNotification');

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  const copyEmailHeroBtn = document.getElementById('copyEmailHeroBtn');
  const copyEmailContactBtn = document.getElementById('copyEmailContactBtn');

  if (copyEmailHeroBtn) {
    copyEmailHeroBtn.addEventListener('click', () => copyToClipboard(userEmail));
  }
  if (copyEmailContactBtn) {
    copyEmailContactBtn.addEventListener('click', () => copyToClipboard(userEmail));
  }


  /* ==========================================================================
     2. PROJECT CATEGORY FILTERING
     ========================================================================== */
  const filterTabs = document.querySelectorAll('.tab-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCategory === filterValue) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  /* ==========================================================================
     3. INTERACTIVE TERMINAL CODE SWITCHER
     ========================================================================== */
  const codeTabs = document.querySelectorAll('.code-tab');
  const codeDisplay = document.getElementById('codeDisplay');

  const codeSnippets = {
    'c-list': `// C Linked List Insertion in O(1)
typedef struct Node {
    int data;
    struct Node* next;
} Node;

void insertAtFront(Node** head_ref, int new_data) {
    Node* new_node = (Node*)malloc(sizeof(Node));
    new_node->data = new_data;
    new_node->next = (*head_ref);
    (*head_ref) = new_node;
}`,
    'node-route': `// Express REST API Route for Student Marks
app.get('/api/v1/marksheet/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        const records = await db.all(
            'SELECT subject, score, credits FROM marks WHERE student_id = ?', 
            [studentId]
        );
        res.json({ status: 'success', data: records });
    } catch (err) {
        res.status(500).json({ error: 'Database query execution failed' });
    }
});`
  };

  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabKey = tab.getAttribute('data-tab');
      if (codeSnippets[tabKey]) {
        codeDisplay.textContent = codeSnippets[tabKey];
      }
    });
  });


  /* ==========================================================================
     4. CASE STUDY MODAL DATA & HANDLERS
     ========================================================================== */
  const caseStudies = {
    marksheet: `
      <div class="modal-body">
        <h3>Academic Marksheet & GPA Portal</h3>
        <p><strong>Architecture Overview:</strong> Built a decoupled client-server web portal to process semester marksheets dynamically.</p>
        <h4>Key Technical Highlights:</h4>
        <ul>
          <li>Integrated SQLite with parameterized SQL queries to safeguard against SQL Injection vulnerabilities.</li>
          <li>Client-side vanilla JavaScript calculates GPA algorithms without server reload latency.</li>
          <li>Implemented clean error handling for non-existent student IDs and database timeout states.</li>
        </ul>
      </div>
    `,
    linkedlist: `
      <div class="modal-body">
        <h3>C Memory Management & Linked List Library</h3>
        <p><strong>Architecture Overview:</strong> Low-level memory manipulation program designed in C to benchmark dynamic allocation vs array storage.</p>
        <h4>Key Technical Highlights:</h4>
        <ul>
          <li>Zero dynamic memory leaks verified using Valgrind execution tracing.</li>
          <li>Implemented pointer arithmetic for doubly linked nodes and dynamic list traversal algorithms.</li>
          <li>Analyzed trade-offs: $O(1)$ constant time insertion vs $O(n)$ search traversal overhead.</li>
        </ul>
      </div>
    `,
  };

  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      if (caseStudies[projectKey]) {
        modalBody.innerHTML = caseStudies[projectKey];
        modalOverlay.classList.add('active');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }


  /* ==========================================================================
     5. MOBILE MENU TOGGLE
     ========================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

});