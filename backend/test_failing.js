// Native fetch

async function testRegister() {
  const payload = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    fullName: 'Test User'
  };
  
  const res = await fetch('http://localhost:3001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log('Register response:', res.status, data);
}

async function testOrder() {
  // Try to login to get token
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@smartshop.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  
  // Try to order
  const orderRes = await fetch('http://localhost:3001/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${loginData.access_token}` },
    body: JSON.stringify({
      shippingAddress: "123 Test",
      shippingProvince: "HCM",
      paymentMethod: "COD",
      items: [{ productId: 1, quantity: 2, price: 100000 }],
      totalAmount: 200000,
      shippingFee: 30000
    })
  });
  const orderData = await orderRes.json();
  console.log('Order response:', orderRes.status, orderData);
}

testRegister();
testOrder();
