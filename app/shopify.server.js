import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  DeliveryMethod, 
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  
 
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        console.log("Saving new order to DB:", payload.name);

       
        await prisma.order.upsert({
          where: { shopifyOrderId: payload.id.toString() },
          update: {}, 
          create: {
            shopifyOrderId: payload.id.toString(),
            orderNumber: payload.name,
            customerName: payload.customer ? `${payload.customer.first_name} ${payload.customer.last_name}` : "No Name",
            totalPrice: payload.total_price,
          },
        });
      },
    },
    ORDERS_CANCELLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        console.log("Deleting cancelled order from DB:", payload.id);

       
        await prisma.order.deleteMany({
          where: { shopifyOrderId: payload.id.toString() },
        });
      },
    },
  },

  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;