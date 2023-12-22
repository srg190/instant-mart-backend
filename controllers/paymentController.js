import Stripe from "stripe";

export const processPayment = async (req, res, next) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "E-com",
      },
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

export const sendStripeApiKey = async (req, res, next) => {
  try {
    res.status(200).json({
      stripeApiKey: process.env.STRIPE_API_KEY,
    });
  } catch (error) {
    return next(error);
  }
};
