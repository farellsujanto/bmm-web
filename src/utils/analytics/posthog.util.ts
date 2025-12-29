import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost ='https://us.i.posthog.com';

    if (!apiKey) {
      console.warn('PostHog API key is not set. Analytics will not be initialized.');
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        recordCrossOriginIframes: false,
      },
    });
  }
};

// Track page views
export const trackPageView = (url?: string) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      $current_url: url || window.location.href,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

// Identify user
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
};

// Reset user (on logout)
export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.setPersonProperties(properties);
  }
};

// E-commerce tracking events
export const trackProductViewed = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
}) => {
  trackEvent('product_viewed', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_category: product.category,
    product_brand: product.brand,
  });
};

export const trackProductAddedToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
}) => {
  trackEvent('product_added_to_cart', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_quantity: product.quantity,
    product_category: product.category,
    product_brand: product.brand,
  });
};

export const trackProductRemovedFromCart = (product: {
  id: string;
  name: string;
}) => {
  trackEvent('product_removed_from_cart', {
    product_id: product.id,
    product_name: product.name,
  });
};

export const trackCheckoutStarted = (cart: {
  total: number;
  itemCount: number;
  products: Array<{ id: string; name: string; price: number; quantity: number }>;
}) => {
  trackEvent('checkout_started', {
    cart_total: cart.total,
    cart_item_count: cart.itemCount,
    products: cart.products,
  });
};

export const trackOrderCompleted = (order: {
  orderId: string;
  total: number;
  itemCount: number;
  products: Array<{ id: string; name: string; price: number; quantity: number }>;
  paymentMethod?: string;
}) => {
  trackEvent('order_completed', {
    order_id: order.orderId,
    order_total: order.total,
    order_item_count: order.itemCount,
    products: order.products,
    payment_method: order.paymentMethod,
  });
};

// User interaction events
export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_clicked', {
    button_name: buttonName,
    location,
  });
};

export const trackFormSubmitted = (formName: string, success: boolean) => {
  trackEvent('form_submitted', {
    form_name: formName,
    success,
  });
};

export const trackSearchPerformed = (query: string, resultsCount?: number) => {
  trackEvent('search_performed', {
    search_query: query,
    results_count: resultsCount,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// Feature usage tracking
export const trackFeatureUsed = (featureName: string, details?: Record<string, any>) => {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...details,
  });
};

export default posthog;
