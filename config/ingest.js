import { Inngest } from "inngest";
import ConnectDb from "./db";
import User from "@/models/userModel"
import Order from "@/models/orderModel";


// Create a client to send and receive events
export const inngest = new Inngest({ id: "mobileshop-next" });


export const syncUserCreate = inngest.createFunction(
    {
        id:'sync-user-clerk'
    },
    {event: 'clerk/user.created'},

    async ({event}) => {
        const {id,first_name, last_name , email_addresses, image_url} = event.data;
        
        const userData = {
            _id : id,
            name: `${first_name} ${last_name}`,
            email : email_addresses[0].email_address,
            Imgurl : image_url,
        }

        await ConnectDb();

        await User.create(userData);
    }
)

export const syncUserUpdate = inngest.createFunction(
  {
    id: 'update-user-clerk'
  },
  {
    event: 'clerk/user.updated'
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses?.[0]?.email_address || "",
      imgUrl: image_url
    };

    await ConnectDb();

    await User.findByIdAndUpdate(id, userData, { new: true, upsert: true });
  }
);


export const syncUserDelete = inngest.createFunction(
    {
        id:'user-delete-clerk'
    },
    {
        event : 'clerk/user.deleted'
    },
    async({event}) => {
        const {id} = event.data;

        await ConnectDb();
        await User.findByIdAndDelete(id);
    }
)


export const createUserOrder = inngest.createFunction(
  {
    id:'create-user-order',
    batchEvents : {
      maxSize: 5,
      timeout : '5s'
    }
  },
  {event: 'order/created'},
  async ({events}) => {
    // Create orders in database
    const orders = events.map((event) => {
      return {
        _id: event.data.orderId,
        userId: event.data.userId,
        amount: event.data.amount,
        subtotal: event.data.subtotal,
        shipping: event.data.shipping,
        tax: event.data.tax,
        items: event.data.items,
        address: event.data.address,
        status: "order placed",
        date: new Date(event.data.date),
        paymentMethod: event.data.paymentMethod || 'cod',
        paymentStatus: event.data.paymentMethod === 'stripe' ? 'pending' : 'pending'
      }
    })

    await ConnectDb();
    
    if (orders.length > 0) {
      console.log(`Creating ${orders.length} orders with payment method`);
      
      // Use insertMany with ordered: false to handle potential duplicates
      try {
        await Order.insertMany(orders, { ordered: false });
      } catch (error) {
        // If there are duplicate key errors, that's okay (orders might already exist)
        if (error.code === 11000) {
          console.log('Some orders already exist, continuing...');
        } else {
          throw error;
        }
      }
    }

    return {success: true, processed: orders.length};
  }
)