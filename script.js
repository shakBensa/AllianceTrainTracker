// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQRyrT_vNedX9P6f_IAF_d7Gaq4XVfc44",
  authDomain: "alliancetraintracker.firebaseapp.com",
  projectId: "alliancetraintracker",
  storageBucket: "alliancetraintracker.firebasestorage.app",
  messagingSenderId: "737773515471",
  appId: "1:737773515471:web:046343167f0ed017167dba",
  measurementId: "G-R3TFVLVN8H"
};

// Firebase Collections
const COLLECTIONS = {
  MEMBERS: 'members',
  LEADERS: 'leaders',
  HISTORY: 'history',
  TRAIN_HISTORY: 'trainHistory',
  SETTINGS: 'settings',
  SESSIONS: 'sessions',
  SERVER_TIME: 'serverTime',
  ANNOUNCEMENTS: 'announcements'
};

// Default members if none are stored
const DEFAULT_MEMBERS = [
  { id: "member1", name: "Gstar79", role: "r4r5" },
  { id: "member2", name: "Venduro", role: "r4r5" },
  { id: "member3", name: "anonymous86", role: "r4r5" },
  { id: "member4", name: "eowynna", role: "r4r5" },
  { id: "member5", name: "MamaBear861", role: "leader" },
  { id: "member6", name: "mamabear junior", role: "regular" },
];

// Conductor rotation order
const CONDUCTOR_ROTATION = [
  "DeanThePenguin", // index 0
  "MamaBear861",    // index 1
  "Venduro",        // index 2
  "Gstar79",        // index 3
  "anonymous86",    // index 4
  "Relentless74",   // index 5
  "Yassler",        // index 6
  "eowynna",        // index 7
  "Mapache000",     // index 8
  "mamabear junior",// index 9
  "Spliffaholic"    // index 10
];

// The current position in the conductor rotation (start at the 8th position - eowynna)
let currentConductorIndex = 8; // Index 8 is Mapacha000's

// Application State
const state = {
  members: [],
  leaders: [],
  r4r5Members: [],
  playerWagonHistory: {},
  trainHistory: [],
  currentWagons: [],
  isLoading: true,
  error: null,
  serverTime: new Date(),
  timeUntilNextTrain: null,
  dataInitialized: false,
  currentConductorIndex: currentConductorIndex, // Store the current index in the state
  isEditingRotation: false, // Flag for editing rotation mode
  editingDocumentId: null, // Store the document ID being edited
  historyPage: 1,       // Current page in history view
  historyPageSize: 5,    // Number of history items per page
  announcementPage: 1,
  announcementPageSize: 5
};

// Additional Firestore Settings
const SETTINGS_COLLECTION = 'settings';
const CONDUCTOR_INDEX_DOC = 'conductorRotation';
const PASSWORD_DOC = 'adminPassword';
const DEFAULT_PASSWORD = 'shoo2025'; // Default password if none is set

// Initialize Firebase
let db;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  showError('Failed to initialize Firebase. Please try again.');
}

// DOM Element References
const loadingContainer = document.getElementById('loading-container');
const trainContainer = document.getElementById('train-container');
const serverTimeElement = document.getElementById('server-time');
const nextTrainElement = document.getElementById('next-train');
const errorMessage = document.getElementById('error-message');
const retryButton = document.getElementById('retry-button');
const generateTrainButton = document.getElementById('generate-train-modal-button');
const forceRegenerateTrainButton = document.getElementById('force-regenerate-train-button');
const manageMembersButton = document.getElementById('manage-members-button');
const viewHistoryButton = document.getElementById('view-history-button');
const announcementsButton = document.getElementById('announcements-button');
const screenshotButton = document.getElementById('screenshot-button');
const editRotationButton = document.getElementById('edit-rotation-button');
const saveRotationButton = document.getElementById('save-rotation-button');
const cancelRotationButton = document.getElementById('cancel-rotation-button');
const membersModal = document.getElementById('members-modal');
const historyModal = document.getElementById('history-modal');
const announcementsModal = document.getElementById('announcements-modal');
const screenshotModal = document.getElementById('screenshot-modal');
const historyList = document.getElementById('history-list');
const announcementsList = document.getElementById('announcements-list');
const passwordModal = document.getElementById('password-modal');
const closeMembersModalButton = document.getElementById('close-members-modal');
const closeHistoryModalButton = document.getElementById('close-history-modal');
const closeAnnouncementsModalButton = document.getElementById('close-announcements-modal');
const closePasswordModalButton = document.getElementById('close-password-modal');
const closeScreenshotModalButton = document.getElementById('close-screenshot-modal');
const screenshotImage = document.getElementById('screenshot-image');
const downloadScreenshotButton = document.getElementById('download-screenshot');
const shareScreenshotButton = document.getElementById('share-screenshot');
const closeScreenshotButton = document.getElementById('close-screenshot');
const addMemberButton = document.getElementById('add-member-button');
const newMemberNameInput = document.getElementById('new-member-name');
const addBulkMembersButton = document.getElementById('add-bulk-members-button');
const bulkMembersInput = document.getElementById('bulk-members-input');
const exportMembersButton = document.getElementById('export-members-button');
const authButton = document.getElementById('auth-button');
const lockIcon = document.querySelector('.lock-icon');
const unlockIcon = document.querySelector('.unlock-icon');
const adminPassword = document.getElementById('admin-password');
const submitPasswordButton = document.getElementById('submit-password');
const cancelPasswordButton = document.getElementById('cancel-password');
const passwordError = document.getElementById('password-error');
const changePasswordButton = document.getElementById('change-password-button');
const currentPasswordInput = document.getElementById('current-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordChangeMessage = document.getElementById('password-change-message');
const conductorList = document.getElementById('conductor-list');
const regularWagonsContainer = document.querySelector('.regular-wagons-container');
const membersList = document.getElementById('members-list');
const announceBar = document.getElementById('announcement-bar');
const latestAnnouncementText = document.getElementById('latest-announcement-text');
const closeAnnouncementButton = document.getElementById('close-announcement');
const adminAnnouncementForm = document.getElementById('admin-announcement-form');
const newAnnouncementText = document.getElementById('new-announcement-text');
const postAnnouncementButton = document.getElementById('post-announcement-button');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const announcementTextContainer = document.querySelector('.announcement-text-container');
const announcementDetailModal = document.getElementById('announcement-detail-modal');
const fullAnnouncementText = document.getElementById('full-announcement-text');
const closeAnnouncementDetailButton = document.getElementById('close-announcement-detail');

// Check button initialization
// console.log('Button initialization:');
// console.log('- editRotationButton:', editRotationButton);
// console.log('- saveRotationButton:', saveRotationButton);
// console.log('- cancelRotationButton:', cancelRotationButton);

// Show emergency button after 5 seconds
// setTimeout(() => {
//   emergencyButton.style.display = 'block';
// }, 5000);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM content loaded, initializing app...');
  
  // Test Firebase access
  testFirebaseAccess()
    // .then(success => {
    //   console.log('Firebase access test result:', success ? 'PASSED' : 'FAILED');
    // })
    // .catch(error => {
    //   console.error('Firebase test error:', error);
    // });
  
  // Check if user is already authenticated from localStorage
  checkExistingAuth();
  console.log("After checkExistingAuth, isAuthenticated =", isAuthenticated);
  
  // Update button visibility based on authentication
  setButtonVisibility();
  
  // Auth button click handler
  authButton.addEventListener('click', handleAuthButtonClick);
  
  // Debug DOM elements
//   console.log('Checking DOM elements:');
//   console.log('- membersModal:', membersModal);
//   console.log('- historyModal:', historyModal);
//   console.log('- announcementsModal:', announcementsModal);
//   console.log('- manageMembersButton:', manageMembersButton);
//   console.log('- viewHistoryButton:', viewHistoryButton);
//   console.log('- announcementsButton:', announcementsButton);
  
  // Add event listener for generate train button in modal
  if (generateTrainButton) {
    generateTrainButton.addEventListener('click', () => {
      if (confirm('Warning: This will generate a new train assignment. This action cannot be reverted. Are you sure you want to continue?')) {
        membersModal.classList.add('hidden'); // Hide members modal
        generateNewTrain();
      }
    });
  } else {
    console.warn('Generate train modal button not found');
  }
  
  // Add event listener for force regenerate train button
  if (forceRegenerateTrainButton) {
    forceRegenerateTrainButton.addEventListener('click', () => {
      membersModal.classList.add('hidden'); // Hide members modal
      forceRegenerateTrainForToday();
    });
  } else {
    console.warn('Force regenerate train button not found');
  }
  
  // Add event listener for export members button
  if (exportMembersButton) {
    exportMembersButton.addEventListener('click', exportMembers);
    console.log('Export members button handler set up');
  } else {
    console.error('Export members button not found!');
  }
  
  // Set up manage members button again in case it was missed
  if (manageMembersButton) {
    console.log('Setting up manage members button click handler');
  } else {
    console.error('Manage members button not found!');
  }
  
  // Set up bulk members button
  if (addBulkMembersButton) {
    addBulkMembersButton.addEventListener('click', addBulkMembers);
  } else {
    console.error('Add bulk members button not found!');
  }
  
  // Set up edit rotation buttons
  if (editRotationButton) {
    editRotationButton.addEventListener('click', startEditRotation);
    console.log('Edit rotation button handler set up');
  } else {
    console.error('Edit rotation button not found!');
  }
  
  if (saveRotationButton) {
    saveRotationButton.addEventListener('click', saveRotation);
    console.log('Save rotation button handler set up');
  } else {
    console.error('Save rotation button not found!');
  }
  
  if (cancelRotationButton) {
    cancelRotationButton.addEventListener('click', cancelRotation);
    console.log('Cancel rotation button handler set up');
  } else {
    console.error('Cancel rotation button not found!');
  }
  
  // Set up modal close buttons with explicit IDs
  if (closeMembersModalButton) {
    closeMembersModalButton.addEventListener('click', () => {
      console.log('Close members button clicked');
      if (membersModal) membersModal.classList.add('hidden');
    });
  } else {
    console.error('Close members button not found!');
  }
  
  if (closeHistoryModalButton) {
    closeHistoryModalButton.addEventListener('click', () => {
      console.log('Close history button clicked');
      if (historyModal) historyModal.classList.add('hidden');
    });
  } else {
    console.error('Close history button not found!');
  }
  
  if (closeAnnouncementsModalButton) {
    closeAnnouncementsModalButton.addEventListener('click', () => {
      announcementsModal.classList.add('hidden');
    });
  }
  
  // Set up window click for modal closing
  window.addEventListener('click', event => {
    if (membersModal && event.target === membersModal) {
      console.log('Clicked outside members modal, closing it');
      membersModal.classList.add('hidden');
    }
    if (historyModal && event.target === historyModal) {
      console.log('Clicked outside history modal, closing it');
      historyModal.classList.add('hidden');
    }
    if (passwordModal && event.target === passwordModal) {
      console.log('Clicked outside password modal, closing it');
      passwordModal.classList.add('hidden');
      currentAction = null;
    }
    if (announcementsModal && event.target === announcementsModal) {
      console.log('Clicked outside announcements modal, closing it');
      announcementsModal.classList.add('hidden');
    }
  });
  
  // Start app initialization
  initialize();
  
  // Set up announcements button
  if (announcementsButton) {
    announcementsButton.addEventListener('click', openAnnouncementsModal);
    console.log('Announcements button handler set up');
  } else {
    console.error('Announcements button not found!');
  }
  
  // Set up close announcement bar button
  if (closeAnnouncementButton) {
    closeAnnouncementButton.addEventListener('click', () => {
      announceBar.classList.add('hidden');
    });
  }
  
  // Set up close announcements modal button
  if (closeAnnouncementsModalButton) {
    closeAnnouncementsModalButton.addEventListener('click', () => {
      announcementsModal.classList.add('hidden');
    });
  }
  
  // Set up post announcement button
  if (postAnnouncementButton) {
    postAnnouncementButton.addEventListener('click', postNewAnnouncement);
  }
  
  // Setup pagination buttons
  if (prevPageButton && nextPageButton) {
    prevPageButton.addEventListener('click', () => {
      if (state.announcementPage > 1) {
        state.announcementPage--;
        loadAnnouncements();
      }
    });
    
    nextPageButton.addEventListener('click', () => {
      state.announcementPage++;
      loadAnnouncements();
    });
  }

  // Set up announcement text container click handler
  if (announcementTextContainer) {
    announcementTextContainer.addEventListener('click', showAnnouncementDetail);
    console.log('Announcement text container click handler set up');
  } else {
    console.error('Announcement text container not found!');
  }

  // Set up close announcement detail modal button
  if (closeAnnouncementDetailButton) {
    closeAnnouncementDetailButton.addEventListener('click', () => {
      announcementDetailModal.classList.add('hidden');
    });
    console.log('Close announcement detail button handler set up');
  } else {
    console.error('Close announcement detail button not found!');
  }

  // Add click outside handler for announcement detail modal
  document.addEventListener('click', (event) => {
    if (announcementDetailModal && event.target === announcementDetailModal) {
      console.log('Clicked outside announcement detail modal, closing it');
      announcementDetailModal.classList.add('hidden');
    }
  });

  // Set up screenshot button handler
  if (screenshotButton) {
    screenshotButton.addEventListener('click', captureScreenshot);
    console.log('Screenshot button handler set up');
  } else {
    console.error('Screenshot button not found!');
  }
  
  // Set up close screenshot modal button
  if (closeScreenshotModalButton) {
    closeScreenshotModalButton.addEventListener('click', () => {
      screenshotModal.classList.add('hidden');
    });
    console.log('Close screenshot modal button handler set up');
  }
  
  // Set up close screenshot button in the modal footer
  if (closeScreenshotButton) {
    closeScreenshotButton.addEventListener('click', () => {
      screenshotModal.classList.add('hidden');
    });
  }
  
  // Add click outside handler for screenshot modal
  document.addEventListener('click', (event) => {
    if (screenshotModal && event.target === screenshotModal) {
      console.log('Clicked outside screenshot modal, closing it');
      screenshotModal.classList.add('hidden');
    }
  });
});

retryButton.addEventListener('click', initialize);
// emergencyButton.addEventListener('click', forceHideLoading);
manageMembersButton.addEventListener('click', function() {
  if (isAuthenticated) {
    // If already authenticated, open members modal directly
    openMembersModal();
  } else {
    // Otherwise ask for password
    showPasswordModal('manageMembers');
  }
});

viewHistoryButton.addEventListener('click', openHistoryModal);
// resetHistoryButton.addEventListener('click', resetTrainHistory);
addMemberButton.addEventListener('click', addNewMember);

// Password related event listeners
submitPasswordButton.addEventListener('click', handlePasswordSubmit);
cancelPasswordButton.addEventListener('click', closePasswordModalDialog);
closePasswordModalButton.addEventListener('click', closePasswordModalDialog);
adminPassword.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    handlePasswordSubmit();
  }
});

// Password change event listener
changePasswordButton.addEventListener('click', handlePasswordChange);

// Password authentication variables
let currentAction = null;

// Show password modal
function showPasswordModal(action = 'changePassword') {
  const modal = document.getElementById('password-modal');
  const modalTitle = document.querySelector('#password-modal .modal-header h2');
  const submitButton = document.getElementById('submit-password');
  
  // Set appropriate title and button text based on action
  if (action === 'changePassword') {
    modalTitle.textContent = 'Change Password';
    submitButton.textContent = 'Change Password';
  } else if (action === 'authenticate') {
    modalTitle.textContent = 'Enter Password';
    submitButton.textContent = 'Unlock';
  } else if (action === 'generateTrain') {
    modalTitle.textContent = 'Generate New Train';
    submitButton.textContent = 'Generate';
  } else if (action === 'manageMembers') {
    modalTitle.textContent = 'Manage Members';
    submitButton.textContent = 'Continue';
  }
  
  // Store the current action for use in the submit handler
  modal.dataset.action = action;
  
  // Show the modal
  modal.classList.remove('hidden');
}

// Close password modal
function closePasswordModalDialog() {
  console.log('Closing password modal');
  const modal = document.getElementById('password-modal');
  modal.classList.add('hidden');
  currentAction = null;
}

// Handle password submit
async function handlePasswordSubmit() {
  const passwordInput = document.getElementById('admin-password');
  const password = passwordInput.value.trim();
  const modal = document.getElementById('password-modal');
  const action = modal.dataset.action || 'changePassword';
  const passwordError = document.getElementById('password-error');
  
  if (!password) {
    passwordError.textContent = 'Please enter a password';
    passwordError.classList.remove('hidden');
    return;
  }
  
  try {
    const isValid = await checkPassword(password);
    
    if (!isValid) {
      passwordError.textContent = 'Invalid password';
      passwordError.classList.remove('hidden');
      return;
    }
    
    // Password is valid, handle the action
    let success = false;
    
    if (action === 'changePassword') {
      success = await changePassword(password);
      if (success) {
        alert('Password changed successfully');
      } else {
        alert('Failed to change password');
      }
    } else if (action === 'authenticate') {
      success = await authenticateUser(password);
    } else if (action === 'generateTrain') {
      closePasswordModalDialog();
      await generateNewTrain();
      success = true;
    } else if (action === 'manageMembers') {
      closePasswordModalDialog();
      openMembersModal();
      success = true;
    }
    
    if (success) {
      // Clear input and hide modal
      passwordInput.value = '';
      passwordError.classList.add('hidden');
      modal.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error handling password:', error);
    passwordError.textContent = 'An error occurred: ' + error.message;
    passwordError.classList.remove('hidden');
  }
}

// Initialize Application
async function initialize() {
  try {
    debug('Starting application initialization');
    showLoading();
    console.log('Initializing application...');
    
    // Debug DOM elements
    debug('Checking key DOM elements', {
      trainContainer: !!trainContainer,
      membersModal: !!membersModal,
      historyModal: !!historyModal,
      announcementsModal: !!announcementsModal,
      conductorList: !!document.getElementById('conductor-list'),
      regularWagonsContainer: !!document.querySelector('.regular-wagons-container')
    });
    
    // Expose conductor index setter for debugging
    window.setConductorIndex = manuallySetConductorIndex;
    window.getConductorIndex = () => {
      return {
        index: state.currentConductorIndex,
        name: CONDUCTOR_ROTATION[state.currentConductorIndex],
        nextIndex: (state.currentConductorIndex + 1) % CONDUCTOR_ROTATION.length,
        nextName: CONDUCTOR_ROTATION[(state.currentConductorIndex + 1) % CONDUCTOR_ROTATION.length]
      };
    };
    window.listConductors = () => {
      return CONDUCTOR_ROTATION.map((name, index) => `${index}: ${name}`).join('\n');
    };
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Data loading timed out - proceeding with default data');
      useDefaultData();
      state.dataInitialized = true;
      state.isLoading = false;
      renderApp();
    }, 15000);
    
    // Initialize collections if they don't exist
    try {
      await initializeCollections();
      // Clean up any invalid train history documents
      await cleanupTrainHistory();
      // Initialize password if it doesn't exist
      await initializePassword();
    } catch (error) {
      console.error('Failed to initialize collections:', error);
      // Continue anyway
    }
    
    // Ensure state.members is always initialized to avoid issues
    state.members = [];
    state.leaders = [];
    state.r4r5Members = [];
    
    // Load conductor rotation index
    try {
      await loadConductorRotationIndex();
    } catch (error) {
      console.error('Failed to load conductor rotation index:', error);
      // Use the default index
      state.currentConductorIndex = currentConductorIndex;
    }
    
    // Load members first
    try {
      await loadMembers();
    } catch (error) {
      console.error('Failed to load members:', error);
      state.members = DEFAULT_MEMBERS;
    }
    
    // If still no members, use defaults
    if (!state.members || state.members.length === 0) {
      console.log('No members loaded, using default members');
      state.members = DEFAULT_MEMBERS;
    }
    
    // Then load the rest with the member data available
    try {
      await Promise.all([
        loadLeaders(),
        loadR4R5Members(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Failed to load supporting data:', error);
      // Fall back to defaults
      state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
      state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
      state.playerWagonHistory = {};
    }
    
    // If no leaders or R4/R5 members were loaded, use defaults
    if (!state.leaders || state.leaders.length === 0) {
      console.log('No leaders loaded, using default leaders');
      state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
    }
    
    if (!state.r4r5Members || state.r4r5Members.length === 0) {
      console.log('No R4/R5 members loaded, using default R4/R5 members');
      state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
    }
    
    // Finally load the train history - if this fails, show empty state instead of creating a new assignment
    try {
      await loadTrainHistory();
    } catch (error) {
      console.error('Failed to load train history:', error);
      // Do not generate a new train automatically, just set empty wagons
      console.log('Not generating a new train automatically, showing empty state');
      state.currentWagons = [];
    }
    
    // Clear the timeout since we loaded or created fallback data
    clearTimeout(loadingTimeout);
    
    // Start server time updates
    startTimeUpdates();
    
    // Check if a new daily train assignment is needed
    try {
      console.log('Checking if a new daily train assignment is needed...');
      const newTrainGenerated = await checkAndGenerateNewDailyTrain();
      
      if (newTrainGenerated) {
        console.log('New daily train assignment was automatically generated');
      } else {
        console.log('No new daily train assignment was needed');
      }
    } catch (error) {
      console.error('Error checking for new daily train:', error);
    }
    
    // Load announcements
    await loadAnnouncements();
    
    state.dataInitialized = true;
    state.isLoading = false;
    
    // Log the final state before rendering
    console.log('Final state before rendering:', {
      members: state.members.length,
      leaders: state.leaders.length,
      r4r5Members: state.r4r5Members.length,
      currentWagons: state.currentWagons ? state.currentWagons.length : 0
    });
    
    renderApp();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    // Use default data on error
    useDefaultData();
    state.dataInitialized = true;
    state.isLoading = false;
    renderApp();
    showError('Failed to initialize application. Using default data.');
  }
}

// Initialize Firestore Collections
async function initializeCollections() {
  try {
    console.log('Starting collection initialization...');
    
    // Set a timeout to prevent hanging
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Firestore connection timeout')), 10000)
    );
    
    // Test connection to Firestore
    try {
      console.log('Testing Firestore connection...');
      const testPromise = db.collection('test_connection').get();
      await Promise.race([testPromise, timeout]);
      console.log('Firestore connection successful');
    } catch (connErr) {
      console.error('Error connecting to Firestore:', connErr);
      // Use default data if connection fails
      useDefaultData();
      return true;
    }
    
    // Initialize essential collections only
    // Expand the essential collections array to include ANNOUNCEMENTS
    const essentialCollections = [
      COLLECTIONS.MEMBERS,
      COLLECTIONS.LEADERS,
      COLLECTIONS.HISTORY,
      COLLECTIONS.SETTINGS,
      COLLECTIONS.SESSIONS,
      COLLECTIONS.ANNOUNCEMENTS
    ];
    
    // Skip TRAIN_HISTORY as it should only contain actual train assignments
    console.log('Collections to initialize:', essentialCollections);
    
    for (const collectionName of essentialCollections) {
      try {
        console.log(`Checking collection: ${collectionName}`);
        const docRef = db.collection(collectionName).doc('initial');
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
          await docRef.set({ 
            initialized: true, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
          });
          console.log(`Created initial document for ${collectionName}`);
        } else {
          console.log(`Collection ${collectionName} already initialized`);
        }
      } catch (error) {
        console.error(`Error checking collection ${collectionName}:`, error);
        // Continue with other collections
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing collections:', error);
    // Use default data if initialization fails
    useDefaultData();
    return false;
  }
}

// Use Default Data
function useDefaultData() {
  console.log('Using default data due to connection issues');
  state.members = DEFAULT_MEMBERS;
  state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
  state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
  
  // Create empty wagons instead of generating a new assignment
  console.log('Using empty wagons to avoid creating a new train assignment');
  state.currentWagons = [];
}

// Data Loading Functions
async function loadMembers() {
  try {
    const snapshot = await db.collection(COLLECTIONS.MEMBERS).get();
    const loadedMembers = snapshot.docs
      // Filter out the "initial" document
      .filter(doc => doc.id !== 'initial')
      .map(doc => {
        const data = doc.data();
        // Ensure each member has an id and name
        return {
          id: doc.id,
          name: data.name || doc.id, // Use id as name if name is missing
          role: data.role || 'regular'
        };
      });
    
    state.members = loadedMembers.filter(member => member.name); // Filter out members without names
    console.log('Members loaded:', state.members.length);
    
    if (state.members.length === 0) {
      console.log('No members found, using default members');
      state.members = DEFAULT_MEMBERS;
    }
  } catch (error) {
    console.error('Error loading members:', error);
    state.members = DEFAULT_MEMBERS;
  }
}

async function loadLeaders() {
  try {
    const snapshot = await db.collection(COLLECTIONS.LEADERS).get();
    state.leaders = snapshot.docs
      .filter(doc => doc.id !== 'initial') // Filter out the "initial" document
      .map(doc => doc.id);
    console.log('Leaders loaded:', state.leaders.length);
    
    if (state.leaders.length === 0) {
      console.log('No leaders found, using default leaders');
      state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
    }
  } catch (error) {
    console.error('Error loading leaders:', error);
    state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
  }
}

async function loadR4R5Members() {
  try {
    const snapshot = await db.collection(COLLECTIONS.MEMBERS).get();
    state.r4r5Members = snapshot.docs
      .filter(doc => doc.id !== 'initial') // Filter out the "initial" document
      .filter(doc => {
        const data = doc.data();
        return data && data.role === 'r4r5';
      })
      .map(doc => doc.id);
    
    console.log('R4/R5 members loaded:', state.r4r5Members.length);
    
    if (state.r4r5Members.length === 0) {
      console.log('No R4/R5 members found, using default R4/R5 members');
      state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
    }
  } catch (error) {
    console.error('Error loading R4/R5 members:', error);
    state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
  }
}

async function loadHistory() {
  try {
    const snapshot = await db.collection(COLLECTIONS.HISTORY).get();
    const history = {};
    
    snapshot.docs
      .filter(doc => doc.id !== 'initial') // Filter out the "initial" document
      .forEach(doc => {
        history[doc.id] = doc.data();
      });
      
    state.playerWagonHistory = history;
    console.log('History loaded');
  } catch (error) {
    console.error('Error loading history:', error);
    state.playerWagonHistory = {};
  }
}

async function loadTrainHistory() {
  try {
    console.log('Loading train history...');
    const today = new Date();
    const todayFormatted = formatDate(today);
    
    // Try to get today's assignment first directly by ID
    try {
      const todayDoc = await db.collection(COLLECTIONS.TRAIN_HISTORY).doc(todayFormatted).get();
      
      if (todayDoc.exists) {
        const data = todayDoc.data();
        if (data && data.wagons && Array.isArray(data.wagons) && data.wagons.length > 0) {
          console.log(`Found today's train assignment with ${data.wagons.length} wagons`);
          state.currentWagons = [...data.wagons];
          return true;
        } else {
          console.log("Today's document exists but has invalid wagon data");
        }
      } else {
        console.log(`No train assignment found for today (${todayFormatted})`);
      }
    } catch (todayError) {
      console.error('Error getting today\'s train assignment:', todayError);
    }
    
    // If we don't have today's assignment, get the most recent one
    try {
      const historySnapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      if (historySnapshot.empty) {
        console.log('No train history found at all');
      } else {
        state.trainHistory = [];
        historySnapshot.forEach(doc => {
          const history = doc.data();
          history.id = doc.id;
          state.trainHistory.push(history);
        });
        
        console.log(`Loaded ${state.trainHistory.length} train history records`);
        
        // If we have history but not today's wagons, use the most recent one
        if (!state.currentWagons || state.currentWagons.length === 0) {
          const mostRecent = state.trainHistory[0];
          if (mostRecent && mostRecent.wagons && Array.isArray(mostRecent.wagons) && mostRecent.wagons.length > 0) {
            console.log(`Using most recent train assignment from ${mostRecent.date}`);
            state.currentWagons = [...mostRecent.wagons];
          } else {
            console.log('Most recent train history has invalid wagon data');
          }
        }
      }
    } catch (historyError) {
      console.error('Error loading train history:', historyError);
    }
    
    // If we still don't have valid wagons, attempt to generate a new daily train
    if (!state.currentWagons || state.currentWagons.length === 0) {
      console.log('No valid wagons found in any history, attempting to generate new daily train...');
      try {
        const generated = await checkAndGenerateNewDailyTrain();
        if (generated) {
          console.log('Successfully generated new daily train');
          return true;
        } else {
          console.log('Failed to generate new daily train or one already existed');
        }
      } catch (genError) {
        console.error('Error while trying to generate new daily train:', genError);
      }
    }
    
    return state.currentWagons && state.currentWagons.length > 0;
  } catch (error) {
    console.error('Error in loadTrainHistory:', error);
    return false;
  }
}

async function generateAndSaveNewTrain() {
  console.log('Generating new train assignment');
  
  // Make sure we have members to assign
  if (!state.members || state.members.length === 0) {
    console.log('No members found, using default members');
    state.members = DEFAULT_MEMBERS;
  }
  
  if (!state.leaders || state.leaders.length === 0) {
    console.log('No leaders found, using default leaders');
    state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
  }
  
  if (!state.r4r5Members || state.r4r5Members.length === 0) {
    console.log('No R4/R5 members found, using default R4/R5 members');
    state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
  }
  
  state.currentWagons = generateTrainAssignment(
    state.members,
    state.leaders,
    state.r4r5Members,
    state.playerWagonHistory
  );
  
  try {
    await addTrainRotation(state.currentWagons);
    console.log('New train rotation added to history');
  } catch (error) {
    console.error('Error adding new train rotation:', error);
  }
}

// Generate Train Assignment
function generateTrainAssignment(members, leaders, r4r5Members, playerWagonHistory) {
  console.log('Generating train assignment with:', {
    members: members.length,
    leaders: leaders.length,
    r4r5Members: r4r5Members.length
  });

  // Initialize wagons array (conductor wagon + 4 regular wagons)
  const wagons = Array(5).fill().map(() => ({
    conductor: null,
    members: []
  }));

  // Ensure members is an array and not empty
  if (!members || !Array.isArray(members) || members.length === 0) {
    console.error('No members available');
    // Use default members if no members are provided
    members = DEFAULT_MEMBERS;
    leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
    r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
    console.log('Using default members:', members);
  }

  // ===== DEBUG: Log the current state before doing anything =====
  console.log("===== CONDUCTOR SELECTION DEBUG START =====");
  console.log(`Global currentConductorIndex: ${currentConductorIndex}`);
  console.log(`State currentConductorIndex: ${state.currentConductorIndex}`);
  
  // Make sure the current index is valid
  let safeIndex = state.currentConductorIndex;
  
  // Validate index - if invalid, use a safe default
  if (safeIndex === undefined || safeIndex < 0 || safeIndex >= CONDUCTOR_ROTATION.length) {
    console.warn(`Invalid state index: ${safeIndex}, using index 0 as fallback`);
    safeIndex = 0;
  }
  
  // Get the conductor name for this rotation
  const conductorName = CONDUCTOR_ROTATION[safeIndex];
  console.log(`Using conductor from rotation: ${conductorName} (index: ${safeIndex})`);
  
  // ===== DEBUG: Log the conductor we're about to use =====
  console.log(`About to use conductor: ${conductorName} at index ${safeIndex}`);
  
  // Find the member with this name
  let conductorMember = members.find(m => m.name === conductorName);
  
  // If the conductor is not found in the members list, create a temporary entry with appropriate role
  if (!conductorMember) {
    console.log(`Conductor ${conductorName} not found in members list, creating temporary entry`);
    conductorMember = {
      id: `conductor-${Date.now()}`,
      name: conductorName,
      role: 'leader' // Assume all conductors are leaders
    };
    
    // Add to members array
    members.push(conductorMember);
    
    // Add to leaders array if not already there
    if (!leaders.includes(conductorMember.id)) {
      leaders.push(conductorMember.id);
    }
    
    // Save the new member
    saveMember(conductorMember).catch(err => {
      console.error('Error saving conductor member:', err);
    });
  }
  
  // Set the conductor
  wagons[0].conductor = conductorMember.id;
  console.log(`Set conductor to: ${conductorMember.name} (ID: ${conductorMember.id})`);
  
  // Now increment the index for next time
  const nextIndex = (safeIndex + 1) % CONDUCTOR_ROTATION.length;
  const nextConductor = CONDUCTOR_ROTATION[nextIndex];
  
  // Update both global and state variables
  currentConductorIndex = nextIndex;
  state.currentConductorIndex = nextIndex;
  
  console.log(`Next conductor index set to: ${nextIndex} (${nextConductor})`);
  
  // Save the updated index to Firebase
  saveConductorRotationIndex().catch(err => {
    console.error('Error saving conductor rotation index:', err);
  });
  
  console.log("===== CONDUCTOR SELECTION DEBUG END =====");
  
  // Get remaining members (excluding conductor)
  const remainingMembers = members
    .filter(m => m.id !== wagons[0].conductor)
    .map(m => m.id);
  
  console.log('Remaining members:', remainingMembers.length);

  // Initialize player history data if not already present
  const updatedPlayerHistory = {...playerWagonHistory};
  remainingMembers.forEach(memberId => {
    if (!updatedPlayerHistory[memberId]) {
      // No history found, create initial record
      updatedPlayerHistory[memberId] = {
        wagonCounts: [0, 0, 0, 0], // Count of assignments to wagons 1-4
        lastWagon: null,           // Last assigned wagon
        lastAssigned: null         // Last assignment timestamp
      };
    }
  });

  // Weights for each wagon position (higher = better rewards)
  const wagonWeights = [4, 3, 2, 1]; // For wagons 1, 2, 3, 4
  
  // Calculate fairness scores
  const memberScores = {};
  remainingMembers.forEach(memberId => {
    // Default score starts at 0
    memberScores[memberId] = 0;
    
    const history = updatedPlayerHistory[memberId];
    if (!history) return; // Skip if no history
    
    // Calculate weighted score based on past wagon assignments
    // Higher weights for better wagons
    let weightedScore = 0;
    for (let i = 0; i < 4; i++) {
      const count = history.wagonCounts[i] || 0;
      weightedScore += count * wagonWeights[i];
    }
    
    // Higher score means the member has been in better wagons more often
    // So we'll use this as a negative priority - lower score gets better wagons
    memberScores[memberId] = -weightedScore;
    
    // Apply additional penalty for being in the same wagon twice in a row
    if (history.lastWagon !== null) {
      // Add penalty proportional to how good the wagon was
      // Higher penalty for having been in a good wagon recently
      memberScores[memberId] -= (4 - history.lastWagon) * 3;
    }
    
    // Check when they were last assigned at all
    if (history.lastAssigned) {
      const lastAssignedTime = typeof history.lastAssigned === 'string' 
        ? new Date(history.lastAssigned).getTime() 
        : history.lastAssigned.toDate ? history.lastAssigned.toDate().getTime() : 0;
        
      const daysSinceLastAssignment = Math.floor((Date.now() - lastAssignedTime) / (1000 * 60 * 60 * 24));
      
      // Boost priority for members who haven't been assigned for a long time
      if (daysSinceLastAssignment > 7) {
        memberScores[memberId] += daysSinceLastAssignment;
      }
    } else {
      // Extra boost for members who have never been assigned
      memberScores[memberId] += 30;
    }
  });
  
  console.log('Member fairness scores:', memberScores);
  
  // Sort by fairness score (higher score = higher priority for better wagons)
  // This prioritizes members who haven't had good wagons recently
  const sortedMembers = [...remainingMembers].sort((a, b) => {
    const scoreA = memberScores[a] || 0;
    const scoreB = memberScores[b] || 0;
    
    // Sort by score descending (higher score first)
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // If scores are equal, introduce slight randomness for tiebreaking
    return Math.random() - 0.5;
  });
  
  console.log('Sorted members by fairness (higher priority first):', sortedMembers);
  
  // Distribute members across wagons 1-4 with exactly 5 slots each
  const membersPerWagon = 5;
  let memberIndex = 0;
  
  // Now assign members to wagons 1-4 in order of priority
  // Wagon 1 gets highest priority members, then wagon 2, etc.
  for (let wagonIndex = 1; wagonIndex < 5; wagonIndex++) {
    wagons[wagonIndex].members = [];
    for (let i = 0; i < membersPerWagon && memberIndex < sortedMembers.length; i++) {
      const memberId = sortedMembers[memberIndex];
      wagons[wagonIndex].members.push(memberId);
      
      // Update member history
      if (updatedPlayerHistory[memberId]) {
        // Increment count for this wagon (0-indexed in our array, so wagonIndex-1)
        if (!updatedPlayerHistory[memberId].wagonCounts) {
          updatedPlayerHistory[memberId].wagonCounts = [0, 0, 0, 0];
        }
        updatedPlayerHistory[memberId].wagonCounts[wagonIndex-1] = 
          (updatedPlayerHistory[memberId].wagonCounts[wagonIndex-1] || 0) + 1;
        
        // Update last assigned wagon (0-indexed in our storage, so wagonIndex-1)
        updatedPlayerHistory[memberId].lastWagon = wagonIndex-1;
        
        // Update last assignment timestamp
        updatedPlayerHistory[memberId].lastAssigned = new Date();
      }
      
      memberIndex++;
    }
  }

  // If we don't have enough members to fill all wagons, make sure first wagon has at least some members
  if (memberIndex === 0) {
    console.warn('Not enough members to fill wagons, adding default members');
    
    // Use default members to fill at least one wagon
    const defaultMemberIds = DEFAULT_MEMBERS
      .filter(m => m.id !== wagons[0].conductor)
      .map(m => m.id)
      .slice(0, 5);
      
    wagons[1].members = defaultMemberIds;
  }

  // Log the final wagon assignment
  console.log('Generated wagons:', wagons);
  
  // Check if any wagons are empty
  let hasAnyMembers = false;
  for (const wagon of wagons) {
    if ((wagon.conductor && wagon.conductor !== null) || 
        (wagon.members && wagon.members.length > 0)) {
      hasAnyMembers = true;
      break;
    }
  }
  
  // If all wagons are empty, try to use default members
  if (!hasAnyMembers) {
    console.error('All generated wagons are empty, using default assignment');
    return generateDefaultTrainAssignment();
  }
  
  // Save updated player history
  try {
    // Create a batch for performance
    const batch = db.batch();
    
    // Update each player's history
    Object.entries(updatedPlayerHistory).forEach(([playerId, history]) => {
      if (playerId) {
        const playerRef = db.collection(COLLECTIONS.HISTORY).doc(playerId);
        batch.set(playerRef, history);
      }
    });
    
    // Commit the batch
    batch.commit().then(() => {
      console.log('Player wagon history updated successfully');
      // Update state for future operations
      state.playerWagonHistory = updatedPlayerHistory;
    }).catch(err => {
      console.error('Error saving player history:', err);
    });
  } catch (error) {
    console.error('Error updating player history:', error);
  }
  
  return wagons;
}

// Generate a default train assignment as fallback
function generateDefaultTrainAssignment() {
  const defaultWagons = Array(5).fill().map(() => ({
    conductor: null,
    members: []
  }));
  
  // Ensure we have default members
  if (DEFAULT_MEMBERS.length === 0) {
    return defaultWagons;
  }
  
  // Find a leader or R4/R5 for conductor
  const leaderMembers = DEFAULT_MEMBERS.filter(m => m.role === 'leader');
  const r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5');
  
  if (leaderMembers.length > 0) {
    defaultWagons[0].conductor = leaderMembers[0].id;
  } else if (r4r5Members.length > 0) {
    defaultWagons[0].conductor = r4r5Members[0].id;
  } else if (DEFAULT_MEMBERS.length > 0) {
    defaultWagons[0].conductor = DEFAULT_MEMBERS[0].id;
  }
  
  // Get remaining members (excluding conductor)
  const remainingMembers = DEFAULT_MEMBERS
    .filter(m => m.id !== defaultWagons[0].conductor)
    .map(m => m.id);
  
  // Distribute members across wagons
  let memberIndex = 0;
  for (let wagonIndex = 1; wagonIndex < 5; wagonIndex++) {
    for (let i = 0; i < 5 && memberIndex < remainingMembers.length; i++) {
      defaultWagons[wagonIndex].members.push(remainingMembers[memberIndex]);
      memberIndex++;
    }
  }
  
  return defaultWagons;
}

// Add train rotation to Firestore
async function addTrainRotation(wagons) {
  try {
    console.log('Adding train rotation to Firestore...');
    
    // Get today's date for reference
    const todayDate = formatDate(new Date());
    console.log(`Today's date for document: ${todayDate}`);
    
    // If this is a manual edit, update the existing document
    if (state.isEditingRotation) {
      console.log('Editing rotation detected - updating existing document');
      
      // Use the docId from state if available, otherwise use today's date
      const docId = state.editingDocId || todayDate;
      const docRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc(docId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        console.log(`Updating existing train assignment document: ${docId}`);
        
        // Convert wagons array to Firestore format
        const firestoreWagons = wagons.map(wagon => {
          // Ensure members array exists for each wagon
          if (!wagon.members) {
            wagon.members = [];
          }
          return wagon;
        });
        
        // Set document data with an edited flag
        await docRef.update({
          wagons: firestoreWagons,
          wagonCount: firestoreWagons.length,
          edited: true,
          editedAt: firebase.firestore.FieldValue.serverTimestamp(),
          date: todayDate // Ensure date field is set
        });
        
        console.log('Train rotation updated successfully!');
        return true;
      } else {
        console.warn(`Attempted to edit non-existent document: ${docId}`);
        // Fall through to create a new document
      }
    } 
    
    // First check if we already have a train assignment for today
    console.log(`Checking for existing train assignment for today (${todayDate})`);
    try {
      const todayQuery = await db.collection(COLLECTIONS.TRAIN_HISTORY)
        .where('date', '==', todayDate)
        .get();
        
      if (!todayQuery.empty) {
        console.log(`Found ${todayQuery.size} existing train assignments for today`);
        
        // If we're not in edit mode and an assignment exists for today, don't create a new one
        if (!state.isEditingRotation) {
          console.log('Not creating a new assignment since one already exists for today');
          
          // Just to be safe, let's make sure we have an entry for today in our state
          const todayDocs = [];
          todayQuery.forEach(doc => {
            const data = doc.data();
            data.docId = doc.id;
            todayDocs.push(data);
          });
          
          // Sort by timestamp and use the most recent one
          if (todayDocs.length > 0) {
            todayDocs.sort((a, b) => {
              if (!a.timestamp || !b.timestamp) return 0;
              const aTime = a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
              const bTime = b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
              return bTime - aTime;
            });
            
            const mostRecent = todayDocs[0];
            if (mostRecent.wagons && Array.isArray(mostRecent.wagons)) {
              console.log(`Setting current wagons from today's entry: ${mostRecent.docId}`);
              state.currentWagons = [...mostRecent.wagons];
            }
          }
          
          return false;
        }
      } else {
        console.log('No existing train assignment found for today, proceeding to create new one');
      }
    } catch (err) {
      console.error('Error checking for existing train assignments:', err);
      // Continue anyway
    }
    
    // For new train assignments, create a new document with a unique timestamp-based ID
    // This ensures each train assignment gets a unique document
    const timestamp = new Date();
    const uniqueId = formatDateTimeId(timestamp);
    
    console.log(`Creating new train rotation document with unique ID: ${uniqueId}`);
    const docRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc(uniqueId);
    
    // Convert wagons array to Firestore format and ensure it's not empty
    const firestoreWagons = wagons.map(wagon => {
      // Ensure members array exists for each wagon
      if (!wagon.members) {
        wagon.members = [];
      }
      return wagon;
    });
    
    // Ensure at least one wagon has data to prevent empty assignments
    if (firestoreWagons.length === 0) {
      console.error('Cannot save empty wagons array');
      return false;
    }
    
    // Set document data with current timestamp
    const docData = {
      wagons: firestoreWagons,
      wagonCount: firestoreWagons.length,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      date: todayDate, // Always include today's date for queries
      generatedAt: timestamp.toISOString() // Add ISO string timestamp as backup
    };
    
    console.log(`Saving train rotation with data:`, {
      docId: uniqueId,
      date: todayDate,
      wagonCount: firestoreWagons.length
    });
    
    await docRef.set(docData);
    
    console.log(`New train rotation added successfully with date field: ${todayDate}`);
    
    // Update state.currentWagons to match what we just saved
    state.currentWagons = [...firestoreWagons];
    
    return true;
  } catch (error) {
    console.error('Error adding train rotation:', error);
    throw error;
  }
}

// Format Date for Display
function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Format Date and Time for unique ID
function formatDateTimeId(date) {
  if (!date || !(date instanceof Date)) {
    date = new Date();
  }
  const formatted = formatDate(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${formatted}-${hours}${minutes}${seconds}`;
}

// Format Time for Display
function formatTime(date) {
  return date.toLocaleTimeString();
}

// Calculate Time Until Next Train
function getTimeUntilNextTrain(now) {
  // Handle null, undefined, or invalid date
  if (!now || !(now instanceof Date) || isNaN(now.getTime())) {
    console.warn('Invalid date passed to getTimeUntilNextTrain:', now);
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  try {
    const nextTrain = new Date(now);
    nextTrain.setHours(0, 0, 0, 0);
    
    // If it's past midnight, set to next day
    if (now.getHours() >= 0) {
      nextTrain.setDate(nextTrain.getDate() + 1);
    }
    
    const diff = nextTrain - now;
    
    // Ensure we don't return negative values
    return {
      hours: Math.max(0, Math.floor(diff / (1000 * 60 * 60))),
      minutes: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
      seconds: Math.max(0, Math.floor((diff % (1000 * 60)) / 1000))
    };
  } catch (error) {
    console.error('Error calculating time until next train:', error);
    return { hours: 0, minutes: 0, seconds: 0 };
  }
}

// Format Time Until Display
function formatTimeUntil(timeObj) {
  if (!timeObj) return '--h --m --s';
  return `${timeObj.hours}h ${timeObj.minutes}m ${timeObj.seconds}s`;
}

// Start Server Time Updates
function startTimeUpdates() {
  // Track the last date we checked for a new train
  let lastCheckedDate = formatDate(new Date());
  console.log(`Initial lastCheckedDate: ${lastCheckedDate}`);
  
  // Variables to track day change
  let currentDay = new Date().getDate();
  
  const updateTime = () => {
    // Get actual server time
    const actualTime = new Date();
    
    // Create a copy for the displayed time
    const displayTime = new Date(actualTime);
    
    // Set the hours to 17 (5:00 PM) while keeping the current minutes and seconds
    displayTime.setHours(17);
    
    // Save as server time
    state.serverTime = displayTime;
    state.timeUntilNextTrain = getTimeUntilNextTrain(state.serverTime);
    
    // Update UI
    serverTimeElement.textContent = `Server Time: ${formatTime(state.serverTime)}`;
    nextTrainElement.textContent = `Next Train: ${formatTimeUntil(state.timeUntilNextTrain)}`;
    
    // Check if the day has changed
    const newDay = actualTime.getDate();
    const formattedToday = formatDate(actualTime);
    
    if (newDay !== currentDay || formattedToday !== lastCheckedDate) {
      console.log(`Day has changed! Previous: ${currentDay}, Current: ${newDay}`);
      console.log(`Date check: Previous: ${lastCheckedDate}, Current: ${formattedToday}`);
      
      // Update tracking variables
      currentDay = newDay;
      lastCheckedDate = formattedToday;
      
      // Check if we need to generate a new train for the new day
      checkAndGenerateNewDailyTrain()
        .then(generated => {
          if (generated) {
            console.log('New train generated automatically for the new day!');
            // Reload the train history to make sure it's up to date
            loadTrainHistory().then(() => {
              // Re-render the trains view if it's currently visible
              if (!state.isLoading && !trainContainer.classList.contains('hidden')) {
                renderTrains();
              }
            });
          } else {
            console.log('No new train was generated for the new day (one may already exist)');
          }
        })
        .catch(error => {
          console.error('Error checking for or generating new daily train:', error);
        });
    }
  };
  
  // Initial update
  updateTime();
  
  // Set interval for updates - check every minute (instead of every second)
  // to reduce server load while still ensuring timely train generation
  setInterval(updateTime, 60000); // 60000 ms = 1 minute
}

// Rendering Functions
function renderApp() {
  if (state.isLoading) {
    showLoading();
    return;
  }
  
  hideLoading();
  console.log('Showing train container');
  trainContainer.classList.remove('hidden'); // Make sure train container is visible
  renderTrains();
}

function renderTrains() {
  // Clear previous content
  conductorList.innerHTML = '';
  regularWagonsContainer.innerHTML = '';
  
  console.log('Rendering current wagons:', state.currentWagons);
  
  // Check if currentWagons is empty or invalid and attempt to load from Firestore instead of generating new ones
  if (!state.currentWagons || !Array.isArray(state.currentWagons) || state.currentWagons.length === 0) {
    console.warn('No valid wagons to render, checking Firestore for today\'s assignments');
    // Show a "loading from database" message instead of a blank page
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Loading train assignments...';
    loadingMessage.style.color = '#777';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.textAlign = 'center';
    regularWagonsContainer.appendChild(loadingMessage);

    // First, try to reload train history without generating new wagons
    showLoading();
    loadTrainHistory()
      .then(history => {
        // Now that history is loaded, check if currentWagons was populated
        if (state.currentWagons && Array.isArray(state.currentWagons) && state.currentWagons.length > 0) {
          console.log('Successfully loaded existing train assignment from history');
          hideLoading();
          // Re-render with the loaded wagons
          renderTrains();
        } else {
          console.warn('No existing train assignments found for today, showing empty view');
          hideLoading();
          // Show message that no train is assigned yet
          conductorList.innerHTML = '';
          regularWagonsContainer.innerHTML = '';
          
          const noTrainMessage = document.createElement('div');
          noTrainMessage.textContent = 'No train assignment found for today. Click "Generate New Train" to create one.';
          noTrainMessage.style.color = '#ff4444';
          noTrainMessage.style.padding = '20px';
          noTrainMessage.style.textAlign = 'center';
          regularWagonsContainer.appendChild(noTrainMessage);
        }
      })
      .catch(err => {
        console.error('Error loading train history:', err);
        hideLoading();
        showError('Error loading train assignments');
      });
    return;
  }
  
  // Double-check if any wagon has members
  let hasMembers = false;
  if (state.currentWagons) {
    for (const wagon of state.currentWagons) {
      if ((wagon.conductor && wagon.conductor !== null && wagon.conductor !== 'initial') || 
          (wagon.members && wagon.members.length > 0)) {
        hasMembers = true;
        break;
      }
    }
  }
  
  // If still no members, don't generate new wagons automatically
  // Instead, show a message prompting user to generate a new train
  if (!hasMembers) {
    console.warn('No members in current wagons, showing empty view');
    conductorList.innerHTML = '';
    regularWagonsContainer.innerHTML = '';
    
    const noMembersMessage = document.createElement('div');
    noMembersMessage.textContent = 'No train assignment found for today. Click "Generate New Train" to create one.';
    noMembersMessage.style.color = '#ff4444';
    noMembersMessage.style.padding = '20px';
    noMembersMessage.style.textAlign = 'center';
    regularWagonsContainer.appendChild(noMembersMessage);
    return;
  }
  
  // Show train container
  trainContainer.classList.remove('hidden');
  
  // Debug: Check members array state
  console.log('Current members state:', state.members);
  
  // If in edit mode, add edit instructions
  if (state.isEditingRotation) {
    const instructionsElement = document.createElement('div');
    instructionsElement.classList.add('edit-instructions');
    instructionsElement.textContent = 'Select members for each wagon position using the dropdown menus below.';
    regularWagonsContainer.parentNode.insertBefore(instructionsElement, regularWagonsContainer);
  }
  
  // Render conductor wagon
  if (state.currentWagons && state.currentWagons.length > 0) {
    const conductorWagon = state.currentWagons[0];
    
    // Add editing class if in edit mode
    const conductorWagonElement = document.querySelector('.conductor-wagon');
    if (state.isEditingRotation && conductorWagonElement) {
      conductorWagonElement.classList.add('editing');
    }
    
    if (state.isEditingRotation) {
      // In edit mode, render dropdown for conductor
      console.log("Rendering conductor dropdown for edit mode");
      
      try {
        // Create clean select element
        const selectElement = document.createElement('select');
        selectElement.id = 'conductor-select';
        selectElement.classList.add('member-select');
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- Select Conductor --';
        selectElement.appendChild(defaultOption);
        
        // Make sure we have valid arrays for priority members
        const leaderIds = Array.isArray(state.leaders) ? state.leaders : [];
        const r4r5Ids = Array.isArray(state.r4r5Members) ? state.r4r5Members : [];
        
        // Filter out any null/undefined values
        const priorityMembers = [...leaderIds, ...r4r5Ids].filter(id => id !== null && id !== undefined);
        const uniquePriorityMemberIds = [...new Set(priorityMembers)];
        
        console.log("Priority member IDs for conductor:", uniquePriorityMemberIds);
        
        // Get current conductor ID
        const currentConductorId = conductorWagon && conductorWagon.conductor ? 
          String(conductorWagon.conductor) : null;
          
        console.log("Current conductor ID:", currentConductorId);
        
        // Make sure we have a valid members array
        const validMembers = Array.isArray(state.members) ? state.members : [];
        
        // Add leader and R4/R5 options first
        uniquePriorityMemberIds.forEach(memberId => {
          if (!memberId) return; // Skip null/undefined
          
          const member = getMemberById(memberId);
          if (member && member.name) {
            const option = document.createElement('option');
            option.value = String(member.id); // Ensure string
            option.textContent = member.name;
            option.classList.add(member.role || 'regular');
            
            // Select current conductor if it exists
            if (currentConductorId === String(member.id)) {
              option.selected = true;
              console.log(`Selected conductor: ${member.name} (${member.id})`);
            }
            
            selectElement.appendChild(option);
          }
        });
        
        // Add regular members (not already added)
        validMembers.forEach(member => {
          if (!member || !member.id) return; // Skip invalid
          
          // Skip if already added as priority
          if (uniquePriorityMemberIds.includes(member.id)) {
            return;
          }
          
          const option = document.createElement('option');
          option.value = String(member.id); // Ensure string
          option.textContent = member.name || 'Unknown';
          option.classList.add(member.role || 'regular');
          
          // Select current conductor if it exists
          if (currentConductorId === String(member.id)) {
            option.selected = true;
            console.log(`Selected conductor: ${member.name} (${member.id})`);
          }
          
          selectElement.appendChild(option);
        });
        
        console.log("Conductor select created with", selectElement.options.length, "options");
        conductorList.appendChild(selectElement);
      } catch (error) {
        console.error("Error creating conductor dropdown:", error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Error creating dropdown. Please try again.';
        errorMessage.style.color = 'red';
        conductorList.appendChild(errorMessage);
      }
    } else {
      // Regular display mode
      if (conductorWagon && conductorWagon.conductor && conductorWagon.conductor !== 'initial') {
        const conductorMember = getMemberById(conductorWagon.conductor);
        console.log('Conductor:', conductorWagon.conductor, 'Resolved to:', conductorMember);
        
        const conductorElement = document.createElement('li');
        conductorElement.classList.add('member', 'conductor');
        
        // Always display the name property if available
        if (conductorMember && conductorMember.name) {
          conductorElement.classList.add(conductorMember.role || 'regular');
          conductorElement.textContent = `👑 ${conductorMember.name}`;
        } else {
          // Fallback to display the ID as name if that's all we have
          conductorElement.textContent = `👑 ${conductorWagon.conductor}`;
        }
        
        conductorList.appendChild(conductorElement);
      } else {
        const emptyElement = document.createElement('li');
        emptyElement.classList.add('member');
        emptyElement.textContent = 'No conductor assigned';
        conductorList.appendChild(emptyElement);
      }
    }
    
    // Render regular wagons
    for (let i = 1; i < state.currentWagons.length; i++) {
      const wagon = state.currentWagons[i] || { members: [] };
      const wagonElement = document.createElement('div');
      wagonElement.classList.add('wagon');
      
      // Add editing class if in edit mode
      if (state.isEditingRotation) {
        wagonElement.classList.add('editing');
      }
      
      const wagonTitle = document.createElement('h3');
      wagonTitle.classList.add('wagon-title');
      wagonTitle.innerHTML = `<span class="shoo-tag">SHOO</span> Wagon ${i}`;
      wagonElement.appendChild(wagonTitle);
      
      const memberList = document.createElement('ul');
      memberList.classList.add('member-list');
      
      if (state.isEditingRotation) {
        // Create 5 member slots with dropdowns
        console.log(`Creating member selects for wagon ${i}`);
        try {
          for (let j = 0; j < 5; j++) {
            const slotElement = document.createElement('li');
            slotElement.classList.add('edit-slot');
            
            // Create select element
            const selectElement = document.createElement('select');
            selectElement.classList.add('member-select');
            selectElement.dataset.wagonIndex = String(i);
            selectElement.dataset.slotIndex = String(j);
            
            // Add default "none" option
            const noneOption = document.createElement('option');
            noneOption.value = 'none';
            noneOption.textContent = '-- Empty Slot --';
            selectElement.appendChild(noneOption);
            
            // Make sure we have members array
            const validMembers = Array.isArray(state.members) ? state.members : [];
            
            // Get current member ID for this slot
            const currentMemberId = wagon && Array.isArray(wagon.members) && j < wagon.members.length ?
              String(wagon.members[j]) : null;
            console.log(`Wagon ${i}, slot ${j} current member ID:`, currentMemberId);
            
            // Add all members as options
            validMembers.forEach(member => {
              if (!member || !member.id) return; // Skip invalid members
              
              const option = document.createElement('option');
              option.value = String(member.id);  // Ensure string
              option.textContent = member.name || 'Unknown';
              option.classList.add(member.role || 'regular');
              
              // Select this member if they're already in this slot
              if (currentMemberId === String(member.id)) {
                option.selected = true;
                console.log(`Selected member in wagon ${i}, slot ${j}: ${member.name} (${member.id})`);
              }
              
              selectElement.appendChild(option);
            });
            
            console.log(`Added select for slot ${j} with ${selectElement.options.length} options`);
            slotElement.appendChild(selectElement);
            memberList.appendChild(slotElement);
          }
        } catch (error) {
          console.error(`Error creating member selects for wagon ${i}:`, error);
          const errorMessage = document.createElement('p');
          errorMessage.textContent = 'Error creating dropdowns. Please try again.';
          errorMessage.style.color = 'red';
          memberList.appendChild(errorMessage);
        }
      } else {
        // Regular display mode
        if (wagon.members && Array.isArray(wagon.members) && wagon.members.length > 0) {
          console.log(`Wagon ${i} members:`, wagon.members);
          
          wagon.members.forEach(memberId => {
            if (!memberId) return; // Skip undefined/null members
            
            const member = getMemberById(memberId);
            console.log(`Wagon ${i} member:`, memberId, 'Resolved to:', member);
            
            const memberElement = document.createElement('li');
            memberElement.classList.add('member');
            
            if (member && member.name) {
              memberElement.classList.add(member.role || 'regular');
              memberElement.textContent = member.name;
            } else {
              // Fallback to display the ID as name if that's all we have
              memberElement.textContent = memberId;
            }
            
            memberList.appendChild(memberElement);
          });
        } else {
          const emptyElement = document.createElement('li');
          emptyElement.classList.add('member');
          emptyElement.textContent = 'No members assigned';
          memberList.appendChild(emptyElement);
        }
      }
      
      wagonElement.appendChild(memberList);
      regularWagonsContainer.appendChild(wagonElement);
    }
  } else {
    console.error('No current wagons available to render');
    
    // Create a message if no wagons
    const noWagonsMessage = document.createElement('div');
    noWagonsMessage.textContent = 'No train data available. Please generate a new train.';
    noWagonsMessage.style.color = '#ff4444';
    noWagonsMessage.style.padding = '20px';
    noWagonsMessage.style.textAlign = 'center';
    regularWagonsContainer.appendChild(noWagonsMessage);
  }
}

// Generate default wagons
async function generateDefaultWagons() {
  console.log('Generating default wagons with members:', state.members);
  
  // Check if we already have a train assignment for today
  const todayDate = formatDate(new Date());
  
  try {
    // Query all documents with today's date
    const historySnapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY)
      .where('date', '==', todayDate)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    // If there's already a train assignment for today, use the most recent one
    if (!historySnapshot.empty) {
      const docSnap = historySnapshot.docs[0];
      console.log('Found existing train assignment for today, using it instead of generating a new one');
      const data = docSnap.data();
      
      if (data.wagons && Array.isArray(data.wagons)) {
        state.currentWagons = [...data.wagons];
        renderTrains();
        return state.currentWagons;
      }
    } else {
      console.log('No train assignments found for today');
    }
  } catch (error) {
    console.error('Error checking for existing train assignment:', error);
  }
  
  // If we get here, there's no existing train assignment for today
  
  // Check if we have members
  if (!state.members || state.members.length === 0) {
    console.log('No members available, using DEFAULT_MEMBERS');
    state.members = DEFAULT_MEMBERS;
  }
  
  // Check if we have leaders
  if (!state.leaders || state.leaders.length === 0) {
    console.log('No leaders available, using default leaders');
    state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
  }
  
  // Check if we have R4/R5 members
  if (!state.r4r5Members || state.r4r5Members.length === 0) {
    console.log('No R4/R5 members available, using default R4/R5 members');
    state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
  }
  
  // Generate a train assignment with available data
  const wagons = generateTrainAssignment(
    state.members,
    state.leaders,
    state.r4r5Members,
    state.playerWagonHistory || {}
  );
  
  state.currentWagons = wagons;
  
  // Immediately render the train with the new wagons
  renderTrains();
  
  // Also try to save the assignment to Firestore if possible
  try {
    await addTrainRotation(wagons);
  } catch (error) {
    console.error('Error adding train rotation:', error);
  }
  
  return wagons;
}

function getMemberById(memberId) {
  // Skip invalid member IDs
  if (!memberId || memberId === 'initial') {
    console.log('Invalid member ID:', memberId);
    return null;
  }
  
  // First try to find by id exact match
  const memberById = state.members.find(m => m.id === memberId);
  if (memberById) {
    // console.log(`Found member by ID ${memberId}:`, memberById);
    return memberById;
  }
  
  // If not found, check if memberId is actually a name (backward compatibility)
  const memberByName = state.members.find(m => m.name === memberId);
  if (memberByName) {
    // console.log(`Found member by name ${memberId}:`, memberByName);
    return memberByName;
  }
  
  // If still not found but we have an id, create a temporary member object
  console.log(`Member ${memberId} not found in members list, creating temporary object`);
  
  // Check if member ID is in the DEFAULT_MEMBERS list
  const defaultMember = DEFAULT_MEMBERS.find(m => m.id === memberId);
  if (defaultMember) {
    // console.log(`Found member in DEFAULT_MEMBERS: ${memberId} -> ${defaultMember.name}`);
    return defaultMember;
  }
  
  // Create a fallback member object
  return {
    id: memberId,
    name: memberId,
    role: 'regular'
  };
}

// Members Modal Functions
function openMembersModal() {
  console.log('Opening members modal');
  
  // Check if the members modal exists
  if (!membersModal) {
    console.error('Members modal not found in the DOM!');
    alert('Error: Members modal not found. Please refresh the page and try again.');
    return;
  }
  
  // Make sure members data is loaded
  if (!state.members || !Array.isArray(state.members)) {
    console.warn('No members data available, initializing empty array');
    state.members = [];
  }
  
  // Render the members list
  renderMembersList();
  
  // Reset password change form
  resetPasswordChangeForm();
  
  // Show the modal
  membersModal.classList.remove('hidden');
  console.log('Members modal should now be visible');
}

function renderMembersList() {
  membersList.innerHTML = '';
  
  // Sort members - Leaders first, then R4/R5, then regular members
  const sortedMembers = [...state.members].sort((a, b) => {
    // Leaders come first
    if (a.role === 'leader' && b.role !== 'leader') return -1;
    if (a.role !== 'leader' && b.role === 'leader') return 1;
    
    // Then R4/R5
    if (a.role === 'r4r5' && b.role !== 'r4r5') return -1;
    if (a.role !== 'r4r5' && b.role === 'r4r5') return 1;
    
    // Alphabetically within groups
    return a.name.localeCompare(b.name);
  });
  
  sortedMembers.forEach(member => {
    const li = document.createElement('li');
    li.className = `member-item ${member.role}`;
    
    // Create role tag based on member role
    let roleLabel = '';
    if (member.role === 'leader') {
      roleLabel = '<span class="role-tag leader">Leader</span>';
    } else if (member.role === 'r4r5') {
      roleLabel = '<span class="role-tag r4r5">R4/R5</span>';
    }
    
    li.innerHTML = `
      ${roleLabel}
      <span class="member-name">${member.name}</span>
      <div class="member-actions">
        <select class="role-select" title="Change role">
          <option value="regular" ${member.role === 'regular' ? 'selected' : ''}>Regular</option>
          <option value="r4r5" ${member.role === 'r4r5' ? 'selected' : ''}>R4/R5</option>
          <option value="leader" ${member.role === 'leader' ? 'selected' : ''}>Leader</option>
        </select>
        <button class="delete-button" title="Delete member">✕</button>
      </div>
    `;
    
    // Add event listener for role selection
    const roleSelect = li.querySelector('.role-select');
    roleSelect.addEventListener('change', () => {
      const newRole = roleSelect.value;
      
      // Skip if role hasn't changed
      if (newRole === member.role) return;
      
      // Update role in state arrays
      if (member.role === 'leader') {
        state.leaders = state.leaders.filter(id => id !== member.id);
      } else if (member.role === 'r4r5') {
        state.r4r5Members = state.r4r5Members.filter(id => id !== member.id);
      }
      
      // Add to new role array if needed
      if (newRole === 'leader') {
        state.leaders.push(member.id);
      } else if (newRole === 'r4r5') {
        state.r4r5Members.push(member.id);
      }
      
      // Update member object
      member.role = newRole;
      
      // Update the class name of the list item
      li.className = `member-item ${newRole}`;
      
      // Update the role tag
      const roleTagContainer = li.querySelector('.role-tag');
      if (roleTagContainer) {
        roleTagContainer.remove();
      }
      
      if (newRole === 'leader' || newRole === 'r4r5') {
        const roleTag = document.createElement('span');
        roleTag.className = `role-tag ${newRole}`;
        roleTag.textContent = newRole === 'leader' ? 'Leader' : 'R4/R5';
        li.insertBefore(roleTag, li.querySelector('.member-name'));
      }
      
      // Save changes
      updateMemberRole(member.id, newRole)
        .catch(error => {
          console.error('Error updating member role:', error);
        });
    });
    
    // Add event listener for delete button
    const deleteButton = li.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      if (state.members.length <= 5) {
        alert('You need at least 5 members for the train assignment to work properly.');
        return;
      }
      
      if (confirm(`Are you sure you want to delete ${member.name}?`)) {
        deleteMember(member.id);
      }
    });
    
    membersList.appendChild(li);
  });
}

function addNewMember() {
  const name = newMemberNameInput.value.trim();
  const roleInputs = document.getElementsByName("newMemberRole");
  
  if (!name) {
    alert('Please enter a member name');
    return;
  }
  
  // Find selected role
  let role = 'regular';
  for (const input of roleInputs) {
    if (input.checked) {
      role = input.value;
      break;
    }
  }
  
  // Check if member already exists
  const memberExists = state.members.some(m => m.name === name);
  if (memberExists) {
    alert('A member with this name already exists');
    return;
  }
  
  const newMember = {
    id: `member${Date.now()}`,
    name,
    role
  };
  
  state.members.push(newMember);
  
  // Update leaders or r4r5 lists if needed
  if (role === 'leader') {
    state.leaders.push(newMember.id);
  } else if (role === 'r4r5') {
    state.r4r5Members.push(newMember.id);
  }
  
  // Save to Firebase
  saveMember(newMember)
    .then(() => {
      newMemberNameInput.value = '';
      renderMembersList();
      console.log('Member added successfully');
    })
    .catch(error => {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    });
}

async function saveMember(member) {
  try {
    await db.collection(COLLECTIONS.MEMBERS).doc(member.id).set({
      name: member.name,
      role: member.role
    });
    
    // If the member is a leader, add to leaders collection
    if (member.role === 'leader') {
      await db.collection(COLLECTIONS.LEADERS).doc(member.id).set({
        name: member.name
      });
      state.leaders.push(member.id);
    }
    
    console.log('Member saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving member:', error);
    throw error;
  }
}

async function deleteMember(memberId) {
  try {
    // Remove from state
    state.members = state.members.filter(m => m.id !== memberId);
    state.leaders = state.leaders.filter(id => id !== memberId);
    state.r4r5Members = state.r4r5Members.filter(id => id !== memberId);
    
    // Remove from Firestore
    await db.collection(COLLECTIONS.MEMBERS).doc(memberId).delete();
    
    // Also remove from leaders collection if applicable
    await db.collection(COLLECTIONS.LEADERS).doc(memberId).delete();
    
    console.log('Member deleted successfully');
    renderMembersList();
  } catch (error) {
    console.error('Error deleting member:', error);
    alert('Failed to delete member. Please try again.');
  }
}

// History Modal Functions
function openHistoryModal() {
  console.log('Opening history modal');
  
  // Check if the history modal exists
  if (!historyModal) {
    console.error('History modal not found in the DOM!');
    alert('Error: History modal not found. Please refresh the page and try again.');
    return;
  }
  
  // Reset pagination to first page
  state.historyPage = 1;
  
  // Render the history list
  renderHistoryList();
  
  // Show the modal
  historyModal.classList.remove('hidden');
  console.log('History modal should now be visible');
}

function renderHistoryList() {
  historyList.innerHTML = '';
  
  if (!state.trainHistory || state.trainHistory.length === 0) {
    const noHistoryMessage = document.createElement('p');
    noHistoryMessage.textContent = 'No train history available.';
    noHistoryMessage.style.textAlign = 'center';
    noHistoryMessage.style.padding = '20px';
    historyList.appendChild(noHistoryMessage);
    return;
  }
  
  // Sort all train history entries by date (newest first) and then by timestamp (newest first)
  const sortedHistory = [...state.trainHistory].sort((a, b) => {
    // First sort by date (if available)
    if (a.date && b.date && a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    
    // Then sort by timestamp
    if (a.timestamp && b.timestamp) {
      // Handle Firestore timestamps
      const aTime = a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
      const bTime = b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
      return bTime - aTime;
    }
    
    return 0;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedHistory.length / state.historyPageSize);
  
  // Make sure current page is valid
  if (state.historyPage < 1) state.historyPage = 1;
  if (state.historyPage > totalPages) state.historyPage = totalPages;
  
  // Get current page items
  const startIndex = (state.historyPage - 1) * state.historyPageSize;
  const endIndex = Math.min(startIndex + state.historyPageSize, sortedHistory.length);
  const currentPageItems = sortedHistory.slice(startIndex, endIndex);
  
  console.log(`Showing history page ${state.historyPage} of ${totalPages} (${currentPageItems.length} items)`);
  
  // Render each history entry for the current page
  currentPageItems.forEach(history => {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    
    const formattedDate = formatHistoryDate(history.date, history.timestamp);
    
    const historyHeader = document.createElement('div');
    historyHeader.classList.add('history-date');
    historyHeader.textContent = formattedDate;
    
    // Add document ID as a small tooltip to help with debugging
    historyHeader.title = `Document ID: ${history.docId || 'unknown'}`;
    
    // Add edited indicator if the train was manually edited
    if (history.edited) {
      const editedLabel = document.createElement('span');
      editedLabel.textContent = ' (Manually Edited)';
      editedLabel.style.color = '#ffcc00';
      editedLabel.style.fontSize = '0.9rem';
      editedLabel.style.fontStyle = 'italic';
      historyHeader.appendChild(editedLabel);
    }
    
    historyItem.appendChild(historyHeader);
    
    const historyWagons = document.createElement('div');
    historyWagons.classList.add('history-wagons');
    
    if (history.wagons && Array.isArray(history.wagons)) {
      history.wagons.forEach((wagon, wagonIndex) => {
        if (!wagon) return; // Skip undefined/null wagons
        
        const wagonEl = document.createElement('div');
        wagonEl.classList.add('history-wagon');
        
        let wagonTitle = `Wagon ${wagonIndex}`;
        if (wagonIndex === 0) {
          wagonTitle = 'Conductor Wagon';
        }
        
        wagonEl.innerHTML = `<strong>${wagonTitle}</strong><ul>`;
        
        // Display conductor for wagon 0
        if (wagonIndex === 0 && wagon.conductor) {
          const conductorMember = getMemberById(wagon.conductor);
          const conductorName = conductorMember && conductorMember.name ? conductorMember.name : wagon.conductor;
          wagonEl.innerHTML += `<li>👑 ${conductorName}</li>`;
        }
        
        // Display members for all wagons
        if (wagon.members && Array.isArray(wagon.members)) {
          wagon.members.forEach(memberId => {
            if (!memberId) return; // Skip undefined/null members
            
            const member = getMemberById(memberId);
            const memberName = member && member.name ? member.name : memberId;
            wagonEl.innerHTML += `<li>${memberName}</li>`;
          });
        }
        
        // If no members or conductor, show empty message
        if ((!wagon.members || wagon.members.length === 0) && 
            (wagonIndex !== 0 || !wagon.conductor)) {
          wagonEl.innerHTML += `<li><em>Empty</em></li>`;
        }
        
        wagonEl.innerHTML += `</ul>`;
        historyWagons.appendChild(wagonEl);
      });
    }
    
    historyItem.appendChild(historyWagons);
    historyList.appendChild(historyItem);
  });
  
  // Create pagination controls in the style of the reference.html
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-controls';
  
  // Create the pagination buttons and info section
  const paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-button';
  prevButton.textContent = '◀ Previous';
  prevButton.id = 'historyPrevPage';
  prevButton.disabled = state.historyPage <= 1;
  prevButton.addEventListener('click', () => {
    if (state.historyPage > 1) {
      state.historyPage--;
      renderHistoryList();
    }
  });
  
  // Page info
  const paginationInfo = document.createElement('div');
  paginationInfo.className = 'pagination-info';
  paginationInfo.innerHTML = `Page <span id="currentHistoryPage">${state.historyPage}</span> of <span id="totalHistoryPages">${totalPages}</span>`;
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-button';
  nextButton.textContent = 'Next ▶';
  nextButton.id = 'historyNextPage';
  nextButton.disabled = state.historyPage >= totalPages;
  nextButton.addEventListener('click', () => {
    if (state.historyPage < totalPages) {
      state.historyPage++;
      renderHistoryList();
    }
  });
  
  // Assemble pagination section
  paginationDiv.appendChild(prevButton);
  paginationDiv.appendChild(paginationInfo);
  paginationDiv.appendChild(nextButton);
  
  // Create page size control section
  const pageSizeControl = document.createElement('div');
  pageSizeControl.className = 'page-size-control';
  
  // Add label
  const pageSizeLabel = document.createElement('label');
  pageSizeLabel.textContent = 'Entries per page:';
  pageSizeLabel.htmlFor = 'historyPageSize';
  
  // Add select dropdown
  const pageSizeSelect = document.createElement('select');
  pageSizeSelect.id = 'historyPageSize';
  
  // Add options for different page sizes
  const pageSizeOptions = [5, 10, 15, 20, 30, 50, -1];
  const pageSizeLabels = { '-1': 'Show All' };
  
  pageSizeOptions.forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = pageSizeLabels[size] || size;
    option.selected = state.historyPageSize === size;
    pageSizeSelect.appendChild(option);
  });
  
  // Add event listener for page size change
  pageSizeSelect.addEventListener('change', function() {
    state.historyPageSize = parseInt(this.value);
    state.historyPage = 1; // Reset to first page
    renderHistoryList();
  });
  
  // Assemble page size control
  pageSizeControl.appendChild(pageSizeLabel);
  pageSizeControl.appendChild(pageSizeSelect);
  
  // Assemble all pagination controls
  paginationContainer.appendChild(paginationDiv);
  paginationContainer.appendChild(pageSizeControl);
  
  // Add pagination controls to the history list
  historyList.appendChild(paginationContainer);
}

// Close all modals
function closeModals() {
  console.log('Closing all modals');
  membersModal.classList.add('hidden');
  historyModal.classList.add('hidden');
  announcementsModal.classList.add('hidden');
  screenshotModal.classList.add('hidden');
}

// UI Helper Functions
function showLoading() {
  loadingContainer.style.display = 'flex';
  trainContainer.classList.add('hidden');
  errorMessage.style.display = 'none';
  retryButton.style.display = 'none';
}

function hideLoading() {
  loadingContainer.style.display = 'none';
  trainContainer.classList.remove('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  retryButton.style.display = 'block';
  state.isLoading = false;
}

// Function to force hide loading screen
function forceHideLoading() {
  state.isLoading = false;
  hideLoading();
  emergencyButton.style.display = 'none';
  
  // If we have no data, use default data
  if (!state.members || state.members.length === 0) {
    useDefaultData();
  }
  
  renderTrains();
}

// Generate New Train
async function generateNewTrain() {
  try {
    console.log('Generating new train...');
    
    // Only authenticated users can generate a new train
    if (!isAuthenticated) {
      alert('Only administrators can generate a new train.');
      return false;
    }
    
    // Check if we have members data
    if (!state.members || state.members.length === 0) {
      console.warn('No members data available, attempting to load members first...');
      await loadMembers();
      
      // If still no members, show error
      if (!state.members || state.members.length === 0) {
        console.error('No members available to generate train');
        alert('No members available to generate train. Please add some members first.');
        return false;
      }
    }
    
    // Get leaders and R4/R5 members if not loaded yet
    if (!state.leaders || state.leaders.length === 0) {
      console.log('No leaders loaded, loading now...');
      await loadLeaders();
    }
    
    if (!state.r4r5Members || state.r4r5Members.length === 0) {
      console.log('No R4/R5 members loaded, loading now...');
      await loadR4R5Members();
    }
    
    // First, check if there's already an assignment for today
    const todayDate = formatDate(new Date());
    console.log(`Checking for existing train assignment for today (${todayDate})`);
    
    try {
      const todayQuerySnapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY)
        .where('date', '==', todayDate)
        .get();
      
      if (!todayQuerySnapshot.empty) {
        console.log(`Found ${todayQuerySnapshot.size} existing train assignments for today`);
        
        // Process today's assignments 
        const todayAssignments = [];
        
        todayQuerySnapshot.forEach(doc => {
          const data = doc.data();
          data.docId = doc.id;
          
          // Only include documents with valid wagons
          if (data.wagons && Array.isArray(data.wagons)) {
            console.log(`Document ${doc.id} has ${data.wagons.length} wagons`);
            todayAssignments.push(data);
          }
        });
        
        if (todayAssignments.length > 0) {
          // Ask the user if they want to create a new assignment anyway
          if (!confirm('There is already a train assignment for today. Do you want to create a new one anyway?')) {
            console.log('User chose to keep existing train assignment');
            
            // Sort by timestamp and use the most recent one
            todayAssignments.sort((a, b) => {
              if (!a.timestamp || !b.timestamp) return 0;
              const aTime = a.timestamp.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
              const bTime = b.timestamp.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
              return bTime - aTime;
            });
            
            // Use the most recent assignment
            const mostRecent = todayAssignments[0];
            console.log(`Using today's most recent train assignment: ${mostRecent.docId}`);
            
            // Set current wagons and render
            state.currentWagons = [...mostRecent.wagons];
            renderTrains();
            
            return false;
          }
          
          console.log('User chose to create a new train assignment');
        }
      } else {
        console.log('No existing train assignments found for today');
      }
    } catch (err) {
      console.error('Error checking for existing train assignments:', err);
    }
    
    // Generate a new train assignment
    console.log('Generating new train assignment...');
    
    // Use the common train generation logic
    state.currentWagons = generateNewTrainLogic();
    
    try {
      // Add the rotation to Firestore
      await addTrainRotation(state.currentWagons);
      
      console.log('Train rotation added to Firestore successfully');
      
      // Render the new train
      renderTrains();
      
      return true;
    } catch (error) {
      console.error('Error adding train rotation:', error);
      alert('Error generating train. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Error in generateNewTrain:', error);
    alert('Error generating train. Please try again.');
    return false;
  }
}

// Clean up incorrect train history documents
async function cleanupTrainHistory() {
  try {
    console.log('Cleaning up train history collection...');
    const snapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY).get();
    
    if (snapshot.empty) {
      console.log('No train history documents to clean up');
      return;
    }
    
    const batch = db.batch();
    let invalidDocsCount = 0;
    
    // Check each document for validity
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Checking document ${doc.id} for validity`);
      
      // ONLY delete "initial" placeholder documents
      if (doc.id === 'initial' || data.initialized === true) {
        console.log(`Found invalid initial document: ${doc.id}`);
        batch.delete(doc.ref);
        invalidDocsCount++;
        return;
      }
      
      // Do NOT delete documents with the new format (wagons array)
      if (data.wagons && Array.isArray(data.wagons)) {
        console.log(`Document ${doc.id} has valid wagons array format, keeping it`);
        return;
      }
      
      // Only delete legacy documents if they're missing critical data
      if (!data.wagon0 && !data.wagon1 && !data.wagonCount) {
        console.log(`Found completely empty document without wagon data: ${doc.id}`);
        batch.delete(doc.ref);
        invalidDocsCount++;
        return;
      }
      
      console.log(`Document ${doc.id} appears valid, keeping it`);
    });
    
    // Commit the batch if there are documents to delete
    if (invalidDocsCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${invalidDocsCount} invalid train history documents`);
    } else {
      console.log('No invalid train history documents found');
    }
  } catch (error) {
    console.error('Error cleaning up train history:', error);
  }
}

// Force delete the 'initial' document if it exists
async function forceDeleteInitialDoc() {
  try {
    const initialDocRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc('initial');
    const docSnap = await initialDocRef.get();
    
    if (docSnap.exists) {
      console.log('Found and deleting "initial" document');
      await initialDocRef.delete();
      console.log('Successfully deleted "initial" document');
    }
  } catch (error) {
    console.error('Error deleting initial document:', error);
  }
}

// Reset Train History
async function resetTrainHistory() {
  try {
    if (!confirm('Are you sure you want to reset the train history? This will delete all train assignments.')) {
      return;
    }
    
    showLoading();
    console.log('Resetting train history...');
    
    // Get all documents in the train history collection
    const snapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY).get();
    
    if (snapshot.empty) {
      console.log('No train history documents to delete');
    } else {
      // Create a batch to delete all documents
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Commit the batch
      await batch.commit();
      console.log('Successfully deleted all train history documents');
    }
    
    // Reset current wagons to empty
    state.currentWagons = Array(5).fill().map(() => ({
      conductor: null,
      members: []
    }));
    
    // Generate a new train assignment
    await generateAndSaveNewTrain();
    
    hideLoading();
    renderTrains();
    
    alert('Train history has been reset and a new train has been generated.');
  } catch (error) {
    console.error('Error resetting train history:', error);
    hideLoading();
    showError('Failed to reset train history. Please try again.');
  }
}

async function updateMemberRole(memberId, newRole) {
  try {
    // Find member
    const member = state.members.find(m => m.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    
    // Update member's role
    member.role = newRole;
    
    // Update in Firestore
    await db.collection(COLLECTIONS.MEMBERS).doc(memberId).update({
      role: newRole
    });
    
    // Handle leader collection updates
    if (newRole === 'leader') {
      // Add to leaders collection
      await db.collection(COLLECTIONS.LEADERS).doc(memberId).set({
        name: member.name
      });
    } else {
      // Remove from leaders collection
      try {
        await db.collection(COLLECTIONS.LEADERS).doc(memberId).delete();
      } catch (error) {
        console.log('Not in leaders collection or other error:', error);
      }
    }
    
    console.log(`Updated role for ${member.name} to ${newRole}`);
    return true;
  } catch (error) {
    console.error('Error updating member role:', error);
    throw error;
  }
}

// This will be added to the global scope to test the modal
function testShowMembersModal() {
  console.log('Testing members modal visibility');
  if (membersModal) {
    console.log('Modal element found, showing it');
    renderMembersList();
    membersModal.classList.remove('hidden');
    return 'Members modal should now be visible';
  } else {
    console.error('Members modal element not found!');
    // Try to find it again
    const modal = document.getElementById('members-modal');
    if (modal) {
      console.log('Found modal on retry');
      modal.classList.remove('hidden');
      return 'Found modal on retry, should be visible';
    }
    return 'Could not find members modal element';
  }
}

// Format a date for history display
function formatHistoryDate(dateString, timestamp) {
  // First try to format timestamp if available
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      const date = timestamp.toDate();
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
    }
  }
  
  // If timestamp is not available or failed, try to format the date string
  if (dateString) {
    // Check if it's in YYYYMMDD format
    if (/^\d{8}$/.test(dateString)) {
      try {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (error) {
        console.error('Error parsing date string:', error);
      }
    }
    return dateString;
  }
  
  return 'Unknown date';
}

// Function to add multiple members at once
async function addBulkMembers() {
  const bulkInput = document.getElementById('bulk-members-input').value.trim();
  
  if (!bulkInput) {
    alert('Please enter at least one member');
    return;
  }
  
  const lines = bulkInput.split('\n');
  console.log(`Processing ${lines.length} members from bulk input`);
  
  const invalidLines = [];
  const validMembers = [];
  const existingNames = state.members.map(m => m.name.toLowerCase());
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    
    // Check if the format is valid
    if (parts.length < 1 || parts.length > 2) {
      invalidLines.push({ line, reason: 'Invalid format. Use: Name,Role' });
      continue;
    }
    
    const name = parts[0].trim();
    let role = 'regular';
    
    // If role is specified
    if (parts.length === 2) {
      const specifiedRole = parts[1].trim().toLowerCase();
      if (['regular', 'r4r5', 'leader'].includes(specifiedRole)) {
        role = specifiedRole;
      } else {
        invalidLines.push({ line, reason: `Invalid role: ${parts[1]}. Use: regular, r4r5, or leader` });
        continue;
      }
    }
    
    // Check if name is empty
    if (!name) {
      invalidLines.push({ line, reason: 'Name cannot be empty' });
      continue;
    }
    
    // Check if member already exists
    if (existingNames.includes(name.toLowerCase())) {
      invalidLines.push({ line, reason: 'Member with this name already exists' });
      continue;
    }
    
    // Add to valid members list
    validMembers.push({
      id: `member${Date.now()}-${i}`,
      name,
      role
    });
    
    // Add to existing names to prevent duplicates within the bulk add
    existingNames.push(name.toLowerCase());
  }
  
  // If there are invalid lines, show them
  if (invalidLines.length > 0) {
    let errorMessage = 'The following entries could not be processed:\n\n';
    invalidLines.forEach(({ line, reason }) => {
      errorMessage += `• ${line} - ${reason}\n`;
    });
    
    if (validMembers.length > 0) {
      errorMessage += `\n${validMembers.length} valid members will still be added.`;
    }
    
    alert(errorMessage);
    
    if (validMembers.length === 0) {
      return;
    }
  }
  
  // Save valid members
  try {
    showLoading();
    
    // Add each member to Firestore
    const promises = validMembers.map(member => saveMember(member));
    await Promise.all(promises);
    
    // Add new members to state
    state.members = [...state.members, ...validMembers];
    
    // Update leaders and r4r5 lists
    validMembers.forEach(member => {
      if (member.role === 'leader') {
        state.leaders.push(member.id);
      } else if (member.role === 'r4r5') {
        state.r4r5Members.push(member.id);
      }
    });
    
    // Clear the bulk input
    document.getElementById('bulk-members-input').value = '';
    
    hideLoading();
    renderMembersList();
    
    alert(`Successfully added ${validMembers.length} members!`);
  } catch (error) {
    console.error('Error adding bulk members:', error);
    hideLoading();
    alert('Error adding members. Please try again.');
  }
}

// Load conductor rotation index
async function loadConductorRotationIndex() {
  try {
    console.log('===== LOADING CONDUCTOR ROTATION INDEX =====');
    
    // Log the conductor rotation for debugging
    console.log('Defined CONDUCTOR_ROTATION:');
    CONDUCTOR_ROTATION.forEach((name, index) => {
      console.log(`  ${index}: ${name}`);
    });
    
    // Try to load from Firebase
    console.log('Attempting to load from Firebase...');
    const rotationSnapshot = await db.collection(SETTINGS_COLLECTION).doc(CONDUCTOR_INDEX_DOC).get();
    
    if (rotationSnapshot.exists) {
      const data = rotationSnapshot.data();
      console.log('Firebase data found:', data);
      
      if (data && typeof data.index === 'number') {
        // Make sure index is valid
        if (data.index >= 0 && data.index < CONDUCTOR_ROTATION.length) {
          // Update both state and global variable
          state.currentConductorIndex = data.index;
          currentConductorIndex = data.index;
          
          const conductorName = CONDUCTOR_ROTATION[data.index];
          console.log(`✅ Successfully loaded conductor index: ${data.index} (${conductorName})`);
        } else {
          // Handle out-of-bounds index
          console.warn(`❌ Database index ${data.index} is out of bounds!`);
          console.warn(`Setting index to 1 (MamaBear861)`);
          
          state.currentConductorIndex = 1;
          currentConductorIndex = 1;
          
          // Update the database with the correct index
          await saveConductorRotationIndex();
        }
      } else {
        // Handle invalid data
        console.warn('❌ Invalid data format in database!');
        console.warn('Setting index to 1 (MamaBear861)');
        
        state.currentConductorIndex = 1;
        currentConductorIndex = 1;
        
        await saveConductorRotationIndex();
      }
    } else {
      // Handle missing document
      console.log('❓ No conductor index found in database');
      console.log('Setting index to 1 (MamaBear861)');
      
      state.currentConductorIndex = 1;
      currentConductorIndex = 1;
      
      // Create the document
      await saveConductorRotationIndex();
    }
    
    console.log(`Final conductor index after loading: ${state.currentConductorIndex}`);
    console.log('===== CONDUCTOR ROTATION INDEX LOADED =====');
  } catch (error) {
    console.error('❌ Error loading conductor rotation index:', error);
    console.warn('Setting index to 1 (MamaBear861) due to error');
    
    state.currentConductorIndex = 1;
    currentConductorIndex = 1;
  }
}

// Save conductor rotation index
async function saveConductorRotationIndex() {
  try {
    // Add safety check for valid index
    if (state.currentConductorIndex === undefined || 
        state.currentConductorIndex < 0 || 
        state.currentConductorIndex >= CONDUCTOR_ROTATION.length) {
      console.error(`Invalid conductor index: ${state.currentConductorIndex}, not saving`);
      return false;
    }
    
    // Get the current info for logging
    const index = state.currentConductorIndex;
    const name = CONDUCTOR_ROTATION[index];
    
    console.log(`Saving conductor index to Firebase: ${index} (${name})`);
    
    // Save the document
    await db.collection(SETTINGS_COLLECTION).doc(CONDUCTOR_INDEX_DOC).set({
      index: index,
      conductorName: name,
      updated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`Conductor index SAVED successfully: ${index} (${name})`);
    return true;
  } catch (error) {
    console.error('Error saving conductor rotation index:', error);
    return false;
  }
}

// Initialize password if it doesn't exist
async function initializePassword() {
  try {
    const passwordSnapshot = await db.collection(SETTINGS_COLLECTION).doc(PASSWORD_DOC).get();
    if (!passwordSnapshot.exists) {
      await db.collection(SETTINGS_COLLECTION).doc(PASSWORD_DOC).set({
        password: DEFAULT_PASSWORD
      });
      console.log('Password initialized successfully');
    } else {
      console.log('Password already exists');
    }
  } catch (error) {
    console.error('Error initializing password:', error);
  }
}

// Check password against the one stored in Firebase
async function checkPassword(inputPassword) {
  try {
    const passwordSnapshot = await db.collection(SETTINGS_COLLECTION).doc(PASSWORD_DOC).get();
    
    if (passwordSnapshot.exists) {
      const data = passwordSnapshot.data();
      return data.password === inputPassword;
    } else {
      console.warn('Password document not found, initializing...');
      await initializePassword();
      return inputPassword === DEFAULT_PASSWORD;
    }
  } catch (error) {
    console.error('Error checking password:', error);
    // Fallback to default password if there's an error
    return inputPassword === DEFAULT_PASSWORD;
  }
}

// Change the admin password
async function changeAdminPassword(newPassword) {
  try {
    if (!newPassword || newPassword.trim().length < 4) {
      console.error('Password must be at least 4 characters long');
      return false;
    }
    
    await db.collection(SETTINGS_COLLECTION).doc(PASSWORD_DOC).set({
      password: newPassword.trim(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Admin password updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating admin password:', error);
    return false;
  }
}

// Handle password change
async function handlePasswordChange() {
  // Clear previous messages
  passwordChangeMessage.classList.remove('success', 'error');
  passwordChangeMessage.classList.add('hidden');
  
  // Get input values
  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  
  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    showPasswordChangeMessage('Please fill in all password fields', 'error');
    return;
  }
  
  // Check if current password is correct
  const isCurrentPasswordValid = await checkPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    showPasswordChangeMessage('Current password is incorrect', 'error');
    return;
  }
  
  // Validate new password
  if (newPassword.length < 4) {
    showPasswordChangeMessage('New password must be at least 4 characters long', 'error');
    return;
  }
  
  // Confirm passwords match
  if (newPassword !== confirmPassword) {
    showPasswordChangeMessage('New passwords do not match', 'error');
    return;
  }
  
  // Update password
  try {
    const success = await changeAdminPassword(newPassword);
    if (success) {
      showPasswordChangeMessage('Password changed successfully', 'success');
      // Clear input fields
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
    } else {
      showPasswordChangeMessage('Failed to update password. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    showPasswordChangeMessage('An error occurred while changing password', 'error');
  }
}

// Display password change message
function showPasswordChangeMessage(message, type) {
  passwordChangeMessage.textContent = message;
  passwordChangeMessage.classList.remove('hidden', 'success', 'error');
  passwordChangeMessage.classList.add(type);
}

// Reset password change form
function resetPasswordChangeForm() {
  currentPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
  passwordChangeMessage.classList.add('hidden');
  passwordChangeMessage.classList.remove('success', 'error');
}

// Function to manually set the conductor index
async function manuallySetConductorIndex(index) {
  // Validate index
  if (index < 0 || index >= CONDUCTOR_ROTATION.length) {
    console.error(`Invalid index: ${index}. Must be between 0 and ${CONDUCTOR_ROTATION.length - 1}`);
    return false;
  }
  
  // Update the index
  state.currentConductorIndex = index;
  currentConductorIndex = index;
  
  // Save to Firebase
  try {
    await saveConductorRotationIndex();
    console.log(`Manually set conductor index to ${index} (${CONDUCTOR_ROTATION[index]})`);
    return true;
  } catch (error) {
    console.error('Error setting conductor index:', error);
    return false;
  }
}

// Authentication constants
const AUTH_STORAGE_KEY = 'allianceTrainAuth';
const AUTH_EXPIRY_DAYS = 7;

// Authentication state
let isAuthenticated = false;

// Check existing authentication from localStorage
function checkExistingAuth() {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      
      // Check if auth is still valid
      if (authData && authData.expiry && new Date(authData.expiry) > new Date()) {
        console.log('Valid authentication found in localStorage');
        setAuthenticatedState(true);
        return;
      } else {
        console.log('Expired authentication found, removing');
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    
    // Default to unauthenticated
    setAuthenticatedState(false);
  } catch (error) {
    console.error('Error checking authentication:', error);
    setAuthenticatedState(false);
  }
}

// Handle auth button click
function handleAuthButtonClick() {
  if (isAuthenticated) {
    // If already authenticated, log out
    logoutUser();
  } else {
    // If not authenticated, show password modal
    showPasswordModal('authenticate');
  }
}

// Authenticate user
async function authenticateUser(password) {
  const isValid = await checkPassword(password);
  
  if (isValid) {
    // Set authenticated state
    setAuthenticatedState(true);
    
    // Store authentication in localStorage
    saveAuthToStorage();
    
    return true;
  }
  
  return false;
}

// Logout user
function logoutUser() {
  setAuthenticatedState(false);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  console.log('User logged out');
}

// Save authentication to localStorage
function saveAuthToStorage() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + AUTH_EXPIRY_DAYS);
  
  const authData = {
    authenticated: true,
    expiry: expiry.toISOString()
  };
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  console.log(`Authentication saved, expires on ${expiry.toLocaleString()}`);
}

// Set authenticated state and update UI
function setAuthenticatedState(authenticated) {
  isAuthenticated = authenticated;
  
  // Update UI based on authentication state
  if (authenticated) {
    authButton.classList.remove('locked');
    authButton.classList.add('unlocked');
    lockIcon.classList.add('hidden');
    unlockIcon.classList.remove('hidden');
    console.log('Authentication state set to: authenticated');
  } else {
    authButton.classList.remove('unlocked');
    authButton.classList.add('locked');
    unlockIcon.classList.add('hidden');
    lockIcon.classList.remove('hidden');
    console.log('Authentication state set to: unauthenticated');
  }
  
  // Update button visibility based on authentication state
  setButtonVisibility();
}

// Function to set button visibility based on authentication state
function setButtonVisibility() {
  console.log("Setting button visibility. isAuthenticated:", isAuthenticated);
  
  if (isAuthenticated) {
    console.log("User is authenticated - showing admin buttons");
    manageMembersButton.style.display = 'inline-block';
    
    // Show admin announcement form when authenticated
    if (adminAnnouncementForm) {
      adminAnnouncementForm.classList.remove('hidden');
    }
    
    // Handle edit rotation button - remove both hidden and admin-only classes
    if (state.isEditingRotation) {
      console.log("In editing mode - showing save/cancel buttons");
      editRotationButton.classList.add('hidden');
      editRotationButton.style.display = 'none';
      saveRotationButton.classList.remove('hidden');
      saveRotationButton.style.display = 'inline-block';
      cancelRotationButton.classList.remove('hidden');
      cancelRotationButton.style.display = 'inline-block';
    } else {
      console.log("Not in editing mode - showing edit button");
      editRotationButton.classList.remove('hidden');
      editRotationButton.style.display = 'inline-block'; // Override admin-only class
      saveRotationButton.classList.add('hidden');
      saveRotationButton.style.display = 'none';
      cancelRotationButton.classList.add('hidden');
      cancelRotationButton.style.display = 'none';
    }
  } else {
    console.log("User is not authenticated - hiding admin buttons");
    manageMembersButton.style.display = 'none';
    
    // Hide admin announcement form when not authenticated
    if (adminAnnouncementForm) {
      adminAnnouncementForm.classList.add('hidden');
    }
    
    editRotationButton.classList.add('hidden');
    editRotationButton.style.display = 'none';
    saveRotationButton.classList.add('hidden');
    saveRotationButton.style.display = 'none';
    cancelRotationButton.classList.add('hidden');
    cancelRotationButton.style.display = 'none';
  }
}

// Function to export members as text for bulk import
function exportMembers() {
  // Check if we have members to export
  if (!state.members || state.members.length === 0) {
    alert('No members to export.');
    return;
  }
  
  // Get the button to update its text
  const exportMembersButton = document.getElementById('export-members-button');
  const originalText = exportMembersButton.textContent;
  
  try {
    // Create formatted text - one member per line with Name,Role format
    const formattedText = state.members.map(member => 
      `${member.name},${member.role}`
    ).join('\n');
    
    // Create a temporary textarea to copy the text
    const textarea = document.createElement('textarea');
    textarea.value = formattedText;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    // Select and copy the text
    textarea.select();
    document.execCommand('copy');
    
    // Remove the textarea
    document.body.removeChild(textarea);
    
    // Show copying status
    exportMembersButton.textContent = '✓ Copied!';
    setTimeout(() => {
      exportMembersButton.textContent = originalText;
    }, 2000);
    
    // Automatically populate the textarea with the exported data
    const bulkTextarea = document.getElementById('bulk-members-input');
    if (bulkTextarea) {
      bulkTextarea.value = formattedText;
      bulkTextarea.focus();
      bulkTextarea.select();
    }
    
    // Create download option
    const downloadOption = confirm(
      `${state.members.length} members copied to clipboard and populated in the text area below.\n\nWould you like to also download as a text file for backup?`
    );
    
    if (downloadOption) {
      // Create a Blob containing the data
      const blob = new Blob([formattedText], { type: 'text/plain' });
      
      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `train_members_${formatDate(new Date())}.txt`;
      
      // Append the link, click it, and then remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
        document.body.removeChild(downloadLink);
      }, 100);
    }
  } catch (error) {
    console.error('Error exporting members:', error);
    alert('Failed to export members. Please try again.');
    exportMembersButton.textContent = originalText;
  }
}

// Function to start editing the train rotation
function startEditRotation(docId = null) {
  console.log('Starting edit rotation mode');
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    console.error('User not authenticated');
    alert('You must be authenticated to edit the train rotation.');
    return;
  }
  
  // Use today's date as the document ID if not provided
  const editDocId = docId || formatDate(new Date());
  
  // Store the document ID being edited
  state.editingDocId = editDocId;
  console.log('Editing document ID:', state.editingDocId);
  
  // Set edit mode
  state.isEditingRotation = true;
  console.log('Edit mode set to true, updating buttons');
  
  // Show save/cancel buttons and hide edit button
  editRotationButton.classList.add('hidden');
  editRotationButton.style.display = 'none';
  saveRotationButton.classList.remove('hidden');
  saveRotationButton.style.display = 'inline-block';
  cancelRotationButton.classList.remove('hidden');
  cancelRotationButton.style.display = 'inline-block';
  
  console.log('Button visibility updated. Save button display:', saveRotationButton.style.display);
  console.log('Button visibility updated. Cancel button display:', cancelRotationButton.style.display);
  
  // Disable other buttons during edit
  manageMembersButton.disabled = true;
  viewHistoryButton.disabled = true;
  
  // Re-render trains in edit mode
  renderTrains();
}

// Function to save the edited train rotation
async function saveRotation(event) {
  console.log('Saving train rotation');
  
  try {
    // Prevent default button behavior if called from an event
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      console.error('User not authenticated');
      alert('You must be authenticated to save the train rotation.');
      return;
    }
    
    console.log('Authentication check passed');
    
    // Gather data from the edit form
    const newWagons = [];
    
    // Get conductor wagon data
    const conductorWagonSelect = document.getElementById('conductor-select');
    console.log('Conductor wagon select element:', conductorWagonSelect);
    const conductorId = conductorWagonSelect ? conductorWagonSelect.value : null;
    console.log('Selected conductor ID:', conductorId);
    
    if (!conductorId) {
      alert('You must select a conductor.');
      return;
    }
    
    // Create conductor wagon
    newWagons.push({
      conductor: conductorId,
      members: []
    });
    
    // Get regular wagon data
    const regularWagons = document.querySelectorAll('.wagon:not(.conductor-wagon)');
    console.log('Found regular wagons:', regularWagons.length);
    
    for (let i = 0; i < regularWagons.length; i++) {
      const wagon = regularWagons[i];
      const memberSelects = wagon.querySelectorAll('.member-select');
      console.log(`Wagon ${i+1} has ${memberSelects.length} member selects`);
      const members = [];
      
      for (let j = 0; j < memberSelects.length; j++) {
        const memberId = memberSelects[j].value;
        if (memberId && memberId !== 'none') {
          members.push(memberId);
        }
      }
      
      console.log(`Wagon ${i+1} has ${members.length} assigned members`);
      newWagons.push({
        members: members
      });
    }
    
    console.log('New wagon data:', JSON.stringify(newWagons));
    
    try {
      // Get the document ID to update - make sure it's a string
      let docId;
      if (typeof state.editingDocId === 'string' && state.editingDocId) {
        docId = state.editingDocId;
      } else {
        docId = formatDate(new Date());
      }
      
      console.log('Saving updates to document ID:', docId);
      
      // Reference to the document in Firestore
      const docRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc(docId);
      console.log('Document reference created for collection:', COLLECTIONS.TRAIN_HISTORY);
      
      // Ensure all values are of the correct type before sending to Firestore
      const firestoreWagons = newWagons.map(wagon => {
        // Create a clean object with the correct data types
        const cleanWagon = {};
        
        // Handle conductor - ensure it's a string or null
        if (wagon.conductor !== undefined) {
          cleanWagon.conductor = wagon.conductor ? String(wagon.conductor) : null;
        }
        
        // Handle members - ensure it's an array of strings
        cleanWagon.members = Array.isArray(wagon.members) 
          ? wagon.members.filter(m => m !== null && m !== undefined).map(m => String(m))
          : [];
        
        return cleanWagon;
      });
      
      console.log('Prepared Firestore wagon data:', JSON.stringify(firestoreWagons));
      
      // Check if the document exists
      console.log('Checking if document exists...');
      const docSnap = await docRef.get();
      console.log('Document exists:', docSnap.exists);
      
      // Prepare a clean document with proper types for all fields
      const documentData = {
        wagons: firestoreWagons,
        wagonCount: firestoreWagons.length,
        edited: true
      };
      
      if (docSnap.exists) {
        // Update existing document
        console.log('Updating existing document...');
        await docRef.update({
          ...documentData,
          editedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Document updated successfully');
      } else {
        // Create new document
        console.log('Creating new document...');
        await docRef.set({
          ...documentData,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('New document created');
      }
      
      // Update local state
      state.currentWagons = newWagons;
      
      // Exit edit mode
      state.isEditingRotation = false;
      state.editingDocId = null;
      
      // Reset button visibility
      editRotationButton.classList.remove('hidden');
      editRotationButton.style.display = 'inline-block';
      saveRotationButton.classList.add('hidden');
      saveRotationButton.style.display = 'none';
      cancelRotationButton.classList.add('hidden');
      cancelRotationButton.style.display = 'none';
      
      // Re-enable other buttons
      manageMembersButton.disabled = false;
      viewHistoryButton.disabled = false;
      
      // Re-render trains
      renderTrains();
      
      // Reload train history to get the updated data
      console.log('Reloading train history...');
      await loadTrainHistory();
      
      alert('Train rotation updated successfully!');
    } catch (innerError) {
      console.error('Error in Firestore operation:', innerError);
      console.error('Error details:', innerError);
      if (innerError && innerError.stack) {
        console.error('Error stack:', innerError.stack);
      }
      throw innerError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error saving train rotation:', error);
    console.error('Error type:', typeof error);
    if (error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    alert('Failed to save train rotation. Error: ' + (error.message || 'Unknown error'));
  }
}

// Function to cancel edit mode
function cancelRotation() {
  console.log('Canceling edit rotation');
  
  // Exit edit mode
  state.isEditingRotation = false;
  state.editingDocId = null;
  
  // Reset button visibility
  editRotationButton.classList.remove('hidden');
  editRotationButton.style.display = 'inline-block';
  saveRotationButton.classList.add('hidden');
  saveRotationButton.style.display = 'none';
  cancelRotationButton.classList.add('hidden');
  cancelRotationButton.style.display = 'none';
  
  // Re-enable other buttons
  manageMembersButton.disabled = false;
  viewHistoryButton.disabled = false;
  
  // Re-render trains
  renderTrains();
}

// Test Firebase access function
async function testFirebaseAccess() {
  try {
    console.log('Testing Firebase write access...');
    
    // Create a test document
    const testDocRef = db.collection('test').doc('write-test');
    
    // Try to write to the document
    await testDocRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      test: 'Write test',
      app: 'Train Tracker'
    });
    
    console.log('Firebase write successful!');
    
    // Try to read the document back
    const docSnap = await testDocRef.get();
    console.log('Firebase read successful:', docSnap.exists);
    
    if (docSnap.exists) {
      console.log('Test document data:', docSnap.data());
    }
    
    // Now test the trainHistory collection specifically
    console.log('Testing trainHistory collection access...');
    
    // Check if we can list documents in the collection
    const trainHistoryRef = db.collection(COLLECTIONS.TRAIN_HISTORY);
    const querySnapshot = await trainHistoryRef.limit(1).get();
    
    console.log('trainHistory collection query successful. Documents found:', !querySnapshot.empty);
    
    // Try to write a test document to trainHistory
    const trainTestDocRef = trainHistoryRef.doc('test-write-access');
    await trainTestDocRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      test: true,
      wagons: [{ members: [] }]
    });
    
    console.log('Successfully wrote test document to trainHistory collection!');
    
    // Clean up by deleting the test document
    await trainTestDocRef.delete();
    console.log('Successfully deleted test document from trainHistory collection');
    
    return true;
  } catch (error) {
    console.error('Firebase access test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

// Force delete today's train history and generate a new one
async function forceRegenerateTrainForToday() {
  try {
    console.log('Force regenerating train for today...');
    
    // Only authenticated users can force regenerate a train
    if (!isAuthenticated) {
      alert('Only administrators can force regenerate a train.');
      return false;
    }
    
    if (!confirm('WARNING: This will DELETE the current train assignment for today and create a new one. This action cannot be undone. Continue?')) {
      console.log('User cancelled force regeneration');
      return false;
    }
    
    showLoading();
    
    // Get today's date
    const todayDate = formatDate(new Date());
    console.log(`Deleting all train assignments for today (${todayDate})`);
    
    // Find all documents for today
    const todayQuery = await db.collection(COLLECTIONS.TRAIN_HISTORY)
      .where('date', '==', todayDate)
      .get();
    
    // Delete all documents for today
    if (!todayQuery.empty) {
      console.log(`Found ${todayQuery.size} train assignments to delete`);
      
      const batch = db.batch();
      let deletedCount = 0;
      
      todayQuery.forEach(doc => {
        console.log(`Marking document ${doc.id} for deletion`);
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Successfully deleted ${deletedCount} train assignments for today`);
      }
    } else {
      console.log('No train assignments found for today to delete');
    }
    
    // Generate a new train assignment
    console.log('Generating new train assignment after clearing old ones');
    
    // Load conductor rotation index first to ensure we're using the correct rotation
    try {
      console.log('Loading conductor rotation index before generating new train...');
      await loadConductorRotationIndex();
      console.log(`Current conductor index after loading: ${state.currentConductorIndex}`);
      console.log(`Using conductor: ${CONDUCTOR_ROTATION[state.currentConductorIndex]}`);
    } catch (error) {
      console.error('Error loading conductor rotation index:', error);
      // Use default value
      state.currentConductorIndex = 1;
      currentConductorIndex = 1;
      console.log(`Using default conductor index: ${state.currentConductorIndex}`);
    }
    
    // Make sure we have all the data we need
    if (!state.members || state.members.length === 0) {
      await loadMembers();
    }
    
    if (!state.leaders || state.leaders.length === 0) {
      await loadLeaders();
    }
    
    if (!state.r4r5Members || state.r4r5Members.length === 0) {
      await loadR4R5Members();
    }
    
    // Generate and save new train assignment
    const newWagons = generateTrainAssignment(
      state.members,
      state.leaders,
      state.r4r5Members,
      state.playerWagonHistory || {}
    );
    
    console.log('New train assignment generated after clearing old ones');
    
    // Save to Firestore with a unique ID
    const saved = await addTrainRotation(newWagons);
    
    // Reload train history and render the new train
    await loadTrainHistory();
    hideLoading();
    renderTrains();
    
    if (saved) {
      console.log('Successfully force regenerated train for today');
      alert('Train assignment for today has been successfully regenerated!');
      return true;
    } else {
      console.error('Failed to save new train assignment after clearing old ones');
      alert('Failed to generate new train after clearing old ones. Please try again.');
      return false;
    }
  } catch (error) {
    console.error('Error force regenerating train:', error);
    hideLoading();
    alert(`Error force regenerating train: ${error.message}`);
    return false;
  }
}

// Add the new function to the window object for testing in the console
window.forceRegenerateTrainForToday = forceRegenerateTrainForToday;

// Debugging helper function
function debug(message, obj = null) {
  const prefix = '[DEBUG] ';
  if (obj !== null) {
    console.log(prefix + message, obj);
  } else {
    console.log(prefix + message);
  }
}

// Add debug at the beginning of initialize
async function initialize() {
  try {
    debug('Starting application initialization');
    showLoading();
    console.log('Initializing application...');
    
    // Debug DOM elements
    debug('Checking key DOM elements', {
      trainContainer: !!trainContainer,
      membersModal: !!membersModal,
      historyModal: !!historyModal,
      announcementsModal: !!announcementsModal,
      conductorList: !!document.getElementById('conductor-list'),
      regularWagonsContainer: !!document.querySelector('.regular-wagons-container')
    });
    
    // Expose conductor index setter for debugging
    window.setConductorIndex = manuallySetConductorIndex;
    window.getConductorIndex = () => {
      return {
        index: state.currentConductorIndex,
        name: CONDUCTOR_ROTATION[state.currentConductorIndex],
        nextIndex: (state.currentConductorIndex + 1) % CONDUCTOR_ROTATION.length,
        nextName: CONDUCTOR_ROTATION[(state.currentConductorIndex + 1) % CONDUCTOR_ROTATION.length]
      };
    };
    window.listConductors = () => {
      return CONDUCTOR_ROTATION.map((name, index) => `${index}: ${name}`).join('\n');
    };
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Data loading timed out - proceeding with default data');
      useDefaultData();
      state.dataInitialized = true;
      state.isLoading = false;
      renderApp();
    }, 15000);
    
    // Initialize collections if they don't exist
    try {
      await initializeCollections();
      // Clean up any invalid train history documents
      await cleanupTrainHistory();
      // Initialize password if it doesn't exist
      await initializePassword();
    } catch (error) {
      console.error('Failed to initialize collections:', error);
      // Continue anyway
    }
    
    // Ensure state.members is always initialized to avoid issues
    state.members = [];
    state.leaders = [];
    state.r4r5Members = [];
    
    // Load conductor rotation index
    try {
      await loadConductorRotationIndex();
    } catch (error) {
      console.error('Failed to load conductor rotation index:', error);
      // Use the default index
      state.currentConductorIndex = currentConductorIndex;
    }
    
    // Load members first
    try {
      await loadMembers();
    } catch (error) {
      console.error('Failed to load members:', error);
      state.members = DEFAULT_MEMBERS;
    }
    
    // If still no members, use defaults
    if (!state.members || state.members.length === 0) {
      console.log('No members loaded, using default members');
      state.members = DEFAULT_MEMBERS;
    }
    
    // Then load the rest with the member data available
    try {
      await Promise.all([
        loadLeaders(),
        loadR4R5Members(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Failed to load supporting data:', error);
      // Fall back to defaults
      state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
      state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
      state.playerWagonHistory = {};
    }
    
    // If no leaders or R4/R5 members were loaded, use defaults
    if (!state.leaders || state.leaders.length === 0) {
      console.log('No leaders loaded, using default leaders');
      state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
    }
    
    if (!state.r4r5Members || state.r4r5Members.length === 0) {
      console.log('No R4/R5 members loaded, using default R4/R5 members');
      state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
    }
    
    // Finally load the train history - if this fails, show empty state instead of creating a new assignment
    try {
      await loadTrainHistory();
    } catch (error) {
      console.error('Failed to load train history:', error);
      // Do not generate a new train automatically, just set empty wagons
      console.log('Not generating a new train automatically, showing empty state');
      state.currentWagons = [];
    }
    
    // Clear the timeout since we loaded or created fallback data
    clearTimeout(loadingTimeout);
    
    // Start server time updates
    startTimeUpdates();
    
    // Check if a new daily train assignment is needed
    try {
      console.log('Checking if a new daily train assignment is needed...');
      const newTrainGenerated = await checkAndGenerateNewDailyTrain();
      
      if (newTrainGenerated) {
        console.log('New daily train assignment was automatically generated');
      } else {
        console.log('No new daily train assignment was needed');
      }
    } catch (error) {
      console.error('Error checking for new daily train:', error);
    }
    
    // Load announcements
    await loadAnnouncements();
    
    state.dataInitialized = true;
    state.isLoading = false;
    
    // Log the final state before rendering
    console.log('Final state before rendering:', {
      members: state.members.length,
      leaders: state.leaders.length,
      r4r5Members: state.r4r5Members.length,
      currentWagons: state.currentWagons ? state.currentWagons.length : 0
    });
    
    renderApp();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Error initializing application:', error);
    // Use default data on error
    useDefaultData();
    state.dataInitialized = true;
    state.isLoading = false;
    renderApp();
    showError('Failed to initialize application. Using default data.');
  }
}

// Add debug function to check Firestore collections
async function debugFirestoreCollections() {
  try {
    console.log('=== DEBUGING FIRESTORE COLLECTIONS ===');
    console.log('Current COLLECTIONS config:', COLLECTIONS);
    
    // Check if trainHistory collection exists and has documents
    console.log('Checking trainHistory collection...');
    const trainHistorySnapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY).get();
    
    if (trainHistorySnapshot.empty) {
      console.log('trainHistory collection is empty or does not exist');
    } else {
      console.log(`trainHistory collection exists with ${trainHistorySnapshot.size} documents`);
      
      // List all documents in the collection
      trainHistorySnapshot.forEach(doc => {
        console.log(`Document ID: ${doc.id}, Data:`, doc.data());
      });
    }
    
    // Try to create a test document in trainHistory collection
    const testDocRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc('test_document');
    await testDocRef.set({
      test: true,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      date: formatDate(new Date()),
      message: 'This is a test document to verify collection creation'
    });
    
    console.log('Test document created in trainHistory collection');
    
    // Check if the test document was created
    const testDocSnapshot = await testDocRef.get();
    if (testDocSnapshot.exists) {
      console.log('Successfully verified test document creation in trainHistory collection');
      // Delete the test document after verification
      await testDocRef.delete();
      console.log('Test document deleted');
    } else {
      console.error('Failed to create test document in trainHistory collection');
    }
    
    // List all collections in the Firestore database
    console.log('Attempting to list all collections...');
    
    // Note: This is a workaround as Firestore doesn't provide a direct way to list all collections
    const settingsSnapshot = await db.collection(COLLECTIONS.SETTINGS).get();
    const membersSnapshot = await db.collection(COLLECTIONS.MEMBERS).get();
    const leadersSnapshot = await db.collection(COLLECTIONS.LEADERS).get();
    const historySnapshot = await db.collection(COLLECTIONS.HISTORY).get();
    
    console.log(`Collections statistics:
      - settings: ${settingsSnapshot.empty ? 'empty' : settingsSnapshot.size + ' documents'}
      - members: ${membersSnapshot.empty ? 'empty' : membersSnapshot.size + ' documents'}
      - leaders: ${leadersSnapshot.empty ? 'empty' : leadersSnapshot.size + ' documents'}
      - history: ${historySnapshot.empty ? 'empty' : historySnapshot.size + ' documents'}
      - trainHistory: ${trainHistorySnapshot.empty ? 'empty' : trainHistorySnapshot.size + ' documents'}`);
    
    console.log('=== FIRESTORE COLLECTIONS DEBUG COMPLETE ===');
    
    return {
      success: true,
      collections: {
        settings: !settingsSnapshot.empty,
        members: !membersSnapshot.empty,
        leaders: !leadersSnapshot.empty,
        history: !historySnapshot.empty,
        trainHistory: !trainHistorySnapshot.empty
      }
    };
  } catch (error) {
    console.error('Error debugging Firestore collections:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Add the function to the window object for console testing
window.debugFirestoreCollections = debugFirestoreCollections;

// Check if a new day has passed and generate a new train assignment if needed
async function checkAndGenerateNewDailyTrain() {
  try {
    console.log('Checking if we need to generate a new daily train...');
    
    // Get today's date formatted for document ID
    const todayDate = formatDate(new Date());
    console.log(`Today's date for train assignment: ${todayDate}`);
    
    // Check if a train assignment already exists for today
    let existingAssignment = false;
    
    // First try to find by document ID
    try {
      const existingDoc = await db.collection(COLLECTIONS.TRAIN_HISTORY).doc(todayDate).get();
      
      if (existingDoc.exists) {
        console.log(`Train assignment already exists for today with ID: ${todayDate}`);
        
        // Load the existing assignment into state.currentWagons if it has valid wagons
        const data = existingDoc.data();
        if (data && data.wagons && Array.isArray(data.wagons) && data.wagons.length > 0) {
          console.log(`Loading existing train assignment with ${data.wagons.length} wagons.`);
          state.currentWagons = [...data.wagons];
          existingAssignment = true;
        } else {
          console.log('Existing train assignment has invalid wagon data.');
        }
      }
    } catch (error) {
      console.error('Error checking for train assignment by ID:', error);
    }
    
    // If not found by ID, try querying by date field as backup
    if (!existingAssignment) {
      try {
        const querySnapshot = await db.collection(COLLECTIONS.TRAIN_HISTORY)
          .where('date', '==', todayDate)
          .get();
          
        if (!querySnapshot.empty) {
          console.log(`Found ${querySnapshot.size} train assignments for today by date field.`);
          
          // Get the most recent one
          let mostRecent = null;
          querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data && data.wagons && Array.isArray(data.wagons) && data.wagons.length > 0) {
              if (!mostRecent || (data.timestamp && mostRecent.timestamp && 
                  data.timestamp.toDate().getTime() > mostRecent.timestamp.toDate().getTime())) {
                mostRecent = data;
                mostRecent.id = doc.id;
              }
            }
          });
          
          if (mostRecent) {
            console.log(`Using most recent valid train assignment for today: ${mostRecent.id}`);
            state.currentWagons = [...mostRecent.wagons];
            existingAssignment = true;
          }
        }
      } catch (error) {
        console.error('Error querying for train assignments by date field:', error);
      }
    }
    
    // If we found a valid assignment for today, exit
    if (existingAssignment) {
      console.log('Valid train assignment for today already exists. No need to generate a new one.');
      return false;
    }
    
    console.log(`No valid train assignment found for today (${todayDate}). Generating a new one.`);
    
    // Proceed with generating a new train assignment
    
    // Ensure we have members to assign
    if (!state.members || state.members.length === 0) {
      console.error('Cannot generate train assignment: No members available.');
      // Try to load members first
      try {
        await loadMembers();
        if (!state.members || state.members.length === 0) {
          throw new Error('Still no members after loading');
        }
      } catch (membersError) {
        console.error('Failed to load members:', membersError);
        return false;
      }
    }
    
    // Generate the new train assignment
    console.log('Generating new train assignment with all members...');
    const newWagons = generateNewTrainLogic();
    
    if (!newWagons || newWagons.length === 0) {
      console.error('Failed to generate new train wagons.');
      return false;
    }
    
    console.log(`Successfully generated ${newWagons.length} wagons with members assigned.`);
    
    // Save the new assignment to Firestore
    try {
      // Create a specific document ID based on today's date
      const docRef = db.collection(COLLECTIONS.TRAIN_HISTORY).doc(todayDate);
      
      // Set the document with the wagon data
      await docRef.set({
        wagons: newWagons,
        wagonCount: newWagons.length,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        date: todayDate,
        autoGenerated: true
      });
      
      console.log(`Successfully saved new train assignment to Firestore with ID: ${todayDate}`);
      
      // Update the current wagons in state
      state.currentWagons = [...newWagons];
      
      // Return true to indicate a new assignment was generated
      return true;
    } catch (saveError) {
      console.error('Error saving new train assignment to Firestore:', saveError);
      return false;
    }
  } catch (error) {
    console.error('Error in checkAndGenerateNewDailyTrain:', error);
    return false;
  }
}

// Add the function to the window object for testing in the console
window.checkAndGenerateNewDailyTrain = checkAndGenerateNewDailyTrain;

async function checkServerTime() {
  try {
    console.log('Checking server time...');
    
    // Get the server time document
    const timeSnapshot = await db.collection(COLLECTIONS.SERVER_TIME).doc('time').get();
    
    if (!timeSnapshot) {
      console.warn('Server time snapshot is null or undefined');
      fallbackToLocalTime();
      return state.serverTime;
    }
    
    if (timeSnapshot.exists) {
      const data = timeSnapshot.data();
      
      if (!data) {
        console.warn('Server time document exists but data is null or undefined');
        fallbackToLocalTime();
        return state.serverTime;
      }
      
      if (data.timestamp) {
        try {
          // Convert Firestore timestamp to JS Date
          const serverTimestamp = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          
          // Validate the timestamp is a valid date
          if (!(serverTimestamp instanceof Date) || isNaN(serverTimestamp.getTime())) {
            console.warn('Invalid server timestamp:', data.timestamp);
            fallbackToLocalTime();
            return state.serverTime;
          }
          
          state.serverTime = serverTimestamp;
          
          // Calculate time until next train with error handling
          try {
            const timeUntilNext = getTimeUntilNextTrain(serverTimestamp);
            updateServerTimeDisplay(serverTimestamp, timeUntilNext);
          } catch (timeError) {
            console.error('Error calculating time until next train:', timeError);
            // Still keep the server time, just don't show the time until next train
            updateServerTimeDisplay(serverTimestamp, { hours: 0, minutes: 0, seconds: 0 });
          }
          
          return serverTimestamp;
        } catch (dateError) {
          console.error('Error converting timestamp to date:', dateError);
          fallbackToLocalTime();
        }
      } else {
        console.warn('Server time document exists but has invalid data:', data);
        fallbackToLocalTime();
      }
    } else {
      console.warn('Server time document does not exist');
      fallbackToLocalTime();
    }
  } catch (error) {
    console.error('Error checking server time:', error);
    fallbackToLocalTime();
  }
  
  // Return server time or null
  return state.serverTime;
}

// Fallback to local time when server time can't be accessed
function fallbackToLocalTime() {
  console.log('Falling back to local time');
  state.serverTime = new Date();
  const timeUntilNext = getTimeUntilNextTrain(state.serverTime);
  updateServerTimeDisplay(state.serverTime, timeUntilNext, true); // Pass true to indicate it's local time
}

// Update the server time display
function updateServerTimeDisplay(time, timeUntilNext, isLocal = false) {
  // Update time display
  if (serverTimeDisplay) {
    const formattedTime = formatTime(time);
    serverTimeDisplay.textContent = `${formattedTime}${isLocal ? ' (Local)' : ''}`;
    
    // Update next train time
    if (nextTrainTimeDisplay && timeUntilNext) {
      nextTrainTimeDisplay.textContent = `${timeUntilNext.hours}h ${timeUntilNext.minutes}m ${timeUntilNext.seconds}s`;
    }
  }
}

// Announcements functions
// Load announcements from Firestore
async function loadAnnouncements() {
  try {
    // Initialize pagination state if needed
    if (!state.announcementPage) {
      state.announcementPage = 1;
    }
    
    if (!state.announcementPageSize) {
      state.announcementPageSize = 5;
    }
    
    // Query announcements with pagination, sorted by timestamp in descending order
    const query = db.collection(COLLECTIONS.ANNOUNCEMENTS)
      .orderBy('timestamp', 'desc');
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      state.announcements = [];
      
      // Show empty state in the announcements list
      renderAnnouncementsList();
      
      // Hide the announcement bar if no announcements
      announceBar.classList.add('hidden');
      
      return;
    }
    
    // Process the announcements
    const announcements = [];
    snapshot.forEach(doc => {
      // Skip the initial document
      if (doc.id === 'initial') {
        return;
      }
      
      const data = doc.data();
      announcements.push({
        id: doc.id,
        text: data.text,
        timestamp: data.timestamp,
        formattedDate: formatAnnouncementDate(data.timestamp)
      });
    });
    
    state.announcements = announcements;
    
    // Render the announcements list
    renderAnnouncementsList();
    
    // Show the latest announcement in the announcement bar
    displayLatestAnnouncement();
    
    return announcements;
  } catch (error) {
    console.error('Error loading announcements:', error);
    return [];
  }
}

// Format the announcement date for display
function formatAnnouncementDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  let date;
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    // Firestore timestamp
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // JavaScript Date object
    date = timestamp;
  } else {
    // Try to parse as a string or number
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format the date: "June 15, 2023 at 3:45 PM"
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) + ' at ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Open the announcements modal and load announcements
function openAnnouncementsModal() {
  // Show the announcements modal
  announcementsModal.classList.remove('hidden');
  
  // Load announcements if not already loaded
  loadAnnouncements();
  
  // Show the admin form if authenticated
  if (isAuthenticated) {
    adminAnnouncementForm.classList.remove('hidden');
  } else {
    adminAnnouncementForm.classList.add('hidden');
  }
}

// Render the announcements list in the modal
function renderAnnouncementsList() {
  if (!announcementsList) return;
  
  const announcements = state.announcements || [];
  const startIndex = (state.announcementPage - 1) * state.announcementPageSize;
  const endIndex = startIndex + state.announcementPageSize;
  const pageAnnouncements = announcements.slice(startIndex, endIndex);
  
  // Update pagination UI
  pageInfo.textContent = `Page ${state.announcementPage}`;
  prevPageButton.disabled = state.announcementPage <= 1;
  nextPageButton.disabled = endIndex >= announcements.length;
  
  if (announcements.length === 0) {
    announcementsList.innerHTML = '<div class="announcement-empty">No announcements found.</div>';
    return;
  }
  
  announcementsList.innerHTML = '';
  
  pageAnnouncements.forEach(announcement => {
    const announcementItem = document.createElement('div');
    announcementItem.className = 'announcement-item';
    
    const announcementHeader = document.createElement('div');
    announcementHeader.className = 'announcement-header';
    
    const announcementDate = document.createElement('div');
    announcementDate.className = 'announcement-date';
    announcementDate.textContent = announcement.formattedDate;
    
    announcementHeader.appendChild(announcementDate);
    
    const announcementText = document.createElement('div');
    announcementText.className = 'announcement-text';
    announcementText.textContent = announcement.text;
    
    announcementItem.appendChild(announcementHeader);
    announcementItem.appendChild(announcementText);
    
    // Add delete button for admins
    if (isAuthenticated) {
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteAnnouncement(announcement.id));
      
      announcementHeader.appendChild(deleteButton);
    }
    
    announcementsList.appendChild(announcementItem);
  });
}

// Post a new announcement to Firestore
async function postNewAnnouncement() {
  try {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('You must be an admin to post announcements');
      return;
    }
    
    const text = newAnnouncementText.value.trim();
    
    if (!text) {
      alert('Please enter an announcement message');
      return;
    }
    
    // Add announcement to Firestore
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).add({
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Clear the input field
    newAnnouncementText.value = '';
    
    // Reload announcements
    await loadAnnouncements();
    
  } catch (error) {
    console.error('Error posting announcement:', error);
    alert('An error occurred while posting the announcement. Please try again.');
  }
}

// Delete an announcement from Firestore
async function deleteAnnouncement(announcementId) {
  try {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert('You must be an admin to delete announcements');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    
    // Delete the announcement from Firestore
    await db.collection(COLLECTIONS.ANNOUNCEMENTS).doc(announcementId).delete();
    
    // Reload announcements
    await loadAnnouncements();
    
  } catch (error) {
    console.error('Error deleting announcement:', error);
    alert('An error occurred while deleting the announcement. Please try again.');
  }
}

// Function to display the full announcement in the modal
function showAnnouncementDetail() {
  // Get the latest announcement from state
  if (state.announcements && state.announcements.length > 0) {
    const latestAnnouncement = state.announcements[0];
    
    // Set the content in the modal
    if (fullAnnouncementText) {
      fullAnnouncementText.textContent = latestAnnouncement.text;
      
      // Show the modal
      announcementDetailModal.classList.remove('hidden');
    }
  }
}

// Update the renderAnnouncementsList function to include this for all displayed announcements
// This function should be inside loadAnnouncements after state.announcements is populated
function displayLatestAnnouncement() {
  if (state.announcements && state.announcements.length > 0) {
    const latest = state.announcements[0];
    
    // Update the text in the announcement bar
    latestAnnouncementText.textContent = latest.text;
    
    // Reset animation by removing and re-adding the element (forcing a reflow)
    latestAnnouncementText.style.animation = 'none';
    void latestAnnouncementText.offsetWidth; // Trigger reflow
    latestAnnouncementText.style.animation = 'marquee 45s linear infinite'; // Explicitly set animation
    
    // Add hover events to pause animation - but only once
    if (announcementTextContainer && !announcementTextContainer._hasHoverListeners) {
      announcementTextContainer.addEventListener('mouseenter', () => {
        latestAnnouncementText.style.animationPlayState = 'paused';
      });
      announcementTextContainer.addEventListener('mouseleave', () => {
        latestAnnouncementText.style.animationPlayState = 'running';
      });
      announcementTextContainer._hasHoverListeners = true; // Mark as having listeners
    }
    
    // Show the announcement bar
    announceBar.classList.remove('hidden');
  } else {
    // Hide the announcement bar if no announcements
    announceBar.classList.add('hidden');
  }
}

// Screenshot function to capture the train container
function captureScreenshot() {
  showLoading("Capturing screenshot...");
  
  // Make sure the train container is visible before capture
  const originalDisplay = trainContainer.style.display;
  if (trainContainer.classList.contains('hidden')) {
    console.log('Train container was hidden, making it temporarily visible for screenshot');
    trainContainer.classList.remove('hidden');
  }

  // Get reference to the button container
  const buttonContainer = trainContainer.querySelector('.button-container');
  const originalButtonDisplay = buttonContainer ? buttonContainer.style.display : null;
  
  // Temporarily hide the button container
  if (buttonContainer) {
    buttonContainer.style.display = 'none';
  }

  // Make sure all content is properly rendered
  setTimeout(() => {
    // Use html2canvas to capture the train container with its contents
    html2canvas(trainContainer, {
      backgroundColor: '#2a2a2a',
      scale: 2, // Higher quality
      logging: true, // Enable logging to help debug
      useCORS: true,
      allowTaint: true,
      onclone: function(clonedDocument) {
        // Any modifications to the cloned document before capture
        const clonedContainer = clonedDocument.getElementById('train-container');
        if (clonedContainer) {
          clonedContainer.style.display = 'flex';
          clonedContainer.style.visibility = 'visible';
          clonedContainer.style.position = 'static';
          clonedContainer.style.overflow = 'visible';
          
          // Also hide buttons in the cloned document
          const clonedButtonContainer = clonedContainer.querySelector('.button-container');
          if (clonedButtonContainer) {
            clonedButtonContainer.style.display = 'none';
          }
        }
      }
    }).then(canvas => {
      // Check if canvas has content
      if (canvas.width <= 1 || canvas.height <= 1) {
        console.error('Canvas has invalid dimensions:', canvas.width, canvas.height);
        alert('Error: Could not capture the train assignment. Please try again.');
        
        // Restore button container display
        if (buttonContainer && originalButtonDisplay !== null) {
          buttonContainer.style.display = originalButtonDisplay;
        } else if (buttonContainer) {
          buttonContainer.style.display = '';
        }
        
        hideLoading();
        return;
      }

      // Convert canvas to image data URL
      const imageUrl = canvas.toDataURL('image/png');
      
      // Display in modal
      screenshotImage.src = imageUrl;
      screenshotModal.classList.remove('hidden');
      
      // Set up download button
      downloadScreenshotButton.onclick = function() {
        const link = document.createElement('a');
        const filename = `SHOO-train-assignment-${formatDateTimeId(new Date())}.png`;
        link.download = filename;
        link.href = imageUrl;
        link.click();
        console.log('Download initiated for file:', filename);
      };
      
      // Set up share button if Web Share API is available
      if (navigator.share) {
        shareScreenshotButton.classList.remove('hidden');
        shareScreenshotButton.onclick = async function() {
          try {
            const blob = await (await fetch(imageUrl)).blob();
            const file = new File([blob], `SHOO-train-assignment-${formatDateTimeId(new Date())}.png`, { type: 'image/png' });
            
            await navigator.share({
              title: 'SHOO Alliance Train Assignment',
              text: 'Check out today\'s train assignment!',
              files: [file]
            });
          } catch (err) {
            console.error('Error sharing:', err);
            alert('Failed to share the screenshot: ' + err.message);
          }
        };
      } else {
        shareScreenshotButton.classList.add('hidden');
      }
      
      // Restore original states
      if (originalDisplay !== trainContainer.style.display) {
        if (originalDisplay === 'none' || originalDisplay === '') {
          trainContainer.classList.add('hidden');
        }
      }
      
      // Restore button container display
      if (buttonContainer && originalButtonDisplay !== null) {
        buttonContainer.style.display = originalButtonDisplay;
      } else if (buttonContainer) {
        buttonContainer.style.display = '';
      }
      
      hideLoading();
    }).catch(error => {
      console.error('Screenshot error:', error);
      alert('Failed to capture screenshot: ' + error.message);
      
      // Restore original visibility state
      if (originalDisplay !== trainContainer.style.display) {
        if (originalDisplay === 'none' || originalDisplay === '') {
          trainContainer.classList.add('hidden');
        }
      }
      
      // Restore button container display
      if (buttonContainer && originalButtonDisplay !== null) {
        buttonContainer.style.display = originalButtonDisplay;
      } else if (buttonContainer) {
        buttonContainer.style.display = '';
      }
      
      hideLoading();
    });
  }, 300); // Short delay to ensure DOM is ready
}

// Generate Train Logic - Helper function for new and daily trains
function generateNewTrainLogic() {
  console.log('Generating new train logic...');
  
  // Make sure we have members to assign
  if (!state.members || state.members.length === 0) {
    console.log('No members found, using default members');
    state.members = DEFAULT_MEMBERS;
  }
  
  if (!state.leaders || state.leaders.length === 0) {
    console.log('No leaders found, using default leaders');
    state.leaders = DEFAULT_MEMBERS.filter(m => m.role === 'leader').map(m => m.id);
  }
  
  if (!state.r4r5Members || state.r4r5Members.length === 0) {
    console.log('No R4/R5 members found, using default R4/R5 members');
    state.r4r5Members = DEFAULT_MEMBERS.filter(m => m.role === 'r4r5').map(m => m.id);
  }
  
  const newWagons = generateTrainAssignment(
    state.members,
    state.leaders,
    state.r4r5Members,
    state.playerWagonHistory
  );
  
  return newWagons;
}