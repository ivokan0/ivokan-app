Using the Paystack Checkout in a Mobile WebView

Using a WebView - You can also generate a checkout URL and embed it in a WebView on your mobile application. We'll be covering this option in this guide.
Code snippets
For the purposes of this guide, we'll include sample code for mobile apps built using Flutter, React Native, native Android, and iOS, but the flow described works for all the mobile app development stacks

Why use a WebView?
There are different reasons to consider using the hosted checkout in a WebView over integrating directly with the mobile SDK. Regardless of which method you choose, the payments are still being processed by the same underlying APIs. The only difference is the payment experience you'll be offering to your customers. Some of the pros of using a WebView are:

By using our hosted checkout, the entire payment experience is controlled by Paystack. This means you don't have to build a checkout UI in your mobile application to accept payments, hence less code is required to integrate payments in your app.
While only card payments are available on the mobile SDK, all other non-card payment types - such as bank transfer, USSD, Visa QR, Mobile Money, and Pay-with-Bank - are available on the checkout, and therefore available to the customer.
Integration Options
You can still accept payments via card on mobile if you're not using a WebView. All channels are available directly on the API and can be integrated into your application.

Generating the checkout URL
The first step in the integration is to initialize the transaction to get a checkout URL.

When a customer clicks the payment action button, initialize a transaction by making a POST request from your server, to our API. Pass the email, amount, and any other optional parameters to the Initialize TransactionAPI endpoint.

const https = require('https')

const params = JSON.stringify({
  "email": "customer@email.com",
  "amount": "20000",
  "callback_url":"https://hello.pstk.xyz/callback",
  "metadata":{"cancel_action": "https://your-cancel-url.com"}
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: 'Bearer SECRET_KEY',
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

req.write(params)
req.end()


response
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/nkdks46nymizns7",
    "access_code": "nkdks46nymizns7",
    "reference": "nms6uvr1pl"
  }
}


Parameter	Description
amount	Amount should be in the subunit of the supported currency
email	Customer's email address
callback_url	Optional URL that the customer will be redirected to after a successful payment. If you don't include one, the customer will be redirected to the callback URL set in your Paystack dashboard.
metadata	Stringified JSON object of custom data.
metadata.cancel_action	Optional URL that the customer will be redirected to when they click on the cancel button on the checkout page. If you don't include one, the customer will remain on the checkout webview until you dismiss the widget.
Refer to the Initialize TransactionAPI endpoint for a full list of parameters you can pass.

Displaying Checkout in Your WebView
If the API call is successful, Paystack will return an authorization URL in the response. This URL should be returned to the frontend application, and loaded in the Webview widget. See the sample code below:

import React from 'react';
import { WebView } from 'react-native-webview';


export default function App() {

  const authorization_url = 'https://checkout.paystack.com/luKuasMan';

  return (
    <WebView 
      source={{ uri: authorization_url }}
      style={{ marginTop: 40 }}
    />
  );
}

Enable JavaScript on WebView Widget
Javascript needs to be enabled in the WebView for the checkout to load properly.

iOS Deprecation Notice
UIWebView has been deprecated in iOS 12.0 so for this guide we will use WKWebView.

We assume you have WKWebView in your storyboard in the view controller in which you want to show the checkout.

Once the checkout is loaded in the WebView, you'll need to listen for customer actions. That is, you'll want to know when the customer completes the payment or closes the checkout page. This can be done by listening for URL redirects in the WebView widget.

Handling WebView Redirects
Allow Redirect
Redirects should be allowed in the WebView widget to allow for bank and 3DS authorization. If the WebView blocks redirects, the customer will not be able to complete the transaction.

When customers complete the payment successfully, they are redirected to the callback URL set in your Paystack dashboard. You can override this, however, by passing a callback_url when initializing the transaction. This will override the callback URL set on your dashboard, and the customer will be redirected there instead. The WebView widget should now look like this

import React from 'react';
import { WebView } from 'react-native-webview';


export default function App() {

  const authorization_url = 'https://checkout.paystack.com/luKuasMan';
  const callback_url = 'https://yourcallback.com';
  const cancel_url = "https://your-cancel-url.com";

  onNavigationStateChange = state => {
 
    const { url } = state;

    if (!url) return;

    if (url === callback_url) {
			// get transaction reference from url and verify transaction, then redirect
      const redirectTo = 'window.location = "' + callback_url + '"';
      this.webview.injectJavaScript(redirectTo);
    }
    if (url === cancel_url) {
      // handle webview removal
      // You can either unmount the component, or
      // Use a navigator to pop off the view
      // Run the cancel payment function if you have one
    }
  };

  return (
    <WebView 
      source={{ uri: authorization_url }}
      style={{ marginTop: 40 }}
      onNavigationStateChange={ this.onNavigationStateChange }
    />
  );
}

If you have webhooks implemented, a charge.success event will be sent to your webhook URL, and it's recommended you use this to deliver value to the customer in your backend.

In your frontend, after detecting the WebView redirect to the callback URL, this means the transaction is successful. You can confirm the status by calling the Verify TransactionAPI, and then you can programmatically close the WebView widget and show the customer a transaction confirmation page in your app. This is handled in the verifyTransaction() method.

Handling 3DS properly
For card transactions that require 3DS authentication, when the customer completes the authorization, they're redirected to https://standard.paystack.co/close. Automatically, when the URL hits https://standard.paystack.co/close, it should close the page. This is what happens on a web browser.

With WebViews however, the page doesn't close automatically. This is because the Javascript function window.close(), which closes the page in a browser window, won't work on a WebView. WebViews are native widgets and the window.close() method can only close windows opened by using the window.open() method. The workaround is to have your WebView listen for when the URL has been redirected to  https://standard.paystack.co/close and then continue processing as usual by checking the callback function and any other process.


import React from 'react';
import { WebView } from 'react-native-webview';


export default function App() {

  const authorization_url = 'https://checkout.paystack.com/luKuasMan';
  const callback_url = 'https://yourcallback.com';

  onNavigationStateChange = state => {
 
    const { url } = state;

    if (!url) return;

    if (url === callback_url) {
			// get transaction reference from url and verify transaction, then redirect
      const redirectTo = 'window.location = "' + callback_url + '"';
      this.webview.injectJavaScript(redirectTo);
    }
		
		if(url === 'https://standard.paystack.co/close') {
      // handle webview removal
      // You can either unmount the component, or
      // Use a navigator to pop off the view
    }
  };

  return (
    <WebView 
      source={{ uri: authorization_url }}
      style={{ marginTop: 40 }}
      onNavigationStateChange={ this.onNavigationStateChange }
    />
  );
}

