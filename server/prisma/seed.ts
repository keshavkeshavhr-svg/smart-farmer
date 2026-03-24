import { PrismaClient, Role, CropStatus, StoreCategory, PriceSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DISTRICTS = ['Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Davangere'];
const CROPS = [
  { name: 'Tomato', variety: 'Hybrid', grade: 'A' },
  { name: 'Onion', variety: 'Red Nasik', grade: 'A' },
  { name: 'Potato', variety: 'Kufri Jyoti', grade: 'B' },
  { name: 'Cabbage', variety: 'Green', grade: 'A' },
  { name: 'Brinjal', variety: 'Purple Long', grade: 'B' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartfarmer.in' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'System Admin',
      phone: '9000000000',
      email: 'admin@smartfarmer.in',
      passwordHash: adminHash,
      district: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      isActive: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ─── Farmers ──────────────────────────────────────────────────────────────
  const farmerData = [
    { name: 'Ramu Gowda', email: 'ramu@farmer.in', phone: '9111111111', district: 'Mysore', geoLat: 12.295810, geoLng: 76.639381 },
    { name: 'Lakshmi Devi', email: 'lakshmi@farmer.in', phone: '9111111112', district: 'Hubli', geoLat: 15.365556, geoLng: 75.124167 },
    { name: 'Suresh Patil', email: 'suresh@farmer.in', phone: '9111111113', district: 'Belgaum', geoLat: 15.852000, geoLng: 74.498900 },
    { name: 'Kavitha Naik', email: 'kavitha@farmer.in', phone: '9111111114', district: 'Davangere', geoLat: 14.464600, geoLng: 75.921700 },
    { name: 'Mohan Kumar', email: 'mohan@farmer.in', phone: '9111111115', district: 'Bangalore', geoLat: 12.971599, geoLng: 77.594566 },
  ];

  const farmers = [];
  for (const fd of farmerData) {
    const hash = await bcrypt.hash('Farmer@123', 12);
    const farmer = await prisma.user.upsert({
      where: { email: fd.email },
      update: {},
      create: {
        role: Role.FARMER,
        name: fd.name,
        phone: fd.phone,
        email: fd.email,
        passwordHash: hash,
        district: fd.district,
        state: 'Karnataka',
        pincode: '560001',
        geoLat: fd.geoLat,
        geoLng: fd.geoLng,
        isActive: true,
        farmerProfile: {
          create: {
            farmName: `${fd.name}'s Farm`,
            rating: 4.2 + Math.random() * 0.6,
            totalRatings: Math.floor(Math.random() * 50) + 10,
          },
        },
      },
    });
    farmers.push(farmer);
    console.log('✅ Farmer created:', farmer.email);
  }

  // ─── Buyers ───────────────────────────────────────────────────────────────
  const buyerData = [
    { name: 'FreshMart Retail', email: 'freshmart@buyer.in', phone: '9222222221', company: 'FreshMart Pvt Ltd' },
    { name: 'Green Grocers', email: 'green@buyer.in', phone: '9222222222', company: 'Green Grocers LLP' },
    { name: 'City Vegetables', email: 'city@buyer.in', phone: '9222222223', company: 'City Vegetables Co' },
    { name: 'Spice Route Exports', email: 'spice@buyer.in', phone: '9222222224', company: 'Spice Route Exports' },
    { name: 'AgroTrade India', email: 'agro@buyer.in', phone: '9222222225', company: 'AgroTrade India Pvt Ltd' },
    { name: 'Priya Sharma', email: 'priya@buyer.in', phone: '9222222226', company: null },
    { name: 'Rajesh Verma', email: 'rajesh@buyer.in', phone: '9222222227', company: null },
    { name: 'Anita Singh', email: 'anita@buyer.in', phone: '9222222228', company: null },
    { name: 'Vikram Nair', email: 'vikram@buyer.in', phone: '9222222229', company: null },
    { name: 'Meena Pillai', email: 'meena@buyer.in', phone: '9222222230', company: null },
  ];

  for (const bd of buyerData) {
    const hash = await bcrypt.hash('Buyer@123', 12);
    const buyer = await prisma.user.upsert({
      where: { email: bd.email },
      update: {},
      create: {
        role: Role.BUYER,
        name: bd.name,
        phone: bd.phone,
        email: bd.email,
        passwordHash: hash,
        district: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        isActive: true,
        buyerProfile: {
          create: { company: bd.company ?? undefined },
        },
      },
    });
    console.log('✅ Buyer created:', buyer.email);
  }

  // ─── Crop Listings ────────────────────────────────────────────────────────
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (let fi = 0; fi < farmers.length; fi++) {
    const farmer = farmers[fi];
    const cropInfo = CROPS[fi % CROPS.length];
    const price = 20 + Math.random() * 30;

    await prisma.crop.create({
      data: {
        farmerId: farmer.id,
        name: cropInfo.name,
        variety: cropInfo.variety,
        grade: cropInfo.grade,
        description: `Fresh ${cropInfo.name} grown with organic methods in ${DISTRICTS[fi]}. High quality produce, ready for immediate dispatch.`,
        quantityKg: 500 + Math.random() * 1500,
        pricePerKg: parseFloat(price.toFixed(2)),
        minOrderKg: 10,
        images: [`https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800`],
        locationState: 'Karnataka',
        locationDistrict: DISTRICTS[fi],
        availableFrom: now,
        availableTo: in30Days,
        status: CropStatus.ACTIVE,
      },
    });

    // Create a second listing for each farmer
    const cropInfo2 = CROPS[(fi + 2) % CROPS.length];
    const price2 = 15 + Math.random() * 25;
    await prisma.crop.create({
      data: {
        farmerId: farmer.id,
        name: cropInfo2.name,
        variety: cropInfo2.variety,
        grade: 'B',
        description: `Quality ${cropInfo2.name} from ${DISTRICTS[fi]}. Suitable for bulk orders.`,
        quantityKg: 200 + Math.random() * 800,
        pricePerKg: parseFloat(price2.toFixed(2)),
        minOrderKg: 5,
        images: [`https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=800`],
        locationState: 'Karnataka',
        locationDistrict: DISTRICTS[fi],
        availableFrom: now,
        availableTo: in30Days,
        status: CropStatus.ACTIVE,
      },
    });
  }
  console.log('✅ Crop listings created');

  // ─── Farming Store Products ────────────────────────────────────────────────
  const storeProducts = [
    // Seeds
    { name: 'Hybrid Tomato Seeds (50g)', category: StoreCategory.SEEDS, brand: 'Syngenta', price: 320, stock: 500, description: 'High-yield hybrid tomato seeds. Disease resistant, suitable for all seasons.' },
    { name: 'Onion Seeds - Nasik Red (100g)', category: StoreCategory.SEEDS, brand: 'Bayer', price: 180, stock: 400, description: 'Premium quality Nasik Red onion seeds. Excellent germination rate.' },
    { name: 'Okra (Bhindi) Seeds (250g)', category: StoreCategory.SEEDS, brand: 'Seminis', price: 150, stock: 350, description: 'Tender okra variety. Early maturing, high yield per plant.' },
    { name: 'Chilli Seeds - Byadgi (50g)', category: StoreCategory.SEEDS, brand: 'Indo-US', price: 280, stock: 200, description: 'Famous Byadgi chilli seeds. Deep red colour, excellent flavour.' },
    { name: 'Paddy Seeds IR-36 (5kg)', category: StoreCategory.SEEDS, brand: 'IARI', price: 450, stock: 300, description: 'High-yielding rice variety. Suitable for irrigated conditions.' },
    { name: 'Maize Seeds - Pro 311 (2kg)', category: StoreCategory.SEEDS, brand: 'Pioneer', price: 520, stock: 250, description: 'Single cross hybrid maize. Strong stalk, excellent grain quality.' },
    // Fertilizers
    { name: 'NPK 19-19-19 Fertilizer (5kg)', category: StoreCategory.FERTILIZERS, brand: 'Coromandel', price: 850, stock: 300, description: 'Balanced nutrient formula for all crops. Water soluble grade.' },
    { name: 'Urea Fertilizer (45kg bag)', category: StoreCategory.FERTILIZERS, brand: 'IFFCO', price: 1200, stock: 250, description: 'High nitrogen content (46%). Essential for vegetative growth.' },
    { name: 'DAP Fertilizer (50kg)', category: StoreCategory.FERTILIZERS, brand: 'IFFCO', price: 1400, stock: 200, description: 'Di-Ammonium Phosphate. 18% nitrogen + 46% phosphorus.' },
    { name: 'Vermicompost Organic (25kg)', category: StoreCategory.FERTILIZERS, brand: 'Organic India', price: 350, stock: 500, description: '100% natural vermicompost. Improves soil structure and fertility.' },
    { name: 'Potash MOP (25kg)', category: StoreCategory.FERTILIZERS, brand: 'IPL', price: 780, stock: 180, description: 'Muriate of Potash 60%. Essential for fruit and root development.' },
    // Pesticides
    { name: 'Bayer Champion Fungicide (500ml)', category: StoreCategory.PESTICIDES, brand: 'Bayer', price: 450, stock: 200, description: 'Broad spectrum fungicide. Controls blight, mildew and rust diseases.' },
    { name: 'Syngenta Ampligo Insecticide (250ml)', category: StoreCategory.PESTICIDES, brand: 'Syngenta', price: 680, stock: 150, description: 'Dual action insecticide. Controls bollworm and caterpillars.' },
    { name: 'Neem Oil Organic Spray (1L)', category: StoreCategory.PESTICIDES, brand: 'Agri Gold', price: 220, stock: 400, description: 'Cold pressed neem oil. Natural pest control, safe for organic farming.' },
    { name: 'Confidor Imidacloprid (100ml)', category: StoreCategory.PESTICIDES, brand: 'Bayer', price: 520, stock: 100, description: 'Systemic insecticide. Controls sucking pests like aphids and whitefly.' },
    // Tools
    { name: 'Garden Trowel Set - 3pcs', category: StoreCategory.TOOLS, brand: 'Falcon', price: 385, stock: 100, description: 'Stainless steel hand trowels. Ergonomic grip. Ideal for transplanting.' },
    { name: 'Knapsack Sprayer 16L', category: StoreCategory.TOOLS, brand: 'Aspee', price: 1850, stock: 75, description: 'Manual pressure sprayer. Brass nozzle, adjustable spray pattern.' },
    { name: 'Pruning Secateurs (8 inch)', category: StoreCategory.TOOLS, brand: 'Falcon', price: 290, stock: 120, description: 'Carbon steel blade. Spring loaded. Clean cuts for branches up to 20mm.' },
    { name: 'Khurpi (Weeder) - Steel', category: StoreCategory.TOOLS, brand: 'Falcon', price: 95, stock: 500, description: 'Traditional hand weeding tool. Hardened steel blade, wooden handle.' },
    { name: 'Garden Rake (Heavy Duty)', category: StoreCategory.TOOLS, brand: 'Falcon', price: 320, stock: 80, description: '14-tooth garden rake. Strong steel head with wooden handle.' },
    { name: 'Water Sprinkler (Rotating)', category: StoreCategory.TOOLS, brand: 'Aspee', price: 450, stock: 150, description: '360° rotating sprinkler. Covers up to 30ft radius. Brass connector.' },
    { name: 'Drip Irrigation Kit (100 plants)', category: StoreCategory.TOOLS, brand: 'Jain Irrigation', price: 2200, stock: 50, description: 'Complete drip kit for 100 plants. Includes tubing, drippers, connectors.' },
    // Other
    { name: 'Mulching Sheet Black (100m roll)', category: StoreCategory.OTHER, brand: 'Agri Plus', price: 1500, stock: 60, description: 'UV stabilized plastic mulch. Prevents weeds, retains moisture.' },
    { name: 'Grow Bags (12x12 inch) - Pack of 10', category: StoreCategory.OTHER, brand: 'Green India', price: 280, stock: 300, description: 'HDPE grow bags with drainage holes. Ideal for terrace farming.' },
    { name: 'Soil Testing Kit', category: StoreCategory.OTHER, brand: 'HiMedia', price: 650, stock: 100, description: 'Tests pH, NPK levels. Includes 25 test strips and colour chart.' },
  ];

  for (const sp of storeProducts) {
    await prisma.storeProduct.create({
      data: {
        name: sp.name,
        category: sp.category,
        brand: sp.brand,
        price: sp.price,
        stock: sp.stock,
        description: sp.description,
        images: [`https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800`],
        attributes: { weight: '1kg', certification: 'CIB Approved' },
      },
    });
  }
  console.log('✅ Store products created');

  // ─── Market Price Points (30 days, 3 crops, 2 districts) ──────────────────
  const seedCrops = ['Tomato', 'Onion', 'Potato'];
  const seedDistricts = [
    { district: 'Bangalore', state: 'Karnataka', basePrice: { Tomato: 28, Onion: 22, Potato: 18 } },
    { district: 'Mysore', state: 'Karnataka', basePrice: { Tomato: 25, Onion: 20, Potato: 16 } },
  ];

  for (const loc of seedDistricts) {
    for (const crop of seedCrops) {
      let currentPrice = (loc.basePrice as any)[crop];
      for (let d = 30; d >= 0; d--) {
        const observedAt = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
        const variation = (Math.random() - 0.5) * 4;
        currentPrice = Math.max(5, currentPrice + variation);

        await prisma.pricePoint.create({
          data: {
            cropName: crop,
            district: loc.district,
            state: loc.state,
            pricePerKg: parseFloat(currentPrice.toFixed(2)),
            source: PriceSource.AGMARKNET,
            observedAt,
          },
        });
      }

      // Compute and store summary
      const points30 = await prisma.pricePoint.findMany({
        where: {
          cropName: crop,
          district: loc.district,
          state: loc.state,
          observedAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
      });
      const points7 = points30.filter(p => p.observedAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));

      const avg30 = points30.reduce((s, p) => s + p.pricePerKg, 0) / (points30.length || 1);
      const avg7 = points7.reduce((s, p) => s + p.pricePerKg, 0) / (points7.length || 1);
      const allPrices = points30.map(p => p.pricePerKg);

      await prisma.priceSummary.upsert({
        where: { cropName_district_state: { cropName: crop, district: loc.district, state: loc.state } },
        update: { avg7d: avg7, avg30d: avg30, lastUpdatedAt: now },
        create: {
          cropName: crop,
          district: loc.district,
          state: loc.state,
          avg7d: parseFloat(avg7.toFixed(2)),
          avg30d: parseFloat(avg30.toFixed(2)),
          minPrice: Math.min(...allPrices),
          maxPrice: Math.max(...allPrices),
          lastUpdatedAt: now,
        },
      });
    }
  }
  console.log('✅ Market price data seeded (30 days × 2 districts × 3 crops)');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:   admin@smartfarmer.in  / Admin@123');
  console.log('Farmer:  ramu@farmer.in        / Farmer@123');
  console.log('Buyer:   freshmart@buyer.in    / Buyer@123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
