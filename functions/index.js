const {
  onCall,
  HttpsError
} = require("firebase-functions/v2/https");

const {
  onDocumentCreated
} = require("firebase-functions/v2/firestore");

const {
  initializeApp
} = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

/* =========================================================
   ACCEPT SERVICE REQUEST
   ATOMIC FIRST-WORKER-WINS
   ========================================================= */

exports.acceptServiceRequest = onCall(
  {
    region: "asia-south1",
    enforceAppCheck: false
  },
  async (request) => {

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const workerId = request.auth.uid;

    const orderId = request.data?.orderId;

    if (
      typeof orderId !== "string" ||
      orderId.trim().length === 0
    ) {
      throw new HttpsError(
        "invalid-argument",
        "A valid order ID is required."
      );
    }

    const orderRef = db
      .collection("orders")
      .doc(orderId);


    /* =====================================================
       TRANSACTION
       ===================================================== */

    const result = await db.runTransaction(
      async (transaction) => {

        const orderSnap =
          await transaction.get(orderRef);


        if (!orderSnap.exists) {

          throw new HttpsError(
            "not-found",
            "Service request not found."
          );
        }


        const order =
          orderSnap.data();


        /* -----------------------------------------------
           ORDER MUST STILL BE SEARCHING
        ------------------------------------------------ */

        if (order.status !== "SEARCHING") {

          return {
            success: false,
            accepted: false,
            reason: "ALREADY_ASSIGNED",
            message:
              "This service request has already been accepted."
          };
        }


        /* -----------------------------------------------
           ORDER MUST NOT ALREADY HAVE WORKER
        ------------------------------------------------ */

        if (
          order.workerId !== null &&
          order.workerId !== undefined &&
          order.workerId !== ""
        ) {

          return {
            success: false,
            accepted: false,
            reason: "ALREADY_ASSIGNED",
            message:
              "Another professional has already accepted this request."
          };
        }


        /* -----------------------------------------------
           ASSIGN WORKER
        ------------------------------------------------ */

        transaction.update(
          orderRef,
          {
            workerId: workerId,
            status: "ACCEPTED",
            acceptedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          }
        );


        return {
          success: true,
          accepted: true,
          reason: "ACCEPTED",
          message:
            "Service request accepted successfully."
        };
      }
    );


    return result;
  }
);


/* =========================================================
   WORKER STATUS UPDATE
   ========================================================= */

exports.updateServiceStatus = onCall(
  {
    region: "asia-south1",
    enforceAppCheck: false
  },
  async (request) => {

    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be logged in."
      );
    }

    const workerId = request.auth.uid;

    const orderId = request.data?.orderId;
    const newStatus = request.data?.status;


    const allowedStatuses = [
      "ON_THE_WAY",
      "ARRIVED",
      "IN_PROGRESS",
      "COMPLETED"
    ];


    if (
      typeof orderId !== "string" ||
      !allowedStatuses.includes(newStatus)
    ) {

      throw new HttpsError(
        "invalid-argument",
        "Invalid order or service status."
      );
    }


    const orderRef =
      db.collection("orders").doc(orderId);


    const orderSnap =
      await orderRef.get();


    if (!orderSnap.exists) {

      throw new HttpsError(
        "not-found",
        "Service request not found."
      );
    }


    const order =
      orderSnap.data();


    if (order.workerId !== workerId) {

      throw new HttpsError(
        "permission-denied",
        "You are not assigned to this request."
      );
    }


    const updateData = {
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp()
    };


    if (newStatus === "ON_THE_WAY") {
      updateData.onTheWayAt =
        FieldValue.serverTimestamp();
    }


    if (newStatus === "ARRIVED") {
      updateData.arrivedAt =
        FieldValue.serverTimestamp();
    }


    if (newStatus === "IN_PROGRESS") {
      updateData.startedAt =
        FieldValue.serverTimestamp();
    }


    if (newStatus === "COMPLETED") {
      updateData.completedAt =
        FieldValue.serverTimestamp();
    }


    await orderRef.update(updateData);


    return {
      success: true,
      status: newStatus
    };
  }
);


/* =========================================================
   NEW ORDER NOTIFICATION DOCUMENT
   ========================================================= */

exports.onNewServiceRequest =
  onDocumentCreated(
    {
      document: "orders/{orderId}",
      region: "asia-south1"
    },
    async (event) => {

      const snapshot = event.data;

      if (!snapshot) {
        return;
      }


      const order =
        snapshot.data();


      if (!order) {
        return;
      }


      if (order.status !== "SEARCHING") {
        return;
      }


      console.log(
        "New FIX MY WORK service request:",
        event.params.orderId
      );


      /*
       * Worker matching / push notification
       * can be connected here.
       *
       * The order itself remains in Firestore.
       */

      return null;
    }
  );
