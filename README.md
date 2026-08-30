# FIX MY WORK

### We Find. They Fix.

FIX MY WORK is a local service marketplace that connects customers
with verified service professionals.

---

## PLATFORM

FIX MY WORK has three major interfaces:

1. Customer
2. Worker
3. Admin

The platform uses Firebase for authentication, database and realtime
order synchronization.

Cloudinary is used for customer/service image uploads.

---

## CUSTOMER FLOW

Customer:

1. Creates an account or logs in.
2. Selects a service.
3. Provides name and mobile number.
4. Describes the problem.
5. Provides service address.
6. Shares location if required.
7. Uploads optional problem photos.
8. Submits the service request.

After submission:

SEARCHING FOR A PROFESSIONAL

is displayed.

The request remains active until a suitable worker accepts it.

The request is sent only to workers who:

- offer the requested service
- are active
- are available
- are within the supported service area

When one worker accepts:

- the order is locked to that worker
- other workers can no longer accept the order
- customer sees worker details
- worker sees customer details
- customer can contact the worker
- worker can contact the customer

---

## ORDER STATES

Orders use controlled states:

CREATED
SEARCHING
ACCEPTED
WORKER_ON_THE_WAY
ARRIVED
IN_PROGRESS
COMPLETED
CANCELLED
EXPIRED

Only valid state transitions are allowed.

---

## WORKER CANCELLATION

If the worker accepts a request and later cancels:

1. The order is released.
2. The customer is informed.
3. The order can return to SEARCHING.
4. Other eligible workers can receive the request.
5. The customer can continue searching.

A cancelled worker must not retain the order.

---

## CUSTOMER CANCELLATION

A customer can cancel an order according to the current order state.

Cancelled orders are preserved in order history.

A customer can create a new service request after cancellation.

---

## ATOMIC ORDER ACCEPTANCE

Two workers must never be able to successfully accept
the same order.

Order acceptance must be performed using a Firestore transaction.

The transaction verifies that the order is still in:

SEARCHING

before assigning the worker.

---

## CUSTOMER FEATURES

- Registration
- Login
- Logout
- Password reset
- Customer profile
- Service selection
- 100+ service categories
- Service search
- Problem description
- Address
- Current location
- Location coordinates
- Problem image upload
- Request creation
- Real-time searching status
- Worker acceptance
- Worker details
- Worker contact
- Order tracking
- Cancellation
- Order history
- Completed orders
- Ratings
- Reviews
- Completion photos
- Support
- Privacy policy
- Terms and conditions
- Safety information
- PWA installation

---

## WORKER FEATURES

- Worker registration
- Login
- Logout
- Worker profile
- Mobile number
- Profile photo
- Services offered
- Service area
- Current location
- Online/offline status
- Available/unavailable status
- Incoming service requests
- Accept request
- Reject request
- Active order
- Customer details
- Customer contact
- Order location
- Navigation support
- Arrived status
- Work started status
- Work completed status
- Completion photo
- Order history
- Earnings information
- Ratings
- Reviews

---

## ADMIN FEATURES

Admin dashboard will provide:

- Customer management
- Worker management
- Worker verification
- Service management
- Order management
- Active order monitoring
- Cancelled order monitoring
- Completed order monitoring
- Reports
- Ratings and reviews
- Platform settings
- Safety management

Admin-only operations must be protected by Firebase
Authentication and authorization.

---

## SERVICE CATALOGUE

The platform contains more than 100 service categories.

Examples:

- Electrical
- Plumbing
- AC Repair
- RO & Water Purifier
- Refrigerator Repair
- Washing Machine Repair
- TV Repair
- Microwave Repair
- Geyser Repair
- Chimney Repair
- Fan Repair
- Inverter Repair
- Laptop Repair
- Computer Repair
- Mobile Repair
- CCTV Installation
- Internet/WiFi Service
- Carpenter
- Painting
- Cleaning
- Pest Control
- Appliance Installation
- Furniture Assembly
- Locksmith
- Mason
- Tile Work
- Welding
- Glass Work
- Aluminium Work
- Waterproofing
- Roofing
- Gardening
- Moving Services
- Vehicle Assistance
- and many more.

No "Others" category will be used as a replacement for
the service catalogue.

---

## FIREBASE

Firebase services:

- Firebase Authentication
- Cloud Firestore
- Firebase realtime listeners
- Firebase security rules

Firebase Web SDK is loaded using modular Firebase SDK.

---

## FIRESTORE STRUCTURE

Main collections:

customers
workers
services
orders
reviews
supportTickets
notifications
settings

---

## ORDER DOCUMENT

Each order contains information such as:

- orderId
- customerId
- workerId
- serviceId
- serviceName
- customerName
- customerPhone
- workerName
- workerPhone
- description
- address
- latitude
- longitude
- photos
- status
- createdAt
- acceptedAt
- startedAt
- completedAt
- cancelledAt
- cancellationReason

Sensitive information must not be exposed to unauthorized users.

---

## SECURITY

Firestore security rules must enforce:

- customers can access their own account data
- workers can access their own account data
- customers can access their own orders
- workers can access assigned orders
- unauthorized users cannot read private customer data
- unauthorized users cannot read private worker data
- users cannot modify another user's profile
- users cannot arbitrarily change order ownership
- order acceptance must be transaction controlled
- admin operations require admin authorization

---

## CLOUDINARY

Cloudinary is used for:

- service request photos
- completion photos
- profile images where applicable

Only allowed image formats are accepted.

Image upload size and type are validated before upload.

Cloudinary credentials that must remain secret must never be
exposed in frontend source code.

---

## PWA

The customer website is installable as a Progressive Web App.

Required files:

- manifest.json
- sw.js
- application icons

The application must work correctly from GitHub Pages
and must use relative paths where required.

---

## GITHUB PAGES

The application must not depend on:

/index.html

being available at an incorrect root path.

Customer application:

/customer/

Worker application:

/worker/

Admin application:

/admin/

All internal asset paths must be compatible with GitHub Pages.

---

## USER EXPERIENCE

The platform must not use browser alert dialogs such as:

"This is ... says"

Instead the application uses:

- toast notifications
- custom modal dialogs
- loading states
- error states
- success states
- confirmation dialogs

---

## ERROR HANDLING

Every important asynchronous operation must have:

- loading state
- success handling
- error handling
- retry handling where appropriate

Firebase errors must be converted into user-friendly messages.

Raw Firebase errors must not be shown directly to customers.

---

## REALTIME BEHAVIOUR

Customer order status must update in realtime.

Worker incoming requests must update in realtime.

When a worker accepts an order:

Customer:

SEARCHING
        ↓
PROFESSIONAL FOUND
        ↓
WORKER DETAILS

Worker:

NEW REQUEST
        ↓
ACCEPTED
        ↓
ACTIVE WORK

---

## NO DUPLICATE ACCEPTANCE

If Worker A and Worker B attempt to accept the same order
at nearly the same time:

Only one worker can succeed.

The second worker receives a controlled message:

"This request has already been accepted."

---

## CODE QUALITY

Production-oriented code requirements:

- no placeholder functionality
- no fake successful operations
- no dead buttons
- no missing event handlers
- no duplicated logic where avoidable
- no undefined variables
- no missing DOM references
- no console errors during normal operation
- no unnecessary dependencies
- modular JavaScript
- clear naming
- defensive validation
- proper async/await handling
- proper Firebase error handling
- mobile-first responsive design

---

## BRAND

Application name:

FIX MY WORK

Tagline:

We Find. They Fix.

The application must not display developer usernames,
GitHub usernames or personal repository branding
inside the customer/worker application.

---

## PRODUCTION RULE

Once the application architecture is finalized, customer,
worker and backend-related files must remain compatible with
each other.

A feature must never be implemented in one file while leaving
the required backend, UI or event handling missing.

Any future feature must be integrated without breaking
existing functionality.

---

## VERSION

FIX MY WORK
Production Foundation
