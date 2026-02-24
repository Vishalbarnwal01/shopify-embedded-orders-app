// app/routes/app._index.jsx

// 'json' ki ab zaroorat nahi hai, seedha object return karein
import { useLoaderData } from "react-router"; 
import { Page, Layout, Card, ResourceList, ResourceItem, Text, Badge, EmptyState } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  
  // Database se orders fetch karein
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  // React Router 7 mein seedha object return hota hai
  return { orders }; 
};

export default function Index() {
  const { orders } = useLoaderData();

  return (
    <Page title="Live Order Sync">
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <ResourceList
              resourceName={{ singular: "order", plural: "orders" }}
              items={orders}
              emptyState={
                <EmptyState
                  heading="No orders yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Create an order in your Shopify Admin to see it here.</p>
                </EmptyState>
              }
              renderItem={(item) => {
                const { id, orderNumber, customerName, totalPrice } = item;
                return (
                  <ResourceItem id={id} verticalAlignment="center">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <Text variant="bodyMd" fontWeight="bold" as="h3">{orderNumber}</Text>
                        <Text color="subdued" as="p">{customerName}</Text>
                      </div>
                      <Badge tone="success">Amount: {totalPrice}</Badge>
                    </div>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}