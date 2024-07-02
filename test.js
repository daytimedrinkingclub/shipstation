const {
  insertConversation,
  insertPayment,
  updateUserProfile,
  insertShip,
} = require("./server/services/dbService");
const { PaymentService } = require("./server/services/paymentService");
const { getUserIdFromEmail } = require("./server/services/supabaseService");

async function testInsertConversation() {
  const sampleConversation = {
    user: "testUser",
    message: "This is a test message",
    timestamp: new Date().toISOString(),
  };

  try {
    const result = await insertConversation({
      chat_json: sampleConversation,
      ship_id: 7, // should exist
    });
    console.log("Insert successful, result:", result);
  } catch (error) {
    console.error("Error during insert:", error);
  }
}

async function testInsertPayment() {
  const req = {
    body: {
      entity: "event",
      account_id: "acc_ODy5XhVe5fbdUc",
      event: "order.paid",
      contains: ["payment", "order"],
      payload: {
        payment: {
          entity: {
            id: "pay_OTkNUbDuaHqXza",
            entity: "payment",
            amount: 200,
            currency: "INR",
            status: "captured",
            order_id: "order_OTkNBobTRwjMso",
            invoice_id: null,
            international: false,
            method: "upi",
            amount_refunded: 0,
            refund_status: null,
            captured: true,
            description: "QRv2 Payment",
            card_id: null,
            bank: null,
            wallet: null,
            vpa: "9810440729@paytm",
            email: "anuj@daytimedrinking.club",
            contact: "+919810440729",
            notes: { email: "anuj@daytimedrinking.club", phone: "9810440729" },
            fee: 4,
            tax: 0,
            error_code: null,
            error_description: null,
            error_source: null,
            error_step: null,
            error_reason: null,
            acquirer_data: { rrn: "455020792808" },
            created_at: 1719919669,
            reward: null,
            upi: {
              payer_account_type: "bank_account",
              vpa: "9810440729@paytm",
            },
          },
        },
        order: {
          entity: {
            id: "order_OTkNBobTRwjMso",
            entity: "order",
            amount: 200,
            amount_paid: 200,
            amount_due: 0,
            currency: "INR",
            receipt: null,
            offer_id: null,
            status: "paid",
            attempts: 1,
            notes: { email: "anuj@daytimedrinking.club", phone: "9810440729" },
            created_at: 1719919651,
          },
        },
      },
      created_at: 1719919670,
    },
  };
  const email = req.body.payload.payment?.entity?.email;
  const user_id = await getUserIdFromEmail(email);
  const payload = {
    payload: req.body,
    user_id,
    transaction_id: req.body.payload.payment?.entity.acquirer_data?.rrn,
    status: "successful",
    provider: "razorpay",
  };

  try {
    const result = await insertPayment(payload);
    console.log("Insert successful, result:", result);
  } catch (error) {
    console.error("Error during insert:", error);
  }
}

async function testUpdateProfile() {
  const userId = "d0c606fa-2a9f-4561-9fdf-62bc967ff160";
  const payload = { available_ships: 24 };

  await updateUserProfile(userId, payload);
}

async function testOrderDetails() {
  const orderId = "order_OTkNBobTRwjMso";

  const service = new PaymentService();

  const order = await service.fetchOrderDetails(orderId);

  console.log(order);
}

async function testInsertShip() {
  const ship = {
    user_id: "d0c606fa-2a9f-4561-9fdf-62bc967ff160",
    status: "completed",
    prompt: "This is a test prompt",
    mode: "internal",
    slug: "test-ship",
  };

  const result = await insertShip(ship);
  console.log(result);
}

testInsertConversation();
// testInsertShip();
// testInsertPayment();
// testUpdateProfile();
// testOrderDetails();
