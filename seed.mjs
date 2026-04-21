import fs from 'fs';

async function seed() {
  const BASE_URL = 'http://localhost:5000/api';
  
  // 1. Register User (or Login if exists)
  console.log('Registering user...');
  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "Testing User", email: "tester@example.com", password: "password123" })
  });
  
  let cookie = res.headers.get('set-cookie');
  if (!res.ok) {
    console.log('User exists, logging in...');
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "tester@example.com", password: "password123" })
    });
    cookie = res.headers.get('set-cookie');
  }
  
  console.log('Auth check:', res.status);
  
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie ? cookie.split(';')[0] : ''
  };

  console.log('Seeding 20 Notes...');
  for(let i=1; i<=20; i++) {
    await fetch(`${BASE_URL}/notes`, {
      method: 'POST', headers,
      body: JSON.stringify({
        title: `Performance Test Note ${i}`,
        content: `This is dynamically generated content for test note number ${i}. We are verifying data handling limits and UI pagination.`,
        category: i % 2 === 0 ? "development" : "personal",
        tags: [`testing`, `data-${i % 3}`]
      })
    });
  }

  console.log('Seeding 4 Bookmarks...');
  for(let i=1; i<=4; i++) {
    await fetch(`${BASE_URL}/bookmarks`, {
      method: 'POST', headers,
      body: JSON.stringify({
        title: `Important Resource Website ${i}`,
        url: `https://example.com/useful-resource-${i}`,
        description: `This is a test bookmark description to verify the cards render correctly.`,
        tags: ["reference", "testing"]
      })
    });
  }

  console.log('Seeding 5 Materials...');
  const types = ["book", "course", "video", "podcast", "article"];
  for(let i=0; i<5; i++) {
    await fetch(`${BASE_URL}/materials`, {
      method: 'POST', headers,
      body: JSON.stringify({
        title: `Complete Guide to Full Stack - Part ${i+1}`,
        type: types[i],
        total_units: (i+1) * 25,
        current_unit: (i+1) * 5,
        unit_label: types[i] === "book" ? "pages" : "lessons"
      })
    });
  }
  
  console.log("Seeding complete! Data injected successfully.");
}

seed().catch(console.error);
