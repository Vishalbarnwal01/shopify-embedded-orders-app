import { authenticate } from "../shopify.server";
import db from "../db.server"; 

export const action = async ({ request }) => {
  
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Webhook received: ${topic} from ${shop}`);

  
  if (topic === "ORDERS_CREATE") {
    console.log("Order data save ho raha hai:", payload.name);
    
    await db.order.upsert({
      where: { shopifyOrderId: payload.id.toString() },
      update: {}, 
      create: {
        shopifyOrderId: payload.id.toString(),
        orderNumber: payload.name,
        customerName: payload.customer ? `${payload.customer.first_name} ${payload.customer.last_name}` : "Guest",
        totalPrice: payload.total_price,
      },
    });
  }

 
  if (topic === "ORDERS_CANCELLED") {
    console.log("Order delete ho raha hai:", payload.id);
    await db.order.deleteMany({
      where: { shopifyOrderId: payload.id.toString() },
    });
  }

  return new Response(null, { status: 200 }); 
};