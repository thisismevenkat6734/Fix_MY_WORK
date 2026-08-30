/* ============================================================
   FIX MY WORK — CUSTOMER APPLICATION
   Production-oriented customer application
   ============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================================
   FIREBASE CONFIG
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCP8DGLQMXPUsv_p2zQ-NLkziwPQe1XkgU",
    authDomain: "fixmywork-d83ba.firebaseapp.com",
    databaseURL:
        "https://fixmywork-d83ba-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fixmywork-d83ba",
    storageBucket: "fixmywork-d83ba.firebasestorage.app",
    messagingSenderId: "207313302232",
    appId: "1:207313302232:web:73055348982ad84abeddad",
    measurementId: "G-11FQMLCBQY"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

/* ============================================================
   CLOUDINARY
   ============================================================ */

const CLOUDINARY_CLOUD_NAME = "lqfozcs3";
const CLOUDINARY_UPLOAD_PRESET = "fixmywork_upload";

const CLOUDINARY_UPLOAD_URL =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {
    user: null,
    customer: null,

    selectedService: "",
    selectedRating: 0,

    latitude: null,
    longitude: null,
    locationAddress: "",

    activeOrder: null,
    orders: [],

    orderUnsubscribe: null,

    deferredInstallPrompt: null,

    selectedProblemFiles: [],
    selectedCompletionFile: null,

    isSubmittingOrder: false,
    isUploading: false
};

/* ============================================================
   100+ SERVICES
   ============================================================ */

const SERVICES = [
    ["Electrical", "⚡", "Electricians & electrical repairs"],
    ["Plumbing", "🔧", "Plumbers & water problems"],
    ["AC Repair", "❄️", "AC service & repair"],
    ["RO & Water Purifier", "💧", "RO & purifier service"],
    ["Refrigerator Repair", "🧊", "Refrigerator service & repair"],
    ["Washing Machine Repair", "🧺", "Washing machine repair"],
    ["TV Repair", "📺", "TV service & repair"],
    ["Microwave Repair", "♨️", "Microwave service & repair"],
    ["Geyser Repair", "🚿", "Geyser service & repair"],
    ["Chimney Repair", "🏠", "Chimney service & repair"],
    ["Fan Repair", "🌀", "Fan repair & installation"],
    ["Inverter Repair", "🔋", "Inverter & backup service"],
    ["Battery Service", "🔋", "Battery service & replacement"],
    ["Generator Repair", "⚙️", "Generator service & repair"],
    ["CCTV Installation", "📹", "CCTV installation & repair"],
    ["Internet & WiFi", "📶", "Internet & WiFi service"],
    ["Laptop Repair", "💻", "Laptop service & repair"],
    ["Computer Repair", "🖥️", "Computer service & repair"],
    ["Mobile Phone Repair", "📱", "Mobile phone service"],
    ["Printer Repair", "🖨️", "Printer service & repair"],
    ["Software Installation", "💿", "Software installation"],
    ["Data Recovery", "💾", "Data recovery service"],
    ["Network Setup", "🌐", "Network setup & support"],
    ["Carpentry", "🪚", "Furniture & woodwork"],
    ["Furniture Repair", "🪑", "Furniture repair"],
    ["Furniture Assembly", "🔨", "Furniture assembly"],
    ["Painting", "🎨", "Home & commercial painting"],
    ["Wall Painting", "🖌️", "Interior wall painting"],
    ["Exterior Painting", "🏡", "Exterior painting"],
    ["Waterproofing", "🛡️", "Waterproofing service"],
    ["Masonry", "🧱", "Masonry work"],
    ["Tile Work", "◼️", "Tile installation & repair"],
    ["Granite Work", "⬛", "Granite installation & repair"],
    ["Marble Work", "⬜", "Marble work"],
    ["Flooring", "🏠", "Flooring installation"],
    ["False Ceiling", "🏠", "False ceiling work"],
    ["POP Work", "🏗️", "POP work"],
    ["Glass Work", "🪟", "Glass installation & repair"],
    ["Aluminium Work", "🔲", "Aluminium fabrication"],
    ["UPVC Work", "🪟", "UPVC door & window service"],
    ["Welding", "🔥", "Welding & fabrication"],
    ["Locksmith", "🔐", "Lock & key service"],
    ["Door Repair", "🚪", "Door repair & installation"],
    ["Window Repair", "🪟", "Window repair"],
    ["Curtain Installation", "🪟", "Curtain installation"],
    ["Blinds Installation", "🪟", "Blinds installation"],
    ["Kitchen Repair", "🍳", "Kitchen repair work"],
    ["Modular Kitchen", "🍽️", "Modular kitchen service"],
    ["Bathroom Repair", "🚿", "Bathroom repair"],
    ["Toilet Repair", "🚽", "Toilet repair"],
    ["Drain Cleaning", "🧹", "Drain cleaning"],
    ["Sewer Cleaning", "🚰", "Sewer cleaning"],
    ["Water Tank Cleaning", "🛢️", "Water tank cleaning"],
    ["House Cleaning", "🧹", "Home cleaning"],
    ["Deep Cleaning", "✨", "Deep cleaning service"],
    ["Bathroom Cleaning", "🧽", "Bathroom cleaning"],
    ["Kitchen Cleaning", "🧽", "Kitchen cleaning"],
    ["Sofa Cleaning", "🛋️", "Sofa cleaning"],
    ["Carpet Cleaning", "🧼", "Carpet cleaning"],
    ["Mattress Cleaning", "🛏️", "Mattress cleaning"],
    ["Water Tank Cleaning", "💧", "Tank cleaning"],
    ["Pest Control", "🐜", "Pest control service"],
    ["Termite Control", "🐜", "Termite treatment"],
    ["Cockroach Control", "🪳", "Cockroach treatment"],
    ["Mosquito Control", "🦟", "Mosquito control"],
    ["Bed Bug Control", "🐞", "Bed bug treatment"],
    ["Rat Control", "🐀", "Rodent control"],
    ["Gardening", "🌱", "Gardening service"],
    ["Lawn Maintenance", "🌿", "Lawn maintenance"],
    ["Tree Trimming", "🌳", "Tree trimming"],
    ["Plant Maintenance", "🪴", "Plant maintenance"],
    ["Home Shifting", "📦", "Home moving service"],
    ["Office Shifting", "🏢", "Office moving service"],
    ["Packing Service", "📦", "Packing service"],
    ["Loading & Unloading", "📦", "Loading & unloading"],
    ["Delivery Assistance", "🚚", "Local delivery assistance"],
    ["AC Installation", "❄️", "AC installation"],
    ["AC Gas Refill", "❄️", "AC gas refill"],
    ["AC Cleaning", "🧹", "AC cleaning"],
    ["AC Uninstallation", "❄️", "AC removal"],
    ["Refrigerator Gas Refill", "🧊", "Refrigerator gas service"],
    ["Washing Machine Installation", "🧺", "Washing machine installation"],
    ["Dishwasher Repair", "🍽️", "Dishwasher service"],
    ["Dishwasher Installation", "🍽️", "Dishwasher installation"],
    ["Water Heater Repair", "🚿", "Water heater service"],
    ["Water Heater Installation", "🚿", "Water heater installation"],
    ["Solar Panel Service", "☀️", "Solar panel service"],
    ["Solar Water Heater", "☀️", "Solar water heater service"],
    ["Electrical Wiring", "⚡", "House electrical wiring"],
    ["Switch & Socket Repair", "🔌", "Switch and socket repair"],
    ["Lighting Installation", "💡", "Lighting installation"],
    ["LED Installation", "💡", "LED light installation"],
    ["MCB Repair", "⚡", "MCB service"],
    ["Meter Installation", "⚡", "Meter-related electrical service"],
    ["Home Automation", "🏠", "Smart home installation"],
    ["Security System", "🛡️", "Security system installation"],
    ["Doorbell Installation", "🔔", "Doorbell installation"],
    ["RO Installation", "💧", "RO installation"],
    ["RO Filter Replacement", "💧", "RO filter replacement"],
    ["Water Softener", "💧", "Water softener service"],
    ["Water Pump Repair", "🚰", "Water pump service"],
    ["Motor Repair", "⚙️", "Motor service & repair"],
    ["Borewell Pump", "🚰", "Borewell pump service"],
    ["Bike Repair", "🏍️", "Two-wheeler service"],
    ["Car Repair", "🚗", "Car service & repair"],
    ["Car Battery", "🔋", "Car battery service"],
    ["Tyre Service", "⭕", "Tyre repair & replacement"],
    ["Car Washing", "🚘", "Car washing service"],
    ["Bike Washing", "🏍️", "Bike washing service"],
    ["Car AC Repair", "❄️", "Car AC service"],
    ["Emergency Roadside Assistance", "🚨", "Roadside assistance"],
    ["Home Appliance Installation", "🔌", "Appliance installation"],
    ["Home Appliance Repair", "🛠️", "Appliance repair"],
    ["TV Installation", "📺", "TV installation"],
    ["DTH Installation", "📡", "DTH installation"],
    ["DTH Repair", "📡", "DTH service"],
    ["Satellite Installation", "📡", "Satellite installation"],
    ["Smart TV Setup", "📺", "Smart TV setup"],
    ["Music System Installation", "🔊", "Audio system installation"],
    ["Speaker Repair", "🔊", "Speaker repair"],
    ["RO Annual Maintenance", "💧", "RO maintenance"],
    ["Electrical Maintenance", "⚡", "Electrical maintenance"],
    ["Plumbing Maintenance", "🔧", "Plumbing maintenance"],
    ["Home Maintenance", "🏠", "General home maintenance"],
    ["Commercial Maintenance", "🏢", "Commercial maintenance"],
    ["Office Electrical", "🏢", "Office electrical work"],
    ["Office Plumbing", "🏢", "Office plumbing work"],
    ["Office Cleaning", "🧹", "Office cleaning"],
    ["Shop Repair", "🏪", "Shop repair service"],
    ["Sign Board Installation", "🪧", "Sign board installation"],
    ["AC Duct Cleaning", "❄️", "AC duct cleaning"],
    ["Kitchen Chimney Cleaning", "🧹", "Kitchen chimney cleaning"],
    ["Exhaust Fan Repair", "🌀", "Exhaust fan service"],
    ["Water Leakage Detection", "💧", "Leak detection"],
    ["Pipe Leakage Repair", "🚰", "Pipe leakage repair"],
    ["Gas Stove Repair", "🔥", "Gas stove service"],
    ["Gas Stove Installation", "🔥", "Gas stove installation"],
    ["Induction Stove Repair", "🍳", "Induction stove repair"],
    ["Oven Repair", "♨️", "Oven service"],
    ["Mixer Grinder Repair", "⚙️", "Mixer grinder repair"],
    ["Iron Box Repair", "🔌", "Iron box repair"],
    ["Vacuum Cleaner Repair", "🧹", "Vacuum cleaner repair"],
    ["Air Cooler Repair", "💨", "Air cooler service"],
    ["Air Cooler Cleaning", "💨", "Air cooler cleaning"],
    ["Dehumidifier Service", "💨", "Dehumidifier service"],
    ["CCTV Maintenance", "📹", "CCTV maintenance"],
    ["Biometric Installation", "🔐", "Biometric installation"],
    ["Access Control", "🔐", "Access control installation"],
    ["Intercom Installation", "☎️", "Intercom installation"],
    ["Home Inspection", "🔎", "Home inspection"],
    ["Rental Property Maintenance", "🏠", "Rental property maintenance"],
    ["Emergency Home Repair", "🚨", "Emergency home repair"],
    ["Other Home Service", "🛠️", "General home service"]
];

/* ============================================================
   DOM HELPERS
   ============================================================ */

const $ = (id) => document.getElementById(id);

const qs = (selector) => document.querySelector(selector);

const qsa = (selector) =>
    Array.from(document.querySelectorAll(selector));

function safeText(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(timestamp) {
    if (!timestamp) return "—";

    try {
        const date =
            typeof timestamp.toDate === "function"
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    } catch {
        return "—";
    }
}

/* ============================================================
   TOAST
   ============================================================ */

function showToast(message, type = "info") {
    const container = $("toastContainer");

    if (!container) return;

    const toast = document.createElement("div");

    toast.className = `toast toast-${type}`;

    toast.innerHTML = `
        <div class="toast-content">
            <strong>${safeText(message)}</strong>
        </div>
        <button
            type="button"
            aria-label="Close notification"
            class="toast-close"
        >×</button>
    `;

    const closeButton = toast.querySelector(".toast-close");

    closeButton?.addEventListener("click", () => {
        toast.remove();
    });

    container.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 5000);
}

/* ============================================================
   LOADING
   ============================================================ */

function setLoading(active, title = "Please wait...", message = "Connecting securely.") {
    const overlay = $("loadingOverlay");

    if (!overlay) return;

    const titleElement = $("loadingTitle");
    const messageElement = $("loadingMessage");

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (messageElement) {
        messageElement.textContent = message;
    }

    overlay.classList.toggle("hidden", !active);
    overlay.setAttribute("aria-hidden", String(!active));
}

/* ============================================================
   MODALS
   ============================================================ */

function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    const focusable = modal.querySelector(
        "input, select, textarea, button"
    );

    window.setTimeout(() => {
        focusable?.focus();
    }, 50);
}

function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add("hidden");

    if (!document.querySelector(".modal:not(.hidden)")) {
        document.body.classList.remove("modal-open");
    }
}

/* ============================================================
   FIREBASE ERROR MESSAGES
   ============================================================ */

function friendlyFirebaseError(error) {
    const code = error?.code || "";

    const messages = {
        "auth/invalid-credential":
            "Email or password is incorrect.",
        "auth/invalid-login-credentials":
            "Email or password is incorrect.",
        "auth/user-not-found":
            "No account was found with this email.",
        "auth/wrong-password":
            "Email or password is incorrect.",
        "auth/email-already-in-use":
            "An account already exists with this email.",
        "auth/weak-password":
            "Password must be at least 6 characters.",
        "auth/invalid-email":
            "Please enter a valid email address.",
        "auth/too-many-requests":
            "Too many attempts. Please try again later.",
        "auth/network-request-failed":
            "Network problem. Please check your connection.",
        "permission-denied":
            "You do not have permission for this action."
    };

    return (
        messages[code] ||
        "Something went wrong. Please try again."
    );
}

/* ============================================================
   VALIDATION
   ============================================================ */

function normalizePhone(phone) {
    return String(phone || "")
        .replace(/[^\d+]/g, "")
        .trim();
}

function isValidPhone(phone) {
    const cleaned = normalizePhone(phone);

    return /^\+?[0-9]{10,15}$/.test(cleaned);
}

function validateImage(file) {
    if (!file) return false;

    const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(file.type)) {
        showToast(
            "Only JPG, PNG and WebP images are allowed.",
            "error"
        );
        return false;
    }

    if (file.size > 8 * 1024 * 1024) {
        showToast(
            "Each image must be smaller than 8 MB.",
            "error"
        );
        return false;
    }

    return true;
}

/* ============================================================
   CLOUDINARY UPLOAD
   ============================================================ */

async function uploadToCloudinary(file, folder) {
    if (!validateImage(file)) {
        throw new Error("Invalid image.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );
    formData.append("folder", folder);

    const response = await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error("Image upload failed.");
    }

    const data = await response.json();

    if (!data.secure_url) {
        throw new Error("Cloudinary did not return an image URL.");
    }

    return {
        url: data.secure_url,
        publicId: data.public_id || "",
        width: data.width || null,
        height: data.height || null
    };
}

async function uploadMultipleImages(files, folder) {
    const uploaded = [];

    for (const file of files) {
        const result = await uploadToCloudinary(
            file,
            folder
        );

        uploaded.push(result);
    }

    return uploaded;
}

/* ============================================================
   CUSTOMER PROFILE
   ============================================================ */

async function ensureCustomerProfile(user) {
    if (!user) return null;

    const customerRef = doc(
        db,
        "customers",
        user.uid
    );

    const snapshot = await getDoc(customerRef);

    if (!snapshot.exists()) {
        const profile = {
            uid: user.uid,
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            role: "customer",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await setDoc(customerRef, profile);

        return {
            ...profile,
            uid: user.uid
        };
    }

    return {
        ...snapshot.data(),
        uid: user.uid
    };
}

/* ============================================================
   AUTH UI
   ============================================================ */

function updateAuthUI() {
    const authButton = $("authButton");

    if (!authButton) return;

    if (state.user) {
        authButton.textContent = "Logout";
    } else {
        authButton.textContent = "Login";
    }

    updateWorksUI();
}

async function handleAuthButton() {
    if (state.user) {
        await logoutUser();
        return;
    }

    openModal("authModal");
}

async function logoutUser() {
    try {
        await signOut(auth);

        showToast(
            "You have been logged out.",
            "success"
        );
    } catch (error) {
        showToast(
            friendlyFirebaseError(error),
            "error"
        );
    }
}

/* ============================================================
   LOGIN
   ============================================================ */

async function handleLogin(event) {
    event.preventDefault();

    const email = $("authEmail")?.value.trim();
    const password = $("authPassword")?.value;

    if (!email || !password) {
        showToast(
            "Please enter your email and password.",
            "error"
        );
        return;
    }

    try {
        setLoading(
            true,
            "Signing in...",
            "Securing your customer account."
        );

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        closeModal("authModal");

        event.target.reset();

        showToast(
            "Login successful.",
            "success"
        );
    } catch (error) {
        showToast(
            friendlyFirebaseError(error),
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* ============================================================
   REGISTRATION
   ============================================================ */

async function handleRegistration(event) {
    event.preventDefault();

    const name = $("registerName")?.value.trim();
    const email = $("registerEmail")?.value.trim();
    const phone = normalizePhone(
        $("registerPhone")?.value
    );
    const password = $("registerPassword")?.value;

    if (!name || name.length < 2) {
        showToast(
            "Please enter your full name.",
            "error"
        );
        return;
    }

    if (!email) {
        showToast(
            "Please enter your email address.",
            "error"
        );
        return;
    }

    if (!isValidPhone(phone)) {
        showToast(
            "Please enter a valid mobile number.",
            "error"
        );
        return;
    }

    if (!password || password.length < 6) {
        showToast(
            "Password must be at least 6 characters.",
            "error"
        );
        return;
    }

    try {
        setLoading(
            true,
            "Creating account...",
            "Setting up your secure customer account."
        );

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        await updateProfile(
            credential.user,
            {
                displayName: name
            }
        );

        await setDoc(
            doc(db, "customers", credential.user.uid),
            {
                uid: credential.user.uid,
                name,
                email,
                phone,
                role: "customer",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );

        closeModal("registerModal");

        event.target.reset();

        showToast(
            "Account created successfully.",
            "success"
        );
    } catch (error) {
        showToast(
            friendlyFirebaseError(error),
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* ============================================================
   PASSWORD RESET
   ============================================================ */

async function handleForgotPassword() {
    const email = $("authEmail")?.value.trim();

    if (!email) {
        showToast(
            "Enter your email address first.",
            "error"
        );
        return;
    }

    try {
        setLoading(
            true,
            "Sending reset email...",
            "Please wait."
        );

        await sendPasswordResetEmail(
            auth,
            email
        );

        showToast(
            "Password reset email sent.",
            "success"
        );
    } catch (error) {
        showToast(
            friendlyFirebaseError(error),
            "error"
        );
    } finally {
        setLoading(false);
    }
}

/* ============================================================
   SERVICES
   ============================================================ */

function getServiceData(name) {
    return SERVICES.find(
        ([serviceName]) => serviceName === name
    );
}

function populateServiceSelect() {
    const select = $("serviceSelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">Select service</option>
    `;

    for (const [name] of SERVICES) {
        const option = document.createElement("option");

        option.value = name;
        option.textContent = name;

        select.appendChild(option);
    }
}

function populateAllServices() {
    const grid = $("allServicesGrid");

    if (!grid) return;

    grid.innerHTML = "";

    for (const [name, icon, description] of SERVICES) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "service-card";
        button.dataset.service = name;

        button.innerHTML = `
            <span class="service-icon">
                ${safeText(icon)}
            </span>

            <strong>
                ${safeText(name)}
            </strong>

            <small>
                ${safeText(description)}
            </small>
        `;

        button.addEventListener(
            "click",
            () => selectService(name)
        );

        grid.appendChild(button);
    }
}

function selectService(serviceName) {
    const data = getServiceData(serviceName);

    if (!data) {
        showToast(
            "This service is currently unavailable.",
            "error"
        );
        return;
    }

    state.selectedService = serviceName;

    const select = $("serviceSelect");

    if (select) {
        select.value = serviceName;
    }

    const selectedText =
        $("selectedServiceText");

    if (selectedText) {
        selectedText.textContent =
            `${serviceName}: ${data[2]}`;
    }

    openServiceModal();
}

function openServiceModal() {
    if (!state.user) {
        openModal("authModal");

        showToast(
            "Please login before requesting a service.",
            "info"
        );

        return;
    }

    const form = $("serviceForm");

    if (form && state.customer) {
        const nameInput = $("customerName");
        const phoneInput = $("customerPhone");

        if (
            nameInput &&
            !nameInput.value &&
            state.customer.name
        ) {
            nameInput.value = state.customer.name;
        }

        if (
            phoneInput &&
            !phoneInput.value &&
            state.customer.phone
        ) {
            phoneInput.value = state.customer.phone;
        }
    }

    openModal("serviceModal");
}

function handleServiceCardClick(event) {
    const card =
        event.target.closest("[data-service]");

    if (!card) return;

    selectService(
        card.dataset.service
    );
}

/* ============================================================
   LOCATION
   ============================================================ */

function requestCurrentLocation() {
    if (!navigator.geolocation) {
        showToast(
            "Location is not supported by this browser.",
            "error"
        );
        return;
    }

    setLoading(
        true,
        "Getting your location...",
        "Please allow location access."
    );

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            state.latitude =
                Number(position.coords.latitude);

            state.longitude =
                Number(position.coords.longitude);

            state.locationAddress =
                `${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}`;

            updateLocationUI();

            await reverseGeocodeLocation();

            setLoading(false);

            showToast(
                "Your location has been selected.",
                "success"
            );
        },
        (error) => {
            setLoading(false);

            let message =
                "Unable to get your location.";

            if (error.code === 1) {
                message =
                    "Location permission was denied.";
            }

            if (error.code === 2) {
                message =
                    "Your location is currently unavailable.";
            }

            if (error.code === 3) {
                message =
                    "Location request timed out.";
            }

            showToast(
                message,
                "error"
            );
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }
    );
}

async function reverseGeocodeLocation() {
    if (
        state.latitude === null ||
        state.longitude === null
    ) {
        return;
    }

    try {
        const url =
            "https://nominatim.openstreetmap.org/reverse" +
            `?format=jsonv2&lat=${encodeURIComponent(state.latitude)}` +
            `&lon=${encodeURIComponent(state.longitude)}`;

        const response = await fetch(url, {
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) return;

        const data = await response.json();

        const address =
            data?.display_name || "";

        if (address) {
            state.locationAddress = address;

            const addressInput =
                $("serviceAddress");

            if (addressInput) {
                addressInput.value = address;
            }

            updateLocationUI();
        }
    } catch {
        /* Coordinates remain usable even if reverse geocoding fails. */
    }
}

function updateLocationUI() {
    const locationText =
        $("locationText");

    const locationInfo =
        $("selectedLocationInfo");

    const mapStatus =
        $("mapStatus");

    const nearbyCount =
        $("nearbyCount");

    const pin =
        $("customerMapPin");

    if (state.latitude !== null) {
        if (locationText) {
            locationText.textContent =
                "Location selected";
        }

        if (locationInfo) {
            locationInfo.textContent =
                state.locationAddress ||
                `${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}`;
        }

        if (mapStatus) {
            mapStatus.textContent =
                "Your service location is selected";
        }

        if (nearbyCount) {
            nearbyCount.textContent =
                "Matching nearby professionals";
        }

        if (pin) {
            pin.classList.add("active");
        }
    }
}

/* ============================================================
   PHOTO PREVIEW
   ============================================================ */

function renderPhotoPreview() {
    const preview = $("photoPreview");

    if (!preview) return;

    preview.innerHTML = "";

    for (const file of state.selectedProblemFiles) {
        const wrapper =
            document.createElement("div");

        wrapper.className = "preview-item";

        const image =
            document.createElement("img");

        image.alt = "Selected service photo";

        image.src =
            URL.createObjectURL(file);

        wrapper.appendChild(image);

        preview.appendChild(wrapper);
    }
}

function renderCompletionPreview() {
    const preview =
        $("completionPhotoPreview");

    if (!preview) return;

    preview.innerHTML = "";

    if (!state.selectedCompletionFile) {
        return;
    }

    const image =
        document.createElement("img");

    image.alt = "Selected completion photo";

    image.src =
        URL.createObjectURL(
            state.selectedCompletionFile
        );

    preview.appendChild(image);
}

/* ============================================================
   SERVICE REQUEST
   ============================================================ */

async function createServiceRequest(event) {
    event.preventDefault();

    if (state.isSubmittingOrder) {
        return;
    }

    if (!state.user) {
        openModal("authModal");

        showToast(
            "Please login first.",
            "error"
        );

        return;
    }

    const service =
        $("serviceSelect")?.value ||
        state.selectedService;

    const customerName =
        $("customerName")?.value.trim();

    const customerPhone =
        normalizePhone(
            $("customerPhone")?.value
        );

    const description =
        $("problemDescription")?.value.trim();

    const address =
        $("serviceAddress")?.value.trim();

    if (!service) {
        showToast(
            "Please select a service.",
            "error"
        );
        return;
    }

    if (!customerName) {
        showToast(
            "Please enter your name.",
            "error"
        );
        return;
    }

    if (!isValidPhone(customerPhone)) {
        showToast(
            "Please enter a valid mobile number.",
            "error"
        );
        return;
    }

    if (
        !description ||
        description.length < 5
    ) {
        showToast(
            "Please describe the problem.",
            "error"
        );
        return;
    }

    if (!address) {
        showToast(
            "Please enter the complete service address.",
            "error"
        );
        return;
    }

    if (
        state.latitude === null ||
        state.longitude === null
    ) {
        showToast(
            "Please select your current location for nearby matching.",
            "error"
        );
        return;
    }

    if (state.selectedProblemFiles.length > 5) {
        showToast(
            "You can upload a maximum of 5 photos.",
            "error"
        );
        return;
    }

    state.isSubmittingOrder = true;

    try {
        setLoading(
            true,
            "Creating service request...",
            "Finding eligible professionals."
        );

        let uploadedPhotos = [];

        if (state.selectedProblemFiles.length) {
            setLoading(
                true,
                "Uploading photos...",
                "Securely processing your service photos."
            );

            uploadedPhotos =
                await uploadMultipleImages(
                    state.selectedProblemFiles,
                    `fix-my-work/customers/${state.user.uid}/requests`
                );
        }

        setLoading(
            true,
            "Searching for a professional...",
            "Your request is being sent to eligible workers."
        );

        const orderData = {
            customerId: state.user.uid,

            customerName,
            customerPhone,

            service,
            serviceId: service
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-"),

            description,

            address,

            latitude: state.latitude,
            longitude: state.longitude,

            location: {
                latitude: state.latitude,
                longitude: state.longitude
            },

            photos: uploadedPhotos,

            status: "SEARCHING",

            workerId: null,
            workerName: null,
            workerPhone: null,
            workerPhoto: null,
            workerRating: null,

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),

            acceptedAt: null,
            startedAt: null,
            completedAt: null,
            cancelledAt: null,

            cancellationReason: null,

            customerCancelled: false,

            searchVersion: 1
        };

        const orderRef =
            await addDoc(
                collection(db, "orders"),
                orderData
            );

        closeModal("serviceModal");

        resetServiceForm();

        showToast(
            "Service request created. Searching for a professional.",
            "success"
        );

        await loadSingleOrder(
            orderRef.id
        );
    } catch (error) {
        console.error(
            "Service request creation failed:",
            error
        );

        showToast(
            error?.message ||
                "Unable to create the service request.",
            "error"
        );
    } finally {
        state.isSubmittingOrder = false;
        setLoading(false);
    }
}

/* ============================================================
   RESET SERVICE FORM
   ============================================================ */

function resetServiceForm() {
    const form = $("serviceForm");

    form?.reset();

    state.selectedService = "";
    state.selectedProblemFiles = [];

    const selectedText =
        $("selectedServiceText");

    if (selectedText) {
        selectedText.textContent =
            "Tell us what you need.";
    }

    renderPhotoPreview();

    updateLocationUI();
}

/* ============================================================
   ORDER LISTENER
   ============================================================ */

function subscribeToCustomerOrders() {
    if (!state.user) return;

    if (state.orderUnsubscribe) {
        state.orderUnsubscribe();
        state.orderUnsubscribe = null;
    }

    const ordersQuery = query(
        collection(db, "orders"),
        where(
            "customerId",
            "==",
            state.user.uid
        )
    );

    state.orderUnsubscribe =
        onSnapshot(
            ordersQuery,
            (snapshot) => {
                const orders =
                    snapshot.docs.map(
                        (item) => ({
                            id: item.id,
                            ...item.data()
                        })
                    );

                orders.sort(
                    (a, b) => {
                        const aTime =
                            a.createdAt?.toMillis?.() ||
                            0;

                        const bTime =
                            b.createdAt?.toMillis?.() ||
                            0;

                        return bTime - aTime;
                    }
                );

                state.orders = orders;

                const active =
                    orders.find(
                        (order) =>
                            ![
                                "COMPLETED",
                                "CANCELLED",
                                "EXPIRED"
                            ].includes(
                                order.status
                            )
                    );

                state.activeOrder =
                    active || null;

                renderActiveOrder();
                renderWorks();

                if (active) {
                    updateMapForOrder(active);
                }
            },
            (error) => {
                console.error(
                    "Order listener error:",
                    error
                );

                showToast(
                    "Unable to update your orders in realtime.",
                    "error"
                );
            }
        );
}

/* ============================================================
   LOAD SINGLE ORDER
   ============================================================ */

async function loadSingleOrder(orderId) {
    try {
        const snapshot =
            await getDoc(
                doc(db, "orders", orderId)
            );

        if (!snapshot.exists()) {
            return;
        }

        const order = {
            id: snapshot.id,
            ...snapshot.data()
        };

        state.activeOrder = order;

        renderActiveOrder();
    } catch (error) {
        console.error(
            "Unable to load order:",
            error
        );
    }
}

/* ============================================================
   ORDER STATUS
   ============================================================ */

function statusLabel(status) {
    const labels = {
        CREATED: "Request created",
        SEARCHING: "Searching for a professional",
        ACCEPTED: "Professional accepted",
        WORKER_ON_THE_WAY: "Professional is on the way",
        ARRIVED: "Professional has arrived",
        IN_PROGRESS: "Work in progress",
        COMPLETED: "Work completed",
        CANCELLED: "Order cancelled",
        EXPIRED: "Request expired"
    };

    return labels[status] ||
        "Service request";
}

function statusClass(status) {
    return String(status || "")
        .toLowerCase()
        .replaceAll("_", "-");
}

/* ============================================================
   ACTIVE ORDER UI
   ============================================================ */

function renderActiveOrder() {
    const section =
        $("activeOrderSection");

    const container =
        $("activeOrderContainer");

    if (!section || !container) {
        return;
    }

    const order = state.activeOrder;

    if (!order) {
        section.classList.add("hidden");
        container.innerHTML = "";
        return;
    }

    section.classList.remove("hidden");

    const searching =
        order.status === "SEARCHING";

    const accepted =
        [
            "ACCEPTED",
            "WORKER_ON_THE_WAY",
            "ARRIVED",
            "IN_PROGRESS"
        ].includes(order.status);

    let workerHTML = "";

    if (accepted && order.workerId) {
        workerHTML = `
            <div class="worker-card">
                <div class="worker-avatar">
                    ${
                        order.workerPhoto
                            ? `<img src="${safeText(order.workerPhoto)}" alt="Professional">`
                            : "👷"
                    }
                </div>

                <div class="worker-info">
                    <strong>
                        ${safeText(
                            order.workerName ||
                            "Professional"
                        )}
                    </strong>

                    <span>
                        ${safeText(
                            order.service ||
                            ""
                        )}
                    </span>

                    ${
                        order.workerRating
                            ? `<small>⭐ ${safeText(order.workerRating)}</small>`
                            : ""
                    }
                </div>

                ${
                    order.workerPhone
                        ? `
                            <a
                                class="primary-button"
                                href="tel:${safeText(order.workerPhone)}"
                            >
                                Call
                            </a>
                        `
                        : ""
                }
            </div>
        `;
    }

    const cancellationButton =
        [
            "SEARCHING",
            "ACCEPTED",
            "WORKER_ON_THE_WAY"
        ].includes(order.status)
            ? `
                <button
                    type="button"
                    class="secondary-button"
                    data-cancel-order="${safeText(order.id)}"
                >
                    Cancel Request
                </button>
            `
            : "";

    container.innerHTML = `
        <article class="active-order-card">

            <div class="order-header">

                <div>
                    <span class="eyebrow">
                        ORDER
                    </span>

                    <h3>
                        ${safeText(
                            order.service ||
                            "Service"
                        )}
                    </h3>
                </div>

                <span
                    class="order-status ${statusClass(order.status)}"
                >
                    ${
                        searching
                            ? "SEARCHING"
                            : safeText(order.status)
                    }
                </span>

            </div>

            ${
                searching
                    ? `
                        <div class="searching-state">

                            <div class="searching-animation">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>

                            <strong>
                                Searching for a professional...
                            </strong>

                            <p>
                                Your request is being matched
                                with available professionals.
                            </p>

                        </div>
                    `
                    : ""
            }

            <div class="order-status-message">

                <strong>
                    ${safeText(
                        statusLabel(order.status)
                    )}
                </strong>

                <span>
                    Request created:
                    ${safeText(
                        formatDate(order.createdAt)
                    )}
                </span>

            </div>

            ${workerHTML}

            <div class="order-summary">

                <div>
                    <span>Service</span>
                    <strong>
                        ${safeText(
                            order.service
                        )}
                    </strong>
                </div>

                <div>
                    <span>Location</span>
                    <strong>
                        ${safeText(
                            order.address
                        )}
                    </strong>
                </div>

                <div>
                    <span>Order status</span>
                    <strong>
                        ${safeText(
                            order.status
                        )}
                    </strong>
                </div>

            </div>

            <div class="order-actions">

                <button
                    type="button"
                    class="secondary-button"
                    data-order-details="${safeText(order.id)}"
                >
                    View Details
                </button>

                ${cancellationButton}

            </div>

        </article>
    `;
}

/* ============================================================
   MAP
   ============================================================ */

function updateMapForOrder(order) {
    if (!order) return;

    const mapStatus =
        $("mapStatus");

    if (mapStatus) {
        if (
            order.status === "SEARCHING"
        ) {
            mapStatus.textContent =
                "Searching nearby professionals";
        } else if (order.workerName) {
            mapStatus.textContent =
                `${order.workerName} accepted your request`;
        } else {
            mapStatus.textContent =
                statusLabel(order.status);
        }
    }

    const nearbyCount =
        $("nearbyCount");

    if (nearbyCount) {
        if (
            order.status === "SEARCHING"
        ) {
            nearbyCount.textContent =
                "Finding available professionals";
        } else {
            nearbyCount.textContent =
                "Professional assigned";
        }
    }
}

/* ============================================================
   ORDER DETAILS
   ============================================================ */

async function showOrderDetails(orderId) {
    const order =
        state.orders.find(
            (item) => item.id === orderId
        );

    if (!order) {
        showToast(
            "Order details are unavailable.",
            "error"
        );
        return;
    }

    const container =
        $("orderDetailsContainer");

    if (!container) return;

    const photos =
        Array.isArray(order.photos)
            ? order.photos
            : [];

    container.innerHTML = `
        <div class="order-detail-grid">

            <div>
                <span>Order ID</span>
                <strong>
                    ${safeText(order.id)}
                </strong>
            </div>

            <div>
                <span>Service</span>
                <strong>
                    ${safeText(order.service)}
                </strong>
            </div>

            <div>
                <span>Status</span>
                <strong>
                    ${safeText(order.status)}
                </strong>
            </div>

            <div>
                <span>Customer</span>
                <strong>
                    ${safeText(order.customerName)}
                </strong>
            </div>

            <div>
                <span>Phone</span>
                <strong>
                    ${safeText(order.customerPhone)}
                </strong>
            </div>

            <div>
                <span>Address</span>
                <strong>
                    ${safeText(order.address)}
                </strong>
            </div>

            <div class="full-detail">
                <span>Problem</span>
                <p>
                    ${safeText(order.description)}
                </p>
            </div>

            ${
                order.workerId
                    ? `
                        <div class="full-detail">
                            <span>Professional</span>
                            <strong>
                                ${
