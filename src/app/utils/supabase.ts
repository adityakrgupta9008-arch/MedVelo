import { createClient } from "@supabase/supabase-js";

export interface Medicine {
  id: string;
  brand_name: string;
  generic_name: string;
  brand_price: number;
  generic_price: number;
  brand_mrp_inr?: number;
  govt_jan_aushadhi_mrp_inr?: number;
  unit_pack_size?: string;
  chemical_salt?: string;
  govt_brand_name?: string;
  dosage: string;
  description: string;
  savings_percentage: number;
  created_at?: string;
  therapeutic_class?: string;
}

// Pre-seeded high-fidelity mock database mirroring Jan Aushadhi scheme parameters
export const MOCK_MEDICINES: Medicine[] = [
  {
    id: "m1",
    brand_name: "Lipitor",
    generic_name: "Atorvastatin",
    brand_price: 84.50,
    generic_price: 12.00,
    brand_mrp_inr: 240.00,
    govt_jan_aushadhi_mrp_inr: 32.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "10mg",
    description: "Used to treat high cholesterol and lower the risk of stroke or heart attack.",
    savings_percentage: 85.80,
  },
  {
    id: "m2",
    brand_name: "Advil",
    generic_name: "Ibuprofen",
    brand_price: 14.99,
    generic_price: 4.50,
    brand_mrp_inr: 95.00,
    govt_jan_aushadhi_mrp_inr: 18.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "200mg",
    description: "Nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain.",
    savings_percentage: 69.98,
  },
  {
    id: "m3",
    brand_name: "Glucophage",
    generic_name: "Metformin",
    brand_price: 45.00,
    generic_price: 8.00,
    brand_mrp_inr: 110.00,
    govt_jan_aushadhi_mrp_inr: 16.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "500mg",
    description: "Oral diabetes medicine that helps control blood sugar levels for Type 2 Diabetes.",
    savings_percentage: 82.22,
  },
  {
    id: "m4",
    brand_name: "Synthroid",
    generic_name: "Levothyroxine",
    brand_price: 38.00,
    generic_price: 10.00,
    brand_mrp_inr: 135.00,
    govt_jan_aushadhi_mrp_inr: 25.00,
    unit_pack_size: "per 100 Tablets pack",
    dosage: "50mcg",
    description: "Manmade thyroid hormone used to treat hypothyroidism (low thyroid hormone).",
    savings_percentage: 73.68,
  },
  {
    id: "m5",
    brand_name: "Zantac",
    generic_name: "Ranitidine",
    brand_price: 22.50,
    generic_price: 5.00,
    brand_mrp_inr: 68.00,
    govt_jan_aushadhi_mrp_inr: 11.50,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "150mg",
    description: "H2 blocker that decreases the amount of acid produced in the stomach.",
    savings_percentage: 77.78,
  },
  {
    id: "m6",
    brand_name: "Amoxil",
    generic_name: "Amoxicillin",
    brand_price: 28.00,
    generic_price: 7.50,
    brand_mrp_inr: 120.00,
    govt_jan_aushadhi_mrp_inr: 28.00,
    unit_pack_size: "per 10 Capsules pack",
    dosage: "250mg",
    description: "Penicillin antibiotic that fights bacteria in the body, used for infections.",
    savings_percentage: 73.21,
  },
  {
    id: "m7",
    brand_name: "Zoloft",
    generic_name: "Sertraline",
    brand_price: 65.00,
    generic_price: 15.00,
    brand_mrp_inr: 185.00,
    govt_jan_aushadhi_mrp_inr: 34.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "50mg",
    description: "Selective serotonin reuptake inhibitor (SSRI) antidepressant.",
    savings_percentage: 76.92,
  },
  {
    id: "m8",
    brand_name: "Plavix",
    generic_name: "Clopidogrel",
    brand_price: 95.00,
    generic_price: 18.00,
    brand_mrp_inr: 250.00,
    govt_jan_aushadhi_mrp_inr: 38.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "75mg",
    description: "Platelet inhibitor used to prevent blood clots in people with cardiovascular disease.",
    savings_percentage: 81.05,
  },
  {
    id: "m9",
    brand_name: "Singulair",
    generic_name: "Montelukast",
    brand_price: 58.00,
    generic_price: 12.50,
    brand_mrp_inr: 160.00,
    govt_jan_aushadhi_mrp_inr: 32.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "10mg",
    description: "Leukotriene receptor antagonist used for chronic asthma and seasonal allergies.",
    savings_percentage: 78.45,
  },
  {
    id: "m10",
    brand_name: "Nexium",
    generic_name: "Esomeprazole",
    brand_price: 78.00,
    generic_price: 14.00,
    brand_mrp_inr: 175.00,
    govt_jan_aushadhi_mrp_inr: 36.00,
    unit_pack_size: "per 10 Tablets pack",
    dosage: "20mg",
    description: "Proton pump inhibitor (PPI) that decreases the amount of acid produced in the stomach.",
    savings_percentage: 82.05,
  }
];

// Dynamically enhance MOCK_MEDICINES with Jan Aushadhi PMBJP schema mapping
MOCK_MEDICINES.forEach((med) => {
  med.chemical_salt = med.generic_name;
  med.govt_brand_name = med.generic_name + " PMBJP";
});

class MockQueryBuilder<T> {
  private data: T[];

  constructor(data: T[]) {
    this.data = data;
  }

  select(fields: string = "*") {
    return this;
  }

  eq(column: string, value: any) {
    this.data = this.data.filter((item: any) => {
      const val = item[column];
      if (typeof val === "string" && typeof value === "string") {
        return val.trim().toLowerCase() === value.trim().toLowerCase();
      }
      return val === value;
    });
    return this;
  }

  ilike(column: string, pattern: string) {
    // Converts "%advil%" -> "advil"
    const cleanedPattern = pattern.replace(/%/g, "").trim().toLowerCase();
    this.data = this.data.filter((item: any) => {
      const val = item[column];
      if (typeof val === "string") {
        return val.toLowerCase().includes(cleanedPattern);
      }
      return false;
    });
    return this;
  }

  async then(onfulfilled?: (value: { data: T[] | null; error: any }) => any) {
    const result = { data: this.data, error: null };
    if (onfulfilled) {
      return onfulfilled(result);
    }
    return result;
  }
}

class MockSupabaseClient {
  from(table: string) {
    if (table === "medicines") {
      return new MockQueryBuilder<Medicine>([...MOCK_MEDICINES]);
    }
    return new MockQueryBuilder<any>([]);
  }
}

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured =
  supabaseUrl &&
  supabaseUrl !== "YOUR_SUPABASE_URL" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as any);

export const USING_MOCK_DATA = !isSupabaseConfigured;
