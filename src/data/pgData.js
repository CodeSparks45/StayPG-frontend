const pgData = [];

const cities = [
  "Latur",
  "Nanded",
  "Vishnupuri",
  "Nilanga",
  "Amravati",
  "Yavatmal",
  "Nagpur",
  "Chhatrapati Sambhaji Nagar",
  "Dharashiv",
  "Ahilya Nagar"
];

const imagePool = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80"
];

cities.forEach(city => {
  for (let i = 1; i <= 20; i++) {
    pgData.push({
      id: `${city}-${i}`,
      city,
      name: `${city} Comfort Residency ${i}`,
      image: imagePool[i % imagePool.length],
      price: 6000 + Math.floor(Math.random() * 4000),
      rating: (4 + Math.random()).toFixed(1)
    });
  }
});

export default pgData;